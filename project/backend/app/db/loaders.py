import csv
import os
import re
from pathlib import Path
from ..agents.record_reader import normalize_patient, MIMIC_LAB_MAP
try:
    from .database import async_session
    from .models import Patient
except ImportError:
    async_session = None
    Patient = None

def _extract_year(date_str: str) -> int:
    m = re.search(r"\b(2\d{3}|1\d{3})\b", str(date_str))
    return int(m.group(1)) if m else 0

def load_mimic_cohort(
    data_dir: str = None,
    notes_csv: str = None,
    limit: int = 100,
) -> list[dict]:
    """Assembles unified, normalized patient profiles by joining MIMIC-III demo tables."""
    base_path = Path(__file__).resolve().parents[4]
    if not data_dir:
        data_dir = str(base_path / "Datasets" / "MIMIC3" / "mimic-iii-clinical-database-demo-1.4")
    if not notes_csv:
        notes_csv = str(base_path / "Datasets" / "MIMIC3" / "synthetic_notes" / "synthetic_noteevents.csv")

    patients_path = os.path.join(data_dir, "PATIENTS.csv")
    if not os.path.exists(patients_path):
        return []

    raw_patients = {}
    with open(patients_path, newline="", encoding="utf-8") as f:
        for r in csv.DictReader(f):
            sid = r["subject_id"]
            raw_patients[sid] = {
                "id": sid,
                "gender": r.get("gender", "UNKNOWN"),
                "dob_year": _extract_year(r.get("dob", "")),
                "age": 0,
                "diagnoses": [],
                "labs": {},
                "medications": [],
                "notes": [],
            }
            if len(raw_patients) >= limit:
                break

    target_sids = set(raw_patients.keys())

    # Admissions (calculate age from earliest admission year)
    adm_path = os.path.join(data_dir, "ADMISSIONS.csv")
    if os.path.exists(adm_path):
        with open(adm_path, newline="", encoding="utf-8") as f:
            for r in csv.DictReader(f):
                sid = r.get("subject_id")
                if sid in target_sids and raw_patients[sid]["age"] == 0:
                    admit_yr = _extract_year(r.get("admittime", ""))
                    dob_yr = raw_patients[sid]["dob_year"]
                    if admit_yr > 0 and dob_yr > 0:
                        diff = admit_yr - dob_yr
                        # MIMIC-III caps age > 89 by shifting DOB ~300 years back
                        raw_patients[sid]["age"] = min(max(diff, 0), 90) if diff < 150 else 90

    # Diagnoses
    dx_path = os.path.join(data_dir, "DIAGNOSES_ICD.csv")
    if os.path.exists(dx_path):
        with open(dx_path, newline="", encoding="utf-8") as f:
            for r in csv.DictReader(f):
                sid = r.get("subject_id")
                code = r.get("icd9_code")
                if sid in target_sids and code:
                    if code not in raw_patients[sid]["diagnoses"]:
                        raw_patients[sid]["diagnoses"].append(code)

    # Labs
    labs_path = os.path.join(data_dir, "LABEVENTS.csv")
    if os.path.exists(labs_path):
        with open(labs_path, newline="", encoding="utf-8") as f:
            for r in csv.DictReader(f):
                sid = r.get("subject_id")
                itemid = r.get("itemid")
                val = r.get("valuenum")
                if sid in target_sids and itemid in MIMIC_LAB_MAP and val:
                    try:
                        lab_key = MIMIC_LAB_MAP[itemid]
                        raw_patients[sid]["labs"][lab_key] = float(val)
                    except ValueError:
                        pass

    # Prescriptions
    rx_path = os.path.join(data_dir, "PRESCRIPTIONS.csv")
    if os.path.exists(rx_path):
        with open(rx_path, newline="", encoding="utf-8") as f:
            for r in csv.DictReader(f):
                sid = r.get("subject_id")
                drug = r.get("drug")
                if sid in target_sids and drug:
                    if drug not in raw_patients[sid]["medications"]:
                        raw_patients[sid]["medications"].append(drug)

    # Clinical Notes
    if notes_csv and os.path.exists(notes_csv):
        with open(notes_csv, newline="", encoding="utf-8") as f:
            for r in csv.DictReader(f):
                sid = r.get("subject_id")
                text = r.get("text")
                if sid in target_sids and text:
                    raw_patients[sid]["notes"].append(text)

    # Convert all into normalized profiles
    normalized_list = []
    for sid, p in raw_patients.items():
        profile = normalize_patient(
            subject_id=sid,
            gender=p["gender"],
            age=p["age"],
            diagnoses=p["diagnoses"],
            labs=p["labs"],
            medications=p["medications"],
            notes=p["notes"],
        )
        normalized_list.append(profile)

    return normalized_list

async def seed_mimic_cohort(limit: int = 100):
    """Loads and persists normalized MIMIC-III cohort patients into database."""
    cohort = load_mimic_cohort(limit=limit)
    if not cohort:
        return []

    async with async_session() as session:
        for p in cohort:
            patient = await session.get(Patient, p["subject_id"])
            if not patient:
                patient = Patient(
                    id=p["subject_id"],
                    gender=p["gender"],
                    age=p["age"],
                    profile=p,
                )
                session.add(patient)
            else:
                patient.gender = p["gender"]
                patient.age = p["age"]
                patient.profile = p
        await session.commit()
    return cohort
