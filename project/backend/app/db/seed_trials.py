import json
from pathlib import Path
from .database import async_session
from .models import Trial
from .criteria_parser import save_versioned_rules

RULES_PATH = Path(__file__).resolve().parent / "trials_criteria_v1.json"
EXCEL_PATH = Path(__file__).resolve().parents[4] / "Documents" / "Drug_Criteria_Full_40plus_CI_PR_13.xlsx"

async def seed_trials() -> dict:
    if not RULES_PATH.exists() and EXCEL_PATH.exists():
        save_versioned_rules(str(EXCEL_PATH), str(RULES_PATH))
    
    with open(RULES_PATH, "r", encoding="utf-8") as f:
        trials_data = json.load(f)

    async with async_session() as session:
        for tid, tinfo in trials_data.items():
            trial = await session.get(Trial, tid)
            if not trial:
                trial = Trial(
                    id=tid,
                    title=tinfo["title"],
                    medicine=tinfo["medicine"],
                    criteria_rules=tinfo,
                )
                session.add(trial)
            else:
                trial.title = tinfo["title"]
                trial.medicine = tinfo["medicine"]
                trial.criteria_rules = tinfo
        await session.commit()
    
    return trials_data
