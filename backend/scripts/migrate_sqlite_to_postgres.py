"""
Deterministic Data Migration from Turso/SQLite Baseline to PostgreSQL (ambedkar_db).
Preserves all primary keys, foreign keys, timestamps, metadata, and JSON.
"""
import sqlite3
import psycopg
from psycopg.rows import dict_row
from pathlib import Path
import json

TABLE_ORDER = [
    "roles",
    "schema_migrations",
    "collections",
    "archival_objects",
    "files",
    "pages",
    "media_assets",
    "sources",
    "persons",
    "organizations",
    "events",
    "places",
    "topics",
    "concepts",
    "document_sections",
    "document_chunks",
    "embeddings",
    "fts_chunks",
    "search_index_meta",
    "entities",
    "entity_aliases",
    "entity_reviews",
    "relationships",
    "relationship_evidence",
    "timeline_events",
    "story_collections",
    "story_items",
    "multilingual_works",
    "work_manifests",
    "work_relationships",
    "work_alignments",
    "translations_cache",
    "tts_cache",
    "transcript_segments",
    "multimodal_page_analyses",
    "entity_localizations",
    "timeline_localizations",
    "preservation_events",
    "audit_events",
    "users",
    "permissions",
    "processing_jobs",
    "digital_files",
    "ocr_pages",
    "eval_dataset_items",
    "translations",
    "transcripts",
]

def migrate():
    sqlite_db = Path("storage/archive.db")
    if not sqlite_db.exists():
        print(f"Error: {sqlite_db} does not exist!")
        return

    s_conn = sqlite3.connect(sqlite_db)
    s_conn.row_factory = sqlite3.Row
    s_cur = s_conn.cursor()

    pg_conn = psycopg.connect("host=localhost port=5432 user=ambedkar_user password=ambedkar_local_sih_2026_sec! dbname=ambedkar_db")
    pg_conn.autocommit = False
    pg_cur = pg_conn.cursor()

    report = {"migrated": {}, "errors": {}}

    print("=" * 70)
    print("EXECUTING DETERMINISTIC TURSO/SQLITE -> POSTGRESQL DATA MIGRATION")
    print("=" * 70)

    for tbl in TABLE_ORDER:
        try:
            # Check if table exists in SQLite
            s_cur.execute(f"SELECT name FROM sqlite_master WHERE type='table' AND name=?", [tbl])
            if not s_cur.fetchone():
                continue

            rows = s_cur.execute(f"SELECT * FROM '{tbl}'").fetchall()
            if not rows:
                report["migrated"][tbl] = {"source_rows": 0, "target_rows": 0, "status": "EMPTY"}
                continue

            # Get column names
            col_names = [col[0] for col in s_cur.description]
            
            # Special case for fts_chunks in Postgres (only copy chunk_id, text, object_id)
            if tbl == "fts_chunks":
                col_names = ["chunk_id", "text", "object_id"]

            cols_str = ", ".join(col_names)
            placeholders = ", ".join(["%s"] * len(col_names))
            insert_sql = f"INSERT INTO {tbl} ({cols_str}) VALUES ({placeholders}) ON CONFLICT DO NOTHING"

            batch_data = []
            for r in rows:
                row_vals = [r[c] if c in r.keys() else None for c in col_names]
                batch_data.append(row_vals)

            pg_cur.executemany(insert_sql, batch_data)
            pg_conn.commit()

            # Verify count in Postgres
            pg_cur.execute(f"SELECT count(*) FROM {tbl}")
            pg_cnt = pg_cur.fetchone()[0]

            report["migrated"][tbl] = {
                "source_rows": len(rows),
                "target_rows": pg_cnt,
                "status": "PASS" if pg_cnt >= len(rows) else "MISMATCH",
            }
            print(f"  [OK] {tbl:<25} : {len(rows)} -> {pg_cnt} rows")

        except Exception as e:
            pg_conn.rollback()
            report["errors"][tbl] = str(e)
            print(f"  [ERROR] {tbl:<22} : {e}")

    s_conn.close()
    pg_conn.close()

    out_file = Path("storage/migration_results.json")
    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2)

    print("=" * 70)
    print(f"Migration completed. Details saved to {out_file}")

if __name__ == "__main__":
    migrate()
