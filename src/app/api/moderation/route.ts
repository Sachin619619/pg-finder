import { NextResponse } from "next/server";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { isNonEmptyString, sanitizeString } from "@/lib/validate";

const MINIMAX_API_KEY = process.env.MINIMAX_API_KEY;

// Text model
const TEXT_API_URL = "https://api.minimax.io/v1/text/chatcompletion_v2";
const TEXT_MODEL = "MiniMax-M2.7-highspeed";

// Vision model (same as OpenClaw)
const VLM_API_URL = "https://api.minimax.io/v1/coding_plan/vlm";

// ── Text Moderation Prompt ──
const TEXT_MOD_PROMPT = `You are a strict content moderator for a PG/hostel accommodation platform in Bangalore, India.

Analyze the given user review text and respond with ONLY valid JSON:
{"safe":true/false,"reason":"","category":"clean|spam|offensive|inappropriate|irrelevant|fake"}

RULES:
- "safe": true if content is appropriate for a PG review platform
- "safe": false if content contains: profanity, hate speech, sexual content, violence, spam, fake reviews, completely irrelevant text, personal attacks, or discriminatory language
- "reason": short explanation (max 15 words) if unsafe, empty string if safe
- "category": the type of violation detected

EXAMPLES:
"Great PG, clean rooms and good food" → {"safe":true,"reason":"","category":"clean"}
"This place is f***ing terrible" → {"safe":false,"reason":"Contains profanity","category":"offensive"}
"Buy crypto at xyz.com best deals" → {"safe":false,"reason":"Spam/promotional content","category":"spam"}
"sexy girls stay here come visit" → {"safe":false,"reason":"Sexually inappropriate content","category":"inappropriate"}
"asdkjfhaskdf random text" → {"safe":false,"reason":"Irrelevant gibberish content","category":"irrelevant"}

Only output JSON. Nothing else.`;

// ── Vision Moderation Prompt ──
const IMAGE_MOD_PROMPT = `You are a strict image content moderator for a PG (Paying Guest) accommodation listing platform in India.

Analyze this image and respond with ONLY valid JSON:
{"safe":true/false,"reason":"","category":"clean|nsfw|irrelevant|low_quality"}

CLASSIFY as:
- "clean" + safe:true — Real PG/room/building photo: bedroom, bathroom, kitchen, common area, building exterior, balcony, furniture, amenities
- "nsfw" + safe:false — Any nudity, sexual content, suggestive images, inappropriate content
- "irrelevant" + safe:false — Not a PG photo: selfies, memes, screenshots, random objects, food close-ups, pets, cars, landscapes unrelated to a building, promotional graphics, logos
- "low_quality" + safe:false — Extremely blurry, completely dark/overexposed, wrong angle showing nothing useful (ceiling only, floor only, extreme close-up of wall), image too small to see anything

Be strict about NSFW — block anything suggestive. Be moderate about irrelevant — if it could plausibly be part of a PG listing (nearby area, street view, park nearby) allow it.

Only output JSON. Nothing else.`;

// ── Call MiniMax Text Model ──
async function callTextModel(systemPrompt: string, userContent: string): Promise<Record<string, unknown> | null> {
  if (!MINIMAX_API_KEY) return null;

  try {
    const response = await fetch(TEXT_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${MINIMAX_API_KEY}`,
      },
      body: JSON.stringify({
        model: TEXT_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userContent },
        ],
        temperature: 0.05,
        max_tokens: 256,
      }),
    });

    const data = await response.json();
    if (data.base_resp?.status_code && data.base_resp.status_code !== 0) {
      console.error("MiniMax text moderation error:", data.base_resp);
      return null;
    }

    const rawReply = data.choices?.[0]?.message?.content || "";
    return parseJSON(rawReply);
  } catch (err) {
    console.error("Text moderation error:", err);
  }
  return null;
}

// ── Call MiniMax Vision Model (VL-01) ──
async function callVisionModel(prompt: string, imageBase64: string): Promise<Record<string, unknown> | null> {
  if (!MINIMAX_API_KEY) return null;

  try {
    const response = await fetch(VLM_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${MINIMAX_API_KEY}`,
        "MM-API-Source": "Castle",
      },
      body: JSON.stringify({
        prompt,
        image_url: imageBase64, // data:image/jpeg;base64,...
      }),
    });

    const data = await response.json();
    if (data.base_resp?.status_code && data.base_resp.status_code !== 0) {
      console.error("MiniMax VLM error:", data.base_resp);
      return null;
    }

    // VLM returns { content: string } not choices array
    const rawReply = data.content || "";
    return parseJSON(rawReply);
  } catch (err) {
    console.error("Vision moderation error:", err);
  }
  return null;
}

