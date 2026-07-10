"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Opportunity } from "@/lib/mockData";
import { useOpportunities, formatDeadline } from "@/hooks/useOpportunities";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  collection,
  addDoc,
  increment
} from "firebase/firestore";
import {
  Calendar,
  MapPin,
  Bookmark,
  BookmarkCheck,
  Share2,
  FileText,
  AlertCircle,
  ExternalLink,
  Bell,
  ArrowLeft,
  Loader2,
  Check
} from "lucide-react";

export default function OpportunityDetail({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const { currentUser } = useAuth();
  const { opportunities, loading: oppsLoading } = useOpportunities();

  const [opp, setOpp] = useState<Opportunity | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);
  const [reminderSaved, setReminderSaved] = useState(false);
  const [reminderLoading, setReminderLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOpp = async () => {
      const match = opportunities.find((o) => o.id === id);
      if (!match) {
        setLoading(false);
        return;
      }
      setOpp(match);

      // Real view-count tracking (replaces the old random placeholder number).
      // Fire-and-forget: a failed increment shouldn't block the page.
      updateDoc(doc(db, "org_opportunities", id), {
        viewCount: increment(1),
      }).catch((err) => console.warn("View count increment failed:", err));

      if (currentUser) {
        const snap = await getDoc(doc(db, "bookmarks", currentUser.uid));
        if (snap.exists()) {
          const ids = snap.data().opportunityIds || [];
          setIsSaved(ids.includes(id));
        }

        const remSnap = await getDoc(doc(db, "reminders", `${currentUser.uid}_${id}`));
        if (remSnap.exists()) {
          setReminderSaved(true);
        }
      }
      setLoading(false);
    };
    fetchOpp();
  }, [id, currentUser, opportunities]);

  const toggleBookmark = async () => {
    if (!currentUser) {
      router.push("/auth/login");
      return;
    }

    const docRef = doc(db, "bookmarks", currentUser.uid);

    try {
      const snap = await getDoc(docRef);
      if (!snap.exists()) {
        await setDoc(docRef, { opportunityIds: [id] });
      } else {
        await updateDoc(docRef, {
          opportunityIds: isSaved ? arrayRemove(id) : arrayUnion(id),
        });
      }
      setIsSaved(!isSaved);
    } catch (error) {
      console.error("Bookmarking error:", error);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setShareSuccess(true);
    setTimeout(() => setShareSuccess(false), 3050);
  };

  const setDeadlineReminder = async () => {
    if (!currentUser) {
      router.push("/auth/login");
      return;
    }
    if (!opp) return;

    setReminderLoading(true);
    try {
      await setDoc(doc(db, "reminders", `${currentUser.uid}_${opp.id}`), {
        uid: currentUser.uid,
        opportunityId: opp.id,
        opportunityTitle: opp.title,
        deadline: opp.deadline,
        createdAt: new Date().toISOString(),
      });
      setReminderSaved(true);
    } catch (error) {
      console.error("Error setting reminder:", error);
      alert("Failed to save deadline reminder.");
    } finally {
      setReminderLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background transition-colors duration-300">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!opp) {
    return (
      <>
        <Navbar />
        <div className="max-w-xl mx-auto py-20 text-center px-4">
          <AlertCircle className="w-12 h-12 text-danger mx-auto mb-4" />
          <h2 className="text-xl font-bold text-foreground">Opportunity not found</h2>
          <p className="text-foreground-muted text-sm mt-1">
            The link may be broken or the opportunity has been archived.
          </p>
          <Link
            href="/explore"
            className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Explore
          </Link>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="flex-grow bg-background py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
        <div className="max-w-4xl mx-auto">
          {/* Back btn */}
          <Link
            href="/explore"
            className="inline-flex items-center gap-1 text-xs font-semibold text-foreground-muted hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to explore
          </Link>

          <div className="bg-surface border border-border shadow-xl dark:shadow-[0_8px_40px_rgba(255,60,110,0.08)] rounded-3xl overflow-hidden p-8 md:p-10 transition-colors duration-300">
            {/* Top Bar actions */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <span className="text-xs font-bold uppercase tracking-wider bg-primary/10 text-primary px-3.5 py-1.5 rounded-full">
                {opp.category}
              </span>

              <div className="flex gap-2">
                {/* Bookmark */}
                <button
                  onClick={toggleBookmark}
                  className={`p-2.5 rounded-xl border transition-all flex items-center gap-1.5 text-xs font-semibold ${
                    isSaved
                      ? "bg-primary/10 text-primary border-primary/20"
                      : "bg-surface-raised text-foreground-muted border-border hover:border-primary/30 hover:text-primary"
                  }`}
                >
                  {isSaved ? (
                    <><BookmarkCheck className="w-4 h-4" /> Bookmarked</>
                  ) : (
                    <><Bookmark className="w-4 h-4" /> Bookmark</>
                  )}
                </button>

                {/* Share */}
                <button
                  onClick={handleShare}
                  className="p-2.5 rounded-xl border border-border bg-surface-raised text-foreground-muted hover:border-primary/30 hover:text-primary transition-all flex items-center gap-1.5 text-xs font-semibold"
                >
                  <Share2 className="w-4 h-4" />
                  {shareSuccess ? "Copied Link!" : "Share"}
                </button>
              </div>
            </div>

            {/* Title / Org info */}
            <div className="mb-8">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground leading-tight">
                {opp.title}
              </h1>
              <p className="text-sm font-semibold text-primary mt-2">{opp.organization}</p>
            </div>

            {/* Quick Metadata highlights */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 p-6 bg-surface-raised border border-border rounded-2xl mb-8">
              <div>
                <span className="block text-[10px] uppercase font-bold text-foreground-muted tracking-wider mb-1">
                  Location
                </span>
                <span className="flex items-center gap-1 text-xs font-bold text-foreground">
                  <MapPin className="w-4 h-4 text-foreground-muted" />
                  {opp.country}
                </span>
              </div>
              <div>
                <span className="block text-[10px] uppercase font-bold text-foreground-muted tracking-wider mb-1">
                  Deadline
                </span>
                <span className="flex items-center gap-1 text-xs font-bold text-foreground">
                  <Calendar className="w-4 h-4 text-foreground-muted" />
                  {formatDeadline(opp.deadline)}
                </span>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <span className="block text-[10px] uppercase font-bold text-foreground-muted tracking-wider mb-1">
                  Target Field
                </span>
                <span className="text-xs font-bold text-foreground">{opp.field}</span>
              </div>
            </div>

            {/* Main content grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              <div className="md:col-span-2 space-y-8">
                {/* Description */}
                <div>
                  <h3 className="text-base font-bold text-foreground border-b border-border pb-2 mb-3">
                    Program Description
                  </h3>
                  <p className="text-foreground-muted text-sm leading-relaxed whitespace-pre-line">
                    {opp.description}
                  </p>
                </div>

                {/* Eligibility */}
                <div>
                  <h3 className="text-base font-bold text-foreground border-b border-border pb-2 mb-3">
                    Eligibility Criteria
                  </h3>
                  <p className="text-foreground-muted text-sm leading-relaxed whitespace-pre-line bg-surface-raised border border-border p-4 rounded-xl">
                    {opp.eligibility}
                  </p>
                </div>
              </div>

              {/* Sidebar Checklist */}
              <div className="space-y-6">
                {/* Required Documents */}
                <div className="p-6 bg-surface-raised border border-border rounded-2xl">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-foreground-muted mb-4 flex items-center gap-1.5">
                    <FileText className="w-4 h-4" /> Required Documents
                  </h4>
                  <ul className="space-y-2.5">
                    {opp.requiredDocuments.map((docName) => (
                      <li key={docName} className="flex items-start gap-2 text-xs text-foreground-muted">
                        <Check className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />
                        <span>{docName}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Reminders */}
                <div className="p-6 border border-primary/20 bg-primary/5 rounded-2xl">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-primary mb-2 flex items-center gap-1.5">
                    <Bell className="w-4 h-4 text-primary" /> Deadline Alert
                  </h4>
                  <p className="text-xs text-foreground-muted leading-relaxed mb-4">
                    Receive a priority reminder on your dashboard before applications close.
                  </p>

                  <button
                    onClick={setDeadlineReminder}
                    disabled={reminderSaved || reminderLoading}
                    className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      reminderSaved
                        ? "bg-success text-white cursor-default"
                        : "bg-primary hover:bg-primary-hover text-white shadow-sm hover:shadow-md dark:shadow-[0_4px_12px_rgba(255,60,110,0.25)] disabled:opacity-60"
                    }`}
                  >
                    {reminderLoading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : reminderSaved ? (
                      <><Check className="w-3.5 h-3.5" /> Saved Reminder</>
                    ) : (
                      "Set Reminder"
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Official Apply Footer */}
            <div className="border-t border-border mt-10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs text-foreground-muted max-w-sm text-center sm:text-left">
                Ensure you have all required documents updated on your Bloom profile before applying.
              </p>
              <a
                href={opp.applyLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-8 py-4 bg-foreground hover:opacity-90 text-background font-semibold text-sm rounded-2xl shadow-md transition-all group"
              >
                Apply On Official Site
                <ExternalLink className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
