"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { LogOut, Menu, X, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import ThemeToggle from "@/components/ThemeToggle";

export default function Navbar() {
  const pathname = usePathname();
  const { currentUser, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const links = [
    { name: "Explore", href: "/explore" },
    { name: "Saved", href: "/saved" },
    { name: "Dashboard", href: "/dashboard" },
    { name: "AI Hub", href: "/ai-hub" },
    { name: "Profile", href: "/profile" },
  ];

  // Shrink + deepen the navbar once the page scrolls a little
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the mobile menu automatically on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <motion.nav
      initial={{ y: -24, opacity: 0 }}
      animate={{
        y: 0,
        opacity: 1,
        height: scrolled ? 60 : 68,
        boxShadow: scrolled
          ? "0 8px 24px -12px rgba(178, 58, 92, 0.18)"
          : "0 0px 0px rgba(0,0,0,0)",
      }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="sticky top-0 z-50 bg-surface/80 backdrop-blur-md border-b border-border flex items-center"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2 text-xl font-bold text-foreground group">
              <motion.span
                whileHover={{ rotate: 12, scale: 1.08 }}
                whileTap={{ scale: 0.92, rotate: -8 }}
                transition={{ type: "spring", stiffness: 400, damping: 12 }}
                className="p-1.5 bg-primary text-white rounded-lg shadow-sm inline-flex"
              >
                <Sparkles className="w-5 h-5" />
              </motion.span>
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
                  className={`relative text-sm font-medium py-1 transition-colors ${
                    isActive
                      ? "text-primary font-semibold"
                      : "text-foreground-muted hover:text-foreground"
                  }`}
                >
                  {link.name}
                  {isActive && (
                    <motion.span
                      layoutId="navbar-active-underline"
                      className="absolute left-0 right-0 -bottom-1 h-[2px] bg-primary rounded-full"
                      transition={{ type: "spring", stiffness: 500, damping: 35 }}
                    />
                  )}
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
                <motion.button
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => logout()}
                  className="p-1.5 text-foreground-muted hover:text-danger rounded-lg hover:bg-danger-surface transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </motion.button>
              </div>
            ) : (
              <div className="flex items-center gap-3 ml-2">
                <Link
                  href="/auth/login"
                  className="text-sm font-medium text-foreground-muted hover:text-foreground px-3 py-1.5 rounded-lg transition-colors"
                >
                  Sign In
                </Link>
                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                  <Link
                    href="/auth/signup"
                    className="text-sm font-semibold bg-primary text-white hover:bg-primary-hover px-4 py-2 rounded-full shadow-sm hover:shadow-md transition-all block"
                  >
                    Join Bloom
                  </Link>
                </motion.div>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 sm:hidden">
            <ThemeToggle compact />
            <motion.button
              whileTap={{ scale: 0.88 }}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-foreground-muted hover:text-foreground rounded-lg hover:bg-surface-raised transition-colors relative w-9 h-9 flex items-center justify-center"
            >
              <AnimatePresence mode="wait" initial={false}>
                {mobileMenuOpen ? (
                  <motion.span
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.18 }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <X className="w-6 h-6" />
                  </motion.span>
                ) : (
                  <motion.span
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.18 }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <Menu className="w-6 h-6" />
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: "easeInOut" }}
            className="sm:hidden absolute top-full left-0 right-0 bg-surface border-b border-border overflow-hidden"
          >
            <motion.div
              initial="hidden"
              animate="show"
              variants={{
                hidden: {},
                show: { transition: { staggerChildren: 0.05, delayChildren: 0.05 } },
              }}
              className="px-4 pt-2 pb-4 space-y-1"
            >
              {links.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <motion.div
                    key={link.href}
                    variants={{
                      hidden: { opacity: 0, x: -12 },
                      show: { opacity: 1, x: 0 },
                    }}
                  >
                    <Link
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
                  </motion.div>
                );
              })}

              {currentUser ? (
                <motion.div
                  variants={{ hidden: { opacity: 0, x: -12 }, show: { opacity: 1, x: 0 } }}
                  className="border-t border-border pt-3 mt-3 px-3"
                >
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
                </motion.div>
              ) : (
                <motion.div
                  variants={{ hidden: { opacity: 0, x: -12 }, show: { opacity: 1, x: 0 } }}
                  className="border-t border-border pt-3 mt-3 flex flex-col gap-2"
                >
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
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
