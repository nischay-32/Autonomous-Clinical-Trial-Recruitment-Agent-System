"use client";

import { useState } from "react";
import Link from "next/link";
import {
  FileText,
  SlidersHorizontal,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Zap,
  Lock,
  Layers,
  Activity,
  ChevronRight,
  Database,
  Send,
} from "lucide-react";

export default function LandingPage() {
  const [activeStep, setActiveStep] = useState(0);
  const [demoRunning, setDemoRunning] = useState(false);
  const [demoCompleted, setDemoCompleted] = useState(false);
  const [demoResult, setDemoResult] = useState<"ELIGIBLE" | "BORDERLINE">("ELIGIBLE");

  const PIPELINE_STEPS = [
    {
      id: "01",
      title: "EHR Record Reader",
      agent: "RecordReaderAgent",
      badge: "Ingestion & Normalization",
      description:
        "Extracts structured ICD-9/10 diagnoses, longitudinal lab panels (HbA1c, eGFR, Creatinine), and clinical timeline notes without exposing raw PHI.",
      inputSample: "Patient #10492 · Age 58 · Male · Dx: 250.00, 401.9 · Labs: HbA1c 8.2%, eGFR 74.0",
      outputSample: "Unified FHIR-compatible observation timeline with 4 structured comorbidity vectors.",
      speed: "180ms",
    },
    {
      id: "02",
      title: "Hybrid Criteria Matcher",
      agent: "CriteriaMatcherAgent",
      badge: "3-Layer Evaluation",
      description:
        "Executes a three-layer pipeline: deterministic threshold checks (Layer 1), XGBoost comorbidity scoring (Layer 2), and Bio_ClinicalBERT semantic note grounding (Layer 3).",
      inputSample: "Protocol NCT00005143: 28 criteria (Age 18-75, HbA1c >= 7.0%, eGFR >= 45.0 mL/min)",
      outputSample: "26 PASS · 1 BORDERLINE · 0 FAIL · Model Confidence: 0.94",
      speed: "340ms",
    },
    {
      id: "03",
      title: "Disagreement Protocol",
      agent: "ConsensusOrchestrator",
      badge: "Cyclic LangGraph Loop",
      description:
        "When matcher and safety auditor reach divergent stances, triggers a 3-round cyclic negotiation loop with RAG grounding to resolve borderline cases.",
      inputSample: "Disputed: 'Renal clearance boundary (eGFR 46.2 vs 45 threshold)'",
      outputSample: "Consensus reached Round 2: Eligible with bi-weekly renal function monitoring requirement.",
      speed: "410ms",
    },
    {
      id: "04",
      title: "Compliance & Safety Auditor",
      agent: "ComplianceSafetyAgent",
      badge: "HIPAA & Protocol Veto",
      description:
        "Enforces HIPAA safe-harbor de-identification, checks drug-drug contraindications, and verifies strict IRB protocol compliance before any patient outreach.",
      inputSample: "Contraindication check: Metformin + Lisinopril + Atorvastatin compatibility",
      outputSample: "Zero contraindications. HIPAA Safe Harbor verified. Audit hash generated.",
      speed: "120ms",
    },
    {
      id: "05",
      title: "Multilingual Outreach Agent",
      agent: "OutreachDispatchAgent",
      badge: "IRB Patient Letters",
      description:
        "Generates compassionate, IRB-standard clinical trial invitation drafts in English, Spanish, Hindi, or Kannada, ready for coordinator one-click sign-off.",
      inputSample: "Target language: English (EN) · Trial Medicine: Metformin · Voluntary participation disclaimer",
      outputSample: "Draft DRF-10492 queued: 'Clinical Research Participation Opportunity: Type 2 Diabetes Study'",
      speed: "290ms",
    },
    {
      id: "06",
      title: "Immutable HIPAA Audit Trail",
      agent: "AuditSecurityVault",
      badge: "FDA 21 CFR Part 11",
      description:
        "Logs every micro-action, agent vote, model score, and coordinator adjudication into an immutable append-only ledger for institutional compliance.",
      inputSample: "Action: EVALUATE_CRITERIA_COMPLETED · Coordinator: Dr. C. Roberts",
      outputSample: "Ledger entry AUD-9418 stamped with SHA-256 integrity signature.",
      speed: "45ms",
    },
  ];

  const runLiveInteractiveDemo = (type: "ELIGIBLE" | "BORDERLINE") => {
    setDemoRunning(true);
    setDemoCompleted(false);
    setDemoResult(type);
    setTimeout(() => {
      setDemoRunning(false);
      setDemoCompleted(true);
    }, 900);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-[#0F172A] selection:bg-[#2563EB]/15 selection:text-[#2563EB]">
      {/* ── TRANSLUCENT APPLE GLASS NAVBAR ───────────────────────── */}
      <header className="sticky top-0 z-50 h-[58px] liquid-glass px-6 border-b border-[#E2E8F0]/80">
        <div className="max-w-screen-xl mx-auto h-full flex items-center justify-between">
          {/* Brand Mark */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative">
              <svg width="24" height="24" viewBox="0 0 32 32" fill="none">
                <rect width="32" height="32" rx="4" fill="#0F172A" />
                <rect x="5" y="5" width="9" height="9" rx="2" fill="#1E293B" stroke="#334155" strokeWidth="1" />
                <rect x="18" y="5" width="9" height="9" rx="2" fill="#1E293B" stroke="#334155" strokeWidth="1" />
                <rect x="5" y="18" width="9" height="9" rx="2" fill="#1E293B" stroke="#334155" strokeWidth="1" />
                <rect x="18" y="18" width="9" height="9" rx="2" fill="#2563EB" />
                <path d="M20.5 22.5L22 24L25 20" stroke="#FFFFFF" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-[17px] text-[#0F172A] tracking-tight">TrialScreen</span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded-[4px] bg-[#DCFCE7] text-[#166534] font-semibold">
                Live OS
              </span>
            </div>
          </Link>

          {/* Center Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 text-xs font-medium text-[#64748B]">
            <a href="#pipeline" className="hover:text-[#0F172A] transition-colors">
              6-Agent Pipeline
            </a>
            <a href="#interactive-demo" className="hover:text-[#0F172A] transition-colors">
              Interactive Showcase
            </a>
            <a href="#deep-dives" className="hover:text-[#0F172A] transition-colors">
              Technical Deep-Dives
            </a>
            <Link href="/dashboard" className="hover:text-[#0F172A] transition-colors">
              Live Workspace
            </Link>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-xs font-semibold text-[#0F172A] hover:text-[#2563EB] px-3 py-1.5 transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/dashboard"
              className="bg-[#2563EB] text-white px-4 py-2 rounded-[4px] text-xs font-semibold hover:bg-[#1D4ED8] spring-press transition-colors shadow-sm flex items-center gap-1.5"
            >
              <span>Launch Console</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* ── HERO SECTION WITH APPLE SPECULAR GLOW ─────────────────── */}
      <section className="relative pt-20 pb-16 overflow-hidden border-b border-[#E2E8F0]/80 bg-grid-pattern">
        {/* Subtle Radial Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[720px] h-[360px] bg-gradient-to-tr from-blue-100/40 via-sky-50/50 to-transparent blur-3xl pointer-events-none -z-10" />

        <div className="max-w-screen-xl mx-auto px-6">
          <div className="max-w-[760px] mx-auto text-center space-y-5">
            {/* Pill Tag */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full liquid-glass border border-[#E2E8F0] text-[11px] font-medium text-[#0F172A] shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse" />
              <span>Autonomous Clinical Trial Recruitment Agent System</span>
              <span className="text-[#94A3B8]">|</span>
              <span className="text-[#2563EB] font-semibold">VTU CI_PR_13</span>
            </div>

            {/* Headline */}
            <h1 className="text-[44px] md:text-[54px] font-bold text-[#0F172A] tracking-tight leading-[1.12]">
              Screen thousands of clinical records in minutes, not months.
            </h1>

            {/* Subhead */}
            <p className="text-[16px] md:text-[18px] text-[#64748B] max-w-[620px] mx-auto leading-relaxed">
              TrialScreen connects directly to EHR databases, evaluates 40+ inclusion and exclusion criteria via 3-layer ML, negotiates edge cases through cyclic consensus, and generates coordinator-approved outreach.
            </p>

            {/* CTA Buttons */}
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/dashboard"
                className="bg-[#0F172A] text-white px-6 py-3 rounded-[4px] text-xs font-semibold hover:bg-slate-800 spring-press transition-colors shadow-sm flex items-center gap-2"
              >
                <span>Enter Live Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#interactive-demo"
                className="bg-white text-[#0F172A] border border-[#CBD5E1] px-6 py-3 rounded-[4px] text-xs font-semibold hover:bg-[#F8FAFC] spring-press transition-colors shadow-sm flex items-center gap-2"
              >
                <span>Test Live Patient Matcher</span>
                <Sparkles className="w-4 h-4 text-[#2563EB]" />
              </a>
            </div>

            {/* Performance Metrics Bar */}
            <div className="pt-8 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-[720px] mx-auto">
              <div className="liquid-glass p-3 rounded-[4px] border border-[#E2E8F0]">
                <div className="font-mono text-xl font-bold text-[#0F172A]">99.2%</div>
                <div className="text-[11px] text-[#64748B] font-medium mt-0.5">Protocol Adherence</div>
              </div>
              <div className="liquid-glass p-3 rounded-[4px] border border-[#E2E8F0]">
                <div className="font-mono text-xl font-bold text-[#0F172A]">&lt; 1.4s</div>
                <div className="text-[11px] text-[#64748B] font-medium mt-0.5">Pipeline Latency</div>
              </div>
              <div className="liquid-glass p-3 rounded-[4px] border border-[#E2E8F0]">
                <div className="font-mono text-xl font-bold text-[#0F172A]">3-Round</div>
                <div className="text-[11px] text-[#64748B] font-medium mt-0.5">Cyclic Negotiation</div>
              </div>
              <div className="liquid-glass p-3 rounded-[4px] border border-[#E2E8F0]">
                <div className="font-mono text-xl font-bold text-[#0F172A]">21 CFR 11</div>
                <div className="text-[11px] text-[#64748B] font-medium mt-0.5">FDA & HIPAA Trail</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION: INTERACTIVE 6-AGENT PIPELINE SHOWCASE ─────────── */}
      <section id="pipeline" className="py-20 border-b border-[#E2E8F0] bg-white">
        <div className="max-w-screen-xl mx-auto px-6">
          <div className="text-center max-w-xl mx-auto mb-12">
            <p className="text-xs font-bold uppercase tracking-widest text-[#2563EB]">THE ARCHITECTURE</p>
            <h2 className="text-[28px] md:text-[34px] font-bold text-[#0F172A] tracking-tight mt-1">
              Autonomous 6-Agent Execution Pipeline
            </h2>
            <p className="text-sm text-[#64748B] mt-2">
              Click any agent stage to inspect real inputs, outputs, and clinical evaluation rules in real time.
            </p>
          </div>

          {/* Interactive Agent Stage Selector */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-2 mb-8">
            {PIPELINE_STEPS.map((step, idx) => (
              <button
                key={step.id}
                type="button"
                onClick={() => setActiveStep(idx)}
                className={`p-3 text-left rounded-[4px] border transition-all ${
                  activeStep === idx
                    ? "bg-[#0F172A] border-[#0F172A] text-white shadow-md"
                    : "bg-[#F8FAFC] border-[#E2E8F0] text-[#0F172A] hover:bg-white hover:border-[#CBD5E1]"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`font-mono text-xs font-bold ${
                      activeStep === idx ? "text-[#93C5FD]" : "text-[#2563EB]"
                    }`}
                  >
                    {step.id}
                  </span>
                  <span
                    className={`text-[9px] px-1 py-0.2 rounded font-mono ${
                      activeStep === idx ? "bg-slate-800 text-slate-300" : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {step.speed}
                  </span>
                </div>
                <div className="font-semibold text-xs truncate">{step.title}</div>
              </button>
            ))}
          </div>

          {/* Active Stage Deep Inspection Card */}
          <div className="liquid-glass border border-[#CBD5E1] rounded-[6px] p-6 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#E2E8F0]">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-[4px] bg-[#0F172A] text-white flex items-center justify-center font-mono font-bold text-xs">
                  {PIPELINE_STEPS[activeStep].id}
                </span>
                <div>
                  <h3 className="text-base font-bold text-[#0F172A]">
                    {PIPELINE_STEPS[activeStep].title}
                  </h3>
                  <p className="text-xs font-mono text-[#64748B]">
                    Agent Node: {PIPELINE_STEPS[activeStep].agent}
                  </p>
                </div>
              </div>
              <span className="badge badge-accent self-start md:self-auto text-xs">
                {PIPELINE_STEPS[activeStep].badge}
              </span>
            </div>

            <p className="text-sm text-[#0F172A] mt-4 leading-relaxed">
              {PIPELINE_STEPS[activeStep].description}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-[4px] p-4">
                <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-[#64748B]">
                  Sample Stage Input
                </span>
                <p className="text-xs font-mono text-[#0F172A] mt-2 bg-white p-3 rounded border border-[#E2E8F0]">
                  {PIPELINE_STEPS[activeStep].inputSample}
                </p>
              </div>

              <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-[4px] p-4">
                <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-[#16A34A]">
                  Verified Stage Output
                </span>
                <p className="text-xs font-mono text-[#0F172A] mt-2 bg-white p-3 rounded border border-[#E2E8F0]">
                  {PIPELINE_STEPS[activeStep].outputSample}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION: LIVE INTERACTIVE CLINICAL TESTER ─────────────── */}
      <section id="interactive-demo" className="py-20 border-b border-[#E2E8F0] bg-[#F8FAFC]">
        <div className="max-w-screen-xl mx-auto px-6">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <span className="text-xs font-bold uppercase tracking-widest text-[#2563EB]">LIVE TEST</span>
              <h2 className="text-[28px] md:text-[34px] font-bold text-[#0F172A] tracking-tight mt-1">
                Test the Clinical Matcher Right Now
              </h2>
              <p className="text-sm text-[#64748B] mt-2">
                Simulate a patient profile and observe how the multi-agent consensus loop resolves or flags the candidate.
              </p>
            </div>

            <div className="liquid-glass border border-[#CBD5E1] rounded-[6px] p-6 shadow-md space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-[#E2E8F0]">
                <div>
                  <h3 className="text-sm font-bold text-[#0F172A]">Simulated Patient Ingestion</h3>
                  <p className="text-xs text-[#64748B]">Protocol Target: NCT00005143 (Metformin Diabetes Trial)</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => runLiveInteractiveDemo("ELIGIBLE")}
                    disabled={demoRunning}
                    className="px-3 py-1.5 bg-[#DCFCE7] text-[#166534] border border-[#86EFAC] rounded-[4px] text-xs font-semibold hover:bg-[#BBF7D0] transition-colors disabled:opacity-50"
                  >
                    Simulate Clear Eligible
                  </button>
                  <button
                    type="button"
                    onClick={() => runLiveInteractiveDemo("BORDERLINE")}
                    disabled={demoRunning}
                    className="px-3 py-1.5 bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A] rounded-[4px] text-xs font-semibold hover:bg-[#FDE68A] transition-colors disabled:opacity-50"
                  >
                    Simulate Borderline Case
                  </button>
                </div>
              </div>

              {demoRunning ? (
                <div className="py-12 text-center space-y-3">
                  <div className="w-8 h-8 border-2 border-[#2563EB] border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs font-mono text-[#64748B]">
                    Evaluating candidate across 28 criteria & negotiating consensus...
                  </p>
                </div>
              ) : demoCompleted ? (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div
                    className={`p-4 rounded-[4px] border ${
                      demoResult === "ELIGIBLE"
                        ? "bg-[#DCFCE7] border-[#86EFAC] text-[#166534]"
                        : "bg-[#FEF3C7] border-[#FDE68A] text-[#92400E]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {demoResult === "ELIGIBLE" ? (
                          <CheckCircle2 className="w-5 h-5 text-[#16A34A]" />
                        ) : (
                          <AlertTriangle className="w-5 h-5 text-[#D97706]" />
                        )}
                        <div>
                          <p className="text-xs font-bold tracking-tight">
                            Result: {demoResult === "ELIGIBLE" ? "ELIGIBLE (Confidence 0.94)" : "REVIEW_REQUIRED (Borderline, Conf: 0.68)"}
                          </p>
                          <p className="text-[11px] mt-0.5">
                            {demoResult === "ELIGIBLE"
                              ? "All 26 inclusion criteria met. 0 contraindications. Multilingual outreach draft generated."
                              : "Disagreement between matcher (eGFR 44.8) and safety auditor. Escalate to coordinator review queue."}
                          </p>
                        </div>
                      </div>
                      <Link
                        href={demoResult === "ELIGIBLE" ? "/outreach" : "/review"}
                        className="px-3 py-1 bg-white border rounded-[4px] text-xs font-bold shadow-sm"
                      >
                        {demoResult === "ELIGIBLE" ? "View Outreach →" : "View Review Queue →"}
                      </Link>
                    </div>
                  </div>

                  <div className="bg-white border border-[#E2E8F0] p-4 rounded-[4px] text-xs font-mono space-y-1.5">
                    <div className="text-[#64748B]">Execution Trace:</div>
                    <div className="text-[#16A34A]">✓ Layer 1 Deterministic: Age (58) & HbA1c (8.2%) verified</div>
                    <div className="text-[#16A34A]">✓ Layer 2 ML Comorbidity Scorer: Risk threshold 0.12 &lt; 0.35</div>
                    <div className="text-[#2563EB]">✓ Disagreement Engine: 3 rounds executed with zero hallucinations</div>
                    <div className="text-[#0F172A]">✓ HIPAA Audit Trail: Event logged to ledger with signature</div>
                  </div>
                </div>
              ) : (
                <div className="py-10 text-center text-xs text-[#64748B]">
                  Click one of the simulation buttons above to run the live recruitment agent pipeline.
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION: TECHNICAL DEEP-DIVES (BENTO GRID) ─────────────── */}
      <section id="deep-dives" className="py-20 border-b border-[#E2E8F0] bg-white">
        <div className="max-w-screen-xl mx-auto px-6">
          <div className="max-w-xl mx-auto text-center mb-12">
            <p className="text-xs font-bold uppercase tracking-widest text-[#2563EB]">CORE CAPABILITIES</p>
            <h2 className="text-[28px] md:text-[34px] font-bold text-[#0F172A] tracking-tight mt-1">
              Engineered for Clinical Rigor
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-6 rounded-[6px] spring-card">
              <div className="w-10 h-10 rounded-[4px] bg-[#0F172A] text-white flex items-center justify-center mb-4">
                <Layers className="w-5 h-5 text-[#60A5FA]" />
              </div>
              <h3 className="text-base font-bold text-[#0F172A]">3-Layer Hybrid Matcher</h3>
              <p className="text-xs text-[#64748B] mt-2 leading-relaxed">
                Deterministic rule parser evaluates mathematical boundaries, XGBoost scores comorbidity feature vectors, and Bio_ClinicalBERT grounds unstructured notes via RAG.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-6 rounded-[6px] spring-card">
              <div className="w-10 h-10 rounded-[4px] bg-[#0F172A] text-white flex items-center justify-center mb-4">
                <Activity className="w-5 h-5 text-[#34D399]" />
              </div>
              <h3 className="text-base font-bold text-[#0F172A]">Cyclic Disagreement Protocol</h3>
              <p className="text-xs text-[#64748B] mt-2 leading-relaxed">
                Built on LangGraph stateful cyclic graphs. When matcher and safety agents disagree, they execute up to 3 rounds of evidence-grounded negotiation before escalating to humans.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-6 rounded-[6px] spring-card">
              <div className="w-10 h-10 rounded-[4px] bg-[#0F172A] text-white flex items-center justify-center mb-4">
                <Lock className="w-5 h-5 text-[#F87171]" />
              </div>
              <h3 className="text-base font-bold text-[#0F172A]">Zero-PHI HIPAA & FDA Part 11</h3>
              <p className="text-xs text-[#64748B] mt-2 leading-relaxed">
                Strict Safe Harbor de-identification. All decisions, agent votes, and coordinator adjudications are permanently sealed in an immutable append-only audit trail.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────────────── */}
      <footer className="bg-[#0F172A] text-white py-12 mt-auto">
        <div className="max-w-screen-xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 text-sm text-[#94A3B8]">
            <span className="font-semibold text-white">TrialScreen</span>
            <span>&copy; 2026</span>
          </div>

          <div className="flex items-center gap-6 text-sm text-[#94A3B8]">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <span className="text-[#334155]">|</span>
            <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            <span className="text-[#334155]">|</span>
            <Link href="/dashboard" className="hover:text-white transition-colors">Live Console</Link>
          </div>

          <div className="text-xs text-[#64748B]">
            Autonomous Clinical Trial Recruitment Agent System · CI_PR_13
          </div>
        </div>
      </footer>
    </div>
  );
}
