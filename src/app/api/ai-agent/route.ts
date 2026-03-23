import { NextResponse } from "next/server";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { fetchListings } from "@/lib/db";
import type { PGListing } from "@/data/listings";
import { sanitizeString } from "@/lib/validate";
import { getAuthUserId, supabaseAdmin } from "@/lib/server-auth";
import { supabase } from "@/lib/supabase";

const MINIMAX_API_KEY = process.env.MINIMAX_API_KEY;
const API_URL = "https://api.minimax.io/v1/text/chatcompletion_v2";
const MODEL = "MiniMax-M2.7-highspeed";

const SYSTEM_PROMPT = `You are Castle AI — a smart PG finder assistant for Bangalore. You parse user intent and return structured JSON.

ALWAYS respond in this EXACT format — nothing else:
{"intent":"INTENT","text":"short 1-line reply","filters":{},"action":null}

INTENTS:
- "search" — user wants to find/browse PGs. Fill filters object.
- "action" — user wants to perform an action (save, book, call, callback, request stay, price alert, check status, etc.)
- "chat" — general question, no PG search or action needed.

FILTERS (for search intent):
{"area":"","maxPrice":0,"minPrice":0,"gender":"","amenities":[],"type":"","food":false,"wifi":false,"ac":false}

ACTIONS (for action intent, set action to one of):
{"type":"open_pg","pgName":"..."} — open a specific PG's listing page by name
{"type":"save","pgName":"..."}
{"type":"unsave","pgName":"..."}
{"type":"navigate","url":"ANY_APP_PAGE_URL"}
{"type":"call","pgName":"..."}
{"type":"whatsapp","pgName":"..."}
{"type":"callback","pgName":"...","phone":"USER_PHONE"}
{"type":"request_stay","pgName":"..."}
{"type":"remove_pg"}
{"type":"price_alert","area":"...","maxPrice":0}
{"type":"check_status"}
{"type":"my_profile"}
{"type":"compare","pgNames":["...","..."]}

APP PAGES (use these URLs for navigate action):
/ — Home page (all PG listings)
/saved — Saved/favorited PGs
/profile — User profile settings
/roommate-finder — Find roommates
/add-listing — List a new PG (for owners)
/owner-dashboard — Owner dashboard (manage listings)
/admin — Admin panel
/agent-dashboard — Agent dashboard
/login — Sign in page
/signup — Create account page
/contact — Contact us page
/faq — Frequently asked questions
/privacy — Privacy policy
/terms — Terms of service
/area/AREA_SLUG — PGs in specific area (e.g. /area/koramangala, /area/hsr-layout, /area/whitefield, /area/indiranagar, /area/btm-layout, /area/bellandur, /area/electronic-city, /area/marathahalli, /area/jp-nagar, /area/jayanagar)
/listing/PG_ID — Individual PG listing page
/booking/PG_ID — Book a specific PG
/chat/PG_ID — Chat with PG owner

IMPORTANT: When user says "open [PG name]", "show me [PG name]", "go to [PG name]", ALWAYS use open_pg action with the PG name — do NOT confuse PG names with area names!

EXAMPLES:
User: "Open Dharwad pg" → {"intent":"action","text":"Opening Dharwad PG 🏠","filters":{},"action":{"type":"open_pg","pgName":"Dharwad pg"}}
User: "Show me Zolo Haven" → {"intent":"action","text":"Opening Zolo Haven 🏠","filters":{},"action":{"type":"open_pg","pgName":"Zolo Haven"}}
User: "Go to GreenNest PG" → {"intent":"action","text":"Opening GreenNest PG 🏠","filters":{},"action":{"type":"open_pg","pgName":"GreenNest PG"}}
User: "Open the Sunrise pg page" → {"intent":"action","text":"Opening Sunrise PG 🏠","filters":{},"action":{"type":"open_pg","pgName":"Sunrise pg"}}
User: "PGs under 8000" → {"intent":"search","text":"Budget PGs under ₹8K 🏠","filters":{"maxPrice":8000},"action":null}
User: "Female PGs in Koramangala with food" → {"intent":"search","text":"Female PGs in Koramangala with meals 🍽️","filters":{"area":"Koramangala","gender":"female","food":true},"action":null}
User: "Show saved" → {"intent":"action","text":"Opening saved PGs ❤️","filters":{},"action":{"type":"navigate","url":"/saved"}}
User: "Go to home" → {"intent":"action","text":"Going home 🏠","filters":{},"action":{"type":"navigate","url":"/"}}
User: "Open FAQ" → {"intent":"action","text":"Opening FAQ page ❓","filters":{},"action":{"type":"navigate","url":"/faq"}}
User: "Take me to contact page" → {"intent":"action","text":"Opening contact page 📧","filters":{},"action":{"type":"navigate","url":"/contact"}}
User: "I want to list my PG" → {"intent":"action","text":"Opening listing form 📝","filters":{},"action":{"type":"navigate","url":"/add-listing"}}
User: "Open my dashboard" → {"intent":"action","text":"Opening owner dashboard 📊","filters":{},"action":{"type":"navigate","url":"/owner-dashboard"}}
User: "Show PGs in Koramangala area page" → {"intent":"action","text":"Opening Koramangala page 📍","filters":{},"action":{"type":"navigate","url":"/area/koramangala"}}
User: "Find roommates" → {"intent":"action","text":"Opening roommate finder 🤝","filters":{},"action":{"type":"navigate","url":"/roommate-finder"}}
User: "Privacy policy" → {"intent":"action","text":"Opening privacy policy 🔒","filters":{},"action":{"type":"navigate","url":"/privacy"}}
User: "Terms and conditions" → {"intent":"action","text":"Opening terms page 📄","filters":{},"action":{"type":"navigate","url":"/terms"}}
User: "Sign up" → {"intent":"action","text":"Opening sign up page ✨","filters":{},"action":{"type":"navigate","url":"/signup"}}
User: "Log in" → {"intent":"action","text":"Opening login page 🔐","filters":{},"action":{"type":"navigate","url":"/login"}}
User: "Call Zolo Haven owner" → {"intent":"action","text":"Calling Zolo Haven 📞","filters":{},"action":{"type":"call","pgName":"Zolo Haven"}}
User: "Request callback for Zolo Haven, my number is 9876543210" → {"intent":"action","text":"Requesting callback from Zolo Haven 📞","filters":{},"action":{"type":"callback","pgName":"Zolo Haven","phone":"9876543210"}}
User: "I want to stay at Nest PG" → {"intent":"action","text":"Sending stay request to Nest PG 🏠","filters":{},"action":{"type":"request_stay","pgName":"Nest PG"}}
User: "I stay in Indiranagar Luxe Stay" → {"intent":"action","text":"Sending stay request to Indiranagar Luxe Stay 🏠","filters":{},"action":{"type":"request_stay","pgName":"Indiranagar Luxe Stay"}}
User: "Mark as I stay there" (after mentioning a PG) → {"intent":"action","text":"Sending stay request 🏠","filters":{},"action":{"type":"request_stay","pgName":"PREVIOUSLY_MENTIONED_PG"}}
User: "Mark me as staying at Zolo Haven" → {"intent":"action","text":"Sending stay request to Zolo Haven 🏠","filters":{},"action":{"type":"request_stay","pgName":"Zolo Haven"}}
User: "Link me to this PG" → {"intent":"action","text":"Sending stay request 🏠","filters":{},"action":{"type":"request_stay","pgName":"PREVIOUSLY_MENTIONED_PG"}}
User: "Select this PG as my current stay" → {"intent":"action","text":"Sending stay request 🏠","filters":{},"action":{"type":"request_stay","pgName":"PREVIOUSLY_MENTIONED_PG"}}
User: "Alert me when PGs under 7000 in HSR" → {"intent":"action","text":"Price alert set for HSR Layout under ₹7K 🔔","filters":{},"action":{"type":"price_alert","area":"HSR Layout","maxPrice":7000}}
User: "What's my booking status?" → {"intent":"action","text":"Checking your status 📋","filters":{},"action":{"type":"check_status"}}
User: "Show my profile" → {"intent":"action","text":"Here's your profile 👤","filters":{},"action":{"type":"my_profile"}}
User: "Remove me from my current PG" → {"intent":"action","text":"Removing you from current PG 🏠","filters":{},"action":{"type":"remove_pg"}}
User: "What areas are good for IT workers?" → {"intent":"chat","text":"Whitefield, Bellandur & Electronic City — close to tech parks! 💻","filters":{},"action":null}
User: "Compare Zolo Haven and Nest PG" → {"intent":"action","text":"Comparing PGs for you 📊","filters":{},"action":{"type":"compare","pgNames":["Zolo Haven","Nest PG"]}}

RULES:
- ONLY output valid JSON, nothing else
- "text" must be 1 short sentence (max 20 words)
- For filters, only include fields user mentioned
- area values: Koramangala, HSR Layout, Indiranagar, Whitefield, BTM Layout, Bellandur, Electronic City, etc.
- gender: male, female, coed
- type: single, double, triple
- If user asks to do something that needs their PG name and doesn't specify one, ask them which PG
- For callback, if user doesn't provide phone number, ask for it
- IMPORTANT: When user says "I stay at X", "mark as I stay at X", "link me to X", "select X as my PG" → ALWAYS use request_stay action, NEVER navigate to profile
- IMPORTANT: When user references a PG from earlier in the conversation (like "mark as I stay there", "open it", "save it"), use the PG name from the conversation context
- IMPORTANT: You are ONLY a PG/housing assistant for Castle app. You must REFUSE to answer ANY question that is NOT related to PGs, paying guest accommodations, housing, roommates, or using the Castle app. If the user asks about anything else (general knowledge, news, history, science, coding, math, celebrities, countries, sports, etc.), politely decline and redirect them to PG-related topics. Example refusal: {"intent":"chat","text":"I'm Castle AI — I only help with PGs & housing in Bangalore! 🏠 Ask me about finding PGs, rooms, or roommates.","filters":{},"action":null}`;

