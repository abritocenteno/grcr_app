import { NextRequest, NextResponse } from "next/server";
import { STORE_NAME, OFFHit, fetchOFFHits, relevance } from "@/lib/offSearch";
import { isAHStore, searchAH, rankAH } from "@/lib/ahApi";
import { isLidlStore, searchLidl, rankLidl } from "@/lib/lidlApi";

const CACHE = { "Cache-Control": "public, max-age=3600" };

export interface Suggestion {
  name: string;
  imgUrl: string | null;
  price: number | null;
  unit: string | null;
}

// Dedupe store results by name (already re-ranked upstream).
function dedupeStore(
  results: { name: string; imgUrl: string | null; price: number | null; unit: string | null }[],
  limit: number
): Suggestion[] {
  const seen = new Set<string>();
  const out: Suggestion[] = [];
  for (const r of results) {
    const key = r.name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ name: r.name, imgUrl: r.imgUrl, price: r.price, unit: r.unit });
    if (out.length >= limit) break;
  }
  return out;
}

function rankAndDedupe(query: string, hits: OFFHit[], limit: number): Suggestion[] {
  const seen = new Set<string>();
  const scored: Array<{ s: Suggestion; score: number }> = [];

  for (const h of hits) {
    const name = h.product_name?.trim();
    if (!name) continue;
    const key = name.toLowerCase();
    if (seen.has(key)) continue;

    const score = relevance(query, name);
    if (score <= 0) continue; // head term absent → irrelevant, skip

    seen.add(key);
    scored.push({ s: { name, imgUrl: h.image_front_small_url ?? null, price: null, unit: null }, score });
  }

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.s);
}

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim();
  const store = request.nextUrl.searchParams.get("store") ?? "";
  const limit = Math.min(Math.max(parseInt(request.nextUrl.searchParams.get("limit") ?? "6", 10) || 6, 1), 30);

  if (!q || q.length < 2) {
    return NextResponse.json({ suggestions: [] });
  }

  try {
    // Albert Heijn → real AH inventory. Any failure falls through to OFF.
    if (isAHStore(store)) {
      try {
        const ah = rankAH(q, await searchAH(q, Math.max(limit, 12)));
        const suggestions = dedupeStore(ah, limit);
        if (suggestions.length > 0) {
          return NextResponse.json({ suggestions }, { headers: CACHE });
        }
      } catch (e) {
        console.warn("[suggestions] AH failed, falling back to OFF:", e);
      }
    }

    // Lidl → real Lidl NL inventory. Any failure falls through to OFF.
    if (isLidlStore(store)) {
      try {
        const lidl = rankLidl(q, await searchLidl(q, Math.max(limit * 2, 24)));
        const suggestions = dedupeStore(lidl, limit);
        if (suggestions.length > 0) {
          return NextResponse.json({ suggestions }, { headers: CACHE });
        }
      } catch (e) {
        console.warn("[suggestions] Lidl failed, falling back to OFF:", e);
      }
    }

    // All other stores (and AH fallback) → Open Food Facts
    const storeName = STORE_NAME[store];
    const pageSize = Math.max(limit * 2, 20);
    const [storeHits, genericHits] = await Promise.all([
      storeName ? fetchOFFHits(q, storeName, pageSize) : Promise.resolve([]),
      fetchOFFHits(q, undefined, pageSize),
    ]);

    const suggestions = rankAndDedupe(q, [...storeHits, ...genericHits], limit);

    return NextResponse.json({ suggestions }, { headers: CACHE });
  } catch (err) {
    console.error("[suggestions]", err);
    return NextResponse.json({ suggestions: [] });
  }
}
