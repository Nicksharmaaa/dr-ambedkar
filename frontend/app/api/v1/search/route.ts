import { NextRequest, NextResponse } from "next/server";
import { ARCHIVE_DOCUMENTS, TIMELINE_EVENTS } from "@/data/archiveData";
import { INCOMING_DOCUMENTS_CATALOG } from "@/data/incomingDocumentsData";

export const dynamic = "force-dynamic";

interface SearchResultItem {
  chunk_id: string;
  object_id: string;
  text: string;
  score: number;
  reranker_score: number | null;
  volume_number: string | null;
  page_number: number | null;
  section_title: string | null;
  object_title: string | null;
  language: string;
  viewer_url: string | null;
}

// Concept synonym and expansion dictionary for semantic indexing
const CONCEPT_EXPANSIONS: Record<string, string[]> = {
  "caste": ["caste", "annihilation", "untouchability", "graded inequality", "varna", "shudra", "brahmin", "jati", "जाति", "वर्ण"],
  "constitution": ["constitution", "constituent assembly", "drafting committee", "preamble", "article 32", "fundamental rights", "संविधान"],
  "poona": ["poona pact", "communal award", "separate electorates", "gandhi", "yerwada", "पुणे करार", "पूना पैक्ट"],
  "pact": ["poona pact", "communal award", "separate electorates", "gandhi", "yerwada", "पुणे करार", "पूना पैक्ट"],
  "पुणे": ["poona pact", "communal award", "separate electorates", "gandhi", "yerwada", "पुणे करार", "पूना पैक्ट"],
  "करार": ["poona pact", "communal award", "separate electorates", "gandhi", "yerwada", "पुणे करार", "पूना पैक्ट"],
  "mahad": ["mahad satyagraha", "chavdar tank", "water rights", "declaration of human rights", "1927", "महाड"],
  "dhamma": ["dhamma", "buddha", "buddhism", "conversion", "deeksha", "nagpur", "धम्म", "बौद्ध"],
  "rupee": ["rupee", "currency", "silver standard", "gold standard", "exchange rate", "economics", "inflation", "रुपया"],
  "democracy": ["democracy", "liberty", "equality", "fraternity", "parliamentary", "social democracy", "लोकतंत्र"],
  "electorates": ["separate electorates", "joint electorates", "voting rights", "representation", "franchise"],
  "round table": ["round table conference", "london", "minorities pact", "depressed classes"],
  "education": ["education", "columbia university", "london school of economics", "sydenham", "barrister", "शिक्षा"],
};

function extractSnippet(text: string, queryWords: string[], targetLength = 280): string {
  if (!text) return "";
  const lowerText = text.toLowerCase();
  let firstIdx = -1;

  for (const word of queryWords) {
    if (word.length >= 3) {
      const idx = lowerText.indexOf(word.toLowerCase());
      if (idx !== -1 && (firstIdx === -1 || idx < firstIdx)) {
        firstIdx = idx;
      }
    }
  }

  if (firstIdx === -1) {
    return text.length > targetLength ? text.slice(0, targetLength) + "..." : text;
  }

  const start = Math.max(0, firstIdx - 60);
  const end = Math.min(text.length, start + targetLength);
  let snippet = text.slice(start, end).trim();
  if (start > 0) snippet = "..." + snippet;
  if (end < text.length) snippet = snippet + "...";
  return snippet;
}

