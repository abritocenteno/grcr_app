import { NextRequest, NextResponse } from "next/server";

const OFF_SEARCH = "https://search.openfoodfacts.org/search";
const UA = "GroceryApp/1.0 (github.com/abritocenteno/grcr_app)";
const CACHE = { "Cache-Control": "public, max-age=3600" };

const STORE_NAME: Record<string, string> = {
  ah: "Albert Heijn",
  lidl: "Lidl",
};

export interface Suggestion {
  name: string;
  imgUrl: string | null;
}

interface OFFHit {
  product_name?: string;
  image_front_small_url?: string;
}

async function fetchSuggestions(q: string, store?: string): Promise<Suggestion[]> {
  const luceneQ = store ? `${q} AND stores:"${store}"` : q;
  const url = new URL(OFF_SEARCH);
  url.searchParams.set("q", luceneQ);
  url.searchParams.set("fields", "product_name,image_front_small_url");
  url.searchParams.set("page_size", "8");

  const res = await fetch(url.toString(), {
    headers: { "User-Agent": UA },
    next: { revalidate: 3600 },
  });
  if (!res.ok) return [];

  const data: { hits?: OFFHit[] } = await res.json();
  const seen = new Set<string>();

  return (data.hits ?? [])
    .filter((p) => {
      const name = p.product_name?.trim();
      if (!name || seen.has(name.toLowerCase())) return false;
      seen.add(name.toLowerCase());
      return true;
    })
    .slice(0, 6)
    .map((p) => ({
      name: p.product_name!.trim(),
      imgUrl: p.image_front_small_url ?? null,
    }));
}

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim();
  const store = request.nextUrl.searchParams.get("store") ?? "";

  if (!q || q.length < 2) {
    return NextResponse.json({ suggestions: [] });
  }

  try {
    const storeName = STORE_NAME[store];
    let suggestions: Suggestion[] = [];

    // Try store-specific first (better results for AH especially)
    if (storeName) {
      suggestions = await fetchSuggestions(q, storeName);
    }

    // If too few store-specific results, add generic results
    if (suggestions.length < 3) {
      const generic = await fetchSuggestions(q);
      const existingNames = new Set(suggestions.map((s) => s.name.toLowerCase()));
      const extras = generic.filter((s) => !existingNames.has(s.name.toLowerCase()));
      suggestions = [...suggestions, ...extras].slice(0, 6);
    }

    return NextResponse.json({ suggestions }, { headers: CACHE });
  } catch (err) {
    console.error("[suggestions]", err);
    return NextResponse.json({ suggestions: [] });
  }
}
