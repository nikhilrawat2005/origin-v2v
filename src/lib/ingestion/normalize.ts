// Uses the existing AIRouterService (Groq -> OpenRouter fallback) to turn
// raw text pulled from a feed/page into structured opportunities matching
// the platform's schema.

import { AIRouterService } from "@/lib/aiProviders";

export interface NormalizedOpportunity {
  title: string;
  orgName: string;
  description: string;
  eligibility: string;
  deadline: string;
  country: string;
  category: string;
  field: string;
  applyLink: string;
  requiredDocuments: string[];
}

const VALID_CATEGORIES = [
  "Scholarships",
  "Fellowships",
  "Internships",
  "Conferences",
  "Hackathons",
  "STEM Programs",
  "Research Programs",
  "Exchange Programs",
];

export async function normalizeToOpportunities(
  rawText: string,
  sourceUrl: string
): Promise<NormalizedOpportunity[]> {
  const prompt = `
    You are a data-extraction assistant for a platform that lists scholarships,
    fellowships, internships, hackathons, conferences, and STEM programs —
    with a focus on opportunities for women.

    Below is raw content pulled from: ${sourceUrl}

    Extract EVERY distinct, genuine opportunity you can find in this content
    (there may be one, several, or none — do not invent any). For each one,
    output an object with exactly these fields:
    - title (string)
    - orgName (string) — the organization/company/government body offering it
    - description (string, 1-3 sentences)
    - eligibility (string, summarize who can apply)
    - deadline (string, ISO date "YYYY-MM-DD" if an exact date is present,
      otherwise a short human string like "Rolling — check official site")
    - country (string, use "Global" if not region-specific)
    - category (one of exactly: "Scholarships", "Fellowships", "Internships",
      "Conferences", "Hackathons", "STEM Programs", "Research Programs",
      "Exchange Programs")
    - field (string, e.g. "Computer Science", "STEM", "Engineering")
    - applyLink (string — the URL to apply or learn more; use "${sourceUrl}"
      if no more specific link is present in the content)
    - requiredDocuments (array of strings, reasonable guess, e.g. ["Resume", "Transcript"])

    Only include items CLEARLY relevant to scholarships, fellowships,
    internships, hackathons, conferences, or STEM programs. Ignore navigation
    menus, ads, unrelated articles, or generic page boilerplate.

    Respond ONLY with valid JSON in exactly this shape, no markdown, no extra text:
    { "opportunities": [ { <fields above> }, ... ] }

    If there are no genuine opportunities in this content, respond with:
    { "opportunities": [] }

    RAW CONTENT:
    """
    ${rawText.slice(0, 6000)}
    """
  `;

  try {
    const result = await AIRouterService.requestAI(prompt, true);
    const list = result?.opportunities;
    if (!Array.isArray(list)) return [];

    return list
      .filter(
        (o: any) =>
          o &&
          typeof o.title === "string" &&
          o.title.trim().length > 0 &&
          typeof o.orgName === "string" &&
          o.orgName.trim().length > 0
      )
      .map((o: any) => ({
        title: o.title.trim(),
        orgName: o.orgName.trim(),
        description: typeof o.description === "string" ? o.description.trim() : "",
        eligibility: typeof o.eligibility === "string" ? o.eligibility.trim() : "",
        deadline: typeof o.deadline === "string" && o.deadline.trim() ? o.deadline.trim() : "Rolling — check official site",
        country: typeof o.country === "string" && o.country.trim() ? o.country.trim() : "Global",
        category: VALID_CATEGORIES.includes(o.category) ? o.category : "STEM Programs",
        field: typeof o.field === "string" && o.field.trim() ? o.field.trim() : "STEM",
        applyLink: typeof o.applyLink === "string" && o.applyLink.trim() ? o.applyLink.trim() : sourceUrl,
        requiredDocuments: Array.isArray(o.requiredDocuments) ? o.requiredDocuments.filter((d: any) => typeof d === "string") : [],
      }));
  } catch (err) {
    console.error(`[Ingestion] Normalization failed for ${sourceUrl}:`, err);
    return [];
  }
}
