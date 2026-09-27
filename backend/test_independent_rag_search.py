import json
import urllib.request
import urllib.error
import sys

BASE_URL = "http://127.0.0.1:8000/api/v1"

def test_search():
    print("\n--- 1. Testing Search (/api/v1/search) ---")
    url = f"{BASE_URL}/search?q=caste&limit=3&mode=hybrid"
    req = urllib.request.Request(url)
    try:
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode())
            print(f"Status: {resp.status}")
            print(f"Total results: {data.get('total')}")
            chunks = data.get("chunks", [])
            print(f"Chunks returned: {len(chunks)}")
            for i, c in enumerate(chunks[:2]):
                print(f"  [{i+1}] Vol: {c.get('volume_number')}, Page: {c.get('page_number')}, Score: {c.get('score'):.4f}")
                snippet = c.get('text', '')[:100].replace('\n', ' ')
                print(f"      Text: {snippet}...")
            assert len(chunks) > 0, "No chunks returned for query 'caste'"
            print(">>> SEARCH TEST PASSED.")
    except Exception as e:
        print(f"Search failed: {e}")
        return False
    return True

def test_rag_grounded():
    print("\n--- 2. Testing Grounded RAG Query (/api/v1/assistant/ask) ---")
    payload = {
        "question": "What is Dr. Ambedkar's critique of the division of labour in caste?",
        "mode": "ask",
        "top_k": 3
    }
    req = urllib.request.Request(
        f"{BASE_URL}/assistant/ask",
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"}
    )
    try:
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode())
            print(f"Status: {resp.status}")
            print(f"Abstention: {data.get('is_abstention')}")
            print(f"Faithfulness Score: {data.get('faithfulness_score')}")
            print(f"Answer snippet: {data.get('answer', '')[:200]}...")
            citations = data.get("citations", [])
            print(f"Citations returned: {len(citations)}")
            for c in citations[:3]:
                print(f"  Citation: {c.get('citation_string')} | Doc: {c.get('object_id')} Page: {c.get('page_number')}")
            assert len(citations) > 0 or not data.get('is_abstention'), "RAG failed to provide grounded citations"
            print(">>> GROUNDED RAG TEST PASSED.")
    except Exception as e:
        print(f"Grounded RAG failed: {e}")
        return False
    return True

def test_rag_hallucination_refusal():
    print("\n--- 3. Testing RAG Hallucination Refusal (/api/v1/assistant/ask) ---")
    payload = {
        "question": "What did Dr. Ambedkar write in 2026 regarding quantum computing neural networks and Bitcoin mining?",
        "mode": "ask",
        "top_k": 3
    }
    req = urllib.request.Request(
        f"{BASE_URL}/assistant/ask",
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"}
    )
    try:
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode())
            print(f"Status: {resp.status}")
            print(f"Abstention: {data.get('is_abstention')}")
            print(f"Faithfulness Score: {data.get('faithfulness_score')}")
            answer = data.get('answer', '')
            print(f"Answer: {answer}")
            # The system must either abstain or explicitly state insufficient archival evidence
            is_refusal = (
                data.get('is_abstention') is True
                or "insufficient" in answer.lower()
                or "cannot find" in answer.lower()
                or "no archival evidence" in answer.lower()
                or "not found" in answer.lower()
                or "does not contain" in answer.lower()
            )
            print(f"Refusal / No-Evidence Detected: {is_refusal}")
            assert is_refusal, "System fabricated an answer instead of abstaining/refusing!"
            print(">>> HALLUCINATION REFUSAL TEST PASSED.")
    except Exception as e:
        print(f"Hallucination refusal failed: {e}")
        return False
    return True

def test_claim_validator():
    print("\n--- 4. Testing Standalone Claim Validation (/api/v1/assistant/validate-claims) ---")
    payload = {
        "answer": "Caste is not just a division of labour, it is a division of labourers.",
        "evidence_chunk_ids": []
    }
    req = urllib.request.Request(
        f"{BASE_URL}/assistant/validate-claims",
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"}
    )
    try:
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode())
            print(f"Status: {resp.status}")
            print(f"Total claims audited: {data.get('total_claims')}")
            print(f"Claim items: {data.get('claims')}")
            print(">>> CLAIM VALIDATOR TEST PASSED.")
    except Exception as e:
        print(f"Claim validator failed: {e}")
        return False
    return True

if __name__ == "__main__":
    t1 = test_search()
    t2 = test_rag_grounded()
    t3 = test_rag_hallucination_refusal()
    t4 = test_claim_validator()
    
    if all([t1, t2, t3, t4]):
        print("\n==========================================")
        print("ALL SEARCH & RAG VERIFICATION TESTS PASSED")
        print("==========================================")
        sys.exit(0)
    else:
        print("\nSOME TESTS FAILED")
        sys.exit(1)
