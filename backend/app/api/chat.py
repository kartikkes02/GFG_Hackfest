import json
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.services.dashboard_service import run_dashboard_pipeline, PipelineError
from app.services.query_service import get_dataset_metadata
from app.memory.conversation_store import get_session, delete_session

router = APIRouter()


class ChatRequest(BaseModel):
    session_id: str
    dataset_id: str
    prompt: str


class ChatResponse(BaseModel):
    session_id: str
    prompt: str
    sql: str
    dashboard: dict
    row_count: int


@router.post("/chat", response_model=ChatResponse)
async def chat(req: ChatRequest):
    # ── Load dataset metadata ────────────────────────────────
    meta = await get_dataset_metadata(req.dataset_id)
    if not meta:
        raise HTTPException(404, f"Dataset '{req.dataset_id}' not found.")

    table_name = meta["table_name"]
    schema = meta["schema"]

    # ── Run the full agent pipeline ──────────────────────────
    try:
        dashboard = await run_dashboard_pipeline(
            session_id=req.session_id,
            dataset_id=req.dataset_id,
            table_name=table_name,
            schema=schema,
            user_prompt=req.prompt,
        )
    except PipelineError as e:
        raise HTTPException(
            422,
            detail={
                "error": str(e),
                "stage": e.stage,
                "hint": _stage_hint(e.stage),
            },
        )
    except Exception as e:
        raise HTTPException(500, detail=str(e))

    return ChatResponse(
        session_id=req.session_id,
        prompt=req.prompt,
        sql=dashboard["sql"],
        dashboard=dashboard,
        row_count=dashboard["row_count"],
    )


@router.get("/sessions/{session_id}")
async def get_session_info(session_id: str):
    """Return conversation history for a session (for debugging)."""
    session = get_session(session_id)
    if not session:
        raise HTTPException(404, "Session not found.")
    return {
        "session_id": session.session_id,
        "dataset_id": session.dataset_id,
        "table_name": session.table_name,
        "turn_count": len(session.turns),
        "turns": [
            {
                "prompt": t.user_prompt,
                "intent": t.intent,
                "sql": t.sql,
            }
            for t in session.turns
        ],
    }


@router.delete("/sessions/{session_id}")
async def clear_session(session_id: str):
    """Clear conversation memory for a session."""
    delete_session(session_id)
    return {"deleted": session_id}


def _stage_hint(stage: str) -> str:
    hints = {
        "intent": "The AI couldn't understand your question. Try rephrasing it.",
        "sql_generation": "The AI failed to generate SQL. Check your dataset schema.",
        "sql_validation": "Generated SQL was unsafe or referenced invalid columns.",
        "query_execution": "The SQL ran but returned a database error.",
        "chart_planning": "Could not determine a chart type for the results.",
    }
    return hints.get(stage, "An unexpected error occurred.")
