"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate login and redirect to dashboard
    setTimeout(() => {
      router.push("/dashboard");
    }, 400);
  };

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      {/* ── LEFT PANEL (Navy 50%) ───────────────────────────────── */}
      <div className="bg-[#0F172A] text-white flex flex-col justify-between p-12 select-none">
        {/* Top: Brand */}
        <div className="flex items-center gap-2.5">
          <svg width="24" height="24" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="4" fill="#1E293B" />
            <rect x="5" y="5" width="9" height="9" rx="2" fill="#334155" />
            <rect x="18" y="5" width="9" height="9" rx="2" fill="#334155" />
            <rect x="5" y="18" width="9" height="9" rx="2" fill="#334155" />
            <rect x="18" y="18" width="9" height="9" rx="2" fill="#2563EB" />
            <path d="M20.5 22.5L22 24L25 20" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="font-semibold text-[20px] text-white tracking-tight">TrialScreen</span>
        </div>

        {/* Middle: Clinical Quote */}
        <div className="my-12">
          <blockquote className="italic text-[18px] text-slate-100 max-w-[380px] leading-relaxed">
            &ldquo;Patient recruitment accounts for over 30 percent of total trial cost. Every eligible patient missed is a delay in treatment reaching people who need it.&rdquo;
          </blockquote>
          <p className="text-[13px] text-[#94A3B8] mt-3">
            — Clinical Operations context, JAMA Oncology 2021
          </p>
        </div>

        {/* Bottom */}
        <div className="text-[13px] text-[#64748B]">
          A multi-agent system for clinical trial recruitment.
        </div>
      </div>

      {/* ── RIGHT PANEL (White Form 50%) ───────────────────────── */}
      <div className="bg-white flex flex-col justify-center px-8 sm:px-16 py-12">
        <div className="max-w-sm w-full mx-auto">
          <h1 className="text-[24px] font-bold text-[#0F172A] tracking-tight">Sign in to TrialScreen</h1>
          <p className="text-sm text-[#64748B] mt-1 mb-8">Enter your work email and password.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#0F172A] mb-1">Work email</label>
              <input
                type="email"
                required
                placeholder="you@hospital.org"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-medium text-[#0F172A]">Password</label>
                <Link
                  href="/forgot-password"
                  className="text-[13px] font-medium text-[#2563EB] hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#2563EB] text-white py-2.5 rounded-[4px] text-sm font-medium hover:bg-[#1D4ED8] transition-colors"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#E2E8F0]" />
            </div>
            <span className="relative bg-white px-3 text-xs text-[#64748B]">or</span>
          </div>

          {/* OAuth button */}
          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="w-full border border-[#E2E8F0] py-2.5 rounded-[4px] flex items-center justify-center gap-2 hover:bg-[#F8FAFC] transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                fill="#EA4335"
              />
            </svg>
            <span className="text-sm font-medium text-[#0F172A]">Continue with Google</span>
          </button>

          {/* Footer link */}
          <p className="text-center text-xs text-[#64748B] mt-6">
            Don&apos;t have an account?{" "}
            <Link href="/contact" className="text-[#2563EB] hover:underline font-medium">
              Request access.
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
