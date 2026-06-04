import { NextRequest, NextResponse } from "next/server";
import { STORE_NAME, OFFHit, fetchOFFHits, relevance } from "@/lib/offSearch";

const CACHE = { "Cache-Control": "public, max-age=3600" };

export interface Suggestion {
  name: string;
  imgUrl: string | null;
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
    scored.push({ s: { name, imgUrl: h.image_front_small_url ?? null }, score });
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
