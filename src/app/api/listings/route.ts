import { NextRequest, NextResponse } from "next/server";
import { fetchListings } from "@/lib/db";
import { sanitizeString, isValidNumber } from "@/lib/validate";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export async function GET(req: NextRequest) {
  const limited = rateLimit(getClientIp(req), "listings", 30);
  if (limited) return limited;

  const { searchParams } = req.nextUrl;
  const area = searchParams.get("area");
  const gender = searchParams.get("gender");
  const rawMinPrice = searchParams.get("minPrice");
  const rawMaxPrice = searchParams.get("maxPrice");
  const roomType = searchParams.get("roomType");
  const search = searchParams.get("search");

  // ── Validation ──
  const minPrice = Number(rawMinPrice || 0);
  const maxPrice = Number(rawMaxPrice || 100000);

  if (rawMinPrice && !isValidNumber(minPrice, 0, 500000)) {
    return NextResponse.json({ error: "minPrice must be a number between 0 and 500000" }, { status: 400 });
  }
  if (rawMaxPrice && !isValidNumber(maxPrice, 0, 500000)) {
    return NextResponse.json({ error: "maxPrice must be a number between 0 and 500000" }, { status: 400 });
  }
  if (minPrice > maxPrice) {
    return NextResponse.json({ error: "minPrice cannot be greater than maxPrice" }, { status: 400 });
  }
  if (gender && !["male", "female", "coed"].includes(gender.toLowerCase())) {
    return NextResponse.json({ error: "gender must be one of: male, female, coed" }, { status: 400 });
  }
  if (roomType && !["single", "double", "triple", "any"].includes(roomType.toLowerCase())) {
    return NextResponse.json({ error: "roomType must be one of: single, double, triple, any" }, { status: 400 });
  }

  // Sanitize text inputs
  const sanitizedArea = area ? sanitizeString(area, 100) : null;
  const sanitizedSearch = search ? sanitizeString(search, 200) : null;

  // fetchListings() already filters to status='active' only
  let result = await fetchListings();

  result = result.filter((pg) => {
    if (sanitizedArea && pg.area !== sanitizedArea) return false;
    if (gender && pg.gender !== gender) return false;
    if (pg.price < minPrice || pg.price > maxPrice) return false;
    if (roomType && pg.type !== roomType) return false;
    if (sanitizedSearch) {
      const q = sanitizedSearch.toLowerCase();
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
