"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, updateDoc, collection, addDoc, getDocs, query, where, orderBy, limit } from "firebase/firestore";
import { Opportunity } from "@/lib/mockData";
import { useOpportunities } from "@/hooks/useOpportunities";
import { AIServiceClient, ResumeAnalysisResult, RoadmapResult, InterviewFeedbackResult } from "@/lib/aiServiceClient";
import {
  Sparkles,
  CheckCircle,
  AlertCircle,
  FileText,
  MessageSquare,
  Award,
  BookOpen,
  Send,
  Loader2,
  LineChart,
  UserCheck,
  Zap,
  TrendingUp,
  BookmarkCheck
} from "lucide-react";

export default function AIHub() {
  const { currentUser, profile, loading: authLoading } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<
    "eligibility" | "recommendations" | "resume" | "roadmap" | "chat" | "interview" | "analytics"
  >("eligibility");

  useEffect(() => {
    if (!authLoading && !currentUser) {
      router.push("/auth/login");
    }
  }, [currentUser, authLoading, router]);

  if (authLoading || !currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary/30">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <main className="flex-grow bg-[#fdf8f9] min-h-screen py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-10 text-center sm:text-left">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 px-3 py-1.5 rounded-full">
              <Sparkles className="w-4 h-4" /> AI Hub Workspace
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-foreground mt-3 tracking-tight">
              Intelligent Career Guidance
            </h1>
            <p className="text-sm text-slate-500 mt-2 max-w-2xl">
              Check eligibility, analyze your resume, generate personalized learning roadmaps, mock-interview with an AI coach, and chat with our career assistant.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Left Nav menu */}
            <div className="lg:col-span-1 space-y-2 bg-white/70 backdrop-blur border border-slate-100 p-5 rounded-3xl shadow-sm h-fit">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-4 px-3">
                AI Instruments
              </h4>
              {[
                { id: "eligibility", label: "Eligibility Checker", icon: UserCheck },
                { id: "recommendations", label: "Opportunity Matcher", icon: Award },
                { id: "resume", label: "ATS Resume Scan", icon: FileText },
                { id: "roadmap", label: "Career Roadmap", icon: BookOpen },
                { id: "chat", label: "Career Chatbot", icon: MessageSquare },
                { id: "interview", label: "Interview Coach", icon: Zap },
                { id: "analytics", label: "Performance Tracker", icon: LineChart },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold text-left transition-all ${
                      isActive
                        ? "bg-primary text-white shadow-md shadow-primary/10"
                        : "text-slate-700 hover:bg-primary/50 hover:text-primary"
                    }`}
                  >
                    <Icon className="w-4.5 h-4.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Main Tabs Container */}
            <div className="lg:col-span-3 bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-sm">
              {activeTab === "eligibility" && <EligibilityCheckerTab />}
              {activeTab === "recommendations" && <RecommendationsTab />}
              {activeTab === "resume" && <ResumeTab />}
              {activeTab === "roadmap" && <RoadmapTab />}
              {activeTab === "chat" && <ChatTab />}
              {activeTab === "interview" && <InterviewTab />}
              {activeTab === "analytics" && <AnalyticsTab />}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

/* ==========================================================================
   TAB 1: ELIGIBILITY CHECKER
   ========================================================================== */
function EligibilityCheckerTab() {
  const { profile } = useAuth();
  const { opportunities } = useOpportunities();
  const [selectedOppId, setSelectedOppId] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    score: number;
    mismatches: string[];
    explanation: string;
  } | null>(null);

  useEffect(() => {
    if (!selectedOppId && opportunities.length > 0) {
      setSelectedOppId(opportunities[0].id);
    }
  }, [opportunities, selectedOppId]);

  const checkEligibility = async () => {
    if (!profile) return;
    setLoading(true);
    try {
      const opp = opportunities.find((o) => o.id === selectedOppId);
      if (!opp) return;

      const mismatches: string[] = [];
      let matchPoints = 5;

      // 1. Gender check
      if (opp.eligibility.toLowerCase().includes("women") || opp.eligibility.toLowerCase().includes("female")) {
        // Platform is targeted for women. Always matched.
      }

      // 2. Education check
      if (opp.degreeLevel) {
        const userEdu = (profile.education || "").toLowerCase();
        const reqEdu = opp.degreeLevel.toLowerCase();
        if (userEdu && !userEdu.includes(reqEdu) && !reqEdu.includes(userEdu)) {
          mismatches.push(`Required Education: ${opp.degreeLevel} (Current: ${profile.education})`);
          matchPoints--;
        }
      }

      // 3. Location check
      if (opp.country && opp.country !== "Global") {
        const userLoc = (profile.location || "").toLowerCase();
        const oppLoc = opp.country.toLowerCase();
        if (userLoc && !userLoc.includes(oppLoc) && !oppLoc.includes(userLoc)) {
          mismatches.push(`Required Location: ${opp.country} (Current: ${profile.location})`);
          matchPoints--;
        }
      }

      // 4. Income bracket check
      if (opp.incomeLimit && profile.income) {
        const userIncome = parseInt(profile.income);
        if (userIncome > opp.incomeLimit) {
          mismatches.push(`Opportunity has a family income limit of $${opp.incomeLimit.toLocaleString()} (Your Selection: $${userIncome.toLocaleString()})`);
          matchPoints--;
        }
      }

      // Calculate score percentage
      const score = Math.round((matchPoints / 5) * 100);

      // Fetch natural-language analysis using Gemini
      const explanation = await AIServiceClient.explainEligibility(opp.title, mismatches, score);

      setResult({
        score,
        mismatches,
        explanation,
      });

      // Save to Firebase logs if possible
      const { currentUser } = useAuth();
      if (currentUser) {
        await addDoc(collection(db, "eligibility_checks"), {
          uid: currentUser.uid,
          opportunityId: opp.id,
          opportunityTitle: opp.title,
          score,
          mismatches,
          timestamp: new Date().toISOString(),
        });
      }

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <UserCheck className="w-5 h-5 text-primary" /> Opportunity Eligibility Checker
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Verify your eligibility against database rules, and receive structured action suggestions from Gemini.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-[10px] uppercase font-bold text-slate-400 mb-2">
            Select Opportunity to check
          </label>
          <select
            value={selectedOppId}
            onChange={(e) => setSelectedOppId(e.target.value)}
            className="w-full text-xs px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-primary transition-all"
          >
            {opportunities.map((o) => (
              <option key={o.id} value={o.id}>
                {o.title} — {o.organization}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={checkEligibility}
          disabled={loading}
          className="w-full py-3 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify Eligibility Matrix"}
        </button>
      </div>

      {result && (
        <div className="border-t border-slate-100 pt-6 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 bg-primary/30 rounded-2xl border border-primary/10">
            <div>
              <h4 className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                Eligibility Score
              </h4>
              <span className="text-3xl font-black text-primary">{result.score}%</span>
            </div>
            <div className="flex items-center gap-2">
              {result.score >= 80 ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-green-600 bg-green-50 px-2.5 py-1 rounded-full border border-green-150">
                  <CheckCircle className="w-3.5 h-3.5" /> High Match Probability
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-150">
                  <AlertCircle className="w-3.5 h-3.5" /> Gaps Identified
                </span>
              )}
            </div>
          </div>

          {result.mismatches.length > 0 && (
            <div>
              <h5 className="text-[10px] uppercase font-bold text-slate-400 mb-2">
                Identified Missing Matrix / Mismatches:
              </h5>
              <ul className="space-y-1">
                {result.mismatches.map((m, idx) => (
                  <li key={idx} className="text-xs text-red-500 font-medium flex items-center gap-2">
                    • {m}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <h5 className="text-[10px] uppercase font-bold text-slate-400 mb-2">
              AI Action Analysis (Gemini):
            </h5>
            <p className="text-slate-700 text-xs leading-relaxed p-4 bg-slate-50 rounded-2xl whitespace-pre-line border border-slate-100">
              {result.explanation}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

/* ==========================================================================
   TAB 2: OPPORTUNITY RECOMMENDATIONS (Matcher)
   ========================================================================== */
function RecommendationsTab() {
  const { profile } = useAuth();
  const { opportunities } = useOpportunities();
  const [loading, setLoading] = useState(false);
  const [recs, setRecs] = useState<{ opportunity: Opportunity; score: number; reason: string }[]>([]);

  const generateRecommendations = () => {
    if (!profile) return;
    setLoading(true);

    // Rule-based matching score
    const matches = opportunities.map((opp) => {
      let score = 50; // Base score
      const reasons: string[] = [];

      // 1. Category Matching
      if (profile.category && opp.category === profile.category) {
        score += 20;
        reasons.push(`Matches preferred category: ${profile.category}`);
      }

      // 2. Field Match
      const userInterests = profile.interests || [];
      const hasFieldMatch = userInterests.some((interest) =>
        opp.field.toLowerCase().includes(interest.toLowerCase())
      );
      if (hasFieldMatch) {
        score += 20;
        reasons.push(`Matches field of interest: ${opp.field}`);
      }

      // 3. Location preference
      if (profile.location && opp.country === profile.location) {
        score += 10;
        reasons.push(`Located in preferred country: ${opp.country}`);
      }

      return {
        opportunity: opp,
        score: Math.min(score, 100),
        reason: reasons.join(" • ") || "General opportunity matching career profile parameters.",
      };
    });

    // Sort by match score
    matches.sort((a, b) => b.score - a.score);
    setRecs(matches.slice(0, 3)); // Top 3
    setLoading(false);
  };

  useEffect(() => {
    generateRecommendations();
  }, [profile, opportunities]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Award className="w-5 h-5 text-primary" /> AI Career Opportunity Matcher
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Matches opportunities based on your skills, interests, and profile details using database logic.
        </p>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="py-12 flex justify-center">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {recs.map(({ opportunity, score, reason }) => (
              <div
                key={opportunity.id}
                className="bg-white border border-slate-100 hover:border-primary/20 p-6 rounded-3xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="flex justify-between items-start gap-4 mb-3">
                  <div>
                    <span className="text-[9px] font-bold uppercase tracking-wider bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                      {opportunity.category}
                    </span>
                    <h3 className="font-extrabold text-slate-800 text-sm mt-2 hover:text-primary transition-colors">
                      <Link href={`/opportunity/${opportunity.id}`}>{opportunity.title}</Link>
                    </h3>
                    <p className="text-slate-500 text-xs font-semibold">{opportunity.organization}</p>
                  </div>
                  <div className="text-right">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Match score</span>
                    <span className="text-base font-extrabold text-primary">{score}%</span>
                  </div>
                </div>

                <div className="bg-primary/30 border border-primary/10 p-3.5 rounded-2xl mt-4">
                  <span className="block text-[9px] font-bold uppercase tracking-wider text-primary mb-1">
                    Matching Criteria
                  </span>
                  <p className="text-slate-700 text-xs font-medium leading-relaxed">
                    {reason}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ==========================================================================
   TAB 3: RESUME ANALYZER (Scan)
   ========================================================================== */
function ResumeTab() {
  const { currentUser } = useAuth();
  const [resumeText, setResumeText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ResumeAnalysisResult | null>(null);
  const [history, setHistory] = useState<any[]>([]);

  const fetchHistory = async () => {
    if (!currentUser) return;
    try {
      const q = query(
        collection(db, "resume_analyses"),
        where("uid", "==", currentUser.uid),
        orderBy("timestamp", "desc"),
        limit(3)
      );
      const snap = await getDocs(q);
      const list: any[] = [];
      snap.forEach((d) => list.push({ id: d.id, ...d.data() }));
      setHistory(list);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [currentUser]);

  const analyzeResume = async () => {
    if (!resumeText.trim()) return;
    setLoading(true);
    try {
      const analysis = await AIServiceClient.analyzeResume(resumeText);
      setResult(analysis);

      if (currentUser) {
        await addDoc(collection(db, "resume_analyses"), {
          uid: currentUser.uid,
          atsScore: analysis.atsScore,
          strengths: analysis.strengths,
          weaknesses: analysis.weaknesses,
          missingSkills: analysis.missingSkills,
          formattingFeedback: analysis.formattingFeedback,
          improvementSuggestions: analysis.improvementSuggestions,
          timestamp: new Date().toISOString(),
        });
        await fetchHistory();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" /> AI ATS Resume Scanner
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Paste your resume text to get formatted formatting advice, ATS scoring, and skill addition templates from Gemini.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-[10px] uppercase font-bold text-slate-400 mb-2">
            Paste Resume Plain Text
          </label>
          <textarea
            rows={6}
            placeholder="Paste raw text of your resume here to analyze structure, skills, and formats..."
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            className="w-full text-xs p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:bg-white focus:border-primary resize-none"
          />
        </div>

        <button
          onClick={analyzeResume}
          disabled={loading || !resumeText.trim()}
          className="w-full py-3 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Run AI Scan & ATS Grade"}
        </button>
      </div>

      {result && (
        <div className="border-t border-slate-100 pt-6 space-y-5">
          <div className="p-5 bg-primary/30 rounded-2xl border border-primary/10 flex justify-between items-center">
            <div>
              <h4 className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                ATS Score Estimation
              </h4>
              <span className="text-3xl font-black text-primary">{result.atsScore}/100</span>
            </div>
            <div>
              {result.atsScore >= 75 ? (
                <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2.5 py-1 rounded-full border border-green-150">
                  Ready to Apply
                </span>
              ) : (
                <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-150">
                  Needs Revision
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <h5 className="text-[10px] uppercase font-bold text-slate-400 mb-2">Strengths Identified</h5>
              <ul className="space-y-1">
                {result.strengths.map((s, i) => (
                  <li key={i} className="text-xs text-slate-700 flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-green-500" /> {s}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <h5 className="text-[10px] uppercase font-bold text-slate-400 mb-2">Areas of Weaknesses</h5>
              <ul className="space-y-1">
                {result.weaknesses.map((w, i) => (
                  <li key={i} className="text-xs text-slate-700 flex items-center gap-2">
                    <AlertCircle className="w-3.5 h-3.5 text-red-400" /> {w}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <h5 className="text-[10px] uppercase font-bold text-slate-400 mb-2">Missing Skills from Industry</h5>
            <div className="flex flex-wrap gap-2">
              {result.missingSkills.map((sk, i) => (
                <span key={i} className="text-[10px] font-bold uppercase bg-primary/10 text-primary px-2.5 py-1 rounded-full">
                  {sk}
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <h5 className="text-[10px] uppercase font-bold text-slate-400">Improvement Suggestions</h5>
            <p className="text-slate-700 text-xs leading-relaxed">
              {result.formattingFeedback}
            </p>
            <ul className="space-y-1 pt-2">
              {result.improvementSuggestions.map((s, i) => (
                <li key={i} className="text-xs text-slate-600">
                  - {s}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {history.length > 0 && (
        <div className="border-t border-slate-100 pt-6">
          <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-4">
            Recent Analysis History
          </h4>
          <div className="space-y-3">
            {history.map((h, i) => (
              <div key={i} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl text-xs">
                <div>
                  <span className="font-bold text-slate-800">ATS Score: {h.atsScore}/100</span>
                  <span className="block text-[10px] text-slate-500 mt-0.5">
                    {new Date(h.timestamp).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ==========================================================================
   TAB 4: ROADMAP GENERATOR
   ========================================================================== */
function RoadmapTab() {
  const { profile, currentUser } = useAuth();
  const [goal, setGoal] = useState("");
  const [time, setTime] = useState("10 hours/week");
  const [loading, setLoading] = useState(false);
  const [roadmap, setRoadmap] = useState<RoadmapResult | null>(null);

  const fetchRoadmap = async () => {
    if (!currentUser) return;
    try {
      const snap = await getDoc(doc(db, "roadmaps", currentUser.uid));
      if (snap.exists()) {
        setRoadmap(snap.data() as RoadmapResult);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchRoadmap();
  }, [currentUser]);

  const generateRoadmap = async () => {
    if (!goal.trim() || !profile) return;
    setLoading(true);
    try {
      const skillsStr = (profile.skills || []).join(", ") || "None listed";
      const roadmapData = await AIServiceClient.generateRoadmap(
        skillsStr,
        profile.education || "Bachelor",
        goal,
        time
      );
      setRoadmap(roadmapData);

      if (currentUser) {
        await setDoc(doc(db, "roadmaps", currentUser.uid), roadmapData);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary" /> Personalized Career Roadmap
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Select roadmap goals to customize structural timelines, projects, and learning references through Gemini.
        </p>
      </div>

      <div className="space-y-4 bg-slate-50 p-6 rounded-3xl border border-slate-100">
        <div>
          <label className="block text-[10px] uppercase font-bold text-slate-400 mb-2">
            Target Career Goal / Job Title
          </label>
          <input
            type="text"
            placeholder="e.g. Junior Frontend Developer, AI Research Specialist"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            className="w-full text-xs px-3.5 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-primary transition-all"
          />
        </div>

        <div>
          <label className="block text-[10px] uppercase font-bold text-slate-400 mb-2">
            Weekly Study Time Allotted
          </label>
          <select
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full text-xs px-3.5 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-primary transition-all"
          >
            <option value="5 hours/week">Light (5 hours/week)</option>
            <option value="10 hours/week">Moderate (10 hours/week)</option>
            <option value="20 hours/week">Intensive (20 hours/week)</option>
          </select>
        </div>

        <button
          onClick={generateRoadmap}
          disabled={loading || !goal.trim()}
          className="w-full py-3 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Build Career Roadmap"}
        </button>
      </div>

      {roadmap && (
        <div className="border-t border-slate-100 pt-6 space-y-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-primary">
            Your Custom Journey Plan
          </h3>

          <div className="space-y-6">
            {roadmap.milestones.map((m, idx) => (
              <div key={idx} className="relative pl-6 pb-6 last:pb-0 border-l border-primary/20">
                <div className="absolute top-0.5 -left-1.5 w-3 h-3 rounded-full bg-primary"></div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <h4 className="font-extrabold text-slate-800 text-sm">{m.title}</h4>
                    <span className="text-[10px] font-bold uppercase bg-primary/10 text-primary px-2.5 py-1 rounded-full">
                      {m.timeline}
                    </span>
                  </div>
                  <p className="text-slate-600 text-xs leading-relaxed">{m.description}</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <span className="block text-[9px] font-bold uppercase text-slate-400 mb-1">
                        Courses & Resource Links
                      </span>
                      <ul className="space-y-0.5">
                        {m.recommendedCourses.map((c, i) => (
                          <li key={i} className="text-xs text-slate-700">
                            - {c}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <span className="block text-[9px] font-bold uppercase text-slate-400 mb-1">
                        Build Projects
                      </span>
                      <ul className="space-y-0.5">
                        {m.recommendedProjects.map((p, i) => (
                          <li key={i} className="text-xs text-slate-700">
                            - {p}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ==========================================================================
   TAB 5: CAREER CHATBOT
   ========================================================================== */
function ChatTab() {
  const { currentUser, profile } = useAuth();
  const [messages, setMessages] = useState<{ role: "user" | "model"; text: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchChatHistory = async () => {
    if (!currentUser) return;
    try {
      const snap = await getDoc(doc(db, "chat_history", currentUser.uid));
      if (snap.exists()) {
        setMessages(snap.data().messages || []);
      } else {
        setMessages([
          {
            role: "model",
            text: "Hello! I am your career advisor at Bloom. How can I help you find resources, improve your resume, or plan roadmap targets today?",
          },
        ]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchChatHistory();
  }, [currentUser]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput("");
    const newMessages = [...messages, { role: "user" as const, text: userMsg }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const chatResponse = await AIServiceClient.getChatbotResponse(
        userMsg,
        newMessages,
        profile || {}
      );

      const finalMessages = [...newMessages, { role: "model" as const, text: chatResponse }];
      setMessages(finalMessages);

      if (currentUser) {
        await setDoc(doc(db, "chat_history", currentUser.uid), { messages: finalMessages });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 flex flex-col h-[550px]">
      <div>
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-primary" /> AI Career Chatbot
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Chat with a context-aware assistant loaded with your profile settings. Unrelated questions are filtered.
        </p>
      </div>

      <div className="flex-grow bg-slate-50 border border-slate-100 rounded-3xl p-4 overflow-y-auto space-y-4 flex flex-col justify-between">
        <div className="space-y-3 flex-grow overflow-y-auto pr-2">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl p-4 text-xs leading-relaxed ${
                  m.role === "user"
                    ? "bg-primary text-white shadow-sm"
                    : "bg-white border border-slate-100 text-slate-700 shadow-sm"
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white border border-slate-100 text-slate-600 rounded-2xl px-4 py-3 text-xs flex items-center gap-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                <span>Bloom Assistant is typing...</span>
              </div>
            </div>
          )}
        </div>

        <form onSubmit={sendMessage} className="mt-4 flex gap-2">
          <input
            type="text"
            placeholder="Ask anything about scholarships, resumes, careers..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            className="flex-grow text-xs px-4 py-3 bg-white border border-slate-200 rounded-2xl outline-none focus:border-primary transition-all"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="p-3 bg-primary hover:bg-primary-hover text-white rounded-2xl shadow-sm transition-all disabled:opacity-60 flex items-center justify-center"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}

/* ==========================================================================
   TAB 6: INTERVIEW COACH
   ========================================================================== */
function InterviewTab() {
  const { currentUser } = useAuth();
  const [jobTitle, setJobTitle] = useState("Frontend Engineer");
  const [stage, setStage] = useState<"setup" | "interviewing" | "feedback">("setup");
  const [questions, setQuestions] = useState<string[]>([]);
  const [answers, setAnswers] = useState<string[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<InterviewFeedbackResult | null>(null);

  const startInterview = () => {
    // Generate questions locally based on role for rule compliance
    const interviewQuestionsMap: Record<string, string[]> = {
      "Frontend Engineer": [
        "What are the benefits of Server Components vs Client Components in Next.js?",
        "Explain how closures work in JavaScript and why you might use one.",
        "How do you optimize page loading performance in React applications?"
      ],
      "Backend Engineer": [
        "How would you handle database connection pooling in a scalable Node.js application?",
        "Explain the differences between SQL and NoSQL database structures.",
        "What are the best practices for designing a secure and scalable REST API?"
      ],
      "Product Manager": [
        "How do you prioritize features for a product roadmap under resource constraints?",
        "Explain how you would measure user engagement metrics for a new feature.",
        "How do you manage disagreements between design and software engineering teams?"
      ]
    };

    const qs = interviewQuestionsMap[jobTitle] || interviewQuestionsMap["Frontend Engineer"];
    setQuestions(qs);
    setAnswers(new Array(qs.length).fill(""));
    setCurrentIdx(0);
    setStage("interviewing");
  };

  const handleAnswerSubmit = async () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      // Evaluate answers with Gemini
      setLoading(true);
      setStage("feedback");
      try {
        const payload = questions.map((q, idx) => ({
          question: q,
          answer: answers[idx],
        }));

        const result = await AIServiceClient.getInterviewFeedback(jobTitle, payload);
        setFeedback(result);

        if (currentUser) {
          await addDoc(collection(db, "interviews"), {
            uid: currentUser.uid,
            jobTitle,
            feedback: result,
            timestamp: new Date().toISOString(),
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Zap className="w-5 h-5 text-primary" /> AI Technical Interview Coach
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Simulate structured questions based on chosen roles and receive technical feedback summaries from Gemini.
        </p>
      </div>

      {stage === "setup" && (
        <div className="space-y-4 p-6 bg-slate-50 border border-slate-100 rounded-3xl">
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-2">
              Select Position Role
            </label>
            <select
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              className="w-full text-xs px-3.5 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-primary transition-all"
            >
              <option value="Frontend Engineer">Frontend Engineer</option>
              <option value="Backend Engineer">Backend Engineer</option>
              <option value="Product Manager">Product Manager</option>
            </select>
          </div>

          <button
            onClick={startInterview}
            className="w-full py-3 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition-all"
          >
            Begin Interview Session
          </button>
        </div>
      )}

      {stage === "interviewing" && questions.length > 0 && (
        <div className="space-y-4">
          <div className="flex justify-between items-center text-[10px] font-bold text-slate-400">
            <span>QUESTION {currentIdx + 1} OF {questions.length}</span>
            <span className="text-primary">{jobTitle} Interview</span>
          </div>

          <div className="p-5 bg-primary/30 border border-primary/10 rounded-2xl">
            <p className="text-slate-800 text-xs font-bold leading-relaxed">
              {questions[currentIdx]}
            </p>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-2">
              Your Answer Response
            </label>
            <textarea
              rows={4}
              placeholder="Type your response to the question in detail..."
              value={answers[currentIdx]}
              onChange={(e) => {
                const updated = [...answers];
                updated[currentIdx] = e.target.value;
                setAnswers(updated);
              }}
              className="w-full text-xs p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:bg-white focus:border-primary resize-none"
            />
          </div>

          <button
            onClick={handleAnswerSubmit}
            disabled={!answers[currentIdx].trim()}
            className="w-full py-3 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition-all disabled:opacity-60"
          >
            {currentIdx < questions.length - 1 ? "Next Question" : "Complete & Evaluate"}
          </button>
        </div>
      )}

      {stage === "feedback" && (
        <div className="space-y-6">
          {loading ? (
            <div className="py-12 flex flex-col items-center gap-2">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <span className="text-xs text-slate-500">Gemini is evaluating your responses...</span>
            </div>
          ) : (
            feedback && (
              <div className="space-y-5">
                <div className="p-5 bg-primary/30 border border-primary/10 rounded-2xl flex justify-between items-center">
                  <div>
                    <h4 className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                      Confidence & Tone Rating
                    </h4>
                    <span className="text-3xl font-black text-primary">{feedback.confidenceScore}/100</span>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2">
                  <h5 className="text-[10px] uppercase font-bold text-slate-400">Technical Evaluation</h5>
                  <p className="text-slate-700 text-xs leading-relaxed">{feedback.technicalFeedback}</p>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2">
                  <h5 className="text-[10px] uppercase font-bold text-slate-400">Communication & Structure</h5>
                  <p className="text-slate-700 text-xs leading-relaxed">{feedback.communicationFeedback}</p>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2">
                  <h5 className="text-[10px] uppercase font-bold text-slate-400">Improvement Suggestions</h5>
                  <ul className="space-y-1">
                    {feedback.improvementSuggestions.map((s, i) => (
                      <li key={i} className="text-xs text-slate-700">
                        - {s}
                      </li>
                    ))}
                  </ul>
                </div>

                {feedback.followUpQuestions && feedback.followUpQuestions.length > 0 && (
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2">
                    <h5 className="text-[10px] uppercase font-bold text-slate-400">Follow-up Questions to Practice</h5>
                    <ul className="space-y-1">
                      {feedback.followUpQuestions.map((q, i) => (
                        <li key={i} className="text-xs text-slate-700 italic">
                          "{q}"
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <button
                  onClick={() => setStage("setup")}
                  className="w-full py-3 border border-slate-200 hover:border-primary hover:text-primary text-slate-600 text-xs font-bold rounded-xl transition-all"
                >
                  Start New Session
                </button>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}

/* ==========================================================================
   TAB 7: ANALYTICS & CONFIDENCE TRACKER
   ========================================================================== */
function AnalyticsTab() {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    profileCompletion: 80,
    resumeScanScore: 0,
    interviewSessionCount: 0,
    eligibilityChecksRun: 0,
  });
  const [summary, setSummary] = useState("");

  const loadAnalytics = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      // Fetch stats
      const resumeSnap = await getDocs(
        query(collection(db, "resume_analyses"), where("uid", "==", currentUser.uid), limit(5))
      );
      let latestATS = 0;
      resumeSnap.forEach((d) => {
        latestATS = d.data().atsScore;
      });

      const interviewSnap = await getDocs(
        query(collection(db, "interviews"), where("uid", "==", currentUser.uid))
      );
      const interviewCount = interviewSnap.size;

      const eligibilitySnap = await getDocs(
        query(collection(db, "eligibility_checks"), where("uid", "==", currentUser.uid))
      );
      const eligibilityCount = eligibilitySnap.size;

      const currentStats = {
        profileCompletion: 90,
        resumeScanScore: latestATS || 65,
        interviewSessionCount: interviewCount,
        eligibilityChecksRun: eligibilityCount,
      };

      setStats(currentStats);

      // Generate Gemini tracking text
      const progressSummary = await AIServiceClient.trackConfidence(currentStats);
      setSummary(progressSummary);

    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, [currentUser]);

  if (loading) {
    return (
      <div className="py-12 flex justify-center">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <LineChart className="w-5 h-5 text-primary" /> AI Performance & Analytics Dashboard
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Overview metrics compiled from database rule actions, with monthly progress digests generated by Gemini.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Profile Integrity", value: `${stats.profileCompletion}%` },
          { label: "Latest ATS Score", value: `${stats.resumeScanScore}/100` },
          { label: "Practice Interviews", value: stats.interviewSessionCount },
          { label: "Eligibility Scans", value: stats.eligibilityChecksRun },
        ].map((stat, idx) => (
          <div key={idx} className="bg-slate-50 border border-slate-100 p-4 rounded-2xl">
            <span className="block text-[9px] font-bold uppercase text-slate-400">{stat.label}</span>
            <span className="text-lg font-black text-foreground mt-1 block">{stat.value}</span>
          </div>
        ))}
      </div>

      <div className="p-5 bg-primary/30 border border-primary/10 rounded-2xl flex flex-col md:flex-row items-start gap-4">
        <div className="p-3 bg-white rounded-2xl border border-primary/10 text-primary shadow-sm">
          <TrendingUp className="w-5 h-5" />
        </div>
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
            Monthly AI Progress Summary (Gemini)
          </span>
          <p className="text-slate-700 text-xs leading-relaxed mt-2 whitespace-pre-line font-medium">
            {summary}
          </p>
        </div>
      </div>
    </div>
  );
}
