"""Outreach Agent: Drafts personalized, coordinator-approved recruitment invitations."""

TEMPLATES = {
    "en": (
        "Dear Patient,\n\n"
        "Based on recent clinical observations, you may be eligible to participate in a research study evaluating {trial_title}.\n"
        "Participation is entirely voluntary, and standard care remains unchanged.\n\n"
        "Best regards,\nClinical Research Team"
    ),
    "es": (
        "Estimado Paciente,\n\n"
        "Según sus observaciones clínicas recientes, usted podría ser elegible para participar en un estudio de investigación sobre {trial_title}.\n"
        "La participación es completamente voluntaria.\n\n"
        "Atentamente,\nEquipo de Investigación Clínica"
    ),
}

def draft_outreach(patient_id: str, trial_title: str, language: str = "en") -> dict:
    template = TEMPLATES.get(language, TEMPLATES["en"])
    content = template.format(trial_title=trial_title)
    return {
        "patient_id": patient_id,
        "language": language,
        "draft_content": content,
        "is_approved": False,
    }
