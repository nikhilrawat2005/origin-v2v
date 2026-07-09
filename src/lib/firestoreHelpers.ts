// Reusable Firestore CRUD helpers.
// Centralises all Firestore operations to avoid duplicate logic across modules.

import {
  collection,
  doc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  QueryConstraint,
  DocumentData,
  increment,
  serverTimestamp,
  onSnapshot,
  Unsubscribe,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

/** Add a document to a collection and return the generated ID. */
export async function addDocument<T extends DocumentData>(
  collectionPath: string,
  data: T
): Promise<string> {
  const ref = await addDoc(collection(db, collectionPath), data);
  return ref.id;
}

/** Set (create/overwrite) a document at a specific path. */
export async function setDocument<T extends DocumentData>(
  collectionPath: string,
  docId: string,
  data: T
): Promise<void> {
  await setDoc(doc(db, collectionPath, docId), data);
}

/** Partially update an existing document. */
export async function updateDocument(
  collectionPath: string,
  docId: string,
  data: Partial<DocumentData>
): Promise<void> {
  await updateDoc(doc(db, collectionPath, docId), data);
}

/** Delete a document. */
export async function deleteDocument(
  collectionPath: string,
  docId: string
): Promise<void> {
  await deleteDoc(doc(db, collectionPath, docId));
}

/** Fetch a single document by ID. Returns null if not found. */
export async function fetchDocument<T>(
  collectionPath: string,
  docId: string
): Promise<T | null> {
  const snap = await getDoc(doc(db, collectionPath, docId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as T;
}

/** Fetch documents from a collection with optional query constraints. */
export async function fetchCollection<T>(
  collectionPath: string,
  constraints: QueryConstraint[] = []
): Promise<T[]> {
  const q = query(collection(db, collectionPath), ...constraints);
  const snap = await getDocs(q);
  const results: T[] = [];
  snap.forEach((d) => results.push({ id: d.id, ...d.data() } as T));
  return results;
}

/** Fetch a subcollection (e.g. users/{uid}/wallet). */
export async function fetchSubcollection<T>(
  parentPath: string,
  parentId: string,
  subCollection: string,
  constraints: QueryConstraint[] = []
): Promise<T[]> {
  const path = `${parentPath}/${parentId}/${subCollection}`;
  return fetchCollection<T>(path, constraints);
}

/** Add to a subcollection. */
export async function addToSubcollection<T extends DocumentData>(
  parentPath: string,
  parentId: string,
  subCollection: string,
  data: T
): Promise<string> {
  const path = `${parentPath}/${parentId}/${subCollection}`;
  return addDocument(path, data);
}

/** Delete from a subcollection. */
export async function deleteFromSubcollection(
  parentPath: string,
  parentId: string,
  subCollection: string,
  docId: string
): Promise<void> {
  const path = `${parentPath}/${parentId}/${subCollection}`;
  return deleteDocument(path, docId);
}

/** Increment a numeric field on a document. */
export async function incrementField(
  collectionPath: string,
  docId: string,
  field: string,
  delta: number = 1
): Promise<void> {
  await updateDoc(doc(db, collectionPath, docId), {
    [field]: increment(delta),
  });
}

/** Subscribe to a query with real-time updates. Returns an unsubscribe function. */
export function subscribeToCollection<T>(
  collectionPath: string,
  constraints: QueryConstraint[],
  onData: (items: T[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const q = query(collection(db, collectionPath), ...constraints);
  return onSnapshot(
    q,
    (snap) => {
      const items: T[] = [];
      snap.forEach((d) => items.push({ id: d.id, ...d.data() } as T));
      onData(items);
    },
    (err) => onError?.(err)
  );
}

// Re-export commonly used query builders for convenience
export { where, orderBy, limit, serverTimestamp };
