import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const BACKEND_BASE = (
  process.env.BACKEND_INTERNAL_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:8000"
)
  .replace(/\/api\/v1\/?$/, "")
  .replace(/\/api\/?$/, "")
  .replace(/\/+$/, "");

const isVercel = Boolean(process.env.VERCEL);
const isLoopback =
  BACKEND_BASE.includes("localhost") || BACKEND_BASE.includes("127.0.0.1");
const BACKEND_OFFLINE = isVercel && isLoopback;

// ---------------------------------------------------------------------------
// Offline fallback response builder
// Returns realistic static data for each known API path so the UI
// degrades gracefully instead of crashing on 503.
// ---------------------------------------------------------------------------
function offlineFallback(path: string, req: NextRequest): NextResponse {
  const now = new Date().toISOString();

  // --- Auth ---
  if (path.startsWith("auth/session-token")) {
    const role = "visitor";
    return NextResponse.json({
      access_token: `offline_session_${role}_${Date.now()}`,
      token_type: "bearer",
      expires_in: 86400,
      user: {
        id: "offline-user",
        role,
        full_name: "Visitor",
        email: null,
        permissions: ["read"],
        is_active: true,
      },
    });
  }
  if (path.startsWith("auth/me")) {
    return NextResponse.json({
      id: "offline-user",
      role: "visitor",
      full_name: "Visitor",
      email: null,
      permissions: ["read"],
      is_active: true,
    });
  }
  if (path.startsWith("auth/logout")) {
    return NextResponse.json({ message: "Logged out" });
  }

  // --- Health ---
  if (path.startsWith("health/database")) {
    return NextResponse.json({ status: "offline", message: "Backend offline — running in archival-only mode." });
  }
  if (path.startsWith("health/storage")) {
    return NextResponse.json({ status: "offline", message: "Backend offline — running in archival-only mode." });
  }
  if (path.startsWith("health")) {
    return NextResponse.json({
      status: "degraded",
      version: "cloud-static",
      environment: "vercel-standalone",
      backend: "offline",
      message: "Backend microservice is offline. Frontend archival data is available.",
    });
  }

  // --- Documents ---
  if (path === "documents" || path.startsWith("documents?")) {
    return NextResponse.json({
      items: [],
      total: 0,
      limit: 20,
      offset: 0,
      message: "Backend offline — use the local archive browser.",
    });
  }
  if (path.match(/^documents\/[^/]+$/)) {
    return NextResponse.json({ error: "Document not found in offline mode" }, { status: 404 });
  }
  if (path.match(/^documents\/[^/]+\/(pages|chunks|citations)/)) {
    return NextResponse.json({ items: [], total: 0 });
  }

  // --- Collections ---
  if (path.startsWith("collections")) {
    return NextResponse.json([]);
  }

  // --- Timeline ---
  if (path === "timeline" || path.startsWith("timeline?")) {
    return NextResponse.json([]);
  }
  if (path === "timeline/categories") {
    return NextResponse.json({ categories: [] });
  }
  if (path === "timeline/locations") {
    return NextResponse.json({ locations: [], count: 0 });
  }
  if (path.startsWith("timeline/search")) {
    return NextResponse.json([]);
  }
  if (path.startsWith("timeline/events/")) {
    return NextResponse.json({ error: "Event not found in offline mode" }, { status: 404 });
  }

  // --- Graph ---
  if (path.startsWith("graph/search")) {
    return NextResponse.json({ query: "", total: 0, entities: [] });
  }
  if (path.match(/^graph\/entities\/[^/]+\/neighbors/)) {
    return NextResponse.json({ nodes: [], links: [], entity: null });
  }
  if (path.match(/^graph\/entities\/[^/]+/)) {
    return NextResponse.json({ error: "Entity not found in offline mode" }, { status: 404 });
  }
  if (path.match(/^graph\/relationships\/[^/]+\/evidence/)) {
    return NextResponse.json({ relationship_id: "", evidence_count: 0, evidence: [] });
  }
  if (path.match(/^graph\/relationships\//)) {
    return NextResponse.json({ error: "Relationship not found" }, { status: 404 });
  }
  if (path.startsWith("graph/why-connected")) {
    return NextResponse.json({ source: null, target: null, paths: [], explanation: "Graph offline." });
  }

  // --- Stories ---
  if (path === "stories") return NextResponse.json([]);
  if (path.startsWith("stories/")) {
    return NextResponse.json({ error: "Story not found in offline mode" }, { status: 404 });
  }

  // --- Preservation ---
  if (path === "preservation/report") {
    return NextResponse.json({
      total_objects: 0,
      total_bytes: 0,
      total_preservation_events: 0,
      fixity: { total_checks: 0, passed_checks: 0, failed_checks: 0, integrity_rate_pct: 100 },
      status: "offline",
      evaluated_at: now,
      recent_events: [],
      message: "Preservation service offline — backend not connected.",
    });
  }
  if (path.match(/^preservation\/events\//)) {
    return NextResponse.json([]);
  }
  if (path.match(/^preservation\/fixity-check\//)) {
    return NextResponse.json({ status: "skipped", message: "Backend offline" });
  }

  // --- IIIF ---
  if (path.startsWith("iiif/")) {
    return NextResponse.json({ error: "IIIF service offline" }, { status: 503 });
  }

  // --- AI Research Assistant ---
  if (path === "assistant/ask" || path.startsWith("assistant/ask")) {
    return NextResponse.json({
      answer:
        "The AI Research Assistant is currently running in offline mode and cannot connect to the reasoning engine. " +
        "Please explore the curated archival documents and the local search in the meantime.",
      citations: [],
      confidence: 0,
      model: "offline",
      mode: "offline",
      is_abstention: true,
      evidence_chain_id: null,
      timestamp: now,
    });
  }
  if (path === "assistant/modes") {
    return NextResponse.json([
      { mode: "scholar", label: "Scholar Mode", description: "Deep archival reasoning (offline)", available: false },
      { mode: "educator", label: "Educator Mode", description: "Simplified explainer (offline)", available: false },
    ]);
  }
  if (path.startsWith("assistant/history")) {
    return NextResponse.json([]);
  }
  if (path === "assistant/validate-claims") {
    return NextResponse.json({ answer: "", claims: [], is_abstention: true, total_claims: 0, supported_count: 0 });
  }
  if (path === "assistant/ask-page" || path === "assistant/ask-page-action") {
    return NextResponse.json({
      answer: "Page analysis is unavailable in offline mode.",
      citations: [],
      confidence: 0,
      model: "offline",
      is_abstention: true,
      timestamp: now,
    });
  }

  // --- Corpus (RAG) ---
  if (path === "corpus/stats") {
    return NextResponse.json({
      total_volumes: 0, total_chunks: 0, total_fts_indexed: 0,
      volumes: [], status: "offline",
    });
  }
  if (path === "corpus/search") {
    return NextResponse.json({ query: "", total_found: 0, results: [] });
  }
  if (path === "corpus/ask") {
    return NextResponse.json({
      query: "", answer: "Corpus RAG is offline.", confidence: 0,
      citations: [], sources_used: 0, model: "offline", timestamp: now,
    });
  }

  // --- Multilingual / Indic ---
  if (path === "indic/translate") {
    try {
      return NextResponse.json({ translated_text: "", source_language: "en", target_language: "en", model: "offline" });
    } catch { return NextResponse.json({ translated_text: "" }); }
  }
  if (path === "indic/tts/synthesize") {
    // Return a minimal silent WAV as base64 so audio players don't crash
    return NextResponse.json({
      audio_base64: null,
      audio_url: null,
      duration_seconds: 0,
      model: "offline",
      message: "TTS service offline — backend not connected.",
    });
  }
  if (path.startsWith("indic/localizations/")) {
    return NextResponse.json({ localizations: [] });
  }

  // --- Voice ---
  if (path === "voice/transcribe") {
    return NextResponse.json({ text: "", language: "en", confidence: 0, model: "offline" });
  }

  // --- Media ---
  if (path === "media/tracks" || path.startsWith("media/tracks?")) {
    return NextResponse.json([]);
  }
  if (path.match(/^media\/tracks\//)) {
    return NextResponse.json({ error: "Track not found" }, { status: 404 });
  }
  if (path.startsWith("media/search")) {
    return NextResponse.json({ query: "", total: 0, matches: [] });
  }

  // --- Multimodal ---
  if (path === "multimodal/analyze-page") {
    return NextResponse.json({ analysis: "Multimodal service offline.", entities: [], confidence: 0 });
  }

  // --- Multilingual Corpus ---
  if (path === "multilingual-corpus/dashboard") {
    return NextResponse.json({ total_works: 0, total_languages: 0, status: "offline" });
  }
  if (path === "multilingual-corpus/works") return NextResponse.json([]);
  if (path === "multilingual-corpus/relationships") return NextResponse.json([]);
  if (path.startsWith("multilingual-corpus/")) return NextResponse.json([]);

  // --- OCR ---
  if (path === "ocr/baseline") {
    return NextResponse.json({ total_pages: 0, reviewed: 0, pending: 0, status: "offline" });
  }
  if (path === "ocr/review") {
    return NextResponse.json({ message: "OCR review saved (offline mode — not persisted)" });
  }

  // --- Admin ---
  if (path === "admin/schema/status") {
    return NextResponse.json({ applied_migrations: [], count: 0, status: "offline" });
  }
  if (path === "admin/schema/init") {
    return NextResponse.json({ message: "Schema init skipped (offline mode)", success: false });
  }

  // --- Hardware / Kiosk ---
  if (path.startsWith("hardware/")) {
    return NextResponse.json({ profile: "cloud", peripherals: {}, status: "offline" });
  }
  if (path === "kiosk/manifest") {
    return NextResponse.json({ version: "offline", documents: [] });
  }
  if (path === "kiosk/offline-package") {
    return NextResponse.json({ status: "offline" });
  }

  // --- Default fallback ---
  return NextResponse.json(
    {
      error: "Backend unavailable",
      message: "Standalone cloud deployment — backend microservice is offline.",
      path,
      hint: "This archive runs in archival-only mode when the backend is not connected.",
    },
    { status: 503 }
  );
}

// ---------------------------------------------------------------------------
// Main proxy handler
// ---------------------------------------------------------------------------
async function proxyToBackend(
  req: NextRequest,
  context: { params: Promise<{ slug: string[] }> }
) {
  const { slug } = await context.params;
  const path = slug.join("/");
  const search = req.nextUrl.search;

  // Serve offline fallbacks immediately when backend is not reachable on Vercel
  if (BACKEND_OFFLINE) {
    return offlineFallback(path + search, req);
  }

  const targetUrl = `${BACKEND_BASE}/api/v1/${path}${search}`;

  const headers = new Headers();
  req.headers.forEach((val, key) => {
    const k = key.toLowerCase();
    if (k !== "host" && k !== "connection") {
      headers.set(key, val);
    }
  });

  const isLongRunning =
    path.includes("search") ||
    path.includes("assistant") ||
    path.includes("corpus") ||
    path.includes("ocr") ||
    path.includes("rag");
  const timeoutMs = isLongRunning ? 35000 : 15000;

  try {
    const isBodyAllowed = req.method !== "GET" && req.method !== "HEAD";
    const body = isBodyAllowed ? await req.blob() : undefined;

    const res = await fetch(targetUrl, {
      method: req.method,
      headers,
      body,
      // @ts-ignore
      duplex: "half",
      signal: AbortSignal.timeout(timeoutMs),
    });

    const responseHeaders = new Headers();
    res.headers.forEach((val, key) => {
      const k = key.toLowerCase();
      if (k !== "content-encoding" && k !== "content-length") {
        responseHeaders.set(key, val);
      }
    });

    const data = await res.arrayBuffer();
    return new NextResponse(data, {
      status: res.status,
      headers: responseHeaders,
    });
  } catch (err: any) {
    console.error(`[API Proxy] Failed to proxy to ${targetUrl}:`, err);
    // If backend is unreachable at runtime (despite having a non-loopback URL),
    // serve the offline fallback instead of crashing with 502.
    return offlineFallback(path + search, req);
  }
}

export const GET = proxyToBackend;
export const POST = proxyToBackend;
export const PUT = proxyToBackend;
export const DELETE = proxyToBackend;
export const PATCH = proxyToBackend;
export const OPTIONS = proxyToBackend;
