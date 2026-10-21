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
        <div className="flex items-center justify-between gap-3">
          <p className="text-[13px] text-[#4d5663]">Protocol registry and screening counts from the API.</p>
          <Link href="/trials/new" className="btn btn-primary">
            Create trial
          </Link>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-[#4d5663] absolute left-3 top-2.5" aria-hidden />
          <input
            type="text"
            className="pl-9"
            placeholder="Search by trial name, NCT number, or drug"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="w-48">
          <select value={drugFilter} onChange={(e) => setDrugFilter(e.target.value)}>
            <option value="All">Drug: All</option>
            {drugs.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>Trial name</th>
                  <th>Drug</th>
                  <th>NCT number</th>
                  <th>Screened</th>
                  <th>Eligible</th>
                  <th>Pending review</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center">
                      <div className="h-4 w-48 skeleton mx-auto" />
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-16 text-center">
                      <p className="text-[13px] text-[#4d5663]">No trials yet.</p>
                      <Link href="/trials/new" className="btn btn-primary mt-3 text-[12px] inline-flex">
                        Create trial
                      </Link>
                    </td>
                  </tr>
                ) : (
                  filtered.map((trial) => (
                    <tr key={trial.id}>
                      <td className="font-semibold">{trial.title}</td>
                      <td>{trial.medicine}</td>
                      <td className="font-mono text-[12px]">{trial.id}</td>
                      <td className="font-mono text-[12px]">{trial.patients_screened ?? 0}</td>
                      <td className="font-mono text-[12px]">{trial.eligible ?? 0}</td>
                      <td className="font-mono text-[12px]">{trial.pending_review ?? 0}</td>
                      <td>
                        <span className="badge badge-muted">{trial.status ?? "Unknown"}</span>
                      </td>
                      <td className="whitespace-nowrap space-x-3">
                        <Link href={`/trials/${trial.id}`} className="text-[12px] font-semibold text-[#0b5f5a] hover:underline">
                          View
                        </Link>
                        <Link href="/patients" className="text-[12px] font-semibold text-[#0b5f5a] hover:underline">
                          Screen
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
