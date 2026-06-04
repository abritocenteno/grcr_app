import { NextRequest, NextResponse } from "next/server";
import { STORE_NAME, OFFHit, fetchOFFHits, relevance, sharesToken } from "@/lib/offSearch";
import { isAHStore, searchAH, rankAH } from "@/lib/ahApi";
import { isLidlStore, searchLidl, rankLidl } from "@/lib/lidlApi";

const CACHE = { "Cache-Control": "public, max-age=86400" };

// Pick the best-scoring hit that actually has an image.
function bestImage(query: string, hits: OFFHit[]): string | null {
  let best: { url: string; score: number } | null = null;
  for (const h of hits) {
    const url = h.image_front_small_url?.trim();
    const name = h.product_name?.trim();
    if (!url || !name) continue;
    const score = relevance(query, name);
    if (score <= 0) continue; // irrelevant — don't attach a wrong image
    if (!best || score > best.score) best = { url, score };
  }
  return best?.url ?? null;
}

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim();
  const store = request.nextUrl.searchParams.get("store") ?? "";

  if (!q) return NextResponse.json({ imgUrl: null });

  try {
    // Albert Heijn → real AH product photo. Any failure falls through to OFF.
    if (isAHStore(store)) {
      try {
        const ah = rankAH(q, await searchAH(q, 15));
        // Only attach an image whose product actually matches the query —
        // never a wholly-unrelated product's photo.
        const hit = ah.find((r) => r.imgUrl && sharesToken(q, r.name));
        if (hit?.imgUrl) return NextResponse.json({ imgUrl: hit.imgUrl }, { headers: CACHE });
      } catch (e) {
        console.warn("[image-lookup] AH failed, falling back to OFF:", e);
      }
    }

    // Lidl → real Lidl NL product photo. Any failure falls through to OFF.
    if (isLidlStore(store)) {
      try {
        const lidl = rankLidl(q, await searchLidl(q, 24));
        // Only attach an image whose product actually matches the query
        // (kills e.g. a sausage photo for "kastanje champignons").
        const hit = lidl.find((r) => r.imgUrl && sharesToken(q, r.name));
        if (hit?.imgUrl) return NextResponse.json({ imgUrl: hit.imgUrl }, { headers: CACHE });
      } catch (e) {
        console.warn("[image-lookup] Lidl failed, falling back to OFF:", e);
      }
    }

    const storeName = STORE_NAME[store];

    // 1. Store-specific search first
    if (storeName) {
      const hits = await fetchOFFHits(q, storeName);
      const imgUrl = bestImage(q, hits);
      if (imgUrl) return NextResponse.json({ imgUrl }, { headers: CACHE });
    }

    // 2. Generic fallback
    const hits = await fetchOFFHits(q);
    const imgUrl = bestImage(q, hits);
    return NextResponse.json({ imgUrl: imgUrl ?? null }, { headers: CACHE });
  } catch (err) {
    console.error("[image-lookup]", err);
    return NextResponse.json({ imgUrl: null }, { headers: CACHE });
  }
}
