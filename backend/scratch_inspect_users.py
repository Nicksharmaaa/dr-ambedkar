import asyncio
from app.db.database import get_db_client

async def main():
    db = get_db_client()
    res = await db.execute("""
        SELECT table_name, column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name IN ('users', 'roles', 'permissions', 'audit_events')
        ORDER BY table_name, ordinal_position;
    """)
    for r in res.rows:
        print(f"{r['table_name']}.{r['column_name']} ({r['data_type']})")
    
    roles = await db.execute("SELECT * FROM roles;")
    print("\nExisting roles:")
    for r in roles.rows:
        print(" ", dict(r))
    await db.close()

if __name__ == "__main__":
    asyncio.run(main())
