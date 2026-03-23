import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { isNonEmptyString, isValidPhone, isValidPrice, isValidGender, isValidUUID, sanitizeString } from "@/lib/validate";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const MINIMAX_API_KEY = process.env.MINIMAX_API_KEY;
const API_URL = "https://api.minimax.io/v1/text/chatcompletion_v2";
const MODEL = "MiniMax-M2.7-highspeed";

interface VerifyRequest {
  name: string;
  area: string;
  locality: string;
  contact_phone: string;
  contact_name: string;
  description: string;
  price: number;
  gender: string;
  agent_id?: string;
}

interface VerifyResult {
  approved: boolean;
  issues: string[];
  duplicate_of?: string;
  risk_score: number;
  warning_count?: number;
  suspended?: boolean;
  suspended_until?: string;
  permanently_banned?: boolean;
}

async function aiVerify(data: VerifyRequest): Promise<{ issues: string[]; risk_score: number }> {
  if (!MINIMAX_API_KEY) return { issues: [], risk_score: 0 };

  const prompt = `You are a PG listing fraud detector for a Bangalore PG accommodation platform called Castle.

Analyze this PG listing submitted by an AGENT and detect if it's fake, spam, or low quality.

LISTING DATA:
- PG Name: "${data.name}"
- Area: "${data.area}"
- Locality: "${data.locality}"
- Price: ₹${data.price}/month
- Gender: ${data.gender}
- Owner Name: "${data.contact_name}"
- Owner Phone: "${data.contact_phone}"
- Description: "${data.description}"

CHECK FOR:
1. Is the PG name realistic for Bangalore? (Not gibberish, not a test entry)
2. Is the description genuine and detailed enough? (Not copy-paste, not lorem ipsum, not just 1-2 vague words)
3. Is the pricing realistic for ${data.area}, Bangalore? (Single room: ₹5K-20K, Double: ₹3K-12K, Triple: ₹2K-8K)
4. Does the owner name look real? (Not "test", "admin", "xyz" etc.)
5. Does the phone number look valid? (10 digits, Indian format, not all same digits)
6. Is the description relevant to a PG listing? (Not random text, not promotional spam)
7. Any signs of a scam agent trying to earn fake payouts?

RESPOND IN THIS EXACT JSON FORMAT ONLY:
{"issues":["issue 1","issue 2"],"risk_score":25}

- issues: array of problems found (empty if clean)
- risk_score: 0-100 (0=perfectly clean, 100=obvious fake)
- If everything looks legitimate, return {"issues":[],"risk_score":0}
- Be strict but fair. Real PGs with basic descriptions are OK.
- Only flag genuine problems, not minor style issues.`;

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${MINIMAX_API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: "system", content: "You are a fraud detection AI. Only respond with valid JSON." },
          { role: "user", content: prompt },
        ],
        max_tokens: 300,
        temperature: 0.1,
      }),
    });

    const json = await res.json();
    const text = json.choices?.[0]?.message?.content || "";

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        issues: Array.isArray(parsed.issues) ? parsed.issues : [],
        risk_score: typeof parsed.risk_score === "number" ? parsed.risk_score : 0,
      };
    }
  } catch {
    // If MiniMax fails, don't block the submission
  }

  return { issues: [], risk_score: 0 };
}

// Check if agent is suspended/banned
async function checkAgentSuspension(agentId: string) {
  const { data: suspension } = await supabase
    .from("agent_suspensions")
    .select("*")
    .eq("agent_id", agentId)
    .single();

  if (!suspension) return { suspended: false, warning_count: 0 };

  if (suspension.permanently_banned) {
    return {
      suspended: true,
      permanently_banned: true,
      warning_count: suspension.warning_count,
    };
  }

  if (suspension.suspended_until && new Date(suspension.suspended_until) > new Date()) {
    return {
      suspended: true,
      suspended_until: suspension.suspended_until,
      warning_count: suspension.warning_count,
    };
  }

  return { suspended: false, warning_count: suspension.warning_count };
}

