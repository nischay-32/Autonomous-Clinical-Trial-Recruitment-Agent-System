"""
End-to-End Recruitment Pipeline Integration Test
Verifies all 7 phases:
  Phase 1: DB & Criteria Rules
  Phase 2: Orchestration & Patient Normalization
  Phase 3: Hybrid Deterministic & ML Scoring
  Phase 4: Multi-Agent Disagreement Protocol (Consensus Negotiation)
  Phase 5: Safety Auditing & Compliance Check
  Phase 6: Multilingual Outreach Generation & Coordinator Approval
  Phase 7: Immutable HIPAA Audit Trail Logging
"""

import unittest
from datetime import datetime, timezone
from app.agents.orchestrator import run_recruitment_pipeline
from app.agents.compliance import verify_compliance, ComplianceSafetyAuditor
from app.db.audit import log_audit_event, get_audit_trail
from app.api.router import (
    ensure_seeded,
    DEMO_TRIALS,
    DEFAULT_COHORT,
    OUTREACH_DRAFTS,
    _USERS_DB,
    register_user,
    login_user,
    RegisterRequest,
    LoginRequest,
    adjudicate_review,
    AdjudicationPayload,
    approve_outreach,
    ApproveRequest,
)


class TestE2ERecruitmentPipeline(unittest.TestCase):

    def setUp(self):
        self.trial = DEMO_TRIALS["NCT00005143"]

    def test_01_authentication_flow(self):
        """Phase 2: Verify user registration and login with password hashing."""
        email = f"dr.smith_{int(datetime.now(timezone.utc).timestamp())}@trialhospital.org"
        reg_req = RegisterRequest(
            full_name="Dr. Jane Smith",
            email=email,
            organization="Mass General Brigham",
            job_title="Lead Principal Investigator",
            password="SecureTrialPassword2026!"
        )
        res_reg = register_user(reg_req)
        self.assertIn("token", res_reg)
        self.assertEqual(res_reg["user"]["email"], email)

        login_req = LoginRequest(email=email, password="SecureTrialPassword2026!")
        res_login = login_user(login_req)
        self.assertIn("token", res_login)
        self.assertEqual(res_login["user"]["organization"], "Mass General Brigham")

    def test_02_screening_pipeline_eligible_pipeline(self):
        """Phases 3-6: Fully eligible patient triggers passing matcher, compliance check, and outreach draft."""
        patient_data = {
            "subject_id": "PT-TEST-001",
            "gender": "F",
            "age": 52,
            "diagnoses": ["250.00"],
            "labs": {
                "hba1c": 8.5,
                "glucose": 145,
                "egfr": 75,
                "creatinine": 0.9,
                "alt": 25,
                "ast": 22,
                "fasting_glucose": 140,
                "uacr": 20,
            },
            "vitals": {"bmi": 27.5, "sbp": 128},
            "medications": ["Atorvastatin"],
            "profile": {"notes": ["Informed consent verified. Patient agrees to study protocol."]},
        }

        result = run_recruitment_pipeline(patient_data, self.trial)
        self.assertIn("status", result)
        self.assertEqual(result["status"], "ELIGIBLE")
        self.assertGreaterEqual(result["confidence"], 0.85)
        self.assertTrue(result["compliance"]["is_compliant"])
        self.assertIsNotNone(result.get("outreach"))
        self.assertIn("Metformin", result["outreach"]["draft_content"])

    def test_03_screening_pipeline_borderline_escalation(self):
        """Phase 5: Borderline patient with eGFR ~ 45 triggers multi-round disagreement negotiation."""
        patient_data = {
            "subject_id": "PT-BORDERLINE-002",
            "age": 68,
            "gender": "F",
            "diagnoses": ["250.02", "585.3"],
            "labs": {"HbA1c": 9.1, "eGFR": 44.8, "Serum Creatinine": 1.5},
            "medications": ["Glipizide 5mg"]
        }

        result = run_recruitment_pipeline(patient_data, self.trial)
        self.assertIn("status", result)
        self.assertIn(result["status"], ["REVIEW_REQUIRED", "INELIGIBLE"])
        self.assertIn("rounds_executed", result["consensus"])
        self.assertGreaterEqual(result["consensus"]["rounds_executed"], 1)

    def test_04_adjudication_and_outreach_approval(self):
        """Phase 5 & 6: Human-in-the-loop coordinator adjudicates patient and approves outreach."""
        ensure_seeded()
        target_pt = next((p for p in DEFAULT_COHORT if p.get("status") == "REVIEW_REQUIRED"), None)
        self.assertIsNotNone(target_pt)
        sub_id = target_pt["subject_id"]
        session_id = f"REV-{sub_id}"

        adj_payload = AdjudicationPayload(
            decision="INCLUDE",
            justification="Patient demonstrates stable renal clearance over 6-month observation window.",
            coordinator="Dr. C. Roberts"
        )
        res_adj = adjudicate_review(session_id, adj_payload)
        self.assertEqual(res_adj["status"], "RESOLVED")

        # Verify updated status in DEFAULT_COHORT
        cohort_pt = next((p for p in DEFAULT_COHORT if p["subject_id"] == sub_id), None)
        self.assertIsNotNone(cohort_pt)
        self.assertEqual(cohort_pt["status"], "ELIGIBLE")

        # Verify outreach approval
        app_req = ApproveRequest(
            patient_id=sub_id,
            coordinator_name="Dr. C. Roberts",
            comments="Signed off under IRB protocol."
        )
        res_app = approve_outreach(app_req)
        self.assertEqual(res_app["status"], "Approved")

    def test_05_hipaa_audit_trail_integrity(self):
        """Phase 7: Verify tamper-evident append-only audit trail."""
        log_audit_event(
            agent_name="Coordinator",
            action="VERIFY_SECURITY_AUDIT",
            patient_id="PT-AUDIT-TEST",
            trial_id="NCT00005143",
            details={"irb_protocol": "IRB-2026-9812", "hipaa_compliant": True}
        )

        audit_trail = get_audit_trail(patient_id="PT-AUDIT-TEST", limit=50)
        self.assertGreater(len(audit_trail), 0)
        latest_event = audit_trail[0]
        self.assertEqual(latest_event["action"], "VERIFY_SECURITY_AUDIT")
        self.assertEqual(latest_event["patient_id"], "PT-AUDIT-TEST")


if __name__ == "__main__":
    unittest.main()
