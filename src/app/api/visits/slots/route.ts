import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

// GET /api/visits/slots - Get available visit slots
export async function GET(req: NextRequest) {
  const limited = rateLimit(getClientIp(req), "visits", 30);
  if (limited) return limited;

  const { searchParams } = req.nextUrl;
  const pgId = searchParams.get("pgId");
  const date = searchParams.get("date");

  try {
    let query = supabase
      .from("visit_slots")
      .select("*")
      .eq("is_available", true)
      .gte("slot_date", new Date().toISOString().split("T")[0])
      .order("slot_date", { ascending: true })
      .order("slot_time", { ascending: true });

    if (pgId) {
      query = query.eq("pg_id", pgId);
    }

    if (date) {
      query = query.eq("slot_date", date);
    }

    const { data: slots, error } = await query;

    if (error) {
      console.error("Get slots error:", error);
      return NextResponse.json({ error: "Failed to fetch slots" }, { status: 500 });
    }

    // Group by date
    const slotsByDate: Record<string, typeof slots> = {};
    slots?.forEach((slot) => {
      if (!slotsByDate[slot.slot_date]) slotsByDate[slot.slot_date] = [];
      slotsByDate[slot.slot_date].push(slot);
    });

    return NextResponse.json({
      slots: slots || [],
      slotsByDate,
      count: slots?.length || 0,
    });
  } catch (error) {
    console.error("Get slots error:", error);
    return NextResponse.json({ error: "Failed to fetch slots" }, { status: 500 });
  }
}

// POST /api/visits/slots - Create or book a visit slot
export async function POST(req: NextRequest) {
  const limited = rateLimit(getClientIp(req), "visits", 20);
  if (limited) return limited;

  try {
    const body = await req.json();
    const { action, ...data } = body;

    if (action === "create") {
      // PG owner creating slots
      const { pgId, slots } = data;
      const { searchParams } = req.nextUrl;
      const userId = searchParams.get("userId");

      if (!pgId || !slots || !Array.isArray(slots)) {
        return NextResponse.json({ error: "Invalid data" }, { status: 400 });
      }

      // Verify ownership (simplified - in production check against listings table)
      const { data: listing, error: listingError } = await supabase
        .from("listings")
        .select("owner_id")
        .eq("id", pgId)
        .single();

      if (listingError || !listing) {
        return NextResponse.json({ error: "Listing not found" }, { status: 404 });
      }

      // Insert slots
      const slotRecords = slots.map((s: { date: string; time: string; maxVisitors?: number; notes?: string }) => ({
        pg_id: pgId,
        slot_date: s.date,
        slot_time: s.time,
        max_visitors: s.maxVisitors || 5,
        is_available: true,
        notes: s.notes || null,
      }));

      const { error } = await supabase
        .from("visit_slots")
        .upsert(slotRecords, { onConflict: 'pg_id,slot_date,slot_time' });

      if (error) {
        console.error("Create slots error:", error);
        return NextResponse.json({ error: "Failed to create slots" }, { status: 500 });
      }

      return NextResponse.json({ success: true, created: slotRecords.length });
    }

    if (action === "book") {
      // User booking a slot
      const { pgId, slotId, visitorName, visitorPhone, visitorEmail, visitDate, visitTime } = data;

      if (!pgId || !slotId || !visitorName || !visitorPhone || !visitDate || !visitTime) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
      }

      // Check slot availability
      const { data: slot, error: slotError } = await supabase
        .from("visit_slots")
        .select("*")
        .eq("id", slotId)
        .eq("is_available", true)
        .single();

      if (slotError || !slot) {
        return NextResponse.json({ error: "Slot not available" }, { status: 409 });
      }

      if (slot.current_visitors >= slot.max_visitors) {
        return NextResponse.json({ error: "Slot is full" }, { status: 409 });
      }

      // Create scheduled visit
      const { data: visit, error: visitError } = await supabase
        .from("scheduled_visits")
        .insert({
          pg_id: pgId,
          slot_id: slotId,
          visit_date: visitDate,
          visit_time: visitTime,
          visitor_name: visitorName,
          visitor_phone: visitorPhone,
          visitor_email: visitorEmail || null,
          status: 'scheduled',
        })
        .select()
        .single();

      if (visitError) {
        console.error("Book visit error:", visitError);
        return NextResponse.json({ error: "Failed to book visit" }, { status: 500 });
      }

      // Update slot visitor count
      await supabase
        .from("visit_slots")
        .update({
          current_visitors: slot.current_visitors + 1,
          is_available: slot.current_visitors + 1 < slot.max_visitors,
        })
        .eq("id", slotId);

      return NextResponse.json({
        success: true,
        visit: {
          id: visit.id,
          visitDate: visit.visit_date,
          visitTime: visit.visit_time,
          status: visit.status,
        },
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Visit slot error:", error);
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
}

// PUT /api/visits/slots - Update slot (cancel booking, etc.)
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, visitId, slotId, ...data } = body;

    if (action === "cancel") {
      // Cancel a scheduled visit
      const { error } = await supabase
        .from("scheduled_visits")
        .update({
          status: 'cancelled',
          updated_at: new Date().toISOString(),
        })
        .eq("id", visitId);

      if (error) {
        console.error("Cancel visit error:", error);
        return NextResponse.json({ error: "Failed to cancel visit" }, { status: 500 });
      }

      // Update slot visitor count
      if (slotId) {
        const { data: slot } = await supabase
          .from("visit_slots")
          .select("current_visitors, max_visitors")
          .eq("id", slotId)
          .single();

        if (slot) {
          await supabase
            .from("visit_slots")
            .update({
              current_visitors: Math.max(0, slot.current_visitors - 1),
              is_available: true,
            })
            .eq("id", slotId);
        }
      }

      return NextResponse.json({ success: true });
    }

    if (action === "complete") {
      // Mark visit as completed
      const { feedback, rating } = data;

      const { error } = await supabase
        .from("scheduled_visits")
        .update({
          status: 'completed',
          feedback: feedback || null,
          rating: rating || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", visitId);

      if (error) {
        console.error("Complete visit error:", error);
        return NextResponse.json({ error: "Failed to update visit" }, { status: 500 });
      }

      return NextResponse.json({ success: true });
    }

    if (action === "reschedule") {
      // Reschedule to a new slot
      const { newDate, newTime, newSlotId } = data;

      const { error } = await supabase
        .from("scheduled_visits")
        .update({
          visit_date: newDate,
          visit_time: newTime,
          slot_id: newSlotId,
          updated_at: new Date().toISOString(),
        })
        .eq("id", visitId);

      if (error) {
        console.error("Reschedule visit error:", error);
        return NextResponse.json({ error: "Failed to reschedule" }, { status: 500 });
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Update slot error:", error);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}
