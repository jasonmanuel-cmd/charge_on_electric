/**
 * Real proof only. Projects need real facts, photos with alt text, and customer
 * permission (consentVerified). Reviews must be genuine and publicly posted.
 * Empty arrays render honest empty states, never placeholders that look real.
 */

export type Project = {
  slug: string;
  title: string;
  serviceType: string;
  area: string; // general area only, e.g. "Silver Lake, Los Angeles"
  need: string;
  assessment: string;
  work: string;
  result: string;
  images: { src: string; alt: string; consentVerified: boolean }[];
  status: "draft" | "published";
  publishedAt?: string;
};

export type Review = {
  platform: string;
  reviewerDisplayName: string; // first name + last initial unless permission says otherwise
  rating: number;
  text: string;
  url?: string;
  serviceType?: string;
  published: boolean;
};

export const projects: Project[] = [];
export const reviews: Review[] = [];

export const publishedProjects = projects.filter(
  (p) => p.status === "published" && p.images.every((i) => i.consentVerified && i.alt.trim().length > 0),
);
export const publishedReviews = reviews.filter((r) => r.published);
