"""Orchestrator Agent: coordinates the end-to-end recruitment screening pipeline."""

from .record_reader import normalize_patient
from .criteria_matcher import match_criteria
from .compliance import verify_compliance
from .disagreement_protocol import resolve_disagreement
from .outreach import draft_outreach
from ..db.audit import log_audit_event

def run_recruitment_pipeline(patient_raw: dict, trial: dict) -> dict:
    sub_id = patient_raw.get("subject_id", "")
    trial_id = trial.get("id", "Trial")

    # 1. Normalization
    profile = normalize_patient(
        subject_id=sub_id,
        gender=patient_raw.get("gender", ""),
        age=patient_raw.get("age", 0),
        diagnoses=patient_raw.get("diagnoses", []),
        labs=patient_raw.get("labs", {}),
        medications=patient_raw.get("medications", []),
        vitals=patient_raw.get("vitals", {}),
        notes=patient_raw.get("profile", {}).get("notes", []),
    )
    log_audit_event("RecordReader", "NORMALIZE_EHR", sub_id, trial_id, {"age": profile["age"], "gender": profile["gender"]})
    
    # 2. Criteria Evaluation
    matcher_res = match_criteria(profile, trial.get("criteria_rules", {}))
    log_audit_event("CriteriaMatcher", "EVALUATE_CRITERIA", sub_id, trial_id, {
        "eligible": matcher_res.get("is_eligible"),
        "confidence": matcher_res.get("confidence"),
        "hard_exclusion": matcher_res.get("hard_exclusion_triggered"),
    })
    
    # 3. Compliance & Safety Check
    compliance_res = verify_compliance(profile, trial.get("medicine", ""))
    log_audit_event("ComplianceAgent", "AUDIT_SAFETY_CHECK", sub_id, trial_id, {
        "is_compliant": compliance_res.get("is_compliant"),
        "safety_score": compliance_res.get("safety_score"),
        "violations_count": len(compliance_res.get("violations", [])),
    })
    
    # 4. Disagreement / Consensus Protocol
    consensus = resolve_disagreement(matcher_res, compliance_res, patient=profile, trial=trial)
    status = consensus.get("status")
    log_audit_event("DisagreementProtocol", "RESOLVE_DISAGREEMENT", sub_id, trial_id, {
        "final_status": status,
        "rounds": consensus.get("rounds_executed", 1),
        "consensus": consensus.get("consensus"),
    })
    
    # 5. Conditional Outreach Draft
    outreach_res = None
    if status == "ELIGIBLE":
        outreach_res = draft_outreach(profile["subject_id"], trial.get("title", "Clinical Study"))
        log_audit_event("OutreachAgent", "GENERATE_DRAFT", sub_id, trial_id, {"language": "en"})
        
    return {
        "subject_id": profile["subject_id"],
        "trial_id": trial_id,
        "status": status,
        "matcher": matcher_res,
        "compliance": compliance_res,
        "consensus": consensus,
        "outreach": outreach_res,
    }
