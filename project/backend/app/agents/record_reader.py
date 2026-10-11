"""Record Reader Agent: normalizes clinical profiles into structured patient records,

extracts grounded clinical entities, and exports standard FHIR R4 bundles.
"""

import re
from datetime import datetime, timezone

# Common Lab ITEMID mappings in MIMIC-III
MIMIC_LAB_MAP = {
    "50852": "hba1c",
    "50931": "glucose",
    "50912": "creatinine",
    "50971": "potassium",
    "50983": "sodium",
    "51265": "platelets",
    "51237": "inr",
    "51222": "hemoglobin",
    "50861": "alt",
    "50878": "ast",
    "50963": "bnp",
}

def calculate_egfr(creatinine: float, age: int, gender: str) -> float:
    """Calculates estimated Glomerular Filtration Rate (eGFR) using CKD-EPI formula."""
    if not creatinine or creatinine <= 0 or not age or age <= 0:
        return 0.0
    is_female = (str(gender).upper() == "F" or str(gender).upper() == "FEMALE")
    k = 0.7 if is_female else 0.9
    alpha = -0.329 if is_female else -0.411
    scr_ratio = creatinine / k
    egfr = 141.0 * (min(scr_ratio, 1.0) ** alpha) * (max(scr_ratio, 1.0) ** -1.209) * (0.993 ** age)
    if is_female:
        egfr *= 1.018
    return round(egfr, 1)

def extract_clinical_entities(notes: str | list[str]) -> dict:
    """Extracts grounded clinical entities and negations from unstructured clinical notes.

    Returns dict containing detected conditions, lab values, medications, and negation spans.
    """
    if isinstance(notes, list):
        text = "\n".join(str(n) for n in notes)
    else:
        text = str(notes or "")

    entities = {
        "conditions": [],
        "labs": {},
        "medications": [],
        "negations": [],
        "spans": [],
    }
    if not text.strip():
        return entities

    lower_text = text.lower()

    # 1. Negation detection spans (e.g., 'no evidence of', 'denies', 'without', 'negative for')
    neg_regex = re.compile(r"\b(no\s+history\s+of|no\s+evidence\s+of|no|denies|denied|without|negative\s+for)\s+([a-z0-9\s,\-]+?)(?=[\.\;\,\n]|\band\b|$)", re.IGNORECASE)
    for m in neg_regex.finditer(text):
        trigger = m.group(1).strip()
        concept = m.group(2).strip()
        if concept:
            entities["negations"].append({
                "trigger": trigger,
                "concept": concept,
                "span": [m.start(), m.end()],
                "snippet": m.group(0),
            })

    # 2. Key Conditions
    condition_patterns = [
        ("sepsis", r"\bsepsis\b"),
        ("type 2 diabetes", r"\b(type\s*2\s*diabetes|t2dm|diabetes\s*mellitus)\b"),
        ("atrial fibrillation", r"\b(atrial\s*fibrillation|afib|a-fib)\b"),
        ("heart failure", r"\b(heart\s*failure|chf|congestive\s*heart\s*failure)\b"),
        ("angioedema", r"\bangioedema\b"),
        ("cirrhosis", r"\bcirrhosis\b"),
        ("hypertension", r"\b(hypertension|htn)\b"),
        ("kidney disease", r"\b(chronic\s*kidney\s*disease|ckd|renal\s*impairment)\b"),
        ("asthma", r"\basthma\b"),
        ("copd", r"\bcopd\b"),
    ]
    for name, pattern in condition_patterns:
        match = re.search(pattern, lower_text)
        if match:
            # Check if condition is negated
            is_negated = any(name in n["concept"].lower() for n in entities["negations"])
            entities["conditions"].append({
                "condition": name,
                "negated": is_negated,
                "span": [match.start(), match.end()],
            })

    # 3. Numeric Lab & Vital values in text
    lab_patterns = [
        ("hba1c", r"\b(?:hba1c|a1c)[\s\:\=]+([\d\.]+)\s*\%?", 1),
        ("glucose", r"\b(?:glucose|blood\s*sugar)[\s\:\=]+([\d\.]+)\s*(?:mg\/dl)?", 1),
        ("creatinine", r"\b(?:creatinine|cr)[\s\:\=]+([\d\.]+)\s*(?:mg\/dl)?", 1),
        ("egfr", r"\begfr[\s\:\=]+([\d\.]+)\s*(?:ml\/min)?", 1),
        ("ef", r"\b(?:ejection\s*fraction|ef|lvef)[\s\:\=]+([\d\.]+)\s*\%?", 1),
        ("potassium", r"\b(?:potassium|k\+)[\s\:\=]+([\d\.]+)\s*(?:meq\/l)?", 1),
        ("sodium", r"\b(?:sodium|na\+)[\s\:\=]+([\d\.]+)\s*(?:meq\/l)?", 1),
        ("platelets", r"\b(?:platelet|plt)[\s\:\=]+([\d\,]+)", 1),
        ("inr", r"\binr[\s\:\=]+([\d\.]+)", 1),
    ]
    for lab_name, pattern, group_idx in lab_patterns:
        m = re.search(pattern, lower_text)
        if m:
            val_str = m.group(group_idx).replace(",", "")
            try:
                entities["labs"][lab_name] = float(val_str)
                entities["spans"].append({
                    "entity": lab_name,
                    "value": float(val_str),
                    "span": [m.start(), m.end()],
                })
            except ValueError:
                pass

    # 4. Medications
    med_list = ["insulin", "metformin", "warfarin", "lisinopril", "furosemide", "aspirin", "metoprolol", "glipizide", "atorvastatin", "pantoprazole"]
    for med in med_list:
        m = re.search(rf"\b{med}\b", lower_text)
        if m:
            entities["medications"].append(med)

    return entities

