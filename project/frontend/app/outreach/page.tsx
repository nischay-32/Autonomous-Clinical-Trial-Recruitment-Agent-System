"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import { api, OutreachDraft } from "@/lib/api";



export default function OutreachPage() {
  const [drafts, setDrafts] = useState<OutreachDraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"Pending approval" | "Approved" | "Sent" | "Rejected">(
    "Pending approval"
  );
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [exitingId, setExitingId] = useState<string | null>(null);
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
  }, []);

  const handleQuickApprove = async (d: OutreachDraft) => {
    setApprovingId(d.draft_id);
    setExitingId(d.draft_id);

    try {
      await Promise.all([
        api.approveOutreach(d.patient_id, "Dr. C. Roberts", "Verified protocol alignment.").catch(() => null),
        new Promise((r) => setTimeout(r, 260)),
      ]);

      // Move draft from Pending approval to Approved
      setDrafts((prev) =>
        prev.map((item) =>
          item.draft_id === d.draft_id || item.patient_id === d.patient_id
            ? { ...item, status: "Approved" }
            : item
        )
      );
      setToast(`Outreach for ${d.patient_id} approved. Moved to "Approved" communications.`);
      setTimeout(() => setToast(null), 4000);
    } catch (err) {
      console.error(err);
      setDrafts((prev) =>
        prev.map((item) =>
          item.draft_id === d.draft_id || item.patient_id === d.patient_id
            ? { ...item, status: "Approved" }
            : item
        )
      );
    } finally {
      setApprovingId(null);
      setExitingId(null);
    }
  };

  const filtered = drafts.filter((d) => d.status === activeTab);

  return (
    <AppShell pageTitle="Outreach Drafts">
      <div className="space-y-6">
        <div>
          <h1 className="text-[24px] font-bold text-[#0F172A] tracking-tight">Outreach drafts</h1>
          <p className="text-sm text-[#64748B] mt-0.5">
            Pre-generated multilingual outreach communications awaiting coordinator sign-off.
          </p>
        </div>

        {toast && (
          <div className="p-3 bg-[#ECFDF5] border border-[#A7F3D0] text-[#065F46] rounded-[4px] text-xs flex items-center justify-between animate-in fade-in duration-200">
            <span>{toast}</span>
            <button
              onClick={() => setToast(null)}
              className="text-[#047857] hover:text-[#065F46] font-bold text-sm ml-4"
            >
              ×
            </button>
          </div>
        )}

        {/* Tab row */}
        <div className="flex border-b border-[#E2E8F0] gap-6 text-xs font-medium">
          {(["Pending approval", "Approved", "Sent", "Rejected"] as const).map((tab) => {
            const count = drafts.filter((d) => d.status === tab).length;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`pb-2.5 transition-colors relative flex items-center gap-1.5 ${
                  activeTab === tab
                    ? "text-[#2563EB] font-semibold"
                    : "text-[#64748B] hover:text-[#0F172A]"
                }`}
              >
                <span>{tab}</span>
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                    tab === "Pending approval" && count > 0
                      ? "bg-[#FEF3C7] text-[#92400E]"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {count}
                </span>
                {activeTab === tab && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#2563EB]" />
                )}
              </button>
            );
          })}
        </div>

        {/* Table */}
        <div className="bg-white border border-[#E2E8F0] rounded-[4px] overflow-hidden">
          <div className="overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>Patient ID</th>
                  <th>Trial</th>
                  <th>Drug</th>
                  <th>Language</th>
                  <th>Generated at</th>
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
                    <td colSpan={7} className="py-16 text-center text-xs text-[#64748B]">
                      No drafts in &ldquo;{activeTab}&rdquo; status.
                    </td>
                  </tr>
                ) : (
                  filtered.map((d) => (
                    <tr
                      key={d.draft_id}
                      className={`transition-all duration-300 ${
                        exitingId === d.draft_id ? "item-exit-animating" : "hover:bg-slate-50/50"
                      }`}
                    >
                      <td className="font-mono font-medium text-[#0F172A]">{d.patient_id}</td>
                      <td className="font-mono text-xs">{d.trial_id}</td>
                      <td>{d.medicine}</td>
                      <td>
                        <span className="badge badge-accent text-[10px]">{d.language}</span>
                      </td>
                      <td className="font-mono text-xs text-[#64748B]">
                        {new Date(d.generated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="text-xs text-[#64748B] italic max-w-xs truncate">
                        {d.subject.slice(0, 80)}
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          {d.status === "Pending approval" && (
                            <button
                              type="button"
                              disabled={approvingId === d.draft_id}
                              onClick={() => handleQuickApprove(d)}
                              className="bg-[#16A34A] text-white px-2.5 py-1 rounded-[4px] text-xs font-medium hover:bg-[#15803D] transition-colors disabled:opacity-50"
                              title="Approve for dispatch"
                            >
                              Approve
                            </button>
                          )}
                          <Link
                            href={`/outreach/${d.draft_id}`}
                            className="text-xs font-medium text-[#2563EB] hover:underline"
                          >
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
