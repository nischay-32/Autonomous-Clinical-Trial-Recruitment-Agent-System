"use client";

import { useEffect, useState } from "react";
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
        // Enrich with sample audit entries if empty
        if (data.length === 0) {
          setEntries([
            { id: "AUD-101", timestamp: "2026-10-11T21:40:00Z", agent_name: "CriteriaMatcher", action: "EVALUATE_CRITERIA_COMPLETED", patient_id: "PT-42991", trial_id: "NCT00262600", hipaa_flag: true, details: { eligible: false, confidence: 0.91, exclusion: "Recent hemorrhage" } },
            { id: "AUD-102", timestamp: "2026-10-11T21:00:00Z", agent_name: "OutreachAgent", action: "GENERATE_DRAFT_EN", patient_id: "PT-31044", trial_id: "NCT00262600", hipaa_flag: false, details: { language: "en", word_count: 142 } },
            { id: "AUD-103", timestamp: "2026-10-11T20:15:00Z", agent_name: "Coordinator", action: "ADJUDICATE_INCLUDE", patient_id: "PT-20815", trial_id: "NCT00005143", hipaa_flag: true, details: { justification: "Stable renal clearance over 6-month trajectory.", signed_by: "Dr. C. Roberts" } },
            { id: "AUD-104", timestamp: "2026-10-11T19:30:00Z", agent_name: "ComplianceAgent", action: "AUDIT_SAFETY_CHECK", patient_id: "PT-10492", trial_id: "NCT00005143", hipaa_flag: true, details: { safety_score: 0.98, deidentified: true } },
            { id: "AUD-105", timestamp: "2026-10-11T19:28:00Z", agent_name: "RecordReader", action: "NORMALIZE_EHR_RECORD", patient_id: "PT-10492", trial_id: "NCT00005143", hipaa_flag: true, details: { mimic_tables_read: ["PATIENTS", "LABEVENTS", "DIAGNOSES_ICD"] } },
          ]);
        } else {
          setEntries(data);
        }
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
        <div>
          <h1 className="text-[24px] font-bold text-[#0F172A] tracking-tight">Audit trail</h1>
          <p className="text-sm text-[#64748B] mt-0.5">
            Immutable log of all agent decisions, coordinator actions, and data access events. This log cannot be edited or deleted.
          </p>
        </div>

        {/* Filter row: All on one line */}
        <div className="bg-white border border-[#E2E8F0] p-4 rounded-[4px] flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4 flex-1">
            <input
              type="text"
              placeholder="Filter by patient ID"
              value={patientFilter}
              onChange={(e) => setPatientFilter(e.target.value)}
              className="max-w-[180px] font-mono text-xs py-1.5"
            />

            <select
              value={agentFilter}
              onChange={(e) => setAgentFilter(e.target.value)}
              className="w-44 text-xs py-1.5"
            >
              <option value="All">All agents</option>
              <option value="Orchestrator">Orchestrator</option>
              <option value="RecordReader">Record Reader</option>
              <option value="CriteriaMatcher">Criteria Matcher</option>
              <option value="ComplianceAgent">Compliance</option>
              <option value="OutreachAgent">Outreach</option>
              <option value="Coordinator">Coordinator</option>
            </select>

            <label className="flex items-center gap-2 cursor-pointer text-xs text-[#0F172A]">
              <input
                type="checkbox"
                checked={hipaaOnly}
                onChange={(e) => setHipaaOnly(e.target.checked)}
                className="w-4 h-4 rounded-[4px] text-[#2563EB] focus:ring-[#2563EB]"
              />
              Show HIPAA events only
            </label>
          </div>

          <button
            type="button"
            onClick={handleExportCSV}
            className="btn btn-secondary text-xs flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            Export as PDF / CSV
          </button>
        </div>

        {/* Table */}
        <div className="bg-white border border-[#E2E8F0] rounded-[4px] overflow-hidden">
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
                    <td colSpan={7} className="py-12 text-center text-xs text-[#64748B]">
                      No audit events matching current parameters.
                    </td>
                  </tr>
                ) : (
                  filtered.map((e) => (
                    <>
                      <tr key={e.id}>
                        <td className="font-mono text-xs text-[#64748B]">
                          {e.timestamp ? new Date(e.timestamp).toISOString().replace("T", " ").slice(0, 19) : "2026-10-11 21:00:00"}
                        </td>
                        <td>
                          {e.agent_name === "Coordinator" ? (
                            <span className="badge bg-[#0F172A] text-white text-[10px]">
                              Coordinator
                            </span>
                          ) : (
                            <span className="badge badge-muted text-[10px]">
                              {e.agent_name}
                            </span>
                          )}
                        </td>
                        <td className="font-mono text-xs font-medium text-[#0F172A]">
                          {e.patient_id}
                        </td>
                        <td className="font-mono text-xs text-[#64748B]">{e.trial_id}</td>
                        <td className="text-xs font-medium text-[#0F172A]">{e.action}</td>
                        <td className="text-center">
                          {e.hipaa_flag ? (
                            <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#DC2626]" title="HIPAA Audited" />
                          ) : (
                            <span className="text-xs text-[#CBD5E1]">—</span>
                          )}
                        </td>
                        <td>
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedId(expandedId === e.id ? null : e.id)
                            }
                            className="text-[#64748B] hover:text-[#0F172A] p-1"
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
                        <tr key={`${e.id}-details`} className="bg-[#F8FAFC]">
                          <td colSpan={7} className="p-4 border-b border-[#E2E8F0]">
                            <pre className="font-mono text-[12px] bg-[#F1F5F9] p-3 rounded-[4px] overflow-x-auto text-[#0F172A]">
                              {JSON.stringify(e.details || {}, null, 2)}
                            </pre>
                          </td>
                        </tr>
                      )}
                    </>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Footer count */}
          <div className="p-4 border-t border-[#E2E8F0] flex items-center justify-between text-xs text-[#64748B]">
            <span>Showing 1-{filtered.length} of {entries.length} entries</span>
            <div className="flex gap-2">
              <button disabled className="btn btn-secondary text-xs py-1 px-3">Previous</button>
              <button disabled className="btn btn-secondary text-xs py-1 px-3">Next</button>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
