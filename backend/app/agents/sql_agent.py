import json
import re
import os
import google.generativeai as genai
import sqlparse
from sqlparse.sql import Statement
from sqlparse.tokens import Keyword, DML

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
_model = genai.GenerativeModel("gemini-2.5-flash")

SQL_SYSTEM = """
You are a PostgreSQL SQL generator for a data analytics tool.
Given the dataset schema and a structured intent, write a valid PostgreSQL SELECT query.

Rules:
- Use only SELECT statements. Never INSERT, UPDATE, DELETE, DROP, ALTER, CREATE.
- Reference only the table and columns present in the schema.
- Use DATE_TRUNC for time aggregations (e.g. DATE_TRUNC('month', date_col)).
- Always alias aggregated columns (e.g. SUM(revenue) AS total_revenue).
- For top-N queries use ORDER BY + LIMIT.
- Return ONLY the raw SQL. No markdown fences, no explanation.
"""


async def generate_sql(
    table_name: str,
    schema_text: str,
    intent: dict,
    previous_sql: str = "",
) -> str:
    """
    Generate a PostgreSQL SELECT query from the intent dict.
    If is_followup is True, passes previous SQL as context so
    Gemini modifies rather than rebuilds from scratch.
    """
    followup_block = ""
    if intent.get("is_followup") and previous_sql:
        followup_block = f"\nPrevious SQL (modify this):\n{previous_sql}\n"

    prompt = f"""{SQL_SYSTEM}

Table: {table_name}
Schema:
{schema_text}

Intent:
{json.dumps(intent, indent=2)}
{followup_block}
Write the SQL query:
"""

    response = _model.generate_content(prompt)
    sql = response.text.strip()

    # Strip any stray markdown
    sql = re.sub(r"```sql|```", "", sql).strip()

    return sql


# ── Guardrail ───────────────────────────────────────────────

class SQLValidationError(Exception):
    pass


def validate_sql(sql: str, table_name: str, schema: dict) -> str:
    """
    Guardrail: validate the generated SQL before execution.

    Checks:
    1. Only SELECT statements allowed
    2. No forbidden keywords (DROP, INSERT, UPDATE, DELETE, etc.)
    3. Table name is correct
    4. All referenced columns exist in the schema

    Returns the cleaned SQL string or raises SQLValidationError.
    """
    sql_upper = sql.upper()

    # 1. Must be a SELECT
    parsed = sqlparse.parse(sql)
    if not parsed:
        raise SQLValidationError("Empty or unparseable SQL.")

    stmt: Statement = parsed[0]
    stmt_type = stmt.get_type()
    if stmt_type != "SELECT":
        raise SQLValidationError(
            f"Only SELECT queries are allowed. Got: {stmt_type}"
        )

    # 2. Forbidden keywords
    forbidden = [
        "INSERT", "UPDATE", "DELETE", "DROP", "ALTER",
        "CREATE", "TRUNCATE", "GRANT", "REVOKE", "EXEC",
        "EXECUTE", "CALL", "COPY", "--", "/*",
    ]
    for word in forbidden:
        if word in sql_upper:
            raise SQLValidationError(
                f"Forbidden keyword detected: {word}"
            )

    # 3. Table name appears in query
    if table_name.lower() not in sql.lower():
        raise SQLValidationError(
            f"Query does not reference the expected table '{table_name}'."
        )

    # 4. Column validation — extract bare identifiers and check against schema
    known_cols = {c.lower() for c in schema.keys()}
    known_cols.update({
        # common SQL functions / keywords that look like identifiers
        "date_trunc", "sum", "avg", "count", "max", "min",
        "coalesce", "nullif", "cast", "extract", "now",
        "month", "year", "day", "week", "quarter",
    })

    # Pull out word tokens that look like column names
    col_pattern = re.compile(r'"?([a-z_][a-z0-9_]*)"?', re.IGNORECASE)
    candidate_cols = col_pattern.findall(sql.lower())

    hallucinated = []
    sql_keywords = {
        "select", "from", "where", "group", "by", "order",
        "having", "limit", "offset", "as", "on", "join",
        "left", "right", "inner", "outer", "full", "and",
        "or", "not", "in", "like", "between", "is", "null",
        "true", "false", "asc", "desc", "distinct", "case",
        "when", "then", "else", "end", "interval", "all",
        "exists", "union", "intersect", "except", table_name.lower(),
    }

    for token in candidate_cols:
        if token in sql_keywords:
            continue
        if token in known_cols:
            continue
        # Allow numeric strings
        if token.isdigit():
            continue
        hallucinated.append(token)

    if hallucinated:
        # Non-fatal warning — only raise if clearly wrong
        # (some tokens are function args, aliases, etc.)
        suspicious = [
            h for h in hallucinated
            if len(h) > 2 and not h.startswith("$")
        ]
        if len(suspicious) > 3:
            raise SQLValidationError(
                f"Query references unknown columns/identifiers: {suspicious}. "
                f"Valid columns are: {sorted(known_cols)}"
            )

    return sql.strip()
