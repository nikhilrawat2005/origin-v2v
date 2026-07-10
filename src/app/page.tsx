"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Search,
  Sparkles,
  ArrowRight,
  GraduationCap,
  Briefcase,
  Users,
  Compass,
  Trophy,
  CheckCircle,
  Star,
} from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/explore?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push("/explore");
    }
  };

  const categories = [
    { name: "Scholarships", icon: GraduationCap, lightColor: "text-purple-600 bg-purple-50", darkColor: "dark:text-purple-300 dark:bg-purple-950/40" },
    { name: "Fellowships", icon: Users, lightColor: "text-indigo-600 bg-indigo-50", darkColor: "dark:text-indigo-300 dark:bg-indigo-950/40" },
    { name: "Internships", icon: Briefcase, lightColor: "text-blue-600 bg-blue-50", darkColor: "dark:text-blue-300 dark:bg-blue-950/40" },
    { name: "Conferences", icon: Compass, lightColor: "text-pink-600 bg-pink-50", darkColor: "dark:text-primary dark:bg-primary/10" },
    { name: "Hackathons", icon: Trophy, lightColor: "text-amber-600 bg-amber-50", darkColor: "dark:text-amber-300 dark:bg-amber-950/40" },
    { name: "STEM Programs", icon: Sparkles, lightColor: "text-violet-600 bg-violet-50", darkColor: "dark:text-violet-300 dark:bg-violet-950/40" },
  ];

  const benefits = [
    { title: "One Unified Hub", desc: "No more searching through hundreds of scattered blogs. Access all opportunities in a single, curated database." },
    { title: "Smart Filters", desc: "Filter by your education level, location, fields of interest, and household income threshold." },
    { title: "Deadline Tracking", desc: "Bookmark opportunities and receive smart reminders to submit before applications close." },
  ];

  return (
    <>
      <Navbar />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 px-4 sm:px-6 lg:px-8 hero-glow">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background pointer-events-none" />

          {/* Light mode decorative orbs */}
          <div className="absolute top-1/4 left-[10%] w-72 h-72 bg-primary/20 rounded-full filter blur-3xl opacity-40 animate-pulse dark:bg-primary/10 dark:opacity-20" />
          <div className="absolute top-1/3 right-[10%] w-96 h-96 bg-primary/15 rounded-full filter blur-3xl opacity-30 animate-pulse delay-2000 dark:bg-[rgba(180,0,60,0.08)] dark:opacity-30" />

          <div className="max-w-5xl mx-auto text-center relative z-10">
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-primary/10 text-primary mb-6 border border-primary/20"
            >
              <Sparkles className="w-3.5 h-3.5" /> Empowering Female Leaders
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl sm:text-6xl font-extrabold text-foreground tracking-tight leading-none mb-6"
            >
              Discover Your Next <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-hover">
                Career-Defining Opportunity
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-base sm:text-lg text-foreground-muted max-w-2xl mx-auto mb-10 leading-relaxed"
            >
              Bloom connects women to global scholarships, fellowships, internships, hackathons, and STEM programs. Zero clutter. Just verified paths to advance your career.
            </motion.p>

            {/* Search Bar */}
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              onSubmit={handleSearchSubmit}
              className="max-w-2xl mx-auto flex items-center bg-surface rounded-full p-2 shadow-lg border border-border dark:shadow-[0_4px_24px_rgba(255,60,110,0.1)] mb-12"
            >
              <div className="flex items-center flex-grow pl-4">
                <Search className="text-foreground-muted w-5 h-5 mr-2 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Search scholarships, internships, fields..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-sm outline-none text-foreground placeholder-foreground-muted bg-transparent py-2.5"
                />
              </div>
              <button
                type="submit"
                className="bg-primary hover:bg-primary-hover text-white font-semibold text-sm px-6 py-3 rounded-full transition-all shadow-md flex items-center gap-1.5 dark:shadow-[0_4px_12px_rgba(255,60,110,0.3)] dark:hover:shadow-[0_4px_20px_rgba(255,60,110,0.45)]"
              >
                Search
              </button>
            </motion.form>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex justify-center gap-4 flex-wrap"
            >
              <Link
                href="/auth/signup"
                className="px-6 py-3.5 bg-foreground hover:opacity-90 text-background font-semibold rounded-full shadow-md transition-all flex items-center gap-2"
              >
                Join Platform
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/explore"
                className="px-6 py-3.5 bg-surface hover:bg-surface-raised text-foreground border border-border font-semibold rounded-full shadow-sm transition-all hover:border-primary/30"
              >
                Explore Opportunities
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-20 bg-surface transition-colors duration-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-extrabold text-foreground">Explore by Category</h2>
              <p className="mt-3 text-foreground-muted max-w-xl mx-auto">
                Categorized lists of pathways designed specifically for female students and researchers worldwide.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {categories.map((cat) => {
                const IconComponent = cat.icon;
                return (
                  <Link
                    key={cat.name}
                    href={`/explore?category=${cat.name}`}
                    className="flex flex-col items-center p-6 bg-background hover:bg-surface-raised rounded-2xl border border-border hover:border-primary/30 transition-all text-center group card-hover"
                  >
                    <div className={`p-4 rounded-xl mb-4 transition-transform group-hover:scale-110 ${cat.lightColor} ${cat.darkColor}`}>
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <span className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
                      {cat.name}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-20 bg-background transition-colors duration-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-extrabold text-foreground">Why Join Bloom?</h2>
              <p className="mt-3 text-foreground-muted max-w-xl mx-auto">
                Built specifically to solve accessibility barriers and bridge the gender gap in technical fields.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {benefits.map((b) => (
                <div
                  key={b.title}
                  className="p-8 bg-surface border border-border rounded-3xl shadow-sm hover:shadow-md dark:hover:shadow-[0_4px_20px_rgba(255,60,110,0.1)] hover:border-primary/20 transition-all card-hover"
                >
                  <CheckCircle className="w-8 h-8 text-primary mb-6" />
                  <h3 className="text-lg font-bold text-foreground mb-2">{b.title}</h3>
                  <p className="text-foreground-muted text-sm leading-relaxed">{b.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-20 bg-surface transition-colors duration-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-extrabold text-foreground">Success Stories</h2>
              <p className="mt-3 text-foreground-muted max-w-xl mx-auto">
                Hear from women who accelerated their tech journeys using this platform.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                {
                  quote: "Thanks to this platform, I discovered the Google Generation Scholarship. The search criteria were so clear that I saved hours of lookup time and successfully landed the grant!",
                  name: "Priya Sharma",
                  title: "CS Student at IIT Delhi",
                },
                {
                  quote: "I had struggled to find international fellowships for research. Bloom simplified my search. I got bookmarked notifications for Grace Hopper and got selected.",
                  name: "Jessica Miller",
                  title: "PhD Fellow in AI, Stanford University",
                },
              ].map((t) => (
                <div
                  key={t.name}
                  className="p-8 bg-background rounded-3xl border border-border hover:border-primary/20 transition-all card-hover"
                >
                  <div className="flex gap-1 mb-4 text-amber-500 dark:text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <p className="text-foreground-muted italic text-sm leading-relaxed mb-6">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <div>
                    <h5 className="font-bold text-foreground text-sm">{t.name}</h5>
                    <span className="text-foreground-muted text-xs">{t.title}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
