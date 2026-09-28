import type { FAQ } from "./faqs";
import { faqsByTag } from "./faqs";

type IconName = "plug" | "panel" | "building" | "wrench" | "gauge" | "bolt";

export type ServicePage = {
  slug: string;
  icon: IconName;
  navLabel: string;
  cardTitle: string;
  cardBlurb: string;
  eyebrow: string;
  seoTitle: string;
  metaDescription: string;
  heroHeadline: string;
  heroSubheadline: string;
  primaryCta: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  directAnswer: { heading: string; body: string[] };
  targetAudience: string[];
  includedHeading: string;
  includedItems: string[];
  scopeFactors: string[];
  processSteps: { title: string; description: string }[];
  permitNote: string;
  photoTip?: string;
  faqs: FAQ[];
  relatedServiceSlugs: string[];
  serviceType: string;
  status: "draft" | "published";
};

export const services: ServicePage[] = [
  {
    slug: "ev-charger-installation",
    icon: "plug",
    navLabel: "EV Charger Installation",
    cardTitle: "Home EV Charger Installation",
    cardBlurb: "Level 2 charging planned around your panel, your parking spot, and your routine.",
    eyebrow: "EV Charger Installation",
    seoTitle: "EV Charger Installation in Los Angeles, CA | Charge On Electric",
    metaDescription:
      "Level 2 home EV charger installation in Los Angeles. Panel and capacity assessment, dedicated circuits, and clear estimates from Charge On Electric.",
    heroHeadline: "Bring EV Charging Home.",
    heroSubheadline:
      "Charging at home makes EV ownership simpler. We start with your electrical system, then build the right Level 2 setup for your garage, driveway, or carport.",
    primaryCta: { label: "Get My EV Charger Estimate", href: "/request-estimate?service=ev_charger_installation" },
    secondaryCta: { label: "Check My EV Readiness", href: "/ev-readiness-check" },
    directAnswer: {
      heading: "More than mounting a charger on a wall",
      body: [
        "A proper EV charger installation starts with the electrical system. We assess the panel, available capacity, breaker space, wiring route, charger location, and practical installation requirements before recommending a path.",
        "Whether you already own an electric vehicle or are planning ahead for your next one, Charge On Electric helps you understand your options before any work begins.",
      ],
    },
    targetAudience: [
      "New EV owners who want reliable overnight charging",
      "Drivers planning an EV purchase who want to know if their home is ready",
      "Homeowners with an older panel or limited breaker space",
      "Households adding a second EV",
    ],
    includedHeading: "What we can help with",
    includedItems: [
      "Home EV charger installation",
      "Level 2 charging setup",
      "Dedicated circuits",
      "Electrical panel readiness assessments",
      "Panel upgrades when needed",
      "Garage, driveway, carport, and outdoor charging solutions",
      "Charger selection guidance, brand-neutral",
    ],
    scopeFactors: [
      "Distance and wiring route from the panel to the charger",
      "Available electrical capacity and breaker space",
      "Whether the panel needs an upgrade",
      "Indoor vs. outdoor mounting and weather exposure",
      "Charger model and its electrical requirements",
      "Permit and inspection requirements for your jurisdiction",
    ],
    processSteps: [
      { title: "Share your setup", description: "Tell us about your vehicle, where you park, and send photos of your panel if you can." },
      { title: "Capacity review", description: "We look at panel capacity, breaker space, wiring route, and the planned location." },
      { title: "Clear scope and estimate", description: "You get a straightforward plan, including anything that affects cost or timing." },
      { title: "Install and walkthrough", description: "We complete the agreed work and walk you through your new charging setup." },
    ],
    permitNote:
      "Permit and inspection requirements depend on your jurisdiction and project scope. We identify what applies to your installation as part of the estimate rather than guessing up front.",
    photoTip: "Send photos of your electrical panel (door open, labels visible) and the spot where you want to charge for a faster first look.",
    faqs: faqsByTag("ev"),
    relatedServiceSlugs: ["electrical-panel-upgrades", "commercial-ev-charging"],
    serviceType: "ev_charger_installation",
    status: "published",
  },
  {
    slug: "electrical-panel-upgrades",
    icon: "panel",
    navLabel: "Electrical Panel Upgrades",
    cardTitle: "Electrical Panel Upgrades",
    cardBlurb: "Capacity for EV charging, remodels, and modern demand, evaluated first and never assumed.",
    eyebrow: "Electrical Panel Upgrades",
    seoTitle: "Electrical Panel Upgrades in Los Angeles, CA | Charge On Electric",
    metaDescription:
      "Electrical panel assessments and upgrades in Los Angeles for EV charging, remodels, and added loads. Clear explanations and honest recommendations.",
    heroHeadline: "More Power. More Possibility.",
    heroSubheadline:
      "Your panel is the command center of your property's power. As you add EV chargers, appliances, remodels, or solar, we help you understand whether it needs attention.",
    primaryCta: { label: "Request a Panel Assessment", href: "/request-estimate?service=electrical_panel_upgrade" },
    secondaryCta: { label: "Ask About EV Readiness", href: "/ev-readiness-check" },
    directAnswer: {
      heading: "An upgrade isn't automatic. An assessment is.",
      body: [
        "A panel upgrade is not required for every project. The right answer depends on the existing equipment, available capacity, the condition of the system, and the electrical demands of the property.",
        "Charge On Electric assesses the situation and explains the practical options clearly, so you can make the decision with the full picture.",
      ],
    },
    targetAudience: [
      "Homeowners adding an EV charger who may be short on capacity",
      "Older homes with original or aging panels",
      "Remodels, additions, workshops, and new major appliances",
      "Properties adding solar or battery storage",
    ],
    includedHeading: "What a panel assessment looks at",
    includedItems: [
      "Existing panel condition and equipment",
      "Available capacity and breaker space",
      "Current and planned household loads",
      "Options to add capacity when it's needed",
      "Coordination for EV charging and new circuits",
    ],
    scopeFactors: [
      "Existing service size and panel type",
      "Condition and age of the equipment",
      "Planned additions (EV, HVAC, remodel, solar)",
      "Utility coordination requirements",
      "Permit and inspection requirements",
    ],
    processSteps: [
      { title: "Tell us what's changing", description: "EV charger, remodel, new equipment. Share the plan and panel photos." },
      { title: "Evaluate the system", description: "We review the panel, existing loads, and what the new demand requires." },
      { title: "Explain the options", description: "Upgrade, alternatives, or no change needed, explained in plain language." },
      { title: "Complete the work", description: "If an upgrade makes sense, we coordinate and complete the agreed scope." },
    ],
    permitNote:
      "Panel work typically involves permits, inspections, and sometimes utility coordination. We identify what applies to your project during the assessment.",
    photoTip: "A clear photo of your panel with the door open and the main breaker label visible helps us prepare.",
    faqs: faqsByTag("panel"),
    relatedServiceSlugs: ["ev-charger-installation", "electrical-services"],
    serviceType: "electrical_panel_upgrade",
    status: "published",
  },
  {
    slug: "commercial-ev-charging",
    icon: "building",
    navLabel: "Commercial EV Charging",
    cardTitle: "Commercial EV Charging",
    cardBlurb: "Charging infrastructure for workplaces, multifamily, retail, and fleets, planned for growth.",
    eyebrow: "Commercial EV Charging",
    seoTitle: "Commercial EV Charging Installation in Los Angeles | Charge On Electric",
    metaDescription:
      "Commercial EV charging for businesses, multifamily properties, retail centers, and fleets in Los Angeles. Site assessments and practical project planning.",
    heroHeadline: "Prepare Your Property For What's Next.",
    heroSubheadline:
      "Commercial charging is more than equipment selection. It's power availability, site conditions, user needs, and room to grow. We help you start with the right questions.",
    primaryCta: { label: "Schedule a Commercial Site Assessment", href: "/commercial-assessment" },
    secondaryCta: { label: "Talk to an Electrician", href: "/contact" },
    directAnswer: {
      heading: "A realistic path from idea to operating chargers",
      body: [
        "EV charging can create a meaningful advantage for businesses, multifamily properties, retail locations, workplaces, fleets, and commercial facilities.",
        "Charge On Electric helps property owners and decision-makers identify realistic project paths, understand electrical constraints early, and move toward a charging solution that fits the property.",
      ],
    },
    targetAudience: [
      "Office buildings and workplaces",
      "Retail centers",
      "Apartment and multifamily communities",
      "Hotels and hospitality properties",
      "Fleet and service vehicles",
      "Auto dealerships",
      "Industrial and commercial sites",
      "Property-management portfolios",
    ],
    includedHeading: "What we plan for",
    includedItems: [
      "Site evaluation and existing electrical service review",
      "Charger count and placement planning",
      "Capacity for current and future charging spaces",
      "Wiring routes, trenching, and site logistics",
      "Coordination through permitting and inspection",
    ],
    scopeFactors: [
      "Number of charging spaces now and later",
      "Existing service capacity and switchgear",
      "Distance from power source to parking",
      "Surface work: trenching, boring, or surface conduit",
      "Utility coordination and service upgrades",
      "Access control, networking, and user needs",
    ],
    processSteps: [
      { title: "Discovery", description: "Property type, number of spaces, users, timeline, and any plans or photos." },
      { title: "Site assessment", description: "We review existing service, parking layout, and installation logistics on site." },
      { title: "Scope and proposal", description: "A clear scope with project variables and phasing options." },
      { title: "Build and handoff", description: "Coordinated installation and a clean handoff to your team." },
    ],
    permitNote:
      "Commercial charging projects involve permitting, inspections, and often utility coordination. These are identified and scheduled as part of the project plan.",
    photoTip: "Site plans, parking-area photos, and photos of the main electrical room help us prepare for the assessment.",
    faqs: faqsByTag("commercial"),
    relatedServiceSlugs: ["ev-charger-installation", "electrical-services"],
    serviceType: "commercial_ev_charging",
    status: "published",
  },
  {
    slug: "electrical-services",
    icon: "wrench",
    navLabel: "Electrical Services",
    cardTitle: "Electrical Repairs & Improvements",
    cardBlurb: "Troubleshooting, dedicated circuits, outlets, and lighting for homes and businesses.",
    eyebrow: "Residential & Commercial Electrical",
    seoTitle: "Electrical Services in Los Angeles, CA | Charge On Electric",
    metaDescription:
      "Residential and commercial electrical services in Los Angeles: repairs, troubleshooting, dedicated circuits, outlets, and lighting from Charge On Electric.",
    heroHeadline: "Electrical Work You Can Count On.",
    heroSubheadline:
      "From troubleshooting and repairs to dedicated circuits and lighting, we deliver practical solutions, clean work, and clear next steps.",
    primaryCta: { label: "Request Service", href: "/request-estimate?service=electrical_repair" },
    secondaryCta: { label: "Talk to an Electrician", href: "/contact" },
    directAnswer: {
      heading: "Practical electrical work, clearly explained",
      body: [
        "Not every project is an EV charger. Charge On Electric handles the everyday electrical work homes and businesses need, with the same focus: understand the problem, explain the options, and do the work with care.",
      ],
    },
    targetAudience: [
      "Homeowners with electrical issues or improvement projects",
      "Businesses needing new circuits or repairs",
      "Remodels and equipment installations",
      "Property managers and contractors needing a dependable electrician",
    ],
    includedHeading: "Common services",
    includedItems: [
      "Electrical troubleshooting and repairs",
      "Dedicated circuits for appliances, equipment, and workshops",
      "Outlet and switch installation or replacement",
      "Interior and exterior lighting",
      "Electrical work for remodels and additions",
    ],
    scopeFactors: [
      "Access to wiring and the work area",
      "Condition of existing wiring and devices",
      "Circuit capacity and panel space",
      "Permit requirements for the scope",
    ],
    processSteps: [
      { title: "Describe the issue", description: "What's happening, where, and when it started. Photos help." },
      { title: "Diagnose", description: "We identify the cause and what it takes to fix it safely." },
      { title: "Clear options", description: "You get a plain-language explanation and estimate." },
      { title: "Complete the work", description: "Clean, careful work, and a clear summary of what was done." },
    ],
    permitNote: "Some electrical work requires permits and inspections. We'll tell you when your scope does.",
    faqs: faqsByTag("general"),
    relatedServiceSlugs: ["electrical-panel-upgrades", "ev-charger-installation"],
    serviceType: "electrical_repair",
    status: "published",
  },
];

export const publishedServices = services.filter((s) => s.status === "published");
export const getService = (slug: string) => services.find((s) => s.slug === slug);
