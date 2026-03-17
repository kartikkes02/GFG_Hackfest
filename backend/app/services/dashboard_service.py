"""
dashboard_service.py
────────────────────
Orchestrates the full AI pipeline for a single chat turn:

  user_prompt
      ↓
  Intent Agent  (parse structured intent)
      ↓
  [merge with previous intent if follow-up]
      ↓
  SQL Agent     (generate SQL from intent)
      ↓
  SQL Guardrail (validate SQL)
      ↓
  Query Execution (run on PostgreSQL)
      ↓
  Chart Agent   (decide visualizations)
      ↓
  Dashboard JSON (returned to frontend)
"""

import logging
from app.agents.intent_agent import parse_intent, merge_intent_with_followup
from app.agents.sql_agent import generate_sql, validate_sql, SQLValidationError
from app.agents.chart_agent import plan_charts, build_dashboard_config
from app.services.query_service import run_query
from app.memory.conversation_store import (
    ConversationTurn,
    get_or_create_session,
)
from app.utils.schema_generator import schema_to_prompt_text

logger = logging.getLogger(__name__)


class PipelineError(Exception):
    """Raised when any agent step fails in a user-visible way."""
    def __init__(self, message: str, stage: str):
        super().__init__(message)
        self.stage = stage


async def run_dashboard_pipeline(
    session_id: str,
    dataset_id: str,
    table_name: str,
    schema: dict,
    user_prompt: str,
) -> dict:
    """
    Full pipeline. Returns a dashboard config dict ready to send to
    the Next.js frontend.

    Raises PipelineError with a `stage` attribute on failure.
    """

    # ── 0. Session / memory ──────────────────────────────────
    session = get_or_create_session(
        session_id=session_id,
        dataset_id=dataset_id,
        table_name=table_name,
        schema=schema,
    )
    schema_text = schema_to_prompt_text(table_name, schema)
    conversation_history = session.history_for_prompt(max_turns=3)

    logger.info("[pipeline] session=%s prompt=%r", session_id, user_prompt)

    # ── 1. Intent parsing ────────────────────────────────────
    try:
        intent = await parse_intent(
            user_prompt=user_prompt,
            schema_text=schema_text,
            conversation_history=conversation_history,
        )
        logger.debug("[intent] %s", intent)
    except Exception as e:
        raise PipelineError(str(e), stage="intent") from e

    # ── 2. Merge with previous intent if follow-up ───────────
    if intent.get("is_followup") and session.previous_intent:
        intent = merge_intent_with_followup(
            previous_intent=session.previous_intent,
            new_intent=intent,
        )
        logger.debug("[intent merged] %s", intent)

    # ── 3. SQL generation ────────────────────────────────────
    try:
        sql = await generate_sql(
            table_name=table_name,
            schema_text=schema_text,
            intent=intent,
            previous_sql=session.previous_sql or "",
        )
        logger.debug("[sql generated] %s", sql)
    except Exception as e:
        raise PipelineError(str(e), stage="sql_generation") from e

    # ── 4. SQL guardrail ─────────────────────────────────────
    try:
        sql = validate_sql(sql, table_name, schema)
        logger.debug("[sql validated] ok")
    except SQLValidationError as e:
        raise PipelineError(str(e), stage="sql_validation") from e

    # ── 5. Query execution ───────────────────────────────────
    try:
        rows = await run_query(sql)
        logger.debug("[query] returned %d rows", len(rows))
    except RuntimeError as e:
        raise PipelineError(str(e), stage="query_execution") from e

    if not rows:
        raise PipelineError(
            "The query returned no results. Try broadening your filters.",
            stage="query_execution",
        )

    # ── 6. Chart planning ────────────────────────────────────
    columns = list(rows[0].keys()) if rows else []
    sample_rows = rows[:5]

    try:
        charts = await plan_charts(
            columns=columns,
            sample_rows=sample_rows,
            intent=intent,
        )
        logger.debug("[charts] %s", charts)
    except Exception as e:
        raise PipelineError(str(e), stage="chart_planning") from e

    # ── 7. Build final dashboard config ──────────────────────
    dashboard = build_dashboard_config(
        charts=charts,
        rows=rows,
        user_prompt=user_prompt,
        sql=sql,
    )

    # ── 8. Save turn to memory ───────────────────────────────
    turn = ConversationTurn(
        user_prompt=user_prompt,
        intent=intent,
        sql=sql,
        result_sample=sample_rows,
        chart_config={"charts": charts},
    )
    session.add_turn(turn)

    return dashboard
