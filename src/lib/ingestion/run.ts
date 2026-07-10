import { getAdminDb } from "@/lib/firebaseAdmin";
import { fetchTrustedSources, fetchScrapedSources, RawListing } from "./sources";
import { normalizeToOpportunities } from "./normalize";
import { isDuplicate } from "./dedupe";

export interface IngestionSummary {
  startedAt: string;
  finishedAt: string;
  sourcesProcessed: number;
  opportunitiesExtracted: number;
  newlyAdded: number;
  skippedDuplicates: number;
  autoApproved: number;
  pendingReview: number;
  errors: string[];
}

export async function runIngestion(): Promise<IngestionSummary> {
  const startedAt = new Date().toISOString();
  const errors: string[] = [];
  let opportunitiesExtracted = 0;
  let newlyAdded = 0;
  let skippedDuplicates = 0;
  let autoApproved = 0;
  let pendingReview = 0;

  const trusted = await fetchTrustedSources().catch((err) => {
    errors.push(`Trusted sources fetch failed: ${err.message}`);
    return [] as RawListing[];
  });
  const scraped = await fetchScrapedSources().catch((err) => {
    errors.push(`Scraped sources fetch failed: ${err.message}`);
    return [] as RawListing[];
  });

  // Safety cap: with 40+ scraped sources now configured, processing every
  // single one (each = 1 AI call + Firestore reads/writes) sequentially
  // could get close to the 300s serverless limit on a slow day. If this cap
  // gets hit often, either raise it (and watch your cron duration in Vercel
  // logs) or split sources across two cron schedules.
  const MAX_RAW_LISTINGS_PER_RUN = 60;
  const allListings = [...trusted, ...scraped].slice(0, MAX_RAW_LISTINGS_PER_RUN);
  const db = getAdminDb();

  for (const listing of allListings) {
    try {
      const extracted = await normalizeToOpportunities(listing.rawText, listing.sourceUrl);
      opportunitiesExtracted += extracted.length;

      for (const opp of extracted) {
        const dup = await isDuplicate(opp.title, opp.orgName).catch(() => false);
        if (dup) {
          skippedDuplicates++;
          continue;
        }

        const status = listing.autoApprove ? "approved" : "pending";
        if (status === "approved") autoApproved++;
        else pendingReview++;

        await db.collection("org_opportunities").add({
          postedByUid: "automated-ingestion",
          orgName: opp.orgName,
          title: opp.title,
          description: opp.description,
          eligibility: opp.eligibility,
          deadline: opp.deadline,
          country: opp.country,
          category: opp.category,
          field: opp.field,
          applyLink: opp.applyLink,
          requiredDocuments: opp.requiredDocuments,
          status,
          applicationCount: 0,
          viewCount: 0,
          source: "automated",
          sourceType: listing.sourceType,
          sourceUrl: listing.sourceUrl,
          ingestedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        });
        newlyAdded++;
      }
    } catch (err: any) {
      errors.push(`Failed processing ${listing.sourceUrl}: ${err.message}`);
    }
  }

  const finishedAt = new Date().toISOString();
  const summary: IngestionSummary = {
    startedAt,
    finishedAt,
    sourcesProcessed: allListings.length,
    opportunitiesExtracted,
    newlyAdded,
    skippedDuplicates,
    autoApproved,
    pendingReview,
    errors,
  };

  try {
    await db.collection("ingestion_logs").add(summary);
  } catch (err) {
    console.error("[Ingestion] Failed to write ingestion log:", err);
  }

  return summary;
}