type Message = {
  role: "system" | "user" | "assistant";
  content: string;
};

// Server-side PG filtering using live data
function filterPGs(allListings: PGListing[], filters: Record<string, unknown>): PGListing[] {
  let results = [...allListings];

  if (filters.area) {
    const area = (filters.area as string).toLowerCase().trim();
    // Try exact match first
    let areaResults = results.filter(pg => pg.area.toLowerCase().trim() === area);
    // Try substring match
    if (areaResults.length === 0) {
      areaResults = results.filter(pg =>
        pg.area.toLowerCase().includes(area) || area.includes(pg.area.toLowerCase())
      );
    }
    // Fuzzy match as last resort
    if (areaResults.length === 0) {
      const uniqueAreas = [...new Set(results.map(pg => pg.area))];
      const bestArea = uniqueAreas
        .map(a => ({ area: a, score: similarity(area, a.toLowerCase()) }))
        .sort((a, b) => b.score - a.score)[0];
      if (bestArea && bestArea.score >= 0.5) {
        areaResults = results.filter(pg => pg.area === bestArea.area);
      }
    }
    results = areaResults;
  }
  if (filters.maxPrice) {
    results = results.filter(pg => pg.price <= (filters.maxPrice as number));
  }
  if (filters.minPrice) {
    results = results.filter(pg => pg.price >= (filters.minPrice as number));
  }
  if (filters.gender) {
    const g = (filters.gender as string).toLowerCase();
    results = results.filter(pg => pg.gender === g || pg.gender === "coed");
  }
  if (filters.type) {
    results = results.filter(pg => pg.type === filters.type || pg.type === "any");
  }
  if (filters.food) results = results.filter(pg => pg.foodIncluded);
  if (filters.wifi) results = results.filter(pg => pg.wifiIncluded);
  if (filters.ac) results = results.filter(pg => pg.acAvailable);
  if (filters.amenities && Array.isArray(filters.amenities) && filters.amenities.length > 0) {
    results = results.filter(pg =>
      (filters.amenities as string[]).every(a =>
        pg.amenities.some(pa => pa.toLowerCase().includes(a.toLowerCase()))
      )
    );
  }

  results.sort((a, b) => b.rating - a.rating);
  return results.slice(0, 8);
}

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

