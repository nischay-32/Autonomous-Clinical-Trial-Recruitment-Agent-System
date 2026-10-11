import Link from "next/link";



export default function PrivacyPolicyPage() {
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

      {/* ── CONTENT ────────────────────────────────────────────── */}
      <main className="flex-1 max-w-[720px] w-full mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold text-[#0F172A] tracking-tight">Privacy Policy</h1>
        <p className="text-sm text-[#64748B] mt-1 mb-8">Effective date: October 1, 2026</p>

        <div className="space-y-8 text-sm text-[#334155] leading-relaxed">
          <section>
            <h2 className="text-base font-semibold text-[#0F172A] mb-2">1. What data we collect</h2>
            <p>
              We collect the information you provide when creating an account (name, work email, organization name, and clinical title). We do not collect, store, or process any patient health data on our cloud servers. All Electronic Health Record (EHR) data remains on the institution&apos;s own database and is processed locally or in your designated virtual private cloud.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-[#0F172A] mb-2">2. How we use your account data</h2>
            <p>
              Account data is used only to authenticate users, enforce role-based access control (RBAC), and associate clinical trial screening runs with your organization. We do not sell account data, contact details, or operational logs to third parties under any circumstances.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-[#0F172A] mb-2">3. Patient data and HIPAA</h2>
            <p>
              TrialScreen is engineered for on-premises or institutional VPC deployment under a HIPAA Business Associate Agreement (BAA). Patient data never leaves your network perimeter. All patient identifiers displayed in the web interface are pseudonymized synthetic or institutional IDs (e.g., SUBJECT_ID) with zero direct identifiers (names, Social Security numbers, telephone numbers, or addresses) exposed.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-[#0F172A] mb-2">4. Cookies and session data</h2>
            <p>
              We use a single secure, HTTP-only session cookie strictly necessary for authentication and session management. We do not use third-party analytics cookies, advertising trackers, or fingerprinting scripts.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-[#0F172A] mb-2">5. Data retention</h2>
            <p>
              Account data is retained for the duration of your organization&apos;s active institutional subscription. Audit logs required under FDA 21 CFR Part 11 are retained according to your institution&apos;s configured regulatory retention schedule (default: 7 years). You may request account deletion by contacting compliance operations.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-[#0F172A] mb-2">6. Contact</h2>
            <p>
              For privacy inquiries, Data Protection Officer requests, or to execute a HIPAA BAA, contact compliance@trialscreen.org or write to TrialScreen Data Governance, Department of Clinical Informatics, Bangalore, Karnataka.
            </p>
          </section>
        </div>
      </main>

      {/* ── FOOTER ─────────────────────────────────────────────── */}
      <footer className="bg-[#0F172A] text-white py-12 mt-auto">
        <div className="max-w-screen-xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 text-sm text-[#94A3B8]">
            <span className="font-semibold text-white">TrialScreen</span>
            <span>&copy; 2026</span>
          </div>

          <div className="flex items-center gap-6 text-sm text-[#94A3B8]">
            <Link href="/privacy" className="text-white">Privacy Policy</Link>
            <span className="text-[#334155]">|</span>
            <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            <span className="text-[#334155]">|</span>
            <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
          </div>

          <div className="text-xs text-[#64748B]">
            Built by CI_PR_13, JSSATEB, VTU
          </div>
        </div>
      </footer>
    </div>
  );
}
