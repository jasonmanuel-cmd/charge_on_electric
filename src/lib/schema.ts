import { business, licenseVisible } from "../config/business";
import type { FAQ } from "../data/faqs";

/** Structured data built strictly from verified, visible business facts. */
export function electricianSchema(site: URL) {
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Electrician",
    "@id": new URL("/#business", site).href,
    name: business.legalName,
    alternateName: business.name,
    url: site.href,
    image: new URL("/media/og-image.jpg", site).href,
    logo: new URL("/media/logo.webp", site).href,
    areaServed: business.areaServed.map(({ name, type }) => ({ "@type": type, name })),
    sameAs: Object.values(business.social).filter(Boolean),
  };
  if (business.phone) data.telephone = business.phone.e164;
  if (business.email) data.email = business.email;
  if (business.address.street && business.address.postalCode) {
    data.address = {
      "@type": "PostalAddress",
      streetAddress: business.address.street,
      addressLocality: business.address.city,
      addressRegion: business.address.region,
      postalCode: business.address.postalCode,
      addressCountry: "US",
    };
  }
  if (licenseVisible()) {
    data.hasCredential = {
      "@type": "EducationalOccupationalCredential",
      credentialCategory: "license",
      name: `California CSLB ${business.license.classification} License #${business.license.number}`,
      recognizedBy: { "@type": "GovernmentOrganization", name: "Contractors State License Board" },
    };
  }
  if (business.reviews.rating && business.reviews.count) {
    data.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: business.reviews.rating,
      reviewCount: business.reviews.count,
    };
  }
  return data;
}

export function faqSchema(items: FAQ[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
}

export function breadcrumbSchema(site: URL, crumbs: { name: string; href: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: new URL(c.href, site).href,
    })),
  };
}

export function serviceSchema(site: URL, s: { name: string; description: string; slug: string; serviceType: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: s.name,
    description: s.description,
    serviceType: s.serviceType,
    url: new URL(`/${s.slug}`, site).href,
    provider: { "@id": new URL("/#business", site).href },
    areaServed: business.areaServed.map(({ name, type }) => ({ "@type": type, name })),
  };
}
