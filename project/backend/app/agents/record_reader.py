"""Record Reader Agent: normalizes clinical profiles into structured patient records."""

def normalize_patient(subject_id: str, gender: str, age: int, diagnoses: list[str], labs: dict, medications: list[str]) -> dict:
    return {
        "subject_id": subject_id,
        "gender": gender.upper() if gender else "UNKNOWN",
        "age": age,
        "diagnoses": diagnoses or [],
        "labs": labs or {},
        "medications": medications or [],
    }
