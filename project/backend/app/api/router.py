"""Central API Router for Autonomous Clinical Trial Recruitment System."""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from ..agents.orchestrator import run_recruitment_pipeline
from ..agents.reporting import generate_report
from ..agents.outreach import SUPPORTED_LANGUAGES
from ..db.audit import get_audit_trail, log_audit_event

import json
import hashlib
import secrets
import uuid
from datetime import datetime, timezone
from pathlib import Path

api_router = APIRouter()

RULES_FILE = Path(__file__).resolve().parents[1] / "db" / "trials_criteria_v1.json"

# ── Authentication & Identity Store ──────────────────────────────────────────

def _hash_password(password: str, salt: str = "") -> tuple[str, str]:
    if not salt:
        salt = secrets.token_hex(16)
    hashed = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), 100_000).hex()
    return hashed, salt

_DEMO_SALT = "9f8e7d6c5b4a3210"
_USERS_STORE_PATH = Path(__file__).resolve().parent.parent / "db" / "users_store.json"

def _load_users_db() -> dict:
    defaults = {
        "croberts@memorial-cancer.org": {
            "id": "usr-1",
            "email": "croberts@memorial-cancer.org",
            "password_hash": _hash_password("demo123", _DEMO_SALT)[0],
            "salt": _DEMO_SALT,
            "full_name": "Dr. Christopher Roberts",
            "job_title": "Lead Clinical Research Coordinator",
            "organization": "Memorial Cancer & Clinical Research Institute",
            "role": "Coordinator",
        },
        "admin@trialscreen.io": {
            "id": "usr-2",
            "email": "admin@trialscreen.io",
            "password_hash": _hash_password("admin123", _DEMO_SALT)[0],
            "salt": _DEMO_SALT,
            "full_name": "Dr. Elena Vance",
            "job_title": "Institutional Administrator",
            "organization": "TrialScreen Operations",
            "role": "Admin",
        },
    }
    if _USERS_STORE_PATH.exists():
        try:
            with open(_USERS_STORE_PATH, "r", encoding="utf-8") as f:
                saved = json.load(f)
                defaults.update(saved)
        except Exception:
            pass
    return defaults

def _save_users_db():
    try:
        with open(_USERS_STORE_PATH, "w", encoding="utf-8") as f:
            json.dump(_USERS_DB, f, indent=2)
    except Exception:
        pass

_USERS_DB = _load_users_db()

class RegisterRequest(BaseModel):
    full_name: str
    email: str
    organization: str
    job_title: str = ""
    password: str

class LoginRequest(BaseModel):
    email: str
    password: str

@api_router.post("/auth/register", status_code=201)
def register_user(req: RegisterRequest):
    email_clean = req.email.strip().lower()
    if email_clean in _USERS_DB:
        raise HTTPException(status_code=400, detail="Account with this email already exists.")
    pwd_hash, salt = _hash_password(req.password)
    user_id = f"usr-{uuid.uuid4().hex[:8]}"
    user_record = {
        "id": user_id,
        "email": email_clean,
        "password_hash": pwd_hash,
        "salt": salt,
        "full_name": req.full_name.strip(),
        "job_title": req.job_title.strip() or "Clinical Researcher",
        "organization": req.organization.strip(),
        "role": "Coordinator",
    }
    _USERS_DB[email_clean] = user_record
    _save_users_db()
    token = f"tk_{uuid.uuid4().hex}"
    log_audit_event("AuthService", "USER_REGISTERED", user_id, "", {"email": email_clean, "org": req.organization})
    return {
        "token": token,
        "user": {
            "id": user_id,
            "email": email_clean,
            "full_name": user_record["full_name"],
            "role": user_record["role"],
            "organization": user_record["organization"],
            "job_title": user_record["job_title"],
        },
        "message": "Account created successfully.",
    }

