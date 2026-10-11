"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";

export default function ResetPasswordTokenPage() {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setDone(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] px-6 py-12">
      <div className="max-w-md w-full border border-[#E2E8F0] bg-white rounded-[4px] p-8">
        <h1 className="text-xl font-bold text-[#0F172A] tracking-tight">Set new password</h1>
        <p className="text-sm text-[#64748B] mt-1 mb-6">
          Enter and confirm your new institutional account password.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-[#FEE2E2] border border-[#FECACA] rounded-[4px] text-xs text-[#DC2626]">
            {error}
          </div>
        )}

        {done ? (
          <div className="p-4 bg-[#DCFCE7] border border-[#BBF7D0] rounded-[4px] text-center">
            <CheckCircle2 className="w-6 h-6 text-[#16A34A] mx-auto mb-2" />
            <h2 className="text-sm font-semibold text-[#16A34A]">Password Updated</h2>
            <p className="text-xs text-[#15803D] mt-1">Your password has been securely reset.</p>
            <button
              onClick={() => router.push("/login")}
              className="btn btn-primary mt-4 inline-block text-xs"
            >
              Sign in with new password
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#0F172A] mb-1">New password</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#0F172A] mb-1">Confirm new password</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#2563EB] text-white py-2.5 rounded-[4px] text-sm font-medium hover:bg-[#1D4ED8] transition-colors"
            >
              Update password
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
