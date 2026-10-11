import os
import re
import json
from pathlib import Path
import openpyxl

TRIALS_META = {
    "Metformin Trial": {
        "id": "NCT00005143",
        "title": "Type 2 Diabetes Mellitus Glycemic Management (Metformin)",
        "medicine": "Metformin",
        "prefix": "MET",
    },
    "Warfarin Trial": {
        "id": "NCT00262600",
        "title": "Atrial Fibrillation Stroke Prevention (ACTIVE-W Warfarin)",
        "medicine": "Warfarin",
        "prefix": "WAR",
    },
    "Lisinopril Trial": {
        "id": "NCT00000560",
        "title": "Heart Failure with Reduced Ejection Fraction (Lisinopril)",
        "medicine": "Lisinopril",
        "prefix": "LIS",
    },
}

def clean_icd_codes(raw: str) -> list[str]:
    if not raw or "N/A" in raw or "LAB" in raw:
        return []
    # Split by comma or slash and strip
    codes = []
    for item in re.split(r"[,/]", raw):
        cleaned = item.strip().replace(" ", "")
        if cleaned and not cleaned.lower().startswith("v85"):
            codes.append(cleaned)
    return codes

def extract_rule_logic(desc: str, icd_raw: str, table_col: str, border_action: str) -> dict:
    rule = {}
    d = desc.lower()
    
    # 1. Age
    age_match = re.search(r"age\s*([≥>=<≤]+)\s*(\d+)(?:\s*and\s*([≤<=]+)\s*(\d+))?", d)
    if age_match:
        rule["category"] = "age"
        rule["min_age"] = int(age_match.group(2)) if "≥" in age_match.group(1) or ">=" in age_match.group(1) else 18
        if age_match.group(4):
            rule["max_age"] = int(age_match.group(4))
        return rule

    # 1b. Clinical Risk Scores (CHA2DS2-VASc)
    if "cha₂ds₂" in d or "chads" in d:
        rule["category"] = "chads_vasc"
        rule["threshold"] = 2
        return rule
    lab_patterns = [
        ("hba1c", r"hba1c\s*([≥>=<≤]+)\s*([\d\.]+)"),
        ("glucose", r"(?:glucose|blood sugar)\s*([≥>=<≤]+)\s*([\d\.]+)"),
        ("bmi", r"bmi\s*([≥>=<≤]+)\s*([\d\.]+)"),
        ("egfr", r"egfr\s*([≥>=<≤]+)\s*([\d\.]+)"),
        ("creatinine", r"creatinine\s*([≥>=<≤]+)\s*([\d\.]+)"),
        ("potassium", r"potassium\s*([≥>=<≤\-\–\s]+)\s*([\d\.]+)(?:\s*[\–\-]\s*([\d\.]+))?"),
        ("sodium", r"sodium\s*(?:level)?\s*([≥>=<≤]+)\s*([\d\.]+)"),
        ("platelets", r"platelet\s*(?:count)?\s*([≥>=<≤]+)\s*([\d\,\.]+)"),
        ("inr", r"inr\s*([≥>=<≤\-\–\s]+)\s*([\d\.]+)(?:\s*[\–\-]\s*([\d\.]+))?"),
        ("ef", r"(?:ejection fraction|ef)\s*([≥>=<≤]+)\s*([\d\.]+)"),
        ("sbp", r"(?:systolic|sbp|blood pressure)\s*([≥>=<≤]+)\s*([\d\.]+)"),
    ]
    for lab_name, pattern in lab_patterns:
        match = re.search(pattern, d)
        if match:
            rule["category"] = "lab"
            rule["lab_name"] = lab_name
            rule["op"] = ">=" if "≥" in match.group(1) or ">=" in match.group(1) else "<=" if "≤" in match.group(1) or "<=" in match.group(1) else "<" if "<" in match.group(1) else ">"
            rule["threshold"] = float(match.group(2).replace(",", ""))
            if match.lastindex and match.lastindex >= 3 and match.group(3):
                rule["max_threshold"] = float(match.group(3))
            return rule

    # Detect negation (e.g., 'No insulin therapy', 'No hospitalization', 'Without')
    is_neg = bool(re.search(r"\b(no|without|absence of|not)\b", d))
    rule["is_negative"] = is_neg

    # 3. ICD-9 based diagnoses
    codes = clean_icd_codes(icd_raw)
    if codes:
        rule["category"] = "icd9"
        rule["codes"] = codes
        return rule

    # 4. Medication based
    if "prescriptions" in table_col.lower() or "drug" in d or "therapy" in d:
        rule["category"] = "medication"
        drugs = [w for w in ["insulin", "warfarin", "furosemide", "aspirin", "amiodarone", "ibuprofen", "contrast", "ace inhibitor", "arb"] if w in d]
        rule["drugs"] = drugs if drugs else [w for w in re.findall(r"[a-z]{4,}", d) if w not in {"drug", "therapy", "prior", "past", "months", "enrollment"}][:2]
        return rule

    # 5. Note / Clinical NLP
    rule["category"] = "note_nlp"
    clinical_terms = [
        "consent", "pregnant", "pregnancy", "allergy", "angioedema", "cirrhosis",
        "nyha", "refus", "alcohol", "surgery", "palliative", "clinical trial",
        "translator", "interpreter", "diet", "dementia"
    ]
    matched_terms = [term for term in clinical_terms if term in d]
    if matched_terms:
        rule["keywords"] = matched_terms
    else:
        stopwords = {"with", "that", "from", "have", "this", "each", "past", "prior", "last", "another", "more", "less", "than", "within", "days", "months", "years", "must", "able"}
        rule["keywords"] = [w for w in re.findall(r"[a-z]{4,}", d) if w not in stopwords][:3]
    return rule