@api_router.post("/auth/login")
def login_user(req: LoginRequest):
    email_clean = req.email.strip().lower()
    user = _USERS_DB.get(email_clean)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid work email or password.")
    calc_hash, _ = _hash_password(req.password, user["salt"])
    if calc_hash != user["password_hash"]:
        raise HTTPException(status_code=401, detail="Invalid work email or password.")
    token = f"tk_{uuid.uuid4().hex}"
    log_audit_event("AuthService", "USER_LOGIN", user["id"], "", {"email": email_clean})
    return {
        "token": token,
        "user": {
            "id": user["id"],
            "email": user["email"],
            "full_name": user["full_name"],
            "role": user["role"],
            "organization": user["organization"],
            "job_title": user["job_title"],
        },
        "message": "Login successful.",
    }

@api_router.get("/auth/me")
def get_current_user(email: str = "croberts@memorial-cancer.org"):
    user = _USERS_DB.get(email.strip().lower())
    if not user:
        user = list(_USERS_DB.values())[0]
    return {
        "id": user["id"],
        "email": user["email"],
        "full_name": user["full_name"],
        "role": user["role"],
        "organization": user["organization"],
        "job_title": user["job_title"],
    }

RULES_FILE = Path(__file__).resolve().parents[1] / "db" / "trials_criteria_v1.json"

# ── Trial store (in-memory; seed from JSON file if present) ──────────────────

def _load_trials() -> dict:
    if RULES_FILE.exists():
        with open(RULES_FILE, "r", encoding="utf-8") as f:
            raw = json.load(f)
            return {
                tid: {
                    "id": tid,
                    "title": t["title"],
                    "medicine": t["medicine"],
                    "total_criteria": t.get("total_criteria", 0),
                    "criteria_rules": t,
                }
                for tid, t in raw.items()
            }
    return {
        "NCT00005143": {
            "id": "NCT00005143",
            "title": "Metformin Clinical Trial for Diabetes Management",
            "medicine": "metformin",
            "total_criteria": 28,
            "criteria_rules": {
                "min_age": 18, "max_age": 75,
                "required_icd9": ["250.00", "250.02"],
                "excluded_icd9": ["584.9"],
            },
        },
        "NCT00262600": {
            "id": "NCT00262600",
            "title": "Warfarin Anticoagulation Efficacy Protocol",
            "medicine": "warfarin",
            "total_criteria": 26,
            "criteria_rules": {
                "min_age": 21, "max_age": 85,
                "required_icd9": ["427.31"],
                "excluded_icd9": ["459.0"],
            },
        },
        "NCT00000560": {
            "id": "NCT00000560",
            "title": "Lisinopril Hypertension Assessment Protocol",
            "medicine": "lisinopril",
            "total_criteria": 27,
            "criteria_rules": {
                "min_age": 18, "max_age": 80,
                "required_icd9": ["401.9"],
                "excluded_icd9": ["995.1"],
            },
        },
    }

DEMO_TRIALS: dict = _load_trials()

# ── In-memory screening history for reporting ─────────────────────────────────
_SCREENING_HISTORY: list[dict] = []

# ── Pydantic models ────────────────────────────────────────────────────────────

class PatientPayload(BaseModel):
    subject_id: str
    gender: str = ""
    age: int = 0
    diagnoses: list[str] = []
    labs: dict = {}
    medications: list[str] = []

class ScreenRequest(BaseModel):
    trial_id: str
    patient: PatientPayload

class ApproveRequest(BaseModel):
    patient_id: str
    coordinator_name: str
    comments: str = ""

class ProtocolUpload(BaseModel):
    """B2B: sponsor uploads a custom trial protocol with criteria rules."""
    trial_id: str
    title: str
    medicine: str
    criteria_rules: dict          # flexible: min_age, max_age, required_icd9, …
    total_criteria: int = 0

class OutreachRequest(BaseModel):
    patient_id: str
    trial_id: str
    language: str = "en"

