"""
Phase 9: Multilingual Data Models & Enums
"""
from __future__ import annotations

from enum import Enum
from typing import Any, Optional
from pydantic import BaseModel, Field


class SupportedLanguage(str, Enum):
    ENGLISH = "en"
    HINDI = "hi"
    MARATHI = "mr"


class ContentDerivationType(str, Enum):
    ORIGINAL_CONTENT = "ORIGINAL_CONTENT"
    TRANSLATED_CONTENT = "TRANSLATED_CONTENT"
    AI_GENERATED_EXPLANATION = "AI_GENERATED_EXPLANATION"
    AI_GENERATED_NARRATION = "AI_GENERATED_NARRATION"


class TranslationRequest(BaseModel):
    text: str = Field(..., min_length=1, description="Source text to translate")
    source_language: Optional[str] = Field(None, description="Source language code (en, hi, mr). Auto-detected if omitted.")
    target_language: str = Field("hi", description="Target language code (en, hi, mr)")
    chunk_id: Optional[str] = Field(None, description="Optional chunk UUID if translating archival text")


class TranslationResponse(BaseModel):
    source_text: str
    source_language: str
    target_language: str
    translated_text: str
    translation_model: str
    translation_version: str = "1.0"
    is_cached: bool = False
    review_status: str = "APPROVED"
    derivation_type: ContentDerivationType = ContentDerivationType.TRANSLATED_CONTENT


class EntityLocalizationItem(BaseModel):
    entity_id: str
    language: str
    localized_name: str
    localized_description: Optional[str] = None


class TimelineLocalizationItem(BaseModel):
    event_id: str
    language: str
    localized_title: str
    localized_description: Optional[str] = None
