import json
from app.db.postgres import fetch, fetchval
from app.agents.sql_agent import SQLValidationError


# Safety cap: never return more than this many rows to the frontend
MAX_ROWS = 5000


async def run_query(sql: str) -> list[dict]:
    """
    Execute a validated SELECT query and return rows as list of dicts.
    Raises RuntimeError on DB errors.
    """
    try:
        rows = await fetch(sql)
    except Exception as e:
        raise RuntimeError(f"Query execution failed: {e}") from e

    if len(rows) > MAX_ROWS:
        rows = rows[:MAX_ROWS]

    # Serialize any non-JSON-safe types (dates, Decimals, etc.)
    return [_serialize_row(r) for r in rows]


def _serialize_row(row: dict) -> dict:
    """Convert Postgres types that aren't JSON-serializable."""
    import datetime
    import decimal

    out = {}
    for k, v in row.items():
        if isinstance(v, (datetime.date, datetime.datetime)):
            out[k] = v.isoformat()
        elif isinstance(v, decimal.Decimal):
            out[k] = float(v)
        elif v is None:
            out[k] = None
        else:
            out[k] = v
    return out


async def get_dataset_metadata(dataset_id: str) -> dict | None:
    """Fetch dataset metadata row by ID."""
    from app.db.postgres import fetchrow
    row = await fetchrow(
        "SELECT * FROM dataset_metadata WHERE id = $1",
        dataset_id,
    )
    if row is None:
        return None

    # schema_json is stored as TEXT — parse it back
    row["schema"] = json.loads(row["schema_json"])
    return row


async def list_datasets() -> list[dict]:
    """Return all uploaded datasets (id, filename, row_count, created_at)."""
    from app.db.postgres import fetch as db_fetch
    rows = await db_fetch(
        """
        SELECT id, filename, table_name, row_count, created_at
        FROM dataset_metadata
        ORDER BY created_at DESC
        """
    )
    return rows
