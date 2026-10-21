"use client";

import Link from "next/link";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f4f5f7] px-6 text-center">
      <p className="font-mono text-[64px] font-semibold text-[#d5d9e0] leading-none select-none">500</p>
      <h2 className="font-serif text-[24px] text-[#1a2332] mt-3">Something went wrong</h2>
      <p className="text-[14px] text-[#4d5663] mt-2 max-w-sm">
        An unexpected error occurred. Try again, or return to the dashboard.
      </p>
      <div className="mt-6 flex items-center justify-center gap-3">
        <button type="button" onClick={() => reset()} className="btn btn-secondary text-[12px]">
          Try again
        </button>
        <Link href="/dashboard" className="btn btn-primary text-[12px]">
          Dashboard
        </Link>
      </div>
    </div>
  );
}
