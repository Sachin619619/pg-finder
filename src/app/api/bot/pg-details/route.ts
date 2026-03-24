import { NextResponse } from "next/server";
import { validateBotRequest } from "@/lib/bot-auth";
import { fetchListings, fetchListingById } from "@/lib/db";
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

function findPGByName(allListings: PGListing[], name: string): PGListing | undefined {
  if (!name) return undefined;
  const lower = name.toLowerCase().trim();

  const exactMatch = allListings.find(
    (pg) =>
      pg.name.toLowerCase().includes(lower) ||
      lower.includes(pg.name.toLowerCase().split(" ")[0])
  );
  if (exactMatch) return exactMatch;

  let bestMatch: PGListing | undefined;
  let bestScore = 0;

  for (const pg of allListings) {
    const pgLower = pg.name.toLowerCase();
    const fullScore = similarity(lower, pgLower);

    const queryWords = lower.split(/\s+/);
    const pgWords = pgLower.split(/\s+/);
    let wordScore = 0;
    for (const qw of queryWords) {
      let bestWordSim = 0;
      for (const pw of pgWords) {
        bestWordSim = Math.max(bestWordSim, similarity(qw, pw));
      }
      wordScore += bestWordSim;
    }
    wordScore = queryWords.length > 0 ? wordScore / queryWords.length : 0;

    const score = Math.max(fullScore, wordScore);
    if (score > bestScore) {
      bestScore = score;
      bestMatch = pg;
    }
  }

  return bestScore >= 0.55 ? bestMatch : undefined;
}

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&q=80";

function buildDetailCard(pg: PGListing) {
  const image =
    pg.images && pg.images.length > 0 ? pg.images[0] : PLACEHOLDER_IMAGE;

  const badges: { text: string; color: string }[] = [];
  if (pg.rating) badges.push({ text: `${pg.rating} ★ (${pg.reviews} reviews)`, color: "amber" });
  if (pg.foodIncluded) badges.push({ text: "🍽️ Food Included", color: "green" });
  if (pg.acAvailable) badges.push({ text: "❄️ AC Available", color: "blue" });
  if (pg.wifiIncluded) badges.push({ text: "📶 WiFi Included", color: "purple" });
  if (pg.furnished) badges.push({ text: "🪑 Furnished", color: "teal" });

  const fields: { label: string; value: string }[] = [
    { label: "Price", value: `₹${pg.price.toLocaleString("en-IN")}/mo` },
    { label: "Type", value: pg.type },
    { label: "Gender", value: pg.gender },
    { label: "Area", value: `${pg.area} — ${pg.locality}` },
    { label: "Available From", value: pg.availableFrom || "Now" },
    { label: "Contact", value: `${pg.contactName} (${pg.contactPhone})` },
    { label: "Amenities", value: pg.amenities.join(", ") },
  ];
  if (pg.nearbyLandmarks && pg.nearbyLandmarks.length > 0) {
    fields.push({ label: "Nearby", value: pg.nearbyLandmarks.join(", ") });
  }
  if (pg.distanceFromMetro) {
    fields.push({ label: "Metro Distance", value: pg.distanceFromMetro });
  }

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
      description: pg.description,
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
    const { pgName, pgId } = body;

    let pg: PGListing | null | undefined = null;

    if (pgId) {
      pg = await fetchListingById(pgId);
    }

    if (!pg && pgName) {
      const allListings = await fetchListings();
      pg = findPGByName(allListings, pgName);
    }

    if (!pg) {
      return NextResponse.json(
        {
          _cards: [],
          summary: `Couldn't find a PG matching "${pgName || pgId}". Try the exact name?`,
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      _cards: [buildDetailCard(pg)],
      summary: `Here are the details for ${pg.name}`,
    });
  } catch (error) {
    console.error("Bot pg-details error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
