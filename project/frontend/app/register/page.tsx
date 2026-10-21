"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api, setSession } from "@/lib/api";

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

  const strength = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ].filter(Boolean).length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) {
      setError("Accept the terms and the privacy policy to create an account.");
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
      setSession(res.token, res.user);
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not register. Check the form and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-[#f4f5f7]">
      <div className="hidden md:flex flex-col justify-between p-12 bg-[#1a2332] text-white">
        <Link href="/" className="flex items-center gap-3">
          <Image src="/logo.png" alt="" width={36} height={36} />
          <span className="font-serif text-[20px]">TrialScreen</span>
        </Link>
        <div className="max-w-[380px]">
          <h2 className="font-serif text-[28px] leading-snug">Create an institutional account</h2>
          <p className="mt-4 text-[14px] text-[#c5cad3] leading-relaxed">
            Registration is for research coordinators and investigators named on an IRB-approved protocol. Review the privacy policy before submitting identifiers.
          </p>
        </div>
        <p className="text-[13px] text-[#8b93a1]">CI_PR_13, JSSATEB, VTU</p>
      </div>

      <div className="flex flex-col justify-center px-8 sm:px-14 py-12 bg-white">
        <div className="max-w-md w-full mx-auto">
          <Link href="/" className="flex items-center gap-2.5 mb-8 md:hidden">
            <Image src="/logo.png" alt="" width={32} height={32} />
            <span className="font-serif text-[18px] text-[#1a2332]">TrialScreen</span>
          </Link>
          <h1 className="font-serif text-[26px] text-[#1a2332]">Create account</h1>
          <p className="text-[13px] mt-1.5 mb-7 text-[#4d5663]">Organization details and a work email.</p>

          {error && (
            <div className="mb-5 p-3 text-[13px] bg-[#fdecea] border border-[#f4c7c3] text-[#b42318]" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label htmlFor="fullName" className="block text-xs font-semibold mb-1">Full name</label>
              <input id="fullName" type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>
            <div>
              <label htmlFor="regEmail" className="block text-xs font-semibold mb-1">Work email</label>
              <input id="regEmail" type="email" required autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="org" className="block text-xs font-semibold mb-1">Organization</label>
                <input id="org" type="text" required value={organization} onChange={(e) => setOrganization(e.target.value)} />
              </div>
              <div>
                <label htmlFor="title" className="block text-xs font-semibold mb-1">Job title</label>
                <input id="title" type="text" required value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} />
              </div>
            </div>
            <div>
              <label htmlFor="regPassword" className="block text-xs font-semibold mb-1">Password</label>
              <input id="regPassword" type="password" required autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
              <p className="text-[11px] text-[#4d5663] mt-1">
                Strength {strength} of 4 (length 8+, upper case, number, symbol).
              </p>
            </div>
            <div>
              <label htmlFor="confirm" className="block text-xs font-semibold mb-1">Confirm password</label>
              <input id="confirm" type="password" required autoComplete="new-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
            </div>
            <label className="flex items-start gap-2.5 pt-2">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => {
                  setAgreed(e.target.checked);
                  if (e.target.checked) setError(null);
                }}
                className="mt-0.5 w-4 h-4"
              />
              <span className="text-xs text-[#4d5663] leading-tight">
                I have read the{" "}
                <Link href="/terms" className="text-[#0b5f5a] underline" target="_blank">Terms and Conditions</Link>
                {" "}and the{" "}
                <Link href="/privacy" className="text-[#0b5f5a] underline" target="_blank">Privacy Policy</Link>.
              </span>
            </label>
            <button type="submit" disabled={!agreed || loading} className="btn btn-primary w-full mt-2">
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <p className="text-center text-[12px] mt-6 text-[#4d5663]">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-[#0b5f5a] hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
