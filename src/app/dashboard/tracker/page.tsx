"use client";

import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot, doc, updateDoc, addDoc, getDoc } from "firebase/firestore";
import { useState, useEffect, useRef } from "react";
import {
  Layers,
  Plus,
  Loader2,
  Calendar,
  Building,
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  X,
  FileText,
  ExternalLink,
} from "lucide-react";
import type { ApplicationEntry, ApplicationStatus } from "@/lib/types";
import { useOpportunities } from "@/hooks/useOpportunities";
import { motion, AnimatePresence, type Variants } from "framer-motion";

/* ── Animation Variants ─────────────────────────────────────── */
const pageVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.04 } },
};

const headerVariants: Variants = {
  hidden: { opacity: 0, y: -12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.36, ease: "easeOut" } },
};

const columnVariants: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.4, delay: i * 0.06, ease: [0.23, 1, 0.32, 1] },
  }),
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 12, scale: 0.96 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.28, ease: "easeOut" } },
  exit: { opacity: 0, x: 20, scale: 0.94, transition: { duration: 0.22 } },
};

const formVariants: Variants = {
  hidden: { opacity: 0, height: 0, y: -10 },
  show: { opacity: 1, height: "auto", y: 0, transition: { duration: 0.36, ease: [0.23, 1, 0.32, 1] } },
  exit: { opacity: 0, height: 0, y: -10, transition: { duration: 0.22 } },
};

/* ── Count-up component ─────────────────────────────────────── */
function CountUp({ to }: { to: number }) {
  const [value, setValue] = useState(to);
  const prevRef = useRef(to);

  useEffect(() => {
    const from = prevRef.current;
    prevRef.current = to;
    if (from === to) return;

    const start = performance.now();
    const duration = 500;
    const frame = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(from + (to - from) * eased));
      if (progress < 1) requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  }, [to]);

  return <>{value}</>;
}

