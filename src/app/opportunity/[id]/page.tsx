"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { mockOpportunities, Opportunity } from "@/lib/mockData";
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
  addDoc
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
  
  const [opp, setOpp] = useState<Opportunity | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);
  const [reminderSaved, setReminderSaved] = useState(false);
  const [reminderLoading, setReminderLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load opportunity & bookmark status
  useEffect(() => {
    const fetchOpp = async () => {
      const match = mockOpportunities.find((o) => o.id === id);
      if (!match) {
        setLoading(false);
        return;
      }
      setOpp(match);

      if (currentUser) {
        // Bookmarks fetch
        const snap = await getDoc(doc(db, "bookmarks", currentUser.uid));
        if (snap.exists()) {
          const ids = snap.data().opportunityIds || [];
          setIsSaved(ids.includes(id));
        }

        // Reminders fetch to check if set
        const remSnap = await getDoc(doc(db, "reminders", `${currentUser.uid}_${id}`));
        if (remSnap.exists()) {
          setReminderSaved(true);
        }
      }
      setLoading(false);
    };
    fetchOpp();
  }, [id, currentUser]);

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
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 text-brand-purple animate-spin" />
      </div>
    );
  }

  if (!opp) {
    return (
      <>
        <Navbar />
        <div className="max-w-xl mx-auto py-20 text-center px-4">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-800">Opportunity not found</h2>
          <p className="text-slate-500 text-sm mt-1">
            The link may be broken or the opportunity has been archived.
          </p>
          <Link
            href="/explore"
            className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-purple hover:underline"
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

      <main className="flex-grow bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Back btn */}
          <Link
            href="/explore"
            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-900 mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to explore
          </Link>

          <div className="bg-white border border-slate-100 shadow-xl rounded-3xl overflow-hidden p-8 md:p-10">
            {/* Top Bar actions */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <span className="text-xs font-bold uppercase tracking-wider bg-brand-purple/10 text-brand-purple px-3.5 py-1.5 rounded-full">
                {opp.category}
              </span>

              <div className="flex gap-2">
                {/* Bookmark */}
                <button
                  onClick={toggleBookmark}
                  className={`p-2.5 rounded-xl border transition-all flex items-center gap-1.5 text-xs font-semibold ${
                    isSaved
                      ? "bg-brand-purple/10 text-brand-purple border-brand-purple/20"
                      : "bg-white text-slate-500 border-slate-200 hover:border-slate-350"
                  }`}
                >
                  {isSaved ? (
                    <>
                      <BookmarkCheck className="w-4 h-4" /> Bookmarked
                    </>
                  ) : (
                    <>
                      <Bookmark className="w-4 h-4" /> Bookmark
                    </>
                  )}
                </button>

                {/* Share */}
                <button
                  onClick={handleShare}
                  className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-500 hover:border-slate-350 transition-all flex items-center gap-1.5 text-xs font-semibold"
                >
                  <Share2 className="w-4 h-4" />
                  {shareSuccess ? "Copied Link!" : "Share"}
                </button>
              </div>
            </div>

            {/* Title / Org info */}
            <div className="mb-8">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-navy leading-tight">
                {opp.title}
              </h1>
              <p className="text-sm font-semibold text-brand-purple mt-2">{opp.organization}</p>
            </div>

            {/* Quick Metadata highlights */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 p-6 bg-slate-50 border border-slate-100 rounded-2xl mb-8">
              <div>
                <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">
                  Location
                </span>
                <span className="flex items-center gap-1 text-xs font-bold text-slate-700">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  {opp.country}
                </span>
              </div>
              <div>
                <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">
                  Deadline
                </span>
                <span className="flex items-center gap-1 text-xs font-bold text-slate-700">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  {new Date(opp.deadline).toLocaleDateString(undefined, {
                    month: "long",
                    day: "numeric",
                    year: "numeric"
                  })}
                </span>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">
                  Target Field
                </span>
                <span className="text-xs font-bold text-slate-700">{opp.field}</span>
              </div>
            </div>

            {/* Main content grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              <div className="md:col-span-2 space-y-8">
                {/* Description */}
                <div>
                  <h3 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-2 mb-3">
                    Program Description
                  </h3>
                  <p className="text-slate-650 text-sm leading-relaxed whitespace-pre-line">
                    {opp.description}
                  </p>
                </div>

                {/* Eligibility */}
                <div>
                  <h3 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-2 mb-3">
                    Eligibility Criteria
                  </h3>
                  <p className="text-slate-650 text-sm leading-relaxed whitespace-pre-line bg-slate-50 border border-slate-100 p-4 rounded-xl">
                    {opp.eligibility}
                  </p>
                </div>
              </div>

              {/* Sidebar Checklist */}
              <div className="space-y-6">
                {/* Required Documents */}
                <div className="p-6 bg-slate-50 border border-slate-100 rounded-2xl">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-slate-400" /> Required Documents
                  </h4>
                  <ul className="space-y-2.5">
                    {opp.requiredDocuments.map((docName) => (
                      <li key={docName} className="flex items-start gap-2 text-xs text-slate-600">
                        <Check className="w-3.5 h-3.5 text-brand-purple mt-0.5" />
                        <span>{docName}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Reminders triggering */}
                <div className="p-6 border border-brand-purple/10 bg-brand-purple/5 rounded-2xl">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-brand-purple mb-2 flex items-center gap-1.5">
                    <Bell className="w-4 h-4 text-brand-purple" /> Deadline Alert
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed mb-4">
                    Receive a priority reminder on your dashboard before applications close.
                  </p>

                  <button
                    onClick={setDeadlineReminder}
                    disabled={reminderSaved || reminderLoading}
                    className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      reminderSaved
                        ? "bg-green-600 text-white cursor-default"
                        : "bg-brand-purple hover:bg-brand-indigo text-white shadow-sm hover:shadow-md disabled:opacity-60"
                    }`}
                  >
                    {reminderLoading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : reminderSaved ? (
                      <>
                        <Check className="w-3.5 h-3.5" /> Saved Reminder
                      </>
                    ) : (
                      "Set Reminder"
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Official Apply Footer */}
            <div className="border-t border-slate-100 mt-10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs text-slate-500 max-w-sm text-center sm:text-left">
                Ensure you have all required documents updated on your Aura profile before applying.
              </p>
              <a
                href={opp.applyLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-8 py-4 bg-brand-navy hover:bg-slate-800 text-white font-semibold text-sm rounded-2xl shadow-md transition-all group"
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
