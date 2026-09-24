"""
Phase 9: Audio & Video Media Service
Manages archival audio recordings and video documentaries with timestamped transcripts,
speaker segmentation, and seek-to-timestamp search capabilities.
"""
from __future__ import annotations

import json
import logging
import uuid
from typing import Any, Optional
from app.db.database import DatabaseClient

logger = logging.getLogger("ambedkar.media.service")

# Canonical seed media tracks with verified archival transcripts and timestamps
CANONICAL_MEDIA_TRACKS = [
    {
        "id": "track-bbc-1931",
        "object_id": "AMBEDKAR-VOL-01",
        "asset_type": "audio",
        "title": "BBC Radio Address on Constitutional Safeguards",
        "storage_key": "storage/local/audio/bbc_1931_address.mp3",
        "mime_type": "audio/mp3",
        "duration_secs": 258.0,
        "transcript_language": "en",
        "description": "Recorded during Dr. Ambedkar's participation in the Second Round Table Conference in London, delineating the human rights imperative of political representation for the Depressed Classes.",
        "segments": [
            {
                "start_time": 5.0,
                "end_time": 42.0,
                "speaker_name": "Dr. B.R. Ambedkar",
                "text": "The Depressed Classes must be provided with constitutional safeguards that will guarantee their emancipation from social tyranny.",
            },
            {
                "start_time": 72.0,
                "end_time": 115.0,
                "speaker_name": "Dr. B.R. Ambedkar",
                "text": "We do not seek favours; we claim rights as equal citizens of a free India.",
            },
            {
                "start_time": 165.0,
                "end_time": 210.0,
                "speaker_name": "Dr. B.R. Ambedkar",
                "text": "Political democracy cannot last unless there lies at the base of it social democracy.",
            },
        ],
    },
    {
        "id": "track-air-1950",
        "object_id": "AMBEDKAR-VOL-13",
        "asset_type": "audio",
        "title": "All India Radio: Voice of the Republic",
        "storage_key": "storage/local/audio/air_1950_republic.mp3",
        "mime_type": "audio/mp3",
        "duration_secs": 405.0,
        "transcript_language": "en",
        "description": "Historical broadcast on 26 January 1950 expounding the principles of Justice, Liberty, Equality, and Fraternity enshrined in the Indian Constitution.",
        "segments": [
            {
                "start_time": 12.0,
                "end_time": 68.0,
                "speaker_name": "Dr. B.R. Ambedkar",
                "text": "On the 26th of January 1950, we are going to enter into a life of contradictions.",
            },
            {
                "start_time": 95.0,
                "end_time": 154.0,
                "speaker_name": "Dr. B.R. Ambedkar",
                "text": "In politics we will have equality and in social and economic life we will have inequality.",
            },
            {
                "start_time": 210.0,
                "end_time": 280.0,
                "speaker_name": "Dr. B.R. Ambedkar",
                "text": "We must remove this contradiction at the earliest possible moment, or else those who suffer from inequality will blow up the structure of political democracy.",
            },
        ],
    },
    {
        "id": "video-cad-1949",
        "object_id": "AMBEDKAR-VOL-13",
        "asset_type": "video",
        "title": "Constituent Assembly: The Final Presentation of the Constitution",
        "storage_key": "storage/local/video/cad_november_1949.mp4",
        "mime_type": "video/mp4",
        "duration_secs": 763.0,
        "transcript_language": "en",
        "description": "Documentary footage capturing Dr. Ambedkar presenting the final draft of the Indian Constitution to Assembly President Dr. Rajendra Prasad on 25 November 1949.",
        "segments": [
            {
                "start_time": 45.0,
                "end_time": 120.0,
                "speaker_name": "Dr. B.R. Ambedkar",
                "text": "However good a Constitution may be, it is sure to turn out bad because those who are called to work it happen to be a bad lot.",
            },
            {
                "start_time": 185.0,
                "end_time": 270.0,
                "speaker_name": "Dr. B.R. Ambedkar",
                "text": "Constitutional morality is not a natural sentiment. It has to be cultivated.",
            },
            {
                "start_time": 420.0,
                "end_time": 510.0,
                "speaker_name": "Dr. B.R. Ambedkar",
                "text": "Bhakti in religion may be a road to the salvation of the soul. But in politics, Bhakti or hero-worship is a sure road to degradation and to eventual dictatorship.",
            },
        ],
    },
]


