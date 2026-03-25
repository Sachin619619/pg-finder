"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { VisitBooking } from "@/components/ScheduleVisit";

export default function MyBookings() {
  const [bookings, setBookings] = useState<VisitBooking[]>([]);
  const [filter, setFilter] = useState<"all" | "upcoming" | "completed" | "cancelled">("all");
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = () => {
    const stored: VisitBooking[] = JSON.parse(localStorage.getItem("pg_visit_bookings") || "[]");
    // Auto-mark past bookings as completed
    const now = new Date();
    const updated = stored.map((b) => {
      if (b.status === "upcoming" && new Date(b.date) < new Date(now.toISOString().split("T")[0])) {
        return { ...b, status: "completed" as const };
      }
      return b;
    });
    localStorage.setItem("pg_visit_bookings", JSON.stringify(updated));
    setBookings(updated.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  };

  const handleCancel = (id: string) => {
    setCancellingId(id);
    setTimeout(() => {
      const updated = bookings.map((b) => (b.id === id ? { ...b, status: "cancelled" as const } : b));
      setBookings(updated);
      localStorage.setItem("pg_visit_bookings", JSON.stringify(updated));
      setCancellingId(null);
    }, 400);
  };

  const filtered = filter === "all" ? bookings : bookings.filter((b) => b.status === filter);

  const statusConfig = {
    upcoming: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500", label: "Upcoming" },
    completed: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500", label: "Completed" },
    cancelled: { bg: "bg-red-50", text: "text-red-600", dot: "bg-red-500", label: "Cancelled" },
  };

  const counts = {
    all: bookings.length,
    upcoming: bookings.filter((b) => b.status === "upcoming").length,
    completed: bookings.filter((b) => b.status === "completed").length,
    cancelled: bookings.filter((b) => b.status === "cancelled").length,
  };

  return (
    <div>
      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 mb-6 scrollbar-hide">
        {(["all", "upcoming", "completed", "cancelled"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              filter === f
                ? "bg-[#1a1a1a] text-white shadow-md"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
            {counts[f] > 0 && (
              <span className={`ml-1.5 inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold ${
                filter === f ? "bg-white/20 text-white" : "bg-gray-200 text-gray-500"
              }`}>
                {counts[f]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Bookings List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">No visits {filter !== "all" ? filter : "yet"}</h3>
          <p className="text-sm text-gray-400 mb-4">
            {filter === "all"
              ? "Schedule a visit from any PG listing page"
              : `You don't have any ${filter} visits`}
          </p>
          {filter === "all" && (
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1a1a1a] text-white rounded-xl text-sm font-medium hover:shadow-lg transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              Browse PGs
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((booking) => {
            const sc = statusConfig[booking.status];
            const visitDate = new Date(booking.date);
            const isCancelling = cancellingId === booking.id;
            return (
              <div
                key={booking.id}
                className={`bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all duration-300 ${
                  isCancelling ? "opacity-50 scale-[0.98]" : ""
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 bg-gray-100 rounded-xl flex items-center justify-center shrink-0">
                      <svg className="w-5 h-5 text-[#1a1a1a]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                        <polyline points="9 22 9 12 15 12 15 22" />
                      </svg>
                    </div>
                    <div>
                      <Link
                        href={`/listing/${booking.pgId}`}
                        className="font-bold text-gray-900 text-sm hover:text-[#1a1a1a] transition-colors"
                      >
                        {booking.pgName}
                      </Link>
                      <p className="text-xs text-gray-400 mt-0.5">{booking.pgLocality}, {booking.pgArea}</p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${sc.bg} ${sc.text}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${sc.dot} ${booking.status === "upcoming" ? "animate-pulse" : ""}`} />
                    {sc.label}
                  </span>
                </div>

                <div className="flex items-center gap-5 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    <span>{visitDate.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    <span>{booking.timeLabel}</span>
                  </div>
                </div>

                {booking.notes && (
                  <p className="mt-3 text-xs text-gray-400 bg-gray-50 rounded-lg px-3 py-2">
                    {booking.notes}
                  </p>
                )}

                {booking.status === "upcoming" && (
                  <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                    <Link
                      href={`/listing/${booking.pgId}`}
                      className="text-xs font-medium text-[#1a1a1a] hover:underline"
                    >
                      View PG Details
                    </Link>
                    <button
                      onClick={() => handleCancel(booking.id)}
                      disabled={isCancelling}
                      className="text-xs font-medium text-red-500 hover:text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-all disabled:opacity-50"
                    >
                      {isCancelling ? "Cancelling..." : "Cancel Visit"}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
