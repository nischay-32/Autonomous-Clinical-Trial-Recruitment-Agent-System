"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import { api, PatientRecord, Trial } from "@/lib/api";



export default function PatientsPage() {
  const [patients, setPatients] = useState<PatientRecord[]>([]);
  const [trials, setTrials] = useState<Trial[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTrial, setSelectedTrial] = useState("");
  const [selectedDecision, setSelectedDecision] = useState("All");
  const [minConfidence, setMinConfidence] = useState(0.5);

  useEffect(() => {
    async function loadData() {
      try {
        const [patientsData, trialsData] = await Promise.all([
          api.patients(),
          api.trials().catch(() => []),
        ]);
        setPatients(patientsData);
        setTrials(trialsData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filtered = patients.filter((p) => {
    const matchesTrial = !selectedTrial || p.trial_id === selectedTrial;
    const matchesDecision =
      selectedDecision === "All" || p.status.toUpperCase() === selectedDecision.toUpperCase();
    const matchesConf = p.confidence >= minConfidence;
    return matchesTrial && matchesDecision && matchesConf;
  });

  return (
    <AppShell pageTitle="Patients">
      <div className="space-y-5">
        <h1 className="text-[24px] font-bold text-[#0F172A] tracking-tight">Patients</h1>

        {/* Filter row */}
        <div className="bg-white border border-[#E2E8F0] p-4 rounded-[4px] flex flex-wrap items-center gap-6">
          <div className="w-56">
            <label className="block text-xs font-medium text-[#64748B] mb-1">Trial</label>
            <select
              value={selectedTrial}
              onChange={(e) => setSelectedTrial(e.target.value)}
            >
              <option value="">All Trials</option>
              {trials.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.id} — {t.medicine}
                </option>
              ))}
            </select>
          </div>

          <div className="w-48">
            <label className="block text-xs font-medium text-[#64748B] mb-1">Decision</label>
            <select
              value={selectedDecision}
              onChange={(e) => setSelectedDecision(e.target.value)}
            >
              <option value="All">All Decisions</option>
              <option value="ELIGIBLE">Eligible</option>
              <option value="REVIEW_REQUIRED">Borderline / Review</option>
              <option value="INELIGIBLE">Rejected</option>
            </select>
          </div>

          <div className="flex-1 min-w-[200px]">
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-medium text-[#64748B]">Confidence Floor</label>
              <span className="font-mono text-xs font-medium text-[#0F172A]">
                {(minConfidence * 100).toFixed(0)}%
              </span>
            </div>
            <input
              type="range"
              min="0.4"
              max="0.95"
              step="0.05"
              value={minConfidence}
              onChange={(e) => setMinConfidence(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-[#E2E8F0] rounded-[2px] accent-[#2563EB] cursor-pointer"
            />
          </div>
        </div>

        {/* Patients Table */}
        <div className="bg-white border border-[#E2E8F0] rounded-[4px] overflow-hidden">
          <div className="overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>Patient ID</th>
                  <th>Age</th>
                  <th>Gender</th>
                  <th>Trial</th>
                  <th>Overall decision</th>
                  <th>Confidence</th>
                  <th>Criteria passed</th>
                  <th>Borderline count</th>
                  <th>Reviewed at</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center">
                      <div className="h-4 w-48 skeleton mx-auto" />
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-xs text-[#64748B]">
                      No patients match current filter parameters.
                    </td>
                  </tr>
                ) : (
                  filtered.map((pt) => {
                    const confPct = Math.round(pt.confidence * 100);
                    const barColor =
                      pt.confidence >= 0.85
                        ? "bg-[#16A34A]"
                        : pt.confidence >= 0.65
                        ? "bg-[#D97706]"
                        : "bg-[#DC2626]";

                    return (
                      <tr key={pt.subject_id}>
                        <td>
                          <Link
                            href={`/patients/${pt.subject_id}`}
                            className="font-mono font-medium text-[#2563EB] hover:underline"
                          >
                            {pt.subject_id}
                          </Link>
                        </td>
                        <td className="font-mono text-xs">{pt.age}</td>
                        <td>{pt.gender}</td>
                        <td className="font-mono text-xs">{pt.trial_id}</td>
                        <td>
                          {pt.status === "ELIGIBLE" && (
                            <span className="badge badge-success">Eligible</span>
                          )}
                          {pt.status === "REVIEW_REQUIRED" && (
                            <span className="badge badge-warning">Borderline</span>
                          )}
                          {pt.status === "INELIGIBLE" && (
                            <span className="badge badge-danger">Rejected</span>
                          )}
                        </td>
                        <td>
                          <div className="w-24">
                            <span className="font-mono text-xs font-medium text-[#0F172A] block mb-1">
                              {confPct}%
                            </span>
                            <div className="h-1.5 w-full bg-[#E2E8F0] rounded-[2px] overflow-hidden">
                              <div
                                style={{ width: `${confPct}%` }}
                                className={`h-full ${barColor}`}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="font-mono text-xs">{pt.criteria_passed}</td>
                        <td className="font-mono text-xs text-[#D97706] font-medium">
                          {pt.borderline_count}
                        </td>
                        <td className="font-mono text-[11px] text-[#64748B]">
                          {new Date(pt.reviewed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
