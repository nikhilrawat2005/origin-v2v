const { initializeApp, getApps, cert } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const fs = require("fs");
const path = require("path");
const { sendDeadlineAlert } = require("./emailService");

// Days-before-deadline thresholds that trigger an email.
const ALERT_THRESHOLDS = [7, 3, 1];

function loadCredential() {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    try {
      return JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
    } catch {
      throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY is set but is not valid JSON.");
    }
  }

  const localPath = path.join(__dirname, "..", "serviceAccountKey.json");
  if (fs.existsSync(localPath)) {
    return JSON.parse(fs.readFileSync(localPath, "utf-8"));
  }

  throw new Error(
    "No Firebase service account credentials found. Set FIREBASE_SERVICE_ACCOUNT_KEY, or place backend/serviceAccountKey.json locally."
  );
}

function getDb() {
  if (getApps().length === 0) {
    initializeApp({ credential: cert(loadCredential()) });
  }
  return getFirestore();
}

/** Whole-number days between now (midnight) and the deadline date. */
function daysUntil(deadlineStr) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const deadline = new Date(deadlineStr);
  deadline.setHours(0, 0, 0, 0);

  const diffMs = deadline.getTime() - today.getTime();
  return Math.round(diffMs / 86400000);
}

/**
 * Scan the `applications` collection, find entries hitting a 7/3/1-day
 * threshold today, and email the owning user — skipping any threshold
 * already recorded in the entry's `sentAlerts` array so we never double-send.
 */
async function checkDeadlinesAndSendEmails() {
  const db = getDb();
  const snap = await db.collection("applications").get();

  const results = { scanned: snap.size, sent: 0, skipped: 0, errors: 0 };

  for (const docSnap of snap.docs) {
    const app = docSnap.data();

    // Skip terminal / irrelevant states — no point alerting on these.
    if (!app.deadline || ["Rejected", "Selected", "Offer Received", "Joined", "Ongoing", "Completed", "Winner"].includes(app.status)) {
      continue;
    }

    const daysLeft = daysUntil(app.deadline);
    if (!ALERT_THRESHOLDS.includes(daysLeft)) continue;

    const sentAlerts = app.sentAlerts || [];
    if (sentAlerts.includes(daysLeft)) {
      results.skipped++;
      continue;
    }

    try {
      const userSnap = await db.collection("users").doc(app.uid).get();
      const userEmail = userSnap.exists ? userSnap.data().email : null;
      if (!userEmail) {
        results.skipped++;
        continue;
      }

      await sendDeadlineAlert(userEmail, {
        opportunityTitle: app.opportunityTitle,
        organization: app.organization,
        deadline: app.deadline,
        daysLeft,
        applyLink: app.applyLink,
      });

      await docSnap.ref.update({ sentAlerts: [...sentAlerts, daysLeft] });
      results.sent++;
      console.log(`[deadlineChecker] Sent ${daysLeft}-day alert to ${userEmail} for "${app.opportunityTitle}"`);
    } catch (err) {
      results.errors++;
      console.error(`[deadlineChecker] Failed for application ${docSnap.id}:`, err.message);
    }
  }

  console.log("[deadlineChecker] Run complete:", results);
  return results;
}

module.exports = { checkDeadlinesAndSendEmails, daysUntil, ALERT_THRESHOLDS };
