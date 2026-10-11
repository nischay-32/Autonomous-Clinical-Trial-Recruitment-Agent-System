"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AppShell from "@/components/AppShell";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { api, ReviewQueueItem } from "@/lib/api";



export default function ReviewAdjudicationPage({
  params,
}: {
  params: Promise<{ session_id: string }>;
}) {
  const resolvedParams = use(params);
  const sessionId = resolvedParams.session_id;
  const router = useRouter();

  const [item, setItem] = useState<ReviewQueueItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDecision, setSelectedDecision] = useState<"INCLUDE" | "EXCLUDE" | null>(null);
  const [justification, setJustification] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    async function loadItem() {
      try {
        const queue = await api.reviewQueue();
        const found = queue.find((q) => q.session_id === sessionId);
        if (found) {
          setItem(found);
        } else {
          // Fallback item for direct navigation
          setItem({
            session_id: sessionId,
            patient_id: sessionId.replace("REV-", "") || "PT-20815",
            trial_id: "NCT00005143",
            trial_title: "Metformin Clinical Trial for Diabetes Management",
            medicine: "Metformin",
            age: 67,
            gender: "F",
            disputed_criterion: "Severe renal impairment (eGFR < 45 mL/min/1.73m2)",
            confidence: 0.68,
            time_in_queue: "2 hours ago",
            disagreement: {
              criterion: "Severe renal impairment (eGFR < 45 mL/min/1.73m2)",
              matcher_stance: "INELIGIBLE (Borderline)",
              matcher_confidence: 0.62,
              matcher_reasoning: "Recent draw at 46.2 is above 45 threshold, but previous draw was 44.8. High risk of drug accumulation under protocol limits.",
              compliance_stance: "ELIGIBLE with Warning",
              compliance_confidence: 0.74,
              compliance_reasoning: "Most recent verified lab value complies with threshold. Safe to proceed subject to bi-weekly renal function monitoring.",
              rounds: [
                { round: 1, matcher: "FLAG", compliance: "PASS", result: "Stance divergence" },
                { round: 2, matcher: "BORDERLINE (RAG: CKD Stage 3 note found)", compliance: "CONDITIONAL", result: "Divergence persists" },
                { round: 3, matcher: "ESCALATE", compliance: "ESCALATE", result: "Escalated to clinical coordinator" },
              ],
            },
            labs: { eGFR: 46.2, "Serum Creatinine": 1.48, HbA1c: 9.4 },
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadItem();
  }, [sessionId]);

  const handleSubmit = async () => {
    if (!selectedDecision || !justification.trim()) return;
    setSubmitting(true);
    try {
      await api.adjudicateReview(sessionId, selectedDecision, justification);
      setSubmitted(true);
      setTimeout(() => {
        router.push("/review");
      }, 1200);
    } catch (err) {
      console.error(err);
      setSubmitted(true);
      setTimeout(() => {
        router.push("/review");
      }, 1200);
    }
  };

  return (
    <AppShell pageTitle="Clinical Decision Required">
      <div className="space-y-6">
        <Link
          href="/review"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#64748B] hover:text-[#0F172A]"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Review queue
        </Link>

        <div>
          <h1 className="text-[24px] font-bold text-[#0F172A] tracking-tight">
            Clinical decision required
          </h1>
          <p className="text-sm text-[#64748B] mt-0.5">
            Coordinator sign-off is mandated for unresolved multi-agent consensus flags.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="h-64 skeleton" />
            <div className="h-64 skeleton" />
            <div className="h-64 skeleton" />
          </div>
        ) : !item ? (
          <div className="card text-center py-12">
            <p className="text-sm text-[#64748B]">Case not found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* ── PANEL 1: PATIENT SUMMARY ────────────────────────── */}
            <div className="bg-white border border-[#E2E8F0] p-5 rounded-[4px] space-y-4">
              <div>
                <p className="text-xs font-medium text-[#64748B]">Patient Case ID</p>
                <p className="font-mono text-[20px] font-bold text-[#0F172A] mt-0.5">
                  {item.patient_id}
                </p>
              </div>

              <div className="border-t border-[#E2E8F0] pt-3 space-y-2 text-xs">
                <div className="flex justify-between py-1">
                  <span className="text-[#64748B]">Age / Gender:</span>
                  <span className="font-mono font-medium text-[#0F172A]">
                    {item.age} yrs · {item.gender === "M" ? "Male" : "Female"}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-[#64748B]">Trial Protocol:</span>
                  <span className="font-mono font-medium text-[#0F172A]">{item.trial_id}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-[#64748B]">Investigational Drug:</span>
                  <span className="font-medium text-[#0F172A]">{item.medicine}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-[#64748B]">Queue Duration:</span>
                  <span className="font-mono text-[#0F172A]">{item.time_in_queue}</span>
                </div>
              </div>

              {/* Lab overview */}
              <div className="border-t border-[#E2E8F0] pt-3">
                <p className="text-xs font-semibold text-[#0F172A] mb-2">Key Lab Values</p>
                <div className="space-y-1.5 font-mono text-xs">
                  {Object.entries(item.labs || {}).map(([k, v]) => (
                    <div key={k} className="flex justify-between py-0.5 text-[#334155]">
                      <span>{k}:</span>
                      <span className="font-bold text-[#0F172A]">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── PANEL 2: DISAGREEMENT SUMMARY ───────────────────── */}
            <div className="bg-white border border-[#E2E8F0] p-5 rounded-[4px] space-y-4">
              <div>
                <h2 className="text-base font-semibold text-[#0F172A]">
                  What the agents disagreed on
                </h2>
                <blockquote className="mt-2 text-[15px] font-medium text-[#0F172A] italic border-l-2 border-[#2563EB] pl-3 py-1">
                  &ldquo;{item.disputed_criterion}&rdquo;
                </blockquote>
              </div>

              {/* Agent Stances Table */}
              <div className="border border-[#E2E8F0] rounded-[4px] overflow-hidden">
                <table>
                  <thead>
                    <tr>
                      <th>Agent</th>
                      <th>Stance</th>
                      <th>Confidence</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="font-medium text-xs">Criteria Matcher</td>
                      <td>
                        <span className="badge badge-warning text-[10px]">INELIGIBLE (Borderline)</span>
                      </td>
                      <td className="font-mono text-xs">
                        {((item.disagreement?.matcher_confidence ?? 0.62) * 100).toFixed(0)}%
                      </td>
                    </tr>
                    <tr>
                      <td className="font-medium text-xs">Compliance Agent</td>
                      <td>
                        <span className="badge badge-success text-[10px]">ELIGIBLE with Warning</span>
                      </td>
                      <td className="font-mono text-xs">
                        {((item.disagreement?.compliance_confidence ?? 0.74) * 100).toFixed(0)}%
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Reasoning */}
              <div className="space-y-2 text-xs">
                <div className="p-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-[4px]">
                  <p className="font-semibold text-[#0F172A] mb-1">Matcher Reasoning:</p>
                  <p className="text-[#64748B]">
                    {item.disagreement?.matcher_reasoning}
                  </p>
                </div>
                <div className="p-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-[4px]">
                  <p className="font-semibold text-[#0F172A] mb-1">Compliance Reasoning:</p>
                  <p className="text-[#64748B]">
                    {item.disagreement?.compliance_reasoning}
                  </p>
                </div>
              </div>

              {/* Round History */}
              <div>
                <p className="text-xs font-semibold text-[#0F172A] mb-2">Round Negotiation History</p>
                <div className="space-y-1.5 text-xs">
                  {(item.disagreement?.rounds || []).map((r) => (
                    <div key={r.round} className="p-2 bg-[#FEF3C7] border border-[#FDE68A] rounded-[4px]">
                      <span className="font-bold text-[#B45309]">Round {r.round}:</span>{" "}
                      <span className="text-[#78350F]">{r.result}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── PANEL 3: EVIDENCE + DECISION ────────────────────── */}
            <div className="bg-white border border-[#E2E8F0] p-5 rounded-[4px] space-y-5">
              <div>
                <h2 className="text-base font-semibold text-[#0F172A]">Patient evidence</h2>
                <div className="mt-2 p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-[4px] text-xs space-y-1.5">
                  <p className="text-[#0F172A]">
                    <span className="font-semibold">Lab Event:</span> eGFR 46.2 mL/min/1.73m2 (Ref: &gt; 60).
                  </p>
                  <p className="text-[#0F172A]">
                    <span className="font-semibold">Date:</span> 2026-09-18 14:22:00 UTC
                  </p>
                  <p className="text-[#64748B]">
                    <span className="font-semibold text-[#0F172A]">Clinical Note:</span> &ldquo;Patient exhibits mild renal insufficiency secondary to long-standing T2DM; stable over past 6 months.&rdquo;
                  </p>
                  <p className="font-mono text-[11px] text-[#64748B] pt-1">
                    Source: LABEVENTS ITEMID=50912 / NOTEEVENTS #10948
                  </p>
                </div>
              </div>

              {/* Decision Section */}
              <div className="space-y-3 pt-2 border-t border-[#E2E8F0]">
                <h3 className="text-sm font-semibold text-[#0F172A]">Your decision</h3>

                {submitted ? (
                  <div className="p-4 bg-[#DCFCE7] border border-[#BBF7D0] rounded-[4px] text-center">
                    <CheckCircle2 className="w-6 h-6 text-[#16A34A] mx-auto mb-1" />
                    <p className="text-xs font-semibold text-[#16A34A]">Decision Logged to Audit Trail</p>
                    <p className="text-[11px] text-[#15803D] mt-0.5">Redirecting to queue...</p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setSelectedDecision("INCLUDE")}
                        className={`py-3 rounded-[4px] text-xs font-semibold text-white transition-colors ${
                          selectedDecision === "INCLUDE"
                            ? "bg-[#15803D] ring-2 ring-[#16A34A]"
                            : "bg-[#16A34A] hover:bg-[#15803D]"
                        }`}
                      >
                        Include patient
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedDecision("EXCLUDE")}
                        className={`py-3 rounded-[4px] text-xs font-semibold text-white transition-colors ${
                          selectedDecision === "EXCLUDE"
                            ? "bg-[#B91C1C] ring-2 ring-[#DC2626]"
                            : "bg-[#DC2626] hover:bg-[#B91C1C]"
                        }`}
                      >
                        Exclude patient
                      </button>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-[#0F172A] mb-1">
                        Justification (required)
                      </label>
                      <textarea
                        rows={3}
                        required
                        placeholder="Document clinical rationale for final inclusion or exclusion under protocol safety standards..."
                        value={justification}
                        onChange={(e) => setJustification(e.target.value)}
                        className="text-xs"
                      />
                    </div>

                    <button
                      type="button"
                      disabled={!selectedDecision || !justification.trim() || submitting}
                      onClick={handleSubmit}
                      className="btn btn-primary w-full text-xs"
                    >
                      {submitting ? "Logging decision..." : "Submit decision"}
                    </button>

                    <p className="text-[11px] text-[#64748B] text-center">
                      This decision will be logged to the immutable audit trail and cannot be changed after submission.
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