def normalize_patient(
    subject_id: str,
    gender: str = "UNKNOWN",
    age: int = 0,
    diagnoses: list[str] = None,
    labs: dict = None,
    medications: list[str] = None,
    vitals: dict = None,
    notes: list[str] = None,
    timeline: list[dict] = None,
) -> dict:
    """Normalizes raw EHR inputs into a canonical patient profile with derived clinical metrics."""
    clean_gender = str(gender or "UNKNOWN").strip().upper()
    clean_age = int(age or 0)
    clean_diag = [str(d).strip() for d in (diagnoses or []) if d]
    clean_labs = {str(k).lower().strip(): float(v) for k, v in (labs or {}).items() if v is not None}
    clean_meds = [str(m).strip() for m in (medications or []) if m]
    clean_vitals = {str(k).lower().strip(): float(v) for k, v in (vitals or {}).items() if v is not None}
    clean_notes = list(notes or [])

    # Extract entities from clinical notes
    extracted = extract_clinical_entities(clean_notes) if clean_notes else {}

    # Merge labs found in notes into labs dict if not already present
    if extracted.get("labs"):
        for lab_key, lab_val in extracted["labs"].items():
            if lab_key not in clean_labs:
                clean_labs[lab_key] = lab_val

    # Automatically derive eGFR if creatinine is known and eGFR missing
    if "egfr" not in clean_labs and "creatinine" in clean_labs and clean_age > 0:
        derived_egfr = calculate_egfr(clean_labs["creatinine"], clean_age, clean_gender)
        if derived_egfr > 0:
            clean_labs["egfr"] = derived_egfr

    return {
        "subject_id": str(subject_id),
        "gender": clean_gender,
        "age": clean_age,
        "diagnoses": clean_diag,
        "labs": clean_labs,
        "vitals": clean_vitals,
        "medications": clean_meds,
        "profile": {
            "notes": clean_notes,
            "extracted_entities": extracted,
        },
        "timeline": timeline or [],
    }

def to_fhir_bundle(patient: dict) -> dict:
    """Serializes a normalized patient profile into a valid FHIR R4 Bundle resource."""
    sub_id = patient.get("subject_id", "anonymous")
    entries = []

    # 1. Patient Resource
    entries.append({
        "fullUrl": f"urn:uuid:patient-{sub_id}",
        "resource": {
            "resourceType": "Patient",
            "id": sub_id,
            "gender": "female" if patient.get("gender") == "F" else "male" if patient.get("gender") == "M" else "unknown",
            "extension": [
                {
                    "url": "http://hl7.org/fhir/StructureDefinition/patient-age",
                    "valueInteger": patient.get("age", 0),
                }
            ],
        },
    })

    # 2. Condition Resources (Diagnoses)
    for idx, diag in enumerate(patient.get("diagnoses", [])):
        entries.append({
            "fullUrl": f"urn:uuid:condition-{sub_id}-{idx}",
            "resource": {
                "resourceType": "Condition",
                "id": f"cond-{sub_id}-{idx}",
                "subject": {"reference": f"Patient/{sub_id}"},
                "code": {
                    "coding": [
                        {
                            "system": "http://hl7.org/fhir/sid/icd-9-cm",
                            "code": str(diag),
                        }
                    ],
                    "text": str(diag),
                },
                "clinicalStatus": {
                    "coding": [{"code": "active", "system": "http://terminology.hl7.org/CodeSystem/condition-clinical"}]
                },
            },
        })

    # 3. Observation Resources (Labs & Vitals)
    for lab_name, val in {**patient.get("labs", {}), **patient.get("vitals", {})}.items():
        entries.append({
            "fullUrl": f"urn:uuid:obs-{sub_id}-{lab_name}",
            "resource": {
                "resourceType": "Observation",
                "id": f"obs-{sub_id}-{lab_name}",
                "status": "final",
                "subject": {"reference": f"Patient/{sub_id}"},
                "code": {"text": lab_name.upper()},
                "valueQuantity": {
                    "value": float(val),
                    "unit": "standard",
                },
            },
        })

    # 4. MedicationStatement Resources
    for idx, med in enumerate(patient.get("medications", [])):
        entries.append({
            "fullUrl": f"urn:uuid:med-{sub_id}-{idx}",
            "resource": {
                "resourceType": "MedicationStatement",
                "id": f"med-{sub_id}-{idx}",
                "status": "active",
                "subject": {"reference": f"Patient/{sub_id}"},
                "medicationCodeableConcept": {"text": med},
            },
        })

    return {
        "resourceType": "Bundle",
        "type": "collection",
        "id": f"bundle-patient-{sub_id}",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "total": len(entries),
        "entry": entries,
    }
