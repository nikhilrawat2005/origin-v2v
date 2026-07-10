"use client";

import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeProvider";
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
  ArrowLeft,
} from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { currentUser, profile, updateUserProfile, loading } = useAuth();
  const { unreadCount } = useNotifications(currentUser?.uid);
  const { isDark } = useTheme();
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

  const SidebarContent = () => (
    <>
      {/* Sidebar Header */}
      <div className="flex items-center gap-3 px-2 py-4 border-b border-border">
        <div className="p-2 bg-gradient-to-tr from-primary to-primary-hover text-white rounded-xl shadow-md dark:shadow-[0_4px_12px_rgba(255,60,110,0.3)]">
          <Sparkles className="w-5 h-5 animate-pulse" />
        </div>
        <div>
          <h4 className="font-extrabold text-foreground leading-none">Bloom Panel</h4>
          <span className="text-[10px] font-bold text-foreground-muted uppercase tracking-wider">
            Opportunity Ecosystem
          </span>
        </div>
      </div>

      {/* Role Switcher */}
      <div className="bg-surface-raised border border-border p-4 rounded-2xl space-y-2">
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-foreground-muted uppercase tracking-wider">
          <UserCheck className="w-3.5 h-3.5 text-primary" />
          <span>Active Persona Role</span>
        </div>
        <div className="grid grid-cols-3 gap-1">
          {(["user", "organization", "admin"] as const).map((r) => (
            <button
              key={r}
              onClick={() => handleRoleChange(r)}
              className={`py-1.5 px-1 rounded-lg text-[9px] font-extrabold capitalize transition-all border ${
                currentRole === r
                  ? "bg-primary border-primary text-white shadow-sm dark:shadow-[0_2px_8px_rgba(255,60,110,0.3)]"
                  : "bg-surface border-border text-foreground-muted hover:bg-surface-raised hover:text-foreground"
              }`}
            >
              {r === "organization" ? "Org" : r}
            </button>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          const hasAccess = !item.roleRequired || currentRole === item.roleRequired;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center justify-between px-4 py-3.5 rounded-2xl text-sm font-semibold transition-all group ${
                isActive
                  ? "bg-primary/10 text-primary font-bold shadow-sm border-l-4 border-primary dark:shadow-[0_2px_8px_rgba(255,60,110,0.12)]"
                  : "text-foreground-muted hover:bg-surface-raised hover:text-foreground"
              } ${!hasAccess ? "opacity-45 hover:opacity-100" : ""}`}
            >
              <div className="flex items-center gap-3">
                <item.icon
                  className={`w-4 h-4 ${
                    isActive
                      ? "text-primary"
                      : "text-foreground-muted group-hover:text-foreground"
                  }`}
                />
                <span>{item.name}</span>
              </div>
              {item.badge !== undefined && (
                <span className="bg-danger text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
              {item.roleRequired && currentRole !== item.roleRequired && (
                <span className="text-[8px] font-bold bg-surface-raised text-foreground-muted px-1.5 py-0.5 rounded uppercase">
                  {item.roleRequired}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Sidebar Footer Controls */}
      <div className="pt-4 border-t border-border space-y-2">
        {/* Theme Toggle — full label variant */}
        <ThemeToggle />

        {/* Back to Site */}
        <Link
          href="/"
          className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold text-danger hover:bg-danger-surface transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Site</span>
        </Link>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-background text-foreground flex transition-colors duration-300">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex lg:flex-col lg:w-72 bg-surface border-r border-border p-6 space-y-6 flex-shrink-0 transition-colors duration-300">
        <SidebarContent />
      </aside>

      {/* Main Content Area */}
      <div className="flex-grow flex flex-col min-w-0 bg-background transition-colors duration-300">
        {/* Mobile Header Nav */}
        <header className="lg:hidden bg-surface border-b border-border h-16 flex items-center justify-between px-6 z-40 sticky top-0 transition-colors duration-300">
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="p-1.5 bg-primary text-white rounded-lg">
              <Sparkles className="w-4 h-4" />
            </span>
            <span className="font-bold text-foreground">Bloom Dashboard</span>
          </Link>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 text-foreground-muted hover:text-foreground rounded-lg hover:bg-surface-raised transition-colors"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </header>

        {/* Mobile Sidebar overlay */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden bg-foreground/20 backdrop-blur-sm">
            <div className="w-72 bg-surface h-full p-6 flex flex-col space-y-6 animate-in slide-in-from-left duration-200 transition-colors duration-300">
              <div className="flex items-center justify-between pb-4 border-b border-border">
                <span className="font-bold text-foreground flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" /> Bloom Panel
                </span>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-1.5 rounded-lg text-foreground-muted hover:bg-surface-raised hover:text-foreground transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Role Switcher */}
              <div className="bg-surface-raised border border-border p-4 rounded-2xl space-y-2">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-foreground-muted uppercase tracking-wider">
                  <UserCheck className="w-3.5 h-3.5 text-primary" />
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
                          ? "bg-primary border-primary text-white shadow-sm"
                          : "bg-surface border-border text-foreground-muted hover:bg-surface-raised"
                      }`}
                    >
                      {r === "organization" ? "Org" : r}
                    </button>
                  ))}
                </div>
              </div>

              {/* Nav Links */}
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
                          ? "bg-primary/10 text-primary font-bold border-l-4 border-primary"
                          : "text-foreground-muted hover:bg-surface-raised hover:text-foreground"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon
                          className={`w-4 h-4 ${isActive ? "text-primary" : "text-foreground-muted"}`}
                        />
                        <span>{item.name}</span>
                      </div>
                      {item.badge !== undefined && (
                        <span className="bg-danger text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>

              {/* Mobile Footer Controls */}
              <div className="pt-4 border-t border-border space-y-2">
                <ThemeToggle />
                <Link
                  href="/"
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold text-danger hover:bg-danger-surface transition-all"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Site</span>
                </Link>
              </div>
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
