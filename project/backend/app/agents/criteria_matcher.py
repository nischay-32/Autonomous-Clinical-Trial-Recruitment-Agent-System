"""Criteria Matcher Agent: evaluates patient profiles against trial eligibility criteria."""

def match_criteria(patient: dict, criteria: dict) -> dict:
    matched, reasons = True, []
    
    # Age criteria
    min_age = criteria.get("min_age", 18)
    max_age = criteria.get("max_age", 100)
    if not (min_age <= patient.get("age", 0) <= max_age):
        matched = False
        reasons.append(f"Age {patient.get('age')} outside allowable range [{min_age}-{max_age}]")

    # Required diagnoses (Inclusion)
    required_codes = criteria.get("required_icd9", [])
    patient_codes = set(patient.get("diagnoses", []))
    if required_codes and not any(c in patient_codes for c in required_codes):
        matched = False
        reasons.append(f"Missing required diagnosis in {required_codes}")

    # Excluded diagnoses (Exclusion)
    excluded_codes = criteria.get("excluded_icd9", [])
    hit_exclusions = [c for c in excluded_codes if c in patient_codes]
    if hit_exclusions:
        matched = False
        reasons.append(f"Present with excluded condition(s): {hit_exclusions}")

    confidence = 1.0 if not reasons else max(0.2, 1.0 - (len(reasons) * 0.25))
    return {
        "is_eligible": matched,
        "confidence": confidence,
        "reasons": reasons,
    }
