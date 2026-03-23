import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { sanitizeString } from "@/lib/validate";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  const limited = rateLimit(getClientIp(req), "search-owner", 30);
  if (limited) return limited;

  const rawQ = req.nextUrl.searchParams.get("q")?.trim().toLowerCase();
  if (!rawQ || rawQ.length < 2) {
    return NextResponse.json({ owners: [] });
  }
  if (rawQ.length > 100) {
    return NextResponse.json({ error: "Search query too long. Maximum 100 characters." }, { status: 400 });
  }

  // Sanitize the query to prevent injection
  const q = sanitizeString(rawQ, 100).toLowerCase();
  if (!q || q.length < 2) {
    return NextResponse.json({ owners: [] });
  }

  // Search owners by username (partial match)
  const { data, error } = await supabase
    .from("profiles")
    .select("id, name, username, avatar")
    .eq("role", "owner")
    .not("username", "is", null)
    .ilike("username", `%${q}%`)
    .limit(5);

  if (error) {
    return NextResponse.json({ owners: [] });
  }

  return NextResponse.json({ owners: data || [] });
}
