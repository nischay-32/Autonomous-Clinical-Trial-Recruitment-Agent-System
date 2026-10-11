"use client";

import { useState } from "react";
import { api, type Trial } from "@/lib/api";
import { PlusCircle, ChevronDown, ChevronUp } from "lucide-react";

interface Props {
  initialTrials: Trial[];
}

export default function TrialsClient({ initialTrials }: Props) {
  const [trials, setTrials] = useState<Trial[]>(initialTrials);
  const [showUpload, setShowUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState("");

  const [form, setForm] = useState({
    trial_id: "",
    title: "",
    medicine: "",
    min_age: "18",
    max_age: "80",
    required_icd9: "",
    excluded_icd9: "",
  });

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    setUploading(true);
    setUploadError("");
    setUploadSuccess("");
    try {
      await api.uploadProtocol({
        trial_id: form.trial_id.trim(),
        title: form.title.trim(),
        medicine: form.medicine.trim(),
        total_criteria: 0,
        criteria_rules: {
          min_age: Number(form.min_age),
          max_age: Number(form.max_age),
          required_icd9: form.required_icd9.split(",").map((s) => s.trim()).filter(Boolean),
          excluded_icd9: form.excluded_icd9.split(",").map((s) => s.trim()).filter(Boolean),
        },
      });
      const updated = await api.trials();
      setTrials(updated);
      setUploadSuccess(`Trial ${form.trial_id} registered successfully.`);
      setForm({ trial_id: "", title: "", medicine: "", min_age: "18", max_age: "80", required_icd9: "", excluded_icd9: "" });
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="page">
      <div className="page-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 className="page-title">Trials</h1>
          <p className="page-subtitle">{trials.length} protocol{trials.length !== 1 ? "s" : ""} loaded</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setShowUpload(!showUpload)}
          aria-expanded={showUpload}
        >
          <PlusCircle size={14} />
          Upload Protocol
          {showUpload ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>

      {/* B2B upload form */}
      {showUpload && (
        <div className="card" style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: "var(--color-text)" }}>
            Register Custom Trial Protocol
          </h2>
          <form onSubmit={handleUpload}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label htmlFor="trial_id">NCT Identifier</label>
                <input id="trial_id" type="text" placeholder="NCT00000001" required
                  value={form.trial_id} onChange={e => setForm(p => ({ ...p, trial_id: e.target.value }))} />
              </div>
              <div>
                <label htmlFor="medicine">Drug / Medicine</label>
                <input id="medicine" type="text" placeholder="metformin" required
                  value={form.medicine} onChange={e => setForm(p => ({ ...p, medicine: e.target.value }))} />
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label htmlFor="title">Trial Title</label>
                <input id="title" type="text" placeholder="Phase II Efficacy Study" required
                  value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
              </div>
              <div>
                <label htmlFor="min_age">Min Age</label>
                <input id="min_age" type="number" value={form.min_age}
                  onChange={e => setForm(p => ({ ...p, min_age: e.target.value }))} />
              </div>
              <div>
                <label htmlFor="max_age">Max Age</label>
                <input id="max_age" type="number" value={form.max_age}
                  onChange={e => setForm(p => ({ ...p, max_age: e.target.value }))} />
              </div>
              <div>
                <label htmlFor="required_icd9">Required ICD-9 codes (comma-separated)</label>
                <input id="required_icd9" type="text" placeholder="250.00, 250.02"
                  value={form.required_icd9} onChange={e => setForm(p => ({ ...p, required_icd9: e.target.value }))} />
              </div>
              <div>
                <label htmlFor="excluded_icd9">Excluded ICD-9 codes (comma-separated)</label>
                <input id="excluded_icd9" type="text" placeholder="584.9"
                  value={form.excluded_icd9} onChange={e => setForm(p => ({ ...p, excluded_icd9: e.target.value }))} />
              </div>
            </div>
            {uploadError && (
              <p style={{ color: "var(--color-danger)", fontSize: 12, marginTop: 8 }}>{uploadError}</p>
            )}
            {uploadSuccess && (
              <p style={{ color: "var(--color-success)", fontSize: 12, marginTop: 8 }}>{uploadSuccess}</p>
            )}
            <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
              <button className="btn btn-primary" type="submit" disabled={uploading}>
                {uploading ? "Registering..." : "Register Trial"}
              </button>
              <button className="btn btn-secondary" type="button" onClick={() => setShowUpload(false)}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Trials table */}
      <div className="card" style={{ padding: 0 }}>
        {trials.length === 0 ? (
          <p style={{ padding: 24, color: "var(--color-muted)", fontSize: 13 }}>
            No trials loaded. Backend may be offline, or upload the first protocol above.
          </p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>NCT ID</th>
                <th>Title</th>
                <th>Drug</th>
                <th>Criteria</th>
                <th>Age Range</th>
              </tr>
            </thead>
            <tbody>
              {trials.map((t) => {
                const rules = t.criteria_rules as Record<string, unknown>;
                return (
                  <tr key={t.id}>
                    <td style={{ fontFamily: "monospace", fontSize: 12 }}>{t.id}</td>
                    <td>{t.title}</td>
                    <td>
                      <span className="badge badge-blue">{t.medicine}</span>
                    </td>
                    <td>{t.total_criteria || "–"}</td>
                    <td style={{ fontSize: 12, color: "var(--color-muted)" }}>
                      {typeof rules.min_age === "number" && typeof rules.max_age === "number"
                        ? `${rules.min_age} – ${rules.max_age} yrs`
                        : "–"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
