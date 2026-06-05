// Shared Open Food Facts search helpers — query building + relevance scoring.
// Used by /api/suggestions and /api/image-lookup so product matching stays
// consistent (e.g. "Kip a la minute" never matches wine).

export const OFF_SEARCH = "https://search.openfoodfacts.org/search";
export const OFF_UA = "GroceryApp/1.0 (github.com/abritocenteno/grcr_app)";

export const STORE_NAME: Record<string, string> = {
  ah: "Albert Heijn",
  lidl: "Lidl",
};

// Words that carry no search signal (NL + EN)
const STOPWORDS = new Set([
  "a", "la", "le", "de", "het", "een", "the", "met", "van", "en", "of",
  "and", "in", "op", "voor", "per", "à", "of",
]);

export function tokenize(s: string): string[] {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9À-ſ\s]/g, " ") // keep accented letters
    .split(/\s+/)
    .filter(Boolean);
}

// Meaningful tokens: drop stopwords and 1-char fragments
export function significantTokens(s: string): string[] {
  return tokenize(s).filter((t) => t.length >= 2 && !STOPWORDS.has(t));
}

/**
 * Score how relevant a product name is to the query.
 * Returns 0 when the head term (first meaningful word) is absent — a hard
 * reject, which is what kills "wine" results for a "kip" search.
 */
export function relevance(query: string, name: string): number {
  const qTokens = significantTokens(query);
  if (qTokens.length === 0) return 0;

  const nameLower = name.toLowerCase();
  const nameTokens = tokenize(name);
  const nameTokenSet = new Set(nameTokens);

  const head = qTokens[0];
  if (!nameTokenSet.has(head) && !nameLower.includes(head)) return 0;

  let matched = 0;
  for (const t of qTokens) {
    if (nameTokenSet.has(t) || nameLower.includes(t)) matched++;
  }
  let score = matched / qTokens.length;

  if (nameLower.includes(query.toLowerCase().trim())) score += 0.5;
  if (nameLower.startsWith(head)) score += 0.2;
  if (nameTokens.length <= qTokens.length + 2) score += 0.1;

  return score;
}

export interface OFFHit {
  product_name?: string;
  image_front_small_url?: string;
  categories_tags?: string[];
}

// Build the Lucene query: only meaningful tokens, optional store filter.
export function buildQuery(q: string, storeName?: string): string {
  const terms = significantTokens(q).join(" ") || q;
  return storeName ? `${terms} AND stores:"${storeName}"` : terms;
}

export async function fetchOFFHits(q: string, storeName?: string, pageSize = 20): Promise<OFFHit[]> {
  const url = new URL(OFF_SEARCH);
  url.searchParams.set("q", buildQuery(q, storeName));
  url.searchParams.set("fields", "product_name,image_front_small_url,categories_tags");
  url.searchParams.set("page_size", String(pageSize));

  const res = await fetch(url.toString(), {
    headers: { "User-Agent": OFF_UA },
    next: { revalidate: 86400 },
  });
  if (!res.ok) return [];

  const data: { hits?: OFFHit[] } = await res.json();
  return data.hits ?? [];
}

export interface OFFPickOpts {
  /** core noun stem the product name MUST contain (e.g. "paprika") */
  match: string;
  /** reject if the name contains any of these substrings (e.g. "poeder") */
  avoidWords?: string[];
  /** reject if any OFF category tag contains any of these (e.g. "spices").
   *  Names alone can't separate a paprika vegetable from paprika powder —
   *  both are literally named "Paprika" — so the category tag is the only
   *  reliable discriminator for produce vs. processed variants. */
  avoidCats?: string[];
}

// Does a product name clear the relevance gate (contains the core noun) and
// avoid the banned words? Shared by OFF and store-catalogue (AH/Lidl) pickers.
export function nameOk(name: string, match: string, avoidWords?: string[]): boolean {
  if (relevance(match, name) <= 0) return false;
  if (avoidWords?.length) {
    const lower = name.toLowerCase();
    if (avoidWords.some((w) => lower.includes(w))) return false;
  }
  return true;
}

// Ordered list of candidate image URLs from OFF hits that pass relevance +
// word/category filters. Order is preserved (OFF relevance order).
export function offImageCandidates(hits: OFFHit[], opts: OFFPickOpts): string[] {
  const { match, avoidWords, avoidCats } = opts;
  return hits
    .filter((h) => {
      const url = h.image_front_small_url?.trim();
      if (!url) return false;
      if (!nameOk(h.product_name ?? "", match, avoidWords)) return false;
      if (avoidCats?.length) {
        const cats = h.categories_tags ?? [];
        if (cats.some((c) => avoidCats.some((a) => c.includes(a)))) return false;
      }
      return true;
    })
    .map((h) => h.image_front_small_url!.trim());
}

// OFF's search index frequently returns stale image URLs that 404. Probe
// candidates in order (cheap HEAD requests) and return the first that's live,
// so a dead top hit falls through to the next real photo instead of showing a
// broken image. Returns null if none resolve → caller shows a category icon.
export async function firstLiveImage(urls: string[], cap = 8): Promise<string | null> {
  for (const url of urls.slice(0, cap)) {
    try {
      const res = await fetch(url, { method: "HEAD", next: { revalidate: 604800 } });
      if (res.ok) return url;
    } catch {
      // network error — try the next candidate
    }
  }
  return null;
}
