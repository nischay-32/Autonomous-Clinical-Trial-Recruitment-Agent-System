"""Compliance & Safety Agent: verifies contraindications, drug interactions, and HIPAA boundaries."""

import re
from ..db.audit import log_audit_event, get_audit_trail

KNOWN_CONTRAINDICATIONS = {
    "metformin": {
        "diagnoses": ["renal failure", "lactic acidosis", "severe impairment", "cirrhosis", "ketoacidosis", "esrd"],
        "lab_limits": {"egfr": ("<", 30.0), "creatinine": (">", 1.7)},
        "forbidden_drugs": ["contrast"],
    },
    "warfarin": {
        "diagnoses": ["active bleeding", "hemorrhagic tendency", "severe thrombocytopenia", "gastrointestinal bleed", "intracranial hemorrhage"],
        "lab_limits": {"platelets": ("<", 50000.0), "inr": (">", 2.5)},
        "forbidden_drugs": ["amiodarone", "fluconazole", "rifampin"],
    },
    "lisinopril": {
        "diagnoses": ["angioedema", "bilateral renal artery stenosis", "pregnancy", "aortic stenosis"],
        "lab_limits": {"potassium": (">", 5.5), "creatinine": (">", 3.0), "sbp": ("<", 90.0)},
        "forbidden_drugs": ["aliskiren"],
    },
}

def check_hipaa_deidentification(patient: dict) -> tuple[bool, list[str]]:
    """Verifies that patient records adhere to HIPAA Safe Harbor de-identification rules."""
    violations = []
    text_corpus = " ".join([
        str(patient.get("subject_id", "")),
        " ".join(patient.get("diagnoses", [])),
        " ".join(patient.get("profile", {}).get("notes", []) or []),
    ])
    
    # Check for unmasked SSNs
    if re.search(r"\b\d{3}-\d{2}-\d{4}\b", text_corpus):
        violations.append("Direct Identifier: Unmasked Social Security Number detected")
    # Check for unmasked 10-digit phone numbers
    if re.search(r"\b\d{3}[-.\s]\d{3}[-.\s]\d{4}\b", text_corpus):
        violations.append("Direct Identifier: Unmasked Phone Number detected")
        
    return (len(violations) == 0, violations)

def verify_compliance(patient: dict, medicine: str) -> dict:
    """Verifies drug-specific contraindications, vital safety thresholds, and HIPAA guidelines."""
    med_lower = medicine.lower()
    rules = KNOWN_CONTRAINDICATIONS.get(med_lower, {})
    contraindicated_terms = rules.get("diagnoses", [])
    patient_diagnoses = [str(d).lower() for d in patient.get("diagnoses", [])]
    
    violations = []
    
    # 1. Diagnostic contraindications
    for term in contraindicated_terms:
        if any(term in d for d in patient_diagnoses):
            violations.append(term)

    # 2. Lab & vital boundary checks
    labs = {k.lower(): v for k, v in patient.get("labs", {}).items()}
    vitals = {k.lower(): v for k, v in patient.get("vitals", {}).items()}
    all_metrics = {**labs, **vitals}
    
    for metric, (op, cutoff) in rules.get("lab_limits", {}).items():
        val = all_metrics.get(metric)
        if val is not None:
            if op == "<" and val < cutoff:
                violations.append(f"Safety threshold violation: {metric.upper()} {val} < {cutoff}")
            elif op == ">" and val > cutoff:
                violations.append(f"Safety threshold violation: {metric.upper()} {val} > {cutoff}")

    # 3. Drug-Drug Interactions
    meds = [str(m).lower() for m in patient.get("medications", [])]
    for drug in rules.get("forbidden_drugs", []):
        if any(drug in m for m in meds):
            violations.append(f"Adverse Drug Interaction: active prescription of {drug}")

    # 4. HIPAA Check
    hipaa_ok, hipaa_violations = check_hipaa_deidentification(patient)
    violations.extend(hipaa_violations)

    is_safe = (len(violations) == 0)
    safety_score = 1.0 if is_safe else max(0.0, 1.0 - (len(violations) * 0.35))

    return {
        "is_compliant": is_safe,
        "violations": violations,
        "safety_score": round(safety_score, 2),
        "hipaa_compliant": hipaa_ok,
        "protocol_clearance": is_safe and hipaa_ok,
    }


# Backwards compatibility alias
ComplianceSafetyAuditor = verify_compliance
