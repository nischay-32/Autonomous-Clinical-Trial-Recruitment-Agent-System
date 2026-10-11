"""Criteria Matcher Agent: Hybrid ML & Semantic Rule Evaluation Package."""

from .deterministic import evaluate_deterministic_rules, eval_single_criterion
from .ml_scorer import score_patient_ml, extract_patient_features
from .nlp_scorer import score_notes_nlp
from .ensemble import aggregate_hybrid_scoring

# Primary public API (maintains 100% backwards compatibility)
match_criteria = aggregate_hybrid_scoring

__all__ = [
    "match_criteria",
    "evaluate_deterministic_rules",
    "eval_single_criterion",
    "score_patient_ml",
    "score_notes_nlp",
    "extract_patient_features",
    "aggregate_hybrid_scoring",
]
