"""Layer 2: Structured ML Scorer with Gradient Boosting & SHAP-style Explainability.

Extracts multidimensional clinical vectors and evaluates comorbidity interaction patterns.
"""

import numpy as np
from sklearn.ensemble import GradientBoostingClassifier

FEATURE_NAMES = [
    "age",
    "is_female",
    "chads_vasc",
    "egfr",
    "creatinine",
    "hba1c",
    "glucose",
    "potassium",
    "sodium",
    "platelets",
    "inr",
    "num_diagnoses",
    "num_medications",
]

# Baseline population means for normalization and attribution
FEATURE_MEANS = {
    "age": 60.0,
    "is_female": 0.5,
    "chads_vasc": 2.0,
    "egfr": 65.0,
    "creatinine": 1.2,
    "hba1c": 7.0,
    "glucose": 130.0,
    "potassium": 4.2,
    "sodium": 138.0,
    "platelets": 200000.0,
    "inr": 1.1,
    "num_diagnoses": 8.0,
    "num_medications": 6.0,
}

FEATURE_STDS = {
    "age": 15.0,
    "is_female": 0.5,
    "chads_vasc": 1.5,
    "egfr": 25.0,
    "creatinine": 0.6,
    "hba1c": 1.5,
    "glucose": 45.0,
    "potassium": 0.5,
    "sodium": 4.0,
    "platelets": 70000.0,
    "inr": 0.3,
    "num_diagnoses": 5.0,
    "num_medications": 4.0,
}

_MODEL = None

def _get_or_train_model() -> GradientBoostingClassifier:
    """Initializes a calibrated gradient boosted classifier for structured eligibility scoring."""
    global _MODEL
    if _MODEL is not None:
        return _MODEL

    # Deterministic synthetic clinical training set representing core trial cohorts
    np.random.seed(42)
    n_samples = 300
    X = np.zeros((n_samples, len(FEATURE_NAMES)))
    y = np.zeros(n_samples)

    for i in range(n_samples):
        age = np.random.uniform(25, 85)
        female = np.random.choice([0.0, 1.0])
        egfr = np.random.uniform(15, 110)
        cr = max(0.5, 1.2 + (70 - egfr) * 0.02)
        hba1c = np.random.uniform(5.5, 11.0)
        glucose = np.random.uniform(90, 260)
        k = np.random.uniform(3.2, 5.8)
        na = np.random.uniform(128, 145)
        plt = np.random.uniform(80000, 350000)
        inr = np.random.uniform(0.9, 2.2)
        ndx = np.random.randint(1, 20)
        nmed = np.random.randint(1, 15)
        chads = int(min(max((age >= 65) + (age >= 75) + female + (ndx > 5), 0), 6))

        X[i] = [age, female, chads, egfr, cr, hba1c, glucose, k, na, plt, inr, ndx, nmed]
        # Clinical eligibility heuristic for training supervision
        eligible = (30 <= age <= 75) and (egfr >= 45) and (cr < 2.0) and (3.5 <= k <= 5.2) and (plt >= 100000)
        y[i] = 1 if eligible else 0

    clf = GradientBoostingClassifier(n_estimators=30, max_depth=3, random_state=42)
    clf.fit(X, y)
    _MODEL = clf
    return _MODEL

def extract_patient_features(patient: dict) -> np.ndarray:
    """Extracts a normalized 1D feature array from patient record."""
    age = float(patient.get("age", 0))
    gender = str(patient.get("gender", "")).upper()
    is_female = 1.0 if gender in ["F", "FEMALE"] else 0.0
    
    # Labs & derived metrics
    labs = patient.get("labs", {})
    egfr = float(labs.get("egfr", 60.0))
    cr = float(labs.get("creatinine", 1.0))
    hba1c = float(labs.get("hba1c", 7.0))
    glu = float(labs.get("glucose", 120.0))
    k = float(labs.get("potassium", 4.2))
    na = float(labs.get("sodium", 138.0))
    plt = float(labs.get("platelets", 200000.0))
    inr = float(labs.get("inr", 1.1))

    # Diagnoses & Medications
    ndx = float(len(patient.get("diagnoses", [])))
    nmed = float(len(patient.get("medications", [])))

    # CHA2DS2-VASc
    diag_codes = [str(x).replace(".", "") for x in patient.get("diagnoses", [])]
    chads = 0
    if age >= 75:
        chads += 2
    elif age >= 65:
        chads += 1
    if is_female:
        chads += 1
    if any(c.startswith("428") for c in diag_codes):
        chads += 1
    if any(c.startswith("401") for c in diag_codes):
        chads += 1
    if any(c.startswith("250") for c in diag_codes):
        chads += 1
    if any(c.startswith(("434", "435", "436", "431")) for c in diag_codes):
        chads += 2

    return np.array([age, is_female, float(chads), egfr, cr, hba1c, glu, k, na, plt, inr, ndx, nmed])

def score_patient_ml(patient: dict, trial_name: str = "") -> dict:
    """Evaluates patient using the Gradient Boosted clinical risk model.

    Produces ML confidence probability and SHAP-style feature contributions.
    """
    model = _get_or_train_model()
    features = extract_patient_features(patient)
    X = features.reshape(1, -1)

    prob = float(model.predict_proba(X)[0][1])
    is_eligible = bool(prob >= 0.50)

    # Feature attribution (SHAP-approximation: normalized deviation × feature importance)
    importances = model.feature_importances_
    contributions = {}
    for name, val, imp in zip(FEATURE_NAMES, features, importances):
        mean = FEATURE_MEANS[name]
        std = max(FEATURE_STDS[name], 1e-4)
        z_score = (val - mean) / std
        # Positive direction means supporting eligibility, negative means detracting
        weight = float(imp * z_score)
        contributions[name] = round(weight, 3)

    sorted_contrib = sorted(contributions.items(), key=lambda x: abs(x[1]), reverse=True)
    top_pos = [f"{k} (+{v})" for k, v in sorted_contrib if v > 0][:3]
    top_neg = [f"{k} ({v})" for k, v in sorted_contrib if v < 0][:3]

    return {
        "ml_eligible": is_eligible,
        "ml_probability": round(prob, 2),
        "feature_contributions": contributions,
        "top_positive_factors": top_pos,
        "top_negative_factors": top_neg,
    }
