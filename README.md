# Autonomous Clinical Trial Recruitment Agent System

[![Python](https://img.shields.io/badge/python-3.12%2B-blue?style=flat-square)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.111%2B-teal?style=flat-square)](https://fastapi.tiangolo.com/)
[![Next.js](https://img.shields.io/badge/Next.js-16.4-black?style=flat-square)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61dafb?style=flat-square)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0%2B-blue?style=flat-square)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

An enterprise-grade autonomous multi-agent clinical trial recruitment platform. The system ingests clinical trial protocols, evaluates Electronic Health Records (EHR) against complex structured inclusion/exclusion criteria, arbitrates borderline cases through a multi-agent cyclic disagreement protocol, and generates coordinator-approved, IRB-compliant patient outreach invitations.

---

## 🌟 Key Features

* **7-Agent Autonomous Pipeline**: End-to-end recruitment pipeline combining deterministic rule engines, ML comorbidity models, NLP grounded semantic extractions, safety compliance audits, multi-round deliberation consensus, and patient communication agents.
* **MIMIC-III Dataset Ingestion**: Ingests longitudinal EHR cohorts across demographic admissions, ICD-9 diagnoses, lab panels (HbA1c, eGFR, Creatinine, INR, Platelets), and clinical notes.
* **Calibrated Multi-Agent Confidence Scoring**: Computes patient-specific decision confidence scores based on criteria met/failed ratios, borderline threshold proximities, ML model distributions, and contraindication safety penalties.
* **Human-in-the-Loop Review Queue**: Dedicated coordinator review interface for borderline cases featuring multi-round negotiation transcripts, clinical evidence grounding, and persistent adjudication.
* **Complete Outreach Lifecycle**: Drafts multilingual invitation letters with patient de-identification, supporting coordinator sign-off, immediate rejection with reason logging, and automated queue dispatching.
* **Immutable HIPAA Audit Trail**: Every agent action, rule evaluation, compliance veto, and coordinator decision is logged with cryptographic timestamps and actor attribution.
* **Apple HIG Design Aesthetic**: Premium web interface styled according to Apple Human Interface Guidelines—fluid micro-interactions, clean typography, responsive data tables, and interactive landing showcases.

---

## ⚡ 7-Agent Architecture Pipeline

```
                     [ Trial Protocol & MIMIC-III EHR Cohort ]
                                         │
                                         ▼
                             ┌───────────────────────┐
                             │  Record Reader Agent  │
                             │ (EHR Normalization)   │
                             └───────────┬───────────┘
                                         │
                                         ▼
                             ┌───────────────────────┐
                             │ Criteria Matcher Agent│
                             │ • Layer 1: Rules      │
                             │ • Layer 2: ML Model   │
                             │ • Layer 3: NLP Notes  │
                             └───────────┬───────────┘
                                         │
                                         ▼
 ┌───────────────────────────┐       Arbitration       ┌───────────────────────────┐
 │ Compliance & Safety Agent │◄───────────────────────►│   Disagreement Protocol   │
 │ • Contraindication Checks │                         │ (3-Round Negotiation Loop)│
 │ • Drug-Drug Interactions  │                         └─────────────┬─────────────┘
 │ • HIPAA Safe Harbor Guard │                                       │
 └───────────────────────────┘                                       │
                                         ┌───────────────────────────┴───────────────────────────┐
                                         ▼                                                       ▼
                                [ Consensus: ELIGIBLE ]                                [ Ambiguous / Borderline ]
                                         │                                                       │
                                         ▼                                                       ▼
                             ┌───────────────────────┐                               ┌───────────────────────┐
                             │ Patient Outreach Agent│                               │  Coordinator Review   │
                             │ (Multilingual Letters)│                               │  Queue & Adjudication │
                             └───────────┬───────────┘                               └───────────┬───────────┘
                                         │                                                       │
                                         ▼                                                       ▼
                           ┌───────────────────────────┐                           ┌───────────────────────────┐
                           │ Coordinator Approval &    │                           │ Human Decision: Include / │
                           │ Automated Dispatch Queue  │                           │ Exclude with Audit Record │
                           └─────────────┬─────────────┘                           └─────────────┬─────────────┘
                                         │                                                       │
                                         └───────────────────────────┬───────────────────────────┘
                                                                     ▼
                                                       ┌───────────────────────────┐
                                                       │ Immutable HIPAA Log Agent │
                                                       │ & Reporting Funnel Engine │
                                                       └───────────────────────────┘
```

### Agent Roles & Logic

1. **Record Reader Agent (`RecordReaderAgent`)**:
   * Parses disparate clinical tables (demographics, ICD-9 diagnoses, lab events, prescriptions, notes).
   * Calculates chronological baseline ages and normalizes lab measurements into canonical units.
2. **Criteria Matcher Agent (`CriteriaMatcherAgent`)**:
   * **Layer 1 (Deterministic Engine)**: Evaluates mathematical criteria (age brackets, CHA2DS2-VASc risk thresholds, lab cutoffs, hard exclusions).
   * **Layer 2 (ML Comorbidity Scorer)**: Machine-learning model that computes trial-matching probabilities based on patient comorbidity feature vectors.
   * **Layer 3 (NLP Grounded Extractor)**: Sentence-level semantic search across clinical progress notes with negation detection and character-span citations.
   * **Layer 4 (Ensemble Aggregator)**: Synthesizes layer outputs into criteria met, borderline, and failed metrics.
3. **Compliance & Safety Agent (`ComplianceAgent`)**:
   * Audits patient records for drug-specific contraindications (e.g., severe renal impairment for Metformin, active hemorrhage for Warfarin).
   * Flags adverse drug-drug interactions and enforces HIPAA Safe Harbor de-identification rules.
4. **Disagreement Protocol Agent (`DisagreementProtocolAgent`)**:
   * Executes a structured 3-round cyclic deliberation between Criteria Matcher and Compliance stances:
     * **Round 1 (Strict Constraints)**: Enforces immediate safety vetoes or confirms unanimous high-confidence matches.
     * **Round 2 (Evidence Augmentation)**: Inspects grounded clinical notes via RAG to resolve borderline criteria.
     * **Round 3 (Human Escalation Gate)**: Escalates unresolved ambiguity to clinical coordinators with an evidence-grounded escalation card.
5. **Patient Outreach Agent (`OutreachAgent`)**:
   * Generates tailored clinical trial invitation letters in multiple supported languages (English, Spanish, Mandarin, etc.).
   * Strictly de-identifies all direct identifiers using randomized patient tokens (`PT-XXXXX`).
6. **Reporting & Explainability Agent (`ReportingAgent`)**:
   * Generates recruitment funnel analytics (screened, eligible, borderline, outreach drafted, conversion rates) and SHAP feature contributions.
7. **Immutable Audit Logger Agent (`AuditLogger`)**:
   * Records every automated step and human coordinator intervention with ISO timestamps and actor roles for regulatory compliance.

---

## 📁 Repository Structure

```
├── .agents/                    # Agentic workflows, rules, and skills
├── project/                    # PRODUCT APPLICATION
│   ├── backend/                # FastAPI Application & Multi-Agent Pipeline
│   │   ├── app/
│   │   │   ├── main.py         # Application entrypoint, CORS, and auth middleware
│   │   │   ├── api/
│   │   │   │   └── router.py   # API endpoints (trials, patients, review, outreach, audit)
│   │   │   ├── agents/         # Multi-agent recruitment logic
│   │   │   │   ├── orchestrator.py          # Central workflow coordinator
│   │   │   │   ├── record_reader.py         # EHR data ingestion & normalization
│   │   │   │   ├── criteria_matcher/        # Hybrid 3-layer matching engine
│   │   │   │   │   ├── deterministic.py     # Layer 1: Rule engine
│   │   │   │   │   ├── ml_scorer.py         # Layer 2: ML scoring
│   │   │   │   │   ├── nlp_scorer.py        # Layer 3: NLP semantic extraction
│   │   │   │   │   └── ensemble.py          # Layer 4: Ensemble aggregator
│   │   │   │   ├── compliance.py            # Safety, contraindications & HIPAA checks
│   │   │   │   ├── disagreement_protocol.py # 3-round cyclic deliberation loop
│   │   │   │   ├── outreach.py              # Multilingual invitation generator
│   │   │   │   └── reporting.py             # Funnel analytics & audit reporting
│   │   │   ├── core/           # Configuration & security settings
│   │   │   └── db/             # Data loaders, audit storage, and trial schemas
│   │   ├── tests/              # E2E pipeline, unit, and integration tests
│   │   ├── Dockerfile          # Production backend containerfile
│   │   └── requirements.txt    # Python dependencies
│   │
│   ├── frontend/               # Next.js 16 Web Application
│   │   ├── app/
│   │   │   ├── page.tsx        # Interactive product landing page
│   │   │   ├── dashboard/      # Executive recruitment overview & funnel charts
│   │   │   ├── trials/         # Protocol registry & trial-specific patient cohorts
│   │   │   ├── patients/       # Patient screening table with confidence filtering
│   │   │   ├── review/         # Human-in-the-loop review queue & resolved cases
│   │   │   ├── outreach/       # Outreach drafts, approval, rejection & sent queues
│   │   │   ├── audit/          # HIPAA cryptographic audit log viewer
│   │   │   ├── login/          # Coordinator authentication
│   │   │   └── register/       # User onboarding
│   │   ├── components/         # Reusable UI components (AppShell, Sidebar, PublicChrome)
│   │   ├── lib/                # Typed API client with auth interceptors
│   │   ├── package.json        # Frontend dependencies
│   │   └── tailwind.config.ts  # TailwindCSS v4 theme tokens
│   │
│   └── infra/                  # Infrastructure definitions
│       └── docker-compose.yml  # Containerized services
├── .gitignore                  # Security & dataset exclusion rules
├── CONVERSATION_HISTORY.md     # Architectural log & system context
├── LICENSE                     # MIT License
└── README.md
```

---

## 🚀 Quickstart

### Prerequisites
* **Python 3.12+**
* **Node.js 20+** and **npm**

---

### 1. Backend Setup

```bash
# Navigate to the backend directory
cd project/backend

# Create and activate virtual environment
python -m venv venv
# Windows:
venv\Scripts\activate
# Linux/macOS:
# source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run backend development server
uvicorn app.main:app --reload --port 8000
```

The API will be available at:
* **API Root**: `http://localhost:8000/api/v1`
* **Interactive Docs (Swagger UI)**: `http://localhost:8000/api/v1/docs`

---

### 2. Frontend Setup

In a separate terminal:

```bash
# Navigate to the frontend directory
cd project/frontend

# Install dependencies
npm install

# Run frontend development server
npm run dev
```

The web application will be accessible at `http://localhost:3000`.

---

### 3. Demo Login Credentials

The system comes pre-seeded with a demonstration coordinator account:

* **Email**: `croberts@memorial-cancer.org`
* **Password**: `demo123`
* **Role**: Lead Clinical Research Coordinator

---

## 🧪 Testing & Verification

Run the comprehensive multi-agent test suite:

```bash
cd project/backend

# Run end-to-end multi-agent pipeline tests
python -m unittest tests/test_e2e_pipeline.py

# Run hybrid criteria matcher tests
python -m unittest tests/test_hybrid_matcher.py

# Run all backend test cases
python -m unittest discover tests
```

To validate the frontend build:

```bash
cd project/frontend
npm run build
```

---

## 🔒 Security & Privacy by Design

* **Zero Protected Health Information (PHI)**: No raw patient identifiers or medical records are checked into version control.
* **HIPAA Safe Harbor De-identification**: Automated regex verification strips SSNs, phone numbers, and direct identifiers prior to agent processing.
* **Environment Configuration**: Secrets and database credentials are managed through environment variables (see `.env.example`).
* **Role-Based Access Control**: Protected routes require valid bearer tokens and coordinator session authentication.

---

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
