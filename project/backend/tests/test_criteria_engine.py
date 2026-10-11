"""Unit test suite for Phase 2: Criteria Engine and Rule Evaluation."""

import json
from pathlib import Path
from app.agents.criteria_matcher import match_criteria
from app.agents.orchestrator import run_recruitment_pipeline

RULES_FILE = Path(__file__).resolve().parents[1] / "app" / "db" / "trials_criteria_v1.json"

def get_trial_rules(trial_id: str) -> dict:
    with open(RULES_FILE, "r", encoding="utf-8") as f:
        return json.load(f)[trial_id]

def test_versioned_rules_presence():
    assert RULES_FILE.exists(), "trials_criteria_v1.json must exist"
    with open(RULES_FILE, "r", encoding="utf-8") as f:
        data = json.load(f)
    assert "NCT00005143" in data  # Metformin
    assert "NCT00262600" in data  # Warfarin
    assert "NCT00000560" in data  # Lisinopril
    
    met = data["NCT00005143"]
    assert met["total_criteria"] == 28
    assert met["inclusion_count"] == 15
    assert met["exclusion_count"] == 13

def test_metformin_fully_eligible():
    trial = get_trial_rules("NCT00005143")
    patient = {
        "subject_id": "P-MET-001",
        "gender": "F",
        "age": 55,
        "diagnoses": ["250.00", "401.9"],  # T2DM, HTN
        "labs": {
            "hba1c": 8.5,
            "glucose": 145,
            "egfr": 72,
            "creatinine": 1.1,
        },
        "vitals": {
            "bmi": 28.5,
            "sbp": 130,
        },
        "medications": ["atorvastatin"],
        "profile": {"notes": ["Patient signed informed consent. Understands dietary plan."]},
    }
    res = match_criteria(patient, trial)
    assert res["is_eligible"] is True
    assert res["hard_exclusion_triggered"] is False
    assert res["confidence"] >= 0.85
    assert res["criteria_met"] > 20

def test_metformin_hard_exclusion_renal():
    trial = get_trial_rules("NCT00005143")
    patient = {
        "subject_id": "P-MET-002",
        "gender": "M",
        "age": 60,
        "diagnoses": ["250.00", "585.5"],  # T2DM, ESRD
        "labs": {
            "hba1c": 8.2,
            "egfr": 22.0,  # Below hard exclusion cutoff (<30)
        },
    }
    res = match_criteria(patient, trial)
    assert res["is_eligible"] is False
    assert res["hard_exclusion_triggered"] is True
    assert res["confidence"] == 0.0
    assert any("HARD EXCLUSION" in r for r in res["reasons"])

def test_warfarin_stroke_risk_eligible():
    trial = get_trial_rules("NCT00262600")
    patient = {
        "subject_id": "P-WAR-001",
        "gender": "M",
        "age": 72,
        "diagnoses": ["427.31", "401.1"],  # Atrial Fibrillation, HTN
        "labs": {
            "inr": 1.2,
            "platelets": 220000,
        },
        "vitals": {"sbp": 138},
        "medications": ["metoprolol"],
    }
    res = match_criteria(patient, trial)
    assert res["is_eligible"] is True
    assert res["hard_exclusion_triggered"] is False

def test_lisinopril_angioedema_exclusion():
    trial = get_trial_rules("NCT00000560")
    patient = {
        "subject_id": "P-LIS-001",
        "gender": "F",
        "age": 62,
        "diagnoses": ["428.0", "995.1"],  # Heart failure + Angioedema history
        "labs": {
            "potassium": 4.5,
            "creatinine": 1.2,
            "sodium": 138,
        },
        "vitals": {"sbp": 120},
    }
    res = match_criteria(patient, trial)
    assert res["is_eligible"] is False
    assert res["hard_exclusion_triggered"] is True

def test_pipeline_integration_with_versioned_rules():
    trial_data = get_trial_rules("NCT00005143")
    trial_obj = {
        "id": trial_data["trial_id"],
        "title": trial_data["title"],
        "medicine": trial_data["medicine"],
        "criteria_rules": trial_data,
    }
    patient = {
        "subject_id": "P-PIPE-100",
        "gender": "F",
        "age": 52,
        "diagnoses": ["250.00"],
        "labs": {"hba1c": 8.0, "egfr": 70},
        "vitals": {"bmi": 29},
        "profile": {"notes": ["Informed consent obtained."]},
    }
    res = run_recruitment_pipeline(patient, trial_obj)
    assert res["subject_id"] == "P-PIPE-100"
    assert res["status"] == "ELIGIBLE"
    assert res["outreach"] is not None
    assert "Type 2 Diabetes" in res["outreach"]["draft_content"]
