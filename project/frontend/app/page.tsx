import Link from "next/link";
import { FileText, SlidersHorizontal, ShieldCheck } from "lucide-react";



export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-[#0F172A]">
      {/* ── NAVBAR ─────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 h-[56px] bg-white border-b border-[#E2E8F0] px-6">
        <div className="max-w-screen-xl mx-auto h-full flex items-center justify-between">
          {/* Left: Brand Wordmark */}
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

          {/* Right: Actions */}
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-medium text-[#0F172A] hover:text-[#2563EB] transition-colors"
            >
              Log in
            </Link>
            <Link
              href="/contact"
              className="bg-[#2563EB] text-white px-4 py-2 rounded-[4px] text-sm font-medium hover:bg-[#1D4ED8] transition-colors"
            >
              Request access
            </Link>
          </div>
        </div>
      </header>

      {/* ── HERO SECTION ───────────────────────────────────────── */}
      <section className="bg-white pt-24 pb-16 border-b border-[#E2E8F0]">
        <div className="max-w-screen-xl mx-auto px-6">
          <div className="max-w-[640px]">
            <h1 className="text-[48px] font-bold text-[#0F172A] leading-[1.15] tracking-tight">
              Screen thousands of patient records against trial criteria in minutes, not months.
            </h1>
            <p className="text-[18px] text-[#64748B] mt-4 max-w-[560px] leading-relaxed">
              TrialScreen is a multi-agent system that reads EHR data, applies your trial&apos;s inclusion and exclusion criteria, flags borderline cases for clinical review, and generates compliant outreach drafts.
            </p>

            <div className="mt-8 flex items-center gap-3">
              <Link
                href="/contact"
                className="bg-[#2563EB] text-white px-6 py-3 rounded-[4px] text-sm font-medium hover:bg-[#1D4ED8] transition-colors"
              >
                Request access
              </Link>
              <Link
                href="/dashboard"
                className="border border-[#E2E8F0] bg-white text-[#0F172A] px-6 py-3 rounded-[4px] text-sm font-medium hover:bg-[#F8FAFC] transition-colors"
              >
                Read the technical docs
              </Link>
            </div>
          </div>

          {/* Static Wireframe SVG Diagram of the Pipeline */}
          <div className="mt-12 overflow-x-auto pb-4">
            <div className="border border-[#E2E8F0] rounded-[4px] bg-[#F8FAFC] p-6 min-w-[920px]">
              <p className="text-xs font-mono uppercase tracking-wider text-[#64748B] mb-4">
                Architecture Flow: Autonomous 6-Agent Pipeline
              </p>
              <svg viewBox="0 0 980 80" className="w-full h-auto" fill="none">
                {/* Node 1: EHR Input */}
                <rect x="0" y="16" width="105" height="48" rx="4" fill="#0F172A" />
                <text x="52" y="44" fill="#FFFFFF" fontSize="12" fontFamily="Inter, sans-serif" fontWeight="500" textAnchor="middle">EHR Input</text>
                {/* Arrow 1 */}
                <path d="M105 40 L130 40" stroke="#2563EB" strokeWidth="2" markerEnd="url(#arrow)" />

                {/* Node 2: Record Reader */}
                <rect x="135" y="16" width="115" height="48" rx="4" fill="#0F172A" />
                <text x="192" y="44" fill="#FFFFFF" fontSize="12" fontFamily="Inter, sans-serif" fontWeight="500" textAnchor="middle">Record Reader</text>
                {/* Arrow 2 */}
                <path d="M250 40 L275 40" stroke="#2563EB" strokeWidth="2" />

                {/* Node 3: Criteria Matcher */}
                <rect x="280" y="16" width="125" height="48" rx="4" fill="#0F172A" />
                <text x="342" y="44" fill="#FFFFFF" fontSize="12" fontFamily="Inter, sans-serif" fontWeight="500" textAnchor="middle">Criteria Matcher</text>
                {/* Arrow 3 */}
                <path d="M405 40 L430 40" stroke="#2563EB" strokeWidth="2" />

                {/* Node 4: Disagreement Protocol */}
                <rect x="435" y="16" width="155" height="48" rx="4" fill="#0F172A" />
                <text x="512" y="44" fill="#FFFFFF" fontSize="12" fontFamily="Inter, sans-serif" fontWeight="500" textAnchor="middle">Disagreement Protocol</text>
                {/* Arrow 4 */}
                <path d="M590 40 L615 40" stroke="#2563EB" strokeWidth="2" />

                {/* Node 5: Compliance Check */}
                <rect x="620" y="16" width="135" height="48" rx="4" fill="#0F172A" />
                <text x="687" y="44" fill="#FFFFFF" fontSize="12" fontFamily="Inter, sans-serif" fontWeight="500" textAnchor="middle">Compliance Check</text>
                {/* Arrow 5 */}
                <path d="M755 40 L780 40" stroke="#2563EB" strokeWidth="2" />

                {/* Node 6: Outreach Draft */}
                <rect x="785" y="16" width="115" height="48" rx="4" fill="#0F172A" />
                <text x="842" y="44" fill="#FFFFFF" fontSize="12" fontFamily="Inter, sans-serif" fontWeight="500" textAnchor="middle">Outreach Draft</text>
                {/* Arrow 6 */}
                <path d="M900 40 L915 40" stroke="#2563EB" strokeWidth="2" />

                {/* Node 7: Audit Log */}
                <rect x="920" y="16" width="85" height="48" rx="4" fill="#0F172A" />
                <text x="962" y="44" fill="#FFFFFF" fontSize="12" fontFamily="Inter, sans-serif" fontWeight="500" textAnchor="middle">Audit Log</text>
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS SECTION ───────────────────────────────── */}
      <section className="bg-[#F8FAFC] py-20 border-b border-[#E2E8F0]">
        <div className="max-w-screen-xl mx-auto px-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#64748B]">WHAT IT DOES</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-6">
            <div className="border border-[#E2E8F0] bg-white p-6 rounded-[4px]">
              <FileText className="w-6 h-6 text-[#0F172A]" />
              <h2 className="text-base font-semibold text-[#0F172A] mt-4">Reads your EHR data</h2>
              <p className="text-sm text-[#64748B] mt-2 leading-relaxed">
                Connects to MIMIC-III or your own PostgreSQL EHR database. Extracts diagnoses, lab values, medications, and clinical notes using Bio_ClinicalBERT.
              </p>
            </div>

            <div className="border border-[#E2E8F0] bg-white p-6 rounded-[4px]">
              <SlidersHorizontal className="w-6 h-6 text-[#0F172A]" />
              <h2 className="text-base font-semibold text-[#0F172A] mt-4">Scores every criterion</h2>
              <p className="text-sm text-[#64748B] mt-2 leading-relaxed">
                Applies three evaluation layers (deterministic rules, XGBoost ML, and NLP semantic matching) to score each patient against your trial&apos;s 40-plus eligibility criteria.
              </p>
            </div>

            <div className="border border-[#E2E8F0] bg-white p-6 rounded-[4px]">
              <ShieldCheck className="w-6 h-6 text-[#0F172A]" />
              <h2 className="text-base font-semibold text-[#0F172A] mt-4">Enforces HIPAA and IRB rules</h2>
              <p className="text-sm text-[#64748B] mt-2 leading-relaxed">
                A dedicated compliance agent checks every decision against HIPAA de-identification requirements and IRB protocol boundaries before any patient data is used for outreach.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── WHAT GETS AUTOMATED SECTION ────────────────────────── */}
      <section className="bg-white py-20 border-b border-[#E2E8F0]">
        <div className="max-w-screen-xl mx-auto px-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#64748B]">THE PIPELINE</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-6 items-start">
            <div className="max-w-[440px]">
              <h2 className="text-[32px] font-bold text-[#0F172A] leading-tight">
                What used to take a team of coordinators weeks now runs as a queued job.
              </h2>
              <p className="text-base text-[#64748B] mt-4 leading-relaxed">
                Manual screening requires reading patient files one by one. TrialScreen processes each patient in parallel through a seven-step agent pipeline, surfaces only the cases that need a human decision, and logs every action to an immutable audit trail.
              </p>
            </div>

            <div className="space-y-4">
              {[
                { num: "01", name: "Load trial protocol", desc: "Upload protocol PDF or fetch structured criteria directly from ClinicalTrials.gov by NCT number." },
                { num: "02", name: "Parse patient EHR", desc: "Extract lab events, medications, diagnoses, and unstructured clinical notes without PHI exposure." },
                { num: "03", name: "Match 40+ criteria", desc: "Execute 3-layer hybrid evaluation: deterministic boundary checks, NLP grounding, and ML scoring." },
                { num: "04", name: "Resolve borderline cases", desc: "Execute 3-round negotiation loop between matcher and compliance agents; flag unresolvable cases to humans." },
                { num: "05", name: "Check compliance", desc: "Verify HIPAA safe-harbor de-identification and institutional review board constraints." },
                { num: "06", name: "Generate outreach draft", desc: "Create IRB-approved patient letters in English, Spanish, Hindi, or Kannada." },
                { num: "07", name: "Export audit log", desc: "Generate complete immutable tamper-evident logs for FDA 21 CFR Part 11 compliance." },
              ].map((step) => (
                <div key={step.num} className="flex items-start gap-4 p-3 border border-[#E2E8F0] rounded-[4px] bg-[#F8FAFC]">
                  <span className="font-mono text-sm font-semibold text-[#2563EB] flex-shrink-0 pt-0.5">
                    {step.num}
                  </span>
                  <div>
                    <h3 className="text-sm font-semibold text-[#0F172A]">{step.name}</h3>
                    <p className="text-xs text-[#64748B] mt-0.5">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FOR WHOM SECTION ───────────────────────────────────── */}
      <section className="bg-[#F8FAFC] py-16 border-b border-[#E2E8F0]">
        <div className="max-w-screen-xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-[#E2E8F0] bg-white p-6 rounded-[4px]">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">PRIMARY USER</p>
              <h2 className="text-[18px] font-semibold text-[#0F172A] mt-2">Clinical Research Coordinators</h2>
              <p className="text-sm text-[#64748B] mt-2 leading-relaxed">
                Manage trial runs, review flagged borderline patients, approve outreach drafts, and export compliance reports.
              </p>
            </div>

            <div className="border border-[#E2E8F0] bg-white p-6 rounded-[4px]">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">SECONDARY USER</p>
              <h2 className="text-[18px] font-semibold text-[#0F172A] mt-2">Pharma Sponsors and Principal Investigators</h2>
              <p className="text-sm text-[#64748B] mt-2 leading-relaxed">
                Upload trial protocols, monitor recruitment funnel metrics, and access HIPAA audit trails for regulatory submissions.
              </p>
            </div>
          </div>
        </div>
      </section>

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
