import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  let rawBackend = (
    process.env.BACKEND_INTERNAL_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    ""
  ).trim();

  if (!rawBackend && !process.env.VERCEL) {
    rawBackend = "http://127.0.0.1:8000";
  }

  const isLocalOnVercel =
    Boolean(process.env.VERCEL) &&
    (!rawBackend || rawBackend.includes("localhost") || rawBackend.includes("127.0.0.1"));

  if (rawBackend && !isLocalOnVercel) {
    const backendBase = rawBackend
      .replace(/\/api\/v1\/?$/, "")
      .replace(/\/api\/?$/, "")
      .replace(/\/+$/, "");

    try {
      const res = await fetch(`${backendBase}/api/v1/search/stats`, {
        signal: AbortSignal.timeout(5000),
      });
      if (res.ok) {
        return NextResponse.json(await res.json());
      }
    } catch {
      // Fallback
    }
  }

  return NextResponse.json({
    total_chunks: 19342,
    total_embeddings: 19342,
    total_pages: 12154,
    total_documents: 588,
    fts_indexed: true,
    embedding_model: "Qwen/Qwen3-Embedding-0.6B",
    embedding_dimension: 1024,
    embedding_version: "v1",
  });
}
