"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import { useAuth } from "@/lib/auth";
import { fetchListingById } from "@/lib/db";
import type { PGListing } from "@/data/listings";
import { authFetch } from "@/lib/auth-fetch";

export default function BookingPage() {
  const { id } = useParams();
  const { user, profile } = useAuth();
  const [pg, setPg] = useState<PGListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<"details" | "success">("details");
  const [moveDate, setMoveDate] = useState("");
  const [roomType, setRoomType] = useState("");
  const [duration, setDuration] = useState(1);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (typeof id === "string") {
      fetchListingById(id).then((data) => {
        setPg(data);
        if (data) setRoomType(data.type);
        setLoading(false);
      });
    }
  }, [id]);

  const handleBook = async () => {
    if (!user || !pg) return;
    if (!moveDate) {
      setError("Please select a move-in date");
      return;
    }
    setError("");
    setSubmitting(true);

    try {
      const res = await authFetch("/api/booking", {
        method: "POST",
        body: JSON.stringify({
          pg_id: pg.id,
          pg_name: pg.name,
          pg_area: pg.area,
          pg_price: pg.price,
          user_name: profile?.name || "Guest",
          user_email: profile?.email || "",
          user_phone: profile?.phone || "",
          move_in_date: moveDate,
          room_type: roomType,
          duration_months: duration,
          notes,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setStep("success");
      } else {
        setError(data.error || "Something went wrong. Please try again.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    }
    setSubmitting(false);
  };

  if (!user) {
    return (
      <>
        <Header />
        <main className="min-h-screen flex items-center justify-center px-4 pt-20">
          <div className="text-center">
            <span className="text-5xl block mb-4">🔐</span>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">Sign in to Book</h1>
            <p className="text-gray-400 mb-6">Create an account to book PG rooms</p>
            <Link href="/login" className="btn-premium">Sign In</Link>
          </div>
        </main>
      </>
    );
  }

  if (loading) {
    return (
      <>
        <Header />
        <main className="max-w-4xl mx-auto px-4 pt-28 pb-16">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3" />
            <div className="grid grid-cols-2 gap-6">
              <div className="h-64 bg-gray-200 rounded-2xl" />
              <div className="h-64 bg-gray-200 rounded-2xl" />
            </div>
          </div>
        </main>
      </>
    );
  }

  if (!pg) {
    return (
      <>
        <Header />
        <main className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <span className="text-5xl block mb-4">😕</span>
            <h1 className="text-xl font-bold text-gray-900">PG not found</h1>
            <Link href="/" className="text-[#1a1a1a] hover:underline mt-4 block">Back to Home</Link>
          </div>
        </main>
      </>
    );
  }

  if (step === "success") {
    return (
      <>
        <Header />
        <main className="min-h-screen flex items-center justify-center px-4 pt-20">
          <div className="text-center max-w-md">
            <div className="w-24 h-24 bg-emerald-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <span className="text-6xl">📩</span>
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900 mb-3">Booking Request Sent!</h1>
            <p className="text-gray-500 mb-2">Your request for <strong className="text-gray-900">{pg.name}</strong> has been sent to the owner.</p>
            <p className="text-gray-400 text-sm mb-8">The owner will review and accept/reject your request. You&apos;ll be notified once they respond. Payment will be made directly at the PG.</p>

            <div className="premium-card !rounded-2xl p-6 text-left mb-6">
              <h3 className="font-bold text-gray-900 mb-3">📋 Request Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-400">PG Name</span><span className="text-gray-900 font-medium">{pg.name}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Move-in Date</span><span className="text-gray-900 font-medium">{moveDate}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Room Type</span><span className="text-gray-900 capitalize font-medium">{roomType}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Duration</span><span className="text-gray-900 font-medium">{duration} month{duration > 1 ? "s" : ""}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Monthly Rent</span><span className="text-gray-900 font-medium">₹{pg.price.toLocaleString()}</span></div>
                <div className="border-t pt-2 mt-2">
                  <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 rounded-lg p-2">
                    ⏳ Status: <strong>Pending owner approval</strong>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-center">
              <Link href={`/listing/${pg.id}`} className="px-6 py-3 bg-gray-100 rounded-xl text-sm font-medium">View PG</Link>
              <Link href="/" className="btn-premium !py-3 !px-6 !text-sm">Browse More</Link>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Book Your Room 🏠</h1>
        <p className="text-gray-400 mb-8">Send a booking request to {pg.name}</p>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Form */}
          <div className="lg:col-span-3 space-y-6">
            {/* PG Info card */}
            <div className="premium-card !rounded-2xl p-5 flex gap-4">
              <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-200 shrink-0">
                {pg.images[0] && <img src={pg.images[0]} alt={pg.name} className="w-full h-full object-cover" />}
              </div>
              <div>
                <h3 className="font-bold text-gray-900">{pg.name}</h3>
                <p className="text-sm text-gray-400">{pg.locality}, {pg.area}</p>
                <p className="text-lg font-bold text-[#1a1a1a] mt-1">₹{pg.price.toLocaleString()}<span className="text-xs text-gray-400 font-normal">/month</span></p>
              </div>
            </div>

            <div className="premium-card !rounded-2xl p-6 space-y-5">
              <h3 className="font-bold text-gray-900 text-lg">📝 Booking Details</h3>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Move-in Date *</label>
                <input type="date" value={moveDate} onChange={(e) => setMoveDate(e.target.value)} className="premium-input w-full" min={new Date().toISOString().split("T")[0]} />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Room Type</label>
                <div className="grid grid-cols-3 gap-3">
                  {["single", "double", "triple"].map((t) => (
                    <button
                      key={t}
                      onClick={() => setRoomType(t)}
                      className={`p-3 rounded-xl border-2 text-sm font-medium capitalize transition-all ${
                        roomType === t ? "border-[#1B1C15] bg-gray-100 text-[#1a1a1a]" : "border-gray-200 text-gray-600"
                      }`}
                    >
                      {t === "single" ? "🛏️ " : t === "double" ? "🛏️🛏️ " : "🛏️🛏️🛏️ "}
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Duration (months)</label>
                <div className="flex items-center gap-4">
                  <button onClick={() => setDuration(Math.max(1, duration - 1))} className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-lg font-bold">−</button>
                  <span className="text-2xl font-bold text-gray-900 w-16 text-center">{duration}</span>
                  <button onClick={() => setDuration(Math.min(12, duration + 1))} className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-lg font-bold">+</button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Message to Owner (optional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Introduce yourself, any preferences for room floor, bed side, etc..."
                  className="premium-input w-full h-24 resize-none"
                />
              </div>

              {error && (
                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl">
                  {error}
                </div>
              )}

              <button
                onClick={handleBook}
                disabled={submitting}
                className="btn-premium w-full !py-4 disabled:opacity-50"
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                    Sending Request...
                  </span>
                ) : (
                  "Send Booking Request 📩"
                )}
              </button>
            </div>
          </div>

          {/* Info sidebar */}
          <div className="lg:col-span-2">
            <div className="premium-card !rounded-2xl p-6 sticky top-28">
              <h3 className="font-bold text-gray-900 mb-4">ℹ️ How it works</h3>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-sm font-bold text-[#1a1a1a] shrink-0">1</div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Send Request</p>
                    <p className="text-xs text-gray-400">Your booking request is sent to the PG owner</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-sm font-bold text-[#1a1a1a] shrink-0">2</div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Owner Reviews</p>
                    <p className="text-xs text-gray-400">Owner accepts or rejects based on availability</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-sm font-bold text-[#1a1a1a] shrink-0">3</div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Visit & Move In</p>
                    <p className="text-xs text-gray-400">Visit the PG, pay directly to owner, and move in!</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-2">
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <span className="text-emerald-500">✓</span> Zero brokerage
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <span className="text-emerald-500">✓</span> Pay directly at PG — no online payment
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <span className="text-emerald-500">✓</span> No room blocked until you move in
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <span className="text-emerald-500">✓</span> Free to cancel anytime before move-in
                </div>
              </div>

              <div className="mt-6 p-3 bg-gray-100 rounded-xl">
                <p className="text-xs text-[#1a1a1a]">
                  <strong>💡 Tip:</strong> Include your phone number and a brief introduction in your message to increase your chances of approval!
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
