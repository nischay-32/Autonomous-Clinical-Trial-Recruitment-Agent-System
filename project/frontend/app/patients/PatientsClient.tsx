"use client";

import { useState } from "react";
import { api, type Trial, type ScreenResult } from "@/lib/api";

const BLANK_FORM = {
  subject_id: "",
  gender: "M",
  age: 50,
  diagnoses: "",
  hba1c: "",
  medications: "",
};

function StatusBadge({ status }: { status: string }) {
  const cls =
    status === "ELIGIBLE" ? "badge-green" :
    status === "INELIGIBLE" ? "badge-red" :
    "badge-amber";
  return <span className={`badge ${cls}`}>{status.replace("_", " ")}</span>;
}

export default function PatientsPage({ initialTrials }: { initialTrials: Trial[] }) {
  const trials = initialTrials ?? [];
  const [form, setForm] = useState(BLANK_FORM);
  const [trialId, setTrialId] = useState(trials[0]?.id ?? "");
  const [result, setResult] = useState<ScreenResult | null>(null);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState("");

  async function run(e: React.FormEvent) {
    e.preventDefault();
    setRunning(true);
    setError("");
    setResult(null);
    try {
      const res = await api.screen(trialId, {
        subject_id: form.subject_id.trim(),
        gender: form.gender,
        age: Number(form.age),
        diagnoses: form.diagnoses.split(",").map((s) => s.trim()).filter(Boolean),
        labs: form.hba1c ? { hba1c: Number(form.hba1c) } : {},
        medications: form.medications.split(",").map((s) => s.trim()).filter(Boolean),
      });
      setResult(res);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Screening failed");
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Screen Patient</h1>
        <p className="page-subtitle">Run the full multi-agent eligibility pipeline against a trial protocol.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "380px 1fr", gap: 20, alignItems: "start" }}>
        {/* Form */}
        <div className="card">
          <h2 style={{ fontSize: 13, fontWeight: 600, marginBottom: 16 }}>Patient Data</h2>
          <form onSubmit={run}>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <label htmlFor="trial_sel">Trial Protocol</label>
                <select id="trial_sel" value={trialId} onChange={e => setTrialId(e.target.value)}>
                  {trials.map(t => (
                    <option key={t.id} value={t.id}>{t.medicine} — {t.id}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="subject_id">Subject ID</label>
                <input id="subject_id" type="text" placeholder="10006" required
                  value={form.subject_id} onChange={e => setForm(p => ({ ...p, subject_id: e.target.value }))} />
              </div>
              <div>
                <label htmlFor="gender">Gender</label>
                <select id="gender" value={form.gender} onChange={e => setForm(p => ({ ...p, gender: e.target.value }))}>
                  <option value="M">Male</option>
                  <option value="F">Female</option>
                  <option value="O">Other / Unknown</option>
                </select>
              </div>
              <div>
                <label htmlFor="age">Age (years)</label>
                <input id="age" type="number" min={0} max={120} required
                  value={form.age} onChange={e => setForm(p => ({ ...p, age: Number(e.target.value) }))} />
              </div>
              <div>
                <label htmlFor="diagnoses">ICD-9 Codes (comma-separated)</label>
                <input id="diagnoses" type="text" placeholder="250.00, 401.9"
                  value={form.diagnoses} onChange={e => setForm(p => ({ ...p, diagnoses: e.target.value }))} />
              </div>
              <div>
                <label htmlFor="hba1c">HbA1c (%)</label>
                <input id="hba1c" type="number" step="0.1" placeholder="7.5"
                  value={form.hba1c} onChange={e => setForm(p => ({ ...p, hba1c: e.target.value }))} />
              </div>
              <div>
                <label htmlFor="medications">Medications (comma-separated)</label>
                <input id="medications" type="text" placeholder="insulin, aspirin"
                  value={form.medications} onChange={e => setForm(p => ({ ...p, medications: e.target.value }))} />
              </div>
              {error && <p style={{ color: "var(--color-danger)", fontSize: 12 }}>{error}</p>}
              <button className="btn btn-primary" type="submit" disabled={running || trials.length === 0}>
                {running ? "Running pipeline..." : "Run Screening"}
              </button>
            </div>
          </form>
        </div>

        {/* Result */}
        {result ? (
          <div>
            <div className="card" style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                <StatusBadge status={result.status} />
                <span style={{ fontSize: 13, color: "var(--color-muted)" }}>
                  Subject #{result.subject_id} &middot; {result.trial_id}
                </span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                <div>
                  <div className="stat-label">Confidence</div>
                  <div style={{ fontWeight: 700, fontSize: 22 }}>
                    {(result.matcher.confidence * 100).toFixed(1)}%
                  </div>
                </div>
                <div>
                  <div className="stat-label">Consensus Rounds</div>
                  <div style={{ fontWeight: 700, fontSize: 22 }}>{result.consensus.rounds_executed}</div>
                </div>
                <div>
                  <div className="stat-label">Compliant</div>
                  <div style={{ fontWeight: 700, fontSize: 22 }}>
                    {result.compliance.is_compliant ? "Yes" : "No"}
                  </div>
                </div>
              </div>
            </div>

            {/* Compliance violations */}
            {result.compliance.violations.length > 0 && (
              <div className="card" style={{ marginBottom: 16, borderColor: "#fca5a5" }}>
                <h3 style={{ fontSize: 13, fontWeight: 600, color: "var(--color-danger)", marginBottom: 8 }}>
                  Compliance Violations
                </h3>
                <ul style={{ paddingLeft: 18, margin: 0, fontSize: 13 }}>
                  {result.compliance.violations.map((v, i) => <li key={i}>{v}</li>)}
                </ul>
              </div>
            )}

            {/* Outreach draft */}
            {result.outreach && (
              <div className="card" style={{ borderColor: "#86efac" }}>
                <h3 style={{ fontSize: 13, fontWeight: 600, color: "var(--color-success)", marginBottom: 8 }}>
                  Outreach Draft Generated
                </h3>
                <p style={{ fontSize: 12, fontWeight: 500, color: "var(--color-muted)", marginBottom: 4 }}>
                  Subject: {result.outreach.subject}
                </p>
                <pre style={{
                  fontSize: 12,
                  background: "var(--color-slate-50)",
                  padding: 12,
                  borderRadius: 6,
                  whiteSpace: "pre-wrap",
                  margin: 0,
                  fontFamily: "var(--font-sans)",
                  color: "var(--color-text)",
                }}>
                  {result.outreach.draft_content}
                </pre>
                <p style={{ fontSize: 11, color: "var(--color-muted)", marginTop: 8 }}>
                  Status: pending coordinator approval
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="card" style={{ color: "var(--color-muted)", fontSize: 13, padding: 32, textAlign: "center" }}>
            Submit the form to see screening results here.
          </div>
        )}
      </div>
    </div>
  );
}
