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
    { name: "Scholarships", icon: GraduationCap, color: "text-purple-600 bg-purple-50" },
    { name: "Fellowships", icon: Users, color: "text-indigo-600 bg-indigo-50" },
    { name: "Internships", icon: Briefcase, color: "text-blue-600 bg-blue-50" },
    { name: "Conferences", icon: Compass, color: "text-pink-600 bg-pink-50" },
    { name: "Hackathons", icon: Trophy, color: "text-amber-600 bg-amber-50" },
    { name: "STEM Programs", icon: Sparkles, color: "text-violet-600 bg-violet-50" },
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
        <section className="relative overflow-hidden py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-purple-50/50 via-white to-transparent">
          {/* Animated decorative backgrounds */}
          <div className="absolute top-1/4 left-1/10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
          <div className="absolute top-1/3 right-1/10 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-2000"></div>

          <div className="max-w-5xl mx-auto text-center relative z-10">
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-brand-purple/10 text-brand-purple mb-6"
            >
              <Sparkles className="w-3.5 h-3.5" /> Empowering Female Leaders
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl sm:text-6xl font-extrabold text-brand-navy tracking-tight leading-none mb-6"
            >
              Discover Your Next <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-purple to-brand-indigo">
                Career-Defining Opportunity
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed"
            >
              Aura connects women to global scholarships, fellowships, internships, hackathons, and STEM programs. Zero clutter. Just verified paths to advance your career.
            </motion.p>

            {/* Search Bar */}
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              onSubmit={handleSearchSubmit}
              className="max-w-2xl mx-auto flex items-center bg-white rounded-full p-2 shadow-lg border border-slate-100 mb-12"
            >
              <div className="flex items-center flex-grow pl-4">
                <Search className="text-slate-400 w-5 h-5 mr-2" />
                <input
                  type="text"
                  placeholder="Search scholarships, internships, fields..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-sm outline-none text-slate-700 placeholder-slate-400 bg-transparent py-2.5"
                />
              </div>
              <button
                type="submit"
                className="bg-brand-purple hover:bg-brand-indigo text-white font-semibold text-sm px-6 py-3 rounded-full transition-all shadow-md flex items-center gap-1.5"
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
                className="px-6 py-3.5 bg-brand-navy hover:bg-slate-800 text-white font-semibold rounded-full shadow-md transition-all flex items-center gap-2"
              >
                Join Platform
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/explore"
                className="px-6 py-3.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold rounded-full shadow-sm transition-all"
              >
                Explore Opportunities
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-extrabold text-brand-navy">Explore by Category</h2>
              <p className="mt-3 text-slate-500 max-w-xl mx-auto">
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
                    className="flex flex-col items-center p-6 bg-slate-50 hover:bg-slate-100/80 rounded-2xl border border-slate-100 hover:border-slate-200 transition-all text-center group"
                  >
                    <div className={`p-4 rounded-xl mb-4 transition-transform group-hover:scale-110 ${cat.color}`}>
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <span className="font-semibold text-sm text-slate-800 group-hover:text-brand-purple transition-colors">
                      {cat.name}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-20 bg-slate-50/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-extrabold text-brand-navy">Why Join Aura?</h2>
              <p className="mt-3 text-slate-500 max-w-xl mx-auto">
                Built specifically to solve accessibility barriers and bridge the gender gap in technical fields.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {benefits.map((b) => (
                <div key={b.title} className="p-8 bg-white border border-slate-100 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
                  <CheckCircle className="w-8 h-8 text-brand-purple mb-6" />
                  <h3 className="text-lg font-bold text-slate-800 mb-2">{b.title}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{b.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-extrabold text-brand-navy">Success Stories</h2>
              <p className="mt-3 text-slate-500 max-w-xl mx-auto">
                Hear from women who accelerated their tech journeys using this platform.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100">
                <div className="flex gap-1 mb-4 text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-500" />
                  ))}
                </div>
                <p className="text-slate-700 italic text-sm leading-relaxed mb-6">
                  "Thanks to this platform, I discovered the Google Generation Scholarship. The search criteria were so clear that I saved hours of lookup time and successfully landed the grant!"
                </p>
                <div>
                  <h5 className="font-bold text-slate-800 text-sm">Priya Sharma</h5>
                  <span className="text-slate-500 text-xs">CS Student at IIT Delhi</span>
                </div>
              </div>

              <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100">
                <div className="flex gap-1 mb-4 text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-500" />
                  ))}
                </div>
                <p className="text-slate-700 italic text-sm leading-relaxed mb-6">
                  "I had struggled to find international fellowships for research. Aura simplified my search. I got bookmarked notifications for Grace Hopper and got selected."
                </p>
                <div>
                  <h5 className="font-bold text-slate-800 text-sm">Jessica Miller</h5>
                  <span className="text-slate-500 text-xs">PhD Fellow in AI, Stanford University</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
