import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: NextRequest) {
  const limited = rateLimit(getClientIp(req), "verify-agent", 15);
  if (limited) return limited;

  try {
    const { agentId, action } = await req.json();

    if (!agentId || !["approve", "reject"].includes(action)) {
      return NextResponse.json({ error: "Invalid request. Requires agentId and action (approve|reject)." }, { status: 400 });
    }

    // Check agent exists and is an agent role
    const { data: profile, error: fetchError } = await supabase
      .from("profiles")
      .select("id, role, name, email")
      .eq("id", agentId)
      .single();

    if (fetchError || !profile) {
      return NextResponse.json({ error: "Agent not found." }, { status: 404 });
    }

    if (profile.role !== "agent") {
      return NextResponse.json({ error: "User is not an agent." }, { status: 400 });
    }

    const verified = action === "approve";

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ verified })
      .eq("id", agentId);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      agentId,
      action,
      verified,
      message: `Agent ${profile.name} has been ${action === "approve" ? "approved" : "rejected"}.`,
    });
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
