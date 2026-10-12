// Typed API client — all backend calls go through here.
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
  criteria_rules?: Record<string, unknown>;
  patients_screened?: number;
  eligible?: number;
  pending_review?: number;
  status?: "Active" | "Paused" | "Complete";
}

export interface PatientCriterionEvaluation {
  criterion_id: string;
  type: "INCLUSION" | "EXCLUSION";
  text: string;
  status: "PASS" | "FAIL" | "BORDERLINE";
  confidence: number;
  evidence: string;
  source: string;
}

export interface PatientRecord {
  subject_id: string;
  age: number;
  gender: string;
  trial_id: string;
  trial_title: string;
  medicine: string;
  status: "ELIGIBLE" | "INELIGIBLE" | "REVIEW_REQUIRED";
  confidence: number;
  criteria_passed: number;
  borderline_count: number;
  reviewed_at: string;
  diagnoses?: string[];
  labs?: Record<string, number>;
  medications?: string[];
  criteria_evaluations?: PatientCriterionEvaluation[];
  disagreement?: {
    criterion: string;
    matcher_stance: string;
    matcher_confidence: number;
    matcher_reasoning: string;
    compliance_stance: string;
    compliance_confidence: number;
    compliance_reasoning: string;
    rounds: { round: number; matcher: string; compliance: string; result: string }[];
  };
}

export interface ReviewQueueItem {
  session_id: string;
  patient_id: string;
  trial_id: string;
  trial_title: string;
  medicine: string;
  age: number;
  gender: string;
  disputed_criterion: string;
  confidence: number;
  time_in_queue: string;
  disagreement?: PatientRecord["disagreement"];
  labs?: Record<string, number>;
}

export interface OutreachDraft {
  draft_id: string;
  patient_id: string;
  trial_id: string;
  trial_title: string;
  medicine: string;
  language: string;
  generated_at: string;
  status: "Pending approval" | "Approved" | "Sent" | "Rejected";
  confidence: number;
  subject: string;
  body: string;
}

export interface AuditEntry {
  id: string;
  timestamp: string;
  agent_name: string;
  action: string;
  patient_id: string;
  trial_id: string;
  details: Record<string, unknown>;
  hipaa_flag?: boolean;
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
  shap_summary: Record<string, unknown>[];
  audit_entries: AuditEntry[];
  total_audit_events: number;
}

export interface OrgSettings {
  org_name: string;
  irb_number: string;
  compliance_email: string;
  data_residency: string;
  retention_years: number;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: "Coordinator" | "Viewer" | "Admin";
  joined: string;
}

export interface AuthUser {
  id: string;
  email: string;
  full_name: string;
  role: string;
  organization: string;
  job_title: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
  message: string;
}

export interface ScreenPatientInput {
  subject_id?: string;
  age: number;
  gender: string;
  diagnoses: string[];
  labs?: Record<string, number>;
  medications?: string[];
}

// ── API calls ────────────────────────────────────────────────────

export const api = {
  health: () => get<{ status: string }>("/health"),
  login: (body: { email: string; password: string }) =>
    post<AuthResponse>("/auth/login", body),
  register: (body: {
    full_name: string;
    email: string;
    organization: string;
    job_title?: string;
    password: string;
  }) => post<AuthResponse>("/auth/register", body),
  me: (email = "") => get<AuthUser>(`/auth/me${email ? `?email=${email}` : ""}`),

  trials: () => get<Trial[]>("/trials"),
  trial: (id: string) => get<Trial>(`/trials/${id}`),
  uploadProtocol: (body: {
    trial_id: string;
    title: string;
    medicine: string;
    criteria_rules: Record<string, unknown>;
    total_criteria: number;
  }) => post<{ message: string; trial_id: string }>("/trials", body),
  
  patients: (trial_id = "", decision = "") =>
    get<PatientRecord[]>(`/patients?trial_id=${trial_id}&decision=${decision}`),
  patient: (id: string) => get<PatientRecord>(`/patients/${id}`),
  screen: (trial_id: string, patient: ScreenPatientInput) =>
    post<{ status: string; confidence: number; patient_record: PatientRecord; outreach?: unknown }>("/screen", {
      trial_id,
      patient,
    }),
  
  reviewQueue: () => get<ReviewQueueItem[]>("/review/queue"),
  adjudicateReview: (session_id: string, decision: "INCLUDE" | "EXCLUDE", justification: string) =>
    post<{ session_id: string; status: string; message: string }>(`/review/${session_id}/adjudicate`, {
      decision,
      justification,
    }),

  outreachDrafts: () => get<OutreachDraft[]>("/outreach/drafts"),
  outreachDraft: (id: string) => get<OutreachDraft>(`/outreach/drafts/${id}`),
  approveOutreach: (patient_id: string, coordinator_name: string, comments = "") =>
    post<{ patient_id: string; status: string; approved_by: string; message: string }>("/outreach/approve", {
      patient_id,
      coordinator_name,
      comments,
    }),

  audit: (patient_id = "", limit = 100) =>
    get<AuditEntry[]>(`/audit?patient_id=${patient_id}&limit=${limit}`),
  report: (trial_id = "") => get<ReportData>(`/report${trial_id ? `?trial_id=${trial_id}` : ""}`),
  
  orgSettings: () => get<OrgSettings>("/settings/organization"),
  updateOrgSettings: (payload: Partial<OrgSettings>) =>
    post<{ status: string; settings: OrgSettings }>("/settings/organization", payload),
  teamMembers: () => get<TeamMember[]>("/settings/team"),
};
