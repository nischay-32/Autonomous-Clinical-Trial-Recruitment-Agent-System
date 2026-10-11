"""Unit test suite for Phase 5: Disagreement Resolution Protocol, Compliance, and Audit Trails."""

from app.agents.compliance import verify_compliance, check_hipaa_deidentification
from app.agents.disagreement_protocol import resolve_disagreement
from app.agents.orchestrator import run_recruitment_pipeline
from app.db.audit import get_audit_trail, log_audit_event

def test_compliance_agent_safety_and_hipaa():
    # Safe patient
    p_safe = {
        "subject_id": "P-COMP-1",
        "diagnoses": ["250.00", "401.9"],
        "labs": {"egfr": 75.0, "creatinine": 0.9},
        "medications": ["Atorvastatin"],
        "profile": {"notes": ["Routine checkup."]},
    }
    res_safe = verify_compliance(p_safe, "metformin")
    assert res_safe["is_compliant"] is True
    assert res_safe["hipaa_compliant"] is True
    assert res_safe["safety_score"] == 1.0

    # Contraindicated patient
    p_contra = {
        "subject_id": "P-COMP-2",
        "diagnoses": ["severe renal failure", "lactic acidosis"],
        "labs": {"egfr": 22.0},
    }
    res_contra = verify_compliance(p_contra, "metformin")
    assert res_contra["is_compliant"] is False
    assert len(res_contra["violations"]) >= 2
    assert res_contra["safety_score"] < 0.50

    # HIPAA identifier leak detection
    p_hipaa_leak = {
        "subject_id": "P-COMP-3",
        "profile": {"notes": ["Patient contact SSN: 123-45-6789. Phone: 555-123-4567."]},
    }
    hipaa_ok, leaks = check_hipaa_deidentification(p_hipaa_leak)
    assert hipaa_ok is False
    assert len(leaks) == 2
    assert any("Social Security" in l for l in leaks)

def test_compliance_drug_interaction():
    p_interaction = {
        "subject_id": "P-COMP-4",
        "diagnoses": ["427.31"],
        "medications": ["Warfarin", "Amiodarone"],
    }
    res = verify_compliance(p_interaction, "warfarin")
    assert res["is_compliant"] is False
    assert any("Adverse Drug Interaction" in v for v in res["violations"])

def test_disagreement_round1_immediate_consensus():
    matcher = {"is_eligible": True, "confidence": 0.92, "is_borderline": False}
    compliance = {"is_compliant": True, "violations": []}
    res = resolve_disagreement(matcher, compliance)
    assert res["status"] == "ELIGIBLE"
    assert res["consensus"] is True
    assert res["rounds_executed"] == 1
    assert res["escalation_card"] is None

def test_disagreement_round1_safety_veto():
    matcher = {"is_eligible": True, "confidence": 0.90}
    compliance = {"is_compliant": False, "violations": ["Severe renal failure"]}
    res = resolve_disagreement(matcher, compliance)
    assert res["status"] == "INELIGIBLE"
    assert res["consensus"] is True
    assert res["rounds_executed"] == 1
    assert "Safety Veto" in res["rounds"][0]["decision"]

def test_disagreement_round2_rag_note_resolution():
    matcher = {
        "is_eligible": True,
        "confidence": 0.68,  # Borderline initial confidence
        "is_borderline": True,
        "grounded_evidence": [
            {
                "matched_text": "Confirming HbA1c 8.2% and good functional status.",
                "is_negated": False,
                "span": [10, 60],
            }
        ],
    }
    compliance = {"is_compliant": True, "violations": []}
    patient = {"subject_id": "P-RAG-01"}
    trial = {"id": "NCT00005143"}
    res = resolve_disagreement(matcher, compliance, patient=patient, trial=trial)
    assert res["status"] == "ELIGIBLE"
    assert res["consensus"] is True
    assert res["rounds_executed"] == 2
    assert "Consensus Reached via Note Grounding" in res["rounds"][1]["decision"]

def test_disagreement_round3_human_escalation_card():
    # Unresolved borderline case with ambiguous confidence and no validating note spans
    matcher = {
        "is_eligible": False,
        "confidence": 0.62,
        "is_borderline": True,
        "reasons": ["Borderline EF measurement 41%"],
        "grounded_evidence": [],
    }
    compliance = {"is_compliant": True, "violations": []}
    patient = {"subject_id": "P-ESC-99"}
    trial = {"id": "NCT00000560"}
    res = resolve_disagreement(matcher, compliance, patient=patient, trial=trial)
    assert res["status"] == "REVIEW_REQUIRED"
    assert res["consensus"] is False
    assert res["rounds_executed"] == 3
    assert res["escalation_card"] is not None
    
    card = res["escalation_card"]
    assert card["patient_id"] == "P-ESC-99"
    assert card["trial_id"] == "NCT00000560"
    assert "dispute_summary" in card
    assert "recommended_actions" in card
    assert len(card["recommended_actions"]) == 3

def test_immutable_audit_trail_logging():
    patient = {
        "subject_id": "P-AUDIT-TEST",
        "gender": "F",
        "age": 55,
        "diagnoses": ["250.00"],
        "labs": {"hba1c": 8.5, "glucose": 140, "egfr": 70},
        "vitals": {"bmi": 27, "sbp": 125},
    }
    trial = {
        "id": "NCT00005143",
        "title": "Type 2 Diabetes Mellitus Glycemic Management (Metformin)",
        "medicine": "Metformin",
        "criteria_rules": {
            "min_age": 30,
            "max_age": 70,
            "required_icd9": ["250.00"],
        },
    }
    result = run_recruitment_pipeline(patient, trial)
    assert result["status"] == "ELIGIBLE"

    trail = get_audit_trail(patient_id="P-AUDIT-TEST")
    assert len(trail) >= 4
    agent_names = [t["agent_name"] for t in trail]
    assert "RecordReader" in agent_names
    assert "CriteriaMatcher" in agent_names
    assert "ComplianceAgent" in agent_names
    assert "DisagreementProtocol" in agent_names
    assert "OutreachAgent" in agent_names
    for entry in trail:
        assert "timestamp" in entry
        assert "action" in entry
