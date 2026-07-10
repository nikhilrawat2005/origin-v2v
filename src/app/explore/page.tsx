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

function ExploreContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { currentUser, profile } = useAuth();
  const { opportunities, loading: oppsLoading } = useOpportunities();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
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
        <div className="lg:col-span-1 bg-surface border border-border rounded-3xl p-6 shadow-sm h-fit transition-colors duration-300">
          <div className="flex items-center gap-2 font-bold text-foreground mb-6 pb-4 border-b border-border">
            <Filter className="w-4 h-4 text-primary" />
            <span>Filters</span>
          </div>

          <div className="space-y-5">
            {/* Category Select */}
            <div>
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
            </div>

            {/* Degree Select */}
            <div>
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
            </div>

            {/* Field Select */}
            <div>
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
            </div>

            {/* Country Select */}
            <div>
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
            </div>

            {/* Income Bracket Limit */}
            <div>
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
            </div>

            {/* Clear Filters Button */}
            <button
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
            </button>
          </div>
        </div>

        {/* Right Opportunities Grid */}
        <div className="lg:col-span-3 space-y-6">
          {/* Universal Search input */}
          <div className="flex bg-surface rounded-2xl shadow-sm border border-border p-2 transition-colors duration-300">
            <div className="flex items-center flex-grow pl-3">
              <Search className="text-foreground-muted w-4 h-4 mr-2 flex-shrink-0" />
              <input
                type="text"
                placeholder="Search by keywords (e.g. Google, Fellowship, Science)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs outline-none text-foreground bg-transparent placeholder-foreground-muted"
              />
            </div>
          </div>

          {/* Results Summary */}
          <div className="text-foreground-muted text-xs font-medium">
            {oppsLoading
              ? "Loading opportunities..."
              : `Showing ${filteredOpportunities.length} opportunities matching your criteria.`}
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredOpportunities.map((opp) => {
              const isSaved = savedIds.includes(opp.id);
              return (
                <div
                  key={opp.id}
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
                </div>
              );
            })}
          </div>

          {filteredOpportunities.length === 0 && (
            <div className="text-center py-20 bg-surface border border-border rounded-3xl transition-colors">
              <Compass className="w-12 h-12 text-foreground-muted mx-auto mb-4 opacity-50" />
              <h4 className="text-foreground font-bold mb-1">No opportunities found</h4>
              <p className="text-foreground-muted text-xs">Try resetting or loosening your search query.</p>
            </div>
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
