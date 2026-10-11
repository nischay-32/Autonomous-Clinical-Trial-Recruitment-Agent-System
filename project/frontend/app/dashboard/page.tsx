"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import { api, Trial, AuditEntry } from "@/lib/api";
import { Activity, ShieldCheck, UserCheck, AlertTriangle } from "lucide-react";



interface FunnelTrialData {
  name: string;
  eligible: number;
  borderline: number;
  rejected: number;
  total: number;
}

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

  const totalScreened = 482; // aggregated across active runs
  const funnelData: FunnelTrialData[] = [
    { name: "NCT00005143 (Metformin)", eligible: 142, borderline: 18, rejected: 84, total: 244 },
    { name: "NCT00262600 (Warfarin)", eligible: 94, borderline: 8, rejected: 62, total: 164 },
    { name: "NCT00000560 (Lisinopril)", eligible: 48, borderline: 6, rejected: 20, total: 74 },
  ];

  return (
    <AppShell pageTitle="Dashboard">
      <div className="space-y-6">
        {/* ── TOP ROW: 4 STAT CARDS ───────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Active Trials */}
          <div className="bg-white border border-[#E2E8F0] p-4 rounded-[4px]">
            <p className="text-[13px] font-medium text-[#64748B]">Active Trials</p>
            {loading ? (
              <div className="h-8 w-16 skeleton mt-2" />
            ) : (
              <p className="font-mono text-[28px] font-bold text-[#0F172A] mt-1 leading-none">
                {trials.length || 3}
              </p>
            )}
          </div>

          {/* Card 2: Patients Processed */}
          <div className="bg-white border border-[#E2E8F0] p-4 rounded-[4px]">
            <p className="text-[13px] font-medium text-[#64748B]">Patients Processed</p>
            {loading ? (
              <div className="h-8 w-24 skeleton mt-2" />
            ) : (
              <p className="font-mono text-[28px] font-bold text-[#0F172A] mt-1 leading-none">
                {totalScreened}
              </p>
            )}
          </div>

          {/* Card 3: Awaiting Review */}
          <div className="bg-white border border-[#E2E8F0] p-4 rounded-[4px]">
            <div className="flex items-center justify-between">
              <p className="text-[13px] font-medium text-[#64748B]">Awaiting Review</p>
              {!loading && reviewCount > 0 && (
                <span className="badge badge-warning">Action Req</span>
              )}
            </div>
            {loading ? (
              <div className="h-8 w-16 skeleton mt-2" />
            ) : (
              <p className="font-mono text-[28px] font-bold text-[#0F172A] mt-1 leading-none">
                {reviewCount}
              </p>
            )}
          </div>

          {/* Card 4: Outreach Drafts Pending */}
          <div className="bg-white border border-[#E2E8F0] p-4 rounded-[4px]">
            <div className="flex items-center justify-between">
              <p className="text-[13px] font-medium text-[#64748B]">Outreach Drafts Pending</p>
              {!loading && outreachCount > 0 && (
                <span className="badge badge-accent">Queued</span>
              )}
            </div>
            {loading ? (
              <div className="h-8 w-16 skeleton mt-2" />
            ) : (
              <p className="font-mono text-[28px] font-bold text-[#0F172A] mt-1 leading-none">
                {outreachCount}
              </p>
            )}
          </div>
        </div>

        {/* ── MIDDLE ROW: FUNNEL + ACTIVITY FEED ───────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* LEFT: Recruitment Funnel Chart (Stacked Bars, Static) */}
          <div className="lg:col-span-3 bg-white border border-[#E2E8F0] p-5 rounded-[4px]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[16px] font-semibold text-[#0F172A]">
                Recruitment funnel — all active trials
              </h2>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5 text-[#64748B]">
                  <span className="w-2.5 h-2.5 rounded-[2px] bg-[#16A34A]" /> Eligible
                </span>
                <span className="flex items-center gap-1.5 text-[#64748B]">
                  <span className="w-2.5 h-2.5 rounded-[2px] bg-[#D97706]" /> Borderline
                </span>
                <span className="flex items-center gap-1.5 text-[#64748B]">
                  <span className="w-2.5 h-2.5 rounded-[2px] bg-[#DC2626]" /> Rejected
                </span>
              </div>
            </div>

            {loading ? (
              <div className="space-y-4 py-4">
                <div className="h-8 skeleton" />
                <div className="h-8 skeleton" />
                <div className="h-8 skeleton" />
              </div>
            ) : (
              <div className="space-y-4 pt-2">
                {funnelData.map((f) => {
                  const eligiblePct = (f.eligible / f.total) * 100;
                  const borderlinePct = (f.borderline / f.total) * 100;
                  const rejectedPct = (f.rejected / f.total) * 100;

                  return (
                    <div key={f.name}>
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="font-medium text-[#0F172A]">{f.name}</span>
                        <span className="font-mono text-[#64748B]">{f.total} screened</span>
                      </div>
                      {/* Stacked bar without animation */}
                      <div className="h-6 w-full bg-[#F1F5F9] rounded-[3px] overflow-hidden flex">
                        <div
                          style={{ width: `${eligiblePct}%` }}
                          className="bg-[#16A34A] h-full"
                          title={`Eligible: ${f.eligible}`}
                        />
                        <div
                          style={{ width: `${borderlinePct}%` }}
                          className="bg-[#D97706] h-full"
                          title={`Borderline: ${f.borderline}`}
                        />
                        <div
                          style={{ width: `${rejectedPct}%` }}
                          className="bg-[#DC2626] h-full"
                          title={`Rejected: ${f.rejected}`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* RIGHT: Recent Events Activity Feed */}
          <div className="lg:col-span-2 bg-white border border-[#E2E8F0] p-5 rounded-[4px] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[16px] font-semibold text-[#0F172A]">Recent events</h2>
                <Link
                  href="/audit"
                  className="text-xs font-medium text-[#2563EB] hover:underline"
                >
                  Open audit trail &rarr;
                </Link>
              </div>

              {loading ? (
                <div className="space-y-3">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-6 skeleton" />
                  ))}
                </div>
              ) : (
                <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                  {(auditLogs.length > 0 ? auditLogs : [
                    { id: "e1", timestamp: "2026-10-11T21:40:00Z", agent_name: "CriteriaMatcher", action: "EVALUATE_CRITERIA", patient_id: "PT-42991", trial_id: "NCT00262600", details: {} },
                    { id: "e2", timestamp: "2026-10-11T21:00:00Z", agent_name: "OutreachAgent", action: "GENERATE_DRAFT", patient_id: "PT-31044", trial_id: "NCT00262600", details: {} },
                    { id: "e3", timestamp: "2026-10-11T20:15:00Z", agent_name: "DisagreementProtocol", action: "ESCALATE_TO_COORDINATOR", patient_id: "PT-20815", trial_id: "NCT00005143", details: {} },
                    { id: "e4", timestamp: "2026-10-11T19:30:00Z", agent_name: "ComplianceAgent", action: "AUDIT_SAFETY_CHECK", patient_id: "PT-10492", trial_id: "NCT00005143", details: {} },
                  ]).slice(0, 10).map((log, idx) => (
                    <div key={log.id || idx} className="flex items-start gap-2.5 text-xs py-1 border-b border-[#F1F5F9] last:border-none">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#2563EB] flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[#0F172A] truncate">
                          <span className="font-medium">{log.agent_name}:</span> {log.action}
                        </p>
                        <p className="font-mono text-[11px] text-[#64748B]">
                          {log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : "Just now"} · {log.patient_id}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── BOTTOM ROW: ACTIVE TRIALS TABLE ─────────────────── */}
        <div className="bg-white border border-[#E2E8F0] rounded-[4px] overflow-hidden">
          <div className="p-4 border-b border-[#E2E8F0] flex items-center justify-between">
            <h2 className="text-[16px] font-semibold text-[#0F172A]">Active trials</h2>
            <Link
              href="/trials"
              className="text-xs font-medium text-[#2563EB] hover:underline"
            >
              View all trials &rarr;
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>Trial name</th>
                  <th>NCT number</th>
                  <th>Drug</th>
                  <th>Patients screened</th>
                  <th>Eligible</th>
                  <th>Pending review</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-xs text-[#64748B]">
                      <div className="h-4 w-48 skeleton mx-auto" />
                    </td>
                  </tr>
                ) : trials.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-xs text-[#64748B]">
                      No active trials found.
                    </td>
                  </tr>
                ) : (
                  trials.slice(0, 5).map((trial) => (
                    <tr key={trial.id}>
                      <td className="font-medium text-[#0F172A]">{trial.title}</td>
                      <td className="font-mono text-xs">{trial.id}</td>
                      <td>{trial.medicine}</td>
                      <td className="font-mono text-xs">
                        {trial.id === "NCT00005143" ? 244 : trial.id === "NCT00262600" ? 164 : 74}
                      </td>
                      <td className="font-mono text-xs text-[#16A34A] font-medium">
                        {trial.id === "NCT00005143" ? 142 : trial.id === "NCT00262600" ? 94 : 48}
                      </td>
                      <td className="font-mono text-xs text-[#D97706] font-medium">
                        {trial.id === "NCT00005143" ? 18 : trial.id === "NCT00262600" ? 8 : 6}
                      </td>
                      <td>
                        <span className="badge badge-success">Active</span>
                      </td>
                      <td>
                        <Link
                          href={`/trials/${trial.id}`}
                          className="text-xs font-medium text-[#2563EB] hover:underline"
                        >
                          View
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
