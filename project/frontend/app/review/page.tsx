import type { Metadata } from "next";
import { api, type ReportData } from "@/lib/api";
import ReviewClient from "./ReviewClient";

export const instant = false;

export const metadata: Metadata = { title: "Review Queue" };

export default async function ReviewPage() {
  let report: ReportData | null = null;
  try {
    report = await api.report();
  } catch {
    report = null;
  }

  return <ReviewClient initialReport={report} />;
}
