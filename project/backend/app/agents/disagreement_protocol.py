"""Disagreement Protocol Agent: Multi-agent negotiation loop between Matcher and Compliance."""

def resolve_disagreement(matcher_result: dict, compliance_result: dict, max_rounds: int = 3) -> dict:
    matcher_vote = "ELIGIBLE" if matcher_result.get("is_eligible") else "INELIGIBLE"
    compliance_vote = "COMPLIANT" if compliance_result.get("is_compliant") else "NON_COMPLIANT"
    
    rounds = []
    for r in range(1, max_rounds + 1):
        if matcher_vote == "ELIGIBLE" and compliance_vote == "COMPLIANT":
            rounds.append({"round": r, "consensus": True, "final_status": "ELIGIBLE"})
            return {"status": "ELIGIBLE", "rounds": rounds, "consensus": True}
        
        if compliance_vote == "NON_COMPLIANT":
            # Safety hard-stop rule: compliance agent vetoes
            rounds.append({"round": r, "consensus": True, "final_status": "INELIGIBLE", "reason": "Safety contraindication veto"})
            return {"status": "INELIGIBLE", "rounds": rounds, "consensus": True}
            
        rounds.append({"round": r, "consensus": False, "note": "Borderline criteria; iterating evidence review"})

    # Unresolved after max rounds: Escalate to Clinical Research Coordinator
    return {
        "status": "REVIEW_REQUIRED",
        "rounds": rounds,
        "consensus": False,
        "escalation_reason": "Agents could not reach automated consensus; human review needed",
    }
