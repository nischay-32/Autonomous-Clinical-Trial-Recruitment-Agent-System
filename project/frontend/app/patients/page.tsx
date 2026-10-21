"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import AppShell from "@/components/AppShell";
import { api, PatientRecord, Trial } from "@/lib/api";
import { Plus, X, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";

export default function PatientsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f4f5f7]" />}>
      <PatientsInner />
    </Suspense>
  );
}

function PatientsInner() {
  const searchParams = useSearchParams();
  const [patients, setPatients] = useState<PatientRecord[]>([]);
  const [trials, setTrials] = useState<Trial[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTrial, setSelectedTrial] = useState(searchParams.get("trial_id") || "");
  const [selectedDecision, setSelectedDecision] = useState("All");
  const [minConfidence, setMinConfidence] = useState(0.0);

  const [showScreenModal, setShowScreenModal] = useState(searchParams.get("screen") === "1");
  const [screenTrialId, setScreenTrialId] = useState(searchParams.get("trial_id") || "NCT00005143");
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
      const diagnosesArray = screenDiagnoses.split(",").map((s) => s.trim()).filter(Boolean);
      const medsArray = screenMeds.split(",").map((s) => s.trim()).filter(Boolean);
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
      setPatients((prev) => [newRecord, ...prev.filter((p) => p.subject_id !== newRecord.subject_id)]);
    } catch (err: unknown) {
      setScreenError(err instanceof Error ? err.message : "Screening failed. Check the trial and inputs.");
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
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <p className="text-[13px] text-[#4d5663]">
            Cohort records evaluated against inclusion and exclusion criteria.
          </p>
          <button
            type="button"
            onClick={() => {
              setScreenResult(null);
              setScreenError(null);
              setShowScreenModal(true);
            }}
            className="btn btn-primary self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            Screen patient
          </button>
        </div>

        <div className="card flex flex-wrap items-end gap-6">
          <div className="w-56">
            <label className="block text-[12px] font-semibold mb-1.5">Trial</label>
            <select value={selectedTrial} onChange={(e) => setSelectedTrial(e.target.value)}>
              <option value="">All trials</option>
              {trials.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.id}: {t.medicine}
                </option>
              ))}
            </select>
          </div>
          <div className="w-48">
            <label className="block text-[12px] font-semibold mb-1.5">Decision</label>
            <select value={selectedDecision} onChange={(e) => setSelectedDecision(e.target.value)}>
              <option value="All">All</option>
              <option value="ELIGIBLE">Eligible</option>
              <option value="REVIEW_REQUIRED">Borderline / Review</option>
              <option value="INELIGIBLE">Ineligible</option>
            </select>
          </div>
          <div className="flex-1 min-w-[200px]">
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-[12px] font-semibold">Minimum confidence</label>
              <span className="font-mono text-[12px]">{(minConfidence * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min="0.0"
              max="0.95"
              step="0.05"
              value={minConfidence}
              onChange={(e) => setMinConfidence(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-[#d5d9e0] accent-[#0b5f5a]"
            />
          </div>
        </div>

        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>Patient ID</th>
                  <th>Age</th>
                  <th>Gender</th>
                  <th>Trial</th>
                  <th>Decision</th>
                  <th>Confidence</th>
                  <th>Criteria passed</th>
                  <th>Borderline</th>
                  <th>Reviewed</th>
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
                    <td colSpan={9} className="py-12 text-center text-[13px] text-[#4d5663]">
                      No patients match the current filters.
                    </td>
                  </tr>
                ) : (
                  filtered.map((pt) => {
                    const confPct = Math.round(pt.confidence * 100);
                    const barColor =
                      pt.confidence >= 0.85
                        ? "bg-[#0b5f5a]"
                        : pt.confidence >= 0.65
                        ? "bg-[#9a6700]"
                        : "bg-[#b42318]";

                    return (
                      <tr key={`${pt.subject_id}-${pt.trial_id}`}>
                        <td>
                          <Link
                            href={`/patients/${pt.subject_id}`}
                            className="font-mono font-semibold text-[#0b5f5a] hover:underline"
                          >
                            {pt.subject_id}
                          </Link>
                        </td>
                        <td className="font-mono text-[12px]">{pt.age}</td>
                        <td>{pt.gender}</td>
                        <td className="font-mono text-[12px]">{pt.trial_id}</td>
                        <td>
                          {pt.status === "ELIGIBLE" && <span className="badge badge-success">Eligible</span>}
                          {pt.status === "REVIEW_REQUIRED" && <span className="badge badge-warning">Borderline</span>}
                          {pt.status === "INELIGIBLE" && <span className="badge badge-danger">Ineligible</span>}
                        </td>
                        <td>
                          <div className="w-24">
                            <span className="font-mono text-[12px] block mb-1">{confPct}%</span>
                            <div className="h-1.5 w-full bg-[#d5d9e0] overflow-hidden">
                              <div style={{ width: `${confPct}%` }} className={`h-full ${barColor}`} />
                            </div>
                          </div>
                        </td>
                        <td className="font-mono text-[12px]">{pt.criteria_passed}</td>
                        <td className="font-mono text-[12px]">{pt.borderline_count}</td>
                        <td className="font-mono text-[11px] text-[#4d5663]">
                          {new Date(pt.reviewed_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {showScreenModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1a2332]/40">
            <div className="bg-white border border-[#d5d9e0] max-w-xl w-full p-6 space-y-4 max-h-[92vh] overflow-y-auto">
              <div className="flex items-start justify-between pb-3 border-b border-[#d5d9e0]">
                <div>
                  <h2 className="font-serif text-[18px]">Screen patient record</h2>
                  <p className="text-[12px] text-[#4d5663] mt-0.5">
                    Run the record against the selected protocol criteria.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowScreenModal(false)}
                  className="text-[#4d5663] hover:text-[#1a2332] p-1"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] text-[#4d5663] font-semibold">Load sample:</span>
                <button type="button" onClick={loadSampleEligible} className="btn btn-secondary text-[11px] min-h-7 py-1">
                  Eligible (54y, DM2)
                </button>
                <button type="button" onClick={loadSampleBorderline} className="btn btn-secondary text-[11px] min-h-7 py-1">
                  Borderline (67y, eGFR 46)
                </button>
              </div>

              {screenError && (
                <div className="p-3 border border-[#f4c7c3] bg-[#fdecea] text-[12px] text-[#b42318]" role="alert">
                  {screenError}
                </div>
              )}

              {screenResult && (
                <div
                  className={`p-4 border ${
                    screenResult.status === "ELIGIBLE"
                      ? "bg-[#e6f4ea] border-[#b7e0c2] text-[#0f5c2e]"
                      : screenResult.status === "REVIEW_REQUIRED"
                      ? "bg-[#fff4d6] border-[#f0d78c] text-[#7a5200]"
                      : "bg-[#fdecea] border-[#f4c7c3] text-[#8a1c14]"
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-start gap-2">
                      {screenResult.status === "ELIGIBLE" && <CheckCircle2 className="w-5 h-5 shrink-0" />}
                      {screenResult.status === "REVIEW_REQUIRED" && <AlertTriangle className="w-5 h-5 shrink-0" />}
                      {screenResult.status === "INELIGIBLE" && <XCircle className="w-5 h-5 shrink-0" />}
                      <div>
                        <p className="text-[13px] font-semibold">
                          {screenResult.status} ({(screenResult.confidence * 100).toFixed(0)}% confidence)
                        </p>
                        <p className="text-[12px] mt-0.5">
                          {screenResult.status === "ELIGIBLE" && "Matches primary inclusion criteria. Outreach draft prepared."}
                          {screenResult.status === "REVIEW_REQUIRED" && "Borderline result. Queued for coordinator review."}
                          {screenResult.status === "INELIGIBLE" && "Hard exclusion criterion triggered."}
                        </p>
                      </div>
                    </div>
                    {screenResult.status === "REVIEW_REQUIRED" && (
                      <Link href="/review" className="btn btn-secondary text-[12px] min-h-8 py-1">Review queue</Link>
                    )}
                    {screenResult.status === "ELIGIBLE" && (
                      <Link href="/outreach" className="btn btn-secondary text-[12px] min-h-8 py-1">Outreach drafts</Link>
                    )}
                  </div>
                </div>
              )}

              <form onSubmit={handleScreenSubmit} className="space-y-3.5">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[12px] font-semibold mb-1.5">Trial protocol</label>
                    <select value={screenTrialId} onChange={(e) => setScreenTrialId(e.target.value)}>
                      {trials.map((t) => (
                        <option key={t.id} value={t.id}>{t.id}: {t.medicine}</option>
                      ))}
                      {!trials.some((t) => t.id === "NCT00005143") && (
                        <option value="NCT00005143">NCT00005143: Metformin Trial</option>
                      )}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[12px] font-semibold mb-1.5">Subject ID</label>
                    <input type="text" required value={screenSubjectId} onChange={(e) => setScreenSubjectId(e.target.value)} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[12px] font-semibold mb-1.5">Age</label>
                    <input type="number" required min={1} max={120} value={screenAge} onChange={(e) => setScreenAge(parseInt(e.target.value) || 0)} />
                  </div>
                  <div>
                    <label className="block text-[12px] font-semibold mb-1.5">Gender</label>
                    <select value={screenGender} onChange={(e) => setScreenGender(e.target.value)}>
                      <option value="M">Male (M)</option>
                      <option value="F">Female (F)</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-[12px] font-semibold mb-1.5">ICD-9 diagnoses (comma-separated)</label>
                  <input type="text" required value={screenDiagnoses} onChange={(e) => setScreenDiagnoses(e.target.value)} />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[12px] font-semibold mb-1.5">HbA1c (%)</label>
                    <input type="text" value={screenHbA1c} onChange={(e) => setScreenHbA1c(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-[12px] font-semibold mb-1.5">eGFR</label>
                    <input type="text" value={screenEgfr} onChange={(e) => setScreenEgfr(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-[12px] font-semibold mb-1.5">Creatinine</label>
                    <input type="text" value={screenCreatinine} onChange={(e) => setScreenCreatinine(e.target.value)} />
                  </div>
                </div>
                <div>
                  <label className="block text-[12px] font-semibold mb-1.5">Medications</label>
                  <input type="text" value={screenMeds} onChange={(e) => setScreenMeds(e.target.value)} />
                </div>
                <div className="pt-2 flex items-center justify-end gap-3 border-t border-[#d5d9e0]">
                  <button type="button" onClick={() => setShowScreenModal(false)} className="btn btn-secondary">Close</button>
                  <button type="submit" disabled={screeningLoading} className="btn btn-primary">
                    {screeningLoading ? "Evaluating..." : "Run screening"}
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
