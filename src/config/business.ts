/**
 * SINGLE SOURCE OF TRUTH for business facts.
 *
 * Rule: a fact only appears on the website when it is filled in AND (where
 * there is a `verified` flag) verified === true. Leave anything unconfirmed as
 * null / false — the UI hides it. A blank space is better than a false claim.
 */

export type Business = typeof business;

export const business = {
  name: "Charge On Electric",
  legalName: "Charge On Electric Inc.",
  tagline: "Powering What's Next.",

  /** e.g. { display: "(661) 555-0123", e164: "+16615550123" } — call/text buttons hide until set. */
  phone: null as null | { display: string; e164: string },
  /** Enables the "Text us" button. Only set if the number above can receive SMS. */
  smsEnabled: false,
  email: null as null | string,

  /**
   * License listed on the company Instagram bio (C10 #1156860).
   * Confirm at https://www.cslb.ca.gov/OnlineServices/CheckLicenseII/CheckLicense.aspx
   * then set verified: true. California law requires the license number in advertising,
   * so confirm this before launch.
   */
  license: {
    number: "1156860",
    classification: "C-10 Electrical",
    verified: false,
  },
  /** Only set true with a current certificate of insurance on file. */
  insured: false,
  yearsExperience: null as null | number,

  /** Service-area-only businesses should leave street address null. */
  address: {
    street: null as null | string,
    city: "Bakersfield",
    region: "CA",
    postalCode: null as null | string,
  },
  serviceAreaStatement: "Serving Bakersfield and verified surrounding areas",
  /** Only list places the company can actually quote, permit, and support. */
  areaServed: ["Bakersfield"],

  /** e.g. "Mon–Fri 7:00 AM – 5:00 PM" */
  hours: null as null | string,
  emergencyService: null as null | string,
  responsePromise: null as null | string,

  reviews: {
    /** Only set when it exactly reflects genuine public reviews. */
    rating: null as null | number,
    count: null as null | number,
    platform: null as null | string,
    /** Direct "leave a review" link (Google Business Profile). */
    leaveReviewUrl: null as null | string,
    profileUrl: null as null | string,
  },

  social: {
    instagram: "https://www.instagram.com/charge_on_electric/",
    facebook: null as null | string,
    youtube: null as null | string,
    google: null as null | string,
  },

  financing: { available: false, details: null as null | string },
  warranty: null as null | string,
};

export const hasPhone = () => business.phone !== null;
export const licenseVisible = () => business.license.verified && !!business.license.number;
