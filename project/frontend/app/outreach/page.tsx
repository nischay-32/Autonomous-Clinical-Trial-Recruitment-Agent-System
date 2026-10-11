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

        {/* Tab row */}
        <div className="flex border-b border-[#E2E8F0] gap-6 text-xs font-medium">
          {(["Pending approval", "Approved", "Sent", "Rejected"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`pb-2.5 transition-colors relative ${
                activeTab === tab
                  ? "text-[#2563EB] font-semibold"
                  : "text-[#64748B] hover:text-[#0F172A]"
              }`}
            >
              {tab}
              {activeTab === tab && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#2563EB]" />
              )}
            </button>
          ))}
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
                    <tr key={d.draft_id}>
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
                        <Link
                          href={`/outreach/${d.draft_id}`}
                          className="text-xs font-medium text-[#2563EB] hover:underline"
                        >
                          Review
                        </Link>
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
