"use client";

import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, addDoc, doc, getDoc, setDoc, updateDoc, onSnapshot } from "firebase/firestore";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  Plus,
  BarChart3,
  Users,
  Eye,
  FileSpreadsheet,
  CheckCircle,
  XCircle,
  Sparkles,
  Loader2,
  Calendar,
} from "lucide-react";
import type { OrgOpportunity, OrgOpportunityStatus, OrgRequest } from "@/lib/types";

export default function OrgDashboardPage() {
  const { currentUser, profile, loading: authLoading } = useAuth();
  const router = useRouter();
  const [opportunities, setOpportunities] = useState<OrgOpportunity[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const isOrg = profile?.role === "organization" || profile?.role === "admin";

  // ── Self-service org access request state (only relevant if NOT yet org) ──
  const [orgRequest, setOrgRequest] = useState<OrgRequest | null>(null);
  const [requestLoading, setRequestLoading] = useState(true);
  const [reqOrgName, setReqOrgName] = useState("");
  const [reqWebsite, setReqWebsite] = useState("");
  const [reqDescription, setReqDescription] = useState("");
  const [reqSubmitting, setReqSubmitting] = useState(false);
  const [reqError, setReqError] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!currentUser) {
      router.push("/auth/login");
    }
  }, [currentUser, authLoading, router]);

  useEffect(() => {
    if (!currentUser || isOrg) {
      setRequestLoading(false);
      return;
    }
    getDoc(doc(db, "org_requests", currentUser.uid))
      .then((snap) => {
        if (snap.exists()) setOrgRequest(snap.data() as OrgRequest);
      })
      .catch((err) => console.error("Failed to load org request:", err))
      .finally(() => setRequestLoading(false));
  }, [currentUser, isOrg]);

  const submitOrgRequest = async () => {
    if (!currentUser) return;
    if (!reqOrgName.trim() || !reqDescription.trim()) {
      setReqError("Organization name and description are required.");
      return;
    }
    setReqError("");
    setReqSubmitting(true);
    try {
      const newRequest: OrgRequest = {
        uid: currentUser.uid,
        orgName: reqOrgName.trim(),
        website: reqWebsite.trim() || undefined,
        description: reqDescription.trim(),
        requesterName: profile?.name || currentUser.displayName || "Unknown",
        requesterEmail: currentUser.email || "",
        status: "pending",
        createdAt: new Date().toISOString(),
      };
      await setDoc(doc(db, "org_requests", currentUser.uid), newRequest);
      setOrgRequest(newRequest);
    } catch (err) {
      console.error(err);
      setReqError("Something went wrong submitting your request. Please try again.");
    } finally {
      setReqSubmitting(false);
    }
  };

  // Form states
  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [eligibility, setEligibility] = useState("");
  const [deadline, setDeadline] = useState("");
  const [category, setCategory] = useState("Scholarships");
  const [field, setField] = useState("");
  const [applyLink, setApplyLink] = useState("");

  useEffect(() => {
    if (!currentUser || !isOrg) {
      setLoading(false);
      return;
    }

    // Fetch organization posted opportunities
    const oppQuery = query(collection(db, "org_opportunities"), where("postedByUid", "==", currentUser.uid));
    const unsubOpp = onSnapshot(oppQuery, (snap) => {
      const items: OrgOpportunity[] = [];
      snap.forEach((d) => {
        items.push({ id: d.id, ...d.data() } as OrgOpportunity);
      });
      setOpportunities(items);
      setLoading(false);
    });

    // Fetch candidate submissions / mock applications submitted to this org
    const loadSubmissions = async () => {
      const q = query(collection(db, "applications"), where("organization", "==", profile?.name || "Bloom Partner"));
      const snap = await getDocs(q);
      const list: any[] = [];
      snap.forEach((d) => {
        list.push({ id: d.id, ...d.data() });
      });
      setApplications(list);
    };
    loadSubmissions();

    return () => unsubOpp();
  }, [currentUser, profile, isOrg]);

  const handlePostOpportunity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !title.trim() || !desc.trim()) return;

    try {
      const newOpp = {
        postedByUid: currentUser.uid,
        orgName: profile?.name || "Global Women Foundation",
        title: title.trim(),
        description: desc.trim(),
        eligibility: eligibility.trim(),
        deadline: deadline || new Date(Date.now() + 45 * 86400000).toISOString().split("T")[0],
        country: "Global",
        category,
        field: field.trim() || "STEM",
        applyLink: applyLink.trim() || "https://bloom-platform.org/apply",
        requiredDocuments: ["Resume", "Certificate"],
        status: "pending" as OrgOpportunityStatus,
        applicationCount: 0,
        viewCount: 0, // real count, incremented on each opportunity detail page view
        source: "organization",
        createdAt: new Date().toISOString(),
      };

      await addDoc(collection(db, "org_opportunities"), newOpp);

      // Reset
      setTitle("");
      setDesc("");
      setEligibility("");
      setDeadline("");
      setField("");
      setApplyLink("");
      setShowAddForm(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleShortlistCandidate = async (appId: string, status: "Shortlisted" | "Rejected") => {
    try {
      await updateDoc(doc(db, "applications", appId), {
        status,
        updatedAt: new Date().toISOString(),
      });
      setApplications((prev) =>
        prev.map((app) => (app.id === appId ? { ...app, status } : app))
      );
      alert(`Candidate has been successfully: ${status}! 🌸`);
    } catch (err) {
      console.error(err);
    }
  };

  if (authLoading || !currentUser) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  // Not yet an organization: show the self-service access request flow
  // instead of the org dashboard (and instead of redirecting away).
  if (!isOrg) {
    if (requestLoading) {
      return (
        <div className="min-h-[50vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      );
    }

    if (orgRequest?.status === "pending") {
      return (
        <div className="max-w-lg mx-auto text-center py-20 space-y-4">
          <div className="w-14 h-14 bg-amber-500/10 text-amber-500 rounded-2xl flex items-center justify-center mx-auto">
            <Building2 className="w-7 h-7" />
          </div>
          <h1 className="text-xl font-extrabold text-foreground">Request under review</h1>
          <p className="text-sm text-foreground-muted">
            Your request to register <strong>{orgRequest.orgName}</strong> as an organization
            partner is pending admin approval. You'll get organization dashboard access as soon
            as it's approved.
          </p>
        </div>
      );
    }

    if (orgRequest?.status === "rejected") {
      return (
        <div className="max-w-lg mx-auto text-center py-20 space-y-4">
          <div className="w-14 h-14 bg-red-500/10 text-red-500 rounded-2xl flex items-center justify-center mx-auto">
            <XCircle className="w-7 h-7" />
          </div>
          <h1 className="text-xl font-extrabold text-foreground">Request not approved</h1>
          <p className="text-sm text-foreground-muted">
            Your request for <strong>{orgRequest.orgName}</strong> wasn't approved. If you believe
            this was a mistake, you can submit a new request below.
          </p>
          <button
            onClick={() => setOrgRequest(null)}
            className="mt-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-2xl text-xs font-bold transition-all"
          >
            Submit a new request
          </button>
        </div>
      );
    }

    // No request yet — show the form
    return (
      <div className="max-w-lg mx-auto py-14">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-7 h-7" />
          </div>
          <h1 className="text-xl font-extrabold text-foreground">Become an organization partner</h1>
          <p className="text-sm text-foreground-muted mt-2">
            Post scholarships, fellowships, internships, or programs directly to Bloom. An admin
            will review your request before you get posting access.
          </p>
        </div>

        <div className="bg-surface border border-border p-6 rounded-3xl shadow-sm space-y-4">
          {reqError && (
            <div className="text-xs bg-red-500/10 text-red-600 p-3 rounded-xl border border-red-500/20">
              {reqError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-foreground-muted mb-1.5">
              Organization Name
            </label>
            <input
              type="text"
              value={reqOrgName}
              onChange={(e) => setReqOrgName(e.target.value)}
              placeholder="e.g. AnitaB.org India"
              className="w-full text-sm px-4 py-3 bg-surface-raised border border-border rounded-2xl outline-none focus:border-primary text-foreground placeholder-foreground-muted"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-foreground-muted mb-1.5">
              Website (optional)
            </label>
            <input
              type="text"
              value={reqWebsite}
              onChange={(e) => setReqWebsite(e.target.value)}
              placeholder="https://..."
              className="w-full text-sm px-4 py-3 bg-surface-raised border border-border rounded-2xl outline-none focus:border-primary text-foreground placeholder-foreground-muted"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-foreground-muted mb-1.5">
              Tell us about your organization
            </label>
            <textarea
              value={reqDescription}
              onChange={(e) => setReqDescription(e.target.value)}
              rows={4}
              placeholder="What does your organization do, and what kind of opportunities do you want to post?"
              className="w-full text-sm px-4 py-3 bg-surface-raised border border-border rounded-2xl outline-none focus:border-primary text-foreground placeholder-foreground-muted resize-none"
            />
          </div>

          <button
            onClick={submitOrgRequest}
            disabled={reqSubmitting}
            className="w-full bg-primary hover:bg-primary/90 text-white font-bold text-sm py-3.5 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {reqSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Submit Request"}
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  // Analytics summary
  const totalViews = opportunities.reduce((acc, curr) => acc + curr.viewCount, 0);
  const totalSubmissions = applications.length;
  const conversionRate = totalViews > 0 ? ((totalSubmissions / totalViews) * 100).toFixed(1) : 0;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground flex items-center gap-2">
            <Building2 className="w-6 h-6 text-primary" /> Organization Hub
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Post opportunities, check candidate analytics, and shortlist candidates from submissions.
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-primary hover:bg-primary-hover text-white font-semibold text-xs rounded-xl shadow-sm transition-all"
        >
          <Plus className="w-3.5 h-3.5" /> Post Opportunity
        </button>
      </div>

      {/* Analytics Dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
            <Eye className="w-6 h-6" />
          </div>
          <div>
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Opportunity Views</span>
            <span className="text-xl font-extrabold text-slate-800">{totalViews} views</span>
          </div>
        </div>

        <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm flex items-center gap-4">
          <div className="p-3 bg-primary/10 text-primary rounded-2xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Applicants</span>
            <span className="text-xl font-extrabold text-slate-800">{totalSubmissions} applied</span>
          </div>
        </div>

        <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Conversion Ratio</span>
            <span className="text-xl font-extrabold text-slate-800">{conversionRate}% match</span>
          </div>
        </div>
      </div>

      {/* Add form */}
      {showAddForm && (
        <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm animate-in fade-in duration-200">
          <h3 className="font-bold text-slate-800 text-sm mb-4 flex items-center gap-1">
            <Sparkles className="w-4 h-4 text-primary" /> Publish Opportunity Program
          </h3>
          <form onSubmit={handlePostOpportunity} className="space-y-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Program Title</label>
              <input
                type="text"
                placeholder="Google Generation Scholarship"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full text-xs p-3 border border-slate-200 rounded-xl outline-none focus:border-primary"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Field of study</label>
              <input
                type="text"
                placeholder="e.g. Computer Science, Aerospace"
                value={field}
                onChange={(e) => setField(e.target.value)}
                className="w-full text-xs p-3 border border-slate-200 rounded-xl outline-none focus:border-primary"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Deadline</label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full text-xs p-3 border border-slate-200 rounded-xl outline-none focus:border-primary"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Opportunity Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full text-xs p-3 border border-slate-200 rounded-xl outline-none bg-white focus:border-primary"
              >
                <option value="Scholarships">Scholarships</option>
                <option value="Internships">Internships</option>
                <option value="Hackathons">Hackathons</option>
                <option value="Competitions">Competitions</option>
                <option value="Research Programs">Research Programs</option>
                <option value="Conferences">Conferences</option>
                <option value="Fellowships">Fellowships</option>
              </select>
            </div>
            <div className="space-y-1 sm:col-span-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Program Description</label>
              <textarea
                rows={3}
                placeholder="Details of the opportunity..."
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                required
                className="w-full text-xs p-3 border border-slate-200 rounded-xl outline-none focus:border-primary"
              ></textarea>
            </div>
            <div className="space-y-1 sm:col-span-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Eligibility criteria</label>
              <input
                type="text"
                placeholder="e.g. Open to female students enrolled in Bachelor's program."
                value={eligibility}
                onChange={(e) => setEligibility(e.target.value)}
                className="w-full text-xs p-3 border border-slate-200 rounded-xl outline-none focus:border-primary"
              />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Application Link</label>
              <input
                type="url"
                placeholder="https://company.com/careers"
                value={applyLink}
                onChange={(e) => setApplyLink(e.target.value)}
                className="w-full text-xs p-3 border border-slate-200 rounded-xl outline-none focus:border-primary"
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
                className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-semibold hover:bg-primary-hover shadow-sm"
              >
                Publish Program
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Main grids: Published list & Candidate Applications */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Published opportunities */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="font-extrabold text-slate-800 text-base flex items-center gap-1.5">
            <FileSpreadsheet className="w-5 h-5 text-primary" /> Published Opportunities ({opportunities.length})
          </h3>

          <div className="space-y-4">
            {opportunities.map((opp) => (
              <div
                key={opp.id}
                className="bg-white border border-slate-100 p-5 rounded-3xl shadow-sm space-y-3"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="text-[9px] font-bold uppercase tracking-wider bg-primary/10 text-primary px-2 py-0.5 rounded">
                      {opp.category}
                    </span>
                    <h4 className="font-bold text-slate-800 text-sm mt-2">{opp.title}</h4>
                    <p className="text-[10px] text-slate-500 font-semibold uppercase mt-0.5">
                      Views: {opp.viewCount} • Applicants: {opp.applicationCount}
                    </p>
                  </div>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase ${
                    opp.status === "approved"
                      ? "bg-emerald-50 text-emerald-650"
                      : opp.status === "rejected"
                      ? "bg-red-50 text-red-650"
                      : "bg-amber-50 text-amber-650"
                  }`}>
                    {opp.status}
                  </span>
                </div>
                <p className="text-slate-600 text-xs leading-relaxed line-clamp-2">{opp.description}</p>
              </div>
            ))}

            {opportunities.length === 0 && (
              <div className="text-center py-16 bg-white border border-slate-100 rounded-3xl">
                <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                <h4 className="font-bold text-slate-805 text-sm">No published programs yet</h4>
                <p className="text-slate-500 text-xs mt-1">
                  Click the Post Opportunity button to publish women-focused scholarships or hackathons.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Candidate evaluation tracker */}
        <div className="space-y-6">
          <h3 className="font-extrabold text-slate-800 text-base flex items-center gap-1.5">
            <Users className="w-5 h-5 text-primary" /> Review Submissions
          </h3>

          <div className="space-y-4 max-h-[460px] overflow-y-auto pr-1">
            {applications.map((app) => (
              <div key={app.id} className="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm space-y-3">
                <div className="space-y-0.5">
                  <span className="text-[8px] font-bold text-slate-400 uppercase">Program Applied</span>
                  <h5 className="font-bold text-slate-800 text-xs leading-snug">{app.opportunityTitle}</h5>
                  <p className="text-[9px] text-slate-500 font-semibold">Candidate UID: {app.uid.slice(0, 10)}...</p>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-slate-50 gap-2">
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                    app.status === "Shortlisted"
                      ? "bg-primary/10 text-primary"
                      : app.status === "Rejected"
                      ? "bg-red-50 text-red-650"
                      : "bg-slate-50 text-slate-500"
                  }`}>
                    {app.status}
                  </span>
                  {app.status === "Applied" && (
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleShortlistCandidate(app.id, "Shortlisted")}
                        className="p-1 hover:bg-primary/10 rounded text-primary"
                        title="Shortlist Candidate"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleShortlistCandidate(app.id, "Rejected")}
                        className="p-1 hover:bg-red-50 rounded text-red-500"
                        title="Reject Candidate"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {applications.length === 0 && (
              <div className="text-center py-12 bg-white border border-slate-100 rounded-3xl">
                <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <h5 className="font-bold text-slate-700 text-xs">No candidate applications</h5>
                <p className="text-slate-500 text-[10px] mt-1">
                  Once users submit applications targeting your programs, they will appear here.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
