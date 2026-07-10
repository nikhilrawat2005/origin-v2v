"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { profileSchema } from "@/lib/schemas";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Save, Loader2, Sparkles, Check } from "lucide-react";
import { z } from "zod";
import { motion, AnimatePresence, type Variants } from "framer-motion";

type ProfileFormInputs = z.infer<typeof profileSchema>;

/* ── Animation Variants ─────────────────────────────────────── */
const pageVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.04 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.36, ease: "easeOut" } },
};

const bannerVariants: Variants = {
  hidden: { opacity: 0, y: -12, scale: 0.97 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.3, ease: [0.23, 1, 0.32, 1] } },
  exit: { opacity: 0, y: -10, scale: 0.97, transition: { duration: 0.22 } },
};

/* ── Input base class ───────────────────────────────────────── */
const inputBase =
  "w-full text-sm px-4 py-3 bg-surface-raised border rounded-xl outline-none focus:bg-surface focus:border-primary transition-all text-foreground placeholder:text-foreground-muted";

export default function Profile() {
  const { currentUser, profile, updateUserProfile, loading: authLoading } = useAuth();
  const router = useRouter();
  const [success, setSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ProfileFormInputs>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    if (!authLoading && !currentUser) {
      router.push("/auth/login");
    }
  }, [currentUser, authLoading, router]);

  // Load existing profile values
  useEffect(() => {
    if (profile) {
      setValue("name", profile.name || "");
      setValue("email", profile.email || "");
      setValue("bio", profile.bio || "");
      setValue("education", profile.education || "");
      setValue("skills", profile.skills ? profile.skills.join(", ") : "");
      setValue("interests", profile.interests ? profile.interests.join(", ") : "");
      setValue("location", profile.location || "");
      setValue("category", profile.category || "");
      setValue("income", profile.income || "");
    }
  }, [profile, setValue]);

  const onSubmit = async (data: ProfileFormInputs) => {
    setSaving(true);
    setSuccess(false);
    try {
      const skillsArray = data.skills
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
      const interestsArray = data.interests
        .split(",")
        .map((i) => i.trim())
        .filter((i) => i.length > 0);

      await updateUserProfile({
        name: data.name,
        email: data.email,
        bio: data.bio,
        education: data.education,
        skills: skillsArray,
        interests: interestsArray,
        location: data.location,
        category: data.category,
        income: data.income,
      });

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      alert("Failed to save changes.");
    } finally {
      setSaving(false);
    }
  };

  /* ── Loading ──────────────────────────────────────────────── */
  if (authLoading || !currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background transition-colors duration-300">
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
    <>
      <Navbar />

      <main className="flex-grow py-12 px-4 sm:px-6 lg:px-8 bg-background transition-colors duration-300">
        <motion.div
          className="max-w-3xl mx-auto"
          variants={pageVariants}
          initial="hidden"
          animate="show"
        >
          {/* Header */}
          <motion.div className="mb-8" variants={itemVariants}>
            <span className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-primary">
              <Sparkles className="w-3.5 h-3.5" /> Profile Settings
            </span>
            <h1 className="text-3xl font-extrabold text-foreground mt-2">Personalize Your Space</h1>
            <p className="text-sm text-foreground-muted mt-1">
              Provide your background details so Bloom can match you with relevant scholarships and reminders.
            </p>
          </motion.div>

          <motion.div
            className="bg-surface border border-border shadow-xl dark:shadow-[0_8px_40px_rgba(255,60,110,0.08)] rounded-3xl p-8 transition-colors duration-300"
            variants={itemVariants}
          >
            {/* Success Banner */}
            <AnimatePresence>
              {success && (
                <motion.div
                  key="success-banner"
                  variants={bannerVariants}
                  initial="hidden"
                  animate="show"
                  exit="exit"
                  className="mb-6 flex items-center gap-2 text-sm bg-success-surface text-success p-4 rounded-2xl border border-success/20"
                >
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 20 }}
                  >
                    <Check className="w-4 h-4" />
                  </motion.span>
                  Profile saved successfully!
                </motion.div>
              )}
            </AnimatePresence>

            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              <motion.div className="grid grid-cols-1 sm:grid-cols-2 gap-6" variants={pageVariants}>
                {/* Name */}
                <motion.div variants={itemVariants}>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-foreground-muted mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    {...register("name")}
                    className={`${inputBase} ${
                      errors.name ? "border-danger focus:border-danger" : "border-border"
                    }`}
                  />
                  {errors.name && (
                    <p className="mt-1 text-xs text-danger">{errors.name.message}</p>
                  )}
                </motion.div>

                {/* Email (Read only) */}
                <motion.div variants={itemVariants}>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-foreground-muted mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    {...register("email")}
                    readOnly
                    className="w-full text-sm px-4 py-3 bg-surface-raised border border-border rounded-xl outline-none text-foreground-muted cursor-not-allowed"
                  />
                </motion.div>

                {/* Education */}
                <motion.div variants={itemVariants}>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-foreground-muted mb-2">
                    Highest Education Level
                  </label>
                  <select
                    {...register("education")}
                    className={`${inputBase} ${
                      errors.education ? "border-danger" : "border-border"
                    }`}
                  >
                    <option value="">Select Level</option>
                    <option value="High School">High School</option>
                    <option value="Bachelor">Bachelor&apos;s Degree</option>
                    <option value="Master">Master&apos;s Degree</option>
                    <option value="PhD">PhD / Doctorate</option>
                  </select>
                  {errors.education && (
                    <p className="mt-1 text-xs text-danger">{errors.education.message}</p>
                  )}
                </motion.div>

                {/* Annual Income */}
                <motion.div variants={itemVariants}>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-foreground-muted mb-2">
                    Annual Family Income ($)
                  </label>
                  <select
                    {...register("income")}
                    className={`${inputBase} ${
                      errors.income ? "border-danger" : "border-border"
                    }`}
                  >
                    <option value="">Select Bracket</option>
                    <option value="30000">Under $30,000</option>
                    <option value="60000">Under $60,000</option>
                    <option value="100000">Under $100,000</option>
                    <option value="150000">Under $150,000</option>
                    <option value="999999">No Limit / Above $150,000</option>
                  </select>
                  {errors.income && (
                    <p className="mt-1 text-xs text-danger">{errors.income.message}</p>
                  )}
                </motion.div>

                {/* Location */}
                <motion.div variants={itemVariants}>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-foreground-muted mb-2">
                    Location (Country)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. United States, Global"
                    {...register("location")}
                    className={`${inputBase} ${
                      errors.location ? "border-danger" : "border-border"
                    }`}
                  />
                  {errors.location && (
                    <p className="mt-1 text-xs text-danger">{errors.location.message}</p>
                  )}
                </motion.div>

                {/* Preferred Category */}
                <motion.div variants={itemVariants}>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-foreground-muted mb-2">
                    Preferred Opportunity
                  </label>
                  <select
                    {...register("category")}
                    className={`${inputBase} ${
                      errors.category ? "border-danger" : "border-border"
                    }`}
                  >
                    <option value="">Select Category</option>
                    <option value="Scholarships">Scholarships</option>
                    <option value="Fellowships">Fellowships</option>
                    <option value="Internships">Internships</option>
                    <option value="Conferences">Conferences</option>
                    <option value="Hackathons">Hackathons</option>
                    <option value="STEM Programs">STEM Programs</option>
                  </select>
                  {errors.category && (
                    <p className="mt-1 text-xs text-danger">{errors.category.message}</p>
                  )}
                </motion.div>
              </motion.div>

              {/* Bio */}
              <motion.div variants={itemVariants}>
                <label className="block text-xs font-semibold uppercase tracking-wider text-foreground-muted mb-2">
                  Short Bio
                </label>
                <textarea
                  rows={3}
                  placeholder="Tell us a little bit about yourself..."
                  {...register("bio")}
                  className={`${inputBase} resize-none border-border`}
                />
              </motion.div>

              {/* Skills */}
              <motion.div variants={itemVariants}>
                <label className="block text-xs font-semibold uppercase tracking-wider text-foreground-muted mb-2">
                  Skills (comma separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Python, Public Speaking, Data Analysis"
                  {...register("skills")}
                  className={`${inputBase} ${
                    errors.skills ? "border-danger" : "border-border"
                  }`}
                />
                {errors.skills && (
                  <p className="mt-1 text-xs text-danger">{errors.skills.message}</p>
                )}
              </motion.div>

              {/* Interests */}
              <motion.div variants={itemVariants}>
                <label className="block text-xs font-semibold uppercase tracking-wider text-foreground-muted mb-2">
                  Fields of Interest (comma separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. STEM, Artificial Intelligence, Business"
                  {...register("interests")}
                  className={`${inputBase} ${
                    errors.interests ? "border-danger" : "border-border"
                  }`}
                />
                {errors.interests && (
                  <p className="mt-1 text-xs text-danger">{errors.interests.message}</p>
                )}
              </motion.div>

              {/* Submit button */}
              <motion.div className="pt-2" variants={itemVariants}>
                <motion.button
                  type="submit"
                  disabled={saving}
                  whileHover={!saving ? { scale: 1.02 } : {}}
                  whileTap={!saving ? { scale: 0.97 } : {}}
                  transition={{ type: "spring", stiffness: 380, damping: 18 }}
                  className="w-full bg-primary hover:bg-primary-hover text-primary-foreground font-semibold text-sm py-3.5 rounded-2xl shadow-md dark:shadow-[0_4px_16px_rgba(255,60,110,0.22)] transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  <AnimatePresence mode="wait" initial={false}>
                    {saving ? (
                      <motion.span
                        key="saving"
                        className="flex items-center gap-2"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving…
                      </motion.span>
                    ) : (
                      <motion.span
                        key="save"
                        className="flex items-center gap-2"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <Save className="w-4 h-4" />
                        Save Profile Settings
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
              </motion.div>
            </form>
          </motion.div>
        </motion.div>
      </main>

      <Footer />
    </>
  );
}
