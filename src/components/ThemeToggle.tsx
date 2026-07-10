"use client";

import { useTheme } from "@/context/ThemeProvider";
import { Sun, Moon } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

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
      <motion.button
        id="theme-toggle-compact"
        onClick={toggleTheme}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.88, rotate: -14 }}
        aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
        title={isDark ? "Light Mode" : "Dark Mode"}
        className={`relative w-9 h-9 flex items-center justify-center rounded-xl border border-border text-foreground-muted hover:text-primary hover:border-primary hover:bg-primary/5 transition-colors duration-200 overflow-hidden ${className}`}
      >
        <AnimatePresence mode="wait" initial={false}>
          {isDark ? (
            <motion.span
              key="sun"
              initial={{ opacity: 0, rotate: -90, scale: 0.4 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={{ opacity: 0, rotate: 90, scale: 0.4 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <Sun className="w-4 h-4" />
            </motion.span>
          ) : (
            <motion.span
              key="moon"
              initial={{ opacity: 0, rotate: 90, scale: 0.4 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={{ opacity: 0, rotate: -90, scale: 0.4 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <Moon className="w-4 h-4" />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    );
  }

  // Full label version (used in sidebar)
  return (
    <motion.button
      id="theme-toggle-full"
      onClick={toggleTheme}
      whileHover={{ x: 2 }}
      whileTap={{ scale: 0.98 }}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold text-foreground-muted hover:bg-surface-raised hover:text-foreground transition-colors cursor-pointer group ${className}`}
    >
      <div className="flex items-center gap-3">
        <AnimatePresence mode="wait" initial={false}>
          {isDark ? (
            <motion.span
              key="sun-full"
              initial={{ opacity: 0, rotate: -90, scale: 0.4 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={{ opacity: 0, rotate: 90, scale: 0.4 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <Sun className="w-4 h-4 text-amber-400" />
            </motion.span>
          ) : (
            <motion.span
              key="moon-full"
              initial={{ opacity: 0, rotate: 90, scale: 0.4 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={{ opacity: 0, rotate: -90, scale: 0.4 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <Moon className="w-4 h-4 text-foreground-muted" />
            </motion.span>
          )}
        </AnimatePresence>
        <span>{isDark ? "Light Mode" : "Dark Mode"}</span>
      </div>
      <span className="text-[9px] uppercase tracking-wider text-foreground-muted font-bold bg-surface-raised px-2 py-0.5 rounded-full">
        Theme
      </span>
    </motion.button>
  );
}
