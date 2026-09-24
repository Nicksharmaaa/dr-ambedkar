# FINAL DEPLOYMENT & EVALUATION GUIDE
## Digital Heritage Archive for Memorials, Manuscripts & Ambedkar
**SIH Problem Statement 26096: AI-Powered Institutional Archive and Audio-Visual Knowledge Platform**  
**Final Validation Phase — Terminal Deployment Guide**  
**Date:** September 2026 | **Target Audience:** SIH Judges, Evaluators, and Systems Engineers

---

## 1. Prerequisites & Environment Requirements

### 1.1 Host Environment
- **Operating System:** Windows 10/11, Ubuntu 22.04 LTS+, or macOS Sonoma
- **Python:** Version 3.11.x or 3.12.x (with `pip` and `venv`)
- **Node.js:** Version 18.x or 20.x LTS
- **Package Manager:** `pnpm` (version 8.x or 9.x) or `npm` (version 10+)
- **System Memory:** Minimum 8 GB RAM (16 GB recommended for local vector cache execution)
- **Disk Space:** 5 GB free disk space for archival cache and model weights

---

## 2. Repository Configuration & Environment Variables

### 2.1 Clone and Environment Setup
```bash
# Clone the repository
git clone https://github.com/Nicksharmaaa/dr-ambedkar.git
cd "dr ambedkar"
```

### 2.2 Environment Configuration File (`backend/.env`)
Create or edit `backend/.env` with the following production keys:

```ini
# Environment Mode
ENVIRONMENT=production
DEBUG=False

# Primary Database (Turso Cloud libSQL)
TURSO_DATABASE_URL=libsql://ambedkar-archive-deadrobo.aws-ap-south-1.turso.io
TURSO_AUTH_TOKEN=<YOUR_TURSO_AUTH_TOKEN>

# AI Generation Services (Groq LPU Primary + Google Gemini Fallback)
GROQ_API_KEY=<YOUR_GROQ_API_KEY>
GEMINI_API_KEY=<YOUR_GEMINI_API_KEY>

# Local Cache & Model Paths
VECTOR_CACHE_PATH=storage/local/vector_cache.npz
LOCAL_STORAGE_DIR=storage/local

# Security & CORS
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
SECRET_KEY=sih26096-heritage-archive-production-secret-key-2026
```

### 2.3 Frontend Environment Configuration (`frontend/.env.local`)
Create or edit `frontend/.env.local`:

```ini
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
NEXT_PUBLIC_APP_NAME="Dr. B. R. Ambedkar Heritage Archive"
NEXT_PUBLIC_DEFAULT_LOCALE=en
```

---

## 3. Dependency Installation

### 3.1 Backend Dependencies (Python Virtual Environment)
```bash
# Open terminal in repository root
cd backend
python -m venv venv

# Activate Virtual Environment:
# On Windows PowerShell:
.\venv\Scripts\Activate.ps1
# On Linux / macOS:
source venv/bin/activate

# Install requirements
pip install -r requirements.txt
cd ..
```

### 3.2 Frontend Dependencies (Node.js)
```bash
cd frontend
pnpm install
# Or: npm install
cd ..
```

---

## 4. Starting System Services

### 4.1 Automated Startup (PowerShell / Windows)
For evaluation convenience, you can start both the FastAPI backend and Next.js frontend concurrently:

```powershell
# In PowerShell Terminal 1 (Backend API):
cd "backend"
.\venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload

# In PowerShell Terminal 2 (Frontend App):
cd "frontend"
pnpm dev --port 3000
```

### 4.2 Automated Startup (Linux / macOS Bash)
```bash
# Terminal 1 (Backend API):
cd backend
source venv/bin/activate
uvicorn app.main:app --host 127.0.0.1 --port 8000 --workers 2

# Terminal 2 (Frontend App):
cd frontend
pnpm dev --port 3000
```

---

## 5. Verification & Health Checks

Once launched, confirm system health using `curl` or browser endpoints:

### 5.1 Backend Health Check
```bash
curl -s http://127.0.0.1:8000/api/v1/health
```
**Expected Response:**
```json
{
  "status": "ok",
  "service": "ambedkar-heritage-api",
  "version": "0.2.0-phase2",
  "environment": "development"
}
```

### 5.2 Vector Store & Cache Verification
```bash
curl -s "http://127.0.0.1:8000/api/v1/search/hybrid?query=Constitution&limit=1"
```
**Expected Output:** JSON result containing matched archival chunks with `reranker_score` > 0.80 within < 600ms.

### 5.3 Frontend Availability
Open your browser to:
- **Public Portal:** `http://localhost:3000`
- **Institutional Kiosk Mode:** `http://localhost:3000/kiosk`
- **Interactive Knowledge Graph:** `http://localhost:3000/graph`
- **Audiovisual Archive:** `http://localhost:3000/media`
- **Chronological Timeline:** `http://localhost:3000/timeline`

---

## 6. Offline Exhibition Pre-Caching

For museum kiosks operating in air-gapped or intermittent network environments:

1. **Synchronize Offline Manifest:**
   Access `http://127.0.0.1:8000/api/v1/kiosk/offline-manifest` to verify that all 7 core routes, essential images, and catalog subsets are registered.
2. **Pre-cache via Browser:**
   Open `http://localhost:3000/kiosk` in Chrome or Edge while connected. The registered ServiceWorker automatically caches assets.
3. **Simulate Offline Mode:**
   In Chrome DevTools, open the **Network** tab and select **Offline**. Refresh the page. The museum kiosk will load instantaneously from the local cache. Any generative AI query will display a graceful mandatory abstention notice:
   > *"Kiosk is operating in offline exhibition mode. Live neural generation is suspended; cached catalog records remain fully accessible."*

---

## 7. Troubleshooting & Common Operational Scenarios

| Issue | Root Cause | Resolution |
| :--- | :--- | :--- |
| **Port 8000 in use** | A previous FastAPI instance is still running | Find PID using `netstat -ano \| findstr :8000` and terminate via `taskkill /F /PID <PID>` |
| **Port 3000 in use** | A previous Next.js instance is running | Kill process or run `pnpm dev --port 3001` (update `.env.local` accordingly) |
| **Search returns 500 error** | Vector cache file missing or corrupted | Ensure `backend/storage/local/vector_cache.npz` is present (12,154 vectors, ~47 MB) |
| **Assistant API 429 Rate Limit** | Groq free-tier minute threshold reached | System automatically backs off 1.5s and cascades to Google Gemini fallback |
| **Assistant Chatbot Launcher Missing** | Viewport layout conflict | The launcher is fixed at the **bottom-left corner** (`z-[9999]`); verify browser zoom is 100% |
