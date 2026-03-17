import json
import uuid
from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel

from app.utils.csv_parser import parse_csv
from app.utils.schema_generator import (
    create_table_and_insert,
    safe_table_name,
    schema_to_prompt_text,
)
from app.db.postgres import execute, fetchrow

router = APIRouter()

MAX_FILE_SIZE = 50 * 1024 * 1024  # 50 MB


class UploadResponse(BaseModel):
    dataset_id: str
    table_name: str
    filename: str
    row_count: int
    schema: dict
    schema_text: str


@router.post("/upload-csv", response_model=UploadResponse)
async def upload_csv(file: UploadFile = File(...)):
    # ── Validation ───────────────────────────────────────────
    if not file.filename.endswith(".csv"):
        raise HTTPException(400, "Only .csv files are accepted.")

    raw = await file.read()
    if len(raw) > MAX_FILE_SIZE:
        raise HTTPException(413, "File exceeds the 50 MB limit.")

    # ── Parse ────────────────────────────────────────────────
    try:
        df, schema = parse_csv(raw)
    except Exception as e:
        raise HTTPException(422, f"Could not parse CSV: {e}")

    if df.empty:
        raise HTTPException(422, "CSV file is empty after parsing.")

    # ── Generate unique table name ───────────────────────────
    table_name = safe_table_name(file.filename)
    dataset_id = str(uuid.uuid4())

    # If table already exists with this name, append short uuid suffix
    existing = await fetchrow(
        "SELECT id FROM dataset_metadata WHERE table_name = $1",
        table_name,
    )
    if existing:
        table_name = f"{table_name}_{dataset_id[:8]}"

    # ── Create table + insert rows ───────────────────────────
    try:
        row_count = await create_table_and_insert(table_name, schema, df)
    except Exception as e:
        raise HTTPException(500, f"Database error: {e}")

    # ── Store metadata ───────────────────────────────────────
    await execute(
        """
        INSERT INTO dataset_metadata
            (id, filename, table_name, schema_json, row_count)
        VALUES ($1, $2, $3, $4, $5)
        """,
        dataset_id,
        file.filename,
        table_name,
        json.dumps(schema),
        row_count,
    )

    return UploadResponse(
        dataset_id=dataset_id,
        table_name=table_name,
        filename=file.filename,
        row_count=row_count,
        schema=schema,
        schema_text=schema_to_prompt_text(table_name, schema),
    )


@router.get("/datasets")
async def list_datasets():
    from app.services.query_service import list_datasets as _list
    return await _list()


@router.get("/datasets/{dataset_id}")
async def get_dataset(dataset_id: str):
    from app.services.query_service import get_dataset_metadata
    meta = await get_dataset_metadata(dataset_id)
    if not meta:
        raise HTTPException(404, "Dataset not found.")
    return meta
