import { z } from "astro/zod";
import { business } from "../config/business";

// ---------- Validation ----------
const str = (max: number) => z.string().trim().max(max);
const optStr = (max: number) => z.string().trim().max(max).optional().transform((v) => (v ? v : undefined));

const phoneSchema = z
  .string()
  .trim()
  .transform((v, ctx) => {
    const e164 = toE164(v);
    if (!e164) { ctx.addIssue({ code: "custom", message: "Please enter a valid US phone number." }); return z.NEVER; }
    return e164;
  });

const base = z.object({
  form_type: z.enum(["estimate", "ev_readiness", "commercial"]),
  form_id: str(60),
  first_name: str(80).min(1, "First name is required."),
  last_name: str(80).min(1, "Last name is required."),
  phone: phoneSchema,
  email: z.string().trim().toLowerCase().email("Please enter a valid email address.").max(160),
  address: str(200).min(5, "Please enter the property address."),
  preferred_contact: z.enum(["phone", "text", "email"]),
  service_type: z.enum(["ev_charger_installation", "electrical_panel_upgrade", "commercial_ev_charging", "electrical_repair", "other"]),
  timeline: z.enum(["asap", "within_1_2_weeks", "this_month", "planning"]),
  project_summary: optStr(3000),
  consent_contact: z.literal("yes", { message: "Please agree to be contacted about your request." }),
  consent_sms: z.literal("yes").optional(),
  consent_version: str(20),
  event_id: optStr(80),
  page_url: optStr(500),
  attribution: optStr(4000),
  // ev readiness
  property_type: optStr(80),
  ev_owned: z.enum(["yes", "planning", "not_sure"]).optional(),
  vehicle: optStr(120),
  charger_location: optStr(40),
  panel_size: optStr(60),
  // commercial
  business_name: optStr(160),
  job_title: optStr(120),
  charger_count: z.coerce.number().int().min(1).max(500).optional(),
  existing_service_known: z.enum(["yes", "partially", "no"]).optional(),
});

export const leadSchema = base.superRefine((d, ctx) => {
  if (d.form_type === "estimate" && !d.project_summary)
    ctx.addIssue({ code: "custom", path: ["project_summary"], message: "Please tell us briefly about the project." });
  if (d.form_type === "ev_readiness") {
    if (!d.property_type) ctx.addIssue({ code: "custom", path: ["property_type"], message: "Please select your home type." });
    if (!d.charger_location) ctx.addIssue({ code: "custom", path: ["charger_location"], message: "Please select a charging location." });
  }
  if (d.form_type === "commercial") {
    if (!d.business_name) ctx.addIssue({ code: "custom", path: ["business_name"], message: "Business or property name is required." });
    if (!d.job_title) ctx.addIssue({ code: "custom", path: ["job_title"], message: "Job title is required." });
    if (!d.property_type) ctx.addIssue({ code: "custom", path: ["property_type"], message: "Please select a property type." });
    if (!d.charger_count) ctx.addIssue({ code: "custom", path: ["charger_count"], message: "Please enter the number of charging spaces." });
  }
});

export type LeadInput = z.infer<typeof leadSchema>;

// ---------- Helpers ----------
export function toE164(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 10 && /^[2-9]\d{2}[2-9]\d{6}$/.test(digits)) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1") && /^1[2-9]\d{2}[2-9]\d{6}$/.test(digits)) return `+${digits}`;
  return null;
}

type Attribution = { first?: Record<string, string>; last?: Record<string, string> };
export function parseAttribution(raw?: string): Attribution {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    const clean = (o: unknown) =>
      Object.fromEntries(
        Object.entries((o && typeof o === "object" ? o : {}) as Record<string, unknown>)
          .filter(([, v]) => typeof v === "string")
          .map(([k, v]) => [k.slice(0, 40), (v as string).slice(0, 300)]),
      );
    return { first: clean(parsed.first), last: clean(parsed.last) };
  } catch {
    return {};
  }
}

/** Service-area check: a listed area name in the address, or a 5-digit ZIP with a covered prefix. */
export function inServiceArea(address: string) {
  const a = address.toLowerCase();
  if (business.areaServed.some(({ name }) => a.includes(name.toLowerCase()))) return true;
  const zips = address.match(/\b\d{5}\b/g) || [];
  return zips.some((z) => business.serviceZipPrefixes.includes(z.slice(0, 3)));
}

/** Scoring uses only project signals, never demographic or location-stereotype proxies. */
export function calculateLeadScore(d: LeadInput, photoUploaded: boolean): number {
  let score = 0;
  if (d.service_type === "commercial_ev_charging") score += 25;
  if (d.service_type === "ev_charger_installation") score += 20;
  if (d.service_type === "electrical_panel_upgrade") score += 18;
  if (d.timeline === "asap") score += 20;
  if (d.timeline === "within_1_2_weeks") score += 15;
  if (d.timeline === "this_month") score += 10;
  if (d.address.length >= 10) score += 10;
  if (d.phone) score += 10;
  if (d.email) score += 5;
  if (photoUploaded) score += 10;
  if (inServiceArea(d.address)) score += 10;
  return Math.min(score, 100);
}

export const SERVICE_LABELS: Record<string, string> = {
  ev_charger_installation: "EV charger installation",
  electrical_panel_upgrade: "Electrical panel upgrade",
  commercial_ev_charging: "Commercial EV charging",
  electrical_repair: "Electrical repair",
  other: "Other",
};

export const FORM_LABELS: Record<string, string> = {
  estimate: "Quick Estimate",
  ev_readiness: "EV Readiness Check",
  commercial: "Commercial Site Assessment",
};

// ---------- Rate limiting (per instance, best-effort) ----------
const hits = new Map<string, number[]>();
export function rateLimited(key: string, limit = 5, windowMs = 10 * 60 * 1000) {
  const now = Date.now();
  const recent = (hits.get(key) || []).filter((t) => now - t < windowMs);
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > limit;
}

export function deviceType(ua: string) {
  if (/ipad|tablet/i.test(ua)) return "tablet";
  if (/mobi|android|iphone/i.test(ua)) return "mobile";
  return "desktop";
}

export const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
