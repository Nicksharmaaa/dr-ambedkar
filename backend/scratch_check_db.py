import asyncio
from app.db.database import get_db_client

async def main():
    db = get_db_client()
    res = await db.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;")
    tables = [r["name"] if "name" in r else list(r.values())[0] for r in res.rows]
    print(f"Total tables: {len(tables)}")
    for t in tables:
        try:
            count_res = await db.execute(f"SELECT COUNT(*) as cnt FROM {t};")
            cnt = count_res.rows[0]["cnt"] if "cnt" in count_res.rows[0] else list(count_res.rows[0].values())[0]
            print(f"  - {t}: {cnt} rows")
        except Exception as e:
            print(f"  - {t}: error {e}")

if __name__ == "__main__":
    asyncio.run(main())
