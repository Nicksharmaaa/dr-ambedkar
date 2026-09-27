import asyncio
import httpx
from app.db.database import get_db_client

BASE_URL = "http://127.0.0.1:8000/api/v1"

async def test_rbac():
    async with httpx.AsyncClient(timeout=30.0) as client:
        print("=== 1. Testing Unauthenticated / Anonymous Visitor Access ===")
        # Citations export is public
        r = await client.get(f"{BASE_URL}/documents/AMBEDKAR-VOL-01/export?format=citations")
        print(f"  Visitor GET /documents/AMBEDKAR-VOL-01/export?format=citations: {r.status_code} (Expect 200)")
        assert r.status_code == 200, f"Expected 200, got {r.status_code}"

        # Bulk text export requires researcher+
        r = await client.get(f"{BASE_URL}/documents/AMBEDKAR-VOL-01/export?format=text")
        print(f"  Visitor GET /documents/AMBEDKAR-VOL-01/export?format=text: {r.status_code} (Expect 403 Forbidden)")
        assert r.status_code == 403, f"Expected 403, got {r.status_code}"

        # Research pack requires researcher+
        r = await client.post(f"{BASE_URL}/collections/export/research-pack", json={"item_ids": ["AMBEDKAR-VOL-01"]})
        print(f"  Visitor POST /collections/export/research-pack: {r.status_code} (Expect 403 Forbidden)")
        assert r.status_code == 403, f"Expected 403, got {r.status_code}"

        # OCR review requires archivist+
        r = await client.post(f"{BASE_URL}/ocr/review", json={
            "document_id": "AMBEDKAR-VOL-01",
            "page_number": 1,
            "reviewed_text": "Verified text by curator",
        })
        print(f"  Visitor POST /ocr/review: {r.status_code} (Expect 403 Forbidden)")
        assert r.status_code == 403, f"Expected 403, got {r.status_code}"

        # Admin schema status requires admin
        r = await client.get(f"{BASE_URL}/admin/schema/status")
        print(f"  Visitor GET /admin/schema/status: {r.status_code} (Expect 403 Forbidden)")
        assert r.status_code == 403, f"Expected 403, got {r.status_code}"

        print("\n=== 2. Acquiring Real Cryptographic JWT for Researcher ===")
        r = await client.post(f"{BASE_URL}/auth/session-token", json={"role": "researcher"})
        assert r.status_code == 200
        res_data = r.json()
        researcher_token = res_data["access_token"]
        print(f"  Acquired Researcher JWT token: {researcher_token[:25]}... Role: {res_data['user']['role']}")

        res_headers = {"Authorization": f"Bearer {researcher_token}"}
        # Researcher bulk text export
        r = await client.get(f"{BASE_URL}/documents/AMBEDKAR-VOL-01/export?format=text", headers=res_headers)
        print(f"  Researcher GET /documents/AMBEDKAR-VOL-01/export?format=text: {r.status_code} (Expect 200)")
        assert r.status_code == 200, f"Expected 200, got {r.status_code}"
        print(f"    Exported {len(r.content)} bytes of text")

        # Researcher Research Pack export
        r = await client.post(f"{BASE_URL}/collections/export/research-pack", json={"item_ids": ["AMBEDKAR-VOL-01"]}, headers=res_headers)
        print(f"  Researcher POST /collections/export/research-pack: {r.status_code} (Expect 200)")
        assert r.status_code == 200, f"Expected 200, got {r.status_code}"
        print(f"    Exported {len(r.content)} bytes of ZIP research pack")

        # Researcher attempting OCR review (should be 403)
        r = await client.post(f"{BASE_URL}/ocr/review", json={
            "document_id": "AMBEDKAR-VOL-01",
            "page_number": 1,
            "reviewed_text": "Verified text",
        }, headers=res_headers)
        print(f"  Researcher POST /ocr/review: {r.status_code} (Expect 403 Forbidden)")
        assert r.status_code == 403, f"Expected 403, got {r.status_code}"

        # Researcher attempting Admin route (should be 403)
        r = await client.get(f"{BASE_URL}/admin/schema/status", headers=res_headers)
        print(f"  Researcher GET /admin/schema/status: {r.status_code} (Expect 403 Forbidden)")
        assert r.status_code == 403, f"Expected 403, got {r.status_code}"

        print("\n=== 3. Acquiring Real Cryptographic JWT for Archivist ===")
        r = await client.post(f"{BASE_URL}/auth/session-token", json={"role": "archivist"})
        assert r.status_code == 200
        arch_data = r.json()
        archivist_token = arch_data["access_token"]
        print(f"  Acquired Archivist JWT token: {archivist_token[:25]}... Role: {arch_data['user']['role']}")
        arch_headers = {"Authorization": f"Bearer {archivist_token}"}

        # Archivist performing OCR review
        r = await client.post(f"{BASE_URL}/ocr/review", json={
            "document_id": "AMBEDKAR-VOL-01",
            "page_number": 1,
            "reviewed_text": "Authoritative review by chief curator",
        }, headers=arch_headers)
        print(f"  Archivist POST /ocr/review: {r.status_code} (Expect 200)")
        assert r.status_code == 200, f"Expected 200, got {r.status_code}"

        # Archivist attempting Admin schema/status (should be 403)
        r = await client.get(f"{BASE_URL}/admin/schema/status", headers=arch_headers)
        print(f"  Archivist GET /admin/schema/status: {r.status_code} (Expect 403 Forbidden)")
        assert r.status_code == 403, f"Expected 403, got {r.status_code}"

        print("\n=== 4. Acquiring Real Cryptographic JWT for Administrator ===")
        r = await client.post(f"{BASE_URL}/auth/session-token", json={"role": "admin"})
        assert r.status_code == 200
        admin_data = r.json()
        admin_token = admin_data["access_token"]
        print(f"  Acquired Admin JWT token: {admin_token[:25]}... Role: {admin_data['user']['role']}")
        admin_headers = {"Authorization": f"Bearer {admin_token}"}

        # Admin accessing schema/status
        r = await client.get(f"{BASE_URL}/admin/schema/status", headers=admin_headers)
        print(f"  Admin GET /admin/schema/status: {r.status_code} (Expect 200)")
        assert r.status_code == 200, f"Expected 200, got {r.status_code}"

        print("\n=== 5. Checking Audit Log Records in Database ===")
        db = get_db_client()
        audit_res = await db.execute("SELECT id, user_id, action, resource, resource_id, details, created_at FROM audit_events ORDER BY created_at DESC LIMIT 5;")
        print(f"  Latest audit entries ({len(audit_res.rows)} rows):")
        for row in audit_res.rows:
            print(f"    - [{row['created_at']}] user: {row['user_id']} | action: {row['action']} | resource: {row['resource']} | details: {row['details']}")
        await db.close()

        print("\n[SUCCESS] ALL REAL RBAC & AUTHENTICATION TESTS PASSED WITH 100% SUCCESS!")

if __name__ == "__main__":
    asyncio.run(test_rbac())
