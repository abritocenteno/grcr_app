import { NextResponse } from "next/server";
import { fetchOFFHits, offImageCandidates, firstLiveImage, nameOk } from "@/lib/offSearch";
import { searchAH, rankAH } from "@/lib/ahApi";

export interface PopularProduct {
  name: string;
  imgUrl: string | null;
  category: string;
}

// Categories that mean "processed", not the fresh item. Open Food Facts is a
// packaged-goods DB, so a produce search (paprika, appel, tomaat…) mostly turns
// up spice jars, sauces, juices and chips — all sharing the produce's name.
// Excluding these category tags leaves only the real fruit/veg.
const PRODUCE_AVOID_CATS = [
  "spices", "condiments", "seasonings", "sauces", "syrups",
  "juices", "chips", "crisps", "dairies", "snacks",
];

// Processed forms to skip in store-catalogue titles (AH names them, unlike OFF):
// "Hak uit de oven gevulde paprika" → drop; "AH Paprika rood" → keep.
const PRODUCE_AVOID_WORDS = [
  "gevuld", "oven", "saus", "soep", "ketchup", "passata", "puree", "moes",
  "sap", "poeder", "gemalen", "gedroogd", "chips", "blik", "conserven",
  "diepvries", "zoetzuur", "crisps", "reepjes", "snack", "dressing",
];

// Common Dutch grocery staples, ordered by how universal they are. `match` is
// the core noun stem every hit MUST contain — without it OFF's loose search
// hands back unrelated items (e.g. flour for "Brood"). `produce` items are
// loose fruit/veg that OFF barely carries: we source those photos from AH's
// catalogue (which has real produce shots) and only fall back to OFF.
const STAPLES: Array<{
  name: string;
  category: string;
  match: string;
  produce?: boolean;
}> = [
  { name: "Halfvolle melk", category: "Zuivel", match: "melk" },
  { name: "Brood", category: "Bakkerij", match: "brood" },
  { name: "Eieren", category: "Zuivel", match: "eier" },
  { name: "Kaas", category: "Zuivel", match: "kaas" },
  { name: "Yoghurt", category: "Zuivel", match: "yoghurt" },
  { name: "Boter", category: "Zuivel", match: "boter" },
  { name: "Appels", category: "Fruit", match: "appel", produce: true },
  { name: "Bananen", category: "Fruit", match: "banan", produce: true },
  { name: "Tomaten", category: "Groente", match: "tomat", produce: true },
  { name: "Aardappelen", category: "Groente", match: "aardappel", produce: true },
  { name: "Pasta", category: "Droogwaren", match: "pasta" },
  { name: "Rijst", category: "Droogwaren", match: "rijst" },
  { name: "Kip filet", category: "Vlees & vis", match: "kip" },
  { name: "Gehakt", category: "Vlees & vis", match: "gehakt" },
  { name: "Koffie", category: "Dranken", match: "koffie" },
  { name: "Sinaasappelsap", category: "Dranken", match: "sinaasappel" },
  { name: "Hagelslag", category: "Ontbijt", match: "hagelslag" },
  { name: "Pindakaas", category: "Ontbijt", match: "pindakaas" },
  { name: "Komkommer", category: "Groente", match: "komkommer", produce: true },
  { name: "Paprika", category: "Groente", match: "paprika", produce: true },
];

// Real produce photo from AH's catalogue (image only — this row carries no price).
async function ahProduceImage(query: string, match: string): Promise<string | null> {
  try {
    const ranked = rankAH(query, await searchAH(query, 10));
    return ranked.find((r) => r.imgUrl && nameOk(r.name, match, PRODUCE_AVOID_WORDS))?.imgUrl ?? null;
  } catch {
    return null;
  }
}

async function fetchImage(query: string, match: string, produce?: boolean): Promise<string | null> {
  // Produce: prefer AH (OFF lacks loose fruit/veg, returns processed look-alikes).
  if (produce) {
    const ah = await ahProduceImage(query, match);
    if (ah) return ah;
  }
  try {
    const hits = await fetchOFFHits(query, undefined, 15);
    return await firstLiveImage(
      offImageCandidates(hits, { match, avoidCats: produce ? PRODUCE_AVOID_CATS : undefined })
    );
  } catch {
    return null;
  }
}

export async function GET() {
  // Fetch all images in parallel
  const results = await Promise.all(
    STAPLES.map(async ({ name, category, match, produce }) => ({
      name,
      category,
      imgUrl: await fetchImage(name, match, produce),
    }))
  );

  return NextResponse.json(
    { products: results },
    { headers: { "Cache-Control": "public, max-age=3600" } }
  );
}