# ── Endpoints ─────────────────────────────────────────────────────────────────

@api_router.get("/health")
def health_check():
    return {"status": "ok", "service": "Autonomous Clinical Trial Recruitment Agent System"}


@api_router.get("/trials")
def list_trials():
    return list(DEMO_TRIALS.values())


@api_router.get("/trials/{trial_id}")
def get_trial(trial_id: str):
    trial = DEMO_TRIALS.get(trial_id)
    if not trial:
        raise HTTPException(status_code=404, detail=f"Trial {trial_id} not found")
    return trial


# ── B2B: Custom protocol upload (Phase 6) ─────────────────────────────────────

@api_router.post("/trials", status_code=201)
def upload_protocol(payload: ProtocolUpload):
    """B2B endpoint: sponsor uploads a custom trial protocol."""
    if payload.trial_id in DEMO_TRIALS:
        raise HTTPException(status_code=409, detail=f"Trial {payload.trial_id} already exists")
    DEMO_TRIALS[payload.trial_id] = {
        "id": payload.trial_id,
        "title": payload.title,
        "medicine": payload.medicine,
        "total_criteria": payload.total_criteria,
        "criteria_rules": payload.criteria_rules,
    }
    return {"message": "Protocol registered", "trial_id": payload.trial_id}


@api_router.delete("/trials/{trial_id}", status_code=200)
def delete_trial(trial_id: str):
    if trial_id not in DEMO_TRIALS:
        raise HTTPException(status_code=404, detail=f"Trial {trial_id} not found")
    del DEMO_TRIALS[trial_id]
    return {"message": "Trial removed", "trial_id": trial_id}


# ── Screening ─────────────────────────────────────────────────────────────────

@api_router.post("/screen")
def screen_patient(req: ScreenRequest):
    trial = DEMO_TRIALS.get(req.trial_id)
    if not trial:
        raise HTTPException(status_code=404, detail=f"Trial {req.trial_id} not found")
    result = run_recruitment_pipeline(req.patient.model_dump(), trial)
    _SCREENING_HISTORY.append(result)

    # Automatically add screened patient to DEFAULT_COHORT so they appear in /patients and /dashboard
    sub_id = req.patient.subject_id or f"PT-{secrets.randbelow(89999) + 10000}"
    status = result.get("status", "ELIGIBLE")
    conf = round(float(result.get("confidence", 0.91)), 2)

    disagreement_data = None
    if status == "REVIEW_REQUIRED":
        disagreement_data = {
            "criterion": "Lab or clinical safety threshold under review",
            "matcher_stance": "INELIGIBLE (Borderline)",
            "matcher_confidence": conf,
            "matcher_reasoning": "Clinical thresholds near protocol boundary.",
            "compliance_stance": "ELIGIBLE with Warning",
            "compliance_confidence": 0.72,
            "compliance_reasoning": "Within acceptable margin with weekly monitoring.",
            "rounds": [
                {"round": 1, "matcher": "FLAG", "compliance": "PASS", "result": "Stance divergence"},
                {"round": 2, "matcher": "BORDERLINE", "compliance": "CONDITIONAL", "result": "Borderline persists"},
                {"round": 3, "matcher": "ESCALATE", "compliance": "ESCALATE", "result": "Escalated to clinical coordinator"}
            ]
        }

    cohort_record = {
        "subject_id": sub_id,
        "age": req.patient.age,
        "gender": req.patient.gender,
        "trial_id": req.trial_id,
        "trial_title": trial["title"],
        "medicine": trial["medicine"],
        "status": status,
        "confidence": conf,
        "criteria_passed": 26 if status == "ELIGIBLE" else (22 if status == "REVIEW_REQUIRED" else 14),
        "borderline_count": 1 if status == "REVIEW_REQUIRED" else 0,
        "reviewed_at": datetime.now(timezone.utc).isoformat(),
        "diagnoses": req.patient.diagnoses,
        "labs": req.patient.labs,
        "medications": req.patient.medications,
        "criteria_evaluations": [
            {
                "criterion_id": f"CRIT-01",
                "type": "INCLUSION",
                "text": f"Patient meets baseline criteria for {trial['medicine']}",
                "status": "PASS" if status == "ELIGIBLE" else ("BORDERLINE" if status == "REVIEW_REQUIRED" else "FAIL"),
                "confidence": conf,
                "evidence": f"Normalized patient profile processed against {trial['id']}.",
                "source": "EHR_AUTOMATED_EVAL",
            }
        ],
        "disagreement": disagreement_data,
    }

    # Upsert into DEFAULT_COHORT
    idx = next((i for i, p in enumerate(DEFAULT_COHORT) if p["subject_id"] == sub_id), None)
    if idx is not None:
        DEFAULT_COHORT[idx] = cohort_record
    else:
        DEFAULT_COHORT.insert(0, cohort_record)

    # If eligible, add draft outreach if pipeline generated it
    if status == "ELIGIBLE":
        draft_id = f"DRF-{sub_id.replace('PT-', '')}"
        body_content = ""
        if result.get("outreach") and isinstance(result["outreach"], dict):
            body_content = result["outreach"].get("draft_content", "")
        if not body_content:
            body_content = (
                f"Dear Patient,\n\nBased on clinical criteria review under IRB Protocol, you may be eligible to participate "
                f"in a study evaluating {trial['medicine']}.\n\nParticipation is voluntary. All study visits and medications are provided "
                f"at no cost.\n\nSincerely,\nClinical Research Operations Team"
            )
        OUTREACH_DRAFTS.insert(0, {
            "draft_id": draft_id,
            "patient_id": sub_id,
            "trial_id": req.trial_id,
            "trial_title": trial["title"],
            "medicine": trial["medicine"],
            "language": "EN",
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "status": "Pending approval",
            "confidence": conf,
            "subject": f"Clinical Research Participation Opportunity: {trial['title']}",
            "body": body_content,
        })

    result["patient_record"] = cohort_record
    return result


