"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { doc, getDoc, getDocs, collection, query, where, deleteDoc } from "firebase/firestore";
import { mockOpportunities, Opportunity } from "@/lib/mockData";
import {
  Sparkles,
  Bookmark,
  Calendar,
  Bell,
  Clock,
  ArrowRight,
  User,
  Users,
  GraduationCap,
  Briefcase,
  Trophy,
  Loader2,
  Trash2
} from "lucide-react";

interface Reminder {
  id: string;
  opportunityId: string;
  opportunityTitle: string;
  deadline: string;
}

export default function Dashboard() {
  const { currentUser, profile, loading: authLoading } = useAuth();
  const router = useRouter();

  const [savedOpps, setSavedOpps] = useState<Opportunity[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !currentUser) {
      router.push("/auth/login");
    }
  }, [currentUser, authLoading, router]);

  useEffect(() => {
    if (!currentUser) return;

    const fetchDashboardData = async () => {
      try {
        // 1. Fetch saved bookmarks
        const bookmarkSnap = await getDoc(doc(db, "bookmarks", currentUser.uid));
        if (bookmarkSnap.exists()) {
          const savedIds: string[] = bookmarkSnap.data().opportunityIds || [];
          const matches = mockOpportunities.filter((o) => savedIds.includes(o.id));
          setSavedOpps(matches);
        }

        // 2. Fetch reminders
        // Direct document get since we set doc ID as {uid}_{oppId} or query
        const q = query(collection(db, "reminders"), where("uid", "==", currentUser.uid));
        const querySnap = await getDocs(q);
        const remsList: Reminder[] = [];
        querySnap.forEach((doc) => {
          const data = doc.data();
          remsList.push({
            id: doc.id,
            opportunityId: data.opportunityId,
            opportunityTitle: data.opportunityTitle,
            deadline: data.deadline,
          });
        });
        setReminders(remsList);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [currentUser]);

  const deleteReminder = async (reminderId: string) => {
    try {
      await deleteDoc(doc(db, "reminders", reminderId));
      setReminders((prev) => prev.filter((r) => r.id !== reminderId));
    } catch (error) {
      console.error("Error deleting reminder:", error);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 text-brand-purple animate-spin" />
      </div>
    );
  }

  // Calculate upcoming deadlines count (within next 30 days)
  const incomingDeadlinesCount = reminders.filter((r) => {
    const deadlineTime = new Date(r.deadline).getTime();
    const nowTime = new Date().getTime();
    const diffDays = (deadlineTime - nowTime) / (1000 * 60 * 60 * 24);
    return diffDays > 0 && diffDays <= 30;
  }).length;

  return (
    <div className="space-y-8">
      {/* Welcome Card & Badge Notifications */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-slate-100 p-8 rounded-3xl shadow-sm">
        <div>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-brand-purple">
            <Sparkles className="w-3.5 h-3.5" /> Workspace Dashboard
          </span>
          <h1 className="text-3xl font-extrabold text-brand-navy mt-1">
            Hello, <span className="text-brand-purple italic">{profile?.name || currentUser?.displayName || "Bloom Member"}</span>
          </h1>
          <p className="text-slate-500 text-xs mt-1">
            {profile?.education ? `${profile.education} • ` : ""}{profile?.location || "Bloom Platform"}
          </p>
        </div>

        {/* Notification Badge */}
        <Link href="/dashboard/notifications" className="flex items-center gap-3 bg-slate-50 border border-slate-100 p-3 rounded-2xl hover:bg-slate-100 transition-colors">
          <div className="relative">
            <Bell className="w-5 h-5 text-brand-navy" />
            {incomingDeadlinesCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                {incomingDeadlinesCount}
              </span>
            )}
          </div>
          <div className="text-left">
            <h5 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Deadlines Pending</h5>
            <p className="text-xs text-slate-700 font-semibold">
              {incomingDeadlinesCount} closing this month
            </p>
          </div>
        </Link>
      </div>

      {/* Ecosystem Launchpad shortcuts */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { title: "Opportunity Wallet", desc: "Credentials vault", href: "/dashboard/wallet", icon: Bookmark, color: "from-purple-500 to-indigo-500 text-white" },
          { title: "Application Tracker", desc: "Kanban board stages", href: "/dashboard/tracker", icon: Briefcase, color: "from-pink-500 to-rose-500 text-white" },
          { title: "Calendar Hub", desc: "Deadlines & interviews", href: "/dashboard/calendar", icon: Calendar, color: "from-blue-500 to-cyan-500 text-white" },
          { title: "Community Board", desc: "Mentorship & networking", href: "/dashboard/community", icon: Users, color: "from-amber-500 to-orange-500 text-white" },
        ].map((mod) => (
          <Link
            key={mod.title}
            href={mod.href}
            className="p-5 bg-white border border-slate-100 rounded-3xl shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 flex flex-col justify-between h-36"
          >
            <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${mod.color} flex items-center justify-center`}>
              <mod.icon className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-slate-800 text-xs leading-none">{mod.title}</h4>
              <p className="text-[10px] text-slate-450 mt-1 font-semibold">{mod.desc}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Bookmarks Stat */}
        <div className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm flex items-center gap-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl">
            <Bookmark className="w-6 h-6" />
          </div>
          <div className="text-left">
            <span className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider">Bookmarked Hub</span>
            <span className="text-xl font-extrabold text-slate-800">{savedOpps.length} saved</span>
          </div>
        </div>

        {/* Reminders Stat */}
        <div className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
            <Calendar className="w-6 h-6" />
          </div>
          <div className="text-left">
            <span className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider">Reminders Set</span>
            <span className="text-xl font-extrabold text-slate-800">{reminders.length} alerts active</span>
          </div>
        </div>

        {/* Interest Stat */}
        <div className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
            <Briefcase className="w-6 h-6" />
          </div>
          <div className="text-left">
            <span className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider">Category Focus</span>
            <span className="text-xs font-bold text-slate-700 truncate max-w-[150px]">
              {profile?.category || "None Set"}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Grid: Saved & Deadlines */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Saved Opportunities List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-brand-navy flex items-center gap-2">
              <Bookmark className="w-5 h-5 text-brand-purple" /> Saved Opportunities
            </h3>
            <Link
              href="/explore"
              className="text-xs font-semibold text-brand-purple hover:underline flex items-center gap-0.5"
            >
              Explore more <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-4">
            {savedOpps.map((opp) => (
              <div
                key={opp.id}
                className="p-5 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
              >
                <div>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-brand-purple bg-brand-purple/10 px-2 py-0.5 rounded-full">
                    {opp.category}
                  </span>
                  <h4 className="font-bold text-slate-800 text-sm mt-2 hover:text-brand-purple transition-colors">
                    <Link href={`/opportunity/${opp.id}`}>{opp.title}</Link>
                  </h4>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">{opp.organization}</p>
                </div>

                <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-start">
                  <span className="text-xs font-medium text-slate-500">
                    Deadline: {new Date(opp.deadline).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                  </span>
                  <Link
                    href={`/opportunity/${opp.id}`}
                    className="px-4 py-2 bg-slate-50 hover:bg-brand-purple hover:text-white rounded-xl text-xs font-semibold text-slate-650 transition-colors"
                  >
                    Details
                  </Link>
                </div>
              </div>
            ))}

            {savedOpps.length === 0 && (
              <div className="text-center py-12 bg-white border border-slate-100 rounded-3xl">
                <Bookmark className="w-8 h-8 text-slate-350 mx-auto mb-2" />
                <h5 className="text-slate-800 font-bold mb-0.5">No saved opportunities yet</h5>
                <p className="text-slate-500 text-xs">Bookmark opportunities on the explore screen to view them here.</p>
              </div>
            )}
          </div>
        </div>

        {/* Deadline Reminders Alert Panel */}
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-brand-navy flex items-center gap-2">
            <Clock className="w-5 h-5 text-brand-purple" /> Upcoming Reminders
          </h3>

          <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm space-y-4">
            {reminders.map((rem) => {
              const daysLeft = Math.ceil(
                (new Date(rem.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
              );
              const isClosingSoon = daysLeft > 0 && daysLeft <= 30;

              return (
                <div key={rem.id} className="pb-4 border-b border-slate-50 last:border-0 last:pb-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <h5 className="font-bold text-xs text-slate-800 leading-snug hover:text-brand-purple transition-colors">
                        <Link href={`/opportunity/${rem.opportunityId}`}>{rem.opportunityTitle}</Link>
                      </h5>
                      <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isClosingSoon
                          ? "bg-red-50 text-red-650 border border-red-100"
                          : "bg-slate-50 text-slate-600"
                      }`}>
                        {daysLeft > 0 ? `${daysLeft} days left` : "Deadline passed"}
                      </span>
                    </div>

                    <button
                      onClick={() => deleteReminder(rem.id)}
                      className="p-1 text-slate-400 hover:text-red-500 rounded-lg hover:bg-slate-50 transition-colors"
                      title="Remove Reminder"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}

            {reminders.length === 0 && (
              <div className="text-center py-10">
                <Bell className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <h5 className="text-slate-850 font-bold text-xs mb-0.5">No active alerts</h5>
                <p className="text-slate-450 text-[10px] leading-relaxed">
                  Click "Set Reminder" on any opportunity page to receive alerts.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
