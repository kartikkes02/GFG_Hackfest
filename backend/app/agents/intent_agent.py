import json
import os
import google.generativeai as genai

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
_model = genai.GenerativeModel("gemini-2.5-flash")

INTENT_SYSTEM = """
You are an intent parser for a data analytics tool.
Given a user question and optionally prior conversation context,
extract the structured analytics intent as JSON.

Return ONLY valid JSON — no markdown, no explanation.

Schema:
{
  "metric":      string | null,    // the measure to compute, e.g. "revenue", "units"
  "aggregation": string,           // "SUM", "AVG", "COUNT", "MAX", "MIN"
  "dimensions":  string[],         // group-by columns, e.g. ["region", "product"]
  "time_column": string | null,    // date/time column if used
  "time_grain":  string | null,    // "day", "week", "month", "quarter", "year"
  "filters":     {column, op, value}[],  // WHERE conditions
  "order_by":    string | null,    // column to sort by
  "limit":       int | null,       // top-N limit
  "is_followup": boolean           // true if this modifies a prior query
}

Filter op values: "=", "!=", ">", "<", ">=", "<=", "IN", "LIKE"
"""


async def parse_intent(
    user_prompt: str,
    schema_text: str,
    conversation_history: str = "",
) -> dict:
    """
    Call Gemini to extract a structured intent object from the user prompt.
    Returns a dict matching the schema above.
    """
    context_block = ""
    if conversation_history and conversation_history != "No prior conversation.":
        context_block = f"\nPrior conversation:\n{conversation_history}\n"

    prompt = f"""{INTENT_SYSTEM}

Dataset schema:
{schema_text}
{context_block}
User question: {user_prompt}
"""

    response = _model.generate_content(prompt)
    raw = response.text.strip()

    # Strip markdown fences if present
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]

    try:
        intent = json.loads(raw)
    except json.JSONDecodeError as e:
        raise ValueError(f"Intent agent returned invalid JSON: {raw}") from e

    # Normalize: ensure filters is always a list
    if not isinstance(intent.get("filters"), list):
        intent["filters"] = []

    return intent


def merge_intent_with_followup(
    previous_intent: dict,
    new_intent: dict,
) -> dict:
    """
    When the user issues a follow-up like "only show Europe",
    merge the new filters/dimensions into the previous intent
    rather than replacing it wholesale.
    """
    if not new_intent.get("is_followup"):
        return new_intent

    merged = previous_intent.copy()

    # Override metric/aggregation only if newly specified
    for key in ("metric", "aggregation", "time_grain", "order_by", "limit"):
        if new_intent.get(key) is not None:
            merged[key] = new_intent[key]

    # Merge dimensions
    new_dims = new_intent.get("dimensions", [])
    if new_dims:
        merged["dimensions"] = new_dims

    # Merge filters: new filters override matching columns, add new ones
    existing_filters = {f["column"]: f for f in merged.get("filters", [])}
    for f in new_intent.get("filters", []):
        existing_filters[f["column"]] = f
    merged["filters"] = list(existing_filters.values())

    merged["is_followup"] = True
    return merged
