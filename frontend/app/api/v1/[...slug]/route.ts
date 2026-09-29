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

async function proxyToBackend(
  req: NextRequest,
  context: { params: Promise<{ slug: string[] }> }
) {
  const { slug } = await context.params;
  const path = slug.join("/");
  const search = req.nextUrl.search;
  const targetUrl = `${BACKEND_BASE}/api/v1/${path}${search}`;

  const headers = new Headers();
  req.headers.forEach((val, key) => {
    const k = key.toLowerCase();
    if (k !== "host" && k !== "connection") {
      headers.set(key, val);
    }
  });

  // On Vercel, if backend base points to loopback/localhost, return graceful 503 instead of 502 crash
  const isVercel = Boolean(process.env.VERCEL);
  const isLoopback = BACKEND_BASE.includes("localhost") || BACKEND_BASE.includes("127.0.0.1");
  if (isVercel && isLoopback) {
    return NextResponse.json(
      {
        error: "Backend unavailable",
        message: "Standalone cloud deployment: local microservice is offline.",
        path,
      },
      { status: 503 }
    );
  }

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
    return NextResponse.json(
      { error: "Backend proxy error", detail: err.message },
      { status: 502 }
    );
  }
}

export const GET = proxyToBackend;
export const POST = proxyToBackend;
export const PUT = proxyToBackend;
export const DELETE = proxyToBackend;
export const PATCH = proxyToBackend;
export const OPTIONS = proxyToBackend;
