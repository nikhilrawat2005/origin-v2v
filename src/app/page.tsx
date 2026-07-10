"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
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

const containerStagger = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.1 },
  },
};

const fadeUpItem = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

export default function Home() {
  const router = useRouter();
  const { currentUser } = useAuth();
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
    { name: "Scholarships", icon: GraduationCap, lightColor: "text-primary bg-primary/8", darkColor: "dark:text-primary dark:bg-primary/10" },
    { name: "Fellowships", icon: Users, lightColor: "text-secondary bg-secondary/8", darkColor: "dark:text-secondary dark:bg-secondary/10" },
    { name: "Internships", icon: Briefcase, lightColor: "text-accent-gold bg-accent-gold-surface", darkColor: "dark:text-accent-gold dark:bg-accent-gold-surface" },
    { name: "Conferences", icon: Compass, lightColor: "text-primary bg-primary/8", darkColor: "dark:text-primary dark:bg-primary/10" },
    { name: "Hackathons", icon: Trophy, lightColor: "text-secondary bg-secondary/8", darkColor: "dark:text-secondary dark:bg-secondary/10" },
    { name: "STEM Programs", icon: Sparkles, lightColor: "text-accent-gold bg-accent-gold-surface", darkColor: "dark:text-accent-gold dark:bg-accent-gold-surface" },
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
          {/* Single soft decorative wash — primary + secondary, subtle, now gently floating */}
          <motion.div
            className="absolute top-[-10%] left-[8%] w-80 h-80 bg-primary/10 rounded-full filter blur-3xl opacity-60 dark:bg-primary/8 dark:opacity-40"
            animate={{ x: [0, 24, 0], y: [0, 16, 0] }}
            transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute top-[10%] right-[8%] w-72 h-72 bg-secondary/8 rounded-full filter blur-3xl opacity-50 dark:bg-secondary/10 dark:opacity-30"
            animate={{ x: [0, -20, 0], y: [0, -14, 0] }}
            transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
          />

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
              className="max-w-2xl mx-auto flex items-center bg-surface rounded-full p-2 shadow-lg border border-border focus-within:border-primary/40 focus-within:shadow-[0_4px_24px_rgba(178,58,92,0.18)] dark:shadow-[0_4px_24px_rgba(255,60,110,0.1)] dark:focus-within:shadow-[0_4px_28px_rgba(255,60,110,0.28)] transition-shadow duration-300 mb-12"
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
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                <Link
                  href={currentUser ? "/dashboard" : "/auth/signup"}
                  className="px-6 py-3.5 bg-primary hover:bg-primary-hover text-white font-semibold rounded-full shadow-md transition-colors flex items-center gap-2 btn-glow"
                >
                  {currentUser ? "Go to Dashboard" : "Join Platform"}
                  <motion.span
                    animate={{ x: [0, 4, 0] }}
                    transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <ArrowRight className="w-4 h-4" />
                  </motion.span>
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                <Link
                  href="/explore"
                  className="px-6 py-3.5 bg-surface hover:bg-surface-raised text-foreground border border-border font-semibold rounded-full shadow-sm transition-colors hover:border-primary/30 block"
                >
                  Explore Opportunities
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-20 bg-surface transition-colors duration-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              className="text-center mb-12"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl font-extrabold text-foreground">Explore by Category</h2>
              <p className="mt-3 text-foreground-muted max-w-xl mx-auto">
                Categorized lists of pathways designed specifically for female students and researchers worldwide.
              </p>
            </motion.div>

            <motion.div
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6"
              variants={containerStagger}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.2 }}
            >
              {categories.map((cat) => {
                const IconComponent = cat.icon;
                return (
                  <motion.div key={cat.name} variants={fadeUpItem}>
                    <Link
                      href={`/explore?category=${cat.name}`}
                      className="flex flex-col items-center p-6 bg-background hover:bg-surface-raised rounded-2xl border border-border hover:border-primary/30 transition-colors text-center group card-hover"
                    >
                      <motion.div
                        whileHover={{ scale: 1.12, rotate: 4 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 300, damping: 15 }}
                        className={`p-4 rounded-xl mb-4 ${cat.lightColor} ${cat.darkColor}`}
                      >
                        <IconComponent className="w-6 h-6" />
                      </motion.div>
                      <span className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
                        {cat.name}
                      </span>
                    </Link>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-20 bg-background transition-colors duration-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl font-extrabold text-foreground">Why Join Bloom?</h2>
              <p className="mt-3 text-foreground-muted max-w-xl mx-auto">
                Built specifically to solve accessibility barriers and bridge the gender gap in technical fields.
              </p>
            </motion.div>

            <motion.div
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
              variants={containerStagger}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.2 }}
            >
              {benefits.map((b) => (
                <motion.div
                  key={b.title}
                  variants={fadeUpItem}
                  whileHover={{ y: -6 }}
                  transition={{ type: "spring", stiffness: 250, damping: 20 }}
                  className="p-8 bg-surface border border-border rounded-3xl shadow-sm hover:shadow-md dark:hover:shadow-[0_4px_20px_rgba(255,60,110,0.1)] hover:border-primary/20 card-hover"
                >
                  <motion.div
                    initial={{ scale: 0, rotate: -20 }}
                    whileInView={{ scale: 1, rotate: 0 }}
                    viewport={{ once: true }}
                    transition={{ type: "spring", stiffness: 260, damping: 14, delay: 0.1 }}
                  >
                    <CheckCircle className="w-8 h-8 text-primary mb-6" />
                  </motion.div>
                  <h3 className="text-lg font-bold text-foreground mb-2">{b.title}</h3>
                  <p className="text-foreground-muted text-sm leading-relaxed">{b.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-20 bg-surface transition-colors duration-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl font-extrabold text-foreground">Success Stories</h2>
              <p className="mt-3 text-foreground-muted max-w-xl mx-auto">
                Hear from women who accelerated their tech journeys using this platform.
              </p>
            </motion.div>

            <motion.div
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
              variants={containerStagger}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.2 }}
            >
              {[
                {
                  quote: "Usually, finding active, open-source programs and hackathons takes forever because of outdated sites. Having them curated here with direct links saved me so much lookup time.",
                  name: "Anjali Mehta",
                  title: "CS Student, MAIT Delhi",
                },
                {
                  quote: "The Kanban board (Opportunity Tracker) is a lifesaver. I used to track my applications in messy Notion sheets, but syncing bookmarks to stages directly is way cleaner.",
                  name: "Sneha Iyer",
                  title: "ECE Student, VIT Vellore",
                },
                {
                  quote: "I tried the AI resume audit tool in the Wallet and it gave me very practical pointers on fixing my bullet points. It's actually useful for college students preparing for internships.",
                  name: "Kirti Sharma",
                  title: "B.Tech, IGDTUW Delhi",
                },
              ].map((t) => (
                <motion.div
                  key={t.name}
                  variants={fadeUpItem}
                  whileHover={{ y: -4, scale: 1.01 }}
                  transition={{ type: "spring", stiffness: 250, damping: 20 }}
                  className="p-6 bg-background rounded-3xl border border-border hover:border-secondary/30 card-hover relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-secondary/60" />
                  <div className="flex gap-1 mb-4 text-accent-gold">
                    {[...Array(5)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.08, type: "spring", stiffness: 300 }}
                      >
                        <Star className="w-4 h-4 fill-current" />
                      </motion.div>
                    ))}
                  </div>
                  <p className="text-foreground-muted italic text-xs leading-relaxed mb-6">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <div>
                    <h5 className="font-bold text-foreground text-xs">{t.name}</h5>
                    <span className="text-foreground-muted text-[10px]">{t.title}</span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
