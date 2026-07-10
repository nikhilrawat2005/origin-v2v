/**
 * opportunitiesData.ts
 *
 * Non-hook, one-shot async helper that merges the real Firestore
 * "org_opportunities" collection with the legacy mockOpportunities array.
 *
 * Use this in plain async functions (server utilities, automation engine, etc.)
 * where React hooks (useOpportunities) are not available.
 *
 * If an id exists in both places, the Firestore version wins.
 */

import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { mockOpportunities, Opportunity } from "@/lib/mockData";

export async function getAllOpportunitiesOnce(): Promise<Opportunity[]> {
  try {
    const snap = await getDocs(collection(db, "org_opportunities"));
    const firestoreOpps: Opportunity[] = [];
    snap.forEach((d) => {
      firestoreOpps.push({ id: d.id, ...d.data() } as Opportunity);
    });

    const firestoreIds = new Set(firestoreOpps.map((o) => o.id));
    const merged = [
      ...firestoreOpps,
      ...mockOpportunities.filter((o) => !firestoreIds.has(o.id)),
    ];

    return merged;
  } catch (err) {
    console.error("getAllOpportunitiesOnce: Firestore fetch failed, falling back to mock data:", err);
    return mockOpportunities;
  }
}
