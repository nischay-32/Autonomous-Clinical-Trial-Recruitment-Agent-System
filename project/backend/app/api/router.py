"""Central API Router for Autonomous Clinical Trial Recruitment System."""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from ..agents.orchestrator import run_recruitment_pipeline

api_router = APIRouter()

DEMO_TRIALS = {
    "NCT00005143": {
        "id": "NCT00005143",
        "title": "Metformin Clinical Trial for Diabetes Management",
        "medicine": "metformin",
        "criteria_rules": {
            "min_age": 18,
            "max_age": 75,
            "required_icd9": ["250.00", "250.02"],
            "excluded_icd9": ["584.9"],  # Acute kidney failure
        },
    },
    "NCT00262600": {
        "id": "NCT00262600",
        "title": "Warfarin Anticoagulation Efficacy Protocol",
        "medicine": "warfarin",
        "criteria_rules": {
            "min_age": 21,
            "max_age": 85,
            "required_icd9": ["427.31"],  # Atrial fibrillation
            "excluded_icd9": ["459.0"],  # Hemorrhage
        },
    },
    "NCT00000560": {
        "id": "NCT00000560",
        "title": "Lisinopril Hypertension Assessment Protocol",
        "medicine": "lisinopril",
        "criteria_rules": {
            "min_age": 18,
            "max_age": 80,
            "required_icd9": ["401.9"],  # Hypertension
            "excluded_icd9": ["995.1"],  # Angioedema
        },
    },
}

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

@api_router.get("/health")
def health_check():
    return {"status": "ok", "service": "Autonomous Clinical Trial Recruitment Agent System"}

@api_router.get("/trials")
def list_trials():
    return list(DEMO_TRIALS.values())

@api_router.post("/screen")
def screen_patient(req: ScreenRequest):
    trial = DEMO_TRIALS.get(req.trial_id)
    if not trial:
        raise HTTPException(status_code=404, detail=f"Trial {req.trial_id} not found")
    result = run_recruitment_pipeline(req.patient.model_dump(), trial)
    return result

@api_router.post("/outreach/approve")
def approve_outreach(req: ApproveRequest):
    return {
        "patient_id": req.patient_id,
        "status": "APPROVED",
        "approved_by": req.coordinator_name,
        "comments": req.comments,
        "message": "Outreach dispatch queued successfully.",
    }
