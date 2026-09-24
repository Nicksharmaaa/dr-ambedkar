import asyncio
import libsql_client

TURSO_URL = "libsql://ambedkar-archive-deadrobo.aws-ap-south-1.turso.io"
TURSO_TOKEN = "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3OTAwOTY4NDQsImlkIjoiMDFhMGNhMTUtOGYwMS03MDk3LWE1ZWEtYTFmNzFjZmEzOTUyIiwia2lkIjoiamlaR0hIWHBzTkl3cVNDSzdfTUZYck1paDhITjhPbmJtUUhNT2VpdGpGOCIsInJpZCI6IjQwNWQ4YzJjLTNlZTktNDc4Ni1hN2E0LWEwNWY5ZjUwYzA5MCJ9.lLvrCedQTMA-DPBUNKGX_m6Q4cGfGnmdCM6zn6RA_2zrX3YPhmABOGgJH5iCIofqKTp8swEWdbhUKSfSVDUxAA"

async def test():
    async with libsql_client.create_client(url=TURSO_URL, auth_token=TURSO_TOKEN) as client:
        # Test read
        result = await client.execute("SELECT 1 AS ping")
        print("Connection: OK")
        print("Ping response:", result.rows)

        # Test write
        await client.execute(
            "CREATE TABLE IF NOT EXISTS _phase1_verify (id INTEGER PRIMARY KEY AUTOINCREMENT, msg TEXT, ts TEXT)"
        )
        await client.execute(
            "INSERT INTO _phase1_verify (msg, ts) VALUES (?, datetime('now'))",
            ["phase1-connection-verified"]
        )
        r2 = await client.execute("SELECT * FROM _phase1_verify ORDER BY id DESC LIMIT 1")
        print("Write test: OK")
        print("Row written:", dict(zip(r2.columns, r2.rows[0])))
        print()
        print("=== TURSO DATABASE: LIVE AND WRITABLE ===")
        print("URL:", TURSO_URL)
        print("Region: ap-south-1 (Mumbai)")

asyncio.run(test())
