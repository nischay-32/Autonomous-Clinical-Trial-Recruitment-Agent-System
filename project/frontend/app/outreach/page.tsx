"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import { api, getStoredUser, OutreachDraft } from "@/lib/api";

export default function OutreachPage() {
  const [drafts, setDrafts] = useState<OutreachDraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"Pending approval" | "Approved" | "Sent" | "Rejected">(
    "Pending approval"
  );
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    async function loadDrafts() {
      try {
        const data = await api.outreachDrafts();
        setDrafts(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadDrafts();

    // Auto-refresh periodically so approved drafts automatically move to "Sent"
    const interval = setInterval(() => {
      api.outreachDrafts().then((data) => setDrafts(data)).catch(() => {});
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const handleQuickApprove = async (d: OutreachDraft) => {
    setProcessingId(d.draft_id);
    try {
      await api.approveOutreach(
        d.patient_id,
        getStoredUser()?.full_name || "Coordinator",
        "Verified protocol alignment."
      );
      setDrafts((prev) =>
        prev.map((item) =>
          item.draft_id === d.draft_id || item.patient_id === d.patient_id
            ? { ...item, status: "Approved" }
            : item
        )
      );
      setToast(`Outreach for ${d.patient_id} approved.`);
      setTimeout(() => setToast(null), 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setProcessingId(null);
    }
  };

  const handleQuickReject = async (d: OutreachDraft) => {
    setProcessingId(d.draft_id);
    try {
      await api.rejectOutreach(
        d.patient_id,
        getStoredUser()?.full_name || "Coordinator",
        "Clinical draft rejected by coordinator."
      );
      setDrafts((prev) =>
        prev.map((item) =>
          item.draft_id === d.draft_id || item.patient_id === d.patient_id
            ? { ...item, status: "Rejected" }
            : item
        )
      );
      setToast(`Outreach for ${d.patient_id} rejected.`);
      setTimeout(() => setToast(null), 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setProcessingId(null);
    }
  };

  const filtered = drafts.filter((d) => d.status === activeTab);

  return (
    <AppShell pageTitle="Outreach Drafts">
      <div className="space-y-6">
        <p className="text-[13px] text-[#4d5663]">
          Multilingual invitation letters. Nothing is sent until a coordinator approves.
        </p>

        {toast && (
          <div className="p-3 border border-[#b7e0c2] bg-[#e6f4ea] text-[#0f5c2e] text-[12px] flex items-center justify-between">
            <span>{toast}</span>
            <button type="button" onClick={() => setToast(null)} className="font-semibold ml-4" aria-label="Dismiss">
              x
            </button>
          </div>
        )}

        <div className="flex border-b border-[#d5d9e0] gap-6 text-[13px] font-semibold overflow-x-auto">
          {(["Pending approval", "Approved", "Sent", "Rejected"] as const).map((tab) => {
            const count = drafts.filter((d) => d.status === tab).length;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`pb-2.5 relative whitespace-nowrap ${
                  activeTab === tab ? "text-[#0b5f5a]" : "text-[#4d5663] hover:text-[#1a2332]"
                }`}
              >
                {tab} ({count})
                {activeTab === tab && <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#0b5f5a]" />}
              </button>
            );
          })}
        </div>

        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>Patient ID</th>
                  <th>Trial</th>
                  <th>Drug</th>
                  <th>Language</th>
                  <th>Generated</th>
                  <th>Preview</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center">
                      <div className="h-4 w-48 skeleton mx-auto" />
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-[13px] text-[#4d5663]">
                      No drafts with status &ldquo;{activeTab}&rdquo;.
                    </td>
                  </tr>
                ) : (
                  filtered.map((d) => (
                    <tr key={d.draft_id}>
                      <td className="font-mono font-semibold">{d.patient_id}</td>
                      <td className="font-mono text-[12px]">{d.trial_id}</td>
                      <td>{d.medicine}</td>
                      <td>
                        <span className="badge badge-teal">{d.language}</span>
                      </td>
                      <td className="font-mono text-[12px] text-[#4d5663]">
                        {new Date(d.generated_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </td>
                      <td className="text-[12px] text-[#4d5663] max-w-xs truncate">{d.subject.slice(0, 80)}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          {d.status === "Pending approval" && (
                            <>
                              <button
                                type="button"
                                disabled={processingId === d.draft_id}
                                onClick={() => handleQuickApprove(d)}
                                className="btn btn-primary text-[12px] min-h-8 py-1"
                              >
                                Approve
                              </button>
                              <button
                                type="button"
                                disabled={processingId === d.draft_id}
                                onClick={() => handleQuickReject(d)}
                                className="btn btn-danger text-[12px] min-h-8 py-1"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          <Link href={`/outreach/${d.draft_id}`} className="text-[12px] font-semibold text-[#0b5f5a] hover:underline">
                            Review
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
