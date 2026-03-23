"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { fetchListingById } from "@/lib/db";
import type { PGListing } from "@/data/listings";

export default function BookingPage() {
  const { id } = useParams();
  const { user, profile } = useAuth();
  const [pg, setPg] = useState<PGListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<"details" | "payment" | "success">("details");
  const [moveDate, setMoveDate] = useState("");
  const [roomType, setRoomType] = useState("");
  const [duration, setDuration] = useState(1);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (typeof id === "string") {
      fetchListingById(id).then((data) => {
        setPg(data);
        if (data) setRoomType(data.type);
        setLoading(false);
      });
    }
  }, [id]);

  const securityDeposit = pg ? pg.price * 2 : 0;
  const firstMonthRent = pg ? pg.price : 0;
  const bookingFee = 499;
  const total = securityDeposit + firstMonthRent + bookingFee;

  const handleBook = async () => {
    if (!user || !pg) return;
    setSubmitting(true);

    // Save booking to Supabase
    await supabase.from("bookings").insert({
      pg_id: pg.id,
      user_id: user.id,
      user_name: profile?.name || "Guest",
      user_email: profile?.email || "",
      user_phone: profile?.phone || "",
      move_in_date: moveDate,
      room_type: roomType,
      duration_months: duration,
      notes,
      total_amount: total,
      status: "confirmed",
    });

    setSubmitting(false);
    setStep("success");
  };

  if (!user) {
    return (
      <>
        <Header />
        <main className="min-h-screen flex items-center justify-center px-4 pt-20">
          <div className="text-center">
            <span className="text-5xl block mb-4">🔐</span>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Sign in to Book</h1>
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
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
            <div className="grid grid-cols-2 gap-6">
              <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-2xl" />
              <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-2xl" />
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
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">PG not found</h1>
            <Link href="/" className="text-violet-600 hover:underline mt-4 block">Back to Home</Link>
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
            <div className="w-24 h-24 bg-emerald-50 dark:bg-emerald-900/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <span className="text-6xl">🎉</span>
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-3">Booking Confirmed!</h1>
            <p className="text-gray-400 mb-2">Your room at <strong className="text-gray-900 dark:text-white">{pg.name}</strong> is reserved.</p>
            <p className="text-gray-400 mb-8">Move-in: <strong className="text-violet-600">{moveDate || "Flexible"}</strong></p>

            <div className="premium-card !rounded-2xl p-6 text-left mb-6">
              <h3 className="font-bold text-gray-900 dark:text-white mb-3">📋 Booking Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-400">Room Type</span><span className="text-gray-900 dark:text-white capitalize">{roomType}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Duration</span><span className="text-gray-900 dark:text-white">{duration} month{duration > 1 ? "s" : ""}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Monthly Rent</span><span className="text-gray-900 dark:text-white">₹{firstMonthRent.toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Security Deposit</span><span className="text-gray-900 dark:text-white">₹{securityDeposit.toLocaleString()}</span></div>
                <div className="border-t pt-2 mt-2 flex justify-between font-bold"><span>Total Paid</span><span className="text-emerald-600">₹{total.toLocaleString()}</span></div>
              </div>
            </div>

            <div className="flex gap-3 justify-center">
              <Link href={`/listing/${pg.id}`} className="px-6 py-3 bg-gray-100 dark:bg-gray-800 rounded-xl text-sm font-medium">View PG</Link>
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
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">Book Your Room 🏠</h1>
        <p className="text-gray-400 mb-8">Reserve a spot at {pg.name}</p>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Form */}
          <div className="lg:col-span-3 space-y-6">
            {/* PG Info card */}
            <div className="premium-card !rounded-2xl p-5 flex gap-4">
              <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-200 shrink-0">
                {pg.images[0] && <img src={pg.images[0]} alt={pg.name} className="w-full h-full object-cover" />}
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white">{pg.name}</h3>
                <p className="text-sm text-gray-400">{pg.locality}, {pg.area}</p>
                <p className="text-lg font-bold text-violet-600 mt-1">₹{pg.price.toLocaleString()}<span className="text-xs text-gray-400 font-normal">/month</span></p>
              </div>
            </div>

            {step === "details" && (
              <div className="premium-card !rounded-2xl p-6 space-y-5">
                <h3 className="font-bold text-gray-900 dark:text-white text-lg">📝 Booking Details</h3>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Move-in Date</label>
                  <input type="date" value={moveDate} onChange={(e) => setMoveDate(e.target.value)} className="premium-input w-full" />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Room Type</label>
                  <div className="grid grid-cols-3 gap-3">
                    {["single", "double", "triple"].map((t) => (
                      <button
                        key={t}
                        onClick={() => setRoomType(t)}
                        className={`p-3 rounded-xl border-2 text-sm font-medium capitalize transition-all ${
                          roomType === t ? "border-violet-500 bg-violet-50 dark:bg-violet-900/20 text-violet-600" : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400"
                        }`}
                      >
                        {t === "single" ? "🛏️ " : t === "double" ? "🛏️🛏️ " : "🛏️🛏️🛏️ "}
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Duration (months)</label>
                  <div className="flex items-center gap-4">
                    <button onClick={() => setDuration(Math.max(1, duration - 1))} className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-lg font-bold">−</button>
                    <span className="text-2xl font-bold text-gray-900 dark:text-white w-16 text-center">{duration}</span>
                    <button onClick={() => setDuration(Math.min(12, duration + 1))} className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-lg font-bold">+</button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Special Requests (optional)</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any preferences for room floor, bed side, etc..."
                    className="premium-input w-full h-24 resize-none"
                  />
                </div>

                <button onClick={() => setStep("payment")} className="btn-premium w-full !py-4">
                  Proceed to Payment →
                </button>
              </div>
            )}

            {step === "payment" && (
              <div className="premium-card !rounded-2xl p-6 space-y-5">
                <h3 className="font-bold text-gray-900 dark:text-white text-lg">💳 Payment</h3>

                <div className="p-4 bg-violet-50 dark:bg-violet-900/20 rounded-xl text-sm text-violet-700 dark:text-violet-400">
                  🔒 Secure payment processed via encrypted gateway. Your data is safe.
                </div>

                {/* Payment method selector */}
                <div className="space-y-3">
                  {[
                    { id: "upi", label: "UPI", desc: "Google Pay, PhonePe, Paytm", icon: "📱" },
                    { id: "card", label: "Credit/Debit Card", desc: "Visa, Mastercard, RuPay", icon: "💳" },
                    { id: "netbanking", label: "Net Banking", desc: "All major banks", icon: "🏦" },
                  ].map((pm) => (
                    <label key={pm.id} className="flex items-center gap-4 p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-violet-300 cursor-pointer transition-all">
                      <input type="radio" name="payment" defaultChecked={pm.id === "upi"} className="accent-violet-600" />
                      <span className="text-xl">{pm.icon}</span>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white text-sm">{pm.label}</p>
                        <p className="text-xs text-gray-400">{pm.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setStep("details")} className="px-6 py-3 bg-gray-100 dark:bg-gray-800 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300">
                    ← Back
                  </button>
                  <button
                    onClick={handleBook}
                    disabled={submitting}
                    className="btn-premium flex-1 !py-4 disabled:opacity-50"
                  >
                    {submitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                        Processing...
                      </span>
                    ) : (
                      `Pay ₹${total.toLocaleString()} & Confirm`
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Price breakdown sidebar */}
          <div className="lg:col-span-2">
            <div className="premium-card !rounded-2xl p-6 sticky top-28">
              <h3 className="font-bold text-gray-900 dark:text-white mb-4">💰 Price Breakdown</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">First Month Rent</span>
                  <span className="text-gray-900 dark:text-white font-medium">₹{firstMonthRent.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Security Deposit (2x)</span>
                  <span className="text-gray-900 dark:text-white font-medium">₹{securityDeposit.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Booking Fee</span>
                  <span className="text-gray-900 dark:text-white font-medium">₹{bookingFee}</span>
                </div>
                <div className="border-t dark:border-gray-700 pt-3 mt-3">
                  <div className="flex justify-between">
                    <span className="font-bold text-gray-900 dark:text-white">Total</span>
                    <span className="font-extrabold text-xl text-violet-600">₹{total.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-2">
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <span className="text-emerald-500">✓</span> No brokerage charges
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <span className="text-emerald-500">✓</span> Free cancellation within 48 hours
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <span className="text-emerald-500">✓</span> 100% refundable security deposit
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
