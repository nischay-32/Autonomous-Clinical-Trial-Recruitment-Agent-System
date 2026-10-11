"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] px-6 py-12">
      <div className="max-w-md w-full border border-[#E2E8F0] bg-white rounded-[4px] p-8">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#64748B] hover:text-[#0F172A] mb-6"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to login
        </Link>

        <h1 className="text-xl font-bold text-[#0F172A] tracking-tight">Reset your password</h1>
        <p className="text-sm text-[#64748B] mt-1 mb-6">
          Enter your registered institutional email to receive a password reset link.
        </p>

        {sent ? (
          <div className="p-4 bg-[#DCFCE7] border border-[#BBF7D0] rounded-[4px] text-center">
            <CheckCircle2 className="w-6 h-6 text-[#16A34A] mx-auto mb-2" />
            <h2 className="text-sm font-semibold text-[#16A34A]">Reset Link Dispatched</h2>
            <p className="text-xs text-[#15803D] mt-1">
              If an account exists for {email}, a secure password reset token has been sent.
            </p>
            <Link href="/login" className="btn btn-secondary mt-4 inline-block text-xs">
              Return to login
            </Link>
          </div>
        ) : (
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

            <button
              type="submit"
              className="w-full bg-[#2563EB] text-white py-2.5 rounded-[4px] text-sm font-medium hover:bg-[#1D4ED8] transition-colors"
            >
              Send reset instructions
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