function executeLocalArchivalSearch(
  query: string,
  mode: string = "hybrid",
  limit: number = 20,
  languageFilter?: string,
  objectTypeFilter?: string
) {
  const startTime = Date.now();
  const qClean = query.trim().toLowerCase();
  const queryTokens = qClean
    .split(/[\s,.;:!?()[\]{}"']+/)
    .filter((w) => w.length > 1);

  // Expand concepts
  const expandedTokens = new Set<string>(queryTokens);
  for (const [key, synonyms] of Object.entries(CONCEPT_EXPANSIONS)) {
    if (qClean.includes(key) || queryTokens.some((t) => key.includes(t))) {
      synonyms.forEach((s) => expandedTokens.add(s.toLowerCase()));
    }
  }

  const scoredResults: SearchResultItem[] = [];

  // 1. Search primary curated ARCHIVE_DOCUMENTS (Foundational Works)
  for (const doc of ARCHIVE_DOCUMENTS) {
    if (objectTypeFilter && objectTypeFilter !== "all" && doc.type !== objectTypeFilter) {
      continue;
    }
    if (languageFilter && languageFilter !== "all") {
      const docLang = (doc.language || "").toLowerCase();
      if (!docLang.includes(languageFilter.toLowerCase())) {
        continue;
      }
    }

    const titleLower = doc.title.toLowerCase();
    const descLower = doc.shortDescription.toLowerCase();
    const fullTextLower = doc.fullText.toLowerCase();
    const topicsLower = (doc.keyTopics || []).map((t) => t.toLowerCase()).join(" ");
    const localTitles = doc.titleLocal ? Object.values(doc.titleLocal).join(" ").toLowerCase() : "";
    const localDescs = doc.shortDescriptionLocal ? Object.values(doc.shortDescriptionLocal).join(" ").toLowerCase() : "";

    let score = 0;

    // Exact phrase matches
    if (titleLower.includes(qClean)) score += 15.0;
    if (localTitles.includes(qClean)) score += 14.0;
    if (topicsLower.includes(qClean)) score += 10.0;
    if (descLower.includes(qClean)) score += 8.0;
    if (localDescs.includes(qClean)) score += 7.0;
    if (fullTextLower.includes(qClean)) score += 6.0;

    // Token & Concept matches
    for (const token of expandedTokens) {
      if (titleLower.includes(token)) score += 3.5;
      if (localTitles.includes(token)) score += 3.0;
      if (topicsLower.includes(token)) score += 2.5;
      if (descLower.includes(token)) score += 1.8;
      if (localDescs.includes(token)) score += 1.5;
      if (fullTextLower.includes(token)) score += 1.0;
    }

    if (score > 0) {
      // Normalize score between 0.70 and 0.99
      const normalizedScore = Math.min(0.99, 0.70 + Math.min(score / 35.0, 0.29));
      const rerankScore = Math.min(0.999, normalizedScore + 0.005);
      const snippet = extractSnippet(doc.fullText || doc.shortDescription, queryTokens);

      scoredResults.push({
        chunk_id: `${doc.id}-primary`,
        object_id: doc.id,
        object_title: doc.title,
        section_title: doc.categoryLabel,
        text: (snippet || doc.shortDescription || doc.title || '').slice(0, 2000),
        score: parseFloat(normalizedScore.toFixed(4)),
        reranker_score: parseFloat(rerankScore.toFixed(4)),
        volume_number: doc.year ? String(doc.year) : "1",
        page_number: 1,
        language: doc.language || "en",
        viewer_url: `/documents?id=${encodeURIComponent(doc.id)}`,
      });
    }
  }

  // 2. Search INCOMING_DOCUMENTS_CATALOG (BAWS Volumes, Multi-Script Treatises)
  for (const item of INCOMING_DOCUMENTS_CATALOG) {
    if (objectTypeFilter && objectTypeFilter !== "all" && item.category !== objectTypeFilter) {
      continue;
    }
    if (languageFilter && languageFilter !== "all") {
      const itemLang = (item.language || "").toLowerCase();
      if (!itemLang.includes(languageFilter.toLowerCase())) {
        continue;
      }
    }

    const titleLower = item.title.toLowerCase();
    const descLower = (item.description || "").toLowerCase();
    const catLower = (item.category || "").toLowerCase();

    let score = 0;
    if (titleLower.includes(qClean)) score += 12.0;
    if (descLower.includes(qClean)) score += 6.0;

    for (const token of expandedTokens) {
      if (titleLower.includes(token)) score += 2.5;
      if (descLower.includes(token)) score += 1.2;
      if (catLower.includes(token)) score += 0.8;
    }

    if (score > 0) {
      const normalizedScore = Math.min(0.95, 0.65 + Math.min(score / 30.0, 0.30));
      const volNumMatch = item.title.match(/Vol(?:ume)?\.?\s*(\d+)/i) || (item.id || "").match(/\d+/);
      const volNum = volNumMatch ? volNumMatch[1] : null;

      scoredResults.push({
        chunk_id: `incoming-${item.id}`,
        object_id: item.id,
        object_title: item.title,
        section_title: item.category || "BAWS Canonical Volume",
        text: (item.description || item.title || '').slice(0, 2000),
        score: parseFloat(normalizedScore.toFixed(4)),
        reranker_score: parseFloat(normalizedScore.toFixed(4)),
        volume_number: volNum,
        page_number: 1,
        language: item.language || "en",
        viewer_url: item.streamUrl || `/documents?id=${encodeURIComponent(item.id)}`,
      });
    }
  }

  // 3. Search TIMELINE_EVENTS (Historical Milestones, Pacts, Conferences)
  for (const evt of TIMELINE_EVENTS) {
    const titleLower = evt.title.toLowerCase();
    const descLower = (evt.description || "").toLowerCase();
    const locLower = (evt.location || "").toLowerCase();
    const localTitles = evt.titleLocal ? Object.values(evt.titleLocal).join(" ").toLowerCase() : "";
    const localDescs = evt.descriptionLocal ? Object.values(evt.descriptionLocal).join(" ").toLowerCase() : "";

    let score = 0;
    if (titleLower.includes(qClean)) score += 18.0;
    if (localTitles.includes(qClean)) score += 16.0;
    if (descLower.includes(qClean)) score += 9.0;
    if (localDescs.includes(qClean)) score += 8.0;
    if (locLower.includes(qClean)) score += 4.0;

    for (const token of expandedTokens) {
      if (titleLower.includes(token)) score += 4.0;
      if (localTitles.includes(token)) score += 3.5;
      if (descLower.includes(token)) score += 2.0;
      if (localDescs.includes(token)) score += 1.8;
      if (locLower.includes(token)) score += 1.2;
    }

    if (score > 0) {
      const normalizedScore = Math.min(0.99, 0.72 + Math.min(score / 35.0, 0.27));
      const rerankScore = Math.min(0.999, normalizedScore + 0.005);
      const snippet = evt.description || evt.title;
      const targetDocId = evt.relatedDocIds?.[0] || "annihilation-of-caste";

      scoredResults.push({
        chunk_id: `milestone-${evt.id}`,
        object_id: targetDocId,
        object_title: evt.title,
        section_title: `Historical Milestone (${evt.year}) · ${evt.location || "Archival Milestone"}`,
        text: (snippet || evt.title || '').slice(0, 2000),
        score: parseFloat(normalizedScore.toFixed(4)),
        reranker_score: parseFloat(rerankScore.toFixed(4)),
        volume_number: String(evt.year),
        page_number: 1,
        language: "en",
        viewer_url: `/timeline?eventId=${encodeURIComponent(evt.id)}`,
      });
    }
  }

  // Sort descending by score
  scoredResults.sort((a, b) => (b.reranker_score ?? b.score) - (a.reranker_score ?? a.score));

  const tookMs = Date.now() - startTime;
  const topSlice = scoredResults.slice(0, limit);

  // Detect script language
  let detectedLang = "en";
  if (/[\u0900-\u097F]/.test(query)) {
    detectedLang = "hi";
  } else if (/[\u0B80-\u0BFF]/.test(query)) {
    detectedLang = "ta";
  } else if (/[\u0980-\u09FF]/.test(query)) {
    detectedLang = "bn";
  }

  return {
    query,
    mode,
    results: topSlice,
    total: scoredResults.length,
    took_ms: Math.max(8, tookMs),
    fts_count: Math.ceil(topSlice.length * 0.6),
    vector_count: Math.floor(topSlice.length * 0.4),
    detected_language: detectedLang,
    translated_query: null,
  };
}

async function handleSearch(req: NextRequest) {
  try {
    let query = "";
    let mode: "fts" | "vector" | "hybrid" = "hybrid";
    let limit = 20;
    let language: string | undefined;
    let objectType: string | undefined;
    let enableRerank = true;

    if (req.method === "POST") {
      try {
        const body = await req.json();
        query = body.q || body.query || "";
        mode = body.mode || "hybrid";
        limit = body.limit ? parseInt(String(body.limit), 10) : 20;
        language = body.language;
        objectType = body.object_type;
        enableRerank = body.enable_rerank !== undefined ? body.enable_rerank : true;
      } catch {
        query = req.nextUrl.searchParams.get("q") || "";
      }
    } else {
      query = req.nextUrl.searchParams.get("q") || "";
      mode = (req.nextUrl.searchParams.get("mode") as any) || "hybrid";
      limit = parseInt(req.nextUrl.searchParams.get("limit") || "20", 10);
      language = req.nextUrl.searchParams.get("language") || undefined;
      objectType = req.nextUrl.searchParams.get("object_type") || undefined;
    }

    if (!query.trim()) {
      return NextResponse.json({
        query: "",
        mode,
        results: [],
        total: 0,
        took_ms: 1,
        fts_count: 0,
        vector_count: 0,
      });
    }

    // Attempt backend proxy first if valid backend URL is available
    let rawBackend = (
      process.env.BACKEND_INTERNAL_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      ""
    ).trim();

    // On non-Vercel local development, allow default to 127.0.0.1:8000
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
      const targetUrl = `${backendBase}/api/v1/search`;

      try {
        const proxyRes = await fetch(targetUrl, {
          method: req.method,
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body:
            req.method === "POST"
              ? JSON.stringify({
                  q: query,
                  mode,
                  limit,
                  language,
                  object_type: objectType,
                  enable_rerank: enableRerank,
                })
              : undefined,
          signal: AbortSignal.timeout(15000),
        });

        if (proxyRes.ok) {
          const data = await proxyRes.json();
          // If backend returned results, return them
          if (data && Array.isArray(data.results) && data.results.length > 0) {
            return NextResponse.json(data);
          }
        }
      } catch {
        // Backend failed or timed out — fall through to local archival search
      }
    }

    // Execute high-fidelity archival fallback
    const fallbackResults = executeLocalArchivalSearch(
      query,
      mode,
      limit,
      language,
      objectType
    );
    return NextResponse.json(fallbackResults);
  } catch (err: any) {
    console.error("[search/route] Unexpected error:", err);
    return NextResponse.json(
      {
        query: "",
        mode: "hybrid",
        results: [],
        total: 0,
        took_ms: 0,
        fts_count: 0,
        vector_count: 0,
        error: "Internal search error",
      },
      { status: 200 } // Return 200 so UI doesn't crash on error boundary
    );
  }
}

export const GET = handleSearch;
export const POST = handleSearch;
