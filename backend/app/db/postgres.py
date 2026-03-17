import os
import asyncpg
from typing import Optional
from dotenv import load_dotenv

load_dotenv()  # loads .env file


_pool: Optional[asyncpg.Pool] = None

DATABASE_URL = os.getenv("DATABASE_URL")  # Neon connection string
if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL environment variable not set")
async def get_pool() -> asyncpg.Pool:
    global _pool
    if _pool is None:
        _pool = await asyncpg.create_pool(
            DATABASE_URL,
            min_size=2,
            max_size=10,
            ssl="require",
        )
    return _pool


async def init_db():
    """Create the dataset metadata table if it doesn't exist."""
    pool = await get_pool()
    async with pool.acquire() as conn:
        await conn.execute("""
            CREATE TABLE IF NOT EXISTS dataset_metadata (
                id          TEXT PRIMARY KEY,
                filename    TEXT NOT NULL,
                table_name  TEXT NOT NULL UNIQUE,
                schema_json TEXT NOT NULL,
                row_count   INTEGER,
                created_at  TIMESTAMPTZ DEFAULT NOW()
            )
        """)


async def execute(query: str, *args):
    pool = await get_pool()
    async with pool.acquire() as conn:
        return await conn.execute(query, *args)


async def fetch(query: str, *args) -> list[dict]:
    pool = await get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch(query, *args)
        return [dict(r) for r in rows]


async def fetchrow(query: str, *args) -> Optional[dict]:
    pool = await get_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow(query, *args)
        return dict(row) if row else None


async def fetchval(query: str, *args):
    pool = await get_pool()
    async with pool.acquire() as conn:
        return await conn.fetchval(query, *args)
