// Firebase Admin initializer — used by server-only routes (like the
// automated ingestion cron) that need to write to Firestore without going
// through client-side security rules (same idea as scripts/seed-opportunities.mjs,
// just usable from within a Next.js API route).
//
// Credential resolution order:
// 1. FIREBASE_SERVICE_ACCOUNT_KEY env var — a single-line JSON string of the
//    full service account key. This is what you set in Vercel's dashboard.
// 2. scripts/serviceAccountKey.json on disk — local dev convenience, same
//    file already used by the seed script. Never committed (see .gitignore).

import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

function loadCredential(): any {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    try {
      return JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
    } catch {
      throw new Error(
        "FIREBASE_SERVICE_ACCOUNT_KEY is set but is not valid JSON. Paste the full service account JSON as a single-line string."
      );
    }
  }

  const localPath = join(process.cwd(), "scripts", "serviceAccountKey.json");
  if (existsSync(localPath)) {
    return JSON.parse(readFileSync(localPath, "utf-8"));
  }

  throw new Error(
    "No Firebase service account credentials found. Set FIREBASE_SERVICE_ACCOUNT_KEY in your environment (production), or place scripts/serviceAccountKey.json locally (dev)."
  );
}

export function getAdminDb() {
  if (getApps().length === 0) {
    initializeApp({ credential: cert(loadCredential()) });
  }
  return getFirestore();
}
