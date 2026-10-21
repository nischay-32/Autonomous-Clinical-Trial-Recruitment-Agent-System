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
        setItem(found ?? null);
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
      setTimeout(() => router.push("/review"), 800);
    } catch (err) {
      console.error(err);
      setSubmitting(false);
    }
  };

  return (
    <AppShell pageTitle="Clinical Decision Required">
      <div className="space-y-6">
        <Link
          href="/review"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#4d5663] hover:text-[#1a2332]"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Review queue
        </Link>

        <div>
          <h1 className="text-[24px] font-bold text-[#1a2332]">
            Clinical decision required
          </h1>
          <p className="text-sm text-[#4d5663] mt-0.5">
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
            <p className="text-sm text-[#4d5663]">Case not found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* ── PANEL 1: PATIENT SUMMARY ────────────────────────── */}
            <div className="bg-white border border-[#d5d9e0] p-5 rounded-[4px] space-y-4">
              <div>
                <p className="text-xs font-medium text-[#4d5663]">Patient Case ID</p>
                <p className="font-mono text-[20px] font-bold text-[#1a2332] mt-0.5">
                  {item.patient_id}
                </p>
              </div>

              <div className="border-t border-[#d5d9e0] pt-3 space-y-2 text-xs">
                <div className="flex justify-between py-1">
                  <span className="text-[#4d5663]">Age / Gender:</span>
                  <span className="font-mono font-medium text-[#1a2332]">
                    {item.age} yrs · {item.gender === "M" ? "Male" : "Female"}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-[#4d5663]">Trial Protocol:</span>
                  <span className="font-mono font-medium text-[#1a2332]">{item.trial_id}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-[#4d5663]">Investigational Drug:</span>
                  <span className="font-medium text-[#1a2332]">{item.medicine}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-[#4d5663]">Queue Duration:</span>
                  <span className="font-mono text-[#1a2332]">{item.time_in_queue}</span>
                </div>
              </div>

              {/* Lab overview */}
              <div className="border-t border-[#d5d9e0] pt-3">
                <p className="text-xs font-semibold text-[#1a2332] mb-2">Key Lab Values</p>
                <div className="space-y-1.5 font-mono text-xs">
                  {Object.entries(item.labs || {}).map(([k, v]) => (
                    <div key={k} className="flex justify-between py-0.5 text-[#334155]">
                      <span>{k}:</span>
                      <span className="font-bold text-[#1a2332]">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── PANEL 2: DISAGREEMENT SUMMARY ───────────────────── */}
            <div className="bg-white border border-[#d5d9e0] p-5 rounded-[4px] space-y-4">
              <div>
                <h2 className="text-base font-semibold text-[#1a2332]">
                  What the agents disagreed on
                </h2>
                <blockquote className="mt-2 text-[15px] font-medium text-[#1a2332] italic border-l-2 border-[#0b5f5a] pl-3 py-1">
                  &ldquo;{item.disputed_criterion}&rdquo;
                </blockquote>
              </div>

              {/* Agent Stances Table */}
              <div className="border border-[#d5d9e0] rounded-[4px] overflow-hidden">
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
                <div className="p-2.5 bg-[#f4f5f7] border border-[#d5d9e0] rounded-[4px]">
                  <p className="font-semibold text-[#1a2332] mb-1">Matcher Reasoning:</p>
                  <p className="text-[#4d5663]">
                    {item.disagreement?.matcher_reasoning}
                  </p>
                </div>
                <div className="p-2.5 bg-[#f4f5f7] border border-[#d5d9e0] rounded-[4px]">
                  <p className="font-semibold text-[#1a2332] mb-1">Compliance Reasoning:</p>
                  <p className="text-[#4d5663]">
                    {item.disagreement?.compliance_reasoning}
                  </p>
                </div>
              </div>

              {/* Round History */}
              <div>
                <p className="text-xs font-semibold text-[#1a2332] mb-2">Round Negotiation History</p>
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
            <div className="bg-white border border-[#d5d9e0] p-5 rounded-[4px] space-y-5">
              <div>
                <h2 className="text-base font-semibold text-[#1a2332]">Patient evidence</h2>
                <div className="mt-2 p-3 bg-[#f4f5f7] border border-[#d5d9e0] rounded-[4px] text-xs space-y-1.5">
                  <p className="text-[#1a2332]">
                    <span className="font-semibold">Lab Event:</span> eGFR 46.2 mL/min/1.73m2 (Ref: &gt; 60).
                  </p>
                  <p className="text-[#1a2332]">
                    <span className="font-semibold">Date:</span> 2026-09-18 14:22:00 UTC
                  </p>
                  <p className="text-[#4d5663]">
                    <span className="font-semibold text-[#1a2332]">Clinical Note:</span> &ldquo;Patient exhibits mild renal insufficiency secondary to long-standing T2DM; stable over past 6 months.&rdquo;
                  </p>
                  <p className="font-mono text-[11px] text-[#4d5663] pt-1">
                    Source: LABEVENTS ITEMID=50912 / NOTEEVENTS #10948
                  </p>
                </div>
              </div>

              {/* Decision Section */}
              <div className="space-y-3 pt-2 border-t border-[#d5d9e0]">
                <h3 className="text-sm font-semibold text-[#1a2332]">Your decision</h3>

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
                      <label className="block text-xs font-medium text-[#1a2332] mb-1">
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

                    <p className="text-[11px] text-[#4d5663] text-center">
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
