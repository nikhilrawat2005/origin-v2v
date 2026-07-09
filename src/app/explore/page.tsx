"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { mockOpportunities, Opportunity } from "@/lib/mockData";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
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
  const filteredOpportunities = mockOpportunities.filter((opp) => {
    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matchTitle = opp.title.toLowerCase().includes(query);
      const matchOrg = opp.organization.toLowerCase().includes(query);
      const matchDesc = opp.description.toLowerCase().includes(query);
      if (!matchTitle && !matchOrg && !matchDesc) return false;
    }

    // Category filter
    if (selectedCategory && opp.category !== selectedCategory) return false;

    // Degree Level filter
    if (selectedDegree && opp.degreeLevel && opp.degreeLevel !== selectedDegree) return false;

    // Field filter
    if (selectedField && opp.field.toLowerCase() !== selectedField.toLowerCase()) return false;

    // Country filter
    if (selectedCountry && opp.country.toLowerCase() !== selectedCountry.toLowerCase()) return false;

    // Family Income filter
    if (incomeLimit && opp.incomeLimit) {
      const limit = parseInt(incomeLimit);
      if (opp.incomeLimit < limit) return false;
    }

    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Title */}
      <div className="mb-8">
        <span className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-brand-purple">
          <Sparkles className="w-3.5 h-3.5" /> Exploration Hub
        </span>
        <h1 className="text-3xl font-extrabold text-brand-navy mt-1">Discover Opportunities</h1>
        <p className="text-sm text-slate-500 mt-1">
          Search and filter verified programs tailored to help women excel in STEM and professional careers.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Filters Panel */}
        <div className="lg:col-span-1 bg-white border border-slate-100 rounded-3xl p-6 shadow-sm h-fit">
          <div className="flex items-center gap-2 font-bold text-slate-800 mb-6 pb-4 border-b border-slate-100">
            <Filter className="w-4 h-4 text-brand-purple" />
            <span>Filters</span>
          </div>

          <div className="space-y-5">
            {/* Category Select */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-brand-purple transition-all"
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
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                Degree Level
              </label>
              <select
                value={selectedDegree}
                onChange={(e) => setSelectedDegree(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-brand-purple transition-all"
              >
                <option value="">All Levels</option>
                <option value="Bachelor">Bachelor</option>
                <option value="Master">Master</option>
                <option value="PhD">PhD</option>
              </select>
            </div>

            {/* Field Select */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                Field of Study
              </label>
              <select
                value={selectedField}
                onChange={(e) => setSelectedField(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-brand-purple transition-all"
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
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                Country
              </label>
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-brand-purple transition-all"
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
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                Family Income Bracket ($)
              </label>
              <select
                value={incomeLimit}
                onChange={(e) => setIncomeLimit(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-brand-purple transition-all"
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
              className="w-full text-xs text-center border border-slate-200 hover:border-brand-purple hover:text-brand-purple py-2.5 rounded-xl transition-all font-semibold text-slate-500"
            >
              Reset Filters
            </button>
          </div>
        </div>

        {/* Right Opportunities Grid */}
        <div className="lg:col-span-3 space-y-6">
          {/* Universal Search input */}
          <div className="flex bg-white rounded-2xl shadow-sm border border-slate-100 p-2">
            <div className="flex items-center flex-grow pl-3">
              <Search className="text-slate-400 w-4 h-4 mr-2" />
              <input
                type="text"
                placeholder="Search by keywords (e.g. Google, Fellowship, Science)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs outline-none text-slate-700 bg-transparent"
              />
            </div>
          </div>

          {/* Results Summary */}
          <div className="text-slate-500 text-xs font-medium">
            Showing {filteredOpportunities.length} opportunities matching your criteria.
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredOpportunities.map((opp) => {
              const isSaved = savedIds.includes(opp.id);
              return (
                <div
                  key={opp.id}
                  className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Header: Organization & Bookmark */}
                    <div className="flex items-center justify-between gap-4 mb-4">
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-brand-purple/10 text-brand-purple px-2.5 py-1 rounded-full">
                        {opp.category}
                      </span>
                      <button
                        onClick={() => toggleBookmark(opp.id)}
                        className={`p-1.5 rounded-full transition-colors ${
                          isSaved
                            ? "bg-brand-purple/10 text-brand-purple"
                            : "bg-slate-50 text-slate-400 hover:text-brand-purple"
                        }`}
                      >
                        {isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Title */}
                    <h3 className="font-bold text-slate-800 text-base leading-snug hover:text-brand-purple transition-colors">
                      <Link href={`/opportunity/${opp.id}`}>{opp.title}</Link>
                    </h3>
                    <p className="text-slate-500 text-xs mt-1 font-medium">{opp.organization}</p>

                    {/* Description excerpt */}
                    <p className="text-slate-600 text-xs mt-4 leading-relaxed line-clamp-3">
                      {opp.description}
                    </p>
                  </div>

                  {/* Metadata & Footer link */}
                  <div className="border-t border-slate-50 mt-6 pt-4 flex items-center justify-between text-[11px] text-slate-500">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {opp.country}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {new Date(opp.deadline).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>

                    <Link
                      href={`/opportunity/${opp.id}`}
                      className="flex items-center gap-0.5 text-brand-purple font-semibold hover:translate-x-0.5 transition-transform"
                    >
                      Details <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredOpportunities.length === 0 && (
            <div className="text-center py-20 bg-white border border-slate-100 rounded-3xl">
              <Compass className="w-12 h-12 text-slate-350 mx-auto mb-4" />
              <h4 className="text-slate-800 font-bold mb-1">No opportunities found</h4>
              <p className="text-slate-500 text-xs">Try resetting or loosening your search query.</p>
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
      <main className="flex-grow bg-slate-50 min-h-screen">
        <Suspense fallback={
          <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <Loader2 className="w-8 h-8 text-brand-purple animate-spin" />
          </div>
        }>
          <ExploreContent />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
