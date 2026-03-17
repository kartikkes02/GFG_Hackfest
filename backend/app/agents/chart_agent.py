import json
import os
import google.generativeai as genai

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
_model = genai.GenerativeModel("gemini-2.5-flash")

CHART_SYSTEM = """
You are a data visualization expert for a dashboard tool.
Given the columns returned from a SQL query and the user's intent,
decide the best chart type and axis configuration.

Return ONLY valid JSON — no markdown, no explanation.

Schema:
{
  "charts": [
    {
      "type":     "line" | "bar" | "pie" | "area" | "scatter" | "kpi",
      "title":    string,
      "x_axis":   string | null,
      "y_axis":   string | null,
      "group_by": string | null,
      "metric":   string | null   // for kpi type
    }
  ]
}

Rules:
- Use "line" for time-series data (x_axis is a date/time column).
- Use "bar" for categorical comparisons (top-N, grouped categories).
- Use "pie" for distributions that sum to 100% (max 6 slices).
- Use "area" for cumulative or stacked time series.
- Use "kpi" for a single aggregated number (no x/y needed, set metric).
- Use "scatter" for two numeric dimensions with no clear x grouping.
- Always include a "kpi" card for the primary metric if it's a single number.
- Return 1–4 charts. Don't return more than 4.
- Title should be descriptive, e.g. "Revenue by Region (Monthly)".
"""


async def plan_charts(
    columns: list[str],
    sample_rows: list[dict],
    intent: dict,
) -> list[dict]:
    """
    Given the result columns + a few sample rows + the intent,
    ask Gemini to pick the best chart configuration(s).

    Returns a list of chart config dicts.
    """
    col_summary = []
    for col in columns:
        vals = [str(r.get(col, "")) for r in sample_rows[:5]]
        col_summary.append(f"  - {col}: {', '.join(vals)}")

    prompt = f"""{CHART_SYSTEM}

Query result columns and sample values:
{chr(10).join(col_summary)}

Intent:
{json.dumps(intent, indent=2)}

Choose the best chart configuration:
"""

    response = _model.generate_content(prompt)
    raw = response.text.strip()

    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]

    try:
        config = json.loads(raw)
        charts = config.get("charts", [])
    except json.JSONDecodeError:
        # Fallback: basic bar chart
        charts = [
            {
                "type": "bar",
                "title": "Query Results",
                "x_axis": columns[0] if columns else None,
                "y_axis": columns[1] if len(columns) > 1 else None,
                "group_by": None,
                "metric": None,
            }
        ]

    return charts[:4]  # Hard limit


def build_dashboard_config(
    charts: list[dict],
    rows: list[dict],
    user_prompt: str,
    sql: str,
) -> dict:
    """
    Assemble the final dashboard JSON that the frontend will consume.
    """
    return {
        "title": _infer_title(user_prompt),
        "prompt": user_prompt,
        "sql": sql,
        "row_count": len(rows),
        "charts": charts,
        "data": rows,
    }


def _infer_title(prompt: str) -> str:
    """Best-effort title from the user prompt."""
    prompt = prompt.strip().rstrip("?")
    if len(prompt) < 60:
        return prompt.capitalize()
    return prompt[:57].capitalize() + "..."
