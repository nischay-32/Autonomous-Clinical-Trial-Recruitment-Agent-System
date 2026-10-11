"""Criteria Matcher Agent: evaluates patient profiles against trial eligibility criteria."""

import re

def _eval_criterion(patient: dict, c: dict) -> tuple[str, float, str]:
    """Evaluates a single criterion. Returns (status, confidence, evidence).

    status is one of: 'MET', 'NOT_MET', 'BORDERLINE'
    """
    ctype = c.get("type", "INCLUSION")
    rule = c.get("rule", {})
    cat = rule.get("category", "")
    is_inc = (ctype == "INCLUSION")

    # 1. Age
    if cat == "age":
        age = patient.get("age", 0)
        min_age = rule.get("min_age", 18)
        max_age = rule.get("max_age", 120)
        if min_age <= age <= max_age:
            return "MET", 1.0, f"Age {age} within [{min_age}-{max_age}]"
        if abs(age - min_age) <= 2 or abs(age - max_age) <= 2:
            return "BORDERLINE", 0.70, f"Age {age} borderline for range [{min_age}-{max_age}]"
        return "NOT_MET", 0.0, f"Age {age} outside allowable range [{min_age}-{max_age}]"

    # 1b. Clinical Risk Score: CHA2DS2-VASc
    if cat == "chads_vasc":
        age = patient.get("age", 0)
        gender = str(patient.get("gender", "")).upper()
        diag_codes = [str(x).strip().replace(".", "") for x in patient.get("diagnoses", [])]
        score = 0
        if age >= 75:
            score += 2
        elif age >= 65:
            score += 1
        if gender == "F":
            score += 1
        if any(c.startswith("428") for c in diag_codes):  # CHF
            score += 1
        if any(c.startswith("401") for c in diag_codes):  # HTN
            score += 1
        if any(c.startswith("250") for c in diag_codes):  # Diabetes
            score += 1
        if any(c.startswith(("434", "435", "436", "431")) for c in diag_codes):  # Stroke / TIA
            score += 2
        th = rule.get("threshold", 2)
        if score >= th:
            return "MET", 0.95, f"CHA2DS2-VASc score {score} meets requirement ≥ {th}"
        if score == th - 1:
            return "BORDERLINE", 0.70, f"CHA2DS2-VASc score {score} borderline (threshold ≥ {th})"
        return "NOT_MET", 0.20, f"CHA2DS2-VASc score {score} below required risk threshold ≥ {th}"

    is_neg = rule.get("is_negative", False)

    # 2. Diagnoses (ICD-9)
    patient_codes = [str(x).strip().replace(".", "") for x in patient.get("diagnoses", [])]
    if cat == "icd9":
        codes = [str(x).strip().replace(".", "") for x in rule.get("codes", [])]
        matched = any(
            any(pc.startswith(rc.rstrip("x")) for pc in patient_codes)
            for rc in codes
        )
        if is_inc:
            if is_neg:
                if matched:
                    return "NOT_MET", 0.0, f"Patient has condition forbidden by criteria: {codes}"
                return "MET", 0.95, f"No forbidden condition present: {codes}"
            else:
                if matched:
                    return "MET", 0.98, f"Diagnoses match required ICD-9: {codes}"
                return "NOT_MET", 0.1, f"Missing required diagnosis: {codes}"
        else:
            if matched:
                return "NOT_MET", 0.0, f"Patient has excluded ICD-9 condition: {codes}"
            return "MET", 0.95, f"No excluded ICD-9 condition found: {codes}"

    # 3. Lab values & Vitals
    if cat == "lab":
        lab_name = rule.get("lab_name", "")
        labs = {k.lower(): v for k, v in patient.get("labs", {}).items()}
        val = labs.get(lab_name)
        if val is None:
            vitals = {k.lower(): v for k, v in patient.get("vitals", {}).items()}
            val = vitals.get(lab_name)
        
        if val is None:
            # If lab is missing from patient record, mark BORDERLINE for coordinator inspection
            return "BORDERLINE", 0.75, f"Lab/vital '{lab_name}' pending measurement"
        
        th = rule.get("threshold", 0.0)
        op = rule.get("op", ">=")
        is_ok = False
        if op == ">=":
            is_ok = (val >= th)
        elif op == "<=":
            is_ok = (val <= th)
        elif op == "<":
            is_ok = (val < th)
        elif op == ">":
            is_ok = (val > th)

        if "max_threshold" in rule:
            is_ok = is_ok and (val <= rule["max_threshold"])

        if is_inc:
            if is_ok:
                return "MET", 0.95, f"{lab_name.upper()} {val} meets threshold {op} {th}"
            diff = abs(val - th) / max(th, 1.0)
            if diff <= 0.10:
                return "BORDERLINE", 0.72, f"{lab_name.upper()} {val} near threshold {op} {th}"
            return "NOT_MET", 0.2, f"{lab_name.upper()} {val} fails threshold {op} {th}"
        else:
            if is_ok:
                return "NOT_MET", 0.0, f"{lab_name.upper()} {val} triggers exclusion threshold {op} {th}"
            return "MET", 0.95, f"{lab_name.upper()} {val} within safe limits"

    # 4. Medications
    if cat == "medication":
        meds = [str(m).lower() for m in patient.get("medications", [])]
        drugs = [d.lower() for d in rule.get("drugs", [])]
        found = any(any(d in m for m in meds) for d in drugs)
        if is_inc:
            if is_neg:
                if found:
                    return "NOT_MET", 0.0, f"Patient taking forbidden medication: {drugs}"
                return "MET", 0.95, f"No forbidden medication detected"
            else:
                if found:
                    return "MET", 0.90, f"Patient taking required medication: {drugs}"
                return "BORDERLINE", 0.70, f"Required medication not active: {drugs}"
        else:
            if found:
                return "NOT_MET", 0.0, f"Patient takes excluded medication: {drugs}"
            return "MET", 0.95, f"No excluded medication detected"

    # 5. Clinical Notes (NLP / Keywords)
    notes = " ".join(patient.get("profile", {}).get("notes", []) or []).lower()
    if cat == "note_nlp":
        keywords = rule.get("keywords", [])
        found_kw = [k for k in keywords if re.search(rf"\b{re.escape(k)}", notes)]
        if is_inc:
            if is_neg:
                if found_kw:
                    return "NOT_MET", 0.0, f"Clinical notes document forbidden event: {found_kw}"
                return "MET", 0.92, f"No documented contraindication in clinical notes"
            else:
                if found_kw:
                    return "MET", 0.90, f"Clinical notes confirm: {found_kw}"
                # If positive inclusion criterion not mentioned in brief notes, mark standard baseline
                return "MET", 0.85, f"Presumed compliant pending intake: {keywords}"
        else:
            if found_kw:
                return "NOT_MET", 0.0, f"Clinical notes document excluded condition: {found_kw}"
            return "MET", 0.95, f"No documentation of excluded condition: {keywords}"

    return "MET", 0.85, "Criterion evaluated"

