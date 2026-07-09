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

type ProfileFormInputs = z.infer<typeof profileSchema>;

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

  if (authLoading || !currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 text-brand-purple animate-spin" />
      </div>
    );
  }

  return (
    <>
      <Navbar />

      <main className="flex-grow py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <span className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-brand-purple">
              <Sparkles className="w-3.5 h-3.5" /> Profile Settings
            </span>
            <h1 className="text-3xl font-extrabold text-brand-navy mt-2">Personalize Your Space</h1>
            <p className="text-sm text-slate-500 mt-1">
              Provide your background details so Bloom can match you with relevant scholarships and reminders.
            </p>
          </div>

          <div className="bg-white border border-slate-100 shadow-xl rounded-3xl p-8">
            {success && (
              <div className="mb-6 flex items-center gap-2 text-sm bg-green-50 text-green-600 p-4 rounded-2xl border border-green-100">
                <Check className="w-4 h-4" /> Profile saved successfully!
              </div>
            )}

            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Name */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    {...register("name")}
                    className={`w-full text-sm px-4 py-3 bg-slate-50 border rounded-xl outline-none focus:bg-white focus:border-brand-purple transition-all ${
                      errors.name ? "border-red-300 focus:border-red-500" : "border-slate-200"
                    }`}
                  />
                  {errors.name && (
                    <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>
                  )}
                </div>

                {/* Email (Read only) */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    {...register("email")}
                    readOnly
                    className="w-full text-sm px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl outline-none text-slate-500 cursor-not-allowed"
                  />
                </div>

                {/* Education */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                    Highest Education Level
                  </label>
                  <select
                    {...register("education")}
                    className={`w-full text-sm px-4 py-3 bg-slate-50 border rounded-xl outline-none focus:bg-white focus:border-brand-purple transition-all ${
                      errors.education ? "border-red-300 focus:border-red-500" : "border-slate-200"
                    }`}
                  >
                    <option value="">Select Level</option>
                    <option value="High School">High School</option>
                    <option value="Bachelor">Bachelor's Degree</option>
                    <option value="Master">Master's Degree</option>
                    <option value="PhD">PhD / Doctorate</option>
                  </select>
                  {errors.education && (
                    <p className="mt-1 text-xs text-red-500">{errors.education.message}</p>
                  )}
                </div>

                {/* Annual Income */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                    Annual Family Income ($)
                  </label>
                  <select
                    {...register("income")}
                    className={`w-full text-sm px-4 py-3 bg-slate-50 border rounded-xl outline-none focus:bg-white focus:border-brand-purple transition-all ${
                      errors.income ? "border-red-300 focus:border-red-500" : "border-slate-200"
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
                    <p className="mt-1 text-xs text-red-500">{errors.income.message}</p>
                  )}
                </div>

                {/* Location */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                    Location (Country)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. United States, Global"
                    {...register("location")}
                    className={`w-full text-sm px-4 py-3 bg-slate-50 border rounded-xl outline-none focus:bg-white focus:border-brand-purple transition-all ${
                      errors.location ? "border-red-300 focus:border-red-500" : "border-slate-200"
                    }`}
                  />
                  {errors.location && (
                    <p className="mt-1 text-xs text-red-500">{errors.location.message}</p>
                  )}
                </div>

                {/* Preferred Category */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                    Preferred Opportunity
                  </label>
                  <select
                    {...register("category")}
                    className={`w-full text-sm px-4 py-3 bg-slate-50 border rounded-xl outline-none focus:bg-white focus:border-brand-purple transition-all ${
                      errors.category ? "border-red-300 focus:border-red-500" : "border-slate-200"
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
                    <p className="mt-1 text-xs text-red-500">{errors.category.message}</p>
                  )}
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                  Short Bio
                </label>
                <textarea
                  rows={3}
                  placeholder="Tell us a little bit about yourself..."
                  {...register("bio")}
                  className="w-full text-sm px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-brand-purple resize-none"
                />
              </div>

              {/* Skills */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                  Skills (comma separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Python, Public Speaking, Data Analysis"
                  {...register("skills")}
                  className={`w-full text-sm px-4 py-3 bg-slate-50 border rounded-xl outline-none focus:bg-white focus:border-brand-purple transition-all ${
                    errors.skills ? "border-red-300 focus:border-red-500" : "border-slate-200"
                  }`}
                />
                {errors.skills && (
                  <p className="mt-1 text-xs text-red-500">{errors.skills.message}</p>
                )}
              </div>

              {/* Interests */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                  Fields of Interest (comma separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. STEM, Artificial Intelligence, Business"
                  {...register("interests")}
                  className={`w-full text-sm px-4 py-3 bg-slate-50 border rounded-xl outline-none focus:bg-white focus:border-brand-purple transition-all ${
                    errors.interests ? "border-red-300 focus:border-red-500" : "border-slate-200"
                  }`}
                />
                {errors.interests && (
                  <p className="mt-1 text-xs text-red-500">{errors.interests.message}</p>
                )}
              </div>

              {/* Submit button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full bg-brand-purple hover:bg-brand-indigo text-white font-semibold text-sm py-3.5 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Profile Settings
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
