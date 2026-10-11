"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import { api, Trial } from "@/lib/api";
import { Search } from "lucide-react";



export default function TrialsPage() {
  const [trials, setTrials] = useState<Trial[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [drugFilter, setDrugFilter] = useState("All");

  useEffect(() => {
    async function loadTrials() {
      try {
        const data = await api.trials();
        setTrials(data);
      } catch (err) {
        console.error("Failed to load trials:", err);
      } finally {
        setLoading(false);
      }
    }
    loadTrials();
  }, []);

  const drugs = Array.from(new Set(trials.map((t) => t.medicine))).filter(Boolean);

  const filtered = trials.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.id.toLowerCase().includes(search.toLowerCase()) ||
      t.medicine.toLowerCase().includes(search.toLowerCase());
    const matchesDrug = drugFilter === "All" || t.medicine === drugFilter;
    return matchesSearch && matchesDrug;
  });

  return (
    <AppShell pageTitle="Trials">
      <div className="space-y-5">
        {/* Header row */}
        <div className="flex items-center justify-between">
          <h1 className="text-[24px] font-bold text-[#0F172A] tracking-tight">Trials</h1>
          <Link
            href="/trials/new"
            className="bg-[#2563EB] text-white px-4 py-2 rounded-[4px] text-sm font-medium hover:bg-[#1D4ED8] transition-colors"
          >
            Create trial
          </Link>
        </div>

        {/* Search input */}
        <div className="relative">
          <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-2.5" />
          <input
            type="text"
            className="pl-9"
            placeholder="Search by trial name, NCT number, or drug name"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Filter row */}
        <div className="flex gap-4">
          <div className="w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">Status: All</option>
              <option value="Active">Active</option>
              <option value="Complete">Complete</option>
              <option value="Paused">Paused</option>
            </select>
          </div>

          <div className="w-48">
            <select
              value={drugFilter}
              onChange={(e) => setDrugFilter(e.target.value)}
            >
              <option value="All">Drug: All</option>
              {drugs.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border border-[#E2E8F0] rounded-[4px] overflow-hidden">
          <div className="overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>Trial name</th>
                  <th>Drug</th>
                  <th>NCT number</th>
                  <th>Phase</th>
                  <th>Patients</th>
                  <th>Eligible</th>
                  <th>Borderline</th>
                  <th>Created</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={10} className="py-12 text-center">
                      <div className="h-4 w-48 skeleton mx-auto" />
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-16 text-center">
                      <p className="text-sm text-[#64748B]">
                        No trials yet. Create your first trial to begin screening.
                      </p>
                      <Link
                        href="/trials/new"
                        className="btn btn-primary mt-3 text-xs inline-block"
                      >
                        Create trial
                      </Link>
                    </td>
                  </tr>
                ) : (
                  filtered.map((trial) => (
                    <tr key={trial.id}>
                      <td className="font-medium text-[#0F172A]">{trial.title}</td>
                      <td>{trial.medicine}</td>
                      <td className="font-mono text-xs">{trial.id}</td>
                      <td>Phase III</td>
                      <td className="font-mono text-xs">
                        {trial.id === "NCT00005143" ? 244 : trial.id === "NCT00262600" ? 164 : 74}
                      </td>
                      <td className="font-mono text-xs text-[#16A34A] font-medium">
                        {trial.id === "NCT00005143" ? 142 : trial.id === "NCT00262600" ? 94 : 48}
                      </td>
                      <td className="font-mono text-xs text-[#D97706] font-medium">
                        {trial.id === "NCT00005143" ? 18 : trial.id === "NCT00262600" ? 8 : 6}
                      </td>
                      <td className="text-xs text-[#64748B]">2026-08-14</td>
                      <td>
                        <span className="badge badge-success">Active</span>
                      </td>
                      <td className="whitespace-nowrap space-x-3">
                        <Link
                          href={`/trials/${trial.id}`}
                          className="text-xs font-medium text-[#2563EB] hover:underline"
                        >
                          View
                        </Link>
                        <Link
                          href="/patients"
                          className="text-xs font-medium text-[#2563EB] hover:underline"
                        >
                          Run screening
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
