"""
Generate TURSO_DATABASE_INVENTORY.md from inventory.json
"""
import json
from pathlib import Path

def generate_inventory_md():
    inv_file = Path(r"c:\dr ambedkar\backend\storage\inventory.json")
    with open(inv_file, "r", encoding="utf-8") as f:
        inv = json.load(f)

    md = []
    md.append("# Turso / SQLite Database Schema & Row Inventory")
    md.append("")
    md.append("Extracted directly from the baseline database on 2026-09-26.")
    md.append("")
    md.append("## 1. System Summary")
    md.append("")
    md.append("| Metric | Count |")
    md.append("|---|---|")
    md.append(f"| **Total Tables** | {len(inv)} |")
    md.append(f"| **Archival Objects (Volumes)** | {inv.get('archival_objects', {}).get('count', 0)} |")
    md.append(f"| **Work Manifests** | {inv.get('work_manifests', {}).get('count', 0)} |")
    md.append(f"| **Entities** | {inv.get('entities', {}).get('count', 0)} |")
    md.append(f"| **Entity Aliases** | {inv.get('entity_aliases', {}).get('count', 0)} |")
    md.append(f"| **Relationships** | {inv.get('relationships', {}).get('count', 0)} |")
    md.append(f"| **Relationship Evidence** | {inv.get('relationship_evidence', {}).get('count', 0)} |")
    md.append(f"| **Timeline Events** | {inv.get('timeline_events', {}).get('count', 0)} |")
    md.append(f"| **Curated Stories** | {inv.get('story_collections', {}).get('count', 0)} |")
    md.append(f"| **Story Items** | {inv.get('story_items', {}).get('count', 0)} |")
    md.append(f"| **Roles** | {inv.get('roles', {}).get('count', 0)} |")
    md.append(f"| **Schema Migrations** | {inv.get('schema_migrations', {}).get('count', 0)} |")
    md.append(f"| **Cached Vector Embeddings** | 12,154 in `vector_cache.npz` |")
    md.append("")
    md.append("---")
    md.append("")
    md.append("## 2. Table-by-Table Inventory")
    md.append("")

    for tbl_name, tbl_data in sorted(inv.items()):
        cnt = tbl_data.get("count", 0)
        cols = tbl_data.get("columns", [])
        fks = tbl_data.get("foreign_keys", [])
        idxs = tbl_data.get("indexes", [])

        md.append(f"### Table: `{tbl_name}` (Rows: {cnt})")
        md.append("")
        md.append("| Column | Type | Nullable | Default | PK |")
        md.append("|---|---|---|---|---|")
        for col in cols:
            nullable = "NO" if col["notnull"] == 1 else "YES"
            pk = "YES" if col["pk"] > 0 else "NO"
            dflt = str(col["dflt_value"]) if col["dflt_value"] is not None else "-"
            md.append(f"| `{col['name']}` | `{col['type']}` | {nullable} | {dflt} | {pk} |")
        md.append("")

        if fks:
            md.append("**Foreign Keys:**")
            for fk in fks:
                md.append(f"- `{fk['from']}` → `{fk['table']}({fk['to']})`")
            md.append("")

        if idxs:
            md.append(f"**Indexes:** {', '.join(f'`{i}`' for i in idxs)}")
            md.append("")

        md.append("---")
        md.append("")

    out_file = Path(r"c:\dr ambedkar\TURSO_DATABASE_INVENTORY.md")
    with open(out_file, "w", encoding="utf-8") as f:
        f.write("\n".join(md))

    print(f"Generated {out_file} successfully.")

if __name__ == "__main__":
    generate_inventory_md()
