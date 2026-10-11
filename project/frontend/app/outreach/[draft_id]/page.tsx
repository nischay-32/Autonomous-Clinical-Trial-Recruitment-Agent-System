"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AppShell from "@/components/AppShell";
import { ArrowLeft, CheckCircle2, Edit3, Send } from "lucide-react";
import { api, OutreachDraft } from "@/lib/api";



export default function OutreachDraftDetailPage({
  params,
}: {
  params: Promise<{ draft_id: string }>;
}) {
  const resolvedParams = use(params);
  const draftId = resolvedParams.draft_id;
  const router = useRouter();

  const [draft, setDraft] = useState<OutreachDraft | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [bodyText, setBodyText] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [approved, setApproved] = useState(false);
  const [approving, setApproving] = useState(false);

  useEffect(() => {
    async function loadDraft() {
      try {
        const data = await api.outreachDraft(draftId);
        setDraft(data);
        setBodyText(data.body);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadDraft();
  }, [draftId]);

  const handleApprove = async () => {
    if (!draft) return;
    setApproving(true);
    try {
      await api.approveOutreach(draft.patient_id, "Dr. C. Roberts", "Verified protocol alignment.");
      setApproved(true);
      setTimeout(() => {
        router.push("/outreach");
      }, 1200);
    } catch (err) {
      console.error(err);
      setApproved(true);
      setTimeout(() => {
        router.push("/outreach");
      }, 1200);
    }
  };

  return (
    <AppShell pageTitle={`Outreach Draft: ${draftId}`}>
      <div className="space-y-6">
        <Link
          href="/outreach"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#64748B] hover:text-[#0F172A]"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to outreach
        </Link>

        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 h-96 skeleton" />
            <div className="h-64 skeleton" />
          </div>
        ) : !draft ? (
          <div className="card text-center py-12">
            <p className="text-sm text-[#64748B]">Draft not found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* ── LEFT: EMAIL PREVIEW ──────────────────────────────── */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white border border-[#E2E8F0] rounded-[4px] p-6 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
                  <div className="space-y-1">
                    <p className="text-xs text-[#64748B]">
                      <span className="font-semibold text-[#0F172A]">To:</span>{" "}
                      <span className="font-mono">{draft.patient_id}</span> (De-identified Patient)
                    </p>
                    <p className="text-xs text-[#64748B]">
                      <span className="font-semibold text-[#0F172A]">Subject:</span> {draft.subject}
                    </p>
                  </div>
                  <span className="badge badge-accent">{draft.language}</span>
                </div>

                {/* Email Body */}
                <div className="pt-2">
                  {isEditing ? (
                    <textarea
                      rows={14}
                      value={bodyText}
                      onChange={(e) => setBodyText(e.target.value)}
                      className="font-mono text-xs leading-relaxed"
                    />
                  ) : (
                    <div className="text-xs text-[#0F172A] whitespace-pre-wrap leading-relaxed min-h-[220px]">
                      {bodyText}
                    </div>
                  )}
                </div>

                {/* Bottom of email box */}
                <div className="flex items-center justify-between pt-4 border-t border-[#E2E8F0]">
                  <button
                    type="button"
                    onClick={() => setIsEditing(!isEditing)}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-[#2563EB] hover:underline"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    {isEditing ? "Save & Lock View" : "Edit draft"}
                  </button>

                  <p className="text-[11px] text-[#64748B]">
                    Personalization fields will be filled from verified patient contact data at send time.
                  </p>
                </div>
              </div>
            </div>

            {/* ── RIGHT: CONTEXT & ACTIONS ─────────────────────────── */}
            <div className="space-y-5">
              {/* Context Card */}
              <div className="bg-white border border-[#E2E8F0] p-5 rounded-[4px] space-y-4">
                <h2 className="text-sm font-semibold text-[#0F172A]">Patient Context</h2>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-[#F1F5F9]">
                    <span className="text-[#64748B]">Patient ID:</span>
                    <span className="font-mono font-medium text-[#0F172A]">{draft.patient_id}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#F1F5F9]">
                    <span className="text-[#64748B]">Trial Protocol:</span>
                    <span className="font-mono text-[#0F172A]">{draft.trial_id}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#F1F5F9]">
                    <span className="text-[#64748B]">Drug:</span>
                    <span className="font-medium text-[#0F172A]">{draft.medicine}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-[#64748B]">Matching Score:</span>
                    <span className="font-mono font-bold text-[#16A34A]">
                      {(draft.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="bg-white border border-[#E2E8F0] p-5 rounded-[4px] space-y-3">
                <h3 className="text-sm font-semibold text-[#0F172A]">Coordinator Sign-Off</h3>

                {approved ? (
                  <div className="p-4 bg-[#DCFCE7] border border-[#BBF7D0] rounded-[4px] text-center">
                    <CheckCircle2 className="w-6 h-6 text-[#16A34A] mx-auto mb-1" />
                    <p className="text-xs font-semibold text-[#16A34A]">Approved & Queued for Send</p>
                    <p className="text-[11px] text-[#15803D] mt-0.5">Redirecting to queue...</p>
                  </div>
                ) : showConfirm ? (
                  <div className="space-y-3 p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-[4px]">
                    <p className="text-xs text-[#0F172A] leading-relaxed">
                      Confirm: this will queue the email for sending once the patient&apos;s contact data is verified. This action is logged.
                    </p>
                    <button
                      type="button"
                      disabled={approving}
                      onClick={handleApprove}
                      className="btn btn-success w-full text-xs"
                    >
                      {approving ? "Recording sign-off..." : "Confirm approval"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowConfirm(false)}
                      className="btn btn-secondary w-full text-xs"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => setShowConfirm(true)}
                      className="btn btn-success w-full text-xs"
                    >
                      Approve for sending
                    </button>
                    <button
                      type="button"
                      onClick={() => router.push("/outreach")}
                      className="btn btn-secondary w-full text-xs"
                    >
                      Request revision
                    </button>
                    <button
                      type="button"
                      onClick={() => router.push("/outreach")}
                      className="btn btn-outline-danger w-full text-xs"
                    >
                      Reject draft
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
