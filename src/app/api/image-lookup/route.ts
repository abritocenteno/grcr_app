import { NextRequest, NextResponse } from "next/server";

interface OFFProduct {
  product_name?: string;
  image_front_small_url?: string;
}

interface OFFResponse {
  products?: OFFProduct[];
}

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q");
  if (!q || !q.trim()) {
    return NextResponse.json({ imgUrl: null });
  }

  const searchTerm = q.trim();

  try {
    const url = new URL("https://world.openfoodfacts.org/cgi/search.pl");
    url.searchParams.set("search_terms", searchTerm);
    url.searchParams.set("search_simple", "1");
    url.searchParams.set("action", "process");
    url.searchParams.set("json", "1");
    url.searchParams.set("page_size", "6");
    url.searchParams.set("fields", "product_name,image_front_small_url");

    const offRes = await fetch(url.toString(), {
      headers: { "User-Agent": "GroceryApp/1.0 (contact@example.com)" },
      next: { revalidate: 86400 },
    });

    if (!offRes.ok) {
      return NextResponse.json(
        { imgUrl: null },
        { headers: { "Cache-Control": "public, max-age=86400" } }
      );
    }

    const data: OFFResponse = await offRes.json();
    const match = data.products?.find(
      (p) => p.image_front_small_url && p.image_front_small_url.trim() !== ""
    );
    const imgUrl = match?.image_front_small_url ?? null;

    return NextResponse.json(
      { imgUrl },
      { headers: { "Cache-Control": "public, max-age=86400" } }
    );
  } catch {
    return NextResponse.json(
      { imgUrl: null },
      { headers: { "Cache-Control": "public, max-age=86400" } }
    );
  }
}
