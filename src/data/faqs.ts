export type FAQ = { id: string; question: string; answer: string; tags: string[] };

/**
 * Owner-reviewed answers only. Answers intentionally avoid code requirements,
 * guarantees, and universal claims. Update `FAQ_REVIEWED_AT` whenever reviewed.
 */
export const FAQ_REVIEWED_AT = "2026-09-28";

export const faqs: FAQ[] = [
  {
    id: "level-2",
    question: "Do I need a Level 2 charger at home?",
    answer:
      "A Level 2 charger can offer faster charging than a standard household outlet, but the right setup depends on your vehicle, driving habits, electrical system, and charging location. We can help assess the installation path that makes sense for your property.",
    tags: ["ev", "home"],
  },
  {
    id: "panel-support",
    question: "Can my current electrical panel support an EV charger?",
    answer:
      "Some homes can support EV charging with the existing panel, while others may need additional evaluation or electrical upgrades. Available capacity, breaker space, current household loads, charger size, wiring route, and local requirements can all affect the answer.",
    tags: ["ev", "panel", "home"],
  },
  {
    id: "which-charger",
    question: "Do I need to know what charger to buy before requesting an estimate?",
    answer:
      "No. If you already have a charger or a vehicle in mind, share those details with us. If not, we can begin by reviewing your property and charging goals so you have a clearer idea of what to consider.",
    tags: ["ev", "home"],
  },
  {
    id: "how-long",
    question: "How long does EV charger installation take?",
    answer:
      "The timeline depends on the property, electrical setup, permit requirements, wiring distance, equipment, and whether upgrades are needed. A simple installation can be very different from a project involving panel work, trenching, or commercial infrastructure.",
    tags: ["ev", "home", "commercial"],
  },
  {
    id: "outdoor",
    question: "Can you install charging equipment outdoors?",
    answer:
      "In many cases, outdoor charging solutions are possible, but the installation needs to account for equipment ratings, weather exposure, wiring protection, location, access, and the requirements that apply to the project.",
    tags: ["ev", "home"],
  },
  {
    id: "permit",
    question: "Do I need a permit?",
    answer:
      "Many electrical projects, including EV charger circuits and panel work, involve permits and inspections. Requirements depend on the jurisdiction and the scope of work, so we review what applies to your specific project as part of the estimate.",
    tags: ["ev", "panel", "commercial", "general"],
  },
  {
    id: "cost",
    question: "What does an EV charger installation cost?",
    answer:
      "Cost depends on the distance from your panel to the charger location, available electrical capacity, whether a panel upgrade is needed, the charger itself, mounting and wiring conditions, and permit fees. Sending photos of your panel and planned charging spot is the fastest way to get a realistic estimate.",
    tags: ["ev", "home"],
  },
  {
    id: "rebates",
    question: "Are there rebates for home EV chargers in Los Angeles?",
    answer:
      "Utilities serving the Los Angeles area, including LADWP and Southern California Edison, have offered rebates for home EV chargers and related electrical work. Programs, amounts, and eligibility change often and depend on which utility serves your address, so we'll help you check what currently applies before you buy equipment.",
    tags: ["ev", "home"],
  },
  {
    id: "business",
    question: "Do you work with businesses and property managers?",
    answer:
      "Yes. Charge On Electric can discuss commercial and property-based charging projects, including initial site evaluation, electrical considerations, and practical next steps for the property.",
    tags: ["commercial"],
  },
  {
    id: "panel-upgrade-needed",
    question: "Does every EV charger installation require a panel upgrade?",
    answer:
      "No. A panel upgrade is not automatically required. The right answer depends on the existing equipment, available capacity, the condition of the system, and the electrical demands of the property. We evaluate those details before recommending one.",
    tags: ["panel", "ev"],
  },
  {
    id: "what-to-send",
    question: "What should I send for a faster estimate?",
    answer:
      "If available, send your property address, the type of service you need, your preferred installation location, photos of the electrical panel, photos of the charging area, your timeline, and the vehicle or charging equipment involved.",
    tags: ["ev", "panel", "commercial", "general", "home"],
  },
];

export const faqsByTag = (tag: string, limit = 6) => faqs.filter((f) => f.tags.includes(tag)).slice(0, limit);
