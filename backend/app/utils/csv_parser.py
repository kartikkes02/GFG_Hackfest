import pandas as pd
import numpy as np
from io import BytesIO
from typing import Tuple


# How many sample values to show per column for LLM context
SAMPLE_SIZE = 5


def parse_csv(file_bytes: bytes) -> Tuple[pd.DataFrame, dict]:
    """
    Parse raw CSV bytes into a DataFrame and return inferred schema dict.

    Returns:
        df        — cleaned DataFrame
        schema    — {col_name: {"pg_type": str, "sample": list}}
    """
    df = pd.read_csv(BytesIO(file_bytes))

    # Strip whitespace from column names
    df.columns = [c.strip().lower().replace(" ", "_") for c in df.columns]

    # Drop fully empty columns
    df.dropna(axis=1, how="all", inplace=True)

    schema = {}
    for col in df.columns:
        pg_type, df = _infer_and_cast(df, col)
        samples = (
            df[col]
            .dropna()
            .head(SAMPLE_SIZE)
            .tolist()
        )
        schema[col] = {
            "pg_type": pg_type,
            "sample": [str(s) for s in samples],
        }

    return df, schema


def _infer_and_cast(df: pd.DataFrame, col: str) -> Tuple[str, pd.DataFrame]:
    """
    Try to cast a column to the most specific type and return the PG type string.
    Mutates df in place.
    """
    series = df[col]

    # Try datetime first
    if _looks_like_date(series):
        try:
            df[col] = pd.to_datetime(series, infer_datetime_format=True)
            return "DATE", df
        except Exception:
            pass

    # Try integer
    try:
        df[col] = pd.to_numeric(series, errors="raise")
        if (df[col] % 1 == 0).all():
            df[col] = df[col].astype("Int64")
            return "BIGINT", df
        return "FLOAT", df
    except Exception:
        pass

    # Try numeric with coercion (some nulls OK)
    coerced = pd.to_numeric(series, errors="coerce")
    non_null_ratio = coerced.notna().sum() / max(len(coerced), 1)
    if non_null_ratio > 0.8:
        df[col] = coerced
        if (coerced.dropna() % 1 == 0).all():
            return "BIGINT", df
        return "FLOAT", df

    # Fall back to TEXT
    df[col] = series.astype(str).str.strip()
    return "TEXT", df


def _looks_like_date(series: pd.Series) -> bool:
    sample = series.dropna().head(20).astype(str)
    date_indicators = ["-", "/", "T", "date", "Date"]
    hits = sum(
        any(ind in val for ind in date_indicators)
        for val in sample
    )
    return hits > len(sample) * 0.5