// Similarity score (0 to 1, higher = more similar)
function similarity(a: string, b: string): number {
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 1;
  return 1 - levenshtein(a, b) / maxLen;
}

function findPGByName(allListings: PGListing[], name: string): PGListing | undefined {
  if (!name) return undefined;
  const lower = name.toLowerCase().trim();

  // 1. Exact substring match (strongest)
  const exactMatch = allListings.find(pg =>
    pg.name.toLowerCase().includes(lower) ||
    lower.includes(pg.name.toLowerCase().split(" ")[0])
  );
  if (exactMatch) return exactMatch;

  // 2. Fuzzy match — find best match by similarity
  let bestMatch: PGListing | undefined;
  let bestScore = 0;

  for (const pg of allListings) {
    const pgLower = pg.name.toLowerCase();

    // Compare full name similarity
    const fullScore = similarity(lower, pgLower);

    // Compare each word overlap (handles partial matches like "dharwd" → "dharwad")
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

    // Take the higher of both approaches
    const score = Math.max(fullScore, wordScore);

    if (score > bestScore) {
      bestScore = score;
      bestMatch = pg;
    }
  }

  // Only return if similarity is above threshold (0.55 = allows ~2-3 char typos)
  return bestScore >= 0.55 ? bestMatch : undefined;
}

