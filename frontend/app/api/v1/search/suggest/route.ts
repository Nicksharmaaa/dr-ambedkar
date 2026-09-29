import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const CANONICAL_SUGGESTIONS = [
  "annihilation of caste",
  "poona pact",
  "constituent assembly debates",
  "mahad satyagraha",
  "problem of the rupee",
  "article 32 heart and soul",
  "castes in india",
  "who were the shudras",
  "the untouchables",
  "buddha and his dhamma",
  "states and minorities",
  "round table conference",
  "social democracy",
  "graded inequality",
  "hindu code bill",
  "columbia university",
  "waiting for a visa",
  "revolution and counter-revolution in ancient india",
  "ranade gandhi and jinnah",
  "federation versus freedom",
  "thoughts on linguistic states",
  "buddha or karl marx",
  "separate electorates",
  "chavdar tank",
  "grammar of anarchy",
  "liberty equality fraternity"
];

export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get("q") || "").trim().toLowerCase();
  const limit = parseInt(req.nextUrl.searchParams.get("limit") || "8", 10);

  if (!q) {
    return NextResponse.json(
      CANONICAL_SUGGESTIONS.slice(0, limit).map((s) => ({ term: s }))
    );
  }

  // Try backend proxy if available
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
      const res = await fetch(`${backendBase}/api/v1/search/suggest?q=${encodeURIComponent(q)}&limit=${limit}`, {
        signal: AbortSignal.timeout(4000),
      });
      if (res.ok) {
        return NextResponse.json(await res.json());
      }
    } catch {
      // Fallback
    }
  }

  const matches = CANONICAL_SUGGESTIONS.filter((s) => s.includes(q)).slice(0, limit);
  return NextResponse.json(matches.map((term) => ({ term })));
}
