"""Central API Router for Autonomous Clinical Trial Recruitment System."""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from ..agents.orchestrator import run_recruitment_pipeline
from ..agents.reporting import generate_report
from ..agents.outreach import SUPPORTED_LANGUAGES
from ..db.audit import get_audit_trail

import json
from pathlib import Path

api_router = APIRouter()

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
    _SCREENING_HISTORY.append(result)   # store for reporting
    return result


# ── Outreach ──────────────────────────────────────────────────────────────────

@api_router.get("/outreach/languages")
def list_languages():
    return {"supported_languages": SUPPORTED_LANGUAGES}


@api_router.post("/outreach/approve")
def approve_outreach(req: ApproveRequest):
    return {
        "patient_id": req.patient_id,
        "status": "APPROVED",
        "approved_by": req.coordinator_name,
        "comments": req.comments,
        "message": "Outreach dispatch queued successfully.",
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
