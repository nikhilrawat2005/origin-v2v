"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@/lib/schemas";
import { useAuth } from "@/context/AuthContext";
import { Mail, Lock, ArrowRight, Loader2, Sparkles } from "lucide-react";
import { z } from "zod";

type LoginFormInputs = z.infer<typeof loginSchema>;

export default function Login() {
  const { login, loginWithGoogle } = useAuth();
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormInputs) => {
    setError("");
    setLoading(true);
    try {
      await login(data.email, data.password);
      router.push("/dashboard");
    } catch (err: any) {
      console.error(err);
      setError("That email and password do not match. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
      router.push("/dashboard");
    } catch (err: any) {
      console.error(err);
      setError("Google Sign-In failed. Please try again.");
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden transition-colors duration-300">
      {/* Decorative Blur Orbs */}
      <div className="absolute top-10 left-10 w-48 h-48 bg-primary/20 dark:bg-primary/10 rounded-full filter blur-3xl opacity-50"></div>
      <div className="absolute bottom-10 right-10 w-64 h-64 bg-primary/10 dark:bg-[rgba(255,60,110,0.08)] rounded-full filter blur-3xl opacity-50"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <Link href="/" className="flex items-center justify-center gap-2 text-2xl font-bold text-foreground mb-6">
          <span className="p-1.5 bg-primary text-white rounded-lg shadow-sm">
            <Sparkles className="w-5 h-5" />
          </span>
          <span>Bloom</span>
        </Link>
        <h2 className="text-center text-3xl font-extrabold text-foreground">Welcome back</h2>
        <p className="mt-2 text-center text-sm text-foreground-muted">
          Sign in to step back into your opportunities.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-surface py-8 px-4 shadow-xl border border-border sm:rounded-3xl sm:px-10 transition-colors duration-300">
          {error && (
            <div className="mb-4 text-sm bg-danger-surface text-danger p-3.5 rounded-xl border border-border">
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            {/* Email Input */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-foreground-muted mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-foreground-muted">
                  <Mail className="w-4.5 h-4.5" />
                </span>
                <input
                  type="email"
                  placeholder="name@example.com"
                  {...register("email")}
                  className={`w-full text-sm pl-10 pr-4 py-3 bg-surface-raised border rounded-2xl outline-none focus:bg-surface focus:border-primary text-foreground placeholder-foreground-muted transition-all ${
                    errors.email ? "border-danger focus:border-danger" : "border-border"
                  }`}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-danger">{errors.email.message}</p>
              )}
            </div>

            {/* Password Input */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-foreground-muted">
                  Password
                </label>
                <Link
                  href="/auth/forgot-password"
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-foreground-muted">
                  <Lock className="w-4.5 h-4.5" />
                </span>
                <input
                  type="password"
                  placeholder="••••••••"
                  {...register("password")}
                  className={`w-full text-sm pl-10 pr-4 py-3 bg-surface-raised border rounded-2xl outline-none focus:bg-surface focus:border-primary text-foreground placeholder-foreground-muted transition-all ${
                    errors.password ? "border-danger focus:border-danger" : "border-border"
                  }`}
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-danger">{errors.password.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || googleLoading}
              className="w-full mt-2 bg-primary hover:bg-primary-hover text-white font-semibold text-sm py-3.5 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Social Sign In Divider */}
          <div className="mt-6">
            <div className="relative flex justify-center text-xs uppercase tracking-wider font-semibold text-foreground-muted">
              <span className="bg-surface px-3 relative z-10">Or continue with</span>
              <div className="absolute inset-y-1/2 left-0 right-0 border-t border-border"></div>
            </div>

            <button
              onClick={handleGoogleSignIn}
              disabled={loading || googleLoading}
              className="w-full mt-4 bg-surface hover:bg-surface-raised text-foreground border border-border font-semibold text-sm py-3 rounded-2xl shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
            >
              {googleLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24">
                    <path
                      fill="#EA4335"
                      d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.18 4.114-3.414 0-6.182-2.768-6.182-6.182S10.534 6.15 13.948 6.15c1.558 0 2.97.587 4.043 1.546l3.056-3.056C19.16 2.822 16.73 1.8 13.948 1.8c-5.753 0-10.422 4.67-10.422 10.422s4.67 10.422 10.422 10.422c6.046 0 10.05-4.249 10.05-10.222 0-.665-.06-1.3-.178-1.937H12.24Z"
                    />
                  </svg>
                  Sign in with Google
                </>
              )}
            </button>
          </div>

          <p className="mt-6 text-center text-sm text-foreground-muted">
            New to Bloom?{" "}
            <Link href="/auth/signup" className="font-semibold text-primary hover:underline">
              Create your account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
