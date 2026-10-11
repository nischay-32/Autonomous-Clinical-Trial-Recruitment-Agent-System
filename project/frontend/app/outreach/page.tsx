import type { Metadata } from "next";
import { api } from "@/lib/api";
import OutreachClient from "./OutreachClient";

export const instant = false;

export const metadata: Metadata = { title: "Outreach Communications" };

export default async function OutreachPage() {
  let languages: string[] = ["English", "Spanish", "French", "German", "Mandarin"];
  try {
    const res = await api.languages();
    if (res?.supported_languages) {
      languages = res.supported_languages;
    }
  } catch {
    // Graceful fallback to default languages
  }

  return <OutreachClient initialLanguages={languages} />;
}
