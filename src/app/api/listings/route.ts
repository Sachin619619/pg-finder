import { NextRequest, NextResponse } from "next/server";
import { fetchListings } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const area = searchParams.get("area");
  const gender = searchParams.get("gender");
  const minPrice = Number(searchParams.get("minPrice") || 0);
  const maxPrice = Number(searchParams.get("maxPrice") || 100000);
  const roomType = searchParams.get("roomType");
  const search = searchParams.get("search");

  let result = await fetchListings();

  result = result.filter((pg) => {
    if (area && pg.area !== area) return false;
    if (gender && pg.gender !== gender) return false;
    if (pg.price < minPrice || pg.price > maxPrice) return false;
    if (roomType && pg.type !== roomType) return false;
    if (search) {
      const q = search.toLowerCase();
      const match =
        pg.name.toLowerCase().includes(q) ||
        pg.area.toLowerCase().includes(q) ||
        pg.locality.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  return NextResponse.json({ listings: result, total: result.length });
}
