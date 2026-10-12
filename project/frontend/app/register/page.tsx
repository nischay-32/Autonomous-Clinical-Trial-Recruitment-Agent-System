"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [organization, setOrganization] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Compute password strength (0-4)
  const getStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score;
  };

  const strength = getStrength(password);

  const getStrengthColor = (index: number) => {
    if (strength <= index) return "bg-[#E2E8F0]";
    if (strength === 1) return "bg-[#DC2626]";
    if (strength === 2) return "bg-[#D97706]";
    if (strength === 3) return "bg-[#2563EB]";
    return "bg-[#16A34A]";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) {
      setError("You must accept the terms to create an account.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await api.register({
        full_name: fullName,
        email,
        organization,
        job_title: jobTitle,
        password,
      });
      if (typeof window !== "undefined") {
        sessionStorage.setItem("trialscreen_token", res.token);
        sessionStorage.setItem("trialscreen_user", JSON.stringify(res.user));
      }
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to register account. Please check your details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      {/* ── LEFT PANEL (Navy 50%) ───────────────────────────────── */}
      <div className="bg-[#0F172A] text-white flex flex-col justify-between p-12 select-none">
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

        <div className="my-12">
          <h2 className="text-xl font-semibold text-white tracking-tight">Institutional Account Setup</h2>
          <p className="text-sm text-[#94A3B8] mt-3 leading-relaxed max-w-[380px]">
            Access to TrialScreen connects clinical research teams to autonomous cohort screening pipelines, audited by HIPAA-compliant multi-agent adjudication.
          </p>
        </div>

        <div className="text-[13px] text-[#64748B]">
          A multi-agent system for clinical trial recruitment.
        </div>
      </div>

      {/* ── RIGHT PANEL (Registration Form) ────────────────────── */}
      <div className="bg-white flex flex-col justify-center px-8 sm:px-16 py-12">
        <div className="max-w-md w-full mx-auto">
          <h1 className="text-[24px] font-bold text-[#0F172A] tracking-tight">Create your account</h1>
          <p className="text-sm text-[#64748B] mt-1 mb-6">Enter your clinical organization credentials.</p>

          {error && (
            <div className="mb-4 p-3 bg-[#FEE2E2] border border-[#FECACA] rounded-[4px] text-xs text-[#DC2626]">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-medium text-[#0F172A] mb-1">Full name</label>
              <input
                type="text"
                required
                placeholder="Dr. Christopher Roberts"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#0F172A] mb-1">Work email</label>
              <input
                type="email"
                required
                placeholder="croberts@hospital.org"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[#0F172A] mb-1">Organization name</label>
                <input
                  type="text"
                  required
                  placeholder="Hospital or Pharma name"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#0F172A] mb-1">Job title</label>
                <input
                  type="text"
                  required
                  placeholder="Clinical Research Coordinator"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#0F172A] mb-1">Password</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {/* Strength indicator: 4 colored blocks */}
              <div className="grid grid-cols-4 gap-1.5 mt-1.5">
                {[0, 1, 2, 3].map((idx) => (
                  <div
                    key={idx}
                    className={`h-1 rounded-[2px] transition-colors ${getStrengthColor(idx)}`}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#0F172A] mb-1">Confirm password</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            {/* Terms and conditions gate */}
            <div className="pt-2">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => {
                    setAgreed(e.target.checked);
                    if (e.target.checked) setError(null);
                  }}
                  className="mt-0.5 w-4 h-4 rounded-[4px] border-[#E2E8F0] text-[#2563EB] focus:ring-[#2563EB]"
                />
                <span className="text-xs text-[#64748B] leading-tight">
                  I have read and agree to the{" "}
                  <Link href="/terms" className="text-[#2563EB] underline" target="_blank">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="text-[#2563EB] underline" target="_blank">
                    Privacy Policy
                  </Link>
                  .
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={!agreed}
              className={`w-full py-2.5 rounded-[4px] text-sm font-medium transition-colors mt-2 ${
                agreed
                  ? "bg-[#2563EB] text-white hover:bg-[#1D4ED8]"
                  : "bg-[#93C5FD] text-white cursor-not-allowed"
              }`}
            >
              Create account
            </button>
          </form>

          <p className="text-center text-xs text-[#64748B] mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-[#2563EB] hover:underline font-medium">
              Sign in.
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
