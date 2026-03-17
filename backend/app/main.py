from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.api.upload import router as upload_router
from app.api.chat import router as chat_router
from app.db.postgres import init_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield


app = FastAPI(
    title="AI Dashboard Generator API",
    version="1.0.0",
    lifespan=lifespan,
)

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["https://hackfest-gfg.vercel.app/"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload_router, prefix="/api", tags=["upload"])
app.include_router(chat_router, prefix="/api", tags=["chat"])


@app.get("/health")
async def health():
    return {"status": "ok"}
