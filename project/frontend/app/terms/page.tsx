import Link from "next/link";



export default function TermsOfServicePage() {
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
        <h1 className="text-3xl font-bold text-[#0F172A] tracking-tight">Terms of Service</h1>
        <p className="text-sm text-[#64748B] mt-1 mb-8">Effective date: October 1, 2026</p>

        <div className="space-y-8 text-sm text-[#334155] leading-relaxed">
          <section>
            <h2 className="text-base font-semibold text-[#0F172A] mb-2">1. Use of the service</h2>
            <p>
              TrialScreen provides automated clinical trial protocol criteria evaluation, synthetic cohort analysis, and human-in-the-loop review tooling. Access is granted solely to authorized clinical investigators, institutional review board coordinators, and sponsor personnel under an executed enterprise agreement.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-[#0F172A] mb-2">2. Account responsibilities</h2>
            <p>
              Users are responsible for safeguarding their login credentials and API tokens. Sharing credentials between coordinators is strictly prohibited under institutional security policies. Any unauthorized access must be reported immediately to institutional IT security.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-[#0F172A] mb-2">3. Acceptable use</h2>
            <p>
              You agree not to upload unauthorized patient identifiers, attempt model inversion attacks to re-identify patients, bypass role-based access restrictions, or use automated scrapers against the platform. All trial protocols processed must possess valid IRB or ethics committee documentation.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-[#0F172A] mb-2">4. Intellectual property</h2>
            <p>
              TrialScreen algorithms, matching agent logic, scoring engines, and user interfaces are proprietary intellectual property. Institutional clinical data and trial protocols remain the exclusive property of the respective sponsor or medical institution.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-[#0F172A] mb-2">5. No warranty</h2>
            <p>
              TrialScreen is provided on an &quot;as is&quot; and &quot;as available&quot; basis as clinical decision support. Automated criteria evaluations do not constitute medical diagnosis or replace licensed clinical investigator judgment. Final enrollment eligibility decisions must be confirmed by qualified medical staff.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-[#0F172A] mb-2">6. Limitation of liability</h2>
            <p>
              To the maximum extent permitted by applicable law, TrialScreen developers and academic affiliates shall not be liable for indirect, incidental, or consequential damages resulting from patient screening outcomes, trial delays, or protocol discrepancies.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-[#0F172A] mb-2">7. Governing law</h2>
            <p>
              These Terms are governed by and construed in accordance with the laws of India and applicable healthcare regulations, without regard to conflict of law principles.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-[#0F172A] mb-2">8. Changes to these terms</h2>
            <p>
              We may revise these Terms periodically. Substantive updates will be notified via institutional administrator notifications at least 30 days prior to their effective date.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-[#0F172A] mb-2">9. Contact</h2>
            <p>
              For legal inquiries regarding these Terms, contact legal@trialscreen.org or the Department of Clinical Research Operations, CI_PR_13, JSSATEB, VTU.
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
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <span className="text-[#334155]">|</span>
            <Link href="/terms" className="text-white">Terms of Service</Link>
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
