"""Outreach Agent: Drafts personalized, coordinator-approved recruitment invitations.

Supports EN (English), ES (Spanish), KN (Kannada), HI (Hindi) per blueprint spec.
All templates use explicit placeholders — no LLM required for basic drafting.
"""

_SUBJECTS = {
    "en": "Invitation to Participate in a Clinical Research Study",
    "es": "Invitación para Participar en un Estudio de Investigación Clínica",
    "kn": "ಕ್ಲಿನಿಕಲ್ ಸಂಶೋಧನೆ ಅಧ್ಯಯನದಲ್ಲಿ ಭಾಗವಹಿಸಲು ಆಹ್ವಾನ",
    "hi": "नैदानिक अनुसंधान अध्ययन में भाग लेने का निमंत्रण",
}

_BODIES = {
    "en": (
        "Dear Patient,\n\n"
        "Based on recent clinical observations, you may be eligible to participate in a research "
        "study evaluating {trial_title}.\n"
        "Participation is entirely voluntary, and your standard care remains unchanged.\n\n"
        "Please contact the Clinical Research Team for more information.\n\n"
        "Best regards,\nClinical Research Team"
    ),
    "es": (
        "Estimado Paciente,\n\n"
        "Según sus observaciones clínicas recientes, usted podría ser elegible para participar "
        "en un estudio de investigación sobre {trial_title}.\n"
        "La participación es completamente voluntaria y su atención estándar no cambiará.\n\n"
        "Comuníquese con nuestro equipo para más información.\n\n"
        "Atentamente,\nEquipo de Investigación Clínica"
    ),
    "kn": (
        "ಆತ್ಮೀಯ ರೋಗಿ,\n\n"
        "ಇತ್ತೀಚಿನ ಕ್ಲಿನಿಕಲ್ ವೀಕ್ಷಣೆಗಳ ಆಧಾರದ ಮೇಲೆ, ನೀವು {trial_title} ಕ್ಕೆ ಸಂಬಂಧಿಸಿದ "
        "ಸಂಶೋಧನಾ ಅಧ್ಯಯನದಲ್ಲಿ ಭಾಗವಹಿಸಲು ಅರ್ಹರಾಗಿರಬಹುದು.\n"
        "ಭಾಗವಹಿಸುವಿಕೆ ಸಂಪೂರ್ಣ ಸ್ವಯಂಪ್ರೇರಿತ ಮತ್ತು ನಿಮ್ಮ ಚಿಕಿತ್ಸೆ ಬದಲಾಗುವುದಿಲ್ಲ.\n\n"
        "ಹೆಚ್ಚಿನ ಮಾಹಿತಿಗಾಗಿ ಕ್ಲಿನಿಕಲ್ ಸಂಶೋಧನಾ ತಂಡವನ್ನು ಸಂಪರ್ಕಿಸಿ.\n\n"
        "ವಂದನೆಗಳು,\nಕ್ಲಿನಿಕಲ್ ಸಂಶೋಧನಾ ತಂಡ"
    ),
    "hi": (
        "प्रिय रोगी,\n\n"
        "हाल की नैदानिक जांच के आधार पर, आप {trial_title} से संबंधित एक शोध अध्ययन में "
        "भाग लेने के योग्य हो सकते हैं।\n"
        "भागीदारी पूरी तरह स्वैच्छिक है और आपकी मानक देखभाल अपरिवर्तित रहेगी।\n\n"
        "अधिक जानकारी के लिए कृपया क्लिनिकल रिसर्च टीम से संपर्क करें।\n\n"
        "सादर,\nक्लिनिकल रिसर्च टीम"
    ),
}


def draft_outreach(patient_id: str, trial_title: str, language: str = "en") -> dict:
    """Generate a coordinator-review-pending outreach draft in the requested language."""
    lang = language if language in _BODIES else "en"
    return {
        "patient_id": patient_id,
        "language": lang,
        "subject": _SUBJECTS[lang],
        "draft_content": _BODIES[lang].format(trial_title=trial_title),
        "status": "pending_approval",
        "is_approved": False,
    }


SUPPORTED_LANGUAGES = list(_BODIES.keys())

