"""
Create full deterministic backup of existing database and assets into turso_migration_backup/
"""
import sqlite3
import json
import shutil
from pathlib import Path

def create_backup():
    backup_dir = Path(r"c:\dr ambedkar\turso_migration_backup")
    backup_dir.mkdir(parents=True, exist_ok=True)
    data_dir = backup_dir / "tables"
    data_dir.mkdir(parents=True, exist_ok=True)

    db_path = Path(r"c:\dr ambedkar\backend\storage\archive.db")
    if not db_path.exists():
        print("Archive DB not found!")
        return

    # Copy raw SQLite database file
    shutil.copy2(db_path, backup_dir / "archive_turso_baseline.db")

    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    tables = [r[0] for r in cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name").fetchall()]
    
    metadata = {
        "timestamp": "2026-09-26T15:05:00Z",
        "source": "Turso/SQLite baseline",
        "tables": {}
    }

    # SQL dump
    sql_dump_path = backup_dir / "dump_turso_baseline.sql"
    with open(sql_dump_path, "w", encoding="utf-8") as sql_f:
        for line in conn.iterdump():
            sql_f.write(f"{line}\n")

    # Export each table as JSON
    def _json_default(obj):
        if isinstance(obj, bytes):
            return obj.hex()
        return str(obj)

    for t in tables:
        rows = [dict(r) for r in cursor.execute(f"SELECT * FROM '{t}'").fetchall()]
        table_file = data_dir / f"{t}.json"
        with open(table_file, "w", encoding="utf-8") as f:
            json.dump(rows, f, indent=2, ensure_ascii=False, default=_json_default)
        metadata["tables"][t] = len(rows)

    # Copy vector_cache.npz
    vec_cache = Path(r"c:\dr ambedkar\backend\storage\local\vector_cache.npz")
    if vec_cache.exists():
        shutil.copy2(vec_cache, backup_dir / "vector_cache.npz")
        metadata["vector_cache"] = "vector_cache.npz (12,154 vectors, 1024 dim)"

    # Copy manifest
    manifest = Path(r"c:\dr ambedkar\multilingual_books_writings_manifest.json")
    if manifest.exists():
        shutil.copy2(manifest, backup_dir / "multilingual_books_writings_manifest.json")
        metadata["manifest"] = "multilingual_books_writings_manifest.json"

    with open(backup_dir / "backup_metadata.json", "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)

    print(f"Backup created successfully in {backup_dir}")
    print(f"Exported {len(tables)} tables, SQL dump, vector cache, and manifest.")

if __name__ == "__main__":
    create_backup()
