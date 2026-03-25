"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";

type ScheduleVisitProps = {
  pgId: string;
  pgName: string;
  pgArea: string;
  pgLocality: string;
  onClose: () => void;
};

export type VisitBooking = {
  id: string;
  pgId: string;
  pgName: string;
  pgArea: string;
  pgLocality: string;
  date: string;
  timeSlot: string;
  timeLabel: string;
  visitorName: string;
  visitorPhone: string;
  visitorEmail: string;
  notes: string;
  status: "upcoming" | "completed" | "cancelled";
  createdAt: string;
};

const TIME_SLOTS = [
  { id: "morning", label: "Morning", time: "10:00 AM - 12:00 PM", icon: "M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707" },
  { id: "afternoon", label: "Afternoon", time: "12:00 PM - 3:00 PM", icon: "M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" },
  { id: "evening", label: "Evening", time: "3:00 PM - 6:00 PM", icon: "M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" },
];

function getNext7Days(): { date: Date; label: string; dayName: string; isToday: boolean }[] {
  const days = [];
  const today = new Date();
  for (let i = 1; i <= 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const isToday = false;
    const dayName = d.toLocaleDateString("en-IN", { weekday: "short" });
    const label = d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
    days.push({ date: d, label, dayName, isToday });
  }
  return days;
}

function generateGoogleCalendarUrl(booking: VisitBooking): string {
  const timeMap: Record<string, { start: string; end: string }> = {
    morning: { start: "10:00", end: "12:00" },
    afternoon: { start: "12:00", end: "15:00" },
    evening: { start: "15:00", end: "18:00" },
  };
  const slot = timeMap[booking.timeSlot] || timeMap.morning;
  const dateStr = booking.date.replace(/-/g, "");
  const startTime = `${dateStr}T${slot.start.replace(":", "")}00`;
  const endTime = `${dateStr}T${slot.end.replace(":", "")}00`;
  const title = encodeURIComponent(`PG Visit - ${booking.pgName}`);
  const details = encodeURIComponent(`Visit to ${booking.pgName} at ${booking.pgLocality}, ${booking.pgArea}\n\nTime: ${booking.timeLabel}\nVisitor: ${booking.visitorName}\n${booking.notes ? `Notes: ${booking.notes}` : ""}`);
  const location = encodeURIComponent(`${booking.pgLocality}, ${booking.pgArea}, Bangalore`);
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startTime}/${endTime}&details=${details}&location=${location}`;
}

function generateWhatsAppUrl(booking: VisitBooking): string {
  const text = encodeURIComponent(
    `I've scheduled a visit to *${booking.pgName}* in ${booking.pgArea}\n\nDate: ${new Date(booking.date).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}\nTime: ${booking.timeLabel}\nLocation: ${booking.pgLocality}, ${booking.pgArea}\n\nBooked via Castle - castleliving.in`
  );
  return `https://wa.me/?text=${text}`;
}