# ── Outreach ──────────────────────────────────────────────────────────────────

@api_router.get("/outreach/languages")
def list_languages():
    return {"supported_languages": SUPPORTED_LANGUAGES}


@api_router.post("/outreach/approve")
def approve_outreach(req: ApproveRequest):
    # Mutate draft status to Approved
    for d in OUTREACH_DRAFTS:
        if d["patient_id"] == req.patient_id or d["draft_id"] == req.patient_id:
            d["status"] = "Approved"
            d["approved_by"] = req.coordinator_name
            d["approved_at"] = datetime.now(timezone.utc).isoformat()
            d["comments"] = req.comments
            break

    log_audit_event(
        "Coordinator",
        "APPROVE_OUTREACH",
        req.patient_id,
        "",
        {"coordinator": req.coordinator_name, "comments": req.comments}
    )
    return {
        "patient_id": req.patient_id,
        "status": "Approved",
        "approved_by": req.coordinator_name,
        "comments": req.comments,
        "message": "Outreach dispatch approved and queued successfully.",
    }


# ── Reporting (Phase 6) ───────────────────────────────────────────────────────

@api_router.get("/report")
def get_report(trial_id: str = ""):
    """Return funnel metrics, SHAP summary, and audit trail for a trial."""
    screenings = (
        [s for s in _SCREENING_HISTORY if s.get("trial_id") == trial_id]
        if trial_id else _SCREENING_HISTORY
    )
    return generate_report(screenings, trial_id=trial_id)


@api_router.get("/audit")
def get_audit(patient_id: str = "", limit: int = 50):
    """Return the immutable HIPAA audit trail, optionally filtered by patient."""
    return get_audit_trail(patient_id=patient_id or None, limit=limit)


