"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import { api, PatientRecord, Trial } from "@/lib/api";
import { Plus, X, CheckCircle2, AlertTriangle, XCircle, Sparkles } from "lucide-react";

export default function PatientsPage() {
  const [patients, setPatients] = useState<PatientRecord[]>([]);
  const [trials, setTrials] = useState<Trial[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTrial, setSelectedTrial] = useState("");
  const [selectedDecision, setSelectedDecision] = useState("All");
  const [minConfidence, setMinConfidence] = useState(0.5);

  // Screen Patient Modal State
  const [showScreenModal, setShowScreenModal] = useState(false);
  const [screenTrialId, setScreenTrialId] = useState("NCT00005143");
  const [screenSubjectId, setScreenSubjectId] = useState("PT-55291");
  const [screenAge, setScreenAge] = useState(58);
  const [screenGender, setScreenGender] = useState("M");
  const [screenDiagnoses, setScreenDiagnoses] = useState("250.00, 401.9");
  const [screenHbA1c, setScreenHbA1c] = useState("8.4");
  const [screenEgfr, setScreenEgfr] = useState("72.0");
  const [screenCreatinine, setScreenCreatinine] = useState("1.1");
  const [screenMeds, setScreenMeds] = useState("Lisinopril 10mg, Metformin 500mg");
  const [screeningLoading, setScreeningLoading] = useState(false);
  const [screenResult, setScreenResult] = useState<PatientRecord | null>(null);
  const [screenError, setScreenError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [patientsData, trialsData] = await Promise.all([
          api.patients(),
          api.trials().catch(() => []),
        ]);
        setPatients(patientsData);
        setTrials(trialsData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleScreenSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setScreeningLoading(true);
    setScreenError(null);
    setScreenResult(null);

    try {
      const diagnosesArray = screenDiagnoses
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const medsArray = screenMeds
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const labsObj: Record<string, number> = {};
      if (screenHbA1c) labsObj["HbA1c"] = parseFloat(screenHbA1c);
      if (screenEgfr) labsObj["eGFR"] = parseFloat(screenEgfr);
      if (screenCreatinine) labsObj["Serum Creatinine"] = parseFloat(screenCreatinine);

      const res = await api.screen(screenTrialId, {
        subject_id: screenSubjectId.trim(),
        age: Number(screenAge),
        gender: screenGender,
        diagnoses: diagnosesArray,
        medications: medsArray,
        labs: labsObj,
      });

      const newRecord = res.patient_record;
      setScreenResult(newRecord);

      // Immediately insert at the top of the patients cohort
      setPatients((prev) => [newRecord, ...prev.filter((p) => p.subject_id !== newRecord.subject_id)]);
    } catch (err: unknown) {
      setScreenError(err instanceof Error ? err.message : "Screening evaluation failed. Check trial parameters.");
    } finally {
      setScreeningLoading(false);
    }
  };

  const loadSampleBorderline = () => {
    setScreenTrialId("NCT00005143");
    setScreenSubjectId(`PT-${Math.floor(10000 + Math.random() * 90000)}`);
    setScreenAge(67);
    setScreenGender("F");
    setScreenDiagnoses("250.02, 585.3");
    setScreenHbA1c("9.2");
    setScreenEgfr("46.0");
    setScreenCreatinine("1.45");
    setScreenMeds("Glipizide 5mg, Amlodipine 5mg");
    setScreenResult(null);
    setScreenError(null);
  };

  const loadSampleEligible = () => {
    setScreenTrialId("NCT00005143");
    setScreenSubjectId(`PT-${Math.floor(10000 + Math.random() * 90000)}`);
    setScreenAge(54);
    setScreenGender("M");
    setScreenDiagnoses("250.00, 401.9");
    setScreenHbA1c("8.1");
    setScreenEgfr("82.0");
    setScreenCreatinine("0.95");
    setScreenMeds("Lisinopril 10mg, Metformin 500mg");
    setScreenResult(null);
    setScreenError(null);
  };

  const filtered = patients.filter((p) => {
    const matchesTrial = !selectedTrial || p.trial_id === selectedTrial;
    const matchesDecision =
      selectedDecision === "All" || p.status.toUpperCase() === selectedDecision.toUpperCase();
    const matchesConf = p.confidence >= minConfidence;
    return matchesTrial && matchesDecision && matchesConf;
  });

  return (
    <AppShell pageTitle="Patients">
      <div className="space-y-5">
        {/* Header with Screen Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-[24px] font-bold text-[#0F172A] tracking-tight">Patients</h1>
            <p className="text-xs text-[#64748B] mt-0.5">
              Automated multi-agent cohort evaluation across inclusion and exclusion criteria.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setScreenResult(null);
              setScreenError(null);
              setShowScreenModal(true);
            }}
            className="btn btn-primary text-xs shadow-sm self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            Screen New Patient
          </button>
        </div>

        {/* Filter row */}
        <div className="bg-white border border-[#E2E8F0] p-4 rounded-[4px] flex flex-wrap items-center gap-6">
          <div className="w-56">
            <label className="block text-xs font-medium text-[#64748B] mb-1">Trial</label>
            <select
              value={selectedTrial}
              onChange={(e) => setSelectedTrial(e.target.value)}
            >
              <option value="">All Trials</option>
              {trials.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.id} — {t.medicine}
                </option>
              ))}
            </select>
          </div>

          <div className="w-48">
            <label className="block text-xs font-medium text-[#64748B] mb-1">Decision</label>
            <select
              value={selectedDecision}
              onChange={(e) => setSelectedDecision(e.target.value)}
            >
              <option value="All">All Decisions</option>
              <option value="ELIGIBLE">Eligible</option>
              <option value="REVIEW_REQUIRED">Borderline / Review</option>
              <option value="INELIGIBLE">Rejected</option>
            </select>
          </div>

          <div className="flex-1 min-w-[200px]">
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-medium text-[#64748B]">Confidence Floor</label>
              <span className="font-mono text-xs font-medium text-[#0F172A]">
                {(minConfidence * 100).toFixed(0)}%
              </span>
            </div>
            <input
              type="range"
              min="0.4"
              max="0.95"
              step="0.05"
              value={minConfidence}
              onChange={(e) => setMinConfidence(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-[#E2E8F0] rounded-[2px] accent-[#2563EB] cursor-pointer"
            />
          </div>
        </div>

        {/* Patients Table */}
        <div className="bg-white border border-[#E2E8F0] rounded-[4px] overflow-hidden">
          <div className="overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>Patient ID</th>
                  <th>Age</th>
                  <th>Gender</th>
                  <th>Trial</th>
                  <th>Overall decision</th>
                  <th>Confidence</th>
                  <th>Criteria passed</th>
                  <th>Borderline count</th>
                  <th>Reviewed at</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center">
                      <div className="h-4 w-48 skeleton mx-auto" />
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-xs text-[#64748B]">
                      No patients match current filter parameters.
                    </td>
                  </tr>
                ) : (
                  filtered.map((pt) => {
                    const confPct = Math.round(pt.confidence * 100);
                    const barColor =
                      pt.confidence >= 0.85
                        ? "bg-[#16A34A]"
                        : pt.confidence >= 0.65
                        ? "bg-[#D97706]"
                        : "bg-[#DC2626]";

                    return (
                      <tr key={pt.subject_id}>
                        <td>
                          <Link
                            href={`/patients/${pt.subject_id}`}
                            className="font-mono font-medium text-[#2563EB] hover:underline"
                          >
                            {pt.subject_id}
                          </Link>
                        </td>
                        <td className="font-mono text-xs">{pt.age}</td>
                        <td>{pt.gender}</td>
                        <td className="font-mono text-xs">{pt.trial_id}</td>
                        <td>
                          {pt.status === "ELIGIBLE" && (
                            <span className="badge badge-success">Eligible</span>
                          )}
                          {pt.status === "REVIEW_REQUIRED" && (
                            <span className="badge badge-warning">Borderline</span>
                          )}
                          {pt.status === "INELIGIBLE" && (
                            <span className="badge badge-danger">Rejected</span>
                          )}
                        </td>
                        <td>
                          <div className="w-24">
                            <span className="font-mono text-xs font-medium text-[#0F172A] block mb-1">
                              {confPct}%
                            </span>
                            <div className="h-1.5 w-full bg-[#E2E8F0] rounded-[2px] overflow-hidden">
                              <div
                                style={{ width: `${confPct}%` }}
                                className={`h-full ${barColor}`}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="font-mono text-xs">{pt.criteria_passed}</td>
                        <td className="font-mono text-xs text-[#D97706] font-medium">
                          {pt.borderline_count}
                        </td>
                        <td className="font-mono text-[11px] text-[#64748B]">
                          {new Date(pt.reviewed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── SCREEN PATIENT MODAL DIALOG ───────────────────────── */}
        {showScreenModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white border border-[#CBD5E1] rounded-[8px] max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
                <div>
                  <h2 className="text-base font-bold text-[#0F172A] tracking-tight">Screen Patient Record</h2>
                  <p className="text-xs text-[#64748B] mt-0.5">
                    Evaluate clinical record through autonomous 6-agent criteria matcher.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowScreenModal(false)}
                  className="text-[#64748B] hover:text-[#0F172A] p-1 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Quick sample loader buttons */}
              <div className="flex items-center gap-2 pt-1">
                <span className="text-[11px] text-[#64748B] font-medium">Load Preset:</span>
                <button
                  type="button"
                  onClick={loadSampleEligible}
                  className="px-2 py-0.5 bg-[#F1F5F9] border border-[#CBD5E1] text-[11px] font-medium rounded hover:bg-[#E2E8F0] text-[#0F172A]"
                >
                  Clear Eligible (54y, DM2)
                </button>
                <button
                  type="button"
                  onClick={loadSampleBorderline}
                  className="px-2 py-0.5 bg-[#FEF3C7] border border-[#FDE68A] text-[11px] font-medium rounded hover:bg-[#FDE68A] text-[#92400E]"
                >
                  Borderline / Disagreement (67y, eGFR 46)
                </button>
              </div>

              {screenError && (
                <div className="p-3 bg-[#FEE2E2] border border-[#FECACA] rounded-[4px] text-xs text-[#DC2626]">
                  {screenError}
                </div>
              )}

              {/* Evaluation Outcome Banner */}
              {screenResult && (
                <div
                  className={`p-4 rounded-[4px] border ${
                    screenResult.status === "ELIGIBLE"
                      ? "bg-[#DCFCE7] border-[#86EFAC] text-[#166534]"
                      : screenResult.status === "REVIEW_REQUIRED"
                      ? "bg-[#FEF3C7] border-[#FDE68A] text-[#92400E]"
                      : "bg-[#FEE2E2] border-[#FECACA] text-[#991B1B]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {screenResult.status === "ELIGIBLE" && <CheckCircle2 className="w-5 h-5 text-[#16A34A]" />}
                      {screenResult.status === "REVIEW_REQUIRED" && <AlertTriangle className="w-5 h-5 text-[#D97706]" />}
                      {screenResult.status === "INELIGIBLE" && <XCircle className="w-5 h-5 text-[#DC2626]" />}
                      <div>
                        <p className="text-xs font-bold tracking-tight">
                          Screening Result: {screenResult.status} ({(screenResult.confidence * 100).toFixed(0)}% Confidence)
                        </p>
                        <p className="text-[11px] mt-0.5">
                          {screenResult.status === "ELIGIBLE" && "Patient matches all primary inclusion criteria. Outreach draft generated."}
                          {screenResult.status === "REVIEW_REQUIRED" && "Three-round agent disagreement reached. Case queued for clinical coordinator review."}
                          {screenResult.status === "INELIGIBLE" && "Hard protocol exclusion criterion triggered."}
                        </p>
                      </div>
                    </div>
                    {screenResult.status === "REVIEW_REQUIRED" && (
                      <Link
                        href="/review"
                        className="px-2.5 py-1 bg-white text-[#92400E] border border-[#FDE68A] rounded-[4px] text-xs font-semibold hover:bg-[#FFFBEB]"
                      >
                        Go to Review Queue →
                      </Link>
                    )}
                    {screenResult.status === "ELIGIBLE" && (
                      <Link
                        href="/outreach"
                        className="px-2.5 py-1 bg-white text-[#166534] border border-[#86EFAC] rounded-[4px] text-xs font-semibold hover:bg-[#F0FDF4]"
                      >
                        View Outreach Draft →
                      </Link>
                    )}
                  </div>
                </div>
              )}

              {/* Screening Form */}
              <form onSubmit={handleScreenSubmit} className="space-y-3.5">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-[#0F172A] mb-1">Target Trial Protocol</label>
                    <select
                      value={screenTrialId}
                      onChange={(e) => setScreenTrialId(e.target.value)}
                    >
                      {trials.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.id} — {t.medicine}
                        </option>
                      ))}
                      {!trials.some((t) => t.id === "NCT00005143") && (
                        <option value="NCT00005143">NCT00005143 — Metformin Trial</option>
                      )}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#0F172A] mb-1">Patient Subject ID</label>
                    <input
                      type="text"
                      required
                      placeholder="PT-10024"
                      value={screenSubjectId}
                      onChange={(e) => setScreenSubjectId(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-[#0F172A] mb-1">Age (Years)</label>
                    <input
                      type="number"
                      required
                      min={1}
                      max={120}
                      value={screenAge}
                      onChange={(e) => setScreenAge(parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#0F172A] mb-1">Gender</label>
                    <select
                      value={screenGender}
                      onChange={(e) => setScreenGender(e.target.value)}
                    >
                      <option value="M">Male (M)</option>
                      <option value="F">Female (F)</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#0F172A] mb-1">
                    ICD-9 Diagnoses (Comma-separated)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="250.00, 401.9"
                    value={screenDiagnoses}
                    onChange={(e) => setScreenDiagnoses(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-[#0F172A] mb-1">HbA1c (%)</label>
                    <input
                      type="text"
                      placeholder="8.2"
                      value={screenHbA1c}
                      onChange={(e) => setScreenHbA1c(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#0F172A] mb-1">eGFR (mL/min)</label>
                    <input
                      type="text"
                      placeholder="74.0"
                      value={screenEgfr}
                      onChange={(e) => setScreenEgfr(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#0F172A] mb-1">Creatinine (mg/dL)</label>
                    <input
                      type="text"
                      placeholder="1.1"
                      value={screenCreatinine}
                      onChange={(e) => setScreenCreatinine(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#0F172A] mb-1">Current Medications</label>
                  <input
                    type="text"
                    placeholder="Lisinopril 10mg, Metformin 500mg"
                    value={screenMeds}
                    onChange={(e) => setScreenMeds(e.target.value)}
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-3 border-t border-[#E2E8F0]">
                  <button
                    type="button"
                    onClick={() => setShowScreenModal(false)}
                    className="btn btn-secondary text-xs"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    disabled={screeningLoading}
                    className="btn btn-primary text-xs"
                  >
                    {screeningLoading ? "Running Agents..." : "Run Multi-Agent Evaluation"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
