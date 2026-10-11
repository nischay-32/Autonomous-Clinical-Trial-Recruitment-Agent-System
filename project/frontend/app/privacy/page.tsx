import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "TrialRecruit Privacy Policy — how we collect, use, and protect your information.",
};

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-8 py-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Privacy Policy</h1>
        <p className="text-sm text-slate-500 mt-1">Last updated: 11 October 2026</p>
      </div>

      <section className="space-y-3 text-sm text-slate-700 leading-relaxed">
        <h2 className="text-base font-semibold text-slate-900">1. Scope</h2>
        <p>
          This Privacy Policy applies to the TrialRecruit Clinical Recruitment System (the &ldquo;System&rdquo;), operated by the sponsoring research institution. It describes how protected health information (PHI) and personal data are handled within the System in accordance with applicable law, including HIPAA (45 CFR Parts 160 and 164), the EU General Data Protection Regulation (GDPR) (EU 2016/679), and relevant national legislation.
        </p>
      </section>

      <section className="space-y-3 text-sm text-slate-700 leading-relaxed">
        <h2 className="text-base font-semibold text-slate-900">2. Data Controller</h2>
        <p>
          The Data Controller is the sponsoring research institution operating this System. For data protection enquiries, contact the designated Data Protection Officer (DPO) at your institution.
        </p>
      </section>

      <section className="space-y-3 text-sm text-slate-700 leading-relaxed">
        <h2 className="text-base font-semibold text-slate-900">3. Data We Process</h2>
        <p>The System processes the following categories of data:</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>De-identified or pseudonymised patient clinical records (diagnoses, laboratory values, medications, demographics) used solely for eligibility determination.</li>
          <li>Clinical trial protocol documents and eligibility criteria (sponsor-supplied).</li>
          <li>Coordinator and investigator identity for audit attribution and communication sign-off.</li>
          <li>System usage logs and audit events for regulatory traceability.</li>
        </ul>
        <p>
          The System does not process fully identified PHI beyond what is necessary for eligibility screening under an applicable IRB-approved protocol and executed Business Associate Agreement (BAA).
        </p>
      </section>

      <section className="space-y-3 text-sm text-slate-700 leading-relaxed">
        <h2 className="text-base font-semibold text-slate-900">4. Lawful Basis for Processing</h2>
        <p>Processing is carried out under the following lawful bases:</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Informed consent of the research participant (FDA 21 CFR 50.20; GDPR Art. 9(2)(a)).</li>
          <li>Scientific research in the public interest (GDPR Art. 9(2)(j)).</li>
          <li>Compliance with a legal obligation (HIPAA covered entity obligations).</li>
        </ul>
      </section>

      <section className="space-y-3 text-sm text-slate-700 leading-relaxed">
        <h2 className="text-base font-semibold text-slate-900">5. Data Retention</h2>
        <p>
          Audit trail records are retained for a minimum of 15 years in compliance with FDA 21 CFR Part 11 and ICH E6(R2) GCP guidelines. Clinical screening records are retained per the institution&rsquo;s data retention schedule and applicable regulatory requirements.
        </p>
      </section>

      <section className="space-y-3 text-sm text-slate-700 leading-relaxed">
        <h2 className="text-base font-semibold text-slate-900">6. Data Security</h2>
        <p>
          The System implements administrative, physical, and technical safeguards including role-based access control (RBAC), TLS 1.3 transport encryption, AES-256 at-rest encryption, and append-only immutable audit logging consistent with FDA 21 CFR Part 11 requirements.
        </p>
      </section>

      <section className="space-y-3 text-sm text-slate-700 leading-relaxed">
        <h2 className="text-base font-semibold text-slate-900">7. Data Subject Rights</h2>
        <p>
          Where applicable under GDPR or HIPAA, research participants retain rights to access, rectification, erasure (subject to research exemptions), restriction of processing, and data portability. Requests should be directed to the institution&rsquo;s IRB or DPO.
        </p>
      </section>

      <section className="space-y-3 text-sm text-slate-700 leading-relaxed">
        <h2 className="text-base font-semibold text-slate-900">8. Changes to This Policy</h2>
        <p>
          Material changes to this policy will be communicated to system administrators and reflected in a revised effective date. Continued use of the System following notification constitutes acceptance of the updated terms.
        </p>
      </section>

      <div className="border-t border-slate-200 pt-4 text-xs text-slate-400">
        This document does not constitute legal advice. Consult your institution&rsquo;s legal counsel for compliance obligations specific to your jurisdiction and research protocols.
      </div>
    </div>
  );
}
