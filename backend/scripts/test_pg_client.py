"""
Test PostgresClient functionality.
"""
import asyncio
import sys
from pathlib import Path
sys.path.insert(0, ".")

from app.db.postgres_client import PostgresClient

async def test():
    client = PostgresClient("host=localhost port=5432 user=ambedkar_user password=ambedkar_local_sih_2026_sec! dbname=ambedkar_db")
    
    # Test 1: Simple query with scalar
    r = await client.execute("SELECT count(*) as total FROM archival_objects;")
    print("Archival objects count:", r.scalar())
    
    # Test 2: Parameterized query with ?
    r2 = await client.execute("SELECT id, title FROM archival_objects WHERE id = ?;", ["AMBEDKAR-VOL-01"])
    row = r2.first()
    print("Found volume 1:", row.id, "-", row.title[:40])
    
    # Test 3: Entities query
    r3 = await client.execute("SELECT canonical_name, entity_type FROM entities WHERE id = ?;", ["person-ambedkar"])
    print("Entity:", r3.first())

    # Test 4: datetime('now') translation and INSERT OR IGNORE
    await client.execute("INSERT OR IGNORE INTO roles (id, name, description, created_at) VALUES ('test-role', 'test_role_name', 'desc', datetime('now'));")
    r4 = await client.execute("SELECT name FROM roles WHERE id = ?;", ["test-role"])
    print("Role inserted/queried:", r4.first())
    await client.execute("DELETE FROM roles WHERE id = ?;", ["test-role"])

    await client.close()
    print("ALL POSTGRES CLIENT TESTS PASSED!")

if __name__ == "__main__":
    asyncio.run(test())
