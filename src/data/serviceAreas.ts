/**
 * Only add an area once the business can quote, permit, and support work there.
 * Each page needs genuinely local, non-duplicated copy. Never swap city names in a template.
 */
export type ServiceArea = {
  slug: string;
  city: string;
  region: string;
  status: "draft" | "published";
  intro: string[];
  coverageNote: string;
  services: string[]; // service slugs actually offered there
};

export const serviceAreas: ServiceArea[] = [
  {
    slug: "los-angeles",
    city: "Los Angeles",
    region: "CA",
    status: "published",
    intro: [
      "Los Angeles is home base for Charge On Electric. We work across the city and the surrounding area, helping homeowners get ready for EV charging, checking whether an electrical panel can handle new demand, and handling the everyday electrical work that keeps a property running.",
      "Much of LA's housing was built decades before EVs, heat pumps, and home offices. Original panels, limited breaker space, and long runs from the panel to a detached garage or carport are common, so we look at the whole system before recommending anything, not just the new piece of equipment.",
      "Permitting in the area isn't one-size-fits-all. Work in the City of Los Angeles goes through LADBS, while many neighboring cities run their own building departments. We confirm which one applies to your address as part of the estimate.",
    ],
    coverageNote:
      "We serve residential and commercial properties in Los Angeles and the surrounding area. Send us your address with your request and we'll confirm coverage before scheduling anything.",
    services: ["ev-charger-installation", "electrical-panel-upgrades", "commercial-ev-charging", "electrical-services"],
  },
];

export const publishedAreas = serviceAreas.filter((a) => a.status === "published");
