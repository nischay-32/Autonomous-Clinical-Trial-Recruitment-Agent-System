"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import { ArrowLeft, Play, FileText, CheckCircle2 } from "lucide-react";
import { api, Trial } from "@/lib/api";



export default function TrialDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const trialId = resolvedParams.id;
  const [trial, setTrial] = useState<Trial | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await api.trial(trialId);
        setTrial(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [trialId]);

  return (
    <AppShell pageTitle={`Trial: ${trialId}`}>
      <div className="space-y-6">
        <Link
          href="/trials"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#64748B] hover:text-[#0F172A]"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to trials
        </Link>

        {loading ? (
          <div className="space-y-4">
            <div className="h-8 w-64 skeleton" />
            <div className="h-32 skeleton" />
          </div>
        ) : !trial ? (
          <div className="card text-center py-12">
            <p className="text-sm text-[#64748B]">Trial not found.</p>
          </div>
        ) : (
          <>
            {/* Header Card */}
            <div className="card flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-[4px] bg-[#1E293B] text-white">
                    {trial.id}
                  </span>
                  <span className="badge badge-success">Active Protocol</span>
                </div>
                <h1 className="text-xl font-bold text-[#0F172A] mt-2">{trial.title}</h1>
                <p className="text-xs text-[#64748B] mt-1">
                  Investigational Agent: <span className="font-medium text-[#0F172A]">{trial.medicine}</span> · Total Criteria Rules: <span className="font-mono font-medium text-[#0F172A]">{trial.total_criteria}</span>
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Link href="/patients" className="btn btn-primary text-xs">
                  <Play className="w-3.5 h-3.5" />
                  Run screening
                </Link>
              </div>
            </div>

            {/* Criteria Breakdown */}
            <div className="card space-y-4">
              <h2 className="text-base font-semibold text-[#0F172A]">Structured Protocol Criteria</h2>
              <div className="overflow-x-auto">
                <table>
                  <thead>
                    <tr>
                      <th className="w-24">Type</th>
                      <th>Rule Category</th>
                      <th>Rule Specifications</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><span className="badge badge-success">INCLUSION</span></td>
                      <td className="font-medium">Demographics</td>
                      <td>Age bracket: 18 to 75 years inclusive. Calculated at admission date.</td>
                    </tr>
                    <tr>
                      <td><span className="badge badge-success">INCLUSION</span></td>
                      <td className="font-medium">Primary Condition</td>
                      <td>Confirmed diagnosis under ICD-9 standards matching protocol medicine indications.</td>
                    </tr>
                    <tr>
                      <td><span className="badge badge-danger">EXCLUSION</span></td>
                      <td className="font-medium">Renal Function</td>
                      <td>Severe impairment: calculated eGFR &lt; 45 mL/min/1.73m2 or acute renal failure.</td>
                    </tr>
                    <tr>
                      <td><span className="badge badge-danger">EXCLUSION</span></td>
                      <td className="font-medium">Safety Contraindication</td>
                      <td>Active acute acidotic episode or documented severe hypersensitivity reaction.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
