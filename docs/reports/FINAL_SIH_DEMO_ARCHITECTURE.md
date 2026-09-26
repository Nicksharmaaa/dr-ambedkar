# Final SIH Demo Architecture: Edge-Cloud Hybrid Deployment

> **Project:** SIH Dr. B. R. Ambedkar Digital Heritage Archive  
> **Architecture Pattern:** Edge-Cloud Hybrid (Decoupled Serverless Frontend + Tunneled Edge Backend + Local PostgreSQL 18)  
> **Evaluation Context:** Smart India Hackathon Live Demonstrations  

---

## 1. System Architecture Diagram

```text
════════════════════════════════════════════════════════════════════════════════════
                        1. PRESENTATION TIER (CLOUD)
════════════════════════════════════════════════════════════════════════════════════
                             Vercel Global Edge Network
                           ┌───────────────────────────┐
                           │   Next.js 14 App Router   │
                           │   - IIIF Universal Viewer │
                           │   - 3D Knowledge Graph    │
                           │   - Interactive RAG Chat  │
                           │   - Multilingual Audio UI │
                           └─────────────┬─────────────┘
                                         │
                                         │ HTTPS (REST API)
                                         ▼
════════════════════════════════════════════════════════════════════════════════════
                     2. INGRESS & ENCRYPTED TUNNEL TIER
════════════════════════════════════════════════════════════════════════════════════
                        Cloudflare Tunnel / Secure Gateway
                     https://<sih-demo-subdomain>.trycloudflare.com
                           ┌───────────────────────────┐
                           │   - TLS 1.3 Termination   │
                           │   - DDoS Protection       │
                           │   - WebSocket / HTTP2     │
                           └─────────────┬─────────────┘
                                         │
                                         │ Outbound Encrypted Tunnel
                                         ▼
════════════════════════════════════════════════════════════════════════════════════
                     3. EDGE COMPUTE & APPLICATION TIER
════════════════════════════════════════════════════════════════════════════════════
                         Local Workstation (Edge Host)
                           ┌───────────────────────────┐
                           │  FastAPI Backend (8000)   │
                           │  - Auth & Rate Limiting   │
                           │  - Hybrid Search Engine   │
                           │  - Scholarly RAG Pipeline │
                           │  - Connection Pool (Pool) │
                           └───────┬───────┬───────┬───┘
                                   │       │       │
            ┌──────────────────────┘       │       └──────────────────────┐
            ▼                              ▼                              ▼
════════════════════════════════════════════════════════════════════════════════════
                      4. DATA & INTELLIGENCE STORAGE TIER
════════════════════════════════════════════════════════════════════════════════════
 ┌──────────────────────┐    ┌──────────────────────┐    ┌──────────────────────┐
 │ LOCAL POSTGRESQL 18  │    │ LOCAL ARCHIVAL STORE │    │ LOCAL AI/ML SERVICES │
 │ - Port 5432 (Loopback│    │ - 19 BAWS Volumes    │    │ - IndicTrans2 (8001) │
 │ - 52 Canonical Tables│    │ - ALTO XML / IIIF    │    │ - PaddleOCR (8002)   │
 │ - GIN Full-Text Index│    │ - Audio/Video Assets │    │ - Qwen3-Embedding    │
 │ - Vector Embeddings  │    │ - Vector Cache (.npz)│    │ - Qwen3-Reranker     │
 └──────────────────────┘    └──────────────────────┘    └──────────────────────┘
════════════════════════════════════════════════════════════════════════════════════
```

---

## 2. Tier-by-Tier Specification

### Tier 1: Presentation Tier (Cloud / Vercel)
- **Deployment Platform:** Vercel Global Edge Network.
- **Framework:** Next.js 14 with React Server Components, TypeScript, and Tailwind CSS.
- **Core Capabilities:**
  - High-resolution deep-zoom document inspection powered by IIIF v3.
  - Interactive WebGL-based 3D Force-Directed Knowledge Graph.
  - Voice-enabled research assistant interface with speech recognition and narration.
- **Security:** Zero backend secrets or database credentials compiled into frontend bundles.

### Tier 2: Ingress & Secure Tunnel Tier
- **Technology:** Cloudflare Tunnel (`cloudflared`) or ngrok.
- **Protocol:** TLS 1.3 encrypted tunnel.
- **Function:** Establishes a secure outbound-only connection from the edge host to Cloudflare's global network, routing public traffic to `http://127.0.0.1:8000`.
- **Advantage:** Bypasses NAT and dynamic IP issues without requiring router port-forwarding or public IP addresses.

### Tier 3: Edge Application Tier (FastAPI)
- **Runtime:** Python 3.11+ running Uvicorn.
- **Port:** `8000` (bound to `127.0.0.1`).
- **Core Responsibilities:**
  - Request validation via Pydantic schemas.
  - Hybrid search orchestrator: Combining BM25 lexical results and vector cosine scores via Reciprocal Rank Fusion (RRF).
  - Grounded RAG query resolution with strict citation enforcement.

### Tier 4: Data & Intelligence Tier
- **Database Engine:** Native PostgreSQL 18.x running as a local Windows service.
- **Port:** `5432` (strictly bound to `127.0.0.1`).
- **Data Model:** 52 relational tables capturing all entities, relationships, timeline events, stories, and OCR pages.
- **Vector Acceleration:** In-memory 1024-dimensional NumPy matrix cache for sub-3ms cosine similarity calculations across 12,154+ document chunks.

---

## 3. End-to-End Request Flows

### 3.1 Archival Document & Page Inspection Flow
```text
User clicks page in Vercel UI
  ──▶ GET /api/v1/documents/AMBEDKAR-VOL-01/pages/10
  ──▶ Cloudflare HTTPS Tunnel
  ──▶ FastAPI Backend
  ──▶ PostgresClient (`SELECT * FROM pages WHERE object_id = ...`)
  ──▶ Return JSON with OCR text, bounding boxes, and image references (1.8 ms)
```

### 3.2 Hybrid Search & RAG Assistant Flow
```text
User asks: "What were Ambedkar's views on caste endogamy?"
  ──▶ POST /api/v1/assistant/query
  ──▶ FastAPI Hybrid Search Pipeline:
        1. Lexical: PostgreSQL GIN search (`fts_chunks.tsv @@ plainto_tsquery(...)`)
        2. Vector: 1024-dim Qwen3 embedding -> NumPy cosine dot product
        3. RRF Merge: Combines top-50 candidates
        4. Cross-Encoder Rerank: Top-5 highest scoring passages
  ──▶ Generative Synthesis: Strictly citations-backed answer generation
  ──▶ Returns answer with exact volume, page number, and source quotes
```

---

## 4. Security & Network Boundary Matrix

| Service | Port | Host Binding | Publicly Accessible? | Authentication / Protection |
|:---|:---:|:---:|:---:|:---|
| **Vercel Frontend** | 443 | Vercel CDN | Yes | HTTPS, SSL Certificate |
| **Secure Tunnel** | Dynamic | Cloudflare Edge | Yes (Mapped) | Encrypted TLS 1.3 Tunnel |
| **FastAPI Backend** | 8000 | `127.0.0.1` | Via Tunnel Only | CORS, Rate Limiting, API Validation |
| **PostgreSQL 18** | 5432 | `127.0.0.1` | **NO (STRICT)** | Password Auth, Localhost Socket Only |
| **Indic Service** | 8001 | `127.0.0.1` | **NO (STRICT)** | Internal microservice |
| **OCR Service** | 8002 | `127.0.0.1` | **NO (STRICT)** | Internal microservice |
