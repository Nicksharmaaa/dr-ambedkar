"""
Extract complete schema inventory and export backup of database.
"""
import sqlite3
import json
from pathlib import Path

def extract():
    db_path = Path("storage/archive.db")
    if not db_path.exists():
        print("storage/archive.db does not exist")
        return

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    tables = [r[0] for r in cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name").fetchall()]
    
    inventory = {}
    for t in tables:
        cols = cursor.execute(f"PRAGMA table_info('{t}')").fetchall()
        fks = cursor.execute(f"PRAGMA foreign_key_list('{t}')").fetchall()
        idxs = cursor.execute(f"PRAGMA index_list('{t}')").fetchall()
        try:
            cnt = cursor.execute(f"SELECT count(*) FROM '{t}'").fetchone()[0]
        except Exception as e:
            cnt = f"error: {e}"

        inventory[t] = {
            "count": cnt,
            "columns": [{"cid": c[0], "name": c[1], "type": c[2], "notnull": c[3], "dflt_value": c[4], "pk": c[5]} for c in cols],
            "foreign_keys": [{"table": f[2], "from": f[3], "to": f[4]} for f in fks],
            "indexes": [i[1] for i in idxs]
        }

    out_file = Path("storage/inventory.json")
    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(inventory, f, indent=2)

    print(f"Extracted inventory for {len(tables)} tables to {out_file}.")

if __name__ == "__main__":
    extract()
