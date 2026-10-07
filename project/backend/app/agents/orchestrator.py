"""Orchestrator Agent: coordinates the end-to-end recruitment screening pipeline."""

from .record_reader import normalize_patient
from .criteria_matcher import match_criteria
from .compliance import verify_compliance
from .disagreement_protocol import resolve_disagreement
from .outreach import draft_outreach

def run_recruitment_pipeline(patient_raw: dict, trial: dict) -> dict:
    # 1. Normalization
    profile = normalize_patient(
        subject_id=patient_raw.get("subject_id", ""),
        gender=patient_raw.get("gender", ""),
        age=patient_raw.get("age", 0),
        diagnoses=patient_raw.get("diagnoses", []),
        labs=patient_raw.get("labs", {}),
        medications=patient_raw.get("medications", []),
    )
    
    # 2. Criteria Evaluation
    matcher_res = match_criteria(profile, trial.get("criteria_rules", {}))
    
    # 3. Compliance & Safety Check
    compliance_res = verify_compliance(profile, trial.get("medicine", ""))
    
    # 4. Disagreement / Consensus Protocol
    consensus = resolve_disagreement(matcher_res, compliance_res)
    status = consensus.get("status")
    
    # 5. Conditional Outreach Draft
    outreach_res = None
    if status == "ELIGIBLE":
        outreach_res = draft_outreach(profile["subject_id"], trial.get("title", "Clinical Study"))
        
    return {
        "subject_id": profile["subject_id"],
        "trial_id": trial.get("id"),
        "status": status,
        "matcher": matcher_res,
        "compliance": compliance_res,
        "consensus": consensus,
        "outreach": outreach_res,
    }
