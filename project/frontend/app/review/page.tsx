"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import { api, ReviewQueueItem } from "@/lib/api";
import { Check } from "lucide-react";

export interface AdjudicatedItem extends ReviewQueueItem {
  decision: "INCLUDE" | "EXCLUDE";
  justification: string;
  adjudicated_at: string;
}

export default function ReviewQueuePage() {
  const [queue, setQueue] = useState<ReviewQueueItem[]>([]);
  const [adjudicated, setAdjudicated] = useState<AdjudicatedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"pending" | "resolved">("pending");
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    async function loadQueue() {
      try {
        const [data, resolved] = await Promise.all([
          api.reviewQueue(),
          api.resolvedReviews().catch(() => []),
        ]);
        setQueue(data);
        setAdjudicated(
          resolved.map((r: { session_id: string; patient_id: string; trial_id: string; trial_title: string; medicine: string; decision: string; justification: string; adjudicated_at: string; age?: number; gender?: string; disputed_criterion?: string; confidence?: number; time_in_queue?: string; }) => ({
            session_id: r.session_id,
            patient_id: r.patient_id,
            trial_id: r.trial_id,
            trial_title: r.trial_title,
            medicine: r.medicine,
            age: r.age ?? 0,
            gender: r.gender ?? "",
            disputed_criterion: r.disputed_criterion ?? "Resolved",
            confidence: r.confidence ?? 0,
            time_in_queue: r.time_in_queue ?? "resolved",
            decision: r.decision as "INCLUDE" | "EXCLUDE",
            justification: r.justification,
            adjudicated_at: new Date(r.adjudicated_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          }))
        );
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadQueue();
  }, []);

  const handleQuickAdjudicate = async (
    item: ReviewQueueItem,
    decision: "INCLUDE" | "EXCLUDE"
  ) => {
    setProcessingId(item.session_id);

    const justification =
      decision === "INCLUDE"
        ? "Coordinator approved inclusion based on verified clinical tolerance and lab stability."
        : "Coordinator excluded based on strict safety threshold violation.";

    try {
      await api.adjudicateReview(item.session_id, decision, justification);
      setQueue((prev) => prev.filter((q) => q.session_id !== item.session_id));
      setAdjudicated((prev) => [
        {
          ...item,
          decision,
          justification,
          adjudicated_at: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
        ...prev,
      ]);
      setNotification(
        decision === "INCLUDE"
          ? `${item.patient_id} included. Outreach draft generated.`
          : `${item.patient_id} excluded.`
      );
      setTimeout(() => setNotification(null), 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <AppShell pageTitle="Review Queue">
      <div className="space-y-6">
        <p className="text-[13px] text-[#4d5663]">
          Borderline cases that need a coordinator decision before outreach.
        </p>

        {notification && (
          <div className="p-3 border border-[#b7e0c2] bg-[#e6f4ea] text-[#0f5c2e] text-[12px] flex items-center justify-between">
            <span>{notification}</span>
            <button type="button" onClick={() => setNotification(null)} className="font-semibold ml-4" aria-label="Dismiss">
              x
            </button>
          </div>
        )}

        <div className="flex border-b border-[#d5d9e0] gap-6 text-[13px] font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab("pending")}
            className={`pb-2.5 relative ${activeTab === "pending" ? "text-[#0b5f5a]" : "text-[#4d5663] hover:text-[#1a2332]"}`}
          >
            Pending ({queue.length})
            {activeTab === "pending" && <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#0b5f5a]" />}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("resolved")}
            className={`pb-2.5 relative ${activeTab === "resolved" ? "text-[#0b5f5a]" : "text-[#4d5663] hover:text-[#1a2332]"}`}
          >
            Resolved ({adjudicated.length})
            {activeTab === "resolved" && <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#0b5f5a]" />}
          </button>
        </div>

        {activeTab === "pending" ? (
          loading ? (
            <div className="space-y-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-20 skeleton" />
              ))}
            </div>
          ) : queue.length === 0 ? (
            <div className="card p-12 text-center">
              <Check className="w-6 h-6 mx-auto mb-3 text-[#0b5f5a]" />
              <h2 className="font-serif text-[16px]">No cases pending review</h2>
              <p className="text-[12px] text-[#4d5663] mt-1.5">The queue is empty for active trials.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {queue.map((item) => (
                <div
                  key={item.session_id}
                  className="card flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="min-w-[200px]">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/patients/${item.patient_id}`}
                        className="font-mono text-[15px] font-semibold hover:text-[#0b5f5a]"
                      >
                        {item.patient_id}
                      </Link>
                      <span className="badge badge-warning">Borderline</span>
                    </div>
                    <p className="text-[12px] text-[#4d5663] mt-0.5">
                      {item.trial_title} · {item.medicine}
                    </p>
                  </div>
                  <div className="flex-1 min-w-[240px]">
                    <p className="text-[12px] text-[#4d5663]">Disputed criterion</p>
                    <p className="text-[12px] font-medium mt-0.5 line-clamp-2">&ldquo;{item.disputed_criterion}&rdquo;</p>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-[12px] text-[#4d5663] whitespace-nowrap mr-1">
                      {item.time_in_queue}
                    </span>
                    <button
                      type="button"
                      disabled={processingId === item.session_id}
                      onClick={() => handleQuickAdjudicate(item, "INCLUDE")}
                      className="btn btn-primary text-[12px] min-h-8 py-1"
                    >
                      Include
                    </button>
                    <button
                      type="button"
                      disabled={processingId === item.session_id}
                      onClick={() => handleQuickAdjudicate(item, "EXCLUDE")}
                      className="btn btn-danger text-[12px] min-h-8 py-1"
                    >
                      Exclude
                    </button>
                    <Link href={`/review/${item.session_id}`} className="btn btn-secondary text-[12px] min-h-8 py-1">
                      Transcript
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : adjudicated.length === 0 ? (
          <div className="card p-12 text-center text-[13px] text-[#4d5663]">
            No cases adjudicated in this session yet.
          </div>
        ) : (
          <div className="space-y-3">
            {adjudicated.map((item) => (
              <div
                key={item.session_id}
                className="card flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="min-w-[200px]">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[15px] font-semibold">{item.patient_id}</span>
                    <span className={`badge ${item.decision === "INCLUDE" ? "badge-success" : "badge-danger"}`}>
                      {item.decision === "INCLUDE" ? "Included" : "Excluded"}
                    </span>
                  </div>
                  <p className="text-[12px] text-[#4d5663] mt-0.5">{item.trial_title}</p>
                </div>
                <div className="flex-1 text-[12px] text-[#4d5663]">
                  <span className="font-semibold text-[#1a2332]">Justification:</span> {item.justification}
                </div>
                <div className="text-[12px] text-[#4d5663] font-mono">Resolved at {item.adjudicated_at}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
