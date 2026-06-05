import { NextRequest, NextResponse } from "next/server";
import { fetchOFFHits, relevance, offImageCandidates, firstLiveImage } from "@/lib/offSearch";
import { isAHStore, searchAH, rankAH } from "@/lib/ahApi";
import { isLidlStore, searchLidl, rankLidl } from "@/lib/lidlApi";

// Popular products for ONE store, for the home-page per-store rows. We take a
// curated list of everyday Dutch staples and look each one up in the store's
// real catalogue (Albert Heijn / Lidl private APIs → real photo + price), so
// every row feels like "what people grab at this store". Other stores fall
// back to Open Food Facts photos (no price). All upstream calls are best-effort
// and degrade gracefully — a failed lookup just yields a priceless/imageless
// card rather than breaking the row.

export interface StorePopularProduct {
  name: string;
  imgUrl: string | null;
  price: number | null;
  unit: string | null;
}

// Display label → search query → match stem. The label is what gets added to a
// list (kept short/clean); the query is tuned to return a sensible top hit per
// store; the match stem is the core noun every real hit MUST contain — it gates
// out the junk these fuzzy store searches mix in (a "melk" search returning
// ravioli, an "eieren" search returning pasta sauce). Stems are substrings so
// they survive compounds/plurals ("eier" ⊂ "scharreleieren").
// Fresh produce mostly surfaces processed look-alikes (sauce/juice/chips) in
// Open Food Facts, all sharing the produce's name; excluding those category
// tags keeps the OFF fallback honest.
const PRODUCE_AVOID_CATS = [
  "spices", "condiments", "seasonings", "sauces", "syrups",
  "juices", "chips", "crisps", "dairies", "snacks",
];

const STAPLES: Array<{ label: string; query: string; match: string; avoidCats?: string[] }> = [
  { label: "Melk", query: "halfvolle melk", match: "melk" },
  { label: "Brood", query: "brood heel", match: "brood" },
  { label: "Eieren", query: "eieren", match: "eier" },
  { label: "Kaas", query: "jong belegen kaas", match: "kaas" },
  { label: "Yoghurt", query: "yoghurt naturel", match: "yoghurt" },
  { label: "Bananen", query: "bananen", match: "banan", avoidCats: PRODUCE_AVOID_CATS },
  { label: "Tomaten", query: "tomaten", match: "tomat", avoidCats: PRODUCE_AVOID_CATS },
  { label: "Kipfilet", query: "kipfilet", match: "kip" },
  { label: "Gehakt", query: "rundergehakt", match: "gehakt" },
  { label: "Pasta", query: "pasta spaghetti", match: "pasta" },
  { label: "Koffie", query: "koffie", match: "koffie" },
  { label: "Boter", query: "roomboter", match: "boter" },
];

// Per-store: query the real API, rank, take the best hit that has an image.
async function lookupStore(
  store: string,
  staple: { label: string; query: string; match: string; avoidCats?: string[] }
): Promise<StorePopularProduct> {
  const base: StorePopularProduct = { name: staple.label, imgUrl: null, price: null, unit: null };

  try {
    // 1. Real store catalogue first — gives a real photo AND price.
    if (isAHStore(store)) {
      const hit = rankAH(staple.query, await searchAH(staple.query, 12))
        .find((r) => r.imgUrl && relevance(staple.match, r.name) > 0);
      if (hit) return { name: staple.label, imgUrl: hit.imgUrl, price: hit.price, unit: hit.unit };
    } else if (isLidlStore(store)) {
      const hit = rankLidl(staple.query, await searchLidl(staple.query, 24))
        .find((r) => r.imgUrl && relevance(staple.match, r.name) > 0);
      if (hit) return { name: staple.label, imgUrl: hit.imgUrl, price: hit.price, unit: hit.unit };
    }

    // 2. No catalogue hit → borrow an Open Food Facts photo (no price). Lidl's
    //    online search omits its core grocery range (fresh milk/eggs/butter),
    //    so without this those staples would have no image at all.
    const hits = await fetchOFFHits(staple.query);
    const img = await firstLiveImage(
      offImageCandidates(hits, { match: staple.match, avoidCats: staple.avoidCats })
    );
    return { ...base, imgUrl: img };
  } catch {
    return base;
  }
}

export async function GET(request: NextRequest) {
  const store = request.nextUrl.searchParams.get("store")?.trim().toLowerCase() ?? "";
  if (!store) return NextResponse.json({ products: [] });

  const products = await Promise.all(STAPLES.map((s) => lookupStore(store, s)));

  return NextResponse.json(
    { products },
    { headers: { "Cache-Control": "public, max-age=21600" } } // 6h — staples are stable
  );
}
