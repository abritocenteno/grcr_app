import { NextRequest, NextResponse } from "next/server";

const OFF_SEARCH = "https://search.openfoodfacts.org/search";
const FIELDS = "product_name,image_front_small_url";
const UA = "GroceryApp/1.0 (github.com/abritocenteno/grcr_app)";
const CACHE = { "Cache-Control": "public, max-age=86400" };

interface OFFHit {
  product_name?: string;
  image_front_small_url?: string;
}

interface OFFSearchResult {
  count?: number;
  hits?: OFFHit[];
}

async function searchOFF(query: string, pageSize = 10): Promise<string | null> {
  const url = new URL(OFF_SEARCH);
  url.searchParams.set("q", query);
  url.searchParams.set("fields", FIELDS);
  url.searchParams.set("page_size", String(pageSize));

  const res = await fetch(url.toString(), {
    headers: { "User-Agent": UA },
    next: { revalidate: 86400 },
  });
  if (!res.ok) return null;

  const data: OFFSearchResult = await res.json();
  const match = data.hits?.find((p) => p.image_front_small_url?.trim());
  return match?.image_front_small_url ?? null;
}

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim();

  if (!q) {
    return NextResponse.json({ imgUrl: null });
  }

  try {
    // Primary: search with the exact term
    let imgUrl = await searchOFF(q);

    // If no result and the query is a single word, also try English equivalent
    // (e.g. "melk" → "milk") by just widening the search with more results
    if (!imgUrl && !q.includes(" ")) {
      imgUrl = await searchOFF(q, 30);
    }

    return NextResponse.json({ imgUrl: imgUrl ?? null }, { headers: CACHE });
  } catch (err) {
    console.error("[image-lookup] error:", err);
    return NextResponse.json({ imgUrl: null }, { headers: CACHE });
  }
}
