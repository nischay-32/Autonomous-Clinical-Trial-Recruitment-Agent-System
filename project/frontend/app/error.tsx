"use client";

import Link from "next/link";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC] px-6 text-center">
      <p className="font-mono text-[72px] font-bold text-[#E2E8F0] leading-none select-none">
        500
      </p>
      <h2 className="text-[24px] font-bold text-[#0F172A] mt-2 tracking-tight">
        Something went wrong
      </h2>
      <p className="text-[15px] text-[#64748B] mt-2 max-w-sm">
        An unexpected error occurred. The team has been notified. Please try again in a few minutes.
      </p>
      <div className="mt-6 flex items-center justify-center gap-4">
        <button
          onClick={() => reset()}
          className="btn btn-secondary text-xs"
        >
          Try again
        </button>
        <Link
          href="/dashboard"
          className="text-xs font-medium text-[#2563EB] hover:underline"
        >
          &larr; Back to dashboard
        </Link>
      </div>
    </div>
  );
}
