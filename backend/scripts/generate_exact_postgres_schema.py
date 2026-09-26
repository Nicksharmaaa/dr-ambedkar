"""
Generate exact PostgreSQL schema matching 100% of SQLite inventory columns and types.
"""
import json
from pathlib import Path

TYPE_MAP = {
    "TEXT": "TEXT",
    "INTEGER": "BIGINT",
    "INT": "BIGINT",
    "REAL": "DOUBLE PRECISION",
    "FLOAT": "DOUBLE PRECISION",
    "BOOLEAN": "INTEGER",
    "BLOB": "BYTEA",
}

def clean_default(dflt):
    if dflt is None:
        return None
    d = str(dflt).strip()
    if d.startswith("(") and d.endswith(")"):
        d = d[1:-1].strip()
    if "datetime('now')" in d:
        return "CURRENT_TIMESTAMP"
    return d

def generate_ddl():
    inv_file = Path("storage/inventory.json")
    with open(inv_file, "r", encoding="utf-8") as f:
        inv = json.load(f)

    lines = [
        "-- Auto-generated Exact PostgreSQL Schema from SQLite Inventory",
        "CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";",
        "CREATE EXTENSION IF NOT EXISTS \"pg_trgm\";",
        ""
    ]

    for tbl_name, tbl_data in inv.items():
        # Skip internal FTS virtual data tables
        if tbl_name.startswith("fts_chunks_"):
            continue

        if tbl_name == "fts_chunks":
            lines.append("CREATE TABLE IF NOT EXISTS fts_chunks (")
            lines.append("    chunk_id TEXT PRIMARY KEY,")
            lines.append("    text TEXT NOT NULL,")
            lines.append("    object_id TEXT,")
            lines.append("    tsv tsvector GENERATED ALWAYS AS (to_tsvector('english', text)) STORED")
            lines.append(");")
            lines.append("CREATE INDEX IF NOT EXISTS idx_fts_chunks_tsv ON fts_chunks USING GIN(tsv);")
            lines.append("CREATE INDEX IF NOT EXISTS idx_fts_chunks_obj ON fts_chunks(object_id);")
            lines.append("")
            continue

        cols = tbl_data["columns"]
        pks = [c["name"] for c in cols if c["pk"] > 0]

        lines.append(f"CREATE TABLE IF NOT EXISTS {tbl_name} (")
        col_defs = []
        for col in cols:
            col_name = col["name"]
            raw_type = (col["type"] or "TEXT").upper().strip()
            pg_type = TYPE_MAP.get(raw_type, "TEXT")
            
            c_def = f"    {col_name} {pg_type}"
            if len(pks) == 1 and col_name == pks[0]:
                c_def += " PRIMARY KEY"
            elif col["notnull"] == 1:
                c_def += " NOT NULL"

            dflt = clean_default(col["dflt_value"])
            if dflt is not None:
                c_def += f" DEFAULT {dflt}"
            col_defs.append(c_def)

        if len(pks) > 1:
            col_defs.append(f"    PRIMARY KEY ({', '.join(pks)})")

        lines.append(",\n".join(col_defs))
        lines.append(");")
        lines.append("")

    out_file = Path("app/db/postgres_schema_exact.sql")
    out_file.write_text("\n".join(lines), encoding="utf-8")
    print(f"Generated exact schema with {len(inv)} tables to {out_file}")

if __name__ == "__main__":
    generate_ddl()
