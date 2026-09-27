import asyncio
from app.db.database import get_db_client

async def main():
    db = get_db_client()
    try:
        res = await db.execute("SELECT table_name as name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name;")
        tables = [r["name"] for r in res.rows]
    except Exception:
        res = await db.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;")
        tables = [r["name"] for r in res.rows]
    print(f"Total tables: {len(tables)}")
    for t in tables:
        try:
            count_res = await db.execute(f"SELECT COUNT(*) as cnt FROM {t};")
            cnt = count_res.rows[0]["cnt"]
            print(f"  - {t}: {cnt} rows")
        except Exception as e:
            print(f"  - {t}: error {e}")
    await db.close()

if __name__ == "__main__":
    asyncio.run(main())

