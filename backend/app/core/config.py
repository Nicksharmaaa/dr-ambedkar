"""
Ambedkar Heritage Intelligence & Digital Preservation System
Core Configuration — Pydantic BaseSettings
Python 3.14 | pydantic-settings v2
"""
from __future__ import annotations

from pathlib import Path
from typing import Literal

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


_backend_dir = Path(__file__).resolve().parent.parent.parent
_project_root = _backend_dir.parent


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=(
            str(_project_root / ".env"),
            str(_backend_dir / ".env"),
            ".env",
        ),
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # ── Application ──────────────────────────────────────────
    app_name: str = "ambedkar-heritage-api"
    app_env: Literal["development", "staging", "production"] = "development"
    app_host: str = "0.0.0.0"
    app_port: int = 8000
    secret_key: str = "CHANGE_ME_GENERATE_STRONG_SECRET"

    # ── Database (Turso/libSQL) ───────────────────────────────
    turso_db_url: str = Field(
        default="file:storage/turso/ambedkar_dev.db",
        alias="TURSO_DB_URL",
    )
    turso_auth_token: str | None = Field(default=None, alias="TURSO_AUTH_TOKEN")

    # ── Storage ───────────────────────────────────────────────
    storage_backend: Literal["LOCAL", "S3_COMPATIBLE"] = "LOCAL"
    storage_local_root: Path = Path("storage/local")

    # S3-compatible (future)
    storage_s3_bucket: str = "ambedkar-archive"
    storage_s3_endpoint: str = ""
    storage_s3_access_key: str = ""
    storage_s3_secret_key: str = ""
    storage_s3_region: str = "auto"

    # ── AI / ML ───────────────────────────────────────────────
    ai_embedding_model: str = "Qwen/Qwen3-Embedding-0.6B"
    ai_reranker_model: str = "Qwen/Qwen3-Reranker-0.6B"
    ai_vl_model: str = "Qwen/Qwen3-VL-2B-Instruct-AWQ"
    ai_model_cache_dir: Path = Path("models/cache")
    ai_embedding_dimension: int = 1024
    ai_embedding_batch_size: int = 16
    ai_vram_evict_threshold_gb: float = 1.0

    # Model provider: "local" uses local GPU; "cloud" uses API
    model_provider: Literal["local", "cloud"] = "local"

    # Cloud LLM / API Settings
    llm_provider: str = "groq"
    groq_api_key: str = ""
    groq_model: str = "qwen/qwen3.8-27b"
    gemini_api_key: str = ""
    gemini_model: str = "gemini-3.6-flash"
    openrouter_api_key: str = ""

    # RAG Settings
    rag_top_k: int = 10
    rag_rrf_k: int = 60
    rag_min_score: float = 0.05

    # ── Microservices ─────────────────────────────────────────
    indic_service_url: str = "http://localhost:8001"
    ocr_service_url: str = "http://localhost:8002"

    # ── IIIF ──────────────────────────────────────────────────
    iiif_base_url: str = "http://localhost:8000/iiif"

    # ── Auth ──────────────────────────────────────────────────
    jwt_algorithm: str = "HS256"
    jwt_access_expire_minutes: int = 60
    jwt_refresh_expire_days: int = 30

    # ── CORS ──────────────────────────────────────────────────
    cors_origins: list[str] = ["http://localhost:3000", "http://localhost:3001"]

    # ── Logging ───────────────────────────────────────────────
    log_level: str = "INFO"

    @field_validator("storage_local_root", "ai_model_cache_dir", mode="before")
    @classmethod
    def _as_path(cls, v: str | Path) -> Path:
        return Path(v)

    @property
    def is_development(self) -> bool:
        return self.app_env == "development"

    @property
    def is_production(self) -> bool:
        return self.app_env == "production"

    @property
    def db_is_remote(self) -> bool:
        """True if connecting to Turso Cloud, False for local file/in-memory."""
        return self.turso_db_url.startswith("libsql://")


# Singleton — import this everywhere
settings = Settings()
