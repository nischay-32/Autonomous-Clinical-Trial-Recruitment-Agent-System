from datetime import datetime, timezone
from sqlalchemy import String, Float, Boolean, DateTime, JSON, Text
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column

class Base(DeclarativeBase):
    pass

class Trial(Base):
    __tablename__ = "trials"
    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    title: Mapped[str] = mapped_column(String(255))
    medicine: Mapped[str] = mapped_column(String(128))
    criteria_rules: Mapped[dict] = mapped_column(JSON, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))

class Patient(Base):
    __tablename__ = "patients"
    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    gender: Mapped[str] = mapped_column(String(10), default="")
    age: Mapped[int] = mapped_column(default=0)
    profile: Mapped[dict] = mapped_column(JSON, default=dict)

class Screening(Base):
    __tablename__ = "screenings"
    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    trial_id: Mapped[str] = mapped_column(String(64), index=True)
    patient_id: Mapped[str] = mapped_column(String(64), index=True)
    status: Mapped[str] = mapped_column(String(32), default="PENDING")  # ELIGIBLE, INELIGIBLE, REVIEW_REQUIRED
    confidence: Mapped[float] = mapped_column(Float, default=0.0)
    evidence: Mapped[dict] = mapped_column(JSON, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))

class Disagreement(Base):
    __tablename__ = "disagreements"
    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    screening_id: Mapped[str] = mapped_column(String(64), index=True)
    round_number: Mapped[int] = mapped_column(default=1)
    matcher_vote: Mapped[str] = mapped_column(String(32))
    compliance_vote: Mapped[str] = mapped_column(String(32))
    consensus_reached: Mapped[bool] = mapped_column(Boolean, default=False)
    evidence_span: Mapped[str] = mapped_column(Text, default="")

class Outreach(Base):
    __tablename__ = "outreach"
    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    screening_id: Mapped[str] = mapped_column(String(64), index=True)
    patient_id: Mapped[str] = mapped_column(String(64))
    language: Mapped[str] = mapped_column(String(10), default="en")
    draft_content: Mapped[str] = mapped_column(Text)
    is_approved: Mapped[bool] = mapped_column(Boolean, default=False)
    approved_by: Mapped[str] = mapped_column(String(128), default="")
    approved_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

class AuditLog(Base):
    __tablename__ = "audit_logs"
    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    timestamp: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    agent_name: Mapped[str] = mapped_column(String(64))
    action: Mapped[str] = mapped_column(String(128))
    details: Mapped[dict] = mapped_column(JSON, default=dict)

class Organization(Base):
    __tablename__ = "organizations"
    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    name: Mapped[str] = mapped_column(String(255))
    irb_number: Mapped[str] = mapped_column(String(128), default="")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))

class User(Base):
    __tablename__ = "users"
    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    full_name: Mapped[str] = mapped_column(String(255))
    job_title: Mapped[str] = mapped_column(String(128), default="")
    organization_id: Mapped[str] = mapped_column(String(64), default="")
    role: Mapped[str] = mapped_column(String(32), default="Coordinator")  # Coordinator, Admin, Viewer
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