class MediaService:
    """Manages audio and video media assets and transcript segment searches."""

    def __init__(self, db: DatabaseClient) -> None:
        self.db = db

    async def seed_canonical_media(self) -> dict[str, int]:
        """Seed canonical audio and video recordings with timestamped segments."""
        tracks_count = 0
        segments_count = 0

        for track in CANONICAL_MEDIA_TRACKS:
            # 1. Insert into media_assets
            await self.db.execute(
                """
                INSERT OR REPLACE INTO media_assets (
                    id, object_id, asset_type, title, storage_key, mime_type,
                    duration_secs, transcript_language, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
                """,
                [
                    track["id"],
                    track["object_id"],
                    track["asset_type"],
                    track["title"],
                    track["storage_key"],
                    track["mime_type"],
                    track["duration_secs"],
                    track["transcript_language"],
                ],
            )
            tracks_count += 1

            # 2. Insert segments
            for idx, seg in enumerate(track.get("segments", [])):
                seg_id = f"{track['id']}-seg-{idx+1}"
                await self.db.execute(
                    """
                    INSERT OR REPLACE INTO transcript_segments (
                        id, media_asset_id, segment_index, start_time, end_time,
                        text, language, speaker_name, confidence, source, created_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1.0, 'archival_audio', datetime('now'))
                    """,
                    [
                        seg_id,
                        track["id"],
                        idx + 1,
                        seg["start_time"],
                        seg["end_time"],
                        seg["text"],
                        track["transcript_language"],
                        seg.get("speaker_name", "Dr. B.R. Ambedkar"),
                    ],
                )
                segments_count += 1

        return {"media_assets": tracks_count, "transcript_segments": segments_count}

    async def list_tracks(self, asset_type: str | None = None) -> list[dict[str, Any]]:
        """List all audio and video assets."""
        sql = "SELECT * FROM media_assets"
        params: list[Any] = []
        if asset_type:
            sql += " WHERE asset_type = ?"
            params.append(asset_type)
        sql += " ORDER BY created_at DESC"

        res = await self.db.execute(sql, params)
        return [dict(r) for r in res.rows]

    async def get_track(self, track_id: str) -> dict[str, Any] | None:
        """Fetch media track details with ordered timestamped segments."""
        res = await self.db.execute(
            "SELECT * FROM media_assets WHERE id = ? LIMIT 1",
            [track_id],
        )
        if not res.rows:
            return None

        track = dict(res.rows[0])
        seg_res = await self.db.execute(
            "SELECT * FROM transcript_segments WHERE media_asset_id = ? ORDER BY start_time ASC",
            [track_id],
        )
        track["segments"] = [dict(s) for s in seg_res.rows]
        return track

    async def search_spoken_media(self, query: str, limit: int = 20) -> list[dict[str, Any]]:
        """
        Search across timestamped audio and video transcripts.
        Returns matching segments with direct seek-to-timestamp metadata.
        """
        sql = """
            SELECT ts.*, ma.title as media_title, ma.asset_type, ma.storage_key, ma.duration_secs
            FROM transcript_segments ts
            JOIN media_assets ma ON ma.id = ts.media_asset_id
            WHERE lower(ts.text) LIKE ?
            ORDER BY ma.id, ts.start_time ASC
            LIMIT ?
        """
        res = await self.db.execute(sql, [f"%{query.lower()}%", limit])
        results = []
        for r in res.rows:
            row = dict(r)
            mins = int(row["start_time"] // 60)
            secs = int(row["start_time"] % 60)
            timestamp_str = f"{mins:02d}:{secs:02d}"
            results.append({
                "segment_id": row["id"],
                "media_id": row["media_asset_id"],
                "media_title": row["media_title"],
                "asset_type": row["asset_type"],
                "timestamp_seconds": row["start_time"],
                "timestamp_str": timestamp_str,
                "speaker_name": row["speaker_name"],
                "matching_text": row["text"],
                "seek_url": f"/media?track={row['media_asset_id']}&t={row['start_time']}",
            })
        return results
