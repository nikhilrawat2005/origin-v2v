"use client";

import { useState, useEffect, useCallback } from "react";
import {
  collection,
  query,
  onSnapshot,
  QueryConstraint,
  getDocs,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

interface UseFirestoreCollectionResult<T> {
  items: T[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Generic hook for fetching and optionally subscribing to a Firestore collection.
 * @param collectionPath - Firestore collection path (e.g. "community_posts")
 * @param constraints - Array of Firestore query constraints (where, orderBy, limit)
 * @param realtime - If true, uses onSnapshot for live updates. Default false.
 */
export function useFirestoreCollection<T extends { id: string }>(
  collectionPath: string | null,
  constraints: QueryConstraint[] = [],
  realtime: boolean = false
): UseFirestoreCollectionResult<T> {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const refetch = useCallback(() => setRefreshKey((k) => k + 1), []);

  useEffect(() => {
    if (!collectionPath) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const q = query(collection(db, collectionPath), ...constraints);

    if (realtime) {
      const unsub = onSnapshot(
        q,
        (snap) => {
          const results: T[] = [];
          snap.forEach((d) => results.push({ id: d.id, ...d.data() } as T));
          setItems(results);
          setLoading(false);
        },
        (err) => {
          setError(err.message);
          setLoading(false);
        }
      );
      return () => unsub();
    } else {
      getDocs(q)
        .then((snap) => {
          const results: T[] = [];
          snap.forEach((d) => results.push({ id: d.id, ...d.data() } as T));
          setItems(results);
        })
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collectionPath, refreshKey]);

  return { items, loading, error, refetch };
}
