// Rule-based automation engine.
// Handles deadline notifications and opportunity seeding with zero AI cost.
// Called on: first login, bookmarking an opportunity, navigating to notifications.

import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { NotificationCategory } from "@/lib/types";

// ─── HELPERS ───────────────────────────────────────────────────────────────

function daysUntil(dateStr: string): number {
  const target = new Date(dateStr);
  const now = new Date();
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

async function notificationExists(uid: string, key: string): Promise<boolean> {
  const q = query(
    collection(db, "notifications", uid, "items"),
    where("key", "==", key)
  );
  const snap = await getDocs(q);
  return !snap.empty;
}

async function createNotification(
  uid: string,
  title: string,
  message: string,
  category: NotificationCategory,
  linkedRoute?: string,
  key?: string
): Promise<void> {
  // Prevent duplicate notifications using a dedup key
  if (key && (await notificationExists(uid, key))) return;

  await addDoc(collection(db, "notifications", uid, "items"), {
    uid,
    title,
    message,
    category,
    isRead: false,
    linkedRoute: linkedRoute || null,
    key: key || null,
    createdAt: new Date().toISOString(),
  });
}

// ─── PUBLIC API ────────────────────────────────────────────────────────────

/**
 * Seed notifications for a newly saved opportunity.
 * Creates deadline alert notifications at 30-day, 7-day, and 3-day marks.
 */
export async function seedOpportunityNotification(
  uid: string,
  opportunityId: string,
  opportunityTitle: string,
  deadline: string
): Promise<void> {
  try {
    const days = daysUntil(deadline);

    if (days > 0 && days <= 30) {
      await createNotification(
        uid,
        "Deadline Approaching",
        `"${opportunityTitle}" closes in ${days} day${days === 1 ? "" : "s"}. Don't miss it!`,
        "deadline_alert",
        `/opportunity/${opportunityId}`,
        `deadline_${opportunityId}`
      );
    } else if (days > 30) {
      await createNotification(
        uid,
        "Opportunity Saved",
        `"${opportunityTitle}" has been saved. Deadline: ${new Date(deadline).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}.`,
        "new_opportunity",
        `/opportunity/${opportunityId}`,
        `saved_${opportunityId}`
      );
    }
  } catch (err) {
    console.error("AutomationEngine.seedOpportunityNotification error:", err);
  }
}

/**
 * Seed a welcome AI suggestion notification for new users.
 */
export async function seedWelcomeNotification(uid: string, name: string): Promise<void> {
  try {
    await createNotification(
      uid,
      "Welcome to Bloom! 🌸",
      `Hi ${name}! Complete your profile so we can match you with the best opportunities. Head to the AI Hub for personalised roadmaps.`,
      "ai_suggestion",
      "/profile",
      `welcome_${uid}`
    );
  } catch (err) {
    console.error("AutomationEngine.seedWelcomeNotification error:", err);
  }
}

/**
 * Generate application status update notification.
 */
export async function notifyApplicationUpdate(
  uid: string,
  opportunityTitle: string,
  newStatus: string
): Promise<void> {
  try {
    await createNotification(
      uid,
      "Application Status Updated",
      `Your application for "${opportunityTitle}" has been updated to: ${newStatus}.`,
      "application_update",
      "/dashboard/tracker"
    );
  } catch (err) {
    console.error("AutomationEngine.notifyApplicationUpdate error:", err);
  }
}

/**
 * Refresh deadline alerts for all bookmarked opportunities.
 * Called when user visits the notifications page.
 */
export async function refreshDeadlineAlerts(uid: string): Promise<void> {
  try {
    const bookmarkSnap = await getDoc(doc(db, "bookmarks", uid));
    if (!bookmarkSnap.exists()) return;

    const savedIds: string[] = bookmarkSnap.data().opportunityIds || [];
    const { getAllOpportunitiesOnce } = await import("@/lib/opportunitiesData");
    const allOpportunities = await getAllOpportunitiesOnce();

    for (const oppId of savedIds) {
      const opp = allOpportunities.find((o) => o.id === oppId);
      if (!opp) continue;

      const days = daysUntil(opp.deadline);

      if (days === 7 || days === 3 || days === 1) {
        await createNotification(
          uid,
          `${days}-Day Deadline Warning`,
          `"${opp.title}" closes in ${days} day${days === 1 ? "" : "s"}! Apply now.`,
          "deadline_alert",
          `/opportunity/${opp.id}`,
          `warning_${days}d_${opp.id}`
        );
      }
    }
  } catch (err) {
    console.error("AutomationEngine.refreshDeadlineAlerts error:", err);
  }
}
