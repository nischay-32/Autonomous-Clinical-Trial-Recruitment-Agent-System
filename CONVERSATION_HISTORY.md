# TrialScreen: Conversation History & System Knowledge Base

## 1. Project Overview & Brand Identity
- **Product Name**: TrialScreen
- **Product Type**: Autonomous Multi-Agent Clinical Trial Recruitment System (B2B Healthcare SaaS)
- **Institution / Team**: VTU Academic Project CI_PR_13 (Nischay, Ranganath, Rohan, Yadavalli)
- **Brand Aesthetic**: Apple Human Interface Guidelines (WWDC fluid motion, Liquid Glass functional layer, translucent chrome, crisp typography, micro-interactions, spring transitions)
- **Palette**:
  - Background: `#F8FAFC`
  - Surface: `#FFFFFF`
  - Navy (primary): `#0F172A`
  - Accent blue: `#2563EB`
  - Muted text: `#64748B`
  - Border: `#E2E8F0`
  - Success: `#16A34A`
  - Warning: `#D97706`
  - Danger: `#DC2626`
- **Button Style**: `border-radius: 4px` (strict, not pill, not rounded-xl)
- **Core Rules**: Ponytail lazy senior dev mode (YAGNI, standard library over custom code, deletion over addition, fewest files possible, zero unrequested abstractions)

---

## 2. 7-Agent Architecture Pipeline
1. **Record Reader Agent (`RecordReaderAgent`)**:
   - Ingests EHR patient data (MIMIC-III synthesized, OMOP CDM, FHIR compatible).
   - Extracts diagnoses (ICD-9/10), longitudinal lab panels (HbA1c, eGFR, Creatinine), and medications.
   - Grounded via Bio_ClinicalBERT NER.
2. **Criteria Matcher Agent (`CriteriaMatcherAgent`)**:
   - 3-Layer hybrid evaluation:
     - Layer 1: Deterministic boundary checks (mathematical thresholds, age, lab ranges).
     - Layer 2: XGBoost comorbidity risk scoring.
     - Layer 3: Bio_ClinicalBERT semantic note grounding.
   - Calculates confidence scores and passes/fails individual inclusion and exclusion criteria.
3. **Disagreement Protocol (`ConsensusOrchestrator`)**:
   - Multi-agent negotiation engine for borderline and divergent stances.
   - Up to 3 cyclic rounds between Matcher Agent and Compliance Agent.
   - Anti-hallucination RAG grounding using note evidence spans.
   - If consensus is not reached after Round 3, escalates to human-in-the-loop review queue.
4. **Compliance & Safety Auditor (`ComplianceSafetyAgent`)**:
   - Enforces HIPAA Safe Harbor de-identification (zero PHI exposure).
   - Audits drug-drug contraindications and safety boundaries.
   - Holds veto power over recruitment decisions before outreach.
5. **Outreach Agent (`OutreachDispatchAgent`)**:
   - Drafts compassionate, IRB-standard clinical trial invitation letters.
   - Supports multiple languages: English (EN), Spanish (ES), Hindi (HI), Kannada (KN).
   - Dispatched only after coordinator approval.
6. **Reporting & Analytics Agent (`ReportingAgent`)**:
   - Calculates recruitment funnel metrics, eligibility rates, and SHAP explainability feature attributions.
7. **HIPAA Audit Security Vault (`AuditSecurityVault`)**:
   - Append-only, tamper-evident audit ledger compliant with FDA 21 CFR Part 11.
   - Every agent action, model score, consensus round, and coordinator adjudication is logged with cryptographic timestamps.

---

## 3. Implemented Phases & System Workflows

### Phase 1: Apple Design Tokens & CSS Physics
- Implemented Liquid Glass CSS variables (`--glass-bg`, `--glass-border`, `--glass-blur`, `--glass-specular`, `--glass-shadow`).
- Added WWDC spring physics curves (`--spring-snappy`, `--spring-fluid`, `--spring-bouncy`).
- Defined materials (`.liquid-glass`, `.liquid-glass-subtle`, `.liquid-glass-dark`) and exit/enter animations in `app/globals.css`.

### Phase 2: Persistent Auth & Database Endpoints
- Password hashing with PBKDF2-HMAC-SHA256 and unique 16-byte salt per user.
- Endpoints: `POST /api/v1/auth/register`, `POST /api/v1/auth/login`, `GET /api/v1/auth/me`.
- Implemented local persistent store `project/backend/app/db/users_store.json` ensuring accounts persist across restarts.
- `User` model in `models.py` with roles (`Coordinator`, `Admin`, `Viewer`).

### Phase 3: Interactive Patient Screening & Queue Transitions
- **Screen Patient Drawer**: Modal dialog in `/patients` allowing custom patient inputs (age, gender, diagnoses, labs: HbA1c, eGFR, Creatinine, medications) wired directly to `POST /api/v1/screen`.
- **Review Queue Adjudication**: In `/review`, borderline cases show disagreements and allow one-click `Include` or `Exclude` with justification. Cards transition out with `.item-exit-animating` spring animation and move to the "Resolved Cases" tab.
- **Outreach Approval Workflow**: In `/outreach`, draft letters feature an inline `Approve` button that animates drafts out of "Pending approval" into "Approved".

### Phase 4: Apple-Grade Landing Page & Showcase
- Translucent Apple glass header with system status pill.
- Interactive 6-Agent Execution Pipeline explorer allowing visitors to click nodes and inspect stage inputs, outputs, and agent parameters.
- Live clinical patient matcher tester widget allowing one-click simulations.
- Technical deep-dives covering the 3-Layer Matcher, Cyclic Disagreement Protocol, and HIPAA Vault.

---

## 4. Key Endpoints Reference
- `GET /api/v1/health`: Service health check.
- `GET /api/v1/trials`: List active trial protocols.
- `GET /api/v1/patients`: Cohort query with filter by trial and eligibility decision.
- `POST /api/v1/screen`: Real-time multi-agent screening evaluation.
- `GET /api/v1/review/queue`: List cases flagged for human-in-the-loop review.
- `POST /api/v1/review/{session_id}/adjudicate`: Coordinator inclusion/exclusion adjudication.
- `GET /api/v1/outreach/drafts`: Outreach communications by approval status.
- `POST /api/v1/outreach/approve`: Coordinator approval for outreach dispatch.
- `GET /api/v1/audit`: Immutable HIPAA audit trail.
- `GET /api/v1/report`: Funnel metrics and SHAP summary.
