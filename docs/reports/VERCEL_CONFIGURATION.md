# Vercel Frontend Configuration & Secure Edge Integration

> **Project:** SIH Dr. B. R. Ambedkar Digital Heritage Archive  
> **Target:** Vercel Production Deployment  
> **Framework:** Next.js 14 App Router (React, Tailwind CSS, TypeScript)  
> **Integration Mode:** Client-side HTTPS routing to Local Edge Backend via Secure Tunnel  

---

## 1. Environment Variable Architecture

The Vercel-hosted frontend communicates exclusively with the backend via public RESTful endpoints.

### Mandatory Environment Variables in Vercel Dashboard

| Variable Name | Environment | Value Example | Description |
|:---|:---:|:---|:---|
| `NEXT_PUBLIC_API_URL` | Production / Preview | `https://ambedkar-demo.trycloudflare.com` | Base URL of the secure HTTPS tunnel terminating at your local FastAPI backend. **Do NOT add a trailing slash**. |
| `NEXT_PUBLIC_APP_ENV` | Production | `production` | Deployment environment identifier. |

> [!CAUTION]
> **Strict Security Isolation Rules:**
> 1. **NEVER** expose `DATABASE_URL` or PostgreSQL credentials in Vercel environment variables. The PostgreSQL database runs locally on `127.0.0.1:5432` and must remain completely isolated from the internet.
> 2. **NEVER** set database passwords or server-side JWT signing secrets with the `NEXT_PUBLIC_` prefix. `NEXT_PUBLIC_*` variables are embedded into client-side JavaScript bundles and are publicly visible to anyone inspecting the page source.
> 3. Only public client endpoints (`NEXT_PUBLIC_API_URL`) should ever be configured in Vercel.

---

## 2. Vercel Build & Project Settings

When creating or configuring the project on Vercel:

| Setting | Configuration Value |
|:---|:---|
| **Framework Preset** | Next.js |
| **Root Directory** | `frontend` |
| **Build Command** | `npm run build` (or `next build`) |
| **Output Directory** | `.next` (default) |
| **Install Command** | `npm install` |
| **Node.js Version** | `18.x` or `20.x` |

---

## 3. Backend CORS Alignment

The FastAPI backend is pre-configured in [`backend/app/main.py`](file:///c:/dr%20ambedkar/backend/app/main.py) to accept cross-origin requests from Vercel domains and the secure tunnel:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://*.vercel.app",
        "https://*.trycloudflare.com",
        "*"  # Allows dynamic demo tunnel subdomains during hackathon judging
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

This guarantees seamless communication without browser preflight (`OPTIONS`) blocking.

---

## 4. Frontend API Client Pattern

The frontend client in `frontend/` utilizes `NEXT_PUBLIC_API_URL` dynamically:

```typescript
// Example from frontend client utility
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function fetchArchivalDocuments() {
  const res = await fetch(`${API_BASE}/api/v1/documents`, {
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-store' // Ensures fresh data during live presentations
  });
  if (!res.ok) throw new Error(`API error: ${res.statusText}`);
  return res.json();
}
```

---

## 5. Live Demo Operational Protocol

During the Smart India Hackathon live demonstration:

1. **Start Local Backend & PostgreSQL:**
   ```powershell
   cd "c:\dr ambedkar\backend"
   python -m uvicorn app.main:app --port 8000
   ```
2. **Start Cloudflare Tunnel:**
   ```powershell
   cloudflared tunnel --url http://127.0.0.1:8000
   ```
   Note the assigned URL (e.g., `https://rapid-river-42.trycloudflare.com`).
3. **Update Vercel Environment:**
   - In Vercel Project Settings → Environment Variables, update `NEXT_PUBLIC_API_URL` to `https://rapid-river-42.trycloudflare.com`.
   - Hit **Redeploy** on the latest deployment (takes ~45 seconds).
4. **Open Vercel App:**
   - Navigate to `https://your-project.vercel.app`.
   - Experience zero-latency browsing, instant search, and live AI assistant interactions powered by your edge workstation!
