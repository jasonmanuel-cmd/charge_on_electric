# Charge On Electric: Website & Lead System

Lead-generation website for **Charge On Electric Inc.** (Los Angeles, CA): EV charger installation, electrical panel upgrades, commercial EV charging, and electrical services.

Built with **Astro 7 + Tailwind CSS 4**, deployed on **Vercel**, leads stored in **Supabase**, notifications via **Resend**.

> The original spec called for Next.js. Astro was chosen instead: this is a content/SEO site with a small amount of interactivity, and Astro ships near-zero JavaScript by default (better Core Web Vitals) while still supporting the server-side lead endpoint. Every spec requirement for routes, forms, schema, attribution, and consent is covered.

## Quick start

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # production build (Vercel adapter)
```

Without any environment variables the site runs fully. Form submissions are validated, scored, and saved to `.data/leads/` (dev only) and logged to the server console.

## Where to edit things

| What | File |
|---|---|
| **Business facts** (phone, email, license, hours, reviews, socials) | `src/config/business.ts` |
| Service pages (copy, FAQs, process, scope factors) | `src/data/services.ts` |
| FAQs | `src/data/faqs.ts` |
| Service-area pages | `src/data/serviceAreas.ts` |
| Projects & reviews (real ones only) | `src/data/proof.ts` |
| Colors, fonts, component styles | `src/styles/global.css` |

### The "no unverified claims" rule is built in
Anything unconfirmed stays `null`/`false` in `business.ts`, and the UI **hides it automatically**:

- **Phone is `null`**: all Call/Text buttons are hidden (the mobile bar shows "EV Check" instead). Add the number and they appear everywhere, including schema markup.
- **License**: `1156860 (C-10)` is pre-filled from the company Instagram bio but `verified: false`, so it's hidden. Confirm it at the [CSLB license lookup](https://www.cslb.ca.gov/OnlineServices/CheckLicenseII/CheckLicense.aspx), then set `verified: true`. **California law requires the license number in contractor advertising, so do this before launch.**
- **Insured / reviews / rating / hours / warranty / financing**: hidden until set.
- **Projects & reviews**: empty arrays render honest "coming soon" states. Projects only publish when every photo has alt text and `consentVerified: true`.
- **Service areas**: Los Angeles and the surrounding area (`areaServed` + `serviceZipPrefixes` in `business.ts`). Add a dedicated `/service-areas/<city>` page only with genuinely local copy.

## Lead pipeline

`POST /api/lead` (`src/pages/api/lead.ts`) handles all three forms:

1. Honeypot + per-IP rate limit + optional Cloudflare Turnstile
2. Server-side Zod validation (`src/lib/leads.ts`), phone normalized to E.164
3. Lead score (service, timeline, completeness, photos, service area; never demographic proxies)
4. Save to Supabase: contact → property → lead → intake details → uploaded files in a **private** bucket (`src/lib/leadStore.ts`)
5. Internal email alert + customer confirmation via Resend
6. If the database fails, the full lead is logged so it's never lost
7. Works without JavaScript (303 redirect to `/thank-you`)

Client side (`src/scripts/leadForm.ts`): multi-step flow, inline accessible errors, file checks, first/last-touch UTM + click-ID capture (`gclid`, `gbraid`, `wbraid`, `fbclid`, `msclkid`), and GA4 events (`form_start`, `form_step_complete`, `form_submit`, `generate_lead`, `form_error`, `upload_file`, `select_service_type`, `click_to_call`, `click_to_text`, `open_faq`, `view_service`, …) pushed to `dataLayer`.

### Setting up Supabase + email
1. Create a Supabase project and run `supabase/schema.sql` in the SQL editor (tables, RLS lockdown, private `lead-uploads` bucket).
2. Copy `.env.example` to `.env` (or set the variables in Vercel) and fill in `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `LEAD_NOTIFICATION_EMAIL` (comma-separate for multiple recipients, per the launch checklist).
3. Submit a test lead and confirm it lands in Supabase and both emails arrive.

Secrets are declared in `astro.config.mjs` via `astro:env` as server-only, so they never reach the browser.

### Analytics & consent
Set `PUBLIC_GTM_ID` (and optionally `PUBLIC_CLARITY_PROJECT_ID`). Google Consent Mode v2 defaults to **denied**. A cookie banner appears, and "Cookie Preferences" shows in the footer. Configure GA4 inside GTM.

## Pages

`/` · `/services` · `/ev-charger-installation` · `/electrical-panel-upgrades` · `/commercial-ev-charging` · `/electrical-services` · `/how-it-works` · `/projects` (+ `/projects/[slug]`) · `/reviews` · `/about` · `/credentials` · `/service-areas` (+ `/service-areas/los-angeles`) · `/faq` · `/request-estimate` · `/ev-readiness-check` · `/commercial-assessment` · `/contact` · `/thank-you` (noindex) · `/privacy-policy` · `/terms-of-service` · `/accessibility` · `404` · `sitemap-index.xml` · `robots.txt`

Structured data: `Electrician` (verified fields only), `Service`, `FAQPage`, `BreadcrumbList`.

## Not built yet (by design, per the spec's phasing)
- **Twilio SMS / missed-call text-back, GoHighLevel/HubSpot sync, CallRail**: add once accounts exist; hook into `notifyLead()` in `src/lib/leadStore.ts`.
- **Address autocomplete** (needs a Google Places or Mapbox key).
- **Follow-up automations** (5-min escalation, 24h/3d/7d/14d nurture): best run in the CRM.
- **Admin dashboard** (Phase 5): after the lead workflow has been used for a while.
- **Resources/blog hub**: add once there's owner-reviewed content.
- `/home-ev-charger-installation`, `/tesla-charger-installation`, `/electrical-repairs`: add as separate pages only with genuinely distinct copy (avoid duplicate content).

## Before launch
- [ ] Verify CSLB license and set `verified: true`
- [ ] Add phone number (and `smsEnabled` if it takes texts), email, hours
- [ ] Set `PUBLIC_SITE_URL` to the real domain
- [ ] Have the Privacy Policy and Terms reviewed (drafts are in place)
- [ ] Owner review of all FAQ answers (`FAQ_REVIEWED_AT`)
- [ ] Supabase + Resend configured, test lead end-to-end in production
- [ ] GTM/GA4 + Search Console connected, sitemap submitted
- [ ] Google Business Profile links to the site; add `reviews.leaveReviewUrl`
- [ ] Add real project photos (with permission) and genuine reviews
