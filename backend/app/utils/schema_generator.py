import json
import pandas as pd
from app.db.postgres import execute, fetch


def build_create_table_sql(table_name: str, schema: dict) -> str:
    """
    Generate a CREATE TABLE statement from the inferred schema dict.

    schema format: {col_name: {"pg_type": str, "sample": list}}
    """
    col_defs = []
    for col, info in schema.items():
        pg_type = info["pg_type"]
        col_defs.append(f'    "{col}" {pg_type}')

    cols_sql = ",\n".join(col_defs)
    return f'CREATE TABLE IF NOT EXISTS "{table_name}" (\n{cols_sql}\n);'


def schema_to_prompt_text(table_name: str, schema: dict) -> str:
    """
    Render the schema as a compact, LLM-readable block.

    Example output:
        Table: sales_data
        Columns:
          - date (DATE)  e.g. 2024-01-15
          - region (TEXT)  e.g. Europe, Asia
          - revenue (FLOAT)  e.g. 42000.0
    """
    lines = [f"Table: {table_name}", "Columns:"]
    for col, info in schema.items():
        samples = ", ".join(info["sample"][:3])
        lines.append(f"  - {col} ({info['pg_type']})  e.g. {samples}")
    return "\n".join(lines)


async def create_table_and_insert(
    table_name: str,
    schema: dict,
    df: pd.DataFrame,
) -> int:
    """
    1. Run CREATE TABLE IF NOT EXISTS
    2. Batch-insert DataFrame rows
    Returns the number of rows inserted.
    """
    ddl = build_create_table_sql(table_name, schema)
    await execute(ddl)

    rows = df.where(pd.notnull(df), None).to_dict(orient="records")

    if not rows:
        return 0

    cols = list(schema.keys())
    quoted_cols = ", ".join(f'"{c}"' for c in cols)
    placeholders = ", ".join(f"${i+1}" for i in range(len(cols)))
    insert_sql = (
        f'INSERT INTO "{table_name}" ({quoted_cols}) '
        f"VALUES ({placeholders}) ON CONFLICT DO NOTHING"
    )

    from app.db.postgres import get_pool
    pool = await get_pool()
    async with pool.acquire() as conn:
        await conn.executemany(
            insert_sql,
            [tuple(row[c] for c in cols) for row in rows],
        )

    return len(rows)


def safe_table_name(filename: str) -> str:
    """Convert a filename to a safe Postgres table name."""
    import re
    name = filename.rsplit(".", 1)[0]          # strip extension
    name = name.lower()
    name = re.sub(r"[^a-z0-9_]", "_", name)   # replace special chars
    name = re.sub(r"_+", "_", name)             # collapse underscores
    name = name.strip("_")
    return name[:50]                             # max 50 chars
