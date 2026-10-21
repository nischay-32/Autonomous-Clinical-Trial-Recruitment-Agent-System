"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import { ArrowLeft } from "lucide-react";
import { api, Trial, PatientRecord } from "@/lib/api";

function statusBadge(status: PatientRecord["status"]) {
  if (status === "ELIGIBLE") return <span className="badge badge-success">Eligible</span>;
  if (status === "REVIEW_REQUIRED") return <span className="badge badge-warning">Borderline</span>;
  return <span className="badge badge-danger">Ineligible</span>;
}

export default function TrialDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const trialId = use(params).id;
  const [trial, setTrial] = useState<Trial | null>(null);
  const [patients, setPatients] = useState<PatientRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [t, pts] = await Promise.all([
          api.trial(trialId),
          api.patients(trialId),
        ]);
        setTrial(t);
        setPatients(pts);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [trialId]);

  const rules = (trial?.criteria_rules ?? {}) as Record<string, unknown>;

  return (
    <AppShell pageTitle={`Trial ${trialId}`}>
      <div className="space-y-6">
        <Link href="/trials" className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[#4d5663] hover:text-[#1a2332]">
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to trials
        </Link>

        {loading ? (
          <div className="space-y-4">
            <div className="h-8 w-64 skeleton" />
            <div className="h-32 skeleton" />
          </div>
        ) : !trial ? (
          <div className="card text-center py-12">
            <p className="text-[13px] text-[#4d5663]">Trial not found.</p>
          </div>
        ) : (
          <>
            <div className="card flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <p className="font-mono text-[12px] font-semibold">{trial.id}</p>
                <h2 className="font-serif text-[22px] mt-1">{trial.title}</h2>
                <p className="text-[13px] text-[#4d5663] mt-1">
                  Drug: {trial.medicine}. Screened {trial.patients_screened ?? patients.length}.
                  Eligible {trial.eligible ?? 0}. Pending review {trial.pending_review ?? 0}.
                </p>
              </div>
              <Link href={`/patients?trial_id=${trial.id}&screen=1`} className="btn btn-primary">
                Screen a patient
              </Link>
            </div>

            {Object.keys(rules).length > 0 && (
              <div className="card">
                <h3 className="font-serif text-[16px] mb-3">Protocol rules</h3>
                <pre className="font-mono text-[12px] bg-[#f4f5f7] border border-[#d5d9e0] p-3 overflow-x-auto">
                  {JSON.stringify(rules, null, 2)}
                </pre>
              </div>
            )}

            <div className="card p-0 overflow-hidden">
              <div className="p-4 border-b border-[#d5d9e0] flex items-center justify-between">
                <h3 className="font-serif text-[16px]">Processed patients</h3>
                <span className="text-[12px] text-[#4d5663]">{patients.length} records</span>
              </div>
              <div className="overflow-x-auto">
                <table>
                  <thead>
                    <tr>
                      <th>Patient ID</th>
                      <th>Age</th>
                      <th>Gender</th>
                      <th>Decision</th>
                      <th>Confidence</th>
                      <th>Reviewed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {patients.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-10 text-center text-[13px] text-[#4d5663]">
                          No patients screened for this trial yet.
                        </td>
                      </tr>
                    ) : (
                      patients.map((p) => (
                        <tr key={p.subject_id}>
                          <td>
                            <Link href={`/patients/${p.subject_id}`} className="font-mono font-semibold text-[#0b5f5a] hover:underline">
                              {p.subject_id}
                            </Link>
                          </td>
                          <td className="font-mono text-[12px]">{p.age}</td>
                          <td>{p.gender}</td>
                          <td>{statusBadge(p.status)}</td>
                          <td className="font-mono text-[12px]">{Math.round(p.confidence * 100)}%</td>
                          <td className="font-mono text-[11px] text-[#4d5663]">
                            {p.reviewed_at ? new Date(p.reviewed_at).toLocaleString() : "-"}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
