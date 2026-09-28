import { createClient } from "@supabase/supabase-js";
import {
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  SUPABASE_UPLOAD_BUCKET,
  RESEND_API_KEY,
  RESEND_FROM_EMAIL,
  LEAD_NOTIFICATION_EMAIL,
} from "astro:env/server";
import { business } from "../config/business";
import { type LeadInput, SERVICE_LABELS, FORM_LABELS, escapeHtml } from "./leads";

export type LeadMeta = {
  score: number;
  inServiceArea: boolean;
  device: string;
  userAgent: string;
  ip: string;
  attribution: { first?: Record<string, string>; last?: Record<string, string> };
  receivedAt: string;
};

export type SavedLead = { id: string; stored: "supabase" | "local" | "log"; attachments: string[] };

const supabase =
  SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY
    ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } })
    : null;

// ---------- Persistence ----------
export async function saveLead(d: LeadInput, files: File[], meta: LeadMeta): Promise<SavedLead> {
  if (supabase) return saveToSupabase(d, files, meta);
  return saveFallback(d, files, meta);
}

async function saveToSupabase(d: LeadInput, files: File[], meta: LeadMeta): Promise<SavedLead> {
  const sb = supabase!;
  const last = meta.attribution.last || {};

  const { data: contact, error: cErr } = await sb
    .from("contacts")
    .insert({
      first_name: d.first_name,
      last_name: d.last_name,
      email: d.email,
      phone_e164: d.phone,
      preferred_contact_method: d.preferred_contact,
      sms_consent: d.consent_sms === "yes",
      email_consent: true,
    })
    .select("id")
    .single();
  if (cErr) throw new Error(`contacts insert: ${cErr.message}`);

  const { data: property, error: pErr } = await sb
    .from("properties")
    .insert({ contact_id: contact.id, address_line_1: d.address, property_type: d.property_type ?? null })
    .select("id")
    .single();
  if (pErr) throw new Error(`properties insert: ${pErr.message}`);

  const { data: lead, error: lErr } = await sb
    .from("leads")
    .insert({
      contact_id: contact.id,
      property_id: property.id,
      service_type: d.service_type,
      lead_type: d.form_type,
      priority_score: meta.score,
      project_summary: d.project_summary ?? null,
      timeline: d.timeline,
      source: last.utm_source ?? null,
      medium: last.utm_medium ?? null,
      campaign: last.utm_campaign ?? null,
      term: last.utm_term ?? null,
      content: last.utm_content ?? null,
      landing_page: last.landing_page ?? d.page_url ?? null,
      referrer: last.referrer ?? null,
      gclid: last.gclid ?? null,
      gbraid: last.gbraid ?? null,
      wbraid: last.wbraid ?? null,
      fbclid: last.fbclid ?? null,
      msclkid: last.msclkid ?? null,
      device_type: meta.device,
      consent_version: d.consent_version,
      event_id: d.event_id ?? null,
      in_service_area: meta.inServiceArea,
      next_followup_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
    })
    .select("id")
    .single();
  if (lErr) throw new Error(`leads insert: ${lErr.message}`);

  const { error: iErr } = await sb.from("lead_intake_details").insert({
    lead_id: lead.id,
    ev_owned: d.ev_owned ? d.ev_owned === "yes" : null,
    vehicle_make_model: d.vehicle ?? null,
    charger_location: d.charger_location ?? null,
    panel_size_text: d.panel_size ?? null,
    commercial_property_type: d.form_type === "commercial" ? d.property_type ?? null : null,
    projected_charger_count: d.charger_count ?? null,
    existing_service_known: d.existing_service_known ?? null,
    raw_form_data: { ...d, attribution: meta.attribution, page_url: d.page_url },
  });
  if (iErr) console.error("[lead] intake details insert failed", iErr.message);

  const attachments: string[] = [];
  for (const file of files) {
    const safeName = file.name.replace(/[^\w.\-]+/g, "_").slice(-80);
    const path = `${lead.id}/${Date.now()}-${safeName}`;
    const { error: upErr } = await sb.storage
      .from(SUPABASE_UPLOAD_BUCKET)
      .upload(path, file, { contentType: file.type || "application/octet-stream", upsert: false });
    if (upErr) { console.error("[lead] upload failed", upErr.message); continue; }
    attachments.push(path);
    await sb.from("lead_attachments").insert({
      lead_id: lead.id,
      storage_path: path,
      file_name: file.name,
      mime_type: file.type,
      file_size_bytes: file.size,
      attachment_type: "customer_upload",
    });
  }

  return { id: lead.id, stored: "supabase", attachments };
}

