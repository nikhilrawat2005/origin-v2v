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
  ExternalLink,
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
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 text-brand-purple animate-spin" />
      </div>
    );
  }

  return (
    <>
      <Navbar />

      <main className="flex-grow bg-slate-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-10">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-brand-purple">
              <Bookmark className="w-3.5 h-3.5" /> Saved Collection
            </span>
            <h1 className="text-3xl font-extrabold text-brand-navy mt-2">
              Your Bookmarked Opportunities
            </h1>
            <p className="text-sm text-slate-500 mt-1">
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
                  className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-brand-purple/10 text-brand-purple px-2.5 py-1 rounded-full">
                        {opp.category}
                      </span>
                      <button
                        onClick={() => removeBookmark(opp.id)}
                        className="p-1.5 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
                        title="Remove Bookmark"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Title */}
                    <h3 className="font-bold text-slate-800 text-base leading-snug group-hover:text-brand-purple transition-colors">
                      <Link href={`/opportunity/${opp.id}`}>{opp.title}</Link>
                    </h3>
                    <p className="text-slate-500 text-xs mt-1 font-medium">{opp.organization}</p>

                    {/* Description */}
                    <p className="text-slate-600 text-xs mt-4 leading-relaxed line-clamp-2">
                      {opp.description}
                    </p>
                  </div>

                  {/* Footer Metadata */}
                  <div className="border-t border-slate-100 mt-6 pt-4 flex items-center justify-between text-[11px] text-slate-500">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {opp.country}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {formatDeadline(opp.deadline)}
                      </span>
                    </div>

                    <Link
                      href={`/opportunity/${opp.id}`}
                      className="flex items-center gap-0.5 text-brand-purple font-semibold hover:translate-x-0.5 transition-transform"
                    >
                      Details <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="text-center py-24 bg-white border border-slate-100 rounded-3xl shadow-sm">
              <div className="w-20 h-20 rounded-full bg-brand-purple/10 flex items-center justify-center mx-auto mb-6">
                <BookmarkCheck className="w-10 h-10 text-brand-purple" />
              </div>
              <h3 className="text-xl font-bold text-brand-navy mb-2">No saved opportunities</h3>
              <p className="text-slate-500 text-sm max-w-sm mx-auto mb-8">
                Bookmark opportunities from the Explore page to track them here and receive deadline
                reminders.
              </p>
              <Link
                href="/explore"
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-brand-purple hover:bg-brand-indigo text-white font-semibold text-sm rounded-full shadow-md transition-all"
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
