import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f4f5f7] px-6 text-center">
      <p className="font-mono text-[64px] font-semibold text-[#d5d9e0] leading-none select-none">404</p>
      <h2 className="font-serif text-[24px] text-[#1a2332] mt-3">Page not found</h2>
      <p className="text-[14px] text-[#4d5663] mt-2 max-w-sm">
        The page you requested does not exist or has been moved.
      </p>
      <Link href="/" className="btn btn-primary mt-6 text-[12px]">
        Home
      </Link>
    </div>
  );
}
