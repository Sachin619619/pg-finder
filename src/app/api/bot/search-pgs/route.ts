import { NextResponse } from "next/server";
import { validateBotRequest } from "@/lib/bot-auth";
import { fetchListings } from "@/lib/db";
import type { PGListing } from "@/data/listings";

// Levenshtein distance for fuzzy matching
function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

function similarity(a: string, b: string): number {
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 1;
  return 1 - levenshtein(a, b) / maxLen;
}

function filterPGs(
  allListings: PGListing[],
  filters: Record<string, unknown>
): PGListing[] {
  let results = [...allListings];

  if (filters.area) {
    const area = (filters.area as string).toLowerCase().trim();
    let areaResults = results.filter(
      (pg) => pg.area.toLowerCase().trim() === area
    );
    if (areaResults.length === 0) {
      areaResults = results.filter(
        (pg) =>
          pg.area.toLowerCase().includes(area) ||
          area.includes(pg.area.toLowerCase())
      );
    }
    if (areaResults.length === 0) {
      const uniqueAreas = [...new Set(results.map((pg) => pg.area))];
      const bestArea = uniqueAreas
        .map((a) => ({ area: a, score: similarity(area, a.toLowerCase()) }))
        .sort((a, b) => b.score - a.score)[0];
      if (bestArea && bestArea.score >= 0.5) {
        areaResults = results.filter((pg) => pg.area === bestArea.area);
      }
    }
    results = areaResults;
  }

  if (filters.maxPrice) {
    results = results.filter((pg) => pg.price <= (filters.maxPrice as number));
  }
  if (filters.minPrice) {
    results = results.filter((pg) => pg.price >= (filters.minPrice as number));
  }
  if (filters.gender) {
    const g = (filters.gender as string).toLowerCase();
    results = results.filter((pg) => pg.gender === g || pg.gender === "coed");
  }
  if (filters.type) {
    results = results.filter(
      (pg) => pg.type === filters.type || pg.type === "any"
    );
  }
  if (filters.food) results = results.filter((pg) => pg.foodIncluded);
  if (filters.wifi) results = results.filter((pg) => pg.wifiIncluded);
  if (filters.ac) results = results.filter((pg) => pg.acAvailable);

  results.sort((a, b) => b.rating - a.rating);
  return results.slice(0, 6);
}

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&q=80";

function buildPGCard(pg: PGListing) {
  const image =
    pg.images && pg.images.length > 0 ? pg.images[0] : PLACEHOLDER_IMAGE;

  const badges: { text: string; color: string }[] = [];
  if (pg.rating) badges.push({ text: `${pg.rating} ★`, color: "amber" });
  if (pg.foodIncluded) badges.push({ text: "🍽️ Food", color: "green" });
  if (pg.acAvailable) badges.push({ text: "❄️ AC", color: "blue" });
  if (pg.wifiIncluded) badges.push({ text: "📶 WiFi", color: "purple" });

  const fields: { label: string; value: string }[] = [
    { label: "Price", value: `₹${pg.price.toLocaleString("en-IN")}/mo` },
    { label: "Type", value: pg.type },
    { label: "Available", value: pg.availableFrom || "Now" },
  ];

  const whatsappText = encodeURIComponent(
    `Hi, I found ${pg.name} on Castle Living and I'm interested in learning more!`
  );
  const phone = pg.contactPhone?.replace(/[^0-9]/g, "") || "";

  const actions = [
    {
      label: "❤️ Save",
      action: "custom_event",
      payload: { event: "save_pg", pgId: pg.id },
      style: "secondary",
    },
    {
      label: "🏠 Stay",
      action: "send_message",
      payload: { message: `I want to stay at ${pg.name}` },
      style: "primary",
    },
    {
      label: "📞 Callback",
      action: "send_message",
      payload: { message: `Request callback for ${pg.name}` },
      style: "success",
    },
    {
      label: "💬 WhatsApp",
      action: "open_url",
      payload: { url: `https://wa.me/91${phone}?text=${whatsappText}` },
      style: "success",
    },
  ];

  return {
    type: "pg_card",
    data: {
      image,
      title: pg.name,
      subtitle: `📍 ${pg.area} | ${pg.gender} | ${pg.type}`,
      url: `https://castleliving.in/listing/${pg.id}`,
      badges,
      fields,
      actions,
    },
  };
}

export async function POST(req: Request) {
  if (!validateBotRequest(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { area, maxPrice, minPrice, gender, food, wifi, ac, type } = body;

    const allListings = await fetchListings();
    const matched = filterPGs(allListings, {
      area,
      maxPrice,
      minPrice,
      gender,
      food,
      wifi,
      ac,
      type,
    });

    const _cards = matched.map(buildPGCard);

    return NextResponse.json({
      _cards,
      summary:
        matched.length > 0
          ? `Found ${matched.length} PG${matched.length > 1 ? "s" : ""} matching your criteria`
          : "No PGs found matching your criteria. Try adjusting your filters!",
    });
  } catch (error) {
    console.error("Bot search-pgs error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
