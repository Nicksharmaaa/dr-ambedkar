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

    # ── Database (PostgreSQL / Turso) ─────────────────────────
    database_url: str | None = Field(default=None, alias="DATABASE_URL")
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

    # ── TTS Providers (server-side only — NEVER expose to frontend) ────────
    sarvam_api_key: str = Field(default="", alias="SARVAM_API_KEY")
    sarvam_model: str = Field(default="bulbul:v3", alias="SARVAM_MODEL")
    sarvam_speaker: str = Field(default="shubh", alias="SARVAM_SPEAKER")
    elevenlabs_api_key: str = Field(default="", alias="ELEVENLABS_API_KEY")
    elevenlabs_voice_id: str = Field(
        default="",
        alias="ELEVENLABS_VOICE_ID",
    )

    # Routing: comma-separated BCP-47 short codes (e.g. "en,hi")
    tts_elevenlabs_languages: str = Field(
        default="en,hi",
        alias="TTS_ELEVENLABS_LANGUAGES",
    )
    tts_sarvam_languages: str = Field(
        default="bn,ta,gu,te,kn,ml,mr,pa,od",
        alias="TTS_SARVAM_LANGUAGES",
    )

    # Sarvam speaker map: JSON string mapping short code → speaker name (defaults to SARVAM_SPEAKER="shubh")
    tts_sarvam_speaker_map: str = Field(
        default="",
        alias="TTS_SARVAM_SPEAKER_MAP",
    )

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
    cors_origins: str | list[str] = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
    ]
    cors_origin_regex: str | None = r"^https://.*\.vercel\.app$"

    # ── Logging ───────────────────────────────────────────────
    log_level: str = "INFO"

    @field_validator("cors_origins", mode="before")
    @classmethod
    def _parse_cors(cls, v: object) -> list[str]:
        if isinstance(v, str):
            v_str = v.strip()
            if v_str.startswith("[") and v_str.endswith("]"):
                import json
                try:
                    return json.loads(v_str)
                except Exception:
                    pass
            return [x.strip() for x in v_str.split(",") if x.strip()]
        return list(v) if isinstance(v, (list, tuple, set)) else ["*"]

    @field_validator("storage_local_root", mode="before")
    @classmethod
    def _storage_root(cls, v: str | Path) -> Path:
        p = Path(v)
        if not p.is_absolute():
            candidate = Path("backend") / p
            if (candidate / "originals").exists():
                return candidate
            if candidate.exists() and not p.exists():
                return candidate
        return p

    @field_validator("ai_model_cache_dir", mode="before")
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
        """True if connecting to remote DB (PostgreSQL or Turso Cloud), False for local file/in-memory."""
        url = self.database_url or self.turso_db_url
        return url.startswith("postgresql://") or url.startswith("postgres://") or url.startswith("libsql://")


# Singleton — import this everywhere
settings = Settings()
