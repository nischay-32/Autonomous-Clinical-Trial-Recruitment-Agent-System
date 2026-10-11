"""Unit test suite for Phase 4: Hybrid ML & Semantic Criteria Matcher Engine."""

from app.agents.criteria_matcher.deterministic import evaluate_deterministic_rules
from app.agents.criteria_matcher.ml_scorer import score_patient_ml, extract_patient_features
from app.agents.criteria_matcher.nlp_scorer import score_notes_nlp
from app.agents.criteria_matcher.ensemble import aggregate_hybrid_scoring
from app.db.loaders import load_mimic_cohort
from app.db.criteria_parser import parse_criteria_excel
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parents[3]
EXCEL_PATH = BASE_DIR / "Documents" / "Drug_Criteria_Full_40plus_CI_PR_13.xlsx"

def get_parsed_trials():
    return parse_criteria_excel(str(EXCEL_PATH))

def test_layer1_deterministic_evaluation():
    trials = get_parsed_trials()
    metformin_trial = trials["NCT00005143"]
    patient = {
        "subject_id": "P-DET-1",
        "gender": "F",
        "age": 50,
        "diagnoses": ["250.00"],
        "labs": {"hba1c": 8.0, "glucose": 140, "egfr": 70, "creatinine": 1.0},
        "vitals": {"bmi": 28, "sbp": 125},
    }
    res = evaluate_deterministic_rules(patient, metformin_trial)
    assert res["is_eligible"] is True
    assert res["hard_exclusion_triggered"] is False
    assert len(res["details"]) > 0
    assert res["criteria_met"] > 20

def test_layer2_ml_scoring_and_shap_contributions():
    patient = {
        "subject_id": "P-ML-1",
        "gender": "M",
        "age": 55,
        "diagnoses": ["250.00", "401.9"],
        "labs": {
            "egfr": 80.0,
            "creatinine": 0.9,
            "hba1c": 8.2,
            "glucose": 150.0,
            "potassium": 4.1,
            "sodium": 140.0,
            "platelets": 230000.0,
            "inr": 1.0,
        },
        "medications": ["Metformin", "Lisinopril"],
    }
    feats = extract_patient_features(patient)
    assert len(feats) == 13

    ml_res = score_patient_ml(patient, "Metformin Trial")
    assert "ml_probability" in ml_res
    assert 0.0 <= ml_res["ml_probability"] <= 1.0
    assert "feature_contributions" in ml_res
    assert len(ml_res["feature_contributions"]) == 13
    assert len(ml_res["top_positive_factors"]) > 0

def test_layer3_nlp_semantic_and_grounded_evidence():
    patient = {
        "subject_id": "P-NLP-1",
        "profile": {
            "notes": [
                "Assessment: Patient with uncontrolled type 2 diabetes mellitus. "
                "Ejection fraction 38% noted on echocardiogram. "
                "No history of angioedema or cirrhosis. Informed consent obtained."
            ]
        },
    }
    criteria_list = [
        {"criterion_id": "C-01", "description": "Type 2 diabetes confirmed", "rule": {"is_negative": False}},
        {"criterion_id": "C-02", "description": "Ejection fraction < 40%", "rule": {"is_negative": False}},
        {"criterion_id": "C-03", "description": "No history of angioedema", "rule": {"is_negative": True}},
    ]
    nlp_res = score_notes_nlp(patient, criteria_list)
    assert nlp_res["nlp_score"] > 0.80
    assert len(nlp_res["grounded_evidence"]) >= 2
    # Check grounded span format
    first_ev = nlp_res["grounded_evidence"][0]
    assert "matched_text" in first_ev
    assert "span" in first_ev
    assert len(first_ev["span"]) == 2

def test_layer4_ensemble_aggregation_high_confidence():
    trials = get_parsed_trials()
    met_trial = trials["NCT00005143"]
    patient = {
        "subject_id": "P-ENS-1",
        "gender": "F",
        "age": 52,
        "diagnoses": ["250.00"],
        "labs": {"hba1c": 8.5, "glucose": 145, "egfr": 75, "creatinine": 0.9},
        "vitals": {"bmi": 27.5, "sbp": 128},
        "medications": ["Atorvastatin"],
        "profile": {"notes": ["Informed consent verified. Diabetic diet advised."]},
    }
    res = aggregate_hybrid_scoring(patient, met_trial)
    assert res["is_eligible"] is True
    assert res["hard_exclusion_triggered"] is False
    assert res["confidence"] >= 0.80
    assert "layers" in res
    assert "shap_explainability" in res
    assert res["layers"]["deterministic"]["eligible"] is True
    assert res["layers"]["ml_scorer"]["probability"] > 0.0

def test_layer4_hard_exclusion_safety_override():
    trials = get_parsed_trials()
    met_trial = trials["NCT00005143"]
    # Patient with severe renal failure (eGFR 20) -> hard exclusion
    patient = {
        "subject_id": "P-ENS-FAIL",
        "gender": "M",
        "age": 60,
        "diagnoses": ["250.00", "585.5"],
        "labs": {"hba1c": 8.5, "egfr": 20.0, "creatinine": 3.2},
    }
    res = aggregate_hybrid_scoring(patient, met_trial)
    assert res["is_eligible"] is False
    assert res["hard_exclusion_triggered"] is True
    assert res["confidence"] == 0.0
    assert any("HARD EXCLUSION" in r for r in res["reasons"])

def test_real_mimic_cohort_hybrid_screening():
    cohort = load_mimic_cohort(limit=5)
    trials = get_parsed_trials()
    warfarin_trial = trials["NCT00262600"]
    p = cohort[0]  # Subject 10006
    res = aggregate_hybrid_scoring(p, warfarin_trial)
    assert "layers" in res
    assert "shap_explainability" in res
    assert isinstance(res["confidence"], float)
