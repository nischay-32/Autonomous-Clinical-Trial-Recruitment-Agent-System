"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    organization: "",
    jobTitle: "",
    trialType: "Oncology",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-[#0F172A]">
      {/* ── NAVBAR ─────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 h-[56px] bg-white border-b border-[#E2E8F0] px-6">
        <div className="max-w-screen-xl mx-auto h-full flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="4" fill="#0F172A" />
              <rect x="5" y="5" width="9" height="9" rx="2" fill="#1E293B" stroke="#334155" strokeWidth="1" />
              <rect x="18" y="5" width="9" height="9" rx="2" fill="#1E293B" stroke="#334155" strokeWidth="1" />
              <rect x="5" y="18" width="9" height="9" rx="2" fill="#1E293B" stroke="#334155" strokeWidth="1" />
              <rect x="18" y="18" width="9" height="9" rx="2" fill="#2563EB" />
              <path d="M20.5 22.5L22 24L25 20" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="font-semibold text-[16px] text-[#0F172A] tracking-tight">TrialScreen</span>
          </Link>

          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-[#0F172A] hover:text-[#2563EB] transition-colors">
              Log in
            </Link>
            <Link href="/" className="text-sm font-medium text-[#64748B] hover:text-[#0F172A] transition-colors">
              Back to home
            </Link>
          </div>
        </div>
      </header>

      {/* ── MAIN CONTENT ───────────────────────────────────────── */}
      <main className="flex-1 max-w-[640px] w-full mx-auto px-6 py-16">
        <div className="border border-[#E2E8F0] bg-white rounded-[4px] p-8">
          <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">Request Access to TrialScreen</h1>
          <p className="text-sm text-[#64748B] mt-1.5">
            Institutional deployments are configured per clinical research organization. Submit your details below to schedule an onboarding review.
          </p>

          {submitted ? (
            <div className="mt-8 p-6 bg-[#DCFCE7] border border-[#BBF7D0] rounded-[4px] text-center">
              <CheckCircle2 className="w-8 h-8 text-[#16A34A] mx-auto mb-2" />
              <h2 className="text-base font-semibold text-[#16A34A]">Request Submitted</h2>
              <p className="text-xs text-[#15803D] mt-1">
                Our clinical deployment team has received your inquiry and will contact your institutional email within 1 business day.
              </p>
              <Link href="/" className="btn btn-secondary mt-4 inline-block text-xs">
                Return to home
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#0F172A] mb-1">Full name</label>
                <input
                  type="text"
                  required
                  placeholder="Dr. Sarah Jenkins"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#0F172A] mb-1">Work email</label>
                <input
                  type="email"
                  required
                  placeholder="sjenkins@hospital.org"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#0F172A] mb-1">Organization name</label>
                  <input
                    type="text"
                    required
                    placeholder="Memorial Cancer Institute"
                    value={formData.organization}
                    onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#0F172A] mb-1">Job title</label>
                  <input
                    type="text"
                    required
                    placeholder="Clinical Trial Director"
                    value={formData.jobTitle}
                    onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#0F172A] mb-1">Primary therapeutic area</label>
                <select
                  value={formData.trialType}
                  onChange={(e) => setFormData({ ...formData, trialType: e.target.value })}
                >
                  <option value="Oncology">Oncology</option>
                  <option value="Cardiology">Cardiology</option>
                  <option value="Neurology">Neurology</option>
                  <option value="Immunology">Immunology / Rheumatology</option>
                  <option value="Rare Diseases">Rare Diseases</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#0F172A] mb-1">Implementation requirements</label>
                <textarea
                  rows={3}
                  placeholder="Specify EHR integration needs (MIMIC-III, Epic FHIR, Cerner) or target trial volume."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#2563EB] text-white py-2.5 rounded-[4px] text-sm font-medium hover:bg-[#1D4ED8] transition-colors"
              >
                Submit access request
              </button>
            </form>
          )}
        </div>
      </main>

      {/* ── FOOTER ─────────────────────────────────────────────── */}
      <footer className="bg-[#0F172A] text-white py-8 border-t border-[#1E293B]">
        <div className="max-w-screen-xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#94A3B8]">
          <div>TrialScreen &copy; 2026. All rights reserved.</div>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-white">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
