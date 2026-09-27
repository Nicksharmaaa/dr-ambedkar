import asyncio
from app.db.database import get_db_client

async def main():
    db = get_db_client()
    print("--- ARCHIVAL OBJECTS ---")
    res = await db.execute("SELECT id, stable_id, title, publication_date, language, object_type FROM archival_objects LIMIT 10;")
    for r in res.rows:
        print(f"[{r.get('id')}] {r.get('title')} ({r.get('publication_date')}) - {r.get('object_type')}")

    print("\n--- TIMELINE EVENTS COLUMNS ---")
    cols_res = await db.execute("SELECT column_name FROM information_schema.columns WHERE table_name = 'timeline_events';")
    print([r['column_name'] for r in cols_res.rows])
    res2 = await db.execute("SELECT * FROM timeline_events LIMIT 2;")
    print("Sample row:", res2.rows[0] if res2.rows else "empty")

    print("\n--- STORY COLLECTIONS ---")
    res3 = await db.execute("SELECT id, slug, title, epoch_label FROM story_collections;")
    for r in res3.rows:
        print(f"{r.get('slug')}: {r.get('title')} ({r.get('epoch_label')})")

    print("\n--- ENTITIES & RELATIONSHIPS ---")
    res4 = await db.execute("SELECT entity_type, COUNT(*) as cnt FROM entities GROUP BY entity_type;")
    for r in res4.rows:
        print(f"{r.get('entity_type')}: {r.get('cnt')}")

    await db.close()

if __name__ == "__main__":
    asyncio.run(main())
