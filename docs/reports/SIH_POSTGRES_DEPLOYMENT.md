# SIH Operational Runbook: Local PostgreSQL & Edge Backend Deployment

> **Target Audience:** SIH Evaluators, Project Reviewers, and Demonstrators  
> **Platform:** Dr. B. R. Ambedkar Digital Heritage Archive  
> **Architecture:** Edge-Local Backend (FastAPI + PostgreSQL 18 + AI) with Secure Public Tunnel

---

## 1. Quick Start Demonstration Checklist

Follow these 4 sequential steps to launch the entire project backend for live SIH demonstration:

```powershell
# Step 1: Verify PostgreSQL 18 is running
Get-Service postgresql*

# Step 2: Launch FastAPI Backend (Port 8000)
cd "c:\dr ambedkar\backend"
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000

# Step 3: Launch Secure Public Tunnel (in a new terminal)
cloudflared tunnel --url http://127.0.0.1:8000

# Step 4: Verify Live Public Connectivity
# Copy the generated https://<random-id>.trycloudflare.com URL and open /api/v1/health
```

---

## 2. Detailed Service Configuration & Verification

### 2.1 Native PostgreSQL 18 Service
The project runs natively against local PostgreSQL 18 on Windows:
- **Host:** `localhost` (`127.0.0.1`)
- **Port:** `5432`
- **Database:** `ambedkar_db`
- **Role/User:** `ambedkar_user`
- **Security Rule:** PostgreSQL is bound strictly to `127.0.0.1`. No external firewall ports are opened for `5432`.

To test PostgreSQL connectivity independently:
```powershell
cd "c:\dr ambedkar\backend"
python -c "import psycopg; conn = psycopg.connect('host=localhost port=5432 user=ambedkar_user dbname=ambedkar_db'); print('PostgreSQL Connection: SUCCESS'); conn.close()"
```

### 2.2 FastAPI Backend Service (Port 8000)
The backend service connects to PostgreSQL via a high-performance connection pool (`psycopg_pool.ConnectionPool`):
- **Configuration File:** [`backend/.env`](file:///c:/dr%20ambedkar/backend/.env)
- **Database URI Format:** `postgresql://ambedkar_user:***@localhost:5432/ambedkar_db`
- **CORS Policy:** Pre-configured to accept requests from all origins (`*`) and Vercel domains (`https://*.vercel.app`).

Start command:
```powershell
cd "c:\dr ambedkar\backend"
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
Expected output on launch:
```text
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     [STARTUP] Connecting to PostgreSQL database at localhost:5432/ambedkar_db...
INFO:     [STARTUP] Database connection OK.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
```

---

## 3. Secure Public Tunnel Setup

To connect the Vercel-deployed frontend to the local edge backend without exposing internal infrastructure, use an encrypted public tunnel.

### Option A: Cloudflare Tunnel (Recommended — No Account Required)
```powershell
# Using pre-installed or downloaded cloudflared
cloudflared tunnel --url http://127.0.0.1:8000
```
Console output will display:
```text
+--------------------------------------------------------------------------------------------+
|  Your quick Tunnel has been created! Visit it at (it may take some time to be reachable):  |
|  https://unique-subdomain.trycloudflare.com                                                |
+--------------------------------------------------------------------------------------------+
```

### Option B: ngrok (Alternative)
```powershell
ngrok http 8000
```

### Option C: Bore / Localtunnel
```powershell
npx localtunnel --port 8000
```

---

## 4. Connecting Vercel Frontend to the Tunnel

1. Open your Vercel Project Dashboard.
2. Navigate to **Settings** → **Environment Variables**.
3. Set or update the variable:
   - **Key:** `NEXT_PUBLIC_API_URL`
   - **Value:** `https://unique-subdomain.trycloudflare.com` (your active tunnel URL, no trailing slash).
4. Click **Redeploy** or trigger a fresh deployment.
5. The Vercel frontend is now fully connected to your local backend, local PostgreSQL, and local AI engines.

---

## 5. Local AI/ML Microservices (Optional/Auxiliary)

For complete multi-modal AI capabilities during the demonstration:

| Service | Script / Directory | Port | Capabilities |
|:---|:---|:---:|:---|
| **Indic Multilingual** | `backend-indic` (venv-indic, Python 3.10) | `8001` | IndicTrans2 (22 languages), IndicConformer ASR |
| **Document Intelligence**| `backend/scripts/start_ocr_service.py` (venv-ocr, Python 3.12) | `8002` | PaddleOCR PP-OCRv5 & PP-StructureV3 |
| **Semantic Vector Search**| Embedded in backend (FastAPI) | `8000` | Qwen3-Embedding-0.6B + 12,154 chunk cache |

---

## 6. Verification and Smoke Testing

Verify the tunnel and PostgreSQL connection with a simple curl command from any outside device:

```bash
# Check Health
curl https://unique-subdomain.trycloudflare.com/api/v1/health

# Check Archival Objects
curl https://unique-subdomain.trycloudflare.com/api/v1/documents

# Check Hybrid Search
curl "https://unique-subdomain.trycloudflare.com/api/v1/search?q=constitution&limit=5"
```