/* ── Status color map ───────────────────────────────────────── */
const STATUS_COLORS: Record<ApplicationStatus, string> = {
  Applied: "bg-secondary/10 text-secondary border-secondary/20",
  Shortlisted: "bg-accent-gold-surface text-accent-gold border-accent-gold/20",
  Interview: "bg-primary/10 text-primary border-primary/20",
  Rejected: "bg-danger-surface text-danger border-danger/20",
  Selected: "bg-success-surface text-success border-success/20",
  "Offer Received": "bg-success-surface text-success border-success/20",
};

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
  const [applyLink, setApplyLink] = useState("");
  const [notes, setNotes] = useState("");

  // Card detail modal
  const [selectedApp, setSelectedApp] = useState<ApplicationEntry | null>(null);

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

    const q = query(collection(db, "applications"), where("uid", "==", currentUser.uid));
    const unsub = onSnapshot(q, (snap) => {
      const items: ApplicationEntry[] = [];
      snap.forEach((d) => {
        items.push({ id: d.id, ...d.data() } as ApplicationEntry);
      });
      setApplications(items);
      setLoading(false);
    });

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
        applyLink: applyLink.trim() || null,
        status: "Applied" as ApplicationStatus,
        notes: notes.trim(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await addDoc(collection(db, "applications"), newEntry);
      setTitle("");
      setOrgName("");
      setDeadline("");
      setApplyLink("");
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

  const moveStatus = async (
    appId: string,
    title: string,
    current: ApplicationStatus,
    direction: "next" | "prev"
  ) => {
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
    } catch (err) {
      console.error("Error shifting status:", err);
    }
  };

  /* ── Loading ──────────────────────────────────────────────── */
  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 0.9, ease: "linear" }}
        >
          <Loader2 className="w-8 h-8 text-primary" />
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      className="max-w-7xl mx-auto space-y-8"
      variants={pageVariants}
      initial="hidden"
      animate="show"
    >
      {/* Header */}
      <motion.div
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
        variants={headerVariants}
      >
        <div>
          <h1 className="text-2xl font-extrabold text-foreground flex items-center gap-2">
            <Layers className="w-6 h-6 text-primary" /> Application Tracker
          </h1>
          <p className="text-foreground-muted text-sm mt-1">
            Track and update your opportunity stages. Progress changes trigger real-time AI suggestions and status alert notifications.
          </p>
        </div>

        <motion.button
          onClick={() => setShowAddForm(!showAddForm)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 380, damping: 18 }}
          className="flex items-center gap-1.5 px-5 py-3 bg-primary hover:bg-primary-hover text-primary-foreground font-semibold text-xs rounded-full transition-all shadow-sm"
        >
          <motion.span
            animate={{ rotate: showAddForm ? 45 : 0 }}
            transition={{ duration: 0.25 }}
          >
            <Plus className="w-4 h-4" />
          </motion.span>
          {showAddForm ? "Cancel" : "Add Application"}
        </motion.button>
      </motion.div>

      {/* Quick import from bookmarks */}
      {bookmarks.length > 0 && (
        <motion.div
          variants={headerVariants}
          className="bg-surface border border-border p-4 rounded-3xl space-y-2.5"
        >
          <span className="text-[10px] font-bold text-foreground-muted uppercase tracking-wider">
            Quick Import From Bookmarks
          </span>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {opportunities
              .filter((opp) => bookmarks.includes(opp.id))
              .map((opp) => {
                const alreadyAdded = applications.some(
                  (app) => app.opportunityTitle === opp.title
                );
                return (
                  <motion.button
                    key={opp.id}
                    disabled={alreadyAdded}
                    onClick={() => addFromBookmark(opp.id)}
                    whileHover={!alreadyAdded ? { scale: 1.04 } : {}}
                    whileTap={!alreadyAdded ? { scale: 0.95 } : {}}
                    transition={{ type: "spring", stiffness: 400, damping: 18 }}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-xl border text-[11px] font-bold whitespace-nowrap transition-all ${
                      alreadyAdded
                        ? "bg-surface-raised border-border text-foreground-muted cursor-not-allowed"
                        : "bg-surface border-border text-primary hover:bg-primary/10"
                    }`}
                  >
                    {opp.title.slice(0, 22)}… {alreadyAdded ? "(Added)" : "+"}
                  </motion.button>
                );
              })}
          </div>
        </motion.div>
      )}

      {/* Add Form — AnimatePresence */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            key="add-form"
            variants={formVariants}
            initial="hidden"
            animate="show"
            exit="exit"
            className="overflow-hidden"
          >
            <div className="bg-surface border border-border p-6 rounded-3xl shadow-md max-w-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-foreground text-sm">New Tracking Card</h3>
                <motion.button
                  onClick={() => setShowAddForm(false)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-1 rounded-lg hover:bg-surface-raised text-foreground-muted"
                >
                  <X className="w-4 h-4" />
                </motion.button>
              </div>
              <form onSubmit={handleCreateApplication} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-foreground-muted uppercase tracking-wider">
                    Title
                  </label>
                  <input
                    type="text"
                    placeholder="Google Generation Scholarship"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="w-full text-xs p-3 border border-border rounded-xl outline-none focus:border-primary bg-background text-foreground placeholder:text-foreground-muted transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-foreground-muted uppercase tracking-wider">
                    Company / Org
                  </label>
                  <input
                    type="text"
                    placeholder="Google"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    required
                    className="w-full text-xs p-3 border border-border rounded-xl outline-none focus:border-primary bg-background text-foreground placeholder:text-foreground-muted transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-foreground-muted uppercase tracking-wider">
                    Deadline
                  </label>
                  <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full text-xs p-3 border border-border rounded-xl outline-none focus:border-primary bg-background text-foreground transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-foreground-muted uppercase tracking-wider">
                    Apply Link (Optional)
                  </label>
                  <input
                    type="url"
                    placeholder="https://careers.google.com"
                    value={applyLink}
                    onChange={(e) => setApplyLink(e.target.value)}
                    className="w-full text-xs p-3 border border-border rounded-xl outline-none focus:border-primary bg-background text-foreground placeholder:text-foreground-muted transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-foreground-muted uppercase tracking-wider">
                    Notes
                  </label>
                  <input
                    type="text"
                    placeholder="Need to finish essay & recommendation"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full text-xs p-3 border border-border rounded-xl outline-none focus:border-primary bg-background text-foreground placeholder:text-foreground-muted transition-all"
                  />
                </div>
                <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-4 py-2 border border-border text-foreground-muted rounded-xl text-xs font-semibold hover:bg-surface-raised transition-all"
                  >
                    Cancel
                  </button>
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    transition={{ type: "spring", stiffness: 380, damping: 18 }}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-xs font-semibold hover:bg-primary-hover shadow-sm transition-all"
                  >
                    Create Card
                  </motion.button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Board Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 overflow-x-auto pb-4">
        {stages.map((stage, stageIdx) => {
          const filtered = applications.filter((app) => app.status === stage);

          return (
            <motion.div
              key={stage}
              custom={stageIdx}
              variants={columnVariants}
              className="bg-surface-raised border border-border p-4 rounded-2xl flex flex-col space-y-3 min-w-[200px]"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-1">
                <h4 className="text-xs font-extrabold text-foreground uppercase tracking-wider">
                  {stage}
                </h4>
                <motion.span
                  layout
                  className="text-[10px] font-extrabold bg-background text-foreground-muted px-2 py-0.5 rounded-full border border-border"
                >
                  <CountUp to={filtered.length} />
                </motion.span>
              </div>

              {/* Cards List */}
              <div className="flex-1 space-y-3 min-h-[300px]">
                <AnimatePresence mode="popLayout">
                  {filtered.map((app) => (
                    <motion.div
                      key={app.id}
                      layout
                      variants={cardVariants}
                      initial="hidden"
                      animate="show"
                      exit="exit"
                      whileHover={{
                        boxShadow:
                          "0 0 0 1px rgba(255,92,134,0.2), 0 8px 24px rgba(255,60,110,0.12)",
                        y: -2,
                      }}
                      transition={{ layout: { type: "spring", stiffness: 300, damping: 26 } }}
                      className="p-4 bg-surface border border-border rounded-xl shadow-sm space-y-2 group cursor-pointer"
                      onClick={() => setSelectedApp(app)}
                    >
                      <div className="space-y-0.5">
                        <h5 className="font-bold text-foreground text-xs leading-snug line-clamp-2">
                          {app.opportunityTitle}
                        </h5>
                        <p className="text-[10px] text-foreground-muted flex items-center gap-1 font-semibold">
                          <Building className="w-3 h-3 flex-shrink-0" /> {app.organization}
                        </p>
                      </div>

                      {/* Status badge */}
                      <span
                        className={`inline-flex items-center text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                          STATUS_COLORS[app.status] ?? "bg-surface-raised text-foreground-muted border-border"
                        }`}
                      >
                        {app.status}
                      </span>

                      <div className="flex items-center gap-1 text-[9px] text-foreground-muted font-semibold">
                        <Calendar className="w-3 h-3" />
                        <span>
                          {new Date(app.deadline).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </div>

                      {app.notes && (
                        <p className="text-[10px] text-foreground-muted italic line-clamp-1 border-t border-border pt-1.5">
                          {app.notes}
                        </p>
                      )}

                      {/* Column controls — stop propagation so click doesn't open modal */}
                      <div
                        className="flex justify-between items-center pt-2 border-t border-border"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <motion.button
                          onClick={(e) => {
                            e.stopPropagation();
                            moveStatus(app.id, app.opportunityTitle, app.status, "prev");
                          }}
                          disabled={stage === "Applied"}
                          whileHover={stage !== "Applied" ? { scale: 1.15 } : {}}
                          whileTap={stage !== "Applied" ? { scale: 0.85 } : {}}
                          transition={{ type: "spring", stiffness: 400, damping: 18 }}
                          className="p-1 hover:bg-surface-raised rounded text-foreground-muted hover:text-primary disabled:opacity-30 transition-all"
                          title="Move to previous stage"
                        >
                          <ChevronLeft className="w-3.5 h-3.5" />
                        </motion.button>
                        <span className="text-[8px] text-foreground-muted font-medium">tap card for details</span>
                        <motion.button
                          onClick={(e) => {
                            e.stopPropagation();
                            moveStatus(app.id, app.opportunityTitle, app.status, "next");
                          }}
                          disabled={stage === "Offer Received"}
                          whileHover={stage !== "Offer Received" ? { scale: 1.15 } : {}}
                          whileTap={stage !== "Offer Received" ? { scale: 0.85 } : {}}
                          transition={{ type: "spring", stiffness: 400, damping: 18 }}
                          className="p-1 hover:bg-surface-raised rounded text-foreground-muted hover:text-primary disabled:opacity-30 transition-all"
                          title="Move to next stage"
                        >
                          <ChevronRight className="w-3.5 h-3.5" />
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}

                  {filtered.length === 0 && (
                    <motion.div
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="border-2 border-dashed border-border rounded-xl py-12 text-center text-foreground-muted"
                    >
                      <p className="text-[10px] font-medium">Drop items here</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ── Card Detail Modal ──────────────────────────────── */}
      <AnimatePresence>
        {selectedApp && (
          <motion.div
            key="modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setSelectedApp(null)}
          >
            <motion.div
              key="modal-panel"
              initial={{ opacity: 0, scale: 0.92, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 24 }}
              transition={{ type: "spring", stiffness: 320, damping: 26 }}
              className="bg-surface border border-border rounded-3xl shadow-2xl w-full max-w-md p-6 space-y-5"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span
                    className={`inline-flex items-center text-[9px] font-bold px-2 py-0.5 rounded-full border mb-2 ${
                      STATUS_COLORS[selectedApp.status] ?? "bg-surface-raised text-foreground-muted border-border"
                    }`}
                  >
                    {selectedApp.status}
                  </span>
                  <h3 className="font-extrabold text-foreground text-base leading-snug">
                    {selectedApp.opportunityTitle}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedApp(null)}
                  className="p-1.5 rounded-xl hover:bg-surface-raised text-foreground-muted flex-shrink-0 transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Details */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-surface-raised rounded-2xl">
                  <Building className="w-4 h-4 text-primary flex-shrink-0" />
                  <div>
                    <p className="text-[9px] font-bold text-foreground-muted uppercase tracking-wider">Organisation</p>
                    <p className="text-xs font-semibold text-foreground">{selectedApp.organization}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-surface-raised rounded-2xl">
                  <Calendar className="w-4 h-4 text-primary flex-shrink-0" />
                  <div>
                    <p className="text-[9px] font-bold text-foreground-muted uppercase tracking-wider">Deadline</p>
                    <p className="text-xs font-semibold text-foreground">
                      {new Date(selectedApp.deadline).toLocaleDateString(undefined, {
                        weekday: "short",
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>

                {selectedApp.notes && (
                  <div className="flex items-start gap-3 p-3 bg-surface-raised rounded-2xl">
                    <FileText className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[9px] font-bold text-foreground-muted uppercase tracking-wider">Notes</p>
                      <p className="text-xs text-foreground leading-relaxed">{selectedApp.notes}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3 p-3 bg-surface-raised rounded-2xl">
                  <Layers className="w-4 h-4 text-primary flex-shrink-0" />
                  <div>
                    <p className="text-[9px] font-bold text-foreground-muted uppercase tracking-wider">Added On</p>
                    <p className="text-xs font-semibold text-foreground">
                      {new Date(selectedApp.createdAt).toLocaleDateString(undefined, {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2 border-t border-border">
                {selectedApp.applyLink && (
                  <a
                    href={selectedApp.applyLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-primary hover:bg-primary-hover text-primary-foreground font-semibold text-xs rounded-2xl shadow-sm transition-all"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Apply Now
                  </a>
                )}
                <button
                  onClick={() => setSelectedApp(null)}
                  className="flex-1 px-4 py-2.5 border border-border text-foreground-muted hover:bg-surface-raised font-semibold text-xs rounded-2xl transition-all"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
