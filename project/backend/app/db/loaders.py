import csv
import os
import json
from .database import async_session
from .models import Patient

async def load_mimic_data(csv_path: str):
    if not os.path.exists(csv_path):
        print(f"File not found: {csv_path}")
        return
    
    patients = {}
    with open(csv_path, newline='', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            subj_id = row['subject_id']
            text = row['text']
            
            if subj_id not in patients:
                patients[subj_id] = {
                    "id": subj_id,
                    "gender": "Unknown",
                    "age": 0,
                    "profile": {"notes": []}
                }
            patients[subj_id]["profile"]["notes"].append(text)
    
    async with async_session() as session:
        for subj_id, data in patients.items():
            # Check if patient exists
            patient = await session.get(Patient, subj_id)
            if not patient:
                patient = Patient(
                    id=data["id"],
                    gender=data["gender"],
                    age=data["age"],
                    profile=data["profile"]
                )
                session.add(patient)
            else:
                patient.profile = data["profile"]
        
        await session.commit()
    print(f"Loaded {len(patients)} patients from MIMIC demo data.")
