import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC] px-6 text-center">
      <p className="font-mono text-[72px] font-bold text-[#E2E8F0] leading-none select-none">
        404
      </p>
      <h2 className="text-[24px] font-bold text-[#0F172A] mt-2 tracking-tight">
        Page not found
      </h2>
      <p className="text-[15px] text-[#64748B] mt-2 max-w-sm">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link
        href="/dashboard"
        className="mt-6 text-sm font-medium text-[#2563EB] hover:underline"
      >
        &larr; Back to dashboard
      </Link>
    </div>
  );
}
