"use client";

import { useState } from "react";

interface VirtualTourBookingProps {
  pgId: string;
  pgName: string;
  onBooked?: () => void;
}

const TIME_SLOTS = [
  "09:00 AM", "10:00 AM", "11:00 AM",
  "12:00 PM", "02:00 PM", "03:00 PM",
  "04:00 PM", "05:00 PM", "06:00 PM",
];

const TOUR_TYPES = [
  { id: "video_call", label: "Video Call Tour", emoji: "📹", desc: "Live video walkthrough via WhatsApp/Google Meet" },
  { id: "360_view", label: "360° Virtual Tour", emoji: "🕶️", desc: "Interactive panoramic view of all rooms" },
  { id: "photos", label: "Detailed Photo Tour", emoji: "📸", desc: "Curated photo gallery with room details" },
];

export default function VirtualTourBooking({ pgId, pgName, onBooked }: VirtualTourBookingProps) {
  const [step, setStep] = useState<"type" | "date" | "confirm">("type");
  const [tourType, setTourType] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [booked, setBooked] = useState(false);

  // Generate next 7 days
  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i + 1);
    return {
      value: d.toISOString().split("T")[0],
      label: d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" }),
    };
  });

  const handleBook = async () => {
    if (!tourType || !selectedDate || !selectedSlot || !phone) return;
    setSubmitting(true);
    
    // Simulate API call
    await new Promise(r => setTimeout(r, 1200));
    
    setBooked(true);
    setSubmitting(false);
    onBooked?.();
  };

  if (booked) {
    return (
      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-6 text-center">
        <div className="text-5xl mb-3">🎉</div>
        <h3 className="text-lg font-bold text-emerald-900 mb-2">Virtual Tour Booked!</h3>
        <p className="text-sm text-emerald-700 mb-3">
          Your {TOUR_TYPES.find(t => t.id === tourType)?.label} for <strong>{pgName}</strong> is confirmed.
        </p>
        <p className="text-sm text-emerald-600">
          📅 {dates.find(d => d.value === selectedDate)?.label} at {selectedSlot}
        </p>
        <p className="text-sm text-emerald-600 mt-1">
          📱 We'll send a link to <strong>{phone}</strong>
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[#F5F0E8] border border-black/8 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">🎥</span>
        <div>
          <h3 className="text-base font-bold text-[#1a1a1a]">Book a Virtual Tour</h3>
          <p className="text-xs text-[#888]">No physical visit needed — explore from anywhere</p>
        </div>
      </div>

      {/* Progress steps */}
      <div className="flex items-center gap-1 mb-5">
        {["type", "date", "confirm"].map((s, i) => (
          <div key={s} className="flex items-center gap-1">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
              step === s ? "bg-[#1a1a1a] text-white" :
              (s === "type" && (step === "date" || step === "confirm")) || (s === "date" && step === "confirm")
                ? "bg-emerald-100 text-emerald-700" : "bg-[#EDE8DE] text-[#999]"
            }`}>
              {i + 1}
            </div>
            {i < 2 && <div className={`w-8 h-0.5 ${step !== "type" && s !== "type" ? "bg-emerald-300" : "bg-[#d4c9a8]"}`} />}
          </div>
        ))}
      </div>

      {/* Step 1: Tour type */}
      {step === "type" && (
        <div className="space-y-3">
          {TOUR_TYPES.map((type) => (
            <button
              key={type.id}
              onClick={() => { setTourType(type.id); setStep("date"); }}
              className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                tourType === type.id
                  ? "border-[#1a1a1a] bg-[#1a1a1a]/5"
                  : "border-black/5 hover:border-black/8 bg-[#FFFDF9]"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{type.emoji}</span>
                <div>
                  <p className="text-sm font-bold text-[#1a1a1a]">{type.label}</p>
                  <p className="text-xs text-[#888]">{type.desc}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Step 2: Date & time */}
      {step === "date" && (
        <div className="space-y-4">
          <div>
            <p className="text-xs font-semibold text-[#888] uppercase tracking-wider mb-2">Select Date</p>
            <div className="grid grid-cols-4 gap-2">
              {dates.map((d) => (
                <button
                  key={d.value}
                  onClick={() => setSelectedDate(d.value)}
                  className={`p-2 rounded-xl text-center text-xs font-semibold transition-all ${
                    selectedDate === d.value
                      ? "bg-[#1a1a1a] text-white"
                      : "bg-[#FFFDF9] border border-black/8 text-gray-700 hover:border-black/15"
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {selectedDate && (
            <div>
              <p className="text-xs font-semibold text-[#888] uppercase tracking-wider mb-2">Select Time</p>
              <div className="grid grid-cols-3 gap-2">
                {TIME_SLOTS.map((slot) => (
                  <button
                    key={slot}
                    onClick={() => setSelectedSlot(slot)}
                    className={`p-2 rounded-xl text-center text-xs font-semibold transition-all ${
                      selectedSlot === slot
                        ? "bg-[#1a1a1a] text-white"
                        : "bg-[#FFFDF9] border border-black/8 text-gray-700 hover:border-black/15"
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <p className="text-xs font-semibold text-[#888] uppercase tracking-wider mb-2">Your Phone Number</p>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98765 43210"
              className="w-full px-4 py-3 rounded-xl border border-black/8 bg-[#FFFDF9] text-sm focus:outline-none focus:border-[#1a1a1a] transition-colors"
            />
          </div>

          <button
            onClick={() => selectedDate && selectedSlot && phone && setStep("confirm")}
            disabled={!selectedDate || !selectedSlot || !phone}
            className="w-full py-3 rounded-xl bg-[#1a1a1a] text-white text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
          >
            Continue →
          </button>
        </div>
      )}

      {/* Step 3: Confirm */}
      {step === "confirm" && (
        <div className="space-y-4">
          <div className="bg-[#FFFDF9] rounded-xl p-4 border border-black/5">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-[#888]">Tour Type</span>
                <span className="font-semibold text-[#1a1a1a]">{TOUR_TYPES.find(t => t.id === tourType)?.label}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#888]">Date</span>
                <span className="font-semibold text-[#1a1a1a]">{dates.find(d => d.value === selectedDate)?.label}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#888]">Time</span>
                <span className="font-semibold text-[#1a1a1a]">{selectedSlot}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#888]">Phone</span>
                <span className="font-semibold text-[#1a1a1a]">{phone}</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleBook}
            disabled={submitting}
            className="w-full py-3 rounded-xl bg-[#1a1a1a] text-white text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-60 transition-opacity"
          >
            {submitting ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Booking...
              </>
            ) : "Confirm Virtual Tour"}
          </button>
        </div>
      )}
    </div>
  );
}
