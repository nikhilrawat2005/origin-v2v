"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { LogOut, Menu, X, Sparkles } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const pathname = usePathname();
  const { currentUser, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const links = [
    { name: "Explore", href: "/explore" },
    { name: "Saved", href: "/saved" },
    { name: "Dashboard", href: "/dashboard" },
    { name: "Profile", href: "/profile" },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2 text-xl font-bold text-brand-navy">
              <span className="p-1.5 bg-brand-purple text-white rounded-lg shadow-sm">
                <Sparkles className="w-5 h-5" />
              </span>
              <span>Aura</span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden sm:flex sm:items-center sm:gap-6">
            {links.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium transition-colors ${
                    isActive
                      ? "text-brand-purple font-semibold"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}

            {currentUser ? (
              <div className="flex items-center gap-3 ml-4 border-l border-slate-200 pl-4">
                <div className="flex items-center gap-2 text-sm text-slate-700 font-medium">
                  <div className="w-7 h-7 rounded-full bg-brand-purple/10 text-brand-purple flex items-center justify-center font-bold text-xs">
                    {(currentUser.displayName || currentUser.email || "U").charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden md:inline max-w-[120px] truncate">
                    {currentUser.displayName || currentUser.email}
                  </span>
                </div>
                <button
                  onClick={() => logout()}
                  className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-slate-50 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3 ml-4">
                <Link
                  href="/auth/login"
                  className="text-sm font-medium text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  className="text-sm font-semibold bg-brand-purple text-white hover:bg-brand-indigo px-4 py-2 rounded-full shadow-sm hover:shadow-md transition-all"
                >
                  Join Aura
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center sm:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-50"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden bg-white border-b border-slate-100 px-4 pt-2 pb-4 space-y-1">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-lg text-base font-medium ${
                  isActive
                    ? "bg-brand-purple/5 text-brand-purple font-semibold"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                {link.name}
              </Link>
            );
          })}

          {currentUser ? (
            <div className="border-t border-slate-100 pt-3 mt-3 px-3">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-brand-purple/10 text-brand-purple flex items-center justify-center font-bold text-sm">
                  {(currentUser.displayName || currentUser.email || "U").charAt(0).toUpperCase()}
                </div>
                <span className="text-slate-700 text-sm font-medium truncate">
                  {currentUser.displayName || currentUser.email}
                </span>
              </div>
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="flex w-full items-center gap-2 text-red-500 text-sm font-semibold py-2"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </div>
          ) : (
            <div className="border-t border-slate-100 pt-3 mt-3 flex flex-col gap-2">
              <Link
                href="/auth/login"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center text-sm font-semibold text-slate-600 py-2 rounded-lg border border-slate-200"
              >
                Sign In
              </Link>
              <Link
                href="/auth/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center text-sm font-semibold bg-brand-purple text-white py-2.5 rounded-full"
              >
                Join Aura
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