// Record a warning and enforce progressive suspensions
async function recordWarning(agentId: string, reason: string, listingName: string, riskScore: number) {
  // Insert warning
  await supabase.from("agent_warnings").insert({
    agent_id: agentId,
    reason,
    listing_name: listingName,
    risk_score: riskScore,
  });

  // Get or create suspension record
  const { data: existing } = await supabase
    .from("agent_suspensions")
    .select("*")
    .eq("agent_id", agentId)
    .single();

  const newCount = (existing?.warning_count || 0) + 1;

  // Progressive suspension logic:
  // 3 warnings  -> 1 week suspension
  // 6 warnings  -> 1 month suspension
  // 9+ warnings -> permanent ban
  let suspendedUntil: string | null = null;
  let permanentlyBanned = false;

  if (newCount >= 9) {
    permanentlyBanned = true;
  } else if (newCount >= 6) {
    const date = new Date();
    date.setDate(date.getDate() + 30);
    suspendedUntil = date.toISOString();
  } else if (newCount >= 3) {
    const date = new Date();
    date.setDate(date.getDate() + 7);
    suspendedUntil = date.toISOString();
  }

  if (existing) {
    await supabase
      .from("agent_suspensions")
      .update({
        warning_count: newCount,
        suspended_until: suspendedUntil,
        permanently_banned: permanentlyBanned,
        updated_at: new Date().toISOString(),
      })
      .eq("agent_id", agentId);
  } else {
    await supabase.from("agent_suspensions").insert({
      agent_id: agentId,
      warning_count: newCount,
      suspended_until: suspendedUntil,
      permanently_banned: permanentlyBanned,
    });
  }

  return { warning_count: newCount, suspended_until: suspendedUntil, permanently_banned: permanentlyBanned };
}

