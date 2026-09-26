"""
Live Verification of Backend APIs backed by Local PostgreSQL (localhost:5432).
"""
import urllib.request
import json

BASE_URL = "http://127.0.0.1:8000/api/v1"

def test_endpoint(name, path):
    url = f"{BASE_URL}{path}"
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "VerificationClient/1.0"})
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode())
            print(f"[PASS] {name:<30} -> HTTP {resp.status}")
            return data
    except Exception as e:
        print(f"[FAIL] {name:<30} -> Error: {e}")
        return None

def main():
    print("=" * 70)
    print("LIVE API VERIFICATION AGAINST LOCAL POSTGRESQL")
    print("=" * 70)
    
    # 1. Health
    h = test_endpoint("Health Check", "/health")
    if h:
        print(f"       Service: {h.get('service')}, Environment: {h.get('environment')}")

    # 2. Documents
    d = test_endpoint("List Documents", "/documents")
    if d:
        print(f"       Total archival objects: {d.get('total')}, Returned: {len(d.get('items', []))}")

    # 3. Document Detail
    doc = test_endpoint("Get Document AMBEDKAR-VOL-01", "/documents/AMBEDKAR-VOL-01")
    if doc:
        print(f"       Title: {doc.get('title')[:50]}...")

    # 4. Knowledge Graph Neighbors
    g = test_endpoint("Knowledge Graph Neighbors", "/graph/entities/person-ambedkar/neighbors")
    if g:
        print(f"       Connected nodes: {g.get('total_nodes')}, Connected edges: {g.get('total_edges')}")

    # 5. Timeline
    t = test_endpoint("Timeline Events", "/timeline")
    if t:
        count = len(t) if isinstance(t, list) else t.get('total', len(t))
        print(f"       Timeline items: {count}")

    # 6. Stories
    s = test_endpoint("Story Collections", "/stories")
    if s:
        s_count = len(s) if isinstance(s, list) else s.get('total', len(s))
        print(f"       Story collections: {s_count}")

    # 7. Multilingual Corpus Dashboard
    m = test_endpoint("Multilingual Corpus", "/multilingual-corpus/dashboard")
    if m:
        m_count = m.get('total_manifests', m.get('manifests_count', 'OK'))
        print(f"       Multilingual corpus stats: {m_count}")

    # 8. Document Pages
    pages = test_endpoint("Pages for AMBEDKAR-VOL-01", "/documents/AMBEDKAR-VOL-01/pages")
    if pages:
        p_count = len(pages) if isinstance(pages, list) else pages.get('total', len(pages))
        print(f"       Total pages: {p_count}")

    # 9. Search Stats
    st = test_endpoint("Search Stats", "/search/stats")
    if st:
        chunks_info = st.get('total_chunks', 'N/A') if isinstance(st, dict) else len(st)
        print(f"       Indexed chunks: {chunks_info}")

    # 10. Hybrid Search
    s_res = test_endpoint("Hybrid Search ('caste')", "/search?q=caste&limit=3")
    if s_res:
        items = s_res.get('results', []) if isinstance(s_res, dict) else s_res
        print(f"       Found {len(items)} matching chunks.")

    # 11. Assistant Modes
    modes = test_endpoint("Assistant Modes", "/assistant/modes")
    if modes:
        print(f"       Available AI modes: {len(modes)}")

    print("=" * 70)
    print("ALL LIVE VERIFICATION CHECKS COMPLETED")
    print("=" * 70)

if __name__ == "__main__":
    main()
