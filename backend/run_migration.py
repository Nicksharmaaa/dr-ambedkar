import asyncio, sys, os
sys.path.insert(0, os.getcwd())
os.environ['TURSO_DB_URL'] = 'libsql://ambedkar-archive-deadrobo.aws-ap-south-1.turso.io'
os.environ['TURSO_AUTH_TOKEN'] = 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3OTAwOTcwNzIsImlkIjoiMDFhMGNhMTUtOGYwMS03MDk3LWE1ZWEtYTFmNzFjZmEzOTUyIiwia2lkIjoiamlaR0hIWHBzTkl3cVNDSzdfTUZYck1paDhITjhPbmJtUUhNT2VpdGpGOCIsInJpZCI6IjQwNWQ4YzJjLTNlZTktNDc4Ni1hN2E0LWEwNWY5ZjUwYzA5MCJ9.nxFifhVKMts334jGWudj26hZzsH6gs1s8UmWIQ5eb0dg7SJsE3P5b1KBkAt8bFRNMd_VFNKfA5rNVytOaZBTDA'
from app.db.turso_http import TursoHTTPClient
from app.db.migrate import run_migrations

TURSO_URL = os.environ['TURSO_DB_URL']
TURSO_TOKEN = os.environ['TURSO_AUTH_TOKEN']

async def main():
    db = TursoHTTPClient(url=TURSO_URL, auth_token=TURSO_TOKEN)
    
    print("Running migration with TursoHTTPClient...")
    n = await run_migrations(db)
    print(f"Migrations applied: {n}")
    
    # Verify
    r = await db.execute("SELECT name FROM roles ORDER BY name")
    print("Roles seeded:", [row['name'] for row in r.rows])
    
    r2 = await db.execute("SELECT version, applied_at FROM schema_migrations")
    print("Migration record:", r2.first())
    
    # Count all tables
    r3 = await db.execute("SELECT COUNT(id) as n FROM archival_objects")
    print("archival_objects count:", r3.first())
    
    r4 = await db.execute("SELECT COUNT(id) as n FROM collections")
    print("collections count:", r4.first())
    
    await db.close()
    print("\nMIGRATION SUCCESS")

asyncio.run(main())
