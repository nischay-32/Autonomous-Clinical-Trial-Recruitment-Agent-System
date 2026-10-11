// Typed API client — all backend calls go through here.
// Base URL configurable via NEXT_PUBLIC_API_URL env var.

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`GET ${path} → ${res.status}`);
  return res.json();
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`POST ${path} → ${res.status}`);
  return res.json();
}

// ── Types ────────────────────────────────────────────────────────

export interface Trial {
  id: string;
  title: string;
  medicine: string;
  total_criteria: number;
  criteria_rules: Record<string, unknown>;
}

export interface ScreenResult {
  subject_id: string;
  trial_id: string;
  status: "ELIGIBLE" | "INELIGIBLE" | "REVIEW_REQUIRED";
  matcher: {
    is_eligible: boolean;
    confidence: number;
    hard_exclusion_triggered: boolean;
    criteria_results?: Record<string, unknown>[];
    shap_values?: Record<string, number>;
    top_criterion?: string;
  };
  compliance: {
    is_compliant: boolean;
    safety_score: number;
    violations: string[];
  };
  consensus: {
    status: string;
    rounds_executed: number;
    consensus: boolean;
    summary?: string;
  };
  outreach?: {
    patient_id: string;
    language: string;
    subject: string;
    draft_content: string;
    status: string;
    is_approved: boolean;
  };
}

export interface ReportData {
  report_id: string;
  generated_at: string;
  trial_id: string;
  funnel: {
    screened: number;
    eligible: number;
    ineligible: number;
    review_required: number;
    outreach_drafted: number;
    eligibility_rate: number;
  };
  shap_summary: unknown[];
  audit_entries: AuditEntry[];
  total_audit_events: number;
}

export interface AuditEntry {
  id: string;
  timestamp: string;
  agent_name: string;
  action: string;
  patient_id: string;
  trial_id: string;
  details: Record<string, unknown>;
}

export interface PatientPayload {
  subject_id: string;
  gender?: string;
  age?: number;
  diagnoses?: string[];
  labs?: Record<string, number>;
  medications?: string[];
}

// ── API calls ────────────────────────────────────────────────────

export const api = {
  health: () => get<{ status: string }>("/health"),
  trials: () => get<Trial[]>("/trials"),
  trial: (id: string) => get<Trial>(`/trials/${id}`),
  uploadProtocol: (body: {
    trial_id: string;
    title: string;
    medicine: string;
    criteria_rules: Record<string, unknown>;
    total_criteria: number;
  }) => post<{ message: string; trial_id: string }>("/trials", body),
  screen: (trial_id: string, patient: PatientPayload) =>
    post<ScreenResult>("/screen", { trial_id, patient }),
  report: (trial_id = "") => get<ReportData>(`/report${trial_id ? `?trial_id=${trial_id}` : ""}`),
  audit: (patient_id = "", limit = 100) =>
    get<AuditEntry[]>(`/audit?patient_id=${patient_id}&limit=${limit}`),
  approveOutreach: (patient_id: string, coordinator_name: string, comments = "") =>
    post("/outreach/approve", { patient_id, coordinator_name, comments }),
  languages: () => get<{ supported_languages: string[] }>("/outreach/languages"),
};
