"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { useOpportunities, formatDeadline } from "@/hooks/useOpportunities";
import {
  Search,
  Filter,
  Calendar,
  MapPin,
  Bookmark,
  BookmarkCheck,
  ChevronRight,
  Sparkles,
  Compass,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence, type Variants } from "framer-motion";

const filterPanelVariants: Variants = {
  hidden: { opacity: 0, x: -16 },
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.35, ease: "easeOut", staggerChildren: 0.06, delayChildren: 0.1 },
  },
};

const filterFieldVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
};

const gridVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 16, scale: 0.98 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.32, ease: "easeOut" } },
  exit: { opacity: 0, scale: 0.97, transition: { duration: 0.15 } },
};

function SkeletonCard() {
  return (
    <div className="bg-surface border border-border rounded-3xl p-6 shadow-sm flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="skeleton h-5 w-20 rounded-full" />
        <div className="skeleton h-7 w-7 rounded-full" />
      </div>
      <div className="skeleton h-4 w-4/5" />
      <div className="skeleton h-3 w-2/5" />
      <div className="space-y-2 mt-2">
        <div className="skeleton h-3 w-full" />
        <div className="skeleton h-3 w-full" />
        <div className="skeleton h-3 w-3/5" />
      </div>
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
        <div className="skeleton h-3 w-24" />
        <div className="skeleton h-3 w-16" />
      </div>
    </div>
  );
}

function ExploreContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { currentUser, profile } = useAuth();
  const { opportunities, loading: oppsLoading } = useOpportunities();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [searchFocused, setSearchFocused] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "");
  const [selectedDegree, setSelectedDegree] = useState("");
  const [selectedField, setSelectedField] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [incomeLimit, setIncomeLimit] = useState("");
  const [savedIds, setSavedIds] = useState<string[]>([]);

  // Fetch bookmarks
  useEffect(() => {
    if (!currentUser) return;
    const fetchBookmarks = async () => {
      const snap = await getDoc(doc(db, "bookmarks", currentUser.uid));
      if (snap.exists()) {
        setSavedIds(snap.data().opportunityIds || []);
      }
    };
    fetchBookmarks();
  }, [currentUser]);

  // Handle bookmarking
  const toggleBookmark = async (oppId: string) => {
    if (!currentUser) {
      router.push("/auth/login");
      return;
    }

    const docRef = doc(db, "bookmarks", currentUser.uid);
    const isBookmarked = savedIds.includes(oppId);

    try {
      const snap = await getDoc(docRef);
      if (!snap.exists()) {
        await setDoc(docRef, { opportunityIds: [oppId] });
      } else {
        await updateDoc(docRef, {
          opportunityIds: isBookmarked ? arrayRemove(oppId) : arrayUnion(oppId),
        });
      }
      setSavedIds((prev) =>
        isBookmarked ? prev.filter((id) => id !== oppId) : [...prev, oppId]
      );
    } catch (error) {
      console.error("Bookmarking error:", error);
    }
  };

  // Filter logic
  const filteredOpportunities = opportunities.filter((opp) => {
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matchTitle = opp.title.toLowerCase().includes(query);
      const matchOrg = opp.organization.toLowerCase().includes(query);
      const matchDesc = opp.description.toLowerCase().includes(query);
      if (!matchTitle && !matchOrg && !matchDesc) return false;
    }

    if (selectedCategory && opp.category !== selectedCategory) return false;
    if (selectedDegree && opp.degreeLevel && opp.degreeLevel !== selectedDegree) return false;
    if (selectedField && opp.field.toLowerCase() !== selectedField.toLowerCase()) return false;
    if (selectedCountry && opp.country.toLowerCase() !== selectedCountry.toLowerCase()) return false;

    if (incomeLimit && opp.incomeLimit) {
      const limit = parseInt(incomeLimit);
      if (opp.incomeLimit < limit) return false;
    }

    return true;
  });

  const selectClass = "w-full text-xs px-3.5 py-2.5 bg-surface-raised border border-border rounded-xl outline-none focus:bg-surface focus:border-primary text-foreground transition-all";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Title */}
      <div className="mb-8">
        <span className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-primary">
          <Sparkles className="w-3.5 h-3.5" /> Exploration Hub
        </span>
        <h1 className="text-3xl font-extrabold text-foreground mt-1">Discover Opportunities</h1>
        <p className="text-sm text-foreground-muted mt-1">
          Search and filter verified programs tailored to help women excel in STEM and professional careers.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Filters Panel */}
        <motion.div
          initial="hidden"
          animate="show"
          variants={filterPanelVariants}
          className="lg:col-span-1 bg-surface border border-border rounded-3xl p-6 shadow-sm h-fit transition-colors duration-300"
        >
          <motion.div
            variants={filterFieldVariants}
            className="flex items-center gap-2 font-bold text-foreground mb-6 pb-4 border-b border-border"
          >
            <Filter className="w-4 h-4 text-primary" />
            <span>Filters</span>
          </motion.div>

          <div className="space-y-5">
            {/* Category Select */}
            <motion.div variants={filterFieldVariants}>
              <label className="block text-xs font-semibold uppercase tracking-wider text-foreground-muted mb-2">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className={selectClass}
              >
                <option value="">All Categories</option>
                <option value="Scholarships">Scholarships</option>
                <option value="Fellowships">Fellowships</option>
                <option value="Internships">Internships</option>
                <option value="Conferences">Conferences</option>
                <option value="Hackathons">Hackathons</option>
                <option value="STEM Programs">STEM Programs</option>
              </select>
            </motion.div>

            {/* Degree Select */}
            <motion.div variants={filterFieldVariants}>
              <label className="block text-xs font-semibold uppercase tracking-wider text-foreground-muted mb-2">
                Degree Level
              </label>
              <select
                value={selectedDegree}
                onChange={(e) => setSelectedDegree(e.target.value)}
                className={selectClass}
              >
                <option value="">All Levels</option>
                <option value="Bachelor">Bachelor</option>
                <option value="Master">Master</option>
                <option value="PhD">PhD</option>
              </select>
            </motion.div>

            {/* Field Select */}
            <motion.div variants={filterFieldVariants}>
              <label className="block text-xs font-semibold uppercase tracking-wider text-foreground-muted mb-2">
                Field of Study
              </label>
              <select
                value={selectedField}
                onChange={(e) => setSelectedField(e.target.value)}
                className={selectClass}
              >
                <option value="">All Fields</option>
                <option value="Computer Science">Computer Science</option>
                <option value="STEM">STEM / Science</option>
                <option value="Software Engineering">Software Engineering</option>
                <option value="Cybersecurity">Cybersecurity</option>
              </select>
            </motion.div>

            {/* Country Select */}
            <motion.div variants={filterFieldVariants}>
              <label className="block text-xs font-semibold uppercase tracking-wider text-foreground-muted mb-2">
                Country
              </label>
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className={selectClass}
              >
                <option value="">Global / All Countries</option>
                <option value="United States">United States</option>
                <option value="Canada">Canada</option>
                <option value="France">France</option>
                <option value="Global">Global</option>
              </select>
            </motion.div>

            {/* Income Bracket Limit */}
            <motion.div variants={filterFieldVariants}>
              <label className="block text-xs font-semibold uppercase tracking-wider text-foreground-muted mb-2">
                Family Income Bracket ($)
              </label>
              <select
                value={incomeLimit}
                onChange={(e) => setIncomeLimit(e.target.value)}
                className={selectClass}
              >
                <option value="">No Income Restriction</option>
                <option value="50000">Under $50,000</option>
                <option value="90000">Under $90,000</option>
                <option value="120000">Under $120,000</option>
              </select>
            </motion.div>

            {/* Clear Filters Button */}
            <motion.button
              variants={filterFieldVariants}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("");
                setSelectedDegree("");
                setSelectedField("");
                setSelectedCountry("");
                setIncomeLimit("");
              }}
              className="w-full text-xs text-center border border-border hover:border-primary hover:text-primary py-2.5 rounded-xl transition-all font-semibold text-foreground-muted hover:bg-primary/5"
            >
              Reset Filters
            </motion.button>
          </div>
        </motion.div>

        {/* Right Opportunities Grid */}
        <div className="lg:col-span-3 space-y-6">
          {/* Universal Search input */}
          <motion.div
            animate={{
              scale: searchFocused ? 1.01 : 1,
              boxShadow: searchFocused
                ? "0 0 0 3px var(--accent-glow), 0 8px 20px -8px rgba(178, 58, 92, 0.25)"
                : "0 1px 2px rgba(0,0,0,0.04)",
              borderColor: searchFocused ? "var(--primary)" : "var(--border)",
            }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="flex bg-surface rounded-2xl border p-2"
          >
            <div className="flex items-center flex-grow pl-3">
              <motion.span
                animate={{
                  scale: searchFocused ? 1.15 : 1,
                  color: searchFocused ? "var(--primary)" : "var(--foreground-muted)",
                }}
                transition={{ duration: 0.2 }}
                className="mr-2 flex-shrink-0 flex"
              >
                <Search className="w-4 h-4" />
              </motion.span>
              <input
                type="text"
                placeholder="Search by keywords (e.g. Google, Fellowship, Science)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                className="w-full text-xs outline-none text-foreground bg-transparent placeholder-foreground-muted"
              />
            </div>
          </motion.div>

          {/* Results Summary */}
          <div className="text-foreground-muted text-xs font-medium">
            {oppsLoading
              ? "Loading opportunities..."
              : `Showing ${filteredOpportunities.length} opportunities matching your criteria.`}
          </div>

          {/* Cards Grid */}
          {oppsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : (
            <motion.div
              initial="hidden"
              animate="show"
              variants={gridVariants}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              <AnimatePresence>
                {filteredOpportunities.map((opp) => {
                  const isSaved = savedIds.includes(opp.id);
                  return (
                    <motion.div
                      key={opp.id}
                      layout
                      variants={cardVariants}
                      initial="hidden"
                      animate="show"
                      exit="exit"
                      className="bg-surface border border-border rounded-3xl p-6 shadow-sm hover:shadow-md dark:hover:shadow-[0_4px_20px_rgba(255,60,110,0.12)] hover:border-primary/25 transition-all flex flex-col justify-between card-hover"
                    >
                      <div>
                    {/* Header: Organization & Bookmark */}
                    <div className="flex items-center justify-between gap-4 mb-4">
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary px-2.5 py-1 rounded-full">
                        {opp.category}
                      </span>
                      <button
                        onClick={() => toggleBookmark(opp.id)}
                        className={`p-1.5 rounded-full transition-colors ${
                          isSaved
                            ? "bg-primary/10 text-primary"
                            : "bg-surface-raised text-foreground-muted hover:text-primary hover:bg-primary/8"
                        }`}
                      >
                        {isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Title */}
                    <h3 className="font-bold text-foreground text-base leading-snug hover:text-primary transition-colors">
                      <Link href={`/opportunity/${opp.id}`}>{opp.title}</Link>
                    </h3>
                    <p className="text-foreground-muted text-xs mt-1 font-medium">{opp.organization}</p>

                    {/* Description excerpt */}
                    <p className="text-foreground-muted text-xs mt-4 leading-relaxed line-clamp-3">
                      {opp.description}
                    </p>
                  </div>

                  {/* Metadata & Footer link */}
                  <div className="border-t border-border mt-6 pt-4 flex items-center justify-between text-[11px] text-foreground-muted">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-foreground-muted" />
                        {opp.country}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-foreground-muted" />
                        {formatDeadline(opp.deadline)}
                      </span>
                    </div>

                    <Link
                      href={`/opportunity/${opp.id}`}
                      className="flex items-center gap-0.5 text-primary font-semibold hover:translate-x-0.5 transition-transform"
                    >
                      Details <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>
          )}

          {!oppsLoading && filteredOpportunities.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="text-center py-20 bg-surface border border-border rounded-3xl transition-colors"
            >
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                className="inline-flex"
              >
                <Compass className="w-12 h-12 text-foreground-muted mx-auto mb-4 opacity-50" />
              </motion.div>
              <h4 className="text-foreground font-bold mb-1">No opportunities found</h4>
              <p className="text-foreground-muted text-xs">Try resetting or loosening your search query.</p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Explore() {
  return (
    <>
      <Navbar />
      <main className="flex-grow bg-background min-h-screen transition-colors duration-300">
        <Suspense fallback={
          <div className="min-h-screen flex items-center justify-center bg-background">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        }>
          <ExploreContent />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
