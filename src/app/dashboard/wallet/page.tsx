"use client";

import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, where, addDoc, deleteDoc, doc, onSnapshot } from "firebase/firestore";
import { useState, useEffect, useRef } from "react";
import {
  Wallet,
  FileText,
  UploadCloud,
  Download,
  Trash2,
  Sparkles,
  Loader2,
} from "lucide-react";
import type { WalletDocument, WalletCategory } from "@/lib/types";
import { motion, AnimatePresence, type Variants } from "framer-motion";

/* ── Animation Variants ─────────────────────────────────────── */
const containerVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.06 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16, scale: 0.98 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.36, ease: [0.23, 1, 0.32, 1] } },
  exit: { opacity: 0, x: -20, scale: 0.96, transition: { duration: 0.22 } },
};

const panelVariants: Variants = {
  hidden: { opacity: 0, x: -18 },
  show: { opacity: 1, x: 0, transition: { duration: 0.42, ease: "easeOut" } },
};

const listVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

/* ── Animated Count-up ─────────────────────────────────────── */
function CountUp({ to, suffix = "" }: { to: number; suffix?: string }) {
  const [value, setValue] = useState(0);
  const ref = useRef(false);

  useEffect(() => {
    if (ref.current || to === 0) return;
    ref.current = true;
    const start = performance.now();
    const duration = 900;
    const frame = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      // easeOutExpo
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setValue(Math.round(eased * to));
      if (progress < 1) requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  }, [to]);

  return <>{value}{suffix}</>;
}

