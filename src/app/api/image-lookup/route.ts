import { NextRequest, NextResponse } from "next/server";

const OFF_SEARCH = "https://search.openfoodfacts.org/search";
const UA = "GroceryApp/1.0 (github.com/abritocenteno/grcr_app)";
const CACHE = { "Cache-Control": "public, max-age=86400" };

const STORE_NAME: Record<string, string> = {
  ah: "Albert Heijn",
  lidl: "Lidl",
};

async function queryOFF(q: string, pageSize = 8): Promise<string | null> {
  const url = new URL(OFF_SEARCH);
  url.searchParams.set("q", q);
  url.searchParams.set("fields", "product_name,image_front_small_url");
  url.searchParams.set("page_size", String(pageSize));

  const res = await fetch(url.toString(), {
    headers: { "User-Agent": UA },
    next: { revalidate: 86400 },
  });
  if (!res.ok) return null;

  const data: { hits?: Array<{ image_front_small_url?: string }> } = await res.json();
  return data.hits?.find((p) => p.image_front_small_url?.trim())?.image_front_small_url ?? null;
}

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim();
  const store = request.nextUrl.searchParams.get("store") ?? "";

  if (!q) return NextResponse.json({ imgUrl: null });

  try {
    const storeName = STORE_NAME[store];

    // 1. Try store-specific Lucene query first
    if (storeName) {
      const storeQuery = `${q} AND stores:"${storeName}"`;
      const imgUrl = await queryOFF(storeQuery, 10);
      if (imgUrl) return NextResponse.json({ imgUrl }, { headers: CACHE });
    }

    // 2. Generic fallback (no store filter)
    const imgUrl = await queryOFF(q, 10);
    return NextResponse.json({ imgUrl: imgUrl ?? null }, { headers: CACHE });
  } catch (err) {
    console.error("[image-lookup]", err);
    return NextResponse.json({ imgUrl: null }, { headers: CACHE });
  }
}
