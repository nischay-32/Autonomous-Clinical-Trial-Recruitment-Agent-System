"""Disagreement Protocol Agent: 3-round cyclic deliberation loop between Matcher and Compliance.

Resolves ambiguous or borderline clinical trial recruitments through structured negotiation.
"""

def resolve_disagreement(
    matcher_result: dict,
    compliance_result: dict,
    patient: dict = None,
    trial: dict = None,
    max_rounds: int = 3,
) -> dict:
    """Executes the multi-round negotiation protocol between Matcher and Compliance agents."""
    p = patient or {}
    t = trial or {}
    sub_id = p.get("subject_id", "Unknown")
    trial_id = t.get("id") or t.get("trial_id", "Trial")

    matcher_eligible = matcher_result.get("is_eligible", False)
    matcher_conf = float(matcher_result.get("confidence", 1.0 if matcher_eligible else 0.0))
    is_hard_excl = matcher_result.get("hard_exclusion_triggered", False)
    
    comp_safe = compliance_result.get("is_compliant", False)
    comp_violations = compliance_result.get("violations", [])

    rounds = []

    # =========================================================================
    # ROUND 1: Strict Constraint Re-evaluation
    # =========================================================================
    # Check 1a: Safety Veto by Compliance Agent
    if not comp_safe:
        rounds.append({
            "round": 1,
            "stage": "Strict Constraint Evaluation",
            "matcher_vote": "ELIGIBLE" if matcher_eligible else "INELIGIBLE",
            "compliance_vote": "NON_COMPLIANT",
            "consensus": True,
            "final_status": "INELIGIBLE",
            "decision": "Safety Veto: Compliance Agent detected hard clinical contraindications",
            "violations": comp_violations,
        })
        return {
            "status": "INELIGIBLE",
            "consensus": True,
            "rounds_executed": 1,
            "rounds": rounds,
            "escalation_card": None,
        }

    # Check 1b: Hard Exclusion in Criteria Matcher
    if is_hard_excl:
        rounds.append({
            "round": 1,
            "stage": "Strict Constraint Evaluation",
            "matcher_vote": "INELIGIBLE",
            "compliance_vote": "COMPLIANT",
            "consensus": True,
            "final_status": "INELIGIBLE",
            "decision": "Hard Exclusion Triggered: Protocol safety stop enforced",
            "violations": matcher_result.get("reasons", []),
        })
        return {
            "status": "INELIGIBLE",
            "consensus": True,
            "rounds_executed": 1,
            "rounds": rounds,
            "escalation_card": None,
        }

    # Check 1c: High Confidence Agreement
    if matcher_eligible and comp_safe and matcher_conf >= 0.75 and not matcher_result.get("is_borderline", False):
        rounds.append({
            "round": 1,
            "stage": "Strict Constraint Evaluation",
            "matcher_vote": "ELIGIBLE",
            "compliance_vote": "COMPLIANT",
            "consensus": True,
            "final_status": "ELIGIBLE",
            "decision": "Direct Consensus: High confidence match with clear compliance",
        })
        return {
            "status": "ELIGIBLE",
            "consensus": True,
            "rounds_executed": 1,
            "rounds": rounds,
            "escalation_card": None,
        }

    # If clear ineligibility without dispute
    if not matcher_eligible and matcher_conf < 0.50 and not matcher_result.get("is_borderline", False):
        rounds.append({
            "round": 1,
            "stage": "Strict Constraint Evaluation",
            "matcher_vote": "INELIGIBLE",
            "compliance_vote": "COMPLIANT",
            "consensus": True,
            "final_status": "INELIGIBLE",
            "decision": "Direct Ineligibility: Failed core inclusion criteria without dispute",
        })
        return {
            "status": "INELIGIBLE",
            "consensus": True,
            "rounds_executed": 1,
            "rounds": rounds,
            "escalation_card": None,
        }

    # Borderline case: Proceed to Round 2
    rounds.append({
        "round": 1,
        "stage": "Strict Constraint Evaluation",
        "matcher_vote": "BORDERLINE" if matcher_result.get("is_borderline") else ("ELIGIBLE" if matcher_eligible else "INELIGIBLE"),
        "compliance_vote": "COMPLIANT",
        "consensus": False,
        "note": "Borderline criteria or confidence < 0.75. Escalating to Round 2 RAG Evidence Augmentation.",
    })

    # =========================================================================
    # ROUND 2: Evidence Augmentation (RAG & Notes Grounding)
    # =========================================================================
    grounded_evidence = matcher_result.get("grounded_evidence", [])
    resolved_in_r2 = False
    new_conf = matcher_conf

    # Check if grounded clinical notes provide clarifying evidence
    if grounded_evidence:
        # Notes contain corroborating evidence
        supporting_spans = [e for e in grounded_evidence if not e.get("is_negated")]
        if supporting_spans:
            new_conf = min(round(matcher_conf + 0.15, 2), 0.95)
            if new_conf >= 0.75:
                resolved_in_r2 = True

    if resolved_in_r2:
        rounds.append({
            "round": 2,
            "stage": "Evidence Augmentation (RAG)",
            "matcher_vote": "ELIGIBLE",
            "compliance_vote": "COMPLIANT",
            "consensus": True,
            "final_status": "ELIGIBLE",
            "decision": "Consensus Reached via Note Grounding: Clinical notes validated criteria",
            "calibrated_confidence": new_conf,
            "citations": [e.get("matched_text") for e in grounded_evidence[:2]],
        })
        return {
            "status": "ELIGIBLE",
            "consensus": True,
            "rounds_executed": 2,
            "rounds": rounds,
            "escalation_card": None,
        }

    rounds.append({
        "round": 2,
        "stage": "Evidence Augmentation (RAG)",
        "matcher_vote": "BORDERLINE",
        "compliance_vote": "COMPLIANT",
        "consensus": False,
        "note": "Ambiguity remains after note inspection. Escalating to Round 3 Final Deliberation.",
    })

    # =========================================================================
    # ROUND 3: Final Deliberation & Human-in-the-Loop Escalation
    # =========================================================================
    escalation_card = {
        "escalation_id": f"ESC-{sub_id}-{trial_id}",
        "patient_id": sub_id,
        "trial_id": trial_id,
        "dispute_summary": f"Borderline confidence ({matcher_conf}) requires clinical coordinator review",
        "matcher_position": {
            "vote": "ELIGIBLE" if matcher_eligible else "BORDERLINE",
            "confidence": matcher_conf,
            "reasons": matcher_result.get("reasons", [])[:3],
        },
        "compliance_position": {
            "vote": "COMPLIANT" if comp_safe else "NON_COMPLIANT",
            "safety_score": compliance_result.get("safety_score", 1.0),
            "violations": comp_violations,
        },
        "grounded_evidence": [
            {"text": e.get("matched_text"), "span": e.get("span")}
            for e in grounded_evidence[:3]
        ],
        "recommended_actions": [
            "Mark Eligible (Coordinator Discretion)",
            "Mark Ineligible",
            "Order Confirmatory Lab Test",
        ],
    }

    rounds.append({
        "round": 3,
        "stage": "Human Escalation Gate",
        "consensus": False,
        "final_status": "REVIEW_REQUIRED",
        "escalation_id": escalation_card["escalation_id"],
        "note": "Automated consensus unreachable. Case placed in Coordinator Approval Queue.",
    })

    return {
        "status": "REVIEW_REQUIRED",
        "consensus": False,
        "rounds_executed": 3,
        "rounds": rounds,
        "escalation_card": escalation_card,
        "escalation_reason": "Automated consensus unreachable; human review needed",
    }
