from dataclasses import dataclass, field
from typing import Optional
import time


@dataclass
class ConversationTurn:
    user_prompt: str
    intent: dict
    sql: str
    result_sample: list          # first 3 rows for context
    chart_config: dict
    timestamp: float = field(default_factory=time.time)


@dataclass
class ConversationSession:
    session_id: str
    dataset_id: str
    table_name: str
    schema: dict
    turns: list[ConversationTurn] = field(default_factory=list)

    # ── Quick-access properties ────────────────────────────
    @property
    def last_turn(self) -> Optional[ConversationTurn]:
        return self.turns[-1] if self.turns else None

    @property
    def previous_sql(self) -> Optional[str]:
        return self.last_turn.sql if self.last_turn else None

    @property
    def previous_intent(self) -> Optional[dict]:
        return self.last_turn.intent if self.last_turn else None

    @property
    def previous_filters(self) -> list:
        if self.last_turn and self.last_turn.intent:
            return self.last_turn.intent.get("filters", [])
        return []

    def add_turn(self, turn: ConversationTurn):
        self.turns.append(turn)
        # Keep only the last 20 turns to avoid unbounded memory
        if len(self.turns) > 20:
            self.turns = self.turns[-20:]

    def history_for_prompt(self, max_turns: int = 3) -> str:
        """
        Render the last N turns as a compact context block for LLM prompts.
        Keeps token usage low.
        """
        recent = self.turns[-max_turns:]
        if not recent:
            return "No prior conversation."

        lines = []
        for i, t in enumerate(recent, 1):
            lines.append(f"[Turn {i}]")
            lines.append(f"  User: {t.user_prompt}")
            lines.append(f"  Intent: {t.intent}")
            lines.append(f"  SQL: {t.sql}")
        return "\n".join(lines)


# ── Global in-memory store ──────────────────────────────────
# { session_id: ConversationSession }
_sessions: dict[str, ConversationSession] = {}


def create_session(
    session_id: str,
    dataset_id: str,
    table_name: str,
    schema: dict,
) -> ConversationSession:
    session = ConversationSession(
        session_id=session_id,
        dataset_id=dataset_id,
        table_name=table_name,
        schema=schema,
    )
    _sessions[session_id] = session
    return session


def get_session(session_id: str) -> Optional[ConversationSession]:
    return _sessions.get(session_id)


def get_or_create_session(
    session_id: str,
    dataset_id: str,
    table_name: str,
    schema: dict,
) -> ConversationSession:
    session = get_session(session_id)
    if session is None:
        session = create_session(session_id, dataset_id, table_name, schema)
    return session


def delete_session(session_id: str):
    _sessions.pop(session_id, None)
