from app.agents.record_reader import normalize_patient
from app.agents.criteria_matcher import match_criteria
from app.agents.compliance import verify_compliance
from app.agents.disagreement_protocol import resolve_disagreement
from app.agents.outreach import draft_outreach
from app.agents.orchestrator import run_recruitment_pipeline

def test_normalization():
    p = normalize_patient("P001", "F", 62, ["250.00"], {"HbA1c": 8.2}, ["Metformin"])
    assert p["subject_id"] == "P001"
    assert p["gender"] == "F"
    assert p["age"] == 62

def test_criteria_matcher_eligible():
    p = {"age": 55, "diagnoses": ["250.00"]}
    criteria = {"min_age": 18, "max_age": 75, "required_icd9": ["250.00"], "excluded_icd9": ["584.9"]}
    res = match_criteria(p, criteria)
    assert res["is_eligible"] is True
    assert res["confidence"] == 1.0

def test_criteria_matcher_ineligible():
    p = {"age": 80, "diagnoses": ["584.9"]}
    criteria = {"min_age": 18, "max_age": 75, "required_icd9": ["250.00"], "excluded_icd9": ["584.9"]}
    res = match_criteria(p, criteria)
    assert res["is_eligible"] is False
    assert len(res["reasons"]) > 0

def test_compliance_safe():
    p = {"diagnoses": ["250.00", "essential hypertension"]}
    res = verify_compliance(p, "metformin")
    assert res["is_compliant"] is True

def test_compliance_contraindicated():
    p = {"diagnoses": ["250.00", "severe renal failure"]}
    res = verify_compliance(p, "metformin")
    assert res["is_compliant"] is False
    assert "renal failure" in res["violations"]

def test_disagreement_protocol_consensus():
    matcher = {"is_eligible": True}
    compliance = {"is_compliant": True}
    res = resolve_disagreement(matcher, compliance)
    assert res["status"] == "ELIGIBLE"
    assert res["consensus"] is True

def test_disagreement_protocol_veto():
    matcher = {"is_eligible": True}
    compliance = {"is_compliant": False}
    res = resolve_disagreement(matcher, compliance)
    assert res["status"] == "INELIGIBLE"
    assert res["consensus"] is True

def test_pipeline_orchestrator():
    patient = {
        "subject_id": "PT-101",
        "gender": "M",
        "age": 58,
        "diagnoses": ["250.00"],
    }
    trial = {
        "id": "NCT00005143",
        "title": "Metformin Trial",
        "medicine": "metformin",
        "criteria_rules": {"min_age": 18, "max_age": 75, "required_icd9": ["250.00"]},
    }
    result = run_recruitment_pipeline(patient, trial)
    assert result["status"] == "ELIGIBLE"
    assert result["outreach"] is not None
    assert "Metformin Trial" in result["outreach"]["draft_content"]
