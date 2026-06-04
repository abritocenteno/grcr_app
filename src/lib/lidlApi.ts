// Lidl NL product search via their public "mindshift" search API — the same
// endpoint lidl.nl/q/search uses. No account/token: it just needs the locale
// cookie + the mindshift Accept header. This is Lidl's private API: against
// their ToS and may change without notice. Callers MUST treat failures as
// non-fatal and fall back to OFF.
//
// Caveat: lidl.nl's online assortment mixes groceries with non-food (a "melk"
// search also returns milk frothers / coffee machines), and fresh items may be
// absent. rankLidl pushes title-relevant, food results to the top.

import { relevance } from "./offSearch";

const SEARCH_URL = "https://www.lidl.nl/q/api/search";
const HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
  Accept: "application/mindshift.search+json;version=2",
  Origin: "https://www.lidl.nl",
  Referer: "https://www.lidl.nl/q/search",
  Cookie: "i18n_redirected=nl_NL",
};

interface LidlGridboxData {
  fullTitle?: string;
  title?: string;
  image?: string;
  category?: string;
  price?: { price?: number | null };
  brand?: { name?: string };
}

export interface LidlResult {
  name: string;
  imgUrl: string | null;
  price: number | null;
  unit: string | null;
  category: string;
}

export async function searchLidl(query: string, size = 24): Promise<LidlResult[]> {
  const url = new URL(SEARCH_URL);
  url.searchParams.set("q", query);
  url.searchParams.set("assortment", "NL");
  url.searchParams.set("locale", "nl_NL");
  url.searchParams.set("version", "2.0");
  url.searchParams.set("fetchsize", String(size));

  const res = await fetch(url.toString(), { headers: HEADERS, next: { revalidate: 3600 } });
  if (!res.ok) throw new Error(`Lidl search failed: ${res.status}`);

  const data = (await res.json()) as {
    items?: Array<{ type?: string; gridbox?: { data?: LidlGridboxData } }>;
  };

  return (data.items ?? [])
    .filter((it) => it.type === "product" && it.gridbox?.data)
    .map((it) => {
      const d = it.gridbox!.data!;
      const img = d.image?.trim();
      return {
        name: (d.fullTitle || d.title || "").trim(),
        imgUrl: img && img !== "" ? img : null,
        price: d.price?.price ?? null,
        unit: null,
        category: d.category ?? "",
      };
    })
    .filter((r) => r.name);
}

// Rank by title relevance (head term must appear -> drops appliances for a
// food search), with a small boost for items in a food category.
export function rankLidl(query: string, results: LidlResult[]): LidlResult[] {
  const scored = results
    .map((r, idx) => {
      let score = relevance(query, r.name);
      if (score > 0 && /eten|drinken|voeding|zuivel|brood|vlees|groente|fruit/i.test(r.category)) {
        score += 0.3;
      }
      return { r, score, idx };
    })
    .filter((s) => s.score > 0);

  scored.sort((a, b) => b.score - a.score || a.idx - b.idx);
  return scored.map((s) => s.r);
}

export function isLidlStore(store: string): boolean {
  return store.trim().toLowerCase() === "lidl";
}