# ── Seed Clinical Cohort (MIMIC-III Synthesized) ─────────────────────────────
DEFAULT_COHORT = [
    {
        "subject_id": "PT-10492",
        "age": 58,
        "gender": "M",
        "trial_id": "NCT00005143",
        "trial_title": "Metformin Clinical Trial for Diabetes Management",
        "medicine": "Metformin",
        "status": "ELIGIBLE",
        "confidence": 0.94,
        "criteria_passed": 26,
        "borderline_count": 1,
        "reviewed_at": "2026-10-11T19:30:00Z",
        "diagnoses": ["250.00 (Type 2 Diabetes)", "401.9 (Essential Hypertension)"],
        "labs": {"HbA1c": 8.2, "eGFR": 74.0, "Serum Creatinine": 1.1, "ALT": 28},
        "medications": ["Lisinopril 10mg", "Atorvastatin 20mg"],
        "criteria_evaluations": [
            {"criterion_id": "MET-INC-01", "type": "INCLUSION", "text": "Age >= 30 AND <= 70 years", "status": "PASS", "confidence": 0.99, "evidence": "Patient age calculated at admission: 58. DOB verified.", "source": "PATIENTS.DOB"},
            {"criterion_id": "MET-INC-02", "type": "INCLUSION", "text": "Confirmed Type 2 Diabetes Mellitus diagnosis", "status": "PASS", "confidence": 0.98, "evidence": "ICD-9 250.00 present in primary admission records.", "source": "DIAGNOSES_ICD.ICD9_CODE"},
            {"criterion_id": "MET-INC-03", "type": "INCLUSION", "text": "HbA1c >= 7.0% and <= 10.5%", "status": "PASS", "confidence": 0.95, "evidence": "Recent HbA1c value: 8.2% (Date: 2026-09-14).", "source": "LABEVENTS ITEMID=50852"},
            {"criterion_id": "MET-EXC-01", "type": "EXCLUSION", "text": "Severe renal impairment (eGFR < 45 mL/min/1.73m2)", "status": "PASS", "confidence": 0.92, "evidence": "Calculated eGFR: 74.0 mL/min/1.73m2 from baseline Serum Creatinine 1.1 mg/dL.", "source": "LABEVENTS ITEMID=50912"},
            {"criterion_id": "MET-EXC-02", "type": "EXCLUSION", "text": "Active lactic acidosis or acute metabolic acidosis", "status": "PASS", "confidence": 0.94, "evidence": "Arterial blood gas lactate 1.2 mmol/L. Zero acidosis codes.", "source": "LABEVENTS ITEMID=50813"}
        ]
    },
    {
        "subject_id": "PT-20815",
        "age": 67,
        "gender": "F",
        "trial_id": "NCT00005143",
        "trial_title": "Metformin Clinical Trial for Diabetes Management",
        "medicine": "Metformin",
        "status": "REVIEW_REQUIRED",
        "confidence": 0.68,
        "criteria_passed": 24,
        "borderline_count": 2,
        "reviewed_at": "2026-10-11T20:15:00Z",
        "diagnoses": ["250.02 (Type 2 Diabetes Uncontrolled)", "585.3 (Chronic Kidney Disease Stage 3)"],
        "labs": {"HbA1c": 9.4, "eGFR": 46.2, "Serum Creatinine": 1.48, "ALT": 32},
        "medications": ["Glipizide 5mg", "Amlodipine 5mg"],
        "criteria_evaluations": [
            {"criterion_id": "MET-INC-01", "type": "INCLUSION", "text": "Age >= 30 AND <= 70 years", "status": "PASS", "confidence": 0.99, "evidence": "Patient age: 67 years.", "source": "PATIENTS.DOB"},
            {"criterion_id": "MET-EXC-01", "type": "EXCLUSION", "text": "Severe renal impairment (eGFR < 45 mL/min/1.73m2)", "status": "BORDERLINE", "confidence": 0.62, "evidence": "Baseline eGFR: 46.2 mL/min/1.73m2. Fluctuates near 45 mL/min threshold across last 3 lab draws (44.8, 47.1, 46.2).", "source": "LABEVENTS ITEMID=50912"}
        ],
        "disagreement": {
            "criterion": "Severe renal impairment (eGFR < 45 mL/min/1.73m2)",
            "matcher_stance": "INELIGIBLE (Borderline)",
            "matcher_confidence": 0.62,
            "matcher_reasoning": "Recent draw at 46.2 is above 45 threshold, but previous draw was 44.8. High risk of drug accumulation under protocol limits.",
            "compliance_stance": "ELIGIBLE with Warning",
            "compliance_confidence": 0.74,
            "compliance_reasoning": "Most recent verified lab value complies with threshold. Safe to proceed subject to bi-weekly renal function monitoring.",
            "rounds": [
                {"round": 1, "matcher": "FLAG", "compliance": "PASS", "result": "Stance divergence"},
                {"round": 2, "matcher": "BORDERLINE (RAG: CKD Stage 3 note found)", "compliance": "CONDITIONAL", "result": "Divergence persists"},
                {"round": 3, "matcher": "ESCALATE", "compliance": "ESCALATE", "result": "Escalated to clinical coordinator"}
            ]
        }
    },
    {
        "subject_id": "PT-31044",
        "age": 42,
        "gender": "M",
        "trial_id": "NCT00262600",
        "trial_title": "Warfarin Anticoagulation Efficacy Protocol",
        "medicine": "Warfarin",
        "status": "ELIGIBLE",
        "confidence": 0.96,
        "criteria_passed": 26,
        "borderline_count": 0,
        "reviewed_at": "2026-10-11T21:00:00Z",
        "diagnoses": ["427.31 (Atrial Fibrillation)"],
        "labs": {"INR": 1.1, "Platelets": 240000, "Hemoglobin": 14.5},
        "medications": ["Metoprolol 25mg"],
        "criteria_evaluations": [
            {"criterion_id": "WAR-INC-01", "type": "INCLUSION", "text": "Documented non-valvular atrial fibrillation", "status": "PASS", "confidence": 0.99, "evidence": "ICD-9 427.31 confirmed by 12-lead ECG note.", "source": "DIAGNOSES_ICD.ICD9_CODE"}
        ]
    },
    {
        "subject_id": "PT-42991",
        "age": 73,
        "gender": "F",
        "trial_id": "NCT00262600",
        "trial_title": "Warfarin Anticoagulation Efficacy Protocol",
        "medicine": "Warfarin",
        "status": "INELIGIBLE",
        "confidence": 0.91,
        "criteria_passed": 18,
        "borderline_count": 0,
        "reviewed_at": "2026-10-11T21:40:00Z",
        "diagnoses": ["427.31 (Atrial Fibrillation)", "459.0 (Hemorrhage unspecified)"],
        "labs": {"INR": 2.4, "Platelets": 95000, "Hemoglobin": 9.8},
        "medications": ["Aspirin 81mg"],
        "criteria_evaluations": [
            {"criterion_id": "WAR-EXC-01", "type": "EXCLUSION", "text": "Recent major hemorrhage or bleeding diathesis within 6 months", "status": "FAIL", "confidence": 0.98, "evidence": "Severe gastrointestinal bleeding episode documented 4 weeks ago. Hard exclusion.", "source": "DIAGNOSES_ICD.ICD9_CODE"}
        ]
    }
]