def parse_criteria_excel(excel_path: str) -> dict:
    wb = openpyxl.load_workbook(excel_path, data_only=True)
    trials_data = {}

    for sheet_name, meta in TRIALS_META.items():
        if sheet_name not in wb.sheetnames:
            continue
        sheet = wb[sheet_name]
        rows = list(sheet.iter_rows(values_only=True))
        
        inclusion_criteria = []
        exclusion_criteria = []
        current_mode = "INCLUSION"

        for row in rows[5:]:
            if not any(row):
                continue
            first_col = str(row[0]).strip() if row[0] is not None else ""
            if "EXCLUSION" in first_col:
                current_mode = "EXCLUSION"
                continue
            if "INCLUSION" in first_col or "SUMMARY" in first_col:
                continue

            if first_col.isdigit():
                num = int(first_col)
                desc = str(row[1]).strip() if row[1] else ""
                rationale = str(row[2]).strip() if len(row) > 2 and row[2] else ""
                table_col = str(row[3]).strip() if len(row) > 3 and row[3] else ""
                n2c2_tag = str(row[4]).strip() if len(row) > 4 and row[4] else ""
                icd9_raw = str(row[5]).strip() if len(row) > 5 and row[5] else ""
                score_target = str(row[6]).strip() if len(row) > 6 and row[6] else "≥ 0.85"
                borderline_action = str(row[7]).strip() if len(row) > 7 and row[7] else ""
                
                is_hard = "hard exclusion" in borderline_action.lower() or "auto-reject" in score_target.lower()
                cid = f"{meta['prefix']}-{'INC' if current_mode == 'INCLUSION' else 'EXC'}-{num:02d}"
                
                rule_logic = extract_rule_logic(desc, icd9_raw, table_col, borderline_action)
                criterion = {
                    "criterion_id": cid,
                    "number": num,
                    "type": current_mode,
                    "description": desc,
                    "rationale": rationale,
                    "table_column": table_col,
                    "n2c2_tag": n2c2_tag,
                    "icd9_raw": icd9_raw,
                    "target_score": score_target,
                    "borderline_action": borderline_action,
                    "is_hard_exclusion": is_hard,
                    "rule": rule_logic,
                }
                if current_mode == "INCLUSION":
                    inclusion_criteria.append(criterion)
                else:
                    exclusion_criteria.append(criterion)

        trials_data[meta["id"]] = {
            "trial_id": meta["id"],
            "title": meta["title"],
            "medicine": meta["medicine"],
            "version": "1.0",
            "total_criteria": len(inclusion_criteria) + len(exclusion_criteria),
            "inclusion_count": len(inclusion_criteria),
            "exclusion_count": len(exclusion_criteria),
            "criteria": {
                "inclusion": inclusion_criteria,
                "exclusion": exclusion_criteria,
            },
        }

    return trials_data

def save_versioned_rules(excel_path: str, output_json: str) -> dict:
    data = parse_criteria_excel(excel_path)
    os.makedirs(os.path.dirname(output_json), exist_ok=True)
    with open(output_json, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    return data

if __name__ == "__main__":
    base_dir = Path(__file__).resolve().parents[4]
    xlsx = base_dir / "Documents" / "Drug_Criteria_Full_40plus_CI_PR_13.xlsx"
    out = Path(__file__).resolve().parent / "trials_criteria_v1.json"
    parsed = save_versioned_rules(str(xlsx), str(out))
    print(f"Successfully converted {len(parsed)} trials to {out}")
    for tid, t in parsed.items():
        print(f"Trial {tid}: {t['title']} ({t['total_criteria']} criteria)")