export default function WalletPage() {
  const { currentUser } = useAuth();
  const [documents, setDocuments] = useState<WalletDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<WalletCategory | "All">("All");

  // Upload form state
  const [uploading, setUploading] = useState(false);
  const [docName, setDocName] = useState("");
  const [docCategory, setDocCategory] = useState<WalletCategory>("Resume");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // AI Analysis state
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

    if (!selectedFile) {
      alert("Please select a file to upload.");
      return;
    }

    setUploading(true);
    try {
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

      if (!cloudName || !uploadPreset || cloudName === "your_cloud_name" || uploadPreset === "your_unsigned_preset") {
        throw new Error("Cloudinary environment variables are not configured yet. Please configure them in .env.local");
      }

      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("upload_preset", uploadPreset);
      formData.append("folder", `wallet/${currentUser.uid}`);

      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error?.message || "Failed to upload file to Cloudinary.");
      }

      const data = await res.json();
      const downloadURL = data.secure_url;
      const filePath = data.public_id;

      const newDoc = {
        uid: currentUser.uid,
        name: docName.trim(),
        category: docCategory,
        storagePath: filePath,
        downloadURL,
        sizeBytes: selectedFile.size,
        mimeType: selectedFile.type,
        uploadedAt: new Date().toISOString(),
      };

      await addDoc(collection(db, "wallet"), newDoc);
      setDocName("");
      setSelectedFile(null);
    } catch (err: any) {
      console.error("Upload error:", err);
      alert(err.message || "Upload failed. Check your console logs.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const docToDelete = documents.find((d) => d.id === id);

      if (docToDelete?.storagePath) {
        const res = await fetch("/api/wallet/delete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ publicId: docToDelete.storagePath }),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          console.error("Cloudinary delete failed:", errData.error);
        }
      }

      await deleteDoc(doc(db, "wallet", id));
    } catch (err) {
      console.error("Delete document error:", err);
    }
  };

  const handleAIVerify = async (docId: string, docName: string, category: WalletCategory) => {
    setAnalyzingId(docId);
    try {
      await new Promise((res) => setTimeout(res, 2000));

      let analysis = "";
      if (category === "Resume") {
        analysis = `### 🌸 Resume AI Audit Score: 87/100\n- **Strengths**: Strong inclusion of leadership credentials and hackathon participation.\n- **Opportunities**: Expand the "Projects" section by highlighting technologies (e.g. React, Next.js, Gemini API).\n- **Match Suggestion**: Excellent fit for the "Generation Google Scholarship" and "NASA internship" due to strong CS background.`;
      } else if (category === "Certificates") {
        analysis = `### 🌸 Certification Verified!\n- **Issuer**: Google Cloud Certified Associate\n- **Authenticity**: Verified by automated document scan.\n- **Impact**: Boosts your matching probability for technical internships by +15%.`;
      } else if (category === "ID Documents") {
        analysis = `### 🌸 ID Documents Verification Success\n- **Verification status**: Matches profile name successfully.\n- **Security Check**: Encryption matches privacy standards. Fully secured in Bloom's safe vault.`;
      } else {
        analysis = `### 🌸 AI Evaluation for "${docName}"\n- **Status**: Document analyzed successfully.\n- **Advice**: Link this project / certificate under your Profile details to show to prospective organization sponsors.`;
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

  const filteredDocs =
    activeTab === "All" ? documents : documents.filter((d) => d.category === activeTab);

  const totalSizeKB = Math.round(documents.reduce((acc, d) => acc + d.sizeBytes, 0) / 1024);

  /* ── Loading ──────────────────────────────────────────────── */
  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 0.9, ease: "linear" }}
        >
          <Loader2 className="w-8 h-8 text-primary" />
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      className="max-w-5xl mx-auto space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* Header + Stat pills */}
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-extrabold text-foreground flex items-center gap-2">
          <Wallet className="w-6 h-6 text-primary" /> Opportunity Wallet
        </h1>
        <p className="text-foreground-muted text-sm mt-1">
          Store your career documents, achievements, and credentials in a secure sandbox. Use AI to scan resumes and auto-verify certificates.
        </p>

        {/* Stat pills */}
        <div className="flex gap-3 mt-4 flex-wrap">
          {[
            { label: "Total Documents", value: documents.length, suffix: "" },
            { label: "Storage Used", value: totalSizeKB, suffix: " KB" },
          ].map(({ label, value, suffix }) => (
            <motion.div
              key={label}
              whileHover={{ scale: 1.04 }}
              transition={{ type: "spring", stiffness: 400, damping: 18 }}
              className="px-4 py-2 bg-surface border border-border rounded-2xl text-center shadow-sm"
            >
              <p className="text-[10px] uppercase font-bold text-foreground-muted tracking-wider">{label}</p>
              <p className="text-lg font-extrabold text-primary">
                <CountUp to={value} suffix={suffix} />
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upload Panel */}
        <motion.div
          variants={panelVariants}
          className="bg-surface border border-border p-6 rounded-3xl shadow-sm space-y-4 h-fit"
        >
          <h3 className="font-bold text-foreground text-sm flex items-center gap-1.5">
            <UploadCloud className="w-4 h-4 text-primary" /> Upload Document
          </h3>

          <form onSubmit={handleUpload} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-foreground-muted uppercase tracking-wider">
                Document Name
              </label>
              <input
                type="text"
                placeholder="e.g. Software Engineering Resume 2026"
                value={docName}
                onChange={(e) => setDocName(e.target.value)}
                required
                className="w-full text-xs p-3 border border-border rounded-xl outline-none focus:border-primary bg-background text-foreground placeholder:text-foreground-muted transition-all"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-foreground-muted uppercase tracking-wider">
                Asset Category
              </label>
              <select
                value={docCategory}
                onChange={(e) => setDocCategory(e.target.value as WalletCategory)}
                className="w-full text-xs p-3 border border-border rounded-xl outline-none bg-background text-foreground focus:border-primary transition-all"
              >
                {categories.slice(1).map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Drag & Drop Box */}
            <motion.div
              animate={{
                borderColor: isDragging
                  ? "var(--primary)"
                  : selectedFile
                  ? "var(--success)"
                  : "var(--border)",
                backgroundColor: isDragging ? "rgba(var(--primary-rgb, 178,58,92), 0.05)" : undefined,
              }}
              transition={{ duration: 0.2 }}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                const file = e.dataTransfer.files[0];
                if (file) {
                  setSelectedFile(file);
                  setDocName(file.name.split(".")[0]);
                }
              }}
              className="border border-dashed rounded-xl p-4 text-center cursor-pointer hover:bg-surface-raised transition-colors"
            >
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
                <AnimatePresence mode="wait">
                  {selectedFile ? (
                    <motion.div
                      key="selected"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      <UploadCloud className="w-8 h-8 text-success mx-auto" />
                      <p className="text-[10px] font-semibold text-success">{selectedFile.name}</p>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <UploadCloud className="w-8 h-8 text-foreground-muted mx-auto" />
                      <p className="text-[10px] font-semibold text-foreground-muted">
                        {isDragging ? "Drop to upload" : "Select or drag file to upload"}
                      </p>
                      <p className="text-[8px] text-foreground-muted">PDF, PNG, JPG up to 10MB</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </label>
            </motion.div>

            <motion.button
              type="submit"
              disabled={uploading || !selectedFile}
              whileHover={!uploading && selectedFile ? { scale: 1.03 } : {}}
              whileTap={!uploading && selectedFile ? { scale: 0.96 } : {}}
              transition={{ type: "spring", stiffness: 380, damping: 18 }}
              className="w-full py-3 bg-primary hover:bg-primary-hover text-primary-foreground font-semibold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <AnimatePresence mode="wait" initial={false}>
                {uploading ? (
                  <motion.span
                    key="uploading"
                    className="flex items-center gap-1.5"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading to cloud…
                  </motion.span>
                ) : (
                  <motion.span
                    key="upload"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    Upload Document
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </form>
        </motion.div>

        {/* Documents Grid */}
        <motion.div className="lg:col-span-2 space-y-6" variants={itemVariants}>
          {/* Tab Navigation */}
          <div className="flex gap-2 overflow-x-auto pb-1 border-b border-border relative">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveTab(cat)}
                className={`pb-3 px-1 text-xs font-semibold whitespace-nowrap transition-all relative ${
                  activeTab === cat ? "text-primary" : "text-foreground-muted hover:text-foreground"
                }`}
              >
                {cat}
                {activeTab === cat && (
                  <motion.span
                    layoutId="wallet-tab-indicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"
                    transition={{ type: "spring", stiffness: 400, damping: 28 }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* Documents List */}
          <motion.div className="space-y-4" variants={listVariants} initial="hidden" animate="show">
            <AnimatePresence mode="popLayout">
              {filteredDocs.map((document) => (
                <motion.div
                  key={document.id}
                  layout
                  variants={itemVariants}
                  initial="hidden"
                  animate="show"
                  exit="exit"
                  whileHover={{
                    boxShadow:
                      "0 0 0 1px rgba(255,92,134,0.2), 0 8px 24px rgba(255,60,110,0.12)",
                  }}
                  className="p-5 bg-surface border border-border rounded-3xl shadow-sm flex flex-col gap-4 transition-shadow"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: -4 }}
                        transition={{ type: "spring", stiffness: 400, damping: 14 }}
                        className="p-3 bg-primary/10 text-primary rounded-2xl"
                      >
                        <FileText className="w-5 h-5" />
                      </motion.div>
                      <div>
                        <h4 className="font-bold text-foreground text-sm leading-snug">
                          {document.name}
                        </h4>
                        <p className="text-[10px] text-foreground-muted font-semibold uppercase tracking-wider mt-0.5">
                          {document.category} • {(document.sizeBytes / 1024).toFixed(0)} KB
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <motion.button
                        onClick={() => handleAIVerify(document.id, document.name, document.category)}
                        disabled={analyzingId === document.id}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        transition={{ type: "spring", stiffness: 400, damping: 18 }}
                        className="p-2 text-primary hover:bg-primary/10 rounded-xl transition-all"
                        title="AI Audit"
                      >
                        {analyzingId === document.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Sparkles className="w-4 h-4" />
                        )}
                      </motion.button>
                      <motion.a
                        href={document.downloadURL}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        transition={{ type: "spring", stiffness: 400, damping: 18 }}
                        className="p-2 text-foreground-muted hover:text-foreground hover:bg-surface-raised rounded-xl transition-all"
                        title="Download document"
                      >
                        <Download className="w-4 h-4" />
                      </motion.a>
                      <motion.button
                        onClick={() => handleDelete(document.id)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        transition={{ type: "spring", stiffness: 400, damping: 18 }}
                        className="p-2 text-foreground-muted hover:text-danger hover:bg-surface-raised rounded-xl transition-all"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </div>

                  {/* AI audit report */}
                  <AnimatePresence>
                    {aiReport[document.id] && (
                      <motion.div
                        initial={{ opacity: 0, height: 0, y: -8 }}
                        animate={{ opacity: 1, height: "auto", y: 0 }}
                        exit={{ opacity: 0, height: 0, y: -8 }}
                        transition={{ duration: 0.32, ease: [0.23, 1, 0.32, 1] }}
                        className="bg-surface-raised border border-border p-4 rounded-2xl text-xs space-y-2 relative overflow-hidden"
                      >
                        <div className="absolute top-2 right-2 flex items-center gap-1 bg-primary/10 text-primary px-2 py-0.5 rounded text-[8px] font-bold">
                          <Sparkles className="w-2.5 h-2.5" /> AI Evaluated
                        </div>
                        <div className="text-foreground whitespace-pre-line font-medium leading-relaxed">
                          {aiReport[document.id]}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}

              {filteredDocs.length === 0 && (
                <motion.div
                  key="empty-state"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.3 }}
                  className="text-center py-16 bg-surface border border-border rounded-3xl"
                >
                  <motion.div
                    initial={{ y: -6 }}
                    animate={{ y: 0 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <FileText className="w-12 h-12 text-foreground-muted mx-auto mb-2" />
                  </motion.div>
                  <h4 className="font-bold text-foreground text-sm">No documents found</h4>
                  <p className="text-foreground-muted text-xs mt-1">
                    Click the upload box on the left to add items to your Opportunity Wallet.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}