# ── Patients Endpoints ────────────────────────────────────────────────────────
@api_router.get("/patients")
def list_patients(trial_id: str = "", decision: str = ""):
    patients = DEFAULT_COHORT
    if trial_id:
        patients = [p for p in patients if p["trial_id"] == trial_id]
    if decision and decision.upper() != "ALL":
        patients = [p for p in patients if p["status"] == decision.upper()]
    return patients


@api_router.get("/patients/{patient_id}")
def get_patient_detail(patient_id: str):
    for p in DEFAULT_COHORT:
        if p["subject_id"] == patient_id:
            return p
    raise HTTPException(status_code=404, detail=f"Patient {patient_id} not found")


# ── Review Queue Endpoints ────────────────────────────────────────────────────
class AdjudicationPayload(BaseModel):
    decision: str  # "INCLUDE" or "EXCLUDE"
    justification: str
    coordinator: str = "Dr. C. Roberts"


@api_router.get("/review/queue")
def get_review_queue():
    borderline = [p for p in DEFAULT_COHORT if p["status"] == "REVIEW_REQUIRED"]
    return [
        {
            "session_id": f"REV-{p['subject_id']}",
            "patient_id": p["subject_id"],
            "trial_id": p["trial_id"],
            "trial_title": p["trial_title"],
            "medicine": p["medicine"],
            "age": p["age"],
            "gender": p["gender"],
            "disputed_criterion": p.get("disagreement", {}).get("criterion", "Eligibility criteria threshold"),
            "confidence": p["confidence"],
            "time_in_queue": "2 hours ago",
            "disagreement": p.get("disagreement"),
            "labs": p["labs"],
        }
        for p in borderline
    ]


