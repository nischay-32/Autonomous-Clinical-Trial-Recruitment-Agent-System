"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AppShell from "@/components/AppShell";
import { ArrowLeft, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { api, PatientRecord } from "@/lib/api";



export default function PatientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const patientId = resolvedParams.id;
  const router = useRouter();
  const [patient, setPatient] = useState<PatientRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await api.patient(patientId);
        setPatient(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [patientId]);

  return (
    <AppShell pageTitle={`Patient Evidence: ${patientId}`}>
      <div className="space-y-6">
        <Link
          href="/patients"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#64748B] hover:text-[#0F172A]"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to patients
        </Link>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="h-64 skeleton" />
            <div className="md:col-span-2 h-96 skeleton" />
          </div>
        ) : !patient ? (
          <div className="card text-center py-12">
            <p className="text-sm text-[#64748B]">Patient record not found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* ── LEFT COLUMN (Sticky Sidebar 1 col) ──────────────── */}
            <div className="space-y-5 lg:sticky lg:top-20">
              {/* Patient Summary Card */}
              <div className="bg-white border border-[#E2E8F0] p-5 rounded-[4px] space-y-4">
                <div>
                  <p className="text-xs font-medium text-[#64748B]">MIMIC De-Identified Subject</p>
                  <p className="font-mono text-[20px] font-bold text-[#0F172A] mt-0.5">
                    {patient.subject_id}
                  </p>
                </div>

                <div className="border-t border-[#E2E8F0] pt-3 space-y-2 text-xs">
                  <div className="flex justify-between py-1">
                    <span className="text-[#64748B]">Age / Gender:</span>
                    <span className="font-mono font-medium text-[#0F172A]">
                      {patient.age} yrs · {patient.gender === "M" ? "Male" : "Female"}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-[#64748B]">Language:</span>
                    <span className="font-medium text-[#0F172A]">English (EN)</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-[#64748B]">Target Trial:</span>
                    <span className="font-mono font-medium text-[#0F172A]">{patient.trial_id}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-[#64748B]">Screened Date:</span>
                    <span className="font-mono text-[#0F172A]">
                      {new Date(patient.reviewed_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Overall Decision Card */}
              <div className="bg-white border border-[#E2E8F0] p-5 rounded-[4px] text-center space-y-4">
                <p className="text-xs font-medium text-[#64748B]">Autonomous Evaluation</p>

                <div>
                  {patient.status === "ELIGIBLE" && (
                    <span className="badge badge-success text-xs py-1 px-3">ELIGIBLE</span>
                  )}
                  {patient.status === "REVIEW_REQUIRED" && (
                    <span className="badge badge-warning text-xs py-1 px-3">BORDERLINE REVIEW</span>
                  )}
                  {patient.status === "INELIGIBLE" && (
                    <span className="badge badge-danger text-xs py-1 px-3">INELIGIBLE</span>
                  )}
                </div>

                <div>
                  <p className="font-mono text-[32px] font-bold text-[#0F172A] leading-tight">
                    {(patient.confidence * 100).toFixed(0)}%
                  </p>
                  <p className="text-xs text-[#64748B]">Aggregate Matching Confidence</p>
                </div>

                <div className="pt-2">
                  {patient.status === "REVIEW_REQUIRED" && (
                    <Link
                      href={`/review/REV-${patient.subject_id}`}
                      className="btn btn-primary w-full text-xs"
                    >
                      Open clinical review
                    </Link>
                  )}
                  {patient.status === "ELIGIBLE" && (
                    <Link
                      href="/outreach"
                      className="btn btn-success w-full text-xs"
                    >
                      Approve outreach draft
                    </Link>
                  )}
                </div>
              </div>
            </div>

            {/* ── RIGHT COLUMN (Evidence Details 2 col) ───────────── */}
            <div className="lg:col-span-2 space-y-6">
              {/* Section 1: Criteria evaluation */}
              <div className="bg-white border border-[#E2E8F0] rounded-[4px] overflow-hidden">
                <div className="p-4 border-b border-[#E2E8F0]">
                  <h2 className="text-[16px] font-semibold text-[#0F172A]">Criteria evaluation</h2>
                  <p className="text-xs text-[#64748B] mt-0.5">
                    Individual protocol criteria evaluated against EHR records (borderline first).
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <table>
                    <thead>
                      <tr>
                        <th className="w-20">Type</th>
                        <th>Criterion text</th>
                        <th className="w-24">Decision</th>
                        <th className="w-24">Confidence</th>
                        <th>Evidence & Source</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(patient.criteria_evaluations || [])
                        .sort((a, b) => a.confidence - b.confidence)
                        .map((crit) => (
                          <tr key={crit.criterion_id}>
                            <td>
                              <span
                                className={`badge ${
                                  crit.type === "INCLUSION" ? "badge-success" : "badge-danger"
                                }`}
                              >
                                {crit.type}
                              </span>
                            </td>
                            <td className="text-xs font-medium text-[#0F172A]">{crit.text}</td>
                            <td>
                              {crit.status === "PASS" && (
                                <span className="badge badge-success">PASS</span>
                              )}
                              {crit.status === "BORDERLINE" && (
                                <span className="badge badge-warning">BORDERLINE</span>
                              )}
                              {crit.status === "FAIL" && (
                                <span className="badge badge-danger">FAIL</span>
                              )}
                            </td>
                            <td className="font-mono text-xs">
                              {(crit.confidence * 100).toFixed(0)}%
                            </td>
                            <td>
                              <p className="text-xs text-[#334155]">{crit.evidence}</p>
                              <p className="font-mono text-[11px] text-[#64748B] mt-0.5">
                                {crit.source}
                              </p>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Section 2: Extracted EHR data */}
              <div className="bg-white border border-[#E2E8F0] p-5 rounded-[4px] space-y-4">
                <h2 className="text-[16px] font-semibold text-[#0F172A]">Extracted EHR data</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {/* Diagnoses */}
                  <div className="border border-[#E2E8F0] p-3 rounded-[4px] bg-[#F8FAFC]">
                    <p className="font-medium text-[#0F172A] mb-2">Diagnoses (ICD Codes)</p>
                    <ul className="space-y-1 font-mono text-[#334155]">
                      {(patient.diagnoses || []).map((d, i) => (
                        <li key={i}>• {d}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Labs */}
                  <div className="border border-[#E2E8F0] p-3 rounded-[4px] bg-[#F8FAFC]">
                    <p className="font-medium text-[#0F172A] mb-2">Verified Lab Events</p>
                    <div className="space-y-1 font-mono text-[#334155]">
                      {Object.entries(patient.labs || {}).map(([name, val]) => (
                        <div key={name} className="flex justify-between">
                          <span>{name}:</span>
                          <span className="font-medium text-[#0F172A]">{val}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Medications */}
                {patient.medications && patient.medications.length > 0 && (
                  <div className="border border-[#E2E8F0] p-3 rounded-[4px] bg-[#F8FAFC] text-xs">
                    <p className="font-medium text-[#0F172A] mb-1.5">Active Medications</p>
                    <p className="text-[#334155] font-mono">
                      {patient.medications.join(", ")}
                    </p>
                  </div>
                )}
              </div>

              {/* Section 3: Disagreement sessions (if borderline) */}
              {patient.disagreement && (
                <div className="bg-white border border-[#E2E8F0] p-5 rounded-[4px] space-y-4">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-[#D97706]" />
                    <h2 className="text-[16px] font-semibold text-[#0F172A]">
                      Disagreement Sessions & Negotiation Loop
                    </h2>
                  </div>

                  <p className="text-xs text-[#64748B]">
                    Disputed Criterion:{" "}
                    <span className="font-medium text-[#0F172A]">
                      {patient.disagreement.criterion}
                    </span>
                  </p>

                  <div className="space-y-2 border-t border-[#E2E8F0] pt-3">
                    {patient.disagreement.rounds.map((r) => (
                      <div
                        key={r.round}
                        className="p-3 bg-[#FEF3C7] border border-[#FDE68A] rounded-[4px] text-xs"
                      >
                        <div className="flex justify-between font-semibold text-[#B45309] mb-1">
                          <span>Round {r.round} Evaluation</span>
                          <span>{r.result}</span>
                        </div>
                        <p className="text-[#78350F]">
                          Matcher: {r.matcher} | Compliance: {r.compliance}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
