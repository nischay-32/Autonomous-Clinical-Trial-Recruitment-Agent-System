import type { Metadata } from "next";
import { api, type AuditEntry } from "@/lib/api";
import AuditClient from "./AuditClient";

export const instant = false;

export const metadata: Metadata = { title: "Audit Trail" };

export default async function AuditPage() {
  let entries: AuditEntry[] = [];
  try {
    entries = await api.audit("", 200);
  } catch {
    entries = [];
  }

  return <AuditClient initialEntries={entries} />;
}
