// Albert Heijn product search via their (reverse-engineered) mobile API.
// No account needed — an anonymous token plus the X-Application header.
// This is AH's private API: it's against their ToS and can change without
// notice (the X-Application requirement appeared after public gists were
// written). Callers MUST treat failures as non-fatal and fall back to OFF.

import { tokenize } from "./offSearch";

const AUTH_URL = "https://api.ah.nl/mobile-auth/v1/auth/token/anonymous";
const SEARCH_URL = "https://api.ah.nl/mobile-services/product/search/v2";

const BASE_HEADERS = {
  "User-Agent": "Appie/8.22.3",
  "Content-Type": "application/json",
  "X-Application": "AHWEBSHOP",
};

interface AHImage {
  width?: number;
  height?: number;
  url: string;
}

interface AHProduct {
  webshopId?: number;
  title?: string;
  brand?: string;
  images?: AHImage[];
  currentPrice?: number;
  priceBeforeBonus?: number;
  salesUnitSize?: string;
}

export interface AHResult {
  name: string;
  imgUrl: string | null;
  price: number | null;
  unit: string | null; // e.g. "6 x 0,33 l" — distinguishes can vs bottle
}

// In-memory token cache (per server instance). Token lives ~2h.
let tokenCache: { token: string; expiresAt: number } | null = null;

async function getToken(): Promise<string> {
  const now = Date.now();
  if (tokenCache && tokenCache.expiresAt > now + 60_000) return tokenCache.token;

  const res = await fetch(AUTH_URL, {
    method: "POST",
    headers: { "User-Agent": BASE_HEADERS["User-Agent"], "Content-Type": "application/json" },
    body: JSON.stringify({ clientId: "appie" }),
  });
  if (!res.ok) throw new Error(`AH auth failed: ${res.status}`);

  const data = (await res.json()) as { access_token: string; expires_in?: number };
  if (!data.access_token) throw new Error("AH auth: no access_token");

  tokenCache = {
    token: data.access_token,
    expiresAt: now + (data.expires_in ?? 7199) * 1000,
  };
  return tokenCache.token;
}

// Prefer a small-medium image (≥200px) for thumbnails; else the largest.
function pickImage(images?: AHImage[]): string | null {
  const usable = (images ?? []).filter((i) => i.url);
  if (usable.length === 0) return null;
  const sorted = [...usable].sort((a, b) => (a.width ?? 0) - (b.width ?? 0));
  const medium = sorted.find((i) => (i.width ?? 0) >= 200);
  return (medium ?? sorted[sorted.length - 1]).url;
}

export async function searchAH(query: string, size = 12): Promise<AHResult[]> {
  const token = await getToken();

  const url = new URL(SEARCH_URL);
  url.searchParams.set("query", query);
  url.searchParams.set("sortOn", "RELEVANCE");
  url.searchParams.set("size", String(size));

  const res = await fetch(url.toString(), {
    headers: { ...BASE_HEADERS, Authorization: `Bearer ${token}` },
    next: { revalidate: 3600 },
  });
  if (!res.ok) {
    tokenCache = null; // token may be stale — force refresh next call
    throw new Error(`AH search failed: ${res.status}`);
  }

  const data = (await res.json()) as { products?: AHProduct[] };
  return (data.products ?? [])
    .filter((p) => p.title)
    .map((p) => ({
      name: p.title!.trim(),
      imgUrl: pickImage(p.images),
      price: p.currentPrice ?? p.priceBeforeBonus ?? null,
      unit: p.salesUnitSize ?? null,
    }));
}

// --- Client-side re-ranking -------------------------------------------------
// AH's RELEVANCE sort weights pack-size heavily and ignores packaging words
// like "blik" (can) / "fles" (bottle) — the can/bottle distinction lives in
// the volume (0,33 l = can, 1 l / 1,5 l = bottle), not the title. We re-rank
// so the product the user actually described floats to the top.

const CAN_WORDS = ["blik", "blikje", "blikjes", "can", "cans"];
const BOTTLE_WORDS = ["fles", "flesje", "flesjes", "bottle", "pet"];
const PACK_NOISE = new Set([
  "pack", "sixpack", "stuks", "stuk", "tray", "x",
  ...CAN_WORDS, ...BOTTLE_WORDS,
]);

// First volume mention in liters, e.g. "6 x 0,33 l" -> 0.33, "330 ml" -> 0.33
function parseVolumeLiters(text: string): number | null {
  const m = text.toLowerCase().match(/(\d+(?:[.,]\d+)?)\s*(ml|cl|l)\b/);
  if (!m) return null;
  let v = parseFloat(m[1].replace(",", "."));
  if (m[2] === "ml") v /= 1000;
  else if (m[2] === "cl") v /= 100;
  return v;
}

export function rankAH(query: string, results: AHResult[]): AHResult[] {
  const qWords = tokenize(query);
  const wantCan = qWords.some((w) => CAN_WORDS.includes(w));
  const wantBottle = qWords.some((w) => BOTTLE_WORDS.includes(w));
  // Product/brand words to match against titles (drop pack words & bare numbers)
  const contentWords = qWords.filter(
    (w) => w.length >= 2 && !PACK_NOISE.has(w) && !/^\d+$/.test(w)
  );

  const scored = results.map((r, idx) => {
    const titleLower = r.name.toLowerCase();
    const titleTokens = new Set(tokenize(r.name));
    let matched = 0;
    for (const w of contentWords) {
      if (titleTokens.has(w) || (w.length >= 4 && titleLower.includes(w))) matched++;
    }
    let score = contentWords.length ? matched / contentWords.length : 0;

    const haystack = `${titleLower} ${(r.unit ?? "").toLowerCase()}`;
    const vol = parseVolumeLiters(haystack);
    if (wantCan) {
      if (/blik/.test(haystack)) score += 0.5;
      else if (vol !== null && vol <= 0.5) score += 0.4;
      else if (vol !== null && vol > 0.5) score -= 0.4;
      else if (/fles|pet/.test(haystack)) score -= 0.5;
    } else if (wantBottle) {
      if (/fles|pet/.test(haystack)) score += 0.5;
      else if (vol !== null && vol > 0.5) score += 0.4;
      else if (vol !== null && vol <= 0.5) score -= 0.4;
      else if (/blik/.test(haystack)) score -= 0.5;
    }

    return { r, score, idx };
  });

  // Sort by score desc; stable on AH's original order for ties.
  scored.sort((a, b) => b.score - a.score || a.idx - b.idx);
  return scored.map((s) => s.r);
}

// Which store keys should be served by the AH backend.
export function isAHStore(store: string): boolean {
  const k = store.trim().toLowerCase();
  return k === "ah" || k === "albert heijn";
}