/** No database configured: keep the lead in dev (.data/leads) and always log it. */
async function saveFallback(d: LeadInput, files: File[], meta: LeadMeta): Promise<SavedLead> {
  const id = crypto.randomUUID();
  const record = { id, ...d, meta, files: files.map((f) => ({ name: f.name, type: f.type, size: f.size })) };
  console.warn("[lead] SUPABASE not configured, lead logged only:", JSON.stringify(record));
  if (import.meta.env.DEV) {
    const fs = await import("node:fs/promises");
    const dir = `.data/leads/${id}`;
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(`${dir}/lead.json`, JSON.stringify(record, null, 2));
    for (const f of files) await fs.writeFile(`${dir}/${f.name.replace(/[^\w.\-]+/g, "_")}`, Buffer.from(await f.arrayBuffer()));
    return { id, stored: "local", attachments: files.map((f) => f.name) };
  }
  return { id, stored: "log", attachments: [] };
}

// ---------- Notifications ----------
async function sendEmail(payload: Record<string, unknown>) {
  if (!RESEND_API_KEY || !RESEND_FROM_EMAIL) return false;
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: RESEND_FROM_EMAIL, ...payload }),
  });
  if (!res.ok) console.error("[lead] resend error", res.status, await res.text());
  return res.ok;
}

export async function notifyLead(d: LeadInput, saved: SavedLead, meta: LeadMeta) {
  const rows: [string, string | number | undefined][] = [
    ["Form", FORM_LABELS[d.form_type]],
    ["Priority score", `${meta.score}/100`],
    ["Name", `${d.first_name} ${d.last_name}`],
    ["Phone", d.phone],
    ["Email", d.email],
    ["Prefers", d.preferred_contact],
    ["Address", d.address],
    ["In listed service area", meta.inServiceArea ? "Yes" : "Check address"],
    ["Service", SERVICE_LABELS[d.service_type]],
    ["Timeline", d.timeline],
    ["Business", d.business_name],
    ["Job title", d.job_title],
    ["Property type", d.property_type],
    ["Charging spaces", d.charger_count],
    ["Capacity known", d.existing_service_known],
    ["Owns EV", d.ev_owned],
    ["Vehicle", d.vehicle],
    ["Charging location", d.charger_location],
    ["Panel size", d.panel_size],
    ["Summary", d.project_summary],
    ["SMS consent", d.consent_sms === "yes" ? "Yes" : "No"],
    ["Attachments", saved.attachments.length ? saved.attachments.join(", ") : "None"],
    ["Source", [meta.attribution.last?.utm_source, meta.attribution.last?.utm_medium, meta.attribution.last?.utm_campaign].filter(Boolean).join(" / ") || meta.attribution.last?.referrer || "direct"],
    ["Landing page", meta.attribution.last?.landing_page],
    ["Submitted from", d.page_url],
    ["Device", meta.device],
    ["Lead ID", saved.id],
  ];
  const html = `<h2 style="font-family:sans-serif">New ${escapeHtml(FORM_LABELS[d.form_type])} lead</h2>
<p style="font-family:sans-serif">Call within 5 minutes during business hours.</p>
<table cellpadding="6" style="font-family:sans-serif;font-size:14px;border-collapse:collapse">${rows
    .filter(([, v]) => v !== undefined && v !== "")
    .map(([k, v]) => `<tr><td style="color:#555;border-bottom:1px solid #eee"><b>${escapeHtml(k)}</b></td><td style="border-bottom:1px solid #eee">${escapeHtml(String(v))}</td></tr>`)
    .join("")}</table>`;

  const tasks: Promise<unknown>[] = [];
  if (LEAD_NOTIFICATION_EMAIL) {
    tasks.push(
      sendEmail({
        to: LEAD_NOTIFICATION_EMAIL.split(",").map((s) => s.trim()),
        reply_to: d.email,
        subject: `New lead (${meta.score}): ${SERVICE_LABELS[d.service_type]}, ${d.first_name} ${d.last_name}`,
        html,
      }),
    );
  }
  // Customer confirmation. No response-time promise unless configured.
  tasks.push(
    sendEmail({
      to: d.email,
      subject: `We received your request - ${business.name}`,
      html: `<div style="font-family:sans-serif;font-size:15px;line-height:1.6;color:#1b2533">
<p>Hi ${escapeHtml(d.first_name)},</p>
<p>Thanks for contacting ${escapeHtml(business.name)}. We received your request and will review your project details shortly.${business.responsePromise ? ` ${escapeHtml(business.responsePromise)}` : ""}</p>
<p>If you have photos of your electrical panel or installation area, replying to this email with them can help us prepare for the next step.</p>
<p>${escapeHtml(business.legalName)}${business.phone ? `<br>${escapeHtml(business.phone.display)}` : ""}</p></div>`,
    }),
  );
  const results = await Promise.allSettled(tasks);
  results.forEach((r) => r.status === "rejected" && console.error("[lead] notify failed", r.reason));
}
