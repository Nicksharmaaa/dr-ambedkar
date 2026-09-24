"""
Phase 8: Heritage Storytelling Engine Service
Serves structured historical narrative collections composed of verified archival objects.
Supports multimedia chapters, primary document deep-links, and RAG-integrated chapter inquiry.
"""
from __future__ import annotations

import json
import logging
from typing import Any
from app.db.database import DatabaseClient
from app.services.knowledge_graph.models import StoryCollectionItem, StoryItem

logger = logging.getLogger("ambedkar.story.service")


class StoryService:
    """Manages curated memorial and historical stories connected to primary archival pages."""

    def __init__(self, db: DatabaseClient) -> None:
        self.db = db

    async def list_stories(self, published_only: bool = True) -> list[StoryCollectionItem]:
        """Fetch all curated story collections ordered by display sequence."""
        sql = "SELECT * FROM story_collections"
        if published_only:
            sql += " WHERE published = 1"
        sql += " ORDER BY display_order ASC, created_at DESC"

        res = await self.db.execute(sql)
        stories = []
        for r in res.rows:
            story_dict = dict(r)
            # Count chapters
            cnt_res = await self.db.execute(
                "SELECT COUNT(*) as cnt FROM story_items WHERE story_id = ?",
                [story_dict["id"]],
            )
            item_count = cnt_res.rows[0]["cnt"] if cnt_res.rows else 0

            stories.append(
                StoryCollectionItem(
                    id=story_dict["id"],
                    slug=story_dict["slug"],
                    title=story_dict["title"],
                    subtitle=story_dict.get("subtitle"),
                    summary=story_dict["summary"],
                    cover_image_url=story_dict.get("cover_image_url"),
                    category=story_dict.get("category", "MEMORIAL"),
                    published=bool(story_dict.get("published", 1)),
                    display_order=story_dict.get("display_order", 0),
                    items=[],  # Omit full items list in directory view for performance
                )
            )
        return stories

    async def get_story(self, slug_or_id: str) -> StoryCollectionItem | None:
        """Fetch a complete story collection with all sequential archival chapters."""
        res = await self.db.execute(
            "SELECT * FROM story_collections WHERE id = ? OR slug = ? LIMIT 1",
            [slug_or_id, slug_or_id],
        )
        if not res.rows:
            return None

        story_row = dict(res.rows[0])
        story_id = story_row["id"]

        # Fetch chapters
        items_res = await self.db.execute(
            """
            SELECT si.*, ao.title as document_title
            FROM story_items si
            LEFT JOIN archival_objects ao ON ao.id = si.document_id
            WHERE si.story_id = ?
            ORDER BY si.sequence ASC
            """,
            [story_id],
        )

        chapters: list[StoryItem] = []
        for r in items_res.rows:
            row = dict(r)
            doc_id = row.get("document_id") or "AMBEDKAR-VOL-01"
            page_no = row.get("page_number") or 1
            chunk_id = row.get("chunk_id")

            viewer_url = f"/documents/{doc_id}/viewer?page={page_no}"
            if chunk_id:
                viewer_url += f"&chunk={chunk_id}"

            graph_config = None
            if row.get("interactive_graph_config"):
                try:
                    graph_config = json.loads(row["interactive_graph_config"])
                except Exception:
                    pass

            chapters.append(
                StoryItem(
                    id=row["id"],
                    story_id=story_id,
                    sequence=row["sequence"],
                    title=row["title"],
                    narrative_text=row["narrative_text"],
                    media_url=row.get("media_url"),
                    media_type=row.get("media_type", "document"),
                    document_id=doc_id,
                    document_title=row.get("document_title"),
                    page_number=page_no,
                    chunk_id=chunk_id,
                    evidence_quote=row.get("evidence_quote"),
                    viewer_url=viewer_url,
                    interactive_graph_config=graph_config,
                )
            )

        return StoryCollectionItem(
            id=story_row["id"],
            slug=story_row["slug"],
            title=story_row["title"],
            subtitle=story_row.get("subtitle"),
            summary=story_row["summary"],
            cover_image_url=story_row.get("cover_image_url"),
            category=story_row.get("category", "MEMORIAL"),
            published=bool(story_row.get("published", 1)),
            display_order=story_row.get("display_order", 0),
            items=chapters,
        )
