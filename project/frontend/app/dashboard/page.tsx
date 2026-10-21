"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import { api, Trial, AuditEntry } from "@/lib/api";

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [trials, setTrials] = useState<Trial[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditEntry[]>([]);
  const [reviewCount, setReviewCount] = useState(0);
  const [outreachCount, setOutreachCount] = useState(0);

  useEffect(() => {
    async function loadData() {
      try {
        const [trialsData, auditData, reviewData, outreachData] = await Promise.all([
          api.trials().catch(() => []),
          api.audit("", 10).catch(() => []),
          api.reviewQueue().catch(() => []),
          api.outreachDrafts().catch(() => []),
        ]);
        setTrials(trialsData);
        setAuditLogs(auditData);
        setReviewCount(reviewData.length);
        setOutreachCount(outreachData.filter((d) => d.status === "Pending approval").length);
      } catch (err) {
        console.error("Dashboard data load error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const cards = [
    { label: "Active trials", value: trials.length },
    { label: "Awaiting review", value: reviewCount },
    { label: "Outreach pending", value: outreachCount },
  ];

  return (
    <AppShell pageTitle="Dashboard">
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {cards.map((card) => (
            <div key={card.label} className="card">
              <p className="text-[12px] font-semibold uppercase tracking-wide text-[#4d5663]">{card.label}</p>
              {loading ? (
                <div className="h-8 w-16 skeleton mt-3" />
              ) : (
                <p className="font-serif text-[32px] mt-2 leading-none">{card.value}</p>
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 card">
            <h2 className="font-serif text-[18px] mb-4">Screening by trial</h2>
            {loading ? (
              <div className="space-y-3">{[0, 1, 2].map((i) => <div key={i} className="h-8 skeleton" />)}</div>
            ) : trials.length === 0 ? (
              <p className="text-[13px] text-[#4d5663]">No trials loaded. Open Trials to add a protocol.</p>
            ) : (
              <div className="space-y-4">
                {trials.map((f) => {
                  const screened = f.patients_screened ?? 0;
                  const eligible = f.eligible ?? 0;
                  const pending = f.pending_review ?? 0;
                  const other = Math.max(0, screened - eligible - pending);
                  const denom = screened || 1;
                  return (
                    <div key={f.id}>
                      <div className="flex items-center justify-between text-[12px] mb-2">
                        <span className="font-semibold">{f.title || f.id}</span>
                        <span className="font-mono text-[#4d5663]">{screened} screened</span>
                      </div>
                      {screened === 0 ? (
                        <p className="text-[12px] text-[#4d5663]">No screening runs yet.</p>
                      ) : (
                        <div className="h-6 w-full flex border border-[#d5d9e0]">
                          <div style={{ width: `${(eligible / denom) * 100}%` }} className="h-full bg-[#0b5f5a]" title={`Eligible: ${eligible}`} />
                          <div style={{ width: `${(pending / denom) * 100}%` }} className="h-full bg-[#9a6700]" title={`Review: ${pending}`} />
                          <div style={{ width: `${(other / denom) * 100}%` }} className="h-full bg-[#d5d9e0]" title={`Other: ${other}`} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="lg:col-span-2 card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-serif text-[18px]">Recent events</h2>
              <Link href="/audit" className="text-[12px] font-semibold text-[#0b5f5a] hover:underline">Audit trail</Link>
            </div>
            {loading ? (
              <div className="space-y-3">{[0, 1, 2, 3].map((i) => <div key={i} className="h-6 skeleton" />)}</div>
            ) : auditLogs.length === 0 ? (
              <p className="text-[13px] text-[#4d5663]">No audit events yet.</p>
            ) : (
              <div className="space-y-2 max-h-[240px] overflow-y-auto">
                {auditLogs.slice(0, 10).map((log) => (
                  <div key={log.id} className="text-[12px] py-2 border-b border-[#d5d9e0] last:border-0">
                    <p className="truncate"><span className="font-semibold">{log.agent_name}:</span> {log.action}</p>
                    <p className="font-mono text-[11px] text-[#4d5663] mt-0.5">
                      {log.timestamp ? new Date(log.timestamp).toLocaleString() : ""} {log.patient_id}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="card p-0 overflow-hidden">
          <div className="p-4 flex items-center justify-between border-b border-[#d5d9e0]">
            <h2 className="font-serif text-[18px]">Active trials</h2>
            <Link href="/trials" className="text-[12px] font-semibold text-[#0b5f5a] hover:underline">All trials</Link>
          </div>
          <div className="overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>Trial name</th>
                  <th>NCT number</th>
                  <th>Drug</th>
                  <th>Screened</th>
                  <th>Eligible</th>
                  <th>Pending review</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={8} className="py-8 text-center"><div className="h-4 w-48 skeleton mx-auto" /></td></tr>
                ) : trials.length === 0 ? (
                  <tr><td colSpan={8} className="py-8 text-center text-[13px] text-[#4d5663]">No active trials.</td></tr>
                ) : (
                  trials.slice(0, 5).map((trial) => (
                    <tr key={trial.id}>
                      <td className="font-semibold">{trial.title}</td>
                      <td className="font-mono text-[12px]">{trial.id}</td>
                      <td>{trial.medicine}</td>
                      <td className="font-mono text-[12px]">{trial.patients_screened ?? 0}</td>
                      <td className="font-mono text-[12px]">{trial.eligible ?? 0}</td>
                      <td className="font-mono text-[12px]">{trial.pending_review ?? 0}</td>
                      <td><span className="badge badge-muted">{trial.status ?? "Unknown"}</span></td>
                      <td>
                        <Link href={`/trials/${trial.id}`} className="text-[12px] font-semibold text-[#0b5f5a] hover:underline">View</Link>
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