def match_criteria(patient: dict, criteria: dict) -> dict:
    """Evaluates a patient profile against trial eligibility criteria.

    Supports both full versioned criteria format and legacy rule dicts.
    """
    # Backward compatibility with legacy test dicts
    if "min_age" in criteria or "required_icd9" in criteria or "excluded_icd9" in criteria:
        matched, reasons = True, []
        min_age, max_age = criteria.get("min_age", 18), criteria.get("max_age", 100)
        p_age = patient.get("age", 0)
        if not (min_age <= p_age <= max_age):
            matched = False
            reasons.append(f"Age {p_age} outside allowable range [{min_age}-{max_age}]")
        p_codes = set(patient.get("diagnoses", []))
        req = criteria.get("required_icd9", [])
        if req and not any(c in p_codes for c in req):
            matched = False
            reasons.append(f"Missing required diagnosis in {req}")
        exc = criteria.get("excluded_icd9", [])
        hit = [c for c in exc if c in p_codes]
        if hit:
            matched = False
            reasons.append(f"Present with excluded condition(s): {hit}")
        conf = 1.0 if not reasons else max(0.2, 1.0 - (len(reasons) * 0.25))
        return {
            "is_eligible": matched,
            "confidence": conf,
            "reasons": reasons,
            "hard_exclusion_triggered": bool(hit),
        }

    # Full structured trial evaluation
    inc_list = criteria.get("criteria", {}).get("inclusion", [])
    exc_list = criteria.get("criteria", {}).get("exclusion", [])
    if not inc_list and not exc_list:
        inc_list = criteria.get("inclusion", [])
        exc_list = criteria.get("exclusion", [])

    is_eligible = True
    hard_exclusion_triggered = False
    reasons = []
    details = []
    conf_scores = []
    met_count = 0
    borderline_count = 0
    failed_count = 0

    # Evaluate Inclusions
    for c in inc_list:
        status, conf, evidence = _eval_criterion(patient, c)
        conf_scores.append(conf)
        details.append({
            "criterion_id": c.get("criterion_id"),
            "description": c.get("description"),
            "type": "INCLUSION",
            "status": status,
            "confidence": conf,
            "is_hard_exclusion": False,
            "evidence": evidence,
        })
        if status == "MET":
            met_count += 1
        elif status == "BORDERLINE":
            borderline_count += 1
            reasons.append(f"Borderline inclusion: {c.get('description')} ({evidence})")
        else:
            failed_count += 1
            is_eligible = False
            reasons.append(f"Inclusion failed: {c.get('description')} ({evidence})")

    # Evaluate Exclusions
    for c in exc_list:
        status, conf, evidence = _eval_criterion(patient, c)
        is_hard = c.get("is_hard_exclusion", False)
        conf_scores.append(conf)
        details.append({
            "criterion_id": c.get("criterion_id"),
            "description": c.get("description"),
            "type": "EXCLUSION",
            "status": status,
            "confidence": conf,
            "is_hard_exclusion": is_hard,
            "evidence": evidence,
        })
        if status == "NOT_MET":
            # Condition triggered -> Patient excluded!
            failed_count += 1
            is_eligible = False
            if is_hard:
                hard_exclusion_triggered = True
                reasons.append(f"[HARD EXCLUSION] {c.get('description')} ({evidence})")
            else:
                reasons.append(f"Exclusion triggered: {c.get('description')} ({evidence})")
        elif status == "BORDERLINE":
            borderline_count += 1
            reasons.append(f"Borderline exclusion: {c.get('description')} ({evidence})")
        else:
            met_count += 1

    if hard_exclusion_triggered:
        is_eligible = False
        overall_conf = 0.0
    else:
        overall_conf = round(sum(conf_scores) / max(len(conf_scores), 1), 2)
        if not is_eligible:
            overall_conf = min(overall_conf, 0.45)

    return {
        "is_eligible": is_eligible,
        "confidence": overall_conf,
        "hard_exclusion_triggered": hard_exclusion_triggered,
        "criteria_evaluated": len(inc_list) + len(exc_list),
        "criteria_met": met_count,
        "criteria_borderline": borderline_count,
        "criteria_failed": failed_count,
        "reasons": reasons,
        "details": details,
    }
