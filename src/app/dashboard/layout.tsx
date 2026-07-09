"use client";

import { useAuth } from "@/context/AuthContext";
import { useNotifications } from "@/hooks/useNotifications";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Wallet,
  Layers,
  Calendar as CalendarIcon,
  MessageSquare,
  Bell,
  Building2,
  ShieldCheck,
  UserCheck,
  Menu,
  X,
  Sparkles,
} from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { currentUser, profile, updateUserProfile, loading } = useAuth();
  const { unreadCount } = useNotifications(currentUser?.uid);
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Fallback to "user" if not set
  const currentRole = profile?.role || "user";

  const navigation = [
    { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { name: "Opportunity Wallet", href: "/dashboard/wallet", icon: Wallet },
    { name: "Application Tracker", href: "/dashboard/tracker", icon: Layers },
    { name: "Calendar Hub", href: "/dashboard/calendar", icon: CalendarIcon },
    { name: "Community Board", href: "/dashboard/community", icon: MessageSquare },
    {
      name: "Notifications",
      href: "/dashboard/notifications",
      icon: Bell,
      badge: unreadCount > 0 ? unreadCount : undefined,
    },
    {
      name: "Org Dashboard",
      href: "/dashboard/organization",
      icon: Building2,
      roleRequired: "organization",
    },
    {
      name: "Admin Panel",
      href: "/dashboard/admin",
      icon: ShieldCheck,
      roleRequired: "admin",
    },
  ];

  const handleRoleChange = async (role: "user" | "organization" | "admin") => {
    try {
      await updateUserProfile({ role });
      // Redirect to the default dashboard or specific page depending on role
      if (role === "organization") {
        router.push("/dashboard/organization");
      } else if (role === "admin") {
        router.push("/dashboard/admin");
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      console.error("Failed to update role:", err);
    }
  };

  if (loading) return null;

  return (
    <div className="min-h-screen bg-slate-50/50 flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex lg:flex-col lg:w-72 bg-white border-r border-slate-100 p-6 space-y-6 flex-shrink-0">
        <div className="flex items-center gap-3 px-2 py-4 border-b border-slate-50">
          <div className="p-2 bg-gradient-to-tr from-brand-purple to-brand-indigo text-white rounded-xl shadow-md">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h4 className="font-extrabold text-brand-navy leading-none">Bloom Panel</h4>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Opportunity Ecosystem</span>
          </div>
        </div>

        {/* Role Switcher */}
        <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl space-y-2">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            <UserCheck className="w-3.5 h-3.5 text-brand-purple" />
            <span>Active Persona Role</span>
          </div>
          <div className="grid grid-cols-3 gap-1">
            {(["user", "organization", "admin"] as const).map((r) => (
              <button
                key={r}
                onClick={() => handleRoleChange(r)}
                className={`py-1.5 px-1 rounded-lg text-[9px] font-extrabold capitalize transition-all border ${
                  currentRole === r
                    ? "bg-brand-purple border-brand-purple text-white shadow-sm"
                    : "bg-white border-slate-200 text-slate-500 hover:bg-slate-100"
                }`}
              >
                {r === "organization" ? "Org" : r}
              </button>
            ))}
          </div>
        </div>

        <nav className="flex-1 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            // Always show items, but dim or label restricted items if not active
            const hasAccess = !item.roleRequired || currentRole === item.roleRequired;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center justify-between px-4 py-3.5 rounded-2xl text-sm font-semibold transition-all group ${
                  isActive
                    ? "bg-brand-purple/10 text-brand-purple font-bold shadow-sm border-l-4 border-brand-purple"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                } ${!hasAccess ? "opacity-45 hover:opacity-100" : ""}`}
              >
                <div className="flex items-center gap-3">
                  <item.icon className={`w-4 h-4 ${isActive ? "text-brand-purple" : "text-slate-400 group-hover:text-slate-600"}`} />
                  <span>{item.name}</span>
                </div>
                {item.badge !== undefined && (
                  <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
                {item.roleRequired && currentRole !== item.roleRequired && (
                  <span className="text-[8px] font-bold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded uppercase">
                    {item.roleRequired}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-grow flex flex-col min-w-0">
        {/* Mobile Header Nav */}
        <header className="lg:hidden bg-white border-b border-slate-100 h-16 flex items-center justify-between px-6 z-40 sticky top-0">
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="p-1.5 bg-brand-purple text-white rounded-lg">
              <Sparkles className="w-4 h-4" />
            </span>
            <span className="font-bold text-brand-navy">Bloom Dashboard</span>
          </Link>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-50"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </header>

        {/* Mobile Sidebar overlay */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden bg-slate-900/40 backdrop-blur-sm">
            <div className="w-72 bg-white h-full p-6 flex flex-col space-y-6 animate-in slide-in-from-left duration-200">
              <div className="flex items-center justify-between pb-4 border-b border-slate-50">
                <span className="font-bold text-brand-navy flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-brand-purple" /> Bloom Panel
                </span>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-50"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Role Switcher */}
              <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl space-y-2">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <UserCheck className="w-3.5 h-3.5 text-brand-purple" />
                  <span>Role Persona</span>
                </div>
                <div className="grid grid-cols-3 gap-1">
                  {(["user", "organization", "admin"] as const).map((r) => (
                    <button
                      key={r}
                      onClick={() => {
                        handleRoleChange(r);
                        setMobileOpen(false);
                      }}
                      className={`py-1 px-0.5 rounded-lg text-[9px] font-extrabold capitalize border ${
                        currentRole === r
                          ? "bg-brand-purple border-brand-purple text-white shadow-sm"
                          : "bg-white border-slate-200 text-slate-500 hover:bg-slate-100"
                      }`}
                    >
                      {r === "organization" ? "Org" : r}
                    </button>
                  ))}
                </div>
              </div>

              <nav className="flex-1 space-y-1">
                {navigation.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
                        isActive
                          ? "bg-brand-purple/10 text-brand-purple font-bold border-l-4 border-brand-purple"
                          : "text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className="w-4 h-4" />
                        <span>{item.name}</span>
                      </div>
                      {item.badge !== undefined && (
                        <span className="bg-red-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        )}

        {/* Content Container */}
        <main className="flex-1 p-4 sm:p-8 lg:p-10 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
