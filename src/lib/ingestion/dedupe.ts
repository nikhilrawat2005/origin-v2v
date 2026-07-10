import { getAdminDb } from "@/lib/firebaseAdmin";

/**
 * Exact-match duplicate check: same title + same organization already exists
 * in org_opportunities. Simple on purpose — good enough to stop the same
 * feed item being re-added every day, without needing fuzzy matching.
 */
export async function isDuplicate(title: string, orgName: string): Promise<boolean> {
  const db = getAdminDb();
  const snap = await db
    .collection("org_opportunities")
    .where("title", "==", title)
    .where("orgName", "==", orgName)
    .limit(1)
    .get();
  return !snap.empty;
}
