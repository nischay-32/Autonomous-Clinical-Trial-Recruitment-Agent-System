import Image from "next/image";
import Link from "next/link";

export function PublicHeader({ action = "login" }: { action?: "login" | "home" }) {
  return (
    <header className="h-14 px-6 bg-white border-b border-[#d5d9e0]">
      <div className="max-w-screen-xl mx-auto h-full flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <Image src="/logo.png" alt="" width={28} height={28} />
          <span className="font-serif text-[18px] text-[#1a2332]">TrialScreen</span>
        </Link>
        <nav className="flex items-center gap-5 text-[13px]">
          <Link href="/privacy" className="text-[#4d5663] hover:text-[#1a2332]">Privacy</Link>
          <Link href="/terms" className="text-[#4d5663] hover:text-[#1a2332]">Terms</Link>
          <Link href="/contact" className="text-[#4d5663] hover:text-[#1a2332]">Contact</Link>
          {action === "login" ? (
            <Link href="/login" className="btn btn-primary">Sign in</Link>
          ) : (
            <Link href="/" className="text-[#4d5663] hover:text-[#1a2332]">Home</Link>
          )}
        </nav>
      </div>
    </header>
  );
}

export function PublicFooter() {
  return (
    <footer className="mt-auto border-t border-[#d5d9e0] bg-white py-8">
      <div className="max-w-screen-xl mx-auto px-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-[13px] text-[#4d5663]">
        <p className="font-serif text-[#1a2332]">TrialScreen</p>
        <div className="flex items-center gap-5">
          <Link href="/privacy" className="hover:text-[#1a2332]">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-[#1a2332]">Terms and Conditions</Link>
          <Link href="/contact" className="hover:text-[#1a2332]">Contact</Link>
        </div>
        <p>CI_PR_13, JSSATEB, VTU. 2026.</p>
      </div>
    </footer>
  );
}
