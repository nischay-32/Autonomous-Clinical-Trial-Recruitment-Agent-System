import type { Metadata } from "next";
import { api, type ReportData } from "@/lib/api";
import ReportClient from "./ReportClient";

export const instant = false;

export const metadata: Metadata = { title: "Reports" };

export default async function ReportPage() {
  let report: ReportData | null = null;
  try {
    report = await api.report();
  } catch {
    report = null;
  }

  return <ReportClient initialReport={report} />;
}
