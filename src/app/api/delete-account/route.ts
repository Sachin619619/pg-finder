import { NextResponse } from "next/server";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { isValidUUID } from "@/lib/validate";
import { getAuthUserId, supabaseAdmin } from "@/lib/server-auth";

export async function POST(req: Request) {
  const limited = rateLimit(getClientIp(req), "delete-account", 5);
  if (limited) return limited;

  // Verify the requesting user is authenticated
  const authUserId = await getAuthUserId(req);
  if (!authUserId) {
    return NextResponse.json({ error: "Unauthorized. Please sign in." }, { status: 401 });
  }

  const { userId } = await req.json();

  if (!userId) {
    return NextResponse.json({ error: "User ID required" }, { status: 400 });
  }
  if (!isValidUUID(userId)) {
    return NextResponse.json({ error: "Invalid User ID format. Must be a valid UUID." }, { status: 400 });
  }

  // Ensure user can only delete their own account
  if (authUserId !== userId) {
    return NextResponse.json({ error: "Forbidden: you can only delete your own account" }, { status: 403 });
  }

  // Delete profile first
  await supabaseAdmin.from("profiles").delete().eq("id", userId);

  // Delete user from auth
  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
