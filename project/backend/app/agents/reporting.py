"""Reporting Agent: Computes recruitment funnel metrics and audit summaries.

Reads from the in-memory audit log and screening results — no separate data store needed.
Produces JSON reports suitable for dashboard display or CSV export.
"""

from datetime import datetime, timezone
from ..db.audit import get_audit_trail


def compute_funnel(screenings: list[dict]) -> dict:
    """Aggregate screening results into a recruitment funnel summary."""
    total = len(screenings)
    eligible = sum(1 for s in screenings if s.get("status") == "ELIGIBLE")
    ineligible = sum(1 for s in screenings if s.get("status") == "INELIGIBLE")
    review = sum(1 for s in screenings if s.get("status") == "REVIEW_REQUIRED")
    outreach_sent = sum(1 for s in screenings if s.get("outreach") is not None)

    return {
        "screened": total,
        "eligible": eligible,
        "ineligible": ineligible,
        "review_required": review,
        "outreach_drafted": outreach_sent,
        "eligibility_rate": round(eligible / total, 3) if total else 0.0,
    }


def build_shap_summary(screenings: list[dict]) -> list[dict]:
    """Collect SHAP evidence cards from all eligible screenings."""
    cards = []
    for s in screenings:
        matcher = s.get("matcher", {})
        shap = matcher.get("shap_values")
        if shap:
            cards.append({
                "patient_id": s.get("subject_id"),
                "trial_id": s.get("trial_id"),
                "status": s.get("status"),
                "shap_values": shap,
                "top_criterion": matcher.get("top_criterion"),
                "confidence": matcher.get("confidence"),
            })
    return cards


def generate_report(screenings: list[dict], trial_id: str = "") -> dict:
    """Generate a complete recruitment report for a trial run."""
    funnel = compute_funnel(screenings)
    shap_cards = build_shap_summary(screenings)
    audit_events = get_audit_trail()  # in-memory trail

    return {
        "report_id": f"rpt-{datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%S')}",
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "trial_id": trial_id,
        "funnel": funnel,
        "shap_summary": shap_cards,
        "audit_entries": audit_events[:100],  # cap for export
        "total_audit_events": len(audit_events),
    }
