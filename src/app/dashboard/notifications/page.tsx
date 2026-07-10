"use client";

import { useAuth } from "@/context/AuthContext";
import { useNotifications } from "@/hooks/useNotifications";
import { db } from "@/lib/firebase";
import { doc, updateDoc, deleteDoc, writeBatch, collection, getDocs } from "firebase/firestore";
import { useState } from "react";
import {
  Bell,
  Check,
  CheckSquare,
  Clock,
  Sparkles,
  Briefcase,
  Layers,
  Trash2,
  Inbox,
  Loader2,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";

export default function NotificationsPage() {
  const { currentUser } = useAuth();
  const { notifications, loading } = useNotifications(currentUser?.uid);
  const [filter, setFilter] = useState<string>("all");

  const markAsRead = async (id: string) => {
    if (!currentUser) return;
    try {
      await updateDoc(doc(db, "notifications", currentUser.uid, "items", id), {
        isRead: true,
      });
    } catch (err) {
      console.error("Error marking read:", err);
    }
  };

  const deleteNotification = async (id: string) => {
    if (!currentUser) return;
    try {
      await deleteDoc(doc(db, "notifications", currentUser.uid, "items", id));
    } catch (err) {
      console.error("Error deleting notification:", err);
    }
  };

  const markAllRead = async () => {
    if (!currentUser || notifications.length === 0) return;
    try {
      const batch = writeBatch(db);
      notifications.forEach((n) => {
        if (!n.isRead) {
          const ref = doc(db, "notifications", currentUser.uid, "items", n.id);
          batch.update(ref, { isRead: true });
        }
      });
      await batch.commit();
    } catch (err) {
      console.error("Error marking all read:", err);
    }
  };

  const clearAll = async () => {
    if (!currentUser || notifications.length === 0) return;
    try {
      const batch = writeBatch(db);
      notifications.forEach((n) => {
        const ref = doc(db, "notifications", currentUser.uid, "items", n.id);
        batch.delete(ref);
      });
      await batch.commit();
    } catch (err) {
      console.error("Error clearing notifications:", err);
    }
  };

  // Filter logic
  const filtered = notifications.filter((n) => {
    if (filter === "all") return true;
    if (filter === "unread") return !n.isRead;
    return n.category === filter;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "deadline_alert":
        return <Clock className="w-4 h-4 text-red-500" />;
      case "new_opportunity":
        return <Briefcase className="w-4 h-4 text-blue-500" />;
      case "application_update":
        return <Layers className="w-4 h-4 text-primary" />;
      case "ai_suggestion":
        return <Sparkles className="w-4 h-4 text-amber-500" />;
      default:
        return <Bell className="w-4 h-4 text-slate-500" />;
    }
  };

  const getCategoryLabel = (category: string) => {
    return category.replace("_", " ");
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground flex items-center gap-2">
            <Bell className="w-6 h-6 text-primary" /> Notification Center
          </h1>
          <p className="text-foreground-muted text-sm mt-1">
            Stay updated with deadline alerts, status updates, and personalized AI suggestions.
          </p>
        </div>

        {notifications.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={markAllRead}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-surface border border-border hover:bg-surface-raised rounded-xl text-xs font-semibold text-foreground transition-all shadow-sm"
            >
              <CheckSquare className="w-3.5 h-3.5" /> Mark all read
            </button>
            <button
              onClick={clearAll}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-surface border border-red-500/30 hover:bg-red-500/10 rounded-xl text-xs font-semibold text-red-500 transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear all
            </button>
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {[
          { key: "all", label: "All Alerts" },
          { key: "unread", label: "Unread" },
          { key: "deadline_alert", label: "Deadlines" },
          { key: "new_opportunity", label: "New Matches" },
          { key: "application_update", label: "Updates" },
          { key: "ai_suggestion", label: "AI Suggestions" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${
              filter === tab.key
                ? "bg-primary border-primary text-white shadow-sm"
                : "bg-surface border-border text-foreground hover:bg-surface-raised"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notification items */}
      <div className="bg-surface border border-border rounded-3xl p-6 shadow-sm space-y-4">
        {filtered.map((item) => (
          <div
            key={item.id}
            className={`p-4 rounded-2xl border transition-all flex items-start gap-4 ${
              item.isRead
                ? "bg-surface border-border opacity-75"
                : "bg-gradient-to-r from-primary/5 to-surface border-primary/10 shadow-sm"
            }`}
          >
            <div className={`p-2.5 rounded-xl ${item.isRead ? "bg-surface-raised" : "bg-primary/10"}`}>
              {getCategoryIcon(item.category)}
            </div>

            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                  item.isRead ? "bg-surface-raised text-foreground-muted" : "bg-primary/15 text-primary"
                }`}>
                  {getCategoryLabel(item.category)}
                </span>
                <span className="text-[10px] text-foreground-muted font-medium">
                  {new Date(item.createdAt).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <h4 className={`text-sm font-bold text-foreground ${!item.isRead ? "text-primary" : ""}`}>
                {item.title}
              </h4>
              <p className="text-foreground-muted text-xs leading-relaxed">{item.message}</p>

              {item.linkedRoute && (
                <div className="pt-2">
                  <Link
                    href={item.linkedRoute}
                    className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                  >
                    View Details <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
              )}
            </div>

            <div className="flex items-center gap-1">
              {!item.isRead && (
                <button
                  onClick={() => markAsRead(item.id)}
                  className="p-1.5 rounded-full text-primary hover:bg-primary/10"
                  title="Mark as read"
                >
                  <Check className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => deleteNotification(item.id)}
                className="p-1.5 rounded-full text-foreground-muted hover:text-red-500 hover:bg-surface-raised"
                title="Delete alert"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-surface-raised rounded-full flex items-center justify-center mx-auto mb-4">
              <Inbox className="w-8 h-8 text-foreground-muted" />
            </div>
            <h3 className="font-bold text-foreground text-base">Inbox is empty</h3>
            <p className="text-foreground-muted text-xs max-w-xs mx-auto mt-1">
              {filter === "all"
                ? "No alerts generated yet."
                : `No alerts match the category: "${filter}".`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
