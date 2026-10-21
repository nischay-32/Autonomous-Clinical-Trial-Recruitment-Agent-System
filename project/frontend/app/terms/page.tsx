import { PublicFooter, PublicHeader } from "@/components/PublicChrome";

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#f4f5f7] text-[#1a2332]">
      <PublicHeader action="home" />
      <main className="flex-1 max-w-[720px] w-full mx-auto px-6 py-16">
        <h1 className="font-serif text-3xl">Terms and Conditions</h1>
        <p className="text-sm text-[#4d5663] mt-1 mb-8">Effective date: 1 October 2026</p>
        <div className="space-y-8 text-sm text-[#2c3648] leading-relaxed">
          <section>
            <h2 className="font-serif text-base text-[#1a2332] mb-2">1. Use of the service</h2>
            <p>
              TrialScreen provides protocol criteria evaluation, cohort analysis, and human-in-the-loop review. Access is limited to authorized investigators, IRB coordinators, and sponsor personnel under an executed agreement.
            </p>
          </section>
          <section>
            <h2 className="font-serif text-base text-[#1a2332] mb-2">2. Account responsibilities</h2>
            <p>
              Users must safeguard login credentials. Sharing credentials is prohibited. Report unauthorized access to institutional IT security.
            </p>
          </section>
          <section>
            <h2 className="font-serif text-base text-[#1a2332] mb-2">3. Acceptable use</h2>
            <p>
              Do not upload unauthorized patient identifiers, attempt to re-identify patients, bypass role restrictions, or scrape the platform. Protocols processed must have valid IRB or ethics committee documentation.
            </p>
          </section>
          <section>
            <h2 className="font-serif text-base text-[#1a2332] mb-2">4. Intellectual property</h2>
            <p>
              Matching logic, scoring engines, and the user interface are proprietary. Clinical data and trial protocols remain the property of the sponsor or institution.
            </p>
          </section>
          <section>
            <h2 className="font-serif text-base text-[#1a2332] mb-2">5. No warranty</h2>
            <p>
              TrialScreen is provided as clinical decision support, as is. Automated evaluations are not a medical diagnosis and do not replace investigator judgment. Enrollment eligibility must be confirmed by qualified staff.
            </p>
          </section>
          <section>
            <h2 className="font-serif text-base text-[#1a2332] mb-2">6. Limitation of liability</h2>
            <p>
              To the extent permitted by law, TrialScreen developers and academic affiliates are not liable for indirect, incidental, or consequential damages from screening outcomes, trial delays, or protocol discrepancies.
            </p>
          </section>
          <section>
            <h2 className="font-serif text-base text-[#1a2332] mb-2">7. Governing law</h2>
            <p>
              These terms are governed by the laws of India and applicable healthcare regulations, without regard to conflict of law principles.
            </p>
          </section>
          <section>
            <h2 className="font-serif text-base text-[#1a2332] mb-2">8. Changes</h2>
            <p>
              Substantive updates will be sent to institutional administrators at least 30 days before they take effect.
            </p>
          </section>
          <section>
            <h2 className="font-serif text-base text-[#1a2332] mb-2">9. Contact</h2>
            <p>
              legal@trialscreen.org, Department of Clinical Research Operations, CI_PR_13, JSSATEB, VTU.
            </p>
          </section>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
