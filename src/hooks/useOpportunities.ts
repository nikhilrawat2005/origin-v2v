"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { mockOpportunities, Opportunity } from "@/lib/mockData";

/**
 * Merges the real "org_opportunities" Firestore collection (org-posted +
 * seeded real scholarships/schemes/conferences) with the legacy static
 * mockOpportunities array, so nothing breaks while the data source
 * transitions from fake -> real.
 *
 * If an id exists in both places, the Firestore (real) version wins.
 */
export function useOpportunities() {
  const [firestoreOpps, setFirestoreOpps] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "org_opportunities"),
      (snap) => {
        const items: Opportunity[] = [];
        snap.forEach((d) => {
          items.push({ id: d.id, ...d.data() } as Opportunity);
        });
        setFirestoreOpps(items);
        setLoading(false);
      },
      (err) => {
        console.error("Failed to load org_opportunities:", err);
        setLoading(false);
      }
    );
    return () => unsub();
  }, []);

  const firestoreIds = new Set(firestoreOpps.map((o) => o.id));
  const merged = [
    ...firestoreOpps,
    ...mockOpportunities.filter((o) => !firestoreIds.has(o.id)),
  ];

  return { opportunities: merged, loading };
}

/**
 * Safely formats a deadline that might be a real ISO date OR a placeholder
 * string like "Rolling — check official site" (from seeded real-world data
 * that doesn't have an exact date yet).
 */
export function formatDeadline(deadline: string): string {
  const date = new Date(deadline);
  if (isNaN(date.getTime())) {
    return deadline; // show the raw placeholder text instead of "Invalid Date"
  }
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}