export default function ScheduleVisit({ pgId, pgName, pgArea, pgLocality, onClose }: ScheduleVisitProps) {
  const { user, profile } = useAuth();
  const days = getNext7Days();
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedSlot, setSelectedSlot] = useState<string>("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [step, setStep] = useState<"form" | "confirmed">("form");
  const [booking, setBooking] = useState<VisitBooking | null>(null);
  const [showCheckmark, setShowCheckmark] = useState(false);

  useEffect(() => {
    if (profile) {
      setName(profile.name || "");
      setEmail(profile.email || "");
      setPhone(profile.phone || "");
    }
  }, [profile]);

  const handleSubmit = () => {
    if (!selectedDate || !selectedSlot || !name || !phone) return;
    const slot = TIME_SLOTS.find((s) => s.id === selectedSlot);
    const newBooking: VisitBooking = {
      id: `visit_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      pgId,
      pgName,
      pgArea,
      pgLocality,
      date: selectedDate,
      timeSlot: selectedSlot,
      timeLabel: slot ? `${slot.label} (${slot.time})` : selectedSlot,
      visitorName: name,
      visitorPhone: phone,
      visitorEmail: email,
      notes,
      status: "upcoming",
      createdAt: new Date().toISOString(),
    };
    // Save to localStorage
    const existing: VisitBooking[] = JSON.parse(localStorage.getItem("pg_visit_bookings") || "[]");
    existing.push(newBooking);
    localStorage.setItem("pg_visit_bookings", JSON.stringify(existing));
    setBooking(newBooking);
    setStep("confirmed");
    setTimeout(() => setShowCheckmark(true), 100);
  };

  const isFormValid = selectedDate && selectedSlot && name.trim() && phone.trim();

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative w-full sm:max-w-lg bg-[#FFFDF9] sm:rounded-3xl rounded-t-3xl shadow-2xl max-h-[90vh] overflow-y-auto animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-[#FFFDF9] sm:rounded-t-3xl rounded-t-3xl border-b border-black/5 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-lg font-bold text-[#1a1a1a]">
              {step === "form" ? "Schedule a Visit" : "Visit Confirmed!"}
            </h2>
            <p className="text-xs text-[#999] mt-0.5">{pgName}</p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-[#EDE8DE] flex items-center justify-center text-[#999] hover:text-[#666] hover:bg-[#d4c9a8] transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {step === "form" ? (
          <div className="p-6 space-y-6">
            {/* Date Selection */}
            <div>
              <label className="block text-sm font-semibold text-[#1a1a1a] mb-3">Pick a Date</label>
              <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
                {days.map((d) => {
                  const dateStr = d.date.toISOString().split("T")[0];
                  const isSelected = selectedDate === dateStr;
                  return (
                    <button
                      key={dateStr}
                      onClick={() => setSelectedDate(dateStr)}
                      className={`flex flex-col items-center min-w-[72px] px-3 py-3 rounded-2xl border-2 transition-all duration-200 shrink-0 ${
                        isSelected
                          ? "border-[#1a1a1a] bg-[#1a1a1a] text-white shadow-lg shadow-black/15 scale-[1.02]"
                          : "border-black/8 bg-[#FFFDF9] text-[#666] hover:border-black/15 hover:bg-[#F5F0E8]"
                      }`}
                    >
                      <span className={`text-[10px] font-semibold uppercase tracking-wider ${isSelected ? "text-white/70" : "text-[#999]"}`}>
                        {d.dayName}
                      </span>
                      <span className={`text-lg font-bold mt-0.5 ${isSelected ? "text-white" : "text-[#1a1a1a]"}`}>
                        {d.date.getDate()}
                      </span>
                      <span className={`text-[10px] font-medium ${isSelected ? "text-white/70" : "text-[#999]"}`}>
                        {d.date.toLocaleDateString("en-IN", { month: "short" })}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Time Slot Selection */}
            <div>
              <label className="block text-sm font-semibold text-[#1a1a1a] mb-3">Choose a Time Slot</label>
              <div className="grid grid-cols-3 gap-3">
                {TIME_SLOTS.map((slot) => {
                  const isSelected = selectedSlot === slot.id;
                  return (
                    <button
                      key={slot.id}
                      onClick={() => setSelectedSlot(slot.id)}
                      className={`relative flex flex-col items-center p-4 rounded-2xl border-2 transition-all duration-200 ${
                        isSelected
                          ? "border-[#1a1a1a] bg-[#EDE8DE] shadow-md"
                          : "border-black/8 bg-[#FFFDF9] hover:border-black/15 hover:bg-[#F5F0E8]"
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#1a1a1a] rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                      <svg
                        className={`w-5 h-5 mb-1.5 ${isSelected ? "text-[#1a1a1a]" : "text-[#999]"}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d={slot.icon} />
                      </svg>
                      <span className={`text-sm font-semibold ${isSelected ? "text-[#1a1a1a]" : "text-[#666]"}`}>
                        {slot.label}
                      </span>
                      <span className={`text-[10px] mt-0.5 ${isSelected ? "text-[#1a1a1a]/70" : "text-[#999]"}`}>
                        {slot.time}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Visitor Info */}
            <div>
              <label className="block text-sm font-semibold text-[#1a1a1a] mb-3">Your Details</label>
              <div className="space-y-3">
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#999]">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Full Name *"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-black/8 focus:border-[#1a1a1a] focus:ring-0 outline-none text-sm transition-colors"
                  />
                </div>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#999]">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                    </svg>
                  </div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Phone Number *"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-black/8 focus:border-[#1a1a1a] focus:ring-0 outline-none text-sm transition-colors"
                  />
                </div>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#999]">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                    </svg>
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email (optional)"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-black/8 focus:border-[#1a1a1a] focus:ring-0 outline-none text-sm transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-semibold text-[#1a1a1a] mb-2">
                Notes <span className="font-normal text-[#999]">(optional)</span>
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="Any specific questions or requests for the visit..."
                className="w-full px-4 py-3 rounded-xl border-2 border-black/8 focus:border-[#1a1a1a] focus:ring-0 outline-none text-sm transition-colors resize-none"
              />
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={!isFormValid}
              className={`w-full py-4 rounded-2xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                isFormValid
                  ? "bg-[#1a1a1a] text-white hover:shadow-xl hover:shadow-black/20 hover:-translate-y-0.5 active:translate-y-0"
                  : "bg-[#d4c9a8] text-[#999] cursor-not-allowed"
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              Schedule Visit
            </button>
          </div>
        ) : (
          /* Confirmation Screen */
          <div className="p-6 text-center">
            {/* Animated Checkmark */}
            <div className={`w-20 h-20 mx-auto mb-5 rounded-full flex items-center justify-center transition-all duration-500 ${showCheckmark ? "bg-emerald-100 scale-100" : "bg-emerald-50 scale-75 opacity-0"}`}>
              <svg
                className={`w-10 h-10 text-emerald-500 transition-all duration-500 delay-200 ${showCheckmark ? "scale-100 opacity-100" : "scale-50 opacity-0"}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path
                  d="M5 13l4 4L19 7"
                  className={showCheckmark ? "animate-draw-check" : ""}
                  style={{
                    strokeDasharray: 30,
                    strokeDashoffset: showCheckmark ? 0 : 30,
                    transition: "stroke-dashoffset 0.5s ease 0.3s",
                  }}
                />
              </svg>
            </div>

            <h3 className={`text-xl font-bold text-[#1a1a1a] mb-1 transition-all duration-400 ${showCheckmark ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}>
              Visit Scheduled!
            </h3>
            <p className={`text-sm text-[#999] mb-6 transition-all duration-400 delay-100 ${showCheckmark ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}>
              We&apos;ll remind you before your visit
            </p>

            {/* Visit Summary Card */}
            {booking && (
              <div className={`bg-[#F5F0E8] rounded-2xl p-5 text-left mb-6 border border-black/5 transition-all duration-400 delay-200 ${showCheckmark ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-[#EDE8DE] rounded-xl flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-[#1a1a1a]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                      <polyline points="9 22 9 12 15 12 15 22" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-bold text-[#1a1a1a] text-sm">{booking.pgName}</p>
                    <p className="text-xs text-[#999]">{booking.pgLocality}, {booking.pgArea}</p>
                  </div>
                </div>
                <div className="space-y-2.5">
                  <div className="flex items-center gap-3">
                    <svg className="w-4 h-4 text-[#999] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    <span className="text-sm text-[#666]">
                      {new Date(booking.date).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <svg className="w-4 h-4 text-[#999] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    <span className="text-sm text-[#666]">{booking.timeLabel}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <svg className="w-4 h-4 text-[#999] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0" />
                    </svg>
                    <span className="text-sm text-[#666]">{booking.visitorName} &middot; {booking.visitorPhone}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            {booking && (
              <div className={`space-y-3 transition-all duration-400 delay-300 ${showCheckmark ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}>
                <a
                  href={generateGoogleCalendarUrl(booking)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-semibold text-sm bg-[#1a1a1a] text-white hover:shadow-lg hover:shadow-black/20 hover:-translate-y-0.5 active:translate-y-0 transition-all"
                >
                  <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                    <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" />
                  </svg>
                  Add to Google Calendar
                </a>
                <a
                  href={generateWhatsAppUrl(booking)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-semibold text-sm bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-all"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 00.612.638l4.67-1.228A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.239 0-4.308-.724-5.993-1.953l-.42-.306-2.767.728.74-2.706-.336-.433A9.965 9.965 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
                  </svg>
                  Share on WhatsApp
                </a>
                <button
                  onClick={onClose}
                  className="w-full py-3 rounded-2xl font-medium text-sm text-[#888] hover:text-[#666] hover:bg-[#EDE8DE] transition-all"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
