"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AppShell from "@/components/AppShell";
import { ArrowLeft } from "lucide-react";
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
  const [nctNumber, setNctNumber] = useState("NCT03844750");
  const [trialName, setTrialName] = useState("Empagliflozin in Heart Failure with Preserved Ejection Fraction");
  const [drugName, setDrugName] = useState("Empagliflozin");
  const [phase, setPhase] = useState("Phase III");
  const [sponsor, setSponsor] = useState("Boehringer Ingelheim & Eli Lilly");

  const [saveError, setSaveError] = useState<string | null>(null);
  const [criteria, setCriteria] = useState<ParsedCriterion[]>([
    { id: "C-1", type: "INCLUSION", text: "Adults age ≥ 18 years at consent", table_mapping: "PATIENTS.DOB", confidence_target: "≥ 0.95" },
    { id: "C-2", type: "INCLUSION", text: "NYHA Functional Class II-IV symptoms", table_mapping: "NOTEEVENTS.TEXT", confidence_target: "≥ 0.90" },
    { id: "C-3", type: "INCLUSION", text: "Left ventricular ejection fraction (LVEF) > 40%", table_mapping: "ECHO_DATA / NOTEEVENTS", confidence_target: "≥ 0.92" },
    { id: "C-4", type: "EXCLUSION", text: "Severe renal impairment (eGFR < 20 mL/min/1.73m2)", table_mapping: "LABEVENTS ITEMID=50912", confidence_target: "≥ 0.95" },
    { id: "C-5", type: "EXCLUSION", text: "Prior kidney transplant or dialysis within 90 days", table_mapping: "PROCEDURES_ICD", confidence_target: "≥ 0.98" },
  ]);

  const handleSaveAndLaunch = async () => {
    setSaveError(null);
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
      setSaveError(err instanceof Error ? err.message : "Could not save the trial.");
    }
  };

  return (
    <AppShell pageTitle="Create Trial">
      <div className="max-w-4xl space-y-6">
        <Link
          href="/trials"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#4d5663] hover:text-[#1a2332]"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to trials
        </Link>

        <p className="text-[13px] text-[#4d5663]">
          Register a protocol ID and confirm inclusion and exclusion rules before screening.
        </p>

        <div className="card space-y-3">
          <label className="block text-[12px] font-semibold">NCT or protocol ID</label>
          <input
            type="text"
            placeholder="NCT00000000"
            value={nctNumber}
            onChange={(e) => setNctNumber(e.target.value)}
            className="max-w-xs font-mono"
            required
          />
        </div>

        {/* Form fields */}
        <div className="bg-white border border-[#d5d9e0] p-6 rounded-[4px] space-y-4">
          <h2 className="text-[16px] font-semibold text-[#1a2332]">Trial Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#1a2332] mb-1">Trial name</label>
              <input
                type="text"
                value={trialName}
                onChange={(e) => setTrialName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#1a2332] mb-1">Drug name</label>
              <input
                type="text"
                value={drugName}
                onChange={(e) => setDrugName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#1a2332] mb-1">Phase</label>
              <select value={phase} onChange={(e) => setPhase(e.target.value)}>
                <option value="Phase I">Phase I</option>
                <option value="Phase II">Phase II</option>
                <option value="Phase III">Phase III</option>
                <option value="Phase IV">Phase IV</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#1a2332] mb-1">Sponsor name</label>
              <input
                type="text"
                value={sponsor}
                onChange={(e) => setSponsor(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Review criteria preview table */}
        <div className="bg-white border border-[#d5d9e0] rounded-[4px] overflow-hidden">
          <div className="p-4 border-b border-[#d5d9e0]">
            <h2 className="text-[16px] font-semibold text-[#1a2332]">Review criteria</h2>
            <p className="text-xs text-[#4d5663] mt-0.5">
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

        {saveError && (
          <div className="p-3 border border-[#f4c7c3] bg-[#fdecea] text-[13px] text-[#b42318]" role="alert">
            {saveError}
          </div>
        )}

        <div className="flex items-center gap-3 pt-2">
          <button type="button" onClick={handleSaveAndLaunch} className="btn btn-primary">
            Save trial
          </button>
          <button type="button" onClick={() => router.push("/trials")} className="btn btn-secondary">
            Cancel
          </button>
        </div>
      </div>
    </AppShell>
  );
}
