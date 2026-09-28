// Site-wide behavior: attribution capture, event tracking, scroll reveal.

type DL = Record<string, unknown>;
export const track = (event: string, data: DL = {}) => {
  const w = window as unknown as { dataLayer?: DL[] };
  w.dataLayer = w.dataLayer || [];
  w.dataLayer.push({ event, ...data });
};

// ---- Attribution: first-touch + last-touch UTMs, click IDs, landing page, referrer ----
const ATTR_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "gclid", "gbraid", "wbraid", "fbclid", "msclkid"];
const store = {
  get(k: string) { try { return JSON.parse(localStorage.getItem(k) || "null"); } catch { return null; } },
  set(k: string, v: unknown) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
};

(() => {
  const params = new URLSearchParams(location.search);
  const found: Record<string, string> = {};
  ATTR_KEYS.forEach((k) => { const v = params.get(k); if (v) found[k] = v.slice(0, 200); });
  const external = document.referrer && !document.referrer.startsWith(location.origin);
  if (Object.keys(found).length || external || !store.get("coe-first-touch")) {
    const touch = { ...found, landing_page: location.pathname, referrer: external ? document.referrer : "", ts: new Date().toISOString() };
    if (!store.get("coe-first-touch")) store.set("coe-first-touch", touch);
    if (Object.keys(found).length || external) store.set("coe-last-touch", touch);
  }
})();

export const getAttribution = () => ({
  first: store.get("coe-first-touch") || {},
  last: store.get("coe-last-touch") || store.get("coe-first-touch") || {},
});

// ---- Click tracking via data-track ----
document.addEventListener("click", (e) => {
  const el = (e.target as HTMLElement).closest<HTMLElement>("[data-track]");
  if (!el) return;
  track(el.dataset.track!, { link_url: (el as HTMLAnchorElement).href || "", page: location.pathname });
});

// ---- Page-type views ----
const view = document.body.dataset.view;
if (view) track(view, { page: location.pathname });

// ---- FAQ opens ----
document.querySelectorAll<HTMLDetailsElement>("details[data-faq]").forEach((d) =>
  d.addEventListener("toggle", () => { if (d.open) track("open_faq", { faq_id: d.dataset.faq }); }),
);

// ---- Scroll reveal ----
document.documentElement.classList.add("js");
const reveal = document.querySelectorAll<HTMLElement>("[data-reveal]");
if ("IntersectionObserver" in window && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const io = new IntersectionObserver(
    (entries) => entries.forEach((en) => {
      if (en.isIntersecting) { en.target.classList.add("is-visible"); io.unobserve(en.target); }
    }),
    { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
  );
  reveal.forEach((el) => io.observe(el));
} else {
  reveal.forEach((el) => el.classList.add("is-visible"));
}
