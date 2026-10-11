import type { Metadata } from "next";
import { api, type Trial } from "@/lib/api";
import PatientsClient from "./PatientsClient";

export const instant = false;

export const metadata: Metadata = { title: "Patient Screening" };

export default async function PatientsPage() {
  let trials: Trial[] = [];
  try {
    trials = await api.trials();
  } catch {
    trials = [];
  }

  return <PatientsClient initialTrials={trials} />;
}
