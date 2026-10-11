import type { Metadata } from "next";
import { api } from "@/lib/api";
import TrialsClient from "./TrialsClient";

export const instant = false;

export const metadata: Metadata = { title: "Trials" };

export default async function TrialsPage() {
  let trials;
  try {
    trials = await api.trials();
  } catch {
    trials = [];
  }
  return <TrialsClient initialTrials={trials} />;
}