export async function POST(req: Request) {
  const limited = rateLimit(getClientIp(req), "ai-agent", 15);
  if (limited) return limited;

  if (!MINIMAX_API_KEY) {
    return NextResponse.json({ error: "AI service not configured" }, { status: 500 });
  }

  try {
    const body = await req.json();
    const { messages, userId, userName, userEmail, userPhone } = body as {
      messages: Message[];
      userId?: string;
      userName?: string;
      userEmail?: string;
      userPhone?: string;
    };

    // Validate messages
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "messages must be a non-empty array" }, { status: 400 });
    }
    if (messages.length > 50) {
      return NextResponse.json({ error: "Too many messages" }, { status: 400 });
    }
    for (let i = 0; i < messages.length; i++) {
      const msg = messages[i];
      if (!msg.role || !["user", "assistant", "system"].includes(msg.role)) {
        return NextResponse.json({ error: `Invalid role at messages[${i}]` }, { status: 400 });
      }
      if (typeof msg.content !== "string" || msg.content.length > 2000) {
        return NextResponse.json({ error: `Invalid content at messages[${i}]` }, { status: 400 });
      }
      if (msg.role === "user") {
        messages[i].content = sanitizeString(msg.content, 2000);
      }
    }

    // Verify auth if userId provided
    let verifiedUserId: string | null = null;
    let userRole: string | null = null;
    if (userId) {
      verifiedUserId = await getAuthUserId(req);
      if (!verifiedUserId || verifiedUserId !== userId) {
        verifiedUserId = null;
      }
    }

    // Fetch user role early so we have it for all checks
    if (verifiedUserId) {
      const { data: roleData } = await supabaseAdmin
        .from("profiles")
        .select("role")
        .eq("id", verifiedUserId)
        .single();
      userRole = roleData?.role || "tenant";
    }

    // Fetch live listings from database
    const allListings = await fetchListings();

    const fullMessages: Message[] = [
      { role: "system", content: SYSTEM_PROMPT },
      ...messages,
    ];

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${MINIMAX_API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: fullMessages,
        temperature: 0.1,
        max_tokens: 512,
      }),
    });

    const data = await response.json();

    if (data.base_resp?.status_code && data.base_resp.status_code !== 0) {
      console.error("MiniMax error:", data.base_resp);
      return NextResponse.json({ error: data.base_resp.status_msg || "AI error" }, { status: 502 });
    }

    const rawReply = data.choices?.[0]?.message?.content || "";

    // Parse JSON response
    let parsed;
    try {
      const jsonStr = rawReply.replace(/```json\s*/g, "").replace(/```/g, "").trim();
      parsed = JSON.parse(jsonStr);
    } catch {
      const jsonMatch = rawReply.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try { parsed = JSON.parse(jsonMatch[0]); } catch {}
      }
    }

    if (!parsed) {
      return NextResponse.json({
        reply: rawReply.slice(0, 200),
        listings: [],
        action: null,
      });
    }

    let replyText = parsed.text || "Here you go! 🎯";
    let matchedListings: PGListing[] = [];
    let action = null;
    let actionResult = null;

    // ── SEARCH INTENT ──
    if (parsed.intent === "search" && parsed.filters) {
      matchedListings = filterPGs(allListings, parsed.filters);
      const count = matchedListings.length;
      if (count > 0) {
        replyText = replyText.replace(/\d+/, String(count));
        if (!/\d/.test(replyText)) replyText = `Found ${count} options! ${replyText}`;
      } else {
        replyText = "No PGs found matching your criteria. Try adjusting your filters! 🔍";
      }
    }

    // ── ACTION INTENT ──
    if (parsed.intent === "action" && parsed.action) {
      const act = parsed.action;

      switch (act.type) {
        case "navigate": {
          // Only allow internal URLs (prevent open redirect)
          const navUrl = String(act.url || "/");
          if (!navUrl.startsWith("/") || navUrl.startsWith("//")) {
            action = { action: "navigate", data: { url: "/" } };
            break;
          }

          // Role-based page access check
          const rolePages: Record<string, string> = {
            "/owner-dashboard": "owner",
            "/agent-dashboard": "agent",
            "/admin": "admin",
          };

          const requiredRole = rolePages[navUrl];
          if (requiredRole) {
            if (!verifiedUserId || !userRole) {
              replyText = "You need to sign in first to access that page 🔐";
              action = null;
              break;
            }
            if (userRole !== requiredRole && userRole !== "admin") {
              replyText = `Sorry, that page is only for ${requiredRole}s. Your account role is "${userRole}" 🚫`;
              action = null;
              break;
            }
          }

          action = { action: "navigate", data: { url: navUrl } };
          break;
        }

        case "open_pg": {
          const pg = findPGByName(allListings, act.pgName || "");
          if (pg) {
            action = { action: "navigate", data: { url: `/listing/${pg.id}` } };
            replyText = `Opening ${pg.name} 🏠`;
          } else {
            replyText = `Couldn't find a PG named "${act.pgName}". Try the exact name? 🤔`;
          }
          break;
        }

        case "save": {
          const pg = findPGByName(allListings, act.pgName || "");
          if (pg) action = { action: "save", data: { pgId: pg.id } };
          else replyText = "Couldn't find that PG. Could you check the name? 🤔";
          break;
        }

        case "unsave": {
          const pg = findPGByName(allListings, act.pgName || "");
          if (pg) action = { action: "unsave", data: { pgId: pg.id } };
          break;
        }

        case "call": {
          const pg = findPGByName(allListings, act.pgName || "");
          if (pg) action = { action: "call", data: { phone: pg.contactPhone, name: pg.contactName } };
          else replyText = "Couldn't find that PG. Could you check the name? 🤔";
          break;
        }

        case "whatsapp": {
          const pg = findPGByName(allListings, act.pgName || "");
          if (pg) action = { action: "whatsapp", data: { phone: pg.contactPhone, pgName: pg.name } };
          else replyText = "Couldn't find that PG. Could you check the name? 🤔";
          break;
        }

        case "callback": {
          const pg = findPGByName(allListings, act.pgName || "");
          const phone = act.phone || userPhone;
          if (!pg) {
            replyText = "Couldn't find that PG. Could you check the name? 🤔";
          } else if (!phone) {
            replyText = "Sure! What's your phone number so the owner can call you back? 📱";
          } else if (!verifiedUserId) {
            replyText = "Please sign in first so I can request a callback for you 🔐";
          } else {
            // Execute callback request
            const { error } = await supabase
              .from("callbacks")
              .insert({
                pg_id: pg.id,
                name: userName || "User",
                phone: phone,
              });
            if (!error) {
              replyText = `Callback requested! ${pg.contactName || "The owner"} of ${pg.name} will call you back soon 📞✅`;
              actionResult = { type: "callback_success", pgName: pg.name };
            } else {
              replyText = "Couldn't submit callback right now. Please try again! 😅";
            }
          }
          break;
        }

        case "request_stay": {
          const pg = findPGByName(allListings, act.pgName || "");
          if (!pg) {
            replyText = "Couldn't find that PG. Could you check the name? 🤔";
          } else if (!verifiedUserId) {
            replyText = "Please sign in first to send a stay request 🔐";
          } else {
            // Check if listing has an owner
            const { data: listing } = await supabaseAdmin
              .from("listings")
              .select("owner_id")
              .eq("id", pg.id)
              .single();

            if (!listing?.owner_id) {
              replyText = `${pg.name} doesn't have an owner registered yet. Try requesting a callback instead! 📞`;
            } else {
              // Check existing request
              const { data: existing } = await supabaseAdmin
                .from("resident_requests")
                .select("id, status")
                .eq("user_id", verifiedUserId)
                .eq("pg_id", pg.id)
                .neq("status", "rejected")
                .single();

              if (existing) {
                replyText = existing.status === "approved"
                  ? `You're already linked to ${pg.name}! 🏠✅`
                  : `Your request to ${pg.name} is already pending. The owner will review it soon! ⏳`;
              } else {
                const { error } = await supabaseAdmin
                  .from("resident_requests")
                  .insert({
                    user_id: verifiedUserId,
                    user_name: userName || "User",
                    user_email: userEmail || "",
                    pg_id: pg.id,
                    pg_name: pg.name,
                    owner_id: listing.owner_id,
                    status: "pending",
                  });
                if (!error) {
                  replyText = `Stay request sent to ${pg.name}! The owner will review it soon 📩✅`;
                  actionResult = { type: "request_stay_success", pgName: pg.name, pgId: pg.id };
                } else {
                  replyText = "Couldn't send the request right now. Try again! 😅";
                }
              }
            }
          }
          break;
        }

        case "remove_pg": {
          if (!verifiedUserId) {
            replyText = "Please sign in first 🔐";
          } else {
            const { data: profile } = await supabaseAdmin
              .from("profiles")
              .select("current_pg_id")
              .eq("id", verifiedUserId)
              .single();

            if (!profile?.current_pg_id) {
              replyText = "You're not linked to any PG right now 🏠";
            } else {
              // Needs user confirmation - don't auto-execute
              action = { action: "confirm_remove_pg", data: { currentPgId: profile.current_pg_id } };
              replyText = "Are you sure you want to remove yourself from your current PG? This can't be undone.";
            }
          }
          break;
        }

        case "price_alert": {
          const area = act.area;
          const maxPrice = act.maxPrice || 15000;
          if (!verifiedUserId || !userEmail) {
            replyText = "Please sign in with an email to set price alerts 🔐";
          } else if (!area) {
            replyText = "Which area should I set the alert for? 📍";
          } else {
            const { error } = await supabase
              .from("price_alerts")
              .insert({
                email: userEmail,
                area: area,
                max_price: maxPrice,
              });
            if (!error) {
              replyText = `Price alert set! I'll notify you when PGs under ₹${maxPrice.toLocaleString()} appear in ${area} 🔔✅`;
              actionResult = { type: "price_alert_success", area, maxPrice };
            } else {
              replyText = "Couldn't set the alert. Try again! 😅";
            }
          }
          break;
        }

        case "check_status": {
          if (!verifiedUserId) {
            replyText = "Please sign in to check your status 🔐";
          } else {
            // Get profile
            const { data: profile } = await supabaseAdmin
              .from("profiles")
              .select("name, current_pg_id, role")
              .eq("id", verifiedUserId)
              .single();

            // Get pending requests
            const { data: requests } = await supabaseAdmin
              .from("resident_requests")
              .select("pg_name, status, created_at")
              .eq("user_id", verifiedUserId)
              .order("created_at", { ascending: false })
              .limit(5);

            let statusText = "";
            if (profile?.current_pg_id) {
              const currentPg = allListings.find(l => l.id === profile.current_pg_id);
              statusText += `🏠 Current PG: ${currentPg?.name || "Unknown"}\n`;
            } else {
              statusText += "🏠 No current PG linked\n";
            }

            if (requests && requests.length > 0) {
              statusText += "\n📋 Recent requests:\n";
              for (const r of requests) {
                const icon = r.status === "approved" ? "✅" : r.status === "pending" ? "⏳" : "❌";
                statusText += `${icon} ${r.pg_name} — ${r.status}\n`;
              }
            }

            replyText = statusText.trim() || "No bookings or requests found.";
            actionResult = { type: "status_shown" };
          }
          break;
        }

        case "my_profile": {
          if (!verifiedUserId) {
            replyText = "Please sign in to view your profile 🔐";
          } else {
            const { data: profile } = await supabaseAdmin
              .from("profiles")
              .select("name, email, phone, role, current_pg_id")
              .eq("id", verifiedUserId)
              .single();

            if (profile) {
              let profileText = `👤 ${profile.name || "No name set"}\n`;
              profileText += `📧 ${profile.email || "No email"}\n`;
              profileText += `📱 ${profile.phone || "No phone"}\n`;
              profileText += `🏷️ Role: ${profile.role || "tenant"}\n`;
              if (profile.current_pg_id) {
                const pg = allListings.find(l => l.id === profile.current_pg_id);
                profileText += `🏠 Current PG: ${pg?.name || profile.current_pg_id}`;
              }
              replyText = profileText;
              action = { action: "navigate_optional", data: { url: "/profile", label: "Edit Profile" } };
            } else {
              replyText = "Couldn't load your profile. Try the profile page directly! 👤";
              action = { action: "navigate", data: { url: "/profile" } };
            }
          }
          break;
        }

        case "compare": {
          const pgNames = act.pgNames || [];
          if (pgNames.length < 2) {
            replyText = "Please name at least 2 PGs to compare 📊";
          } else {
            const foundPGs = pgNames
              .map((name: string) => findPGByName(allListings, name))
              .filter(Boolean) as PGListing[];
            if (foundPGs.length >= 2) {
              matchedListings = foundPGs;
              replyText = `Comparing ${foundPGs.map(p => p.name).join(" vs ")} 📊`;
              action = { action: "compare", data: { pgIds: foundPGs.map(p => p.id) } };
            } else {
              replyText = "Couldn't find all PGs. Check the names? 🤔";
            }
          }
          break;
        }

        default:
          break;
      }
    }

    return NextResponse.json({
      reply: replyText,
      listings: matchedListings,
      action,
      actionResult,
    });
  } catch (error) {
    console.error("AI Agent error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
