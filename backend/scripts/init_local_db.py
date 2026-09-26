"""
Initialize local SQLite database for the Ambedkar Heritage Archive.
Applies all migrations and seeds canonical datasets (Knowledge Graph, Manifests, Works, Volumes).
"""
import asyncio
import json
import os
import sys
from pathlib import Path

# Setup paths
backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

from app.db.database import SQLiteClient
from app.db.migrate import run_migrations
from app.services.knowledge_graph.seed_data import seed_knowledge_graph_and_stories
from app.services.corpus.ingest import VOLUME_METADATA


async def init_database(db_path: str = "storage/archive.db"):
    print("=" * 70)
    print(f"INITIALIZING LOCAL SQLITE ARCHIVE: {db_path}")
    print("=" * 70)
    
    # 1. Create client & run migrations
    client = SQLiteClient(f"file:{db_path}")
    print("\n[1/4] Applying all 7 schema migrations...")
    count = await run_migrations(client)
    print(f"--> Successfully applied {count} migrations.")

    # Temporarily disable FK constraints for bulk seeding cross-references
    await client.execute("PRAGMA foreign_keys = OFF;")

    # 2. Register the 19 Primary Archival Volumes
    print("\n[2/4] Registering primary BAWS Archival Volumes...")
    registered = 0
    for meta in VOLUME_METADATA:
        try:
            await client.execute(
                """
                INSERT OR REPLACE INTO archival_objects (
                    id, stable_id, title, subtitle, object_type, language,
                    source_institution, provenance, rights_status,
                    creator, publisher, review_status, publication_status,
                    page_count, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
                """,
                [
                    meta["archival_id"],
                    meta["archival_id"],
                    meta["title"],
                    meta["subtitle"],
                    "writings",
                    "en",
                    "Government of Maharashtra (BAWS)",
                    f"Dr. Babasaheb Ambedkar: Writings and Speeches Vol {meta['vol_num']}",
                    "public_domain",
                    "Dr. B.R. Ambedkar",
                    "Dr. Babasaheb Ambedkar Source Material Publication Committee",
                    "curator_verified",
                    "published",
                    500,
                ],
            )
            registered += 1
        except Exception as e:
            print(f"  Error registering {meta['archival_id']}: {e}")
    print(f"--> Registered {registered} archival volumes.")

    # 3. Seed Knowledge Graph
    print("\n[3/4] Seeding Canonical Knowledge Graph & Timeline...")
    kg_res = await seed_knowledge_graph_and_stories(client)
    print(f"--> KG seeded: {kg_res['entities']} entities, {kg_res['relationships']} relationships, {kg_res['timeline_events']} timeline events, {kg_res['stories']} stories.")

    # 4. Seed Work Manifests & Canonical Works
    print("\n[4/4] Seeding Work Manifests from multilingual manifest...")
    manifest_path = backend_dir.parent / "multilingual_books_writings_manifest.json"
    if manifest_path.exists():
        with open(manifest_path, "r", encoding="utf-8") as f:
            manifest_data = json.load(f)
        docs = manifest_data.get("documents", [])
        for doc in docs:
            await client.execute(
                """
                INSERT OR REPLACE INTO work_manifests (
                    archival_id, filename, relative_path, language, script,
                    source_format, format_nature, file_size_bytes, page_count,
                    sha256, text_authority, ingested_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                [
                    doc["archival_id"],
                    doc["filename"],
                    doc["relative_path"],
                    doc["detected_language"],
                    doc["script"],
                    doc["source_format"],
                    doc["format_nature"],
                    doc["file_size_bytes"],
                    doc["page_count"],
                    doc["sha256"],
                    doc["text_authority"],
                    doc["ingested_at"],
                ],
            )
        print(f"--> Seeded {len(docs)} work manifests.")
    else:
        print("--> Warning: manifest.json not found, skipping work manifests.")

    # Re-enable foreign keys
    await client.execute("PRAGMA foreign_keys = ON;")

    # Verify table counts
    print("\n" + "=" * 70)
    print("LOCAL DATABASE INITIALIZATION SUMMARY")
    print("=" * 70)
    tables = [
        "roles", "schema_migrations", "archival_objects", "work_manifests",
        "entities", "entity_aliases", "relationships", "timeline_events",
        "story_collections", "story_items"
    ]
    for tbl in tables:
        res = await client.execute(f"SELECT COUNT(*) as cnt FROM {tbl}")
        print(f"  {tbl:<25}: {res.first()['cnt']} rows")

    await client.close()
    print("\nDatabase is ready for offline/local use!")


if __name__ == "__main__":
    asyncio.run(init_database())
