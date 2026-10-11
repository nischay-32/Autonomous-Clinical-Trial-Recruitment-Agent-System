"""Unit test suite for Phase 3: Patient Normalization, Entity Extraction, and FHIR Mapping."""

from app.agents.record_reader import (
    normalize_patient,
    extract_clinical_entities,
    calculate_egfr,
    to_fhir_bundle,
)
from app.db.loaders import load_mimic_cohort
from app.agents.orchestrator import run_recruitment_pipeline

def test_normalize_patient_basics():
    p = normalize_patient(
        subject_id="P-001",
        gender="f",
        age=58,
        diagnoses=["250.00", "401.9"],
        labs={"glucose": 140, "creatinine": 1.0},
        medications=["Metformin", "Atorvastatin"],
    )
    assert p["subject_id"] == "P-001"
    assert p["gender"] == "F"
    assert p["age"] == 58
    assert len(p["diagnoses"]) == 2
    assert "glucose" in p["labs"]
    # Check automatic eGFR derivation
    assert "egfr" in p["labs"]
    assert p["labs"]["egfr"] > 50

def test_ckd_epi_egfr_calculation():
    # Female, age 60, creatinine 1.0
    egfr_f = calculate_egfr(1.0, 60, "F")
    assert 55.0 <= egfr_f <= 75.0
    # Male, age 60, creatinine 1.0
    egfr_m = calculate_egfr(1.0, 60, "M")
    assert 70.0 <= egfr_m <= 90.0
    # High creatinine (renal failure)
    egfr_renal = calculate_egfr(3.5, 70, "F")
    assert egfr_renal < 20.0

def test_clinical_entity_extraction_and_negations():
    note = (
        "Patient presents with Type 2 Diabetes Mellitus and hypertension. "
        "No history of heart failure. Denies alcohol abuse or tobacco use. "
        "Laboratory values: HbA1c 8.2%, Creatinine 1.1 mg/dL, Ejection Fraction 45%. "
        "Current medications include Lisinopril and Metformin."
    )
    entities = extract_clinical_entities(note)
    
    # Conditions
    cond_names = [c["condition"] for c in entities["conditions"]]
    assert "type 2 diabetes" in cond_names
    assert "heart failure" in cond_names
    
    # Negations check
    hf_entity = next(c for c in entities["conditions"] if c["condition"] == "heart failure")
    assert hf_entity["negated"] is True
    assert len(entities["negations"]) >= 2
    
    # Labs extracted from text
    assert entities["labs"].get("hba1c") == 8.2
    assert entities["labs"].get("creatinine") == 1.1
    assert entities["labs"].get("ef") == 45.0
    
    # Medications
    assert "lisinopril" in entities["medications"]
    assert "metformin" in entities["medications"]

def test_fhir_r4_bundle_serialization():
    p = normalize_patient(
        subject_id="P-FHIR-99",
        gender="M",
        age=64,
        diagnoses=["428.0", "401.1"],
        labs={"potassium": 4.2, "sodium": 139},
        medications=["Furosemide"],
    )
    bundle = to_fhir_bundle(p)
    assert bundle["resourceType"] == "Bundle"
    assert bundle["type"] == "collection"
    assert bundle["total"] == len(bundle["entry"])
    
    # Check resource types
    resource_types = [e["resource"]["resourceType"] for e in bundle["entry"]]
    assert "Patient" in resource_types
    assert "Condition" in resource_types
    assert "Observation" in resource_types
    assert "MedicationStatement" in resource_types

def test_mimic_cohort_loading():
    cohort = load_mimic_cohort(limit=10)
    assert len(cohort) == 10
    
    # Check real subject 10006 from MIMIC-III demo
    p10006 = next((x for x in cohort if x["subject_id"] == "10006"), None)
    assert p10006 is not None
    assert p10006["age"] == 70
    assert p10006["gender"] == "F"
    assert len(p10006["diagnoses"]) > 0
    assert len(p10006["labs"]) > 0

def test_end_to_end_orchestrator_pipeline_flow():
    p = normalize_patient(
        subject_id="P-E2E-001",
        gender="M",
        age=52,
        diagnoses=["250.00"],
        labs={"hba1c": 8.0, "glucose": 140, "creatinine": 1.0},
        medications=["atorvastatin"],
    )
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
    result = run_recruitment_pipeline(p, trial)
    assert result["status"] == "ELIGIBLE"
    assert result["subject_id"] == "P-E2E-001"
    assert result["outreach"] is not None
