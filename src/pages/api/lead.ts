import type { APIRoute } from "astro";
import { TURNSTILE_SECRET_KEY } from "astro:env/server";
import { leadSchema, calculateLeadScore, parseAttribution, rateLimited, deviceType, inServiceArea } from "../../lib/leads";
import { saveLead, notifyLead } from "../../lib/leadStore";

export const prerender = false;

const MAX_FILES = 5;
const MAX_FILE_BYTES = 10 * 1024 * 1024;
const ALLOWED_TYPES = /^(image\/|application\/pdf$)/;

export const POST: APIRoute = async ({ request, clientAddress }) => {
  const wantsJson = (request.headers.get("accept") || "").includes("application/json");
  const reply = (status: number, body: Record<string, unknown>) => {
    if (!wantsJson) {
      // No-JS fallback: redirect to thank-you on success, back to the form on error.
      const target = body.ok ? (body.redirect as string) : `${new URL(request.headers.get("referer") || "/request-estimate").pathname}?error=1`;
      return new Response(null, { status: 303, headers: { Location: target } });
    }
    return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
  };

  let ip = "unknown";
  try { ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() || clientAddress || "unknown"; } catch {}

  if (rateLimited(ip)) return reply(429, { ok: false, error: "Too many submissions. Please wait a few minutes or contact us directly." });

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return reply(400, { ok: false, error: "We couldn't read your submission. Please try again." });
  }

  // Honeypot: pretend success so bots learn nothing.
  if (String(form.get("company_website") || "").trim()) {
    return reply(200, { ok: true, redirect: "/thank-you" });
  }

  // Cloudflare Turnstile (only when configured)
  if (TURNSTILE_SECRET_KEY) {
    const token = String(form.get("cf-turnstile-response") || "");
    const verify = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: new URLSearchParams({ secret: TURNSTILE_SECRET_KEY, response: token, remoteip: ip }),
    }).then((r) => r.json()).catch(() => ({ success: false }));
    if (!verify.success) return reply(400, { ok: false, error: "Spam check failed. Please refresh the page and try again." });
  }

  const fields: Record<string, string> = {};
  for (const [k, v] of form.entries()) if (typeof v === "string" && v !== "") fields[k] = v;

  const parsed = leadSchema.safeParse(fields);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return reply(422, { ok: false, error: first?.message || "Please check the form and try again.", field: first?.path?.[0] });
  }
  const d = parsed.data;

  const files = form
    .getAll("photos")
    .filter((f): f is File => typeof f !== "string" && f.size > 0)
    .slice(0, MAX_FILES);
  for (const f of files) {
    if (f.size > MAX_FILE_BYTES) return reply(413, { ok: false, error: `"${f.name}" is larger than 10 MB.` });
    if (f.type && !ALLOWED_TYPES.test(f.type)) return reply(415, { ok: false, error: `"${f.name}" isn't a supported file type.` });
  }

  const ua = request.headers.get("user-agent") || "";
  const meta = {
    score: calculateLeadScore(d, files.length > 0),
    inServiceArea: inServiceArea(d.address),
    device: deviceType(ua),
    userAgent: ua.slice(0, 300),
    ip,
    attribution: parseAttribution(d.attribution),
    receivedAt: new Date().toISOString(),
  };

  let saved;
  try {
    saved = await saveLead(d, files, meta);
  } catch (err) {
    // Fallback persistence: never lose a lead because a downstream service failed.
    console.error("[lead] primary save failed, logging lead:", (err as Error).message, JSON.stringify({ ...d, meta }));
    saved = { id: `unsaved-${Date.now()}`, stored: "log" as const, attachments: [] };
  }

  try {
    await notifyLead(d, saved, meta);
  } catch (err) {
    console.error("[lead] notification error", err);
  }

  return reply(200, { ok: true, id: saved.id, redirect: `/thank-you?type=${d.form_type}` });
};

export const ALL: APIRoute = () => new Response("Method Not Allowed", { status: 405, headers: { Allow: "POST" } });
