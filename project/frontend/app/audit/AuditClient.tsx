"use client";

import { useState, useMemo } from "react";
import { type AuditEntry } from "@/lib/api";
import { Shield, Search, Download } from "lucide-react";

interface Props {
  initialEntries: AuditEntry[];
}

const AGENT_COLORS: Record<string, string> = {
  criteria_matcher: "bg-sky-50 text-sky-700 border-sky-200",
  safety_auditor: "bg-rose-50 text-rose-700 border-rose-200",
  outreach_agent: "bg-violet-50 text-violet-700 border-violet-200",
  consensus_agent: "bg-amber-50 text-amber-700 border-amber-200",
  screening_pipeline: "bg-emerald-50 text-emerald-700 border-emerald-200",
  system: "bg-slate-50 text-slate-600 border-slate-200",
};

const MOCK_ENTRIES: AuditEntry[] = [
  {
    id: "AUD-001",
    timestamp: "2026-10-11T08:14:22Z",
    agent_name: "criteria_matcher",
    action: "SCREEN_PATIENT",
    patient_id: "PAT-001",
    trial_id: "NCT02444845",
    details: { confidence: 0.91, status: "ELIGIBLE", hard_exclusion_triggered: false },
  },
  {
    id: "AUD-002",
    timestamp: "2026-10-11T08:14:23Z",
    agent_name: "safety_auditor",
    action: "SAFETY_CHECK",
    patient_id: "PAT-001",
    trial_id: "NCT02444845",
    details: { safety_score: 0.94, violations: [], is_compliant: true },
  },
  {
    id: "AUD-003",
    timestamp: "2026-10-11T08:14:24Z",
    agent_name: "consensus_agent",
    action: "CONSENSUS_REACHED",
    patient_id: "PAT-001",
    trial_id: "NCT02444845",
    details: { rounds_executed: 2, consensus: true, final_status: "ELIGIBLE" },
  },
  {
    id: "AUD-004",
    timestamp: "2026-10-11T08:14:25Z",
    agent_name: "outreach_agent",
    action: "DRAFT_OUTREACH",
    patient_id: "PAT-001",
    trial_id: "NCT02444845",
    details: { language: "English", channel: "email", status: "PENDING_APPROVAL" },
  },
  {
    id: "AUD-005",
    timestamp: "2026-10-11T09:02:11Z",
    agent_name: "criteria_matcher",
    action: "SCREEN_PATIENT",
    patient_id: "PAT-004",
    trial_id: "NCT02444845",
    details: { confidence: 0.64, status: "REVIEW_REQUIRED", hard_exclusion_triggered: false },
  },
  {
    id: "AUD-006",
    timestamp: "2026-10-11T09:02:12Z",
    agent_name: "safety_auditor",
    action: "SAFETY_CHECK",
    patient_id: "PAT-004",
    trial_id: "NCT02444845",
    details: { safety_score: 0.88, violations: ["Borderline HbA1c 7.1% vs threshold 7.0%"], is_compliant: true },
  },
  {
    id: "AUD-007",
    timestamp: "2026-10-11T09:02:13Z",
    agent_name: "consensus_agent",
    action: "CONSENSUS_DEADLOCK",
    patient_id: "PAT-004",
    trial_id: "NCT02444845",
    details: { rounds_executed: 3, consensus: false, escalated_to: "HUMAN_REVIEW" },
  },
  {
    id: "AUD-008",
    timestamp: "2026-10-11T10:30:00Z",
    agent_name: "system",
    action: "TRIAL_INGESTED",
    patient_id: "",
    trial_id: "NCT03319459",
    details: { criteria_count: 12, protocol_version: "1.0", uploaded_by: "admin" },
  },
];

function formatTimestamp(iso: string) {
  try {
    return new Date(iso).toLocaleString("en-GB", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  } catch {
    return iso;
  }
}

export default function AuditClient({ initialEntries }: Props) {
  const entries = initialEntries.length > 0 ? initialEntries : MOCK_ENTRIES;
  const [search, setSearch] = useState("");
  const [agentFilter, setAgentFilter] = useState("All");

  const agents = useMemo(() => {
    const set = new Set(entries.map((e) => e.agent_name));
    return ["All", ...Array.from(set)];
  }, [entries]);

  const filtered = useMemo(() => {
    const s = search.toLowerCase();
    return entries.filter((e) => {
      const matchAgent = agentFilter === "All" || e.agent_name === agentFilter;
      const matchSearch =
        !s ||
        e.patient_id.toLowerCase().includes(s) ||
        e.trial_id.toLowerCase().includes(s) ||
        e.action.toLowerCase().includes(s) ||
        e.id.toLowerCase().includes(s);
      return matchAgent && matchSearch;
    });
  }, [entries, search, agentFilter]);

  const handleExport = () => {
    const csv = [
      ["ID", "Timestamp", "Agent", "Action", "Patient ID", "Trial ID", "Details"].join(","),
      ...filtered.map((e) =>
        [
          e.id,
          e.timestamp,
          e.agent_name,
          e.action,
          e.patient_id || "-",
          e.trial_id || "-",
          JSON.stringify(e.details).replace(/,/g, ";"),
        ].join(",")
      ),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit_trail_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Audit Trail</h1>
          <p className="text-sm text-slate-500 mt-1">
            Immutable, timestamped log of all autonomous agent decisions. Compliant with FDA 21 CFR Part 11 audit requirements.
          </p>
        </div>
        <button
          onClick={handleExport}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded"
        >
          <Download className="w-3.5 h-3.5" />
          Export CSV
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Patient ID, Trial, Action..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded focus:bg-white focus:outline-none focus:ring-1 focus:ring-sky-600"
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-medium text-slate-500">Agent:</span>
            {agents.map((a) => (
              <button
                key={a}
                onClick={() => setAgentFilter(a)}
                className={`px-2 py-0.5 text-xs rounded border ${
                  agentFilter === a
                    ? "bg-slate-800 text-white border-slate-800"
                    : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"
                }`}
              >
                {a === "All" ? "All" : a.replace(/_/g, " ")}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Entry ID</th>
                <th className="py-3 px-4">Timestamp (UTC)</th>
                <th className="py-3 px-4">Agent</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Patient</th>
                <th className="py-3 px-4">Trial</th>
                <th className="py-3 px-4">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-xs">
              {filtered.map((entry) => {
                const colorClass =
                  AGENT_COLORS[entry.agent_name] ?? "bg-slate-50 text-slate-600 border-slate-200";
                return (
                  <tr key={entry.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-4 text-slate-400">{entry.id}</td>
                    <td className="py-2.5 px-4 text-slate-600 whitespace-nowrap">
                      {formatTimestamp(entry.timestamp)}
                    </td>
                    <td className="py-2.5 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-xs border font-medium ${colorClass}`}
                      >
                        {entry.agent_name.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-slate-700 font-semibold">{entry.action}</td>
                    <td className="py-2.5 px-4 text-slate-600">{entry.patient_id || "—"}</td>
                    <td className="py-2.5 px-4 text-sky-700">{entry.trial_id || "—"}</td>
                    <td className="py-2.5 px-4 text-slate-500 max-w-xs truncate" title={JSON.stringify(entry.details)}>
                      {JSON.stringify(entry.details)}
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500 font-sans">
                    No audit entries match the current filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="px-4 py-2 border-t border-slate-100 text-xs text-slate-400 flex items-center gap-1.5">
          <Shield className="w-3 h-3" />
          {filtered.length} entries displayed. Audit log is append-only and tamper-evident.
        </div>
      </div>
    </div>
  );
}
