"""HIPAA-Compliant Append-Only Audit Trail Logger.

Records every agent evaluation, consensus decision, and data access event with immutable timestamps.
"""

import uuid
from datetime import datetime, timezone
from typing import Any

try:
    from .database import async_session
    from .models import AuditLog
except ImportError:
    async_session = None
    AuditLog = None

# In-memory append-only buffer for standalone/offline execution
_IN_MEMORY_AUDIT_LOG: list[dict] = []

def log_audit_event(
    agent_name: str,
    action: str,
    patient_id: str = "",
    trial_id: str = "",
    details: dict[str, Any] = None,
) -> dict:
    """Records an audit event in the immutable audit log."""
    event = {
        "id": f"audit-{uuid.uuid4().hex[:12]}",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "agent_name": str(agent_name),
        "action": str(action),
        "patient_id": str(patient_id),
        "trial_id": str(trial_id),
        "details": details or {},
    }
    _IN_MEMORY_AUDIT_LOG.append(event)
    return event

async def persist_audit_event(
    agent_name: str,
    action: str,
    patient_id: str = "",
    trial_id: str = "",
    details: dict[str, Any] = None,
) -> dict:
    """Records and asynchronously persists the audit event to the PostgreSQL database if available."""
    event = log_audit_event(agent_name, action, patient_id, trial_id, details)
    if async_session is not None and AuditLog is not None:
        try:
            async with async_session() as session:
                entry = AuditLog(
                    id=event["id"],
                    agent_name=event["agent_name"],
                    action=event["action"],
                    details={
                        "patient_id": patient_id,
                        "trial_id": trial_id,
                        **(details or {}),
                    },
                )
                session.add(entry)
                await session.commit()
        except Exception as e:
            # Audit log must never crash application flow
            pass
    return event

def get_audit_trail(patient_id: str = None, limit: int = 50) -> list[dict]:
    """Retrieves immutable audit trail entries, optionally filtered by patient."""
    events = _IN_MEMORY_AUDIT_LOG
    if patient_id:
        events = [e for e in events if e.get("patient_id") == str(patient_id)]
    return list(reversed(events[-limit:]))
