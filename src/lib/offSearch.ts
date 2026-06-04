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
}

// Build the Lucene query: only meaningful tokens, optional store filter.
export function buildQuery(q: string, storeName?: string): string {
  const terms = significantTokens(q).join(" ") || q;
  return storeName ? `${terms} AND stores:"${storeName}"` : terms;
}

export async function fetchOFFHits(q: string, storeName?: string, pageSize = 20): Promise<OFFHit[]> {
  const url = new URL(OFF_SEARCH);
  url.searchParams.set("q", buildQuery(q, storeName));
  url.searchParams.set("fields", "product_name,image_front_small_url");
  url.searchParams.set("page_size", String(pageSize));

  const res = await fetch(url.toString(), {
    headers: { "User-Agent": OFF_UA },
    next: { revalidate: 86400 },
  });
  if (!res.ok) return [];

  const data: { hits?: OFFHit[] } = await res.json();
  return data.hits ?? [];
}
