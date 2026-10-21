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

    # 6. Synthesize Multi-Agent Calibrated Decision Confidence
    total_criteria = max(matcher_res.get("criteria_evaluated", 1), 1)
    met = matcher_res.get("criteria_met", 0)
    failed = matcher_res.get("criteria_failed", 0)
    ml_prob = matcher_res.get("layers", {}).get("ml_scorer", {}).get("probability", 0.5)
    safety = compliance_res.get("safety_score", 1.0)

    if status == "ELIGIBLE":
        conf = round(0.88 + 0.08 * (met / total_criteria), 2)
        conf = min(0.98, max(0.86, conf))
    elif status == "REVIEW_REQUIRED":
        bline_details = [d for d in matcher_res.get("details", []) if d.get("status") == "BORDERLINE"]
        bline_avg = (sum(d.get("confidence", 0.70) for d in bline_details) / max(len(bline_details), 1)) if bline_details else 0.70
        raw_b = 0.40 * (met / total_criteria) + 0.30 * bline_avg + 0.15 * ml_prob + 0.15 * safety
        conf = round(0.58 + (raw_b * 0.22), 2)
        conf = min(0.79, max(0.60, conf))
    else:
        fail_sev = (failed / total_criteria) * 3.0
        safety_pen = 1.0 - safety
        ml_non = 1.0 - ml_prob
        hard_boost = 0.05 if matcher_res.get("hard_exclusion_triggered") else 0.0
        raw_i = 0.82 + (0.07 * min(fail_sev, 1.0)) + (0.05 * safety_pen) + (0.03 * ml_non) + hard_boost
        conf = round(min(0.98, max(0.82, raw_i)), 2)

    return {
        "subject_id": profile["subject_id"],
        "trial_id": trial_id,
        "status": status,
        "confidence": conf,
        "matcher": matcher_res,
        "compliance": compliance_res,
        "consensus": consensus,
        "outreach": outreach_res,
    }