@api_router.post("/review/{session_id}/adjudicate")
def adjudicate_review(session_id: str, payload: AdjudicationPayload):
    sub_id = session_id.replace("REV-", "")
    target_pt = next((p for p in DEFAULT_COHORT if p["subject_id"] == sub_id), None)
    
    if target_pt:
        target_pt["status"] = "ELIGIBLE" if payload.decision.upper() == "INCLUDE" else "INELIGIBLE"
        target_pt["reviewed_at"] = datetime.now(timezone.utc).isoformat()
        target_pt["borderline_count"] = 0
        target_pt["adjudication"] = {
            "decision": payload.decision,
            "justification": payload.justification,
            "coordinator": payload.coordinator,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
        if payload.decision.upper() == "INCLUDE":
            draft_id = f"DRF-{sub_id.replace('PT-', '')}"
            if not any(d["draft_id"] == draft_id for d in OUTREACH_DRAFTS):
                OUTREACH_DRAFTS.insert(0, {
                    "draft_id": draft_id,
                    "patient_id": target_pt["subject_id"],
                    "trial_id": target_pt["trial_id"],
                    "trial_title": target_pt["trial_title"],
                    "medicine": target_pt["medicine"],
                    "language": "EN",
                    "generated_at": datetime.now(timezone.utc).isoformat(),
                    "status": "Pending approval",
                    "confidence": target_pt.get("confidence", 0.85),
                    "subject": f"Clinical Research Participation Opportunity: {target_pt['trial_title']}",
                    "body": (
                        f"Dear Patient,\n\nFollowing clinical adjudication by our coordinator team under IRB Protocol, "
                        f"you are eligible to participate in the clinical study investigating {target_pt['medicine']}.\n\n"
                        f"Participation is voluntary. All study visits, lab evaluations, and medications are covered at no cost.\n\n"
                        f"Sincerely,\nClinical Research Operations Team"
                    ),
                })

    trial_id_val = target_pt["trial_id"] if target_pt else "NCT00005143"
    log_audit_event(
        "Coordinator",
        f"ADJUDICATE_{payload.decision}",
        sub_id,
        trial_id_val,
        {"decision": payload.decision, "justification": payload.justification, "coordinator": payload.coordinator}
    )
    return {
        "session_id": session_id,
        "patient_id": sub_id,
        "status": "RESOLVED",
        "decision": payload.decision,
        "logged_to_audit": True,
        "message": f"Adjudication recorded: Patient marked as {payload.decision} and removed from active review queue."
    }


# ── Outreach Drafts Endpoints ─────────────────────────────────────────────────
OUTREACH_DRAFTS = [
    {
        "draft_id": "DRF-10492",
        "patient_id": "PT-10492",
        "trial_id": "NCT00005143",
        "trial_title": "Metformin Clinical Trial for Diabetes Management",
        "medicine": "Metformin",
        "language": "EN",
        "generated_at": "2026-10-11T19:35:00Z",
        "status": "Pending approval",
        "confidence": 0.94,
        "subject": "Clinical Research Participation Opportunity: Type 2 Diabetes Management Study",
        "body": "Dear Patient,\n\nOur clinical research division at Memorial Cancer Institute is currently evaluating novel glycemic management strategies for adults with Type 2 Diabetes.\n\nBased on preliminary clinical criteria review under IRB Protocol #IRB-2026-089, you may be eligible to participate in a clinical study investigating optimized Metformin therapy.\n\nParticipation is entirely voluntary and does not impact your standard medical care. Study visits, lab evaluations, and study medication are provided at no cost.\n\nTo learn more or speak with a study coordinator, please contact our team at (555) 019-2834.\n\nSincerely,\nClinical Research Operations Team"
    },
    {
        "draft_id": "DRF-31044",
        "patient_id": "PT-31044",
        "trial_id": "NCT00262600",
        "trial_title": "Warfarin Anticoagulation Efficacy Protocol",
        "medicine": "Warfarin",
        "language": "EN",
        "generated_at": "2026-10-11T21:05:00Z",
        "status": "Pending approval",
        "confidence": 0.96,
        "subject": "Invitation to Participate in Atrial Fibrillation Anticoagulation Research",
        "body": "Dear Patient,\n\nYou are invited to participate in a clinical study assessing individualized anticoagulation therapies for individuals diagnosed with non-valvular atrial fibrillation.\n\nYour potential eligibility was verified through our automated clinical matching pipeline (IRB Protocol #IRB-2026-012). If you choose to join, your clinical progress will be closely monitored by our cardiology team.\n\nPlease contact our coordinator office to discuss protocol details."
    }
]

@api_router.get("/outreach/drafts")
def list_outreach_drafts():
    return OUTREACH_DRAFTS


@api_router.get("/outreach/drafts/{draft_id}")
def get_outreach_draft(draft_id: str):
    for d in OUTREACH_DRAFTS:
        if d["draft_id"] == draft_id:
            return d
    raise HTTPException(status_code=404, detail=f"Draft {draft_id} not found")


# ── Settings Endpoints ────────────────────────────────────────────────────────
ORG_SETTINGS = {
    "org_name": "Memorial Cancer & Clinical Research Institute",
    "irb_number": "IRB-2026-8841-A",
    "compliance_email": "compliance@memorial-cancer.org",
    "data_residency": "On-Premises Local Enclave",
    "retention_years": 7,
}

TEAM_MEMBERS = [
    {"id": "usr-1", "name": "Dr. Christopher Roberts", "email": "croberts@memorial-cancer.org", "role": "Coordinator", "joined": "2025-08-12"},
    {"id": "usr-2", "name": "Dr. Elena Vance", "email": "evance@memorial-cancer.org", "role": "Admin", "joined": "2025-01-10"},
    {"id": "usr-3", "name": "Marcus Chen, RN", "email": "mchen@memorial-cancer.org", "role": "Coordinator", "joined": "2025-11-04"},
    {"id": "usr-4", "name": "Sarah Jenkins", "email": "sjenkins@memorial-cancer.org", "role": "Viewer", "joined": "2026-02-18"},
]

@api_router.get("/settings/organization")
def get_org_settings():
    return ORG_SETTINGS


@api_router.post("/settings/organization")
def update_org_settings(payload: dict):
    ORG_SETTINGS.update(payload)
    return {"status": "ok", "settings": ORG_SETTINGS}


@api_router.get("/settings/team")
def get_team_members():
    return TEAM_MEMBERS
