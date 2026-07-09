"use client";

import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, updateDoc, onSnapshot } from "firebase/firestore";
import { useState, useEffect } from "react";
import {
  Wallet,
  FileText,
  UploadCloud,
  Download,
  Trash2,
  Sparkles,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Search,
} from "lucide-react";
import type { WalletDocument, WalletCategory } from "@/lib/types";

export default function WalletPage() {
  const { currentUser } = useAuth();
  const [documents, setDocuments] = useState<WalletDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<WalletCategory | "All">("All");

  // State for mock upload form
  const [uploading, setUploading] = useState(false);
  const [docName, setDocName] = useState("");
  const [docCategory, setDocCategory] = useState<WalletCategory>("Resume");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // State for AI Analysis modal/viewer
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [aiReport, setAiReport] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!currentUser) return;

    const q = query(collection(db, "wallet"), where("uid", "==", currentUser.uid));
    const unsub = onSnapshot(q, (snap) => {
      const items: WalletDocument[] = [];
      snap.forEach((d) => {
        items.push({ id: d.id, ...d.data() } as WalletDocument);
      });
      setDocuments(items);
      setLoading(false);
    });

    return () => unsub();
  }, [currentUser]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !docName.trim()) return;

    setUploading(true);
    try {
      // Simulate slow upload
      await new Promise((res) => setTimeout(res, 1200));

      const size = selectedFile ? selectedFile.size : Math.floor(Math.random() * 2000000) + 150000;
      const type = selectedFile ? selectedFile.type : "application/pdf";

      const newDoc = {
        uid: currentUser.uid,
        name: docName.trim(),
        category: docCategory,
        storagePath: `wallet/${currentUser.uid}/${Date.now()}_mock.pdf`,
        downloadURL: "https://bloom-platform.org/mock-document-download",
        sizeBytes: size,
        mimeType: type,
        uploadedAt: new Date().toISOString(),
      };

      await addDoc(collection(db, "wallet"), newDoc);

      // Reset
      setDocName("");
      setSelectedFile(null);
      // Trigger welcome notifications or automated matching
      const { seedOpportunityNotification } = await import("@/lib/automationEngine");
    } catch (err) {
      console.error("Upload error:", err);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, "wallet", id));
    } catch (err) {
      console.error("Delete document error:", err);
    }
  };

  // Mock AI Verification and Suggestion engine for resumes and files
  const handleAIVerify = async (docId: string, docName: string, category: WalletCategory) => {
    setAnalyzingId(docId);
    try {
      await new Promise((res) => setTimeout(res, 2000));

      let analysis = "";
      if (category === "Resume") {
        analysis = `### 🌸 Resume AI Audit Score: 87/100
- **Strengths**: Strong inclusion of leadership credentials and hackathon participation.
- **Opportunities**: Expand the "Projects" section by highlighting technologies (e.g. React, Next.js, Gemini API).
- **Match Suggestion**: Excellent fit for the "Generation Google Scholarship" and "NASA internship" due to strong CS background.`;
      } else if (category === "Certificates") {
        analysis = `### 🌸 Certification Verified!
- **Issuer**: Google Cloud Certified Associate
- **Authenticity**: 100% verified using mock credential hashes.
- **Impact**: Boosts your matching probability for technical internships by +15%.`;
      } else if (category === "ID Documents") {
        analysis = `### 🌸 ID Documents Verification Success
- **Verification status**: Matches profile name successfully.
- **Security Check**: Encryption matches privacy standards. Fully secured in Bloom's safe vault.`;
      } else {
        analysis = `### 🌸 AI Evaluation for "${docName}"
- **Status**: Document analyzed successfully.
- **Advice**: Link this project / certificate under your Profile details to show to prospective organization sponsors.`;
      }

      setAiReport((prev) => ({ ...prev, [docId]: analysis }));
    } catch (error) {
      console.error(error);
    } finally {
      setAnalyzingId(null);
    }
  };

  const categories: (WalletCategory | "All")[] = [
    "All",
    "Resume",
    "Certificates",
    "Awards",
    "Projects",
    "Portfolio",
    "ID Documents",
  ];

  const filteredDocs = activeTab === "All"
    ? documents
    : documents.filter((d) => d.category === activeTab);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-brand-purple animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-brand-navy flex items-center gap-2">
          <Wallet className="w-6 h-6 text-brand-purple" /> Opportunity Wallet
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Store your career documents, achievements, and credentials in a secure sandbox. Use AI to scan resumes and auto-verify certificates.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upload Panel */}
        <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm space-y-4 h-fit">
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
            <UploadCloud className="w-4 h-4 text-brand-purple" /> Upload Document
          </h3>

          <form onSubmit={handleUpload} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Document Name</label>
              <input
                type="text"
                placeholder="e.g. Software Engineering Resume 2026"
                value={docName}
                onChange={(e) => setDocName(e.target.value)}
                required
                className="w-full text-xs p-3 border border-slate-200 rounded-xl outline-none focus:border-brand-purple"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Asset Category</label>
              <select
                value={docCategory}
                onChange={(e) => setDocCategory(e.target.value as WalletCategory)}
                className="w-full text-xs p-3 border border-slate-200 rounded-xl outline-none bg-white focus:border-brand-purple"
              >
                {categories.slice(1).map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Mock Drag & Drop Box */}
            <div className="border border-dashed border-slate-200 rounded-xl p-4 text-center cursor-pointer hover:bg-slate-50 transition-colors">
              <input
                type="file"
                id="file-upload"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setSelectedFile(e.target.files[0]);
                    setDocName(e.target.files[0].name.split(".")[0]);
                  }
                }}
              />
              <label htmlFor="file-upload" className="cursor-pointer space-y-1 block">
                <UploadCloud className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-[10px] font-semibold text-slate-650">
                  {selectedFile ? selectedFile.name : "Select or drag file to mock upload"}
                </p>
                <p className="text-[8px] text-slate-400">PDF, PNG, JPG up to 10MB</p>
              </label>
            </div>

            <button
              type="submit"
              disabled={uploading}
              className="w-full py-3 bg-brand-purple hover:bg-brand-indigo text-white font-semibold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading to cloud...
                </>
              ) : (
                <>Upload Document</>
              )}
            </button>
          </form>
        </div>

        {/* Documents Grid */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tab Navigation */}
          <div className="flex gap-2 overflow-x-auto pb-1 border-b border-slate-100">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveTab(cat)}
                className={`pb-3 px-1 text-xs font-semibold whitespace-nowrap border-b-2 transition-all ${
                  activeTab === cat
                    ? "border-brand-purple text-brand-purple"
                    : "border-transparent text-slate-450 hover:text-slate-700"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* List */}
          <div className="space-y-4">
            {filteredDocs.map((doc) => (
              <div
                key={doc.id}
                className="p-5 bg-white border border-slate-100 rounded-3xl shadow-sm flex flex-col gap-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="p-3 bg-purple-50 text-brand-purple rounded-2xl">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm leading-snug">{doc.name}</h4>
                      <p className="text-[10px] text-slate-450 font-semibold uppercase tracking-wider mt-0.5">
                        {doc.category} • {(doc.sizeBytes / 1024).toFixed(0)} KB
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleAIVerify(doc.id, doc.name, doc.category)}
                      disabled={analyzingId === doc.id}
                      className="p-2 text-brand-purple hover:bg-purple-50 rounded-xl transition-all"
                      title="AI Audit"
                    >
                      {analyzingId === doc.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Sparkles className="w-4 h-4" />
                      )}
                    </button>
                    <a
                      href={doc.downloadURL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-slate-450 hover:text-slate-800 hover:bg-slate-50 rounded-xl transition-all"
                      title="Download document"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                    <button
                      onClick={() => handleDelete(doc.id)}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-slate-50 rounded-xl transition-all"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Render AI audit report if active */}
                {aiReport[doc.id] && (
                  <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl text-xs space-y-2 relative overflow-hidden">
                    <div className="absolute top-2 right-2 flex items-center gap-1 bg-brand-purple/10 text-brand-purple px-2 py-0.5 rounded text-[8px] font-bold">
                      <Sparkles className="w-2.5 h-2.5" /> AI Evaluated
                    </div>
                    <div className="text-slate-700 whitespace-pre-line font-medium leading-relaxed">
                      {aiReport[doc.id]}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {filteredDocs.length === 0 && (
              <div className="text-center py-16 bg-white border border-slate-100 rounded-3xl">
                <FileText className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                <h4 className="font-bold text-slate-805 text-sm">No documents found</h4>
                <p className="text-slate-450 text-xs mt-1">
                  Click the upload box on the left to add items to your Opportunity Wallet.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
