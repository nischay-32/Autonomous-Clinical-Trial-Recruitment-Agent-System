"""Layer 4: Ensemble Aggregator with Weighted Consensus & Explainability."""

from .deterministic import evaluate_deterministic_rules
from .ml_scorer import score_patient_ml
from .nlp_scorer import score_notes_nlp

def aggregate_hybrid_scoring(patient: dict, criteria: dict) -> dict:
    """Executes the full 3-layer hybrid criteria matching pipeline with SHAP explainability."""
    # 1. Layer 1: Deterministic Evaluation
    det = evaluate_deterministic_rules(patient, criteria)
    
    # If legacy test rule format, return deterministic directly
    if not det.get("details"):
        return det

    # 2. Layer 2: Structured ML Scoring
    trial_name = criteria.get("title", "")
    ml = score_patient_ml(patient, trial_name)

    # 3. Layer 3: NLP Semantic Grounding
    all_criteria = (criteria.get("criteria", {}).get("inclusion", []) or []) + (criteria.get("criteria", {}).get("exclusion", []) or [])
    nlp = score_notes_nlp(patient, all_criteria)

    # 4. Ensemble Voting & Hard Exclusion Safety Stop
    if det.get("hard_exclusion_triggered", False):
        final_eligible = False
        final_confidence = 0.0
    else:
        # Weighted confidence: Deterministic (0.50), ML (0.30), NLP (0.20)
        weighted_conf = (
            0.50 * det.get("confidence", 0.0)
            + 0.30 * ml.get("ml_probability", 0.0)
            + 0.20 * nlp.get("nlp_score", 0.0)
        )
        final_confidence = round(weighted_conf, 2)
        final_eligible = det.get("is_eligible", False) and (ml.get("ml_probability", 0.5) >= 0.35)
        if not final_eligible:
            final_confidence = min(final_confidence, 0.45)

    # Determine if cases require disagreement protocol review
    is_borderline = (det.get("criteria_borderline", 0) > 0) or (0.60 <= final_confidence < 0.75)

    return {
        "is_eligible": final_eligible,
        "confidence": final_confidence,
        "hard_exclusion_triggered": det.get("hard_exclusion_triggered", False),
        "is_borderline": is_borderline,
        "criteria_evaluated": det.get("criteria_evaluated", 0),
        "criteria_met": det.get("criteria_met", 0),
        "criteria_borderline": det.get("criteria_borderline", 0),
        "criteria_failed": det.get("criteria_failed", 0),
        "reasons": det.get("reasons", []),
        "details": det.get("details", []),
        "layers": {
            "deterministic": {
                "eligible": det.get("is_eligible", False),
                "confidence": det.get("confidence", 0.0),
            },
            "ml_scorer": {
                "eligible": ml.get("ml_eligible", False),
                "probability": ml.get("ml_probability", 0.0),
            },
            "nlp_semantic": {
                "score": nlp.get("nlp_score", 0.0),
                "grounded_count": len(nlp.get("grounded_evidence", [])),
            },
        },
        "shap_explainability": {
            "top_positive_factors": ml.get("top_positive_factors", []),
            "top_negative_factors": ml.get("top_negative_factors", []),
            "feature_contributions": ml.get("feature_contributions", {}),
        },
        "grounded_evidence": nlp.get("grounded_evidence", []),
    }
