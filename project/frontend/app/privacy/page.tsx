import { PublicFooter, PublicHeader } from "@/components/PublicChrome";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#f4f5f7] text-[#1a2332]">
      <PublicHeader action="home" />
      <main className="flex-1 max-w-[720px] w-full mx-auto px-6 py-16">
        <h1 className="font-serif text-3xl">Privacy Policy</h1>
        <p className="text-sm text-[#4d5663] mt-1 mb-8">Effective date: 1 October 2026</p>
        <div className="space-y-8 text-sm text-[#2c3648] leading-relaxed">
          <section>
            <h2 className="font-serif text-base text-[#1a2332] mb-2">1. What data we collect</h2>
            <p>
              We collect the information you provide when creating an account (name, work email, organization name, and clinical title). We do not collect, store, or process patient health data on our cloud servers. Electronic health record data remains on the institution database and is processed locally or in the designated virtual private cloud.
            </p>
          </section>
          <section>
            <h2 className="font-serif text-base text-[#1a2332] mb-2">2. How we use account data</h2>
            <p>
              Account data is used only to authenticate users, enforce role-based access, and associate screening runs with the organization. We do not sell account data, contact details, or operational logs.
            </p>
          </section>
          <section>
            <h2 className="font-serif text-base text-[#1a2332] mb-2">3. Patient data and HIPAA</h2>
            <p>
              TrialScreen is designed for on-premises or institutional VPC deployment under a HIPAA Business Associate Agreement. Patient data does not leave the network perimeter. Identifiers shown in the interface are institutional subject IDs. Names, Social Security numbers, telephone numbers, and addresses are not displayed.
            </p>
          </section>
          <section>
            <h2 className="font-serif text-base text-[#1a2332] mb-2">4. Cookies and session data</h2>
            <p>
              Authentication uses a session token in this browser. We do not use third-party analytics cookies, advertising trackers, or fingerprinting scripts.
            </p>
          </section>
          <section>
            <h2 className="font-serif text-base text-[#1a2332] mb-2">5. Data retention</h2>
            <p>
              Account data is retained for the duration of the organization subscription. Audit logs required under FDA 21 CFR Part 11 follow the institution retention schedule (default: 7 years). Request account deletion by writing to the contact below.
            </p>
          </section>
          <section>
            <h2 className="font-serif text-base text-[#1a2332] mb-2">6. Contact</h2>
            <p>
              Privacy questions: compliance@trialscreen.org. Postal: TrialScreen Data Governance, Department of Clinical Informatics, Bangalore, Karnataka.
            </p>
          </section>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
