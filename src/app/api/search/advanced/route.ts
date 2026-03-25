import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { fetchListings } from "@/lib/db";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

// POST /api/search/advanced - Advanced search with AI enhancement
export async function POST(req: NextRequest) {
  const limited = rateLimit(getClientIp(req), "search", 20);
  if (limited) return limited;

  try {
    const body = await req.json();
    const {
      query,
      filters = {},
      userId,
      includeBehavior = false,
      limit = 20,
      offset = 0,
    } = body;

    const {
      area,
      gender,
      minPrice,
      maxPrice,
      roomType,
      amenities = [],
      minRating,
      furnished,
      foodIncluded,
      wifiIncluded,
      acAvailable,
      nearMetro,
      verified,
    } = filters;

    // Fetch all listings
    let listings = await fetchListings();

    // Track search if user is logged in
    if (userId) {
      await supabase.from("user_behavior").insert({
        user_id: userId,
        action_type: "search",
        metadata: { query, area, filters },
      });
    }

    // Apply filters
    listings = listings.filter((pg) => {
      // Text search
      if (query) {
        const q = query.toLowerCase();
        const match =
          pg.name.toLowerCase().includes(q) ||
          pg.area.toLowerCase().includes(q) ||
          pg.locality.toLowerCase().includes(q) ||
          pg.description.toLowerCase().includes(q) ||
          pg.amenities.some((a) => a.toLowerCase().includes(q));
        if (!match) return false;
      }

      // Area filter
      if (area && pg.area !== area) return false;

      // Gender filter
      if (gender && gender !== "any" && pg.gender !== gender && pg.gender !== "coed") return false;

      // Price filter
      if (minPrice !== undefined && pg.price < minPrice) return false;
      if (maxPrice !== undefined && pg.price > maxPrice) return false;

      // Room type filter
      if (roomType && roomType !== "any" && pg.type !== roomType) return false;

      // Amenities filter
      if (amenities.length > 0) {
        const hasAll = amenities.every((a: string) =>
          pg.amenities.some((pa) => pa.toLowerCase().includes(a.toLowerCase()))
        );
        if (!hasAll) return false;
      }

      // Rating filter
      if (minRating !== undefined && pg.rating < minRating) return false;

      // Furnished filter
      if (furnished !== undefined && pg.furnished !== furnished) return false;

      // Food included filter
      if (foodIncluded !== undefined && pg.foodIncluded !== foodIncluded) return false;

      // WiFi filter
      if (wifiIncluded !== undefined && pg.wifiIncluded !== wifiIncluded) return false;

      // AC filter
      if (acAvailable !== undefined && pg.acAvailable !== acAvailable) return false;

      // Near metro filter
      if (nearMetro && pg.distanceFromMetro) {
        const dist = parseInt(pg.distanceFromMetro.replace(/[^0-9]/g, ""));
        if (dist > nearMetro) return false;
      }

      return true;
    });

    // Sort results
    listings.sort((a, b) => {
      // Prioritize by rating and reviews
      if (b.rating !== a.rating) return b.rating - a.rating;
      return b.reviews - a.reviews;
    });

    // Pagination
    const total = listings.length;
    const paginatedListings = listings.slice(offset, offset + limit);

    // Add search relevance score if query provided
    if (query) {
      paginatedListings.forEach((pg) => {
        const q = query.toLowerCase();
        let relevanceScore = 50;

        if (pg.name.toLowerCase().includes(q)) relevanceScore += 30;
        if (pg.area.toLowerCase().includes(q)) relevanceScore += 20;
        if (pg.locality.toLowerCase().includes(q)) relevanceScore += 15;
        if (pg.description.toLowerCase().includes(q)) relevanceScore += 10;

        (pg as Record<string, unknown>).relevanceScore = relevanceScore;
      });
    }

    // Get facet counts for filters
    const facets = {
      areas: getFacetCounts(listings, "area"),
      genders: getFacetCounts(listings, "gender"),
      roomTypes: getFacetCounts(listings, "type"),
      amenities: getAmenityFacets(listings),
      priceRange: {
        min: Math.min(...listings.map((l) => l.price)),
        max: Math.max(...listings.map((l) => l.price)),
        avg: Math.round(listings.reduce((s, l) => s + l.price, 0) / listings.length),
      },
    };

    return NextResponse.json({
      listings: paginatedListings,
      total,
      limit,
      offset,
      facets,
      query: query || null,
    });
  } catch (error) {
    console.error("Advanced search error:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}

// GET /api/search/advanced - Get search suggestions/autocomplete
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const q = searchParams.get("q");

  if (!q || q.length < 2) {
    return NextResponse.json({ suggestions: [] });
  }

  try {
    const listings = await fetchListings();
    const query = q.toLowerCase();

    const suggestions: Array<{ type: string; text: string; count?: number }> = [];

    // Area suggestions
    const areas = [...new Set(listings.map((l) => l.area))];
    const matchingAreas = areas.filter((a) => a.toLowerCase().includes(query));
    matchingAreas.slice(0, 3).forEach((area) => {
      const count = listings.filter((l) => l.area === area).length;
      suggestions.push({ type: "area", text: area, count });
    });

    // PG name suggestions
    const matchingNames = listings
      .filter((l) => l.name.toLowerCase().includes(query))
      .slice(0, 5);
    matchingNames.forEach((pg) => {
      suggestions.push({ type: "pg", text: pg.name });
    });

    // Amenity suggestions
    const amenities = [...new Set(listings.flatMap((l) => l.amenities))];
    const matchingAmenities = amenities.filter((a) => a.toLowerCase().includes(query));
    matchingAmenities.slice(0, 3).forEach((amenity) => {
      suggestions.push({ type: "amenity", text: amenity });
    });

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error("Suggestions error:", error);
    return NextResponse.json({ suggestions: [] });
  }
}

function getFacetCounts(listings: ReturnType<typeof fetchListings> extends Promise<infer T> ? T : never, key: string): Record<string, number> {
  if (!Array.isArray(listings)) return {};

  return listings.reduce((acc: Record<string, number>, pg) => {
    const value = pg[key as keyof typeof pg] as string;
    if (value) {
      acc[value] = (acc[value] || 0) + 1;
    }
    return acc;
  }, {});
}

function getAmenityFacets(listings: ReturnType<typeof fetchListings> extends Promise<infer T> ? T : never): Record<string, number> {
  if (!Array.isArray(listings)) return {};

  const counts: Record<string, number> = {};
  listings.forEach((pg) => {
    pg.amenities.forEach((a) => {
      counts[a] = (counts[a] || 0) + 1;
    });
  });
  return counts;
}
