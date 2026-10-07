# Autonomous Clinical Trial Recruitment Agent System

[![Ponytail Reviewed](https://img.shields.io/badge/code%20review-ponytail%20minimal-success?style=flat-square)](https://github.com/DietrichGebert/ponytail)
[![Python](https://img.shields.io/badge/python-3.12%2B-blue?style=flat-square)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.111%2B-teal?style=flat-square)](https://fastapi.tiangolo.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

An intelligent multi-agent system for autonomous clinical trial recruitment. It ingests trial protocols, evaluates candidate patient records against structured eligibility criteria, resolves edge cases through an agentic disagreement negotiation loop, and produces coordinator-approved outreach drafts.

---

## 🔒 Security & Privacy by Design
This public repository contains **strictly product code and architecture definitions**. 
* **Zero PHI / De-identified Records**: No patient records or MIMIC-III database dumps are committed.
* **Zero Secrets**: No API keys, credentials, or production connection strings are included; all configuration is environment-injected via `.env.example`.
* **Zero Bloat**: All modules are pruned and audited using **[Ponytail](https://github.com/DietrichGebert/ponytail)** to guarantee minimal, efficient, and direct implementations.

---

## ⚡ Core Multi-Agent Architecture

```
[ Trial Protocol ]
       │
       ▼
┌──────────────────┐
│  Record Reader   │─── Extracts & normalizes patient clinical timeline
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Criteria Matcher │─── Deterministic + ML comorbidity eligibility scoring
└────────┬─────────┘
         │
         ▼
┌───────────────────────────┐
│ Disagreement Protocol     │◄──► [ Compliance & Safety Agent ]
│ (Cyclic Multi-Agent Loop) │      (Contraindication check / safety veto)
└────────┬──────────────────┘
         │
         ├─────────────────────────────────────────┐
         ▼                                         ▼
   [ Consensus: ELIGIBLE ]                  [ Ambiguous / Borderline ]
         │                                         │
         ▼                                         ▼
┌──────────────────┐                     ┌──────────────────┐
│  Outreach Agent  │                     │ Coordinator      │
│  (Draft Letters) │                     │ Review Queue     │
└────────┬─────────┘                     └──────────────────┘
         │
         ▼
   Coordinator Approval & Dispatch
```

---

## 📁 Repository Structure

```
├── .agents/                    # Ponytail rules & skills configuration
├── AGENTS.md                   # Agentic guidelines (Ponytail minimal dev mode)
├── project/                    # PRODUCT DEVELOPMENT & CODEBASE
│   ├── backend/                # FastAPI application
│   │   ├── app/
│   │   │   ├── main.py         # App entrypoint & CORS
│   │   │   ├── api/            # API routers (trials, screening, outreach)
│   │   │   ├── agents/         # Multi-agent recruitment pipeline
│   │   │   │   ├── orchestrator.py
│   │   │   │   ├── record_reader.py
│   │   │   │   ├── criteria_matcher.py
│   │   │   │   ├── compliance.py
│   │   │   │   ├── disagreement_protocol.py
│   │   │   │   └── outreach.py
│   │   │   ├── core/           # Settings & security
│   │   │   └── db/             # SQLAlchemy data models
│   │   ├── tests/              # Unit & integration tests
│   │   ├── Dockerfile          # Production containerfile
│   │   └── requirements.txt    # Minimal dependencies
│   └── infra/                  # Infrastructure definitions
│       └── docker-compose.yml  # PostgreSQL, pgvector, Redis
├── .gitignore                  # Strict security & dataset exclusion rules
├── LICENSE                     # MIT License
└── README.md
```

---

## 🚀 Quickstart

### 1. Run with Docker Compose
```bash
cd project/infra
docker compose up -d
```

### 2. Run Backend Locally
```bash
cd project/backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
API Documentation will be available at `http://localhost:8000/api/v1/docs`.

### 3. Run Agent Pipeline Tests
```bash
cd project/backend
python -m unittest discover tests
```

---

## 📜 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
