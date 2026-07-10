"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, arrayRemove } from "firebase/firestore";
import { Opportunity } from "@/lib/mockData";
import { useOpportunities, formatDeadline } from "@/hooks/useOpportunities";
import {
  Bookmark,
  BookmarkCheck,
  Calendar,
  MapPin,
  Loader2,
  Sparkles,
  ChevronRight,
  Trash2,
} from "lucide-react";

export default function SavedOpportunities() {
  const { currentUser, loading: authLoading } = useAuth();
  const router = useRouter();
  const { opportunities } = useOpportunities();
  const [savedOpps, setSavedOpps] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !currentUser) {
      router.push("/auth/login");
    }
  }, [currentUser, authLoading, router]);

  useEffect(() => {
    if (!currentUser) return;

    const fetchSaved = async () => {
      try {
        const snap = await getDoc(doc(db, "bookmarks", currentUser.uid));
        if (snap.exists()) {
          const savedIds: string[] = snap.data().opportunityIds || [];
          const matches = opportunities.filter((o) => savedIds.includes(o.id));
          setSavedOpps(matches);
        }
      } catch (err) {
        console.error("Error loading saved opportunities:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSaved();
  }, [currentUser, opportunities]);

  const removeBookmark = async (oppId: string) => {
    if (!currentUser) return;
    try {
      await updateDoc(doc(db, "bookmarks", currentUser.uid), {
        opportunityIds: arrayRemove(oppId),
      });
      setSavedOpps((prev) => prev.filter((o) => o.id !== oppId));
    } catch (err) {
      console.error("Error removing bookmark:", err);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background transition-colors duration-300">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <>
      <Navbar />

      <main className="flex-grow bg-background min-h-screen py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-10">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
              <Bookmark className="w-3.5 h-3.5" /> Saved Collection
            </span>
            <h1 className="text-3xl font-extrabold text-foreground mt-2">
              Your Bookmarked Opportunities
            </h1>
            <p className="text-sm text-foreground-muted mt-1">
              {savedOpps.length > 0
                ? `${savedOpps.length} opportunity${savedOpps.length !== 1 ? "ies" : "y"} saved to your collection.`
                : "Your bookmarked opportunities will appear here."}
            </p>
          </div>

          {/* Grid */}
          {savedOpps.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {savedOpps.map((opp) => (
                <div
                  key={opp.id}
                  className="bg-surface border border-border rounded-3xl p-6 shadow-sm hover:shadow-md dark:hover:shadow-[0_4px_20px_rgba(255,60,110,0.12)] hover:border-primary/25 transition-all flex flex-col justify-between group card-hover"
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary px-2.5 py-1 rounded-full">
                        {opp.category}
                      </span>
                      <button
                        onClick={() => removeBookmark(opp.id)}
                        className="p-1.5 rounded-full text-foreground-muted hover:text-danger hover:bg-danger-surface transition-all"
                        title="Remove Bookmark"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Title */}
                    <h3 className="font-bold text-foreground text-base leading-snug group-hover:text-primary transition-colors">
                      <Link href={`/opportunity/${opp.id}`}>{opp.title}</Link>
                    </h3>
                    <p className="text-foreground-muted text-xs mt-1 font-medium">{opp.organization}</p>

                    {/* Description */}
                    <p className="text-foreground-muted text-xs mt-4 leading-relaxed line-clamp-2">
                      {opp.description}
                    </p>
                  </div>

                  {/* Footer Metadata */}
                  <div className="border-t border-border mt-6 pt-4 flex items-center justify-between text-[11px] text-foreground-muted">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {opp.country}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDeadline(opp.deadline)}
                      </span>
                    </div>

                    <Link
                      href={`/opportunity/${opp.id}`}
                      className="flex items-center gap-0.5 text-primary font-semibold hover:translate-x-0.5 transition-transform"
                    >
                      Details <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="text-center py-24 bg-surface border border-border rounded-3xl shadow-sm transition-colors">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <BookmarkCheck className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">No saved opportunities</h3>
              <p className="text-foreground-muted text-sm max-w-sm mx-auto mb-8">
                Bookmark opportunities from the Explore page to track them here and receive deadline
                reminders.
              </p>
              <Link
                href="/explore"
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-primary hover:bg-primary-hover text-white font-semibold text-sm rounded-full shadow-md transition-all dark:shadow-[0_4px_12px_rgba(255,60,110,0.3)]"
              >
                <Sparkles className="w-4 h-4" />
                Explore Opportunities
              </Link>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
