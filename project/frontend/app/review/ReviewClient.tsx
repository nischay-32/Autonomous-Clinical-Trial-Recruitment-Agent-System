"use client";

import { useState } from "react";
import { type ReportData } from "@/lib/api";
import { AlertCircle, CheckCircle2, XCircle, Search, ShieldAlert, ArrowRight } from "lucide-react";

interface Props {
  initialReport: ReportData | null;
}

interface ReviewItem {
  id: string;
  patient_id: string;
  trial_id: string;
  flag_reason: string;
  confidence: number;
  safety_score: number;
  date_flagged: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  reviewer_notes?: string;
}

export default function ReviewClient({ initialReport }: Props) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItem, setSelectedItem] = useState<ReviewItem | null>(null);
  const [notes, setNotes] = useState("");
  const [reviewList, setReviewList] = useState<ReviewItem[]>([
    {
      id: "REV-101",
      patient_id: "PAT-004",
      trial_id: "NCT02444845",
      flag_reason: "Borderline HbA1c (7.1% against 7.0% threshold) with concomitant Metformin therapy",
      confidence: 0.64,
      safety_score: 0.88,
      date_flagged: "2026-10-11 14:22:00",
      status: "PENDING",
    },
    {
      id: "REV-102",
      patient_id: "PAT-009",
      trial_id: "NCT03319459",
      flag_reason: "Multi-agent consensus discordance on secondary exclusion criterion",
      confidence: 0.58,
      safety_score: 0.72,
      date_flagged: "2026-10-11 15:40:12",
      status: "PENDING",
    },
    {
      id: "REV-103",
      patient_id: "PAT-015",
      trial_id: "NCT02444845",
      flag_reason: "Potential drug-drug interaction warning flagged by safety auditor",
      confidence: 0.71,
      safety_score: 0.65,
      date_flagged: "2026-10-11 16:05:45",
      status: "PENDING",
    },
  ]);

  const filtered = reviewList.filter(
    (item) =>
      item.patient_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.trial_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.flag_reason.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDecision = (decision: "APPROVED" | "REJECTED") => {
    if (!selectedItem) return;
    setReviewList((prev) =>
      prev.map((item) =>
        item.id === selectedItem.id
          ? { ...item, status: decision, reviewer_notes: notes }
          : item
      )
    );
    setSelectedItem(null);
    setNotes("");
  };

  const pendingCount = reviewList.filter((r) => r.status === "PENDING").length;
  const approvedCount = reviewList.filter((r) => r.status === "APPROVED").length;
  const rejectedCount = reviewList.filter((r) => r.status === "REJECTED").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Human-in-the-Loop Review Queue</h1>
        <p className="text-sm text-slate-500 mt-1">
          Clinical trials requiring physician investigator adjudication for borderline eligibility or compliance discrepancies.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Pending Adjudication</span>
            <AlertCircle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">{pendingCount}</div>
          <p className="text-xs text-slate-500 mt-1">Requires principal investigator review</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Clinician Approved</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">{approvedCount}</div>
          <p className="text-xs text-slate-500 mt-1">Cleared for candidate outreach</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Excluded by Clinician</span>
            <XCircle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">{rejectedCount}</div>
          <p className="text-xs text-slate-500 mt-1">Exclusion criteria reaffirmed</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Patient ID, Trial ID, or reason..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded focus:bg-white focus:outline-none focus:ring-1 focus:ring-sky-600"
            />
          </div>
          <div className="text-xs text-slate-500">
            {initialReport ? `Aggregated funnel status: ${initialReport.funnel.review_required} total reviews logged` : "Connected to audit stream"}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Case ID</th>
                <th className="py-3 px-4">Patient ID</th>
                <th className="py-3 px-4">Target Trial</th>
                <th className="py-3 px-4">Adjudication Trigger</th>
                <th className="py-3 px-4">Confidence</th>
                <th className="py-3 px-4">Safety Score</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-mono text-xs text-slate-500">{item.id}</td>
                  <td className="py-3 px-4 font-semibold text-slate-800">{item.patient_id}</td>
                  <td className="py-3 px-4 font-mono text-xs text-sky-700">{item.trial_id}</td>
                  <td className="py-3 px-4 text-xs text-slate-600 max-w-xs truncate" title={item.flag_reason}>
                    {item.flag_reason}
                  </td>
                  <td className="py-3 px-4 text-xs font-medium">
                    <span className={item.confidence < 0.65 ? "text-amber-600" : "text-slate-700"}>
                      {(item.confidence * 100).toFixed(0)}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-xs font-medium">
                    <span className={item.safety_score < 0.8 ? "text-rose-600" : "text-emerald-700"}>
                      {(item.safety_score * 100).toFixed(0)}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-xs">
                    {item.status === "PENDING" && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                        Pending
                      </span>
                    )}
                    {item.status === "APPROVED" && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Approved
                      </span>
                    )}
                    {item.status === "REJECTED" && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
                        Excluded
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => setSelectedItem(item)}
                      className="px-2.5 py-1 text-xs font-medium text-sky-700 hover:text-sky-800 hover:bg-sky-50 rounded border border-sky-200"
                    >
                      Adjudicate
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-sm text-slate-500">
                    No cases match the filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedItem && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-lg shadow-lg max-w-lg w-full p-6 space-y-4">
            <div className="flex items-start justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Adjudicate Case {selectedItem.id}</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Subject: {selectedItem.patient_id} | Trial: {selectedItem.trial_id}
                </p>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="text-slate-400 hover:text-slate-600 text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 bg-slate-50 p-3 rounded border border-slate-200 text-xs">
              <div>
                <span className="font-semibold text-slate-700">Adjudication Trigger:</span>
                <p className="text-slate-600 mt-0.5">{selectedItem.flag_reason}</p>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200">
                <div>
                  <span className="font-semibold text-slate-700">Matcher Confidence:</span>{" "}
                  {(selectedItem.confidence * 100).toFixed(0)}%
                </div>
                <div>
                  <span className="font-semibold text-slate-700">Safety Score:</span>{" "}
                  {(selectedItem.safety_score * 100).toFixed(0)}%
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Investigator Clinical Rationale & Notes
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Document clinical justification for override or exclusion confirmation..."
                className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-sky-600"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded border border-slate-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDecision("REJECTED")}
                className="px-3 py-1.5 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 rounded border border-rose-200"
              >
                Confirm Ineligible
              </button>
              <button
                type="button"
                onClick={() => handleDecision("APPROVED")}
                className="px-3 py-1.5 text-xs font-medium text-white bg-sky-700 hover:bg-sky-800 rounded"
              >
                Approve as Eligible
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
