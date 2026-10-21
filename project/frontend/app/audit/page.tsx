"use client";

import { useEffect, useState, Fragment } from "react";
import AppShell from "@/components/AppShell";
import { api, AuditEntry } from "@/lib/api";
import { ChevronDown, ChevronRight, Download } from "lucide-react";

export default function AuditTrailPage() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [patientFilter, setPatientFilter] = useState("");
  const [agentFilter, setAgentFilter] = useState("All");
  const [hipaaOnly, setHipaaOnly] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    async function loadAudit() {
      try {
        const data = await api.audit("", 100);
        setEntries(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadAudit();
  }, []);

  const filtered = entries.filter((e) => {
    const matchesPt = !patientFilter || e.patient_id.toLowerCase().includes(patientFilter.toLowerCase());
    const matchesAgent = agentFilter === "All" || e.agent_name === agentFilter;
    const matchesHipaa = !hipaaOnly || !!e.hipaa_flag;
    return matchesPt && matchesAgent && matchesHipaa;
  });

  const handleExportCSV = () => {
    const header = "Timestamp,Agent,PatientID,TrialID,Action,HIPAA\n";
    const rows = filtered
      .map(
        (e) =>
          `"${e.timestamp}","${e.agent_name}","${e.patient_id}","${e.trial_id}","${e.action}","${
            e.hipaa_flag ? "YES" : "NO"
          }"`
      )
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `trialscreen_audit_trail_${Date.now()}.csv`;
    a.click();
  };

  return (
    <AppShell pageTitle="Audit Trail">
      <div className="space-y-6">
        <p className="text-[13px] text-[#4d5663]">
          Append-only log of screening decisions, approvals, and data access events.
        </p>

        <div className="card flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4 flex-1">
            <input
              type="text"
              placeholder="Filter by patient ID"
              value={patientFilter}
              onChange={(e) => setPatientFilter(e.target.value)}
              className="max-w-[180px] font-mono text-[12px]"
            />
            <select
              value={agentFilter}
              onChange={(e) => setAgentFilter(e.target.value)}
              className="w-44 text-[12px]"
            >
              <option value="All">All agents</option>
              <option value="Orchestrator">Orchestrator</option>
              <option value="RecordReader">Record Reader</option>
              <option value="CriteriaMatcher">Criteria Matcher</option>
              <option value="ComplianceAgent">Compliance</option>
              <option value="OutreachAgent">Outreach</option>
              <option value="Coordinator">Coordinator</option>
            </select>
            <label className="flex items-center gap-2 text-[12px]">
              <input
                type="checkbox"
                checked={hipaaOnly}
                onChange={(e) => setHipaaOnly(e.target.checked)}
                className="w-4 h-4"
              />
              HIPAA events only
            </label>
          </div>
          <button type="button" onClick={handleExportCSV} className="btn btn-secondary text-[12px]">
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
        </div>

        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th className="w-44">Timestamp</th>
                  <th className="w-36">Agent / User</th>
                  <th className="w-28">Patient ID</th>
                  <th className="w-28">Trial</th>
                  <th>Action</th>
                  <th className="w-20 text-center">HIPAA</th>
                  <th className="w-16">Details</th>
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
                      No audit events match the current filters.
                    </td>
                  </tr>
                ) : (
                  filtered.map((e) => (
                    <Fragment key={e.id}>
                      <tr>
                        <td className="font-mono text-[12px] text-[#4d5663]">
                          {e.timestamp
                            ? new Date(e.timestamp).toISOString().replace("T", " ").slice(0, 19)
                            : "-"}
                        </td>
                        <td>
                          {e.agent_name === "Coordinator" ? (
                            <span className="badge badge-muted">{e.agent_name}</span>
                          ) : (
                            <span className="badge badge-muted">{e.agent_name}</span>
                          )}
                        </td>
                        <td className="font-mono text-[12px] font-semibold">{e.patient_id}</td>
                        <td className="font-mono text-[12px] text-[#4d5663]">{e.trial_id}</td>
                        <td className="text-[12px] font-medium">{e.action}</td>
                        <td className="text-center text-[12px] font-semibold">
                          {e.hipaa_flag ? (
                            <span className="text-[#b42318]">Yes</span>
                          ) : (
                            <span className="text-[#4d5663]">No</span>
                          )}
                        </td>
                        <td>
                          <button
                            type="button"
                            onClick={() => setExpandedId(expandedId === e.id ? null : e.id)}
                            className="text-[#4d5663] hover:text-[#1a2332] p-1"
                            aria-label="Toggle details"
                          >
                            {expandedId === e.id ? (
                              <ChevronDown className="w-4 h-4" />
                            ) : (
                              <ChevronRight className="w-4 h-4" />
                            )}
                          </button>
                        </td>
                      </tr>
                      {expandedId === e.id && (
                        <tr>
                          <td colSpan={7} className="p-4 bg-[#f4f5f7] border-b border-[#d5d9e0]">
                            <pre className="font-mono text-[12px] bg-white border border-[#d5d9e0] p-3 overflow-x-auto">
                              {JSON.stringify(e.details || {}, null, 2)}
                            </pre>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-[#d5d9e0] text-[12px] text-[#4d5663]">
            Showing {filtered.length} of {entries.length} entries
          </div>
        </div>
      </div>
    </AppShell>
  );
}
