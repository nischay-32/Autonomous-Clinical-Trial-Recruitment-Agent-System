import Image from "next/image";
import Link from "next/link";
import { PublicFooter, PublicHeader } from "@/components/PublicChrome";

const STEPS = [
  {
    title: "Read the record",
    body: "Structured diagnoses, lab values, and protocol criteria are loaded from the institution EHR. Raw identifiers stay inside the hospital network.",
  },
  {
    title: "Apply the protocol",
    body: "Each inclusion and exclusion rule is checked in order: numeric thresholds first, then comorbidity scoring, then note language against the protocol text.",
  },
  {
    title: "Coordinator review",
    body: "Borderline matches go to a review queue. Eligible matches produce an outreach letter draft. Nothing is sent until a coordinator signs off.",
  },
  {
    title: "Keep an audit log",
    body: "Each evaluation, vote, and approval is written to an append-only log for HIPAA and 21 CFR Part 11 review.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#f4f5f7]">
      <PublicHeader />

      <main className="flex-1">
        <section className="border-b border-[#d5d9e0] bg-white">
          <div className="max-w-screen-xl mx-auto px-6 py-16 md:py-20 grid md:grid-cols-[1.2fr_0.8fr] gap-12 items-start">
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-wide text-[#0b5f5a] mb-3">
                Clinical operations
              </p>
              <h1 className="font-serif text-[36px] md:text-[44px] leading-[1.15] text-[#1a2332] max-w-[18ch]">
                Screen EHR records against a trial protocol.
              </h1>
              <p className="mt-4 text-[16px] text-[#4d5663] max-w-[52ch]">
                TrialScreen is a coordinator console for eligibility review. It checks inclusion and exclusion criteria, holds uncertain cases for a person, and drafts outreach letters in English, Spanish, Hindi, or Kannada.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/login" className="btn btn-primary">Sign in</Link>
                <Link href="/register" className="btn btn-secondary">Request an account</Link>
              </div>
            </div>
            <aside className="border border-[#d5d9e0] bg-[#f4f5f7] p-6">
              <div className="flex items-center gap-3 mb-4">
                <Image src="/logo.png" alt="" width={40} height={40} />
                <div>
                  <p className="font-serif text-[16px] text-[#1a2332]">TrialScreen</p>
                  <p className="text-[12px] text-[#4d5663]">Academic project CI_PR_13</p>
                </div>
              </div>
              <ul className="text-[13px] text-[#1a2332] space-y-2 list-disc pl-4">
                <li>On-premises or institutional VPC deployment</li>
                <li>Human approval before any patient contact</li>
                <li>Immutable audit entries for each decision</li>
              </ul>
            </aside>
          </div>
        </section>

        <section className="max-w-screen-xl mx-auto px-6 py-16">
          <h2 className="font-serif text-[28px] text-[#1a2332] mb-8">How screening works</h2>
          <ol className="grid md:grid-cols-2 gap-6">
            {STEPS.map((step, i) => (
              <li key={step.title} className="card">
                <p className="text-[12px] font-semibold text-[#0b5f5a] mb-2">{String(i + 1).padStart(2, "0")}</p>
                <h3 className="font-serif text-[18px] text-[#1a2332] mb-2">{step.title}</h3>
                <p className="text-[14px] text-[#4d5663]">{step.body}</p>
              </li>
            ))}
          </ol>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
