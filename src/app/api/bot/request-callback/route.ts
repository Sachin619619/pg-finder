import { NextResponse } from "next/server";
import { validateBotRequest } from "@/lib/bot-auth";
import { fetchListings } from "@/lib/db";
import { supabase } from "@/lib/supabase";
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

export async function POST(req: Request) {
  if (!validateBotRequest(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { pgName, userName, userPhone, userEmail } = body;

    if (!pgName || !userName || !userPhone) {
      return NextResponse.json(
        { error: "pgName, userName, and userPhone are required" },
        { status: 400 }
      );
    }

    const allListings = await fetchListings();
    const pg = findPGByName(allListings, pgName);

    if (!pg) {
      return NextResponse.json(
        { success: false, message: `Couldn't find a PG matching "${pgName}".` },
        { status: 404 }
      );
    }

    const { error } = await supabase.from("callbacks").insert({
      pg_id: pg.id,
      name: userName,
      phone: userPhone,
      ...(userEmail ? { email: userEmail } : {}),
    });

    if (error) {
      console.error("Callback insert error:", error);
      return NextResponse.json(
        { success: false, message: "Failed to submit callback request. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Callback requested for ${pg.name}. The owner will contact you soon.`,
    });
  } catch (error) {
    console.error("Bot request-callback error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
