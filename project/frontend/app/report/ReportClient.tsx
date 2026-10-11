"use client";

import { useState } from "react";
import { api, type ReportData } from "@/lib/api";
import { BarChart2, RefreshCw, Download, FileText, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface Props {
  initialReport: ReportData | null;
}

const MOCK_REPORT: ReportData = {
  report_id: "RPT-20261011-001",
  generated_at: new Date().toISOString(),
  trial_id: "NCT02444845",
  funnel: {
    screened: 34,
    eligible: 21,
    ineligible: 10,
    review_required: 3,
    outreach_drafted: 18,
    eligibility_rate: 0.617,
  },
  shap_summary: [
    { feature: "hba1c", mean_abs_shap: 0.38, direction: "positive" },
    { feature: "age", mean_abs_shap: 0.24, direction: "positive" },
    { feature: "medications_count", mean_abs_shap: 0.19, direction: "negative" },
    { feature: "gender", mean_abs_shap: 0.11, direction: "neutral" },
    { feature: "diagnoses_count", mean_abs_shap: 0.08, direction: "negative" },
  ],
  audit_entries: [],
  total_audit_events: 128,
};

interface ShapItem {
  feature: string;
  mean_abs_shap: number;
  direction: string;
}

export default function ReportClient({ initialReport }: Props) {
  const [report, setReport] = useState<ReportData | null>(initialReport);
  const [loading, setLoading] = useState(false);
  const [selectedTrial, setSelectedTrial] = useState("");

  const data = report ?? MOCK_REPORT;
  const shap = (data.shap_summary as ShapItem[]) ?? [];
  const maxShap = Math.max(...shap.map((s) => s.mean_abs_shap), 0.01);

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const fresh = await api.report(selectedTrial);
      setReport(fresh);
    } catch {
      // Keep current state
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `trial_report_${data.trial_id}_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const { funnel } = data;
  const pct = (n: number) =>
    funnel.screened ? ((n / funnel.screened) * 100).toFixed(1) + "%" : "—";

  const FUNNEL_STEPS = [
    { label: "Screened", value: funnel.screened, bg: "bg-slate-700" },
    { label: "Eligible", value: funnel.eligible, bg: "bg-emerald-600" },
    { label: "Ineligible", value: funnel.ineligible, bg: "bg-rose-500" },
    { label: "Review Required", value: funnel.review_required, bg: "bg-amber-500" },
    { label: "Outreach Drafted", value: funnel.outreach_drafted, bg: "bg-sky-600" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Trial Analytics Report</h1>
          <p className="text-sm text-slate-500 mt-1">
            Funnel metrics, SHAP feature importance, and aggregate outcomes for the selected protocol.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded"
          >
            <Download className="w-3.5 h-3.5" />
            Export JSON
          </button>
        </div>
      </div>

      {/* Report metadata */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex flex-wrap gap-4 text-xs">
        <div>
          <span className="font-semibold text-slate-600">Report ID:</span>{" "}
          <span className="font-mono text-slate-700">{data.report_id}</span>
        </div>
        <div>
          <span className="font-semibold text-slate-600">Trial Protocol:</span>{" "}
          <span className="font-mono text-sky-700">{data.trial_id || "All Trials"}</span>
        </div>
        <div>
          <span className="font-semibold text-slate-600">Generated:</span>{" "}
          <span className="text-slate-700">
            {new Date(data.generated_at).toLocaleString("en-GB", { hour12: false })}
          </span>
        </div>
        <div>
          <span className="font-semibold text-slate-600">Total Audit Events:</span>{" "}
          <span className="text-slate-700">{data.total_audit_events}</span>
        </div>
        {!initialReport && (
          <div className="ml-auto text-amber-600 font-medium">
            Displaying sample data — backend offline
          </div>
        )}
      </div>

      {/* KPI summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Screened", value: funnel.screened, sub: "Unique candidates evaluated" },
          { label: "Eligibility Rate", value: (funnel.eligibility_rate * 100).toFixed(1) + "%", sub: "Of all screened patients" },
          { label: "Pending Review", value: funnel.review_required, sub: "Require physician adjudication" },
          { label: "Outreach Drafted", value: funnel.outreach_drafted, sub: "Ready for coordinator sign-off" },
        ].map(({ label, value, sub }) => (
          <div key={label} className="bg-white border border-slate-200 rounded-lg p-4">
            <div className="text-xs font-semibold text-slate-500 uppercase">{label}</div>
            <div className="text-2xl font-bold text-slate-900 mt-2">{value}</div>
            <p className="text-xs text-slate-400 mt-1">{sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Screening Funnel */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <BarChart2 className="w-4 h-4 text-slate-400" />
            <h2 className="text-sm font-semibold text-slate-800">Screening Funnel</h2>
          </div>
          <div className="space-y-3">
            {FUNNEL_STEPS.map(({ label, value, bg }) => {
              const width = funnel.screened ? (value / funnel.screened) * 100 : 0;
              return (
                <div key={label}>
                  <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                    <span>{label}</span>
                    <span className="text-slate-500">
                      {value} ({pct(value)})
                    </span>
                  </div>
                  <div className="h-5 bg-slate-100 rounded overflow-hidden">
                    <div
                      className={`h-full ${bg} transition-all duration-500`}
                      style={{ width: `${width}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* SHAP Feature Importance */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <FileText className="w-4 h-4 text-slate-400" />
            <h2 className="text-sm font-semibold text-slate-800">
              SHAP Feature Importance
            </h2>
            <span className="ml-auto text-xs text-slate-400">Mean |SHAP value| across eligible cohort</span>
          </div>

          {shap.length === 0 ? (
            <p className="text-sm text-slate-500 py-6 text-center">No SHAP data available for this report.</p>
          ) : (
            <div className="space-y-3">
              {shap.map((item) => {
                const width = (item.mean_abs_shap / maxShap) * 100;
                const DirIcon =
                  item.direction === "positive"
                    ? TrendingUp
                    : item.direction === "negative"
                    ? TrendingDown
                    : Minus;
                const dirColor =
                  item.direction === "positive"
                    ? "text-emerald-600"
                    : item.direction === "negative"
                    ? "text-rose-600"
                    : "text-slate-400";
                return (
                  <div key={item.feature}>
                    <div className="flex justify-between items-center text-xs text-slate-700 mb-1">
                      <div className="flex items-center gap-1">
                        <DirIcon className={`w-3 h-3 ${dirColor}`} />
                        <span className="font-mono font-medium">{item.feature}</span>
                      </div>
                      <span className="text-slate-500 font-mono">
                        {item.mean_abs_shap.toFixed(3)}
                      </span>
                    </div>
                    <div className="h-4 bg-slate-100 rounded overflow-hidden">
                      <div
                        className="h-full bg-sky-600 transition-all duration-500"
                        style={{ width: `${width}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
