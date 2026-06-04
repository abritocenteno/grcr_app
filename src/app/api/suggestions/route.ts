import { NextRequest, NextResponse } from "next/server";
import { STORE_NAME, OFFHit, fetchOFFHits, relevance } from "@/lib/offSearch";
import { isAHStore, searchAH } from "@/lib/ahApi";

const CACHE = { "Cache-Control": "public, max-age=3600" };

export interface Suggestion {
  name: string;
  imgUrl: string | null;
  price: number | null;
}

// AH's own search is already relevance-ranked — just dedupe by name.
function dedupeAH(results: { name: string; imgUrl: string | null; price: number | null }[]): Suggestion[] {
  const seen = new Set<string>();
  const out: Suggestion[] = [];
  for (const r of results) {
    const key = r.name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ name: r.name, imgUrl: r.imgUrl, price: r.price });
    if (out.length >= 6) break;
  }
  return out;
}

function rankAndDedupe(query: string, hits: OFFHit[]): Suggestion[] {
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
    scored.push({ s: { name, imgUrl: h.image_front_small_url ?? null, price: null }, score });
  }

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)
    .map((x) => x.s);
}

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim();
  const store = request.nextUrl.searchParams.get("store") ?? "";

  if (!q || q.length < 2) {
    return NextResponse.json({ suggestions: [] });
  }

  try {
    // Albert Heijn → real AH inventory. Any failure falls through to OFF.
    if (isAHStore(store)) {
      try {
        const ah = await searchAH(q, 12);
        const suggestions = dedupeAH(ah);
        if (suggestions.length > 0) {
          return NextResponse.json({ suggestions }, { headers: CACHE });
        }
      } catch (e) {
        console.warn("[suggestions] AH failed, falling back to OFF:", e);
      }
    }

    // All other stores (and AH fallback) → Open Food Facts
    const storeName = STORE_NAME[store];
    const [storeHits, genericHits] = await Promise.all([
      storeName ? fetchOFFHits(q, storeName) : Promise.resolve([]),
      fetchOFFHits(q),
    ]);

    const suggestions = rankAndDedupe(q, [...storeHits, ...genericHits]);

    return NextResponse.json({ suggestions }, { headers: CACHE });
  } catch (err) {
    console.error("[suggestions]", err);
    return NextResponse.json({ suggestions: [] });
  }
}
