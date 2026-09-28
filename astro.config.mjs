// @ts-check
import { defineConfig, envField } from "astro/config";
import vercel from "@astrojs/vercel";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

// Set PUBLIC_SITE_URL in Vercel once a custom domain is connected.
const site = process.env.PUBLIC_SITE_URL || "https://charge-on-electric.vercel.app";

// Routes that must never appear in the sitemap (noindex pages).
const EXCLUDE_FROM_SITEMAP = ["/thank-you"];

export default defineConfig({
  site,
  output: "static",
  adapter: vercel({
    webAnalytics: {
      enabled: true,
    },
  }),
  trailingSlash: "never",
  redirects: {
    // Site briefly launched with the wrong home city.
    "/service-areas/bakersfield": "/service-areas/los-angeles",
  },
  integrations: [
    sitemap({
      filter: (page) => !EXCLUDE_FROM_SITEMAP.some((p) => new URL(page).pathname.startsWith(p)),
    }),
  ],
  env: {
    schema: {
      // Public, safe for the browser
      PUBLIC_GTM_ID: envField.string({ context: "client", access: "public", optional: true }),
      PUBLIC_CLARITY_PROJECT_ID: envField.string({ context: "client", access: "public", optional: true }),
      PUBLIC_TURNSTILE_SITE_KEY: envField.string({ context: "client", access: "public", optional: true }),

      // Server-only secrets (never shipped to the browser)
      SUPABASE_URL: envField.string({ context: "server", access: "secret", optional: true }),
      SUPABASE_SERVICE_ROLE_KEY: envField.string({ context: "server", access: "secret", optional: true }),
      SUPABASE_UPLOAD_BUCKET: envField.string({ context: "server", access: "secret", default: "lead-uploads" }),
      RESEND_API_KEY: envField.string({ context: "server", access: "secret", optional: true }),
      RESEND_FROM_EMAIL: envField.string({ context: "server", access: "secret", optional: true }),
      LEAD_NOTIFICATION_EMAIL: envField.string({ context: "server", access: "secret", optional: true }),
      TURNSTILE_SECRET_KEY: envField.string({ context: "server", access: "secret", optional: true }),
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