// ── Parse JSON from AI response ──
function parseJSON(raw: string): Record<string, unknown> | null {
  const cleaned = raw.replace(/```json\s*/g, "").replace(/```/g, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const match = raw.match(/\{[\s\S]*\}/);
    if (match) {
      try { return JSON.parse(match[0]); } catch {}
    }
  }
  return null;
}

export async function POST(req: Request) {
  const limited = rateLimit(getClientIp(req), "moderation", 15);
  if (limited) return limited;

  try {
    const body = await req.json();
    const { type, text, imageBase64, fileName, fileSize, fileType } = body;

    // ── Validation ──
    if (!isNonEmptyString(type)) {
      return NextResponse.json({ error: "type is required" }, { status: 400 });
    }
    if (!["text", "image"].includes(type)) {
      return NextResponse.json({ error: "type must be one of: text, image" }, { status: 400 });
    }

    // ── Text Moderation ──
    if (type === "text") {
      if (!isNonEmptyString(text)) {
        return NextResponse.json({ error: "text is required for text moderation" }, { status: 400 });
      }
      if (typeof text !== "string" || text.length > 5000) {
        return NextResponse.json({ error: "text must be a string with maximum 5000 characters" }, { status: 400 });
      }

      const sanitizedText = sanitizeString(text, 5000);
      const lower = sanitizedText.toLowerCase().trim();

      // Too short
      if (lower.length < 5) {
        return NextResponse.json({
          safe: false,
          reason: "Review too short — add more detail",
          category: "irrelevant",
        });
      }

      // Obvious spam patterns
      const spamPatterns = /\b(buy now|click here|www\.|\.com|crypto|bitcoin|earn money|free gift|lottery|winner)\b/i;
      if (spamPatterns.test(sanitizedText)) {
        return NextResponse.json({
          safe: false,
          reason: "Looks like spam or promotional content",
          category: "spam",
        });
      }

      // AI text moderation
      const result = await callTextModel(TEXT_MOD_PROMPT, `Review text: "${sanitizedText}"`);
      if (result) return NextResponse.json(result);

      // Fallback: reject if AI unavailable (fail-closed for safety)
      return NextResponse.json({ safe: false, reason: "Content moderation temporarily unavailable. Please try again in a moment.", category: "pending_review" });
    }

    // ── Image Moderation ──
    if (type === "image") {
      // Validate fileSize type
      if (fileSize !== undefined && typeof fileSize !== "number") {
        return NextResponse.json({ error: "fileSize must be a number" }, { status: 400 });
      }
      // Basic validation first
      if (fileSize && fileSize < 10000) {
        return NextResponse.json({ safe: false, reason: "File too small — likely not a real photo", category: "low_quality" });
      }
      if (fileSize && fileSize > 10 * 1024 * 1024) {
        return NextResponse.json({ safe: false, reason: "File too large — max 10MB", category: "low_quality" });
      }

      const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/heic", "image/heif"];
      if (fileType && !allowedTypes.includes(fileType.toLowerCase())) {
        return NextResponse.json({ safe: false, reason: `Invalid file type: ${fileType}`, category: "irrelevant" });
      }

      // Suspicious filenames
      if (fileName) {
        if (typeof fileName !== "string" || fileName.length > 500) {
          return NextResponse.json({ error: "Invalid fileName" }, { status: 400 });
        }
        const sanitizedFileName = sanitizeString(fileName, 500);
        const suspiciousPatterns = /\b(nsfw|xxx|nude|sexy|porn|adult)\b/i;
        if (suspiciousPatterns.test(sanitizedFileName)) {
          return NextResponse.json({ safe: false, reason: "Suspicious filename detected", category: "nsfw" });
        }
      }

      // Real image analysis with MiniMax VL-01 vision model
      if (imageBase64) {
        if (typeof imageBase64 !== "string") {
          return NextResponse.json({ error: "imageBase64 must be a string" }, { status: 400 });
        }
        const result = await callVisionModel(IMAGE_MOD_PROMPT, imageBase64);
        if (result) return NextResponse.json(result);
      }

      // Fallback: allow if no image data or AI unavailable
      return NextResponse.json({ safe: true, reason: "", category: "clean" });
    }

    return NextResponse.json({ error: "Specify type: 'text' or 'image'" }, { status: 400 });
  } catch (error) {
    console.error("Moderation route error:", error);
    return NextResponse.json({ safe: true, reason: "", category: "clean" });
  }
}
