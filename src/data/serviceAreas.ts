/**
 * Only add a city once the business can quote, permit, and support work there.
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
    slug: "bakersfield",
    city: "Bakersfield",
    region: "CA",
    status: "published",
    intro: [
      "Bakersfield is home base for Charge On Electric. We help homeowners across the city get ready for EV charging, evaluate whether their electrical panel can handle new demand, and take care of the everyday electrical work that keeps a property running.",
      "Hot Central Valley summers put real load on residential electrical systems, and many homes are now adding EV chargers, larger HVAC equipment, and workshop circuits on top of that. That's why we start every project by looking at the whole system, not just the new piece of equipment.",
    ],
    coverageNote:
      "We serve residential and commercial properties within Bakersfield. If you're just outside the city, send us your address. We'll confirm whether your property is in our current service area before scheduling anything.",
    services: ["ev-charger-installation", "electrical-panel-upgrades", "commercial-ev-charging", "electrical-services"],
  },
];

export const publishedAreas = serviceAreas.filter((a) => a.status === "published");
