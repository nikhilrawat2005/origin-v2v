"use client";

import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot, doc, updateDoc, addDoc, getDoc } from "firebase/firestore";
import { useState, useEffect } from "react";
import {
  Layers,
  Plus,
  ArrowRight,
  Loader2,
  Calendar,
  Building,
  CheckCircle,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import type { ApplicationEntry, ApplicationStatus } from "@/lib/types";
import { useOpportunities } from "@/hooks/useOpportunities";

export default function TrackerPage() {
  const { currentUser } = useAuth();
  const { opportunities } = useOpportunities();
  const [applications, setApplications] = useState<ApplicationEntry[]>([]);
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState("");
  const [orgName, setOrgName] = useState("");
  const [deadline, setDeadline] = useState("");
  const [notes, setNotes] = useState("");

  const stages: ApplicationStatus[] = [
    "Applied",
    "Shortlisted",
    "Interview",
    "Rejected",
    "Selected",
    "Offer Received",
  ];

  useEffect(() => {
    if (!currentUser) return;

    // 1. Fetch tracker applications
    const q = query(collection(db, "applications"), where("uid", "==", currentUser.uid));
    const unsub = onSnapshot(q, (snap) => {
      const items: ApplicationEntry[] = [];
      snap.forEach((d) => {
        items.push({ id: d.id, ...d.data() } as ApplicationEntry);
      });
      setApplications(items);
      setLoading(false);
    });

    // 2. Fetch bookmarks to offer quick-add buttons
    const getBookmarks = async () => {
      const snap = await getDoc(doc(db, "bookmarks", currentUser.uid));
      if (snap.exists()) {
        setBookmarks(snap.data().opportunityIds || []);
      }
    };
    getBookmarks();

    return () => unsub();
  }, [currentUser]);

  const handleCreateApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !title.trim() || !orgName.trim()) return;

    try {
      const newEntry = {
        uid: currentUser.uid,
        opportunityTitle: title.trim(),
        organization: orgName.trim(),
        deadline: deadline || new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
        status: "Applied" as ApplicationStatus,
        notes: notes.trim(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await addDoc(collection(db, "applications"), newEntry);

      // Reset
      setTitle("");
      setOrgName("");
      setDeadline("");
      setNotes("");
      setShowAddForm(false);
    } catch (err) {
      console.error("Create application error:", err);
    }
  };

  const addFromBookmark = async (oppId: string) => {
    if (!currentUser) return;
    const opp = opportunities.find((o) => o.id === oppId);
    if (!opp) return;

    try {
      // Check if already in applications
      if (applications.some((app) => app.opportunityTitle === opp.title)) return;

      const newEntry = {
        uid: currentUser.uid,
        opportunityTitle: opp.title,
        organization: opp.organization,
        deadline: opp.deadline,
        applyLink: opp.applyLink,
        status: "Applied" as ApplicationStatus,
        notes: "Created from bookmarks",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await addDoc(collection(db, "applications"), newEntry);
    } catch (err) {
      console.error(err);
    }
  };

  // Move columns
  const moveStatus = async (appId: string, title: string, current: ApplicationStatus, direction: "next" | "prev") => {
    if (!currentUser) return;
    const currentIndex = stages.indexOf(current);
    let nextIndex = currentIndex;

    if (direction === "next" && currentIndex < stages.length - 1) {
      nextIndex = currentIndex + 1;
    } else if (direction === "prev" && currentIndex > 0) {
      nextIndex = currentIndex - 1;
    }

    if (nextIndex === currentIndex) return;
    const nextStatus = stages[nextIndex];

    try {
      await updateDoc(doc(db, "applications", appId), {
        status: nextStatus,
        updatedAt: new Date().toISOString(),
      });

      // Seed notification for status update
      const { notifyApplicationUpdate } = await import("@/lib/automationEngine");
      await notifyApplicationUpdate(currentUser.uid, title, nextStatus);
    } catch (err) {
      console.error("Error shifting status:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-brand-purple animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-brand-navy flex items-center gap-2">
            <Layers className="w-6 h-6 text-brand-purple" /> Application Tracker
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Track and update your opportunity stages. Progress changes trigger real-time AI suggestions and status alert notifications.
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-1.5 px-5 py-3 bg-brand-purple hover:bg-brand-indigo text-white font-semibold text-xs rounded-full transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add Application
        </button>
      </div>

      {/* Quick Add bookmarks row */}
      {bookmarks.length > 0 && (
        <div className="bg-white border border-slate-100 p-4 rounded-3xl space-y-2.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Quick Import From Bookmarks</span>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {opportunities
              .filter((opp) => bookmarks.includes(opp.id))
              .map((opp) => {
                const alreadyAdded = applications.some((app) => app.opportunityTitle === opp.title);
                return (
                  <button
                    key={opp.id}
                    disabled={alreadyAdded}
                    onClick={() => addFromBookmark(opp.id)}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-xl border text-[11px] font-bold whitespace-nowrap transition-all ${
                      alreadyAdded
                        ? "bg-slate-50 border-slate-100 text-slate-400 cursor-not-allowed"
                        : "bg-white border-purple-100 text-brand-purple hover:bg-purple-50"
                    }`}
                  >
                    {opp.title.slice(0, 22)}... {alreadyAdded ? "(Added)" : "+"}
                  </button>
                );
              })}
          </div>
        </div>
      )}

      {/* Add New Application Form overlay */}
      {showAddForm && (
        <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-md max-w-xl animate-in fade-in duration-200">
          <h3 className="font-bold text-slate-800 text-sm mb-4">New Tracking Card</h3>
          <form onSubmit={handleCreateApplication} className="space-y-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Title</label>
              <input
                type="text"
                placeholder="Google Generation Scholarship"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full text-xs p-3 border border-slate-200 rounded-xl outline-none focus:border-brand-purple"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Company / Org</label>
              <input
                type="text"
                placeholder="Google"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                required
                className="w-full text-xs p-3 border border-slate-200 rounded-xl outline-none focus:border-brand-purple"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Deadline</label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full text-xs p-3 border border-slate-200 rounded-xl outline-none focus:border-brand-purple"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Notes</label>
              <input
                type="text"
                placeholder="Need to finish essay & recommendation"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full text-xs p-3 border border-slate-200 rounded-xl outline-none focus:border-brand-purple"
              />
            </div>
            <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-brand-purple text-white rounded-xl text-xs font-semibold hover:bg-brand-indigo shadow-sm"
              >
                Create Card
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Board Columns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 overflow-x-auto pb-4">
        {stages.map((stage) => {
          const filtered = applications.filter((app) => app.status === stage);

          return (
            <div key={stage} className="bg-slate-100/60 p-4 rounded-2xl flex flex-col space-y-3 min-w-[200px]">
              {/* Column Header */}
              <div className="flex items-center justify-between pb-1">
                <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">{stage}</h4>
                <span className="text-[10px] font-extrabold bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full">
                  {filtered.length}
                </span>
              </div>

              {/* Cards List */}
              <div className="flex-1 space-y-3 min-h-[300px]">
                {filtered.map((app) => (
                  <div
                    key={app.id}
                    className="p-4 bg-white border border-slate-200/60 rounded-xl shadow-sm hover:shadow-md transition-shadow space-y-2 group"
                  >
                    <div className="space-y-0.5">
                      <h5 className="font-bold text-slate-800 text-xs leading-snug">{app.opportunityTitle}</h5>
                      <p className="text-[10px] text-slate-550 flex items-center gap-1 font-semibold">
                        <Building className="w-3 h-3 text-slate-400" /> {app.organization}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 text-[9px] text-slate-500 font-semibold">
                      <Calendar className="w-3 h-3 text-slate-450" />
                      <span>{new Date(app.deadline).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>
                    </div>

                    {app.notes && (
                      <p className="text-[10px] text-slate-400 italic line-clamp-1 border-t border-slate-50 pt-1.5">
                        {app.notes}
                      </p>
                    )}

                    {/* Column controls */}
                    <div className="flex justify-between items-center pt-2 border-t border-slate-50">
                      <button
                        onClick={() => moveStatus(app.id, app.opportunityTitle, app.status, "prev")}
                        disabled={stage === "Applied"}
                        className="p-1 hover:bg-slate-50 rounded text-slate-405 hover:text-brand-purple disabled:opacity-30"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => moveStatus(app.id, app.opportunityTitle, app.status, "next")}
                        disabled={stage === "Offer Received"}
                        className="p-1 hover:bg-slate-50 rounded text-slate-405 hover:text-brand-purple disabled:opacity-30"
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}

                {filtered.length === 0 && (
                  <div className="border-2 border-dashed border-slate-200 rounded-xl py-12 text-center text-slate-400">
                    <p className="text-[10px] font-medium">Drag items here</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