export async function POST(req: Request) {
  const limited = rateLimit(getClientIp(req), "verify-listing", 15);
  if (limited) return limited;

  try {
    const data: VerifyRequest = await req.json();

    // ── Input Validation ──
    if (!isNonEmptyString(data.name)) {
      return NextResponse.json({ error: "name is required" }, { status: 400 });
    }
    if (!isNonEmptyString(data.area)) {
      return NextResponse.json({ error: "area is required" }, { status: 400 });
    }
    if (!isNonEmptyString(data.locality)) {
      return NextResponse.json({ error: "locality is required" }, { status: 400 });
    }
    if (!isNonEmptyString(data.contact_phone)) {
      return NextResponse.json({ error: "contact_phone is required" }, { status: 400 });
    }
    if (!isValidPhone(data.contact_phone)) {
      return NextResponse.json({ error: "Invalid contact_phone. Must be a valid 10-digit Indian mobile number." }, { status: 400 });
    }
    if (!isNonEmptyString(data.contact_name)) {
      return NextResponse.json({ error: "contact_name is required" }, { status: 400 });
    }
    if (!isNonEmptyString(data.description)) {
      return NextResponse.json({ error: "description is required" }, { status: 400 });
    }
    if (typeof data.price !== "number" || !isValidPrice(data.price)) {
      return NextResponse.json({ error: "price must be a number between 500 and 200000" }, { status: 400 });
    }
    if (!isNonEmptyString(data.gender)) {
      return NextResponse.json({ error: "gender is required" }, { status: 400 });
    }
    if (!isValidGender(data.gender)) {
      return NextResponse.json({ error: "gender must be one of: male, female, coed" }, { status: 400 });
    }
    if (data.agent_id !== undefined && !isValidUUID(data.agent_id)) {
      return NextResponse.json({ error: "Invalid agent_id format. Must be a valid UUID." }, { status: 400 });
    }

    // Sanitize text inputs
    data.name = sanitizeString(data.name, 200);
    data.area = sanitizeString(data.area, 100);
    data.locality = sanitizeString(data.locality, 200);
    data.contact_name = sanitizeString(data.contact_name, 100);
    data.description = sanitizeString(data.description, 3000);

    const issues: string[] = [];
    let riskScore = 0;
    let duplicateOf: string | undefined;

    // ── 0. CHECK AGENT SUSPENSION STATUS ────────────────────
    if (data.agent_id) {
      const suspensionStatus = await checkAgentSuspension(data.agent_id);

      if (suspensionStatus.suspended) {
        if (suspensionStatus.permanently_banned) {
          return NextResponse.json({
            approved: false,
            issues: ["Your agent account has been permanently banned due to repeated violations."],
            risk_score: 100,
            warning_count: suspensionStatus.warning_count,
            permanently_banned: true,
          } as VerifyResult);
        }

        const until = new Date(suspensionStatus.suspended_until!).toLocaleDateString("en-IN", {
          day: "numeric", month: "short", year: "numeric",
        });
        return NextResponse.json({
          approved: false,
          issues: [`Your agent account is suspended until ${until}. You have ${suspensionStatus.warning_count} warnings.`],
          risk_score: 100,
          warning_count: suspensionStatus.warning_count,
          suspended: true,
          suspended_until: suspensionStatus.suspended_until,
        } as VerifyResult);
      }
    }

    // ── 1. DATABASE DUPLICATE CHECK ─────────────────────────
    // Check by exact phone + exact name match (same owner CAN have multiple PGs)
    const { data: phoneMatches } = await supabase
      .from("listings")
      .select("id, name, area, contact_phone")
      .eq("contact_phone", data.contact_phone);

    if (phoneMatches && phoneMatches.length > 0) {
      // Same phone + same PG name = definite duplicate
      const exactDup = phoneMatches.find(
        (m) => m.name.toLowerCase().trim() === data.name.toLowerCase().trim()
      );
      if (exactDup) {
        issues.push(`Duplicate: "${exactDup.name}" with same phone already exists in ${exactDup.area}`);
        duplicateOf = exactDup.id;
        riskScore += 50;
      } else {
        // Same phone but different name = same owner, different PG (OK, just inform)
        issues.push(`Note: This phone number is linked to ${phoneMatches.length} existing PG(s). Same owner adding another PG is fine.`);
      }
    }

    // Check by exact name + same area (regardless of phone)
    const { data: nameMatches } = await supabase
      .from("listings")
      .select("id, name, area")
      .eq("area", data.area)
      .ilike("name", `%${data.name.split(" ")[0]}%`);

    if (nameMatches && nameMatches.length > 0) {
      const exactMatch = nameMatches.find(
        (m) => m.name.toLowerCase().trim() === data.name.toLowerCase().trim()
      );
      if (exactMatch && exactMatch.id !== duplicateOf) {
        issues.push(`Duplicate: "${exactMatch.name}" already exists in ${exactMatch.area}`);
        duplicateOf = duplicateOf || exactMatch.id;
        riskScore += 40;
      } else if (!exactMatch) {
        issues.push(`Similar listing found: "${nameMatches[0].name}" in ${nameMatches[0].area}. Please confirm this is a different PG.`);
        riskScore += 10;
      }
    }

    // Check if same agent already submitted a PG with this exact name
    if (data.agent_id) {
      const { data: agentDups } = await supabase
        .from("agent_requests")
        .select("pg_name, pg_area")
        .eq("agent_id", data.agent_id)
        .ilike("pg_name", `%${data.name.split(" ")[0]}%`);

      if (agentDups && agentDups.length > 0) {
        const exactAgentDup = agentDups.find(
          (d) => d.pg_name.toLowerCase().trim() === data.name.toLowerCase().trim()
        );
        if (exactAgentDup) {
          issues.push(`You've already submitted this exact PG: "${exactAgentDup.pg_name}" in ${exactAgentDup.pg_area}`);
          riskScore += 30;
        }
      }
    }

    // ── 2. MINIMAX AI VERIFICATION ──────────────────────────
    const aiResult = await aiVerify(data);
    if (aiResult.issues.length > 0) {
      issues.push(...aiResult.issues.map((i) => `AI: ${i}`));
    }
    riskScore += aiResult.risk_score;

    // ── 3. VERDICT ──────────────────────────────────────────
    riskScore = Math.min(riskScore, 100);
    const approved = riskScore < 40;

    // ── 4. RECORD WARNING IF REJECTED ───────────────────────
    let warningCount = 0;
    let suspendedUntil: string | undefined;
    let permanentlyBanned: boolean | undefined;

    if (!approved && data.agent_id) {
      const warningResult = await recordWarning(
        data.agent_id,
        issues.join("; "),
        data.name,
        riskScore
      );
      warningCount = warningResult.warning_count;
      suspendedUntil = warningResult.suspended_until || undefined;
      permanentlyBanned = warningResult.permanently_banned || undefined;

      // Add warning count info to issues
      if (warningCount < 3) {
        issues.push(`Warning ${warningCount}/3. After 3 warnings, your account will be suspended for 1 week.`);
      } else if (warningCount < 6) {
        issues.push(`Warning ${warningCount}/6. Your account is now suspended for 1 week.`);
      } else if (warningCount < 9) {
        issues.push(`Warning ${warningCount}/9. Your account is now suspended for 1 month.`);
      } else {
        issues.push(`Warning ${warningCount}. Your account has been permanently banned.`);
      }
    }

    return NextResponse.json({
      approved,
      issues,
      duplicate_of: duplicateOf,
      risk_score: riskScore,
      warning_count: warningCount,
      suspended: !!suspendedUntil || !!permanentlyBanned,
      suspended_until: suspendedUntil,
      permanently_banned: permanentlyBanned,
    } as VerifyResult);
  } catch {
    return NextResponse.json(
      { approved: true, issues: [], risk_score: 0 },
      { status: 200 }
    );
  }
}
