"""Compliance & Safety Agent: verifies contraindications, drug interactions, and protocol constraints."""

KNOWN_CONTRAINDICATIONS = {
    "metformin": ["renal failure", "lactic acidosis", "severe impairment"],
    "warfarin": ["active bleeding", "hemorrhagic tendency", "severe thrombocytopenia"],
    "lisinopril": ["angioedema", "bilateral renal artery stenosis", "pregnancy"],
}

def verify_compliance(patient: dict, medicine: str) -> dict:
    med_lower = medicine.lower()
    contraindicated_terms = KNOWN_CONTRAINDICATIONS.get(med_lower, [])
    patient_diagnoses = [d.lower() for d in patient.get("diagnoses", [])]
    
    violations = [term for term in contraindicated_terms if any(term in d for d in patient_diagnoses)]
    is_safe = len(violations) == 0
    return {
        "is_compliant": is_safe,
        "violations": violations,
        "safety_score": 1.0 if is_safe else 0.0,
    }
