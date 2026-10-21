const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";
const TOKEN_KEY = "trialscreen_token";
const USER_KEY = "trialscreen_user";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function setSession(token: string, user: AuthUser) {
  sessionStorage.setItem(TOKEN_KEY, token);
  sessionStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession() {
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const headers: Record<string, string> = {
    ...(init?.headers as Record<string, string> | undefined),
  };
  if (init?.body) headers["Content-Type"] = "application/json";
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, { cache: "no-store", ...init, headers });
  if (!res.ok) {
    let message = `${init?.method ?? "GET"} ${path} → ${res.status}`;
    try {
      const payload = await res.json();
      if (typeof payload.detail === "string") message = payload.detail;
    } catch {
      /* keep fallback */
    }
    if (res.status === 401 && !path.startsWith("/auth/login") && !path.startsWith("/auth/register")) {
      clearSession();
      if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
    }
    throw new Error(message);
  }
  return res.json();
}

function get<T>(path: string): Promise<T> {
  return request<T>(path);
}

function post<T>(path: string, body: unknown): Promise<T> {
  return request<T>(path, { method: "POST", body: JSON.stringify(body) });
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
  ineligible?: number;
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
  me: () => get<AuthUser>("/auth/me"),

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
  resolvedReviews: () => get<{
    session_id: string; patient_id: string; trial_id: string; trial_title: string;
    medicine: string; decision: string; justification: string; adjudicated_at: string;
  }[]>("/review/resolved"),
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
  rejectOutreach: (patient_id: string, coordinator_name: string, reason = "") =>
    post<{ patient_id: string; status: string; message: string }>("/outreach/reject", {
      patient_id,
      coordinator_name,
      reason,
    }),

  audit: (patient_id = "", limit = 100) =>
    get<AuditEntry[]>(`/audit?patient_id=${patient_id}&limit=${limit}`),
};
