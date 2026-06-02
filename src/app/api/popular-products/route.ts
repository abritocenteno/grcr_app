import { NextResponse } from "next/server";

const OFF_SEARCH = "https://search.openfoodfacts.org/search";
const UA = "GroceryApp/1.0 (github.com/abritocenteno/grcr_app)";

export interface PopularProduct {
  name: string;
  imgUrl: string | null;
  category: string;
}

// Common Dutch grocery staples, ordered by how universal they are
const STAPLES: Array<{ name: string; category: string }> = [
  { name: "Halfvolle melk", category: "Zuivel" },
  { name: "Brood", category: "Bakkerij" },
  { name: "Eieren", category: "Zuivel" },
  { name: "Kaas", category: "Zuivel" },
  { name: "Yoghurt", category: "Zuivel" },
  { name: "Boter", category: "Zuivel" },
  { name: "Appels", category: "Fruit" },
  { name: "Bananen", category: "Fruit" },
  { name: "Tomaten", category: "Groente" },
  { name: "Aardappelen", category: "Groente" },
  { name: "Pasta", category: "Droogwaren" },
  { name: "Rijst", category: "Droogwaren" },
  { name: "Kip filet", category: "Vlees & vis" },
  { name: "Gehakt", category: "Vlees & vis" },
  { name: "Koffie", category: "Dranken" },
  { name: "Sinaasappelsap", category: "Dranken" },
  { name: "Hagelslag", category: "Ontbijt" },
  { name: "Pindakaas", category: "Ontbijt" },
  { name: "Komkommer", category: "Groente" },
  { name: "Paprika", category: "Groente" },
];

async function fetchImage(name: string): Promise<string | null> {
  try {
    const url = new URL(OFF_SEARCH);
    url.searchParams.set("q", name);
    url.searchParams.set("fields", "image_front_small_url");
    url.searchParams.set("page_size", "5");

    const res = await fetch(url.toString(), {
      headers: { "User-Agent": UA },
      next: { revalidate: 604800 }, // cache 1 week — staples don't change
    });
    if (!res.ok) return null;

    const data: { hits?: Array<{ image_front_small_url?: string }> } = await res.json();
    return data.hits?.find((p) => p.image_front_small_url?.trim())?.image_front_small_url ?? null;
  } catch {
    return null;
  }
}

export async function GET() {
  // Fetch all images in parallel
  const results = await Promise.all(
    STAPLES.map(async ({ name, category }) => ({
      name,
      category,
      imgUrl: await fetchImage(name),
    }))
  );

  return NextResponse.json(
    { products: results },
    { headers: { "Cache-Control": "public, max-age=604800" } }
  );
}
