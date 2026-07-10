"use client";

import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, getDocs, updateDoc, doc, getDoc, onSnapshot } from "firebase/firestore";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { isAllowedAdminEmail } from "@/lib/adminConfig";
import {
  ShieldCheck,
  Building,
  Users,
  FileText,
  MessageSquare,
  CheckCircle,
  XCircle,
  FileSpreadsheet,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import type { OrgOpportunity, AdminStats, OrgRequest } from "@/lib/types";

export default function AdminPage() {
  const { currentUser, profile, loading: authLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalOpportunities: 0,
    orgPostedCount: 0,
    seededCount: 0,
    totalApplications: 0,
    totalCommunityPosts: 0,
  });
  const [orgOpps, setOrgOpps] = useState<OrgOpportunity[]>([]);
  const [orgRequests, setOrgRequests] = useState<OrgRequest[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!currentUser || !isAllowedAdminEmail(currentUser.email)) {
      router.push("/dashboard");
    }
  }, [currentUser, authLoading, router]);

  useEffect(() => {
    if (!currentUser) return;
    if (!isAllowedAdminEmail(currentUser.email)) return;

    // Load admin panel dashboard data
    const loadAdminData = async () => {
      try {
        // 1. Fetch Users
        const userSnap = await getDocs(collection(db, "users"));
        const users: any[] = [];
        userSnap.forEach((u) => users.push({ id: u.id, ...u.data() }));
        setUsersList(users);

        // 2. Fetch community posts
        const postSnap = await getDocs(collection(db, "community_posts"));
        let postCount = 0;
        postSnap.forEach(() => postCount++);

        // 3. Fetch applications
        const appSnap = await getDocs(collection(db, "applications"));
        let appCount = 0;
        appSnap.forEach(() => appCount++);

        // 4. Fetch Org Opportunities (for moderation)
        const orgOppQuery = query(collection(db, "org_opportunities"));
        const unsubOrgOpp = onSnapshot(orgOppQuery, (snap) => {
          const items: OrgOpportunity[] = [];
          snap.forEach((d) => {
            items.push({ id: d.id, ...d.data() } as OrgOpportunity);
          });
          setOrgOpps(items);

          const seededCount = items.filter((o: OrgOpportunity) => (o as any).source === "seed-india-2026").length;
          const automatedCount = items.filter((o: OrgOpportunity) => o.source === "automated").length;
          const orgPostedCount = items.length - seededCount - automatedCount;

          setStats({
            totalUsers: users.length,
            totalOpportunities: items.length,
            orgPostedCount,
            seededCount,
            totalApplications: appCount,
            totalCommunityPosts: postCount,
          });
          setLoading(false);
        });

        // 5. Fetch organization access requests (self-service signups)
        const orgReqQuery = query(collection(db, "org_requests"));
        const unsubOrgReq = onSnapshot(orgReqQuery, (snap) => {
          const items: OrgRequest[] = [];
          snap.forEach((d) => items.push(d.data() as OrgRequest));
          setOrgRequests(items);
        });

        return () => {
          unsubOrgOpp();
          unsubOrgReq();
        };
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };

    loadAdminData();
  }, [currentUser]);

  const updateOppStatus = async (oppId: string, status: "approved" | "rejected") => {
    try {
      await updateDoc(doc(db, "org_opportunities", oppId), {
        status,
      });
      setOrgOpps((prev) =>
        prev.map((opp) => (opp.id === oppId ? { ...opp, status } : opp))
      );
      alert(`Opportunity program has been successfully: ${status}! 🌸`);
    } catch (err) {
      console.error(err);
    }
  };

  const reviewOrgRequest = async (uid: string, decision: "approved" | "rejected") => {
    try {
      await updateDoc(doc(db, "org_requests", uid), {
        status: decision,
        reviewedAt: new Date().toISOString(),
      });
      if (decision === "approved") {
        await updateDoc(doc(db, "users", uid), { role: "organization" });
      }
      setOrgRequests((prev) =>
        prev.map((r) => (r.uid === uid ? { ...r, status: decision } : r))
      );
      alert(`Organization request ${decision}! 🌸`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRoleChange = async (uid: string, nextRole: "user" | "organization" | "admin") => {
    try {
      await updateDoc(doc(db, "users", uid), {
        role: nextRole,
      });
      setUsersList((prev) =>
        prev.map((u) => (u.id === uid ? { ...u, role: nextRole } : u))
      );
      alert(`User role updated to: ${nextRole}! 🌸`);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading || authLoading || !currentUser || !isAllowedAdminEmail(currentUser.email)) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-brand-purple animate-spin" />
      </div>
    );
  }

  const pendingCount = orgOpps.filter((o) => o.status === "pending").length;
  const pendingOrgRequestsCount = orgRequests.filter((r) => r.status === "pending").length;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-foreground flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-brand-purple" /> Admin Panel
        </h1>
        <p className="text-foreground-muted text-sm mt-1">
          Moderate organization postings, change user access permissions, and evaluate platform statistics.
        </p>
      </div>

      {/* Stats Counters */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-surface border border-border p-5 rounded-3xl shadow-sm text-center hover:shadow-[0_0_0_1px_rgba(255,92,134,0.15),0_4px_16px_rgba(255,60,110,0.1)] transition-shadow">
          <Users className="w-6 h-6 text-purple-500 mx-auto mb-2" />
          <span className="block text-[9px] font-bold text-foreground-muted uppercase tracking-wider">Total Members</span>
          <span className="text-lg font-extrabold text-foreground">{stats.totalUsers} users</span>
        </div>
        <div className="bg-surface border border-border p-5 rounded-3xl shadow-sm text-center hover:shadow-[0_0_0_1px_rgba(255,92,134,0.15),0_4px_16px_rgba(255,60,110,0.1)] transition-shadow">
          <FileText className="w-6 h-6 text-blue-500 mx-auto mb-2" />
          <span className="block text-[9px] font-bold text-foreground-muted uppercase tracking-wider">Opportunities</span>
          <span className="text-lg font-extrabold text-foreground">{stats.totalOpportunities} total</span>
          <span className="block text-[9px] text-foreground-muted mt-0.5">
            {stats.orgPostedCount} org-posted · {stats.seededCount} seeded
          </span>
        </div>
        <div className="bg-surface border border-border p-5 rounded-3xl shadow-sm text-center hover:shadow-[0_0_0_1px_rgba(255,92,134,0.15),0_4px_16px_rgba(255,60,110,0.1)] transition-shadow">
          <FileSpreadsheet className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
          <span className="block text-[9px] font-bold text-foreground-muted uppercase tracking-wider">Applications</span>
          <span className="text-lg font-extrabold text-foreground">{stats.totalApplications} tracks</span>
        </div>
        <div className="bg-surface border border-border p-5 rounded-3xl shadow-sm text-center hover:shadow-[0_0_0_1px_rgba(255,92,134,0.15),0_4px_16px_rgba(255,60,110,0.1)] transition-shadow">
          <MessageSquare className="w-6 h-6 text-amber-500 mx-auto mb-2" />
          <span className="block text-[9px] font-bold text-foreground-muted uppercase tracking-wider">Forum Posts</span>
          <span className="text-lg font-extrabold text-foreground">{stats.totalCommunityPosts} posts</span>
        </div>
      </div>

      {/* Moderate Opportunities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Organization access requests */}
        <div className="bg-surface border border-border p-6 rounded-3xl shadow-sm space-y-6">
          <h3 className="font-extrabold text-foreground text-sm flex items-center justify-between">
            <span>Organization requests</span>
            {pendingOrgRequestsCount > 0 && (
              <span className="text-[9px] font-bold bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded border border-amber-500/20">
                {pendingOrgRequestsCount} Pending
              </span>
            )}
          </h3>

          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
            {orgRequests.map((req) => (
              <div key={req.uid} className="p-4 bg-surface-raised border border-border rounded-2xl space-y-3">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <span className="text-[8px] font-extrabold uppercase tracking-wider text-foreground-muted">
                      {req.requesterName} · {req.requesterEmail}
                    </span>
                    <h5 className="font-bold text-foreground text-xs mt-1 leading-snug">{req.orgName}</h5>
                    {req.website && (
                      <a href={req.website} target="_blank" rel="noopener noreferrer" className="text-[10px] text-brand-purple hover:underline">
                        {req.website}
                      </a>
                    )}
                  </div>
                  <span className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded border ${
                    req.status === "approved"
                      ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                      : req.status === "rejected"
                      ? "bg-red-500/10 text-red-500 border-red-500/20"
                      : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                  }`}>
                    {req.status}
                  </span>
                </div>

                <p className="text-[11px] text-foreground-muted line-clamp-3 leading-relaxed">{req.description}</p>

                {req.status === "pending" && (
                  <div className="flex gap-2 justify-end pt-2 border-t border-border">
                    <button
                      onClick={() => reviewOrgRequest(req.uid, "approved")}
                      className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 rounded-xl text-[10px] font-bold transition-all border border-emerald-500/20"
                    >
                      <CheckCircle className="w-3.5 h-3.5" /> Approve
                    </button>
                    <button
                      onClick={() => reviewOrgRequest(req.uid, "rejected")}
                      className="flex items-center gap-1 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl text-[10px] font-bold transition-all border border-red-500/20"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Reject
                    </button>
                  </div>
                )}
              </div>
            ))}

            {orgRequests.length === 0 && (
              <div className="text-center py-12">
                <Building className="w-8 h-8 text-foreground-muted mx-auto mb-2" />
                <h5 className="font-bold text-foreground text-xs">No requests yet</h5>
                <p className="text-foreground-muted text-[10px] mt-1">
                  When users request organization access, they'll show up here.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-surface border border-border p-6 rounded-3xl shadow-sm space-y-6">
          <h3 className="font-extrabold text-foreground text-sm flex items-center justify-between">
            <span>Moderate org opportunities</span>
            {pendingCount > 0 && (
              <span className="text-[9px] font-bold bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded border border-amber-500/20">
                {pendingCount} Pending Approval
              </span>
            )}
          </h3>

          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
            {orgOpps.map((opp) => (
              <div key={opp.id} className="p-4 bg-surface-raised border border-border rounded-2xl space-y-3">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <span className="text-[8px] font-extrabold uppercase tracking-wider text-foreground-muted">
                      Posted by {opp.orgName}
                      {opp.source === "automated" && (
                        <span className="ml-1.5 text-[7px] font-bold bg-blue-500/10 text-blue-500 px-1.5 py-0.5 rounded border border-blue-500/20 normal-case tracking-normal">
                          Auto-ingested{opp.sourceType === "scraped" ? " · scraped" : " · trusted feed"}
                        </span>
                      )}
                    </span>
                    <h5 className="font-bold text-foreground text-xs mt-1 leading-snug">{opp.title}</h5>
                  </div>
                  <span className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded border ${
                    opp.status === "approved"
                      ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                      : opp.status === "rejected"
                      ? "bg-red-500/10 text-red-500 border-red-500/20"
                      : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                  }`}>
                    {opp.status}
                  </span>
                </div>

                <p className="text-[11px] text-foreground-muted line-clamp-2 leading-relaxed">{opp.description}</p>

                {opp.status === "pending" && (
                  <div className="flex gap-2 justify-end pt-2 border-t border-border">
                    <button
                      onClick={() => updateOppStatus(opp.id, "approved")}
                      className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 rounded-xl text-[10px] font-bold transition-all border border-emerald-500/20"
                    >
                      <CheckCircle className="w-3.5 h-3.5" /> Approve
                    </button>
                    <button
                      onClick={() => updateOppStatus(opp.id, "rejected")}
                      className="flex items-center gap-1 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl text-[10px] font-bold transition-all border border-red-500/20"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Reject
                    </button>
                  </div>
                )}
              </div>
            ))}

            {orgOpps.length === 0 && (
              <div className="text-center py-12">
                <Building className="w-8 h-8 text-foreground-muted mx-auto mb-2" />
                <h5 className="font-bold text-foreground text-xs">No programs to review</h5>
                <p className="text-foreground-muted text-[10px] mt-1">
                  Once organizations publish opportunities, they will list here for approval.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* User permissions moderator */}
        <div className="bg-surface border border-border p-6 rounded-3xl shadow-sm space-y-6">
          <h3 className="font-extrabold text-foreground text-sm">Manage Member Roles</h3>

          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
            {usersList.map((usr) => (
              <div key={usr.id} className="p-4 bg-surface-raised border border-border rounded-2xl flex items-center justify-between gap-4">
                <div>
                  <h5 className="font-bold text-foreground text-xs">{usr.name}</h5>
                  <span className="text-[10px] text-foreground-muted">{usr.email}</span>
                </div>

                <div className="space-y-1">
                  <span className="block text-[8px] font-bold text-foreground-muted uppercase text-right">Access Level</span>
                  <select
                    value={usr.role || "user"}
                    onChange={(e) => handleRoleChange(usr.id, e.target.value as any)}
                    disabled={isAllowedAdminEmail(usr.email)}
                    className="text-[10px] font-bold p-1.5 bg-background border border-border rounded-lg outline-none text-foreground focus:border-brand-purple disabled:opacity-50"
                  >
                    <option value="user">User</option>
                    <option value="organization">Organization</option>
                    {usr.role === "admin" && <option value="admin">Admin</option>}
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
