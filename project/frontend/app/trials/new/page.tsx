"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AppShell from "@/components/AppShell";
import { ArrowLeft, UploadCloud, Search } from "lucide-react";
import { api } from "@/lib/api";

interface ParsedCriterion {
  id: string;
  type: "INCLUSION" | "EXCLUSION";
  text: string;
  table_mapping: string;
  confidence_target: string;
}

export default function CreateTrialPage() {
  const router = useRouter();
  const [importMethod, setImportMethod] = useState<"nct" | "pdf">("nct");
  const [nctNumber, setNctNumber] = useState("NCT03844750");
  const [fetching, setFetching] = useState(false);
  const [trialName, setTrialName] = useState("Empagliflozin in Heart Failure with Preserved Ejection Fraction");
  const [drugName, setDrugName] = useState("Empagliflozin");
  const [phase, setPhase] = useState("Phase III");
  const [sponsor, setSponsor] = useState("Boehringer Ingelheim & Eli Lilly");

  const [criteria, setCriteria] = useState<ParsedCriterion[]>([
    { id: "C-1", type: "INCLUSION", text: "Adults age ≥ 18 years at consent", table_mapping: "PATIENTS.DOB", confidence_target: "≥ 0.95" },
    { id: "C-2", type: "INCLUSION", text: "NYHA Functional Class II-IV symptoms", table_mapping: "NOTEEVENTS.TEXT", confidence_target: "≥ 0.90" },
    { id: "C-3", type: "INCLUSION", text: "Left ventricular ejection fraction (LVEF) > 40%", table_mapping: "ECHO_DATA / NOTEEVENTS", confidence_target: "≥ 0.92" },
    { id: "C-4", type: "EXCLUSION", text: "Severe renal impairment (eGFR < 20 mL/min/1.73m2)", table_mapping: "LABEVENTS ITEMID=50912", confidence_target: "≥ 0.95" },
    { id: "C-5", type: "EXCLUSION", text: "Prior kidney transplant or dialysis within 90 days", table_mapping: "PROCEDURES_ICD", confidence_target: "≥ 0.98" },
  ]);

  const handleFetchCriteria = () => {
    setFetching(true);
    setTimeout(() => {
      setFetching(false);
    }, 450);
  };

  const handleSaveAndLaunch = async () => {
    try {
      await api.uploadProtocol({
        trial_id: nctNumber || `TRIAL-${Date.now()}`,
        title: trialName,
        medicine: drugName,
        criteria_rules: {
          min_age: 18,
          max_age: 85,
          total_parsed_criteria: criteria.length,
          criteria,
        },
        total_criteria: criteria.length,
      });
      router.push("/trials");
    } catch (err) {
      console.error(err);
      router.push("/trials");
    }
  };

  return (
    <AppShell pageTitle="Create Trial">
      <div className="max-w-4xl space-y-6">
        <Link
          href="/trials"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#64748B] hover:text-[#0F172A]"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to trials
        </Link>

        <div>
          <h1 className="text-[24px] font-bold text-[#0F172A] tracking-tight">Create trial</h1>
          <p className="text-sm text-[#64748B] mt-0.5">
            Upload your trial protocol or enter the NCT number to auto-populate the eligibility criteria.
          </p>
        </div>

        {/* Two options: Equal-width cards with radio selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Option A: ClinicalTrials.gov */}
          <label
            className={`border rounded-[4px] p-5 cursor-pointer block transition-colors ${
              importMethod === "nct"
                ? "border-[#2563EB] bg-white ring-1 ring-[#2563EB]"
                : "border-[#E2E8F0] bg-white hover:border-[#CBD5E1]"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <input
                type="radio"
                name="importMethod"
                checked={importMethod === "nct"}
                onChange={() => setImportMethod("nct")}
                className="text-[#2563EB] focus:ring-[#2563EB]"
              />
              <span className="text-sm font-semibold text-[#0F172A]">
                Import from ClinicalTrials.gov
              </span>
            </div>
            <p className="text-xs text-[#64748B] mt-2 ml-5">
              Pull protocol metadata, inclusion, and exclusion criteria directly by NCT identifier.
            </p>
          </label>

          {/* Option B: Upload protocol PDF */}
          <label
            className={`border rounded-[4px] p-5 cursor-pointer block transition-colors ${
              importMethod === "pdf"
                ? "border-[#2563EB] bg-white ring-1 ring-[#2563EB]"
                : "border-[#E2E8F0] bg-white hover:border-[#CBD5E1]"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <input
                type="radio"
                name="importMethod"
                checked={importMethod === "pdf"}
                onChange={() => setImportMethod("pdf")}
                className="text-[#2563EB] focus:ring-[#2563EB]"
              />
              <span className="text-sm font-semibold text-[#0F172A]">
                Upload protocol PDF
              </span>
            </div>
            <p className="text-xs text-[#64748B] mt-2 ml-5">
              Upload institutional protocol document to extract criteria via Bio_ClinicalBERT.
            </p>
          </label>
        </div>

        {/* Input Block based on method */}
        {importMethod === "nct" ? (
          <div className="bg-white border border-[#E2E8F0] p-5 rounded-[4px] space-y-3">
            <label className="block text-xs font-medium text-[#0F172A]">NCT number</label>
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="NCT00000000"
                value={nctNumber}
                onChange={(e) => setNctNumber(e.target.value)}
                className="max-w-xs font-mono"
              />
              <button
                type="button"
                onClick={handleFetchCriteria}
                disabled={fetching}
                className="btn btn-primary text-xs"
              >
                {fetching ? "Fetching criteria..." : "Fetch criteria"}
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white border-2 border-dashed border-[#CBD5E1] p-8 rounded-[4px] text-center">
            <UploadCloud className="w-8 h-8 text-[#0F172A] mx-auto mb-2" />
            <p className="text-sm font-medium text-[#0F172A]">
              Drop your trial protocol PDF here or click to browse
            </p>
            <p className="text-xs text-[#64748B] mt-1">
              Supports standard institutional IRB protocols up to 50MB
            </p>
          </div>
        )}

        {/* Form fields */}
        <div className="bg-white border border-[#E2E8F0] p-6 rounded-[4px] space-y-4">
          <h2 className="text-[16px] font-semibold text-[#0F172A]">Trial Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#0F172A] mb-1">Trial name</label>
              <input
                type="text"
                value={trialName}
                onChange={(e) => setTrialName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#0F172A] mb-1">Drug name</label>
              <input
                type="text"
                value={drugName}
                onChange={(e) => setDrugName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#0F172A] mb-1">Phase</label>
              <select value={phase} onChange={(e) => setPhase(e.target.value)}>
                <option value="Phase I">Phase I</option>
                <option value="Phase II">Phase II</option>
                <option value="Phase III">Phase III</option>
                <option value="Phase IV">Phase IV</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#0F172A] mb-1">Sponsor name</label>
              <input
                type="text"
                value={sponsor}
                onChange={(e) => setSponsor(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Review criteria preview table */}
        <div className="bg-white border border-[#E2E8F0] rounded-[4px] overflow-hidden">
          <div className="p-4 border-b border-[#E2E8F0]">
            <h2 className="text-[16px] font-semibold text-[#0F172A]">Review criteria</h2>
            <p className="text-xs text-[#64748B] mt-0.5">
              Verify extracted criteria rules and their corresponding EHR database mappings.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th className="w-28">Type</th>
                  <th>Criterion text</th>
                  <th className="w-48">MIMIC-III table</th>
                  <th className="w-36">Confidence target</th>
                </tr>
              </thead>
              <tbody>
                {criteria.map((c, idx) => (
                  <tr key={c.id}>
                    <td>
                      <span
                        className={`badge ${
                          c.type === "INCLUSION" ? "badge-success" : "badge-danger"
                        }`}
                      >
                        {c.type}
                      </span>
                    </td>
                    <td>
                      <input
                        type="text"
                        value={c.text}
                        onChange={(e) => {
                          const updated = [...criteria];
                          updated[idx].text = e.target.value;
                          setCriteria(updated);
                        }}
                        className="text-xs py-1"
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={c.table_mapping}
                        onChange={(e) => {
                          const updated = [...criteria];
                          updated[idx].table_mapping = e.target.value;
                          setCriteria(updated);
                        }}
                        className="text-xs py-1 font-mono"
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={c.confidence_target}
                        onChange={(e) => {
                          const updated = [...criteria];
                          updated[idx].confidence_target = e.target.value;
                          setCriteria(updated);
                        }}
                        className="text-xs py-1 font-mono"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bottom action row */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={handleSaveAndLaunch}
            className="btn btn-primary"
          >
            Save and launch screening
          </button>
          <button
            type="button"
            onClick={() => router.push("/trials")}
            className="btn btn-secondary"
          >
            Save as draft
          </button>
        </div>
      </div>
    </AppShell>
  );
}
