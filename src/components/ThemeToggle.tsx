"use client";

import { useTheme } from "@/context/ThemeProvider";
import { Sun, Moon } from "lucide-react";

interface ThemeToggleProps {
  /** If true, shows a compact icon-only button (for Navbar). Default: false shows icon + label */
  compact?: boolean;
  /** Additional CSS classes */
  className?: string;
}

export default function ThemeToggle({ compact = false, className = "" }: ThemeToggleProps) {
  const { isDark, toggleTheme } = useTheme();

  if (compact) {
    return (
      <button
        id="theme-toggle-compact"
        onClick={toggleTheme}
        aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
        title={isDark ? "Light Mode" : "Dark Mode"}
        className={`relative w-9 h-9 flex items-center justify-center rounded-xl border border-border text-foreground-muted hover:text-primary hover:border-primary hover:bg-primary/5 transition-all duration-200 ${className}`}
      >
        {/* Animated sun/moon swap */}
        <Sun
          className={`w-4 h-4 absolute transition-all duration-300 ${
            isDark ? "opacity-100 scale-100 rotate-0" : "opacity-0 scale-50 rotate-90"
          }`}
        />
        <Moon
          className={`w-4 h-4 absolute transition-all duration-300 ${
            isDark ? "opacity-0 scale-50 -rotate-90" : "opacity-100 scale-100 rotate-0"
          }`}
        />
      </button>
    );
  }

  // Full label version (used in sidebar)
  return (
    <button
      id="theme-toggle-full"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold text-foreground-muted hover:bg-surface-raised hover:text-foreground transition-all cursor-pointer group ${className}`}
    >
      <div className="flex items-center gap-3">
        {isDark ? (
          <>
            <Sun className="w-4 h-4 text-amber-400 transition-transform group-hover:rotate-45 duration-300" />
            <span>Light Mode</span>
          </>
        ) : (
          <>
            <Moon className="w-4 h-4 text-foreground-muted transition-transform group-hover:-rotate-12 duration-300" />
            <span>Dark Mode</span>
          </>
        )}
      </div>
      <span className="text-[9px] uppercase tracking-wider text-foreground-muted font-bold bg-surface-raised px-2 py-0.5 rounded-full">
        Theme
      </span>
    </button>
  );
}
