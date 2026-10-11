"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import { api, ReviewQueueItem } from "@/lib/api";
import { Check } from "lucide-react";



export default function ReviewQueuePage() {
  const [queue, setQueue] = useState<ReviewQueueItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadQueue() {
      try {
        const data = await api.reviewQueue();
        setQueue(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadQueue();
  }, []);

  return (
    <AppShell pageTitle="Review Queue">
      <div className="space-y-6">
        <div>
          <h1 className="text-[24px] font-bold text-[#0F172A] tracking-tight">Review queue</h1>
          <p className="text-sm text-[#64748B] mt-1">
            These patients were flagged as borderline after three rounds of agent disagreement. Each case requires a coordinator decision.
          </p>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 skeleton" />
            ))}
          </div>
        ) : queue.length === 0 ? (
          <div className="bg-white border border-[#E2E8F0] rounded-[4px] p-12 text-center">
            <div className="w-10 h-10 rounded-full bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center mx-auto mb-3">
              <Check className="w-5 h-5" />
            </div>
            <h2 className="text-sm font-semibold text-[#0F172A]">No cases pending review</h2>
            <p className="text-xs text-[#64748B] mt-1">
              The agents resolved all borderline decisions across active trial cohorts.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {queue.map((item) => (
              <div
                key={item.session_id}
                className="bg-white border border-[#E2E8F0] p-4 rounded-[4px] flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Left */}
                <div className="min-w-[200px]">
                  <Link
                    href={`/patients/${item.patient_id}`}
                    className="font-mono text-base font-bold text-[#0F172A] hover:text-[#2563EB]"
                  >
                    {item.patient_id}
                  </Link>
                  <p className="text-xs text-[#64748B] mt-0.5">
                    {item.trial_title} · <span className="font-medium text-[#0F172A]">{item.medicine}</span>
                  </p>
                </div>

                {/* Center */}
                <div className="flex-1 min-w-[240px]">
                  <p className="text-xs text-[#64748B]">Disagreed on:</p>
                  <p className="text-xs font-medium text-[#0F172A] mt-0.5 line-clamp-2">
                    &ldquo;{item.disputed_criterion}&rdquo;
                  </p>
                </div>

                {/* Right */}
                <div className="flex items-center gap-4">
                  <span className="font-mono text-xs text-[#64748B] whitespace-nowrap">
                    {item.time_in_queue}
                  </span>
                  <Link
                    href={`/review/${item.session_id}`}
                    className="bg-[#2563EB] text-white px-4 py-2 rounded-[4px] text-xs font-medium hover:bg-[#1D4ED8] transition-colors whitespace-nowrap"
                  >
                    Review
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
