"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { LogOut, Menu, X, Sparkles } from "lucide-react";
import { useState } from "react";
import ThemeToggle from "@/components/ThemeToggle";

export default function Navbar() {
  const pathname = usePathname();
  const { currentUser, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const links = [
    { name: "Explore", href: "/explore" },
    { name: "Saved", href: "/saved" },
    { name: "Dashboard", href: "/dashboard" },
    { name: "AI Hub", href: "/ai-hub" },
    { name: "Profile", href: "/profile" },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-surface/80 backdrop-blur-md border-b border-border transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2 text-xl font-bold text-foreground">
              <span className="p-1.5 bg-primary text-white rounded-lg shadow-sm">
                <Sparkles className="w-5 h-5" />
              </span>
              <span>Bloom</span>
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
                      ? "text-primary font-semibold"
                      : "text-foreground-muted hover:text-foreground"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}

            {/* Theme Toggle (compact, icon-only) */}
            <ThemeToggle compact />

            {currentUser ? (
              <div className="flex items-center gap-3 ml-2 border-l border-border pl-4">
                <div className="flex items-center gap-2 text-sm text-foreground font-medium">
                  <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                    {(currentUser.displayName || currentUser.email || "U").charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden md:inline max-w-[120px] truncate">
                    {currentUser.displayName || currentUser.email}
                  </span>
                </div>
                <button
                  onClick={() => logout()}
                  className="p-1.5 text-foreground-muted hover:text-danger rounded-lg hover:bg-danger-surface transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3 ml-2">
                <Link
                  href="/auth/login"
                  className="text-sm font-medium text-foreground-muted hover:text-foreground px-3 py-1.5 rounded-lg transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  className="text-sm font-semibold bg-primary text-white hover:bg-primary-hover px-4 py-2 rounded-full shadow-sm hover:shadow-md transition-all"
                >
                  Join Bloom
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 sm:hidden">
            <ThemeToggle compact />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-foreground-muted hover:text-foreground rounded-lg hover:bg-surface-raised transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden bg-surface border-b border-border px-4 pt-2 pb-4 space-y-1 transition-colors duration-300">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-lg text-base font-medium transition-colors ${
                  isActive
                    ? "bg-primary/8 text-primary font-semibold"
                    : "text-foreground-muted hover:bg-surface-raised hover:text-foreground"
                }`}
              >
                {link.name}
              </Link>
            );
          })}

          {currentUser ? (
            <div className="border-t border-border pt-3 mt-3 px-3">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                  {(currentUser.displayName || currentUser.email || "U").charAt(0).toUpperCase()}
                </div>
                <span className="text-foreground text-sm font-medium truncate">
                  {currentUser.displayName || currentUser.email}
                </span>
              </div>
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="flex w-full items-center gap-2 text-danger text-sm font-semibold py-2"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </div>
          ) : (
            <div className="border-t border-border pt-3 mt-3 flex flex-col gap-2">
              <Link
                href="/auth/login"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center text-sm font-semibold text-foreground-muted py-2 rounded-lg border border-border hover:border-primary hover:text-primary transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/auth/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center text-sm font-semibold bg-primary text-white py-2.5 rounded-full hover:bg-primary-hover transition-colors"
              >
                Join Bloom
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
