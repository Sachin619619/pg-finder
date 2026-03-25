"use client";

import { useState, useEffect, useRef } from "react";
import { useNotifications } from "@/hooks/useNotifications";
import type { Notification } from "@/hooks/useNotifications";

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
}

const typeColorMap: Record<string, string> = {
  price_drop: "bg-emerald-50 text-emerald-600",
  new_pg: "bg-blue-50 text-blue-600",
  booking: "bg-amber-50 text-amber-600",
  system: "bg-[#F0EADD] text-[#666]",
  welcome: "bg-purple-50 text-purple-600",
};

export default function NotificationBell() {
  const {
    notifications,
    markAsRead,
    markAllAsRead,
    unreadCount,
    clearAll,
  } = useNotifications();

  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open]);

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell button */}
      <button
        onClick={() => setOpen(!open)}
        className="relative w-9 h-9 rounded-xl flex items-center justify-center hover:bg-[#EDE8DE] transition-all text-[#555] hover:text-[#1a1a1a]"
        aria-label="Notifications"
        aria-expanded={open}
        aria-haspopup="true"
      >
        <svg
          className={`w-5 h-5 transition-transform duration-300 ${open ? "scale-110" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 01-3.46 0" />
        </svg>

        {/* Unread badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-[#1B5E3B] text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 shadow-lg shadow-[#1B5E3B]/30 animate-pulse">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      <div
        className={`absolute right-0 top-12 w-80 sm:w-96 bg-[#FFFDF9] rounded-2xl shadow-2xl shadow-black/15 border border-black/[0.06] z-50 overflow-hidden transition-all duration-300 origin-top-right ${
          open
            ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
            : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#f0e9d8]">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-[#1a1a1a]">Notifications</h3>
            {unreadCount > 0 && (
              <span className="text-[10px] font-semibold bg-[#1B5E3B]/10 text-[#1B5E3B] px-1.5 py-0.5 rounded-full">
                {unreadCount} new
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs font-medium text-[#1a1a1a] hover:text-[#555] transition"
              >
                Mark all read
              </button>
            )}
            {notifications.length > 0 && (
              <button
                onClick={() => {
                  clearAll();
                  setOpen(false);
                }}
                className="text-xs font-medium text-[#999] hover:text-red-500 transition ml-1"
                title="Clear all"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Notification list */}
        <div className="max-h-80 overflow-y-auto overscroll-contain">
          {notifications.length === 0 ? (
            <div className="py-12 text-center">
              <div className="text-3xl mb-2 opacity-40">🔔</div>
              <p className="text-sm text-[#999]">No notifications yet</p>
              <p className="text-xs text-[#aaa] mt-1">We&apos;ll notify you about price drops &amp; new PGs</p>
            </div>
          ) : (
            notifications.map((n: Notification) => (
              <button
                key={n.id}
                onClick={() => markAsRead(n.id)}
                className={`w-full flex items-start gap-3 px-5 py-3.5 hover:bg-[#F0EADD] transition-all text-left ${
                  !n.read ? "bg-[#EDE8DE]/40" : ""
                }`}
              >
                <span
                  className={`text-base mt-0.5 shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
                    typeColorMap[n.type] || "bg-[#F0EADD] text-[#666]"
                  }`}
                >
                  {n.icon}
                </span>
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-[13px] leading-snug ${
                      !n.read
                        ? "font-semibold text-[#1a1a1a]"
                        : "text-[#888]"
                    }`}
                  >
                    {n.title}
                  </p>
                  <p className="text-xs text-[#999] mt-0.5 line-clamp-2">
                    {n.message}
                  </p>
                  <p className="text-[11px] text-[#aaa] mt-1">
                    {timeAgo(n.timestamp)}
                  </p>
                </div>
                {!n.read && (
                  <span className="w-2 h-2 bg-[#1B5E3B] rounded-full mt-2 shrink-0" />
                )}
              </button>
            ))
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="border-t border-[#f0e9d8] px-5 py-3 text-center">
            <button
              onClick={() => setOpen(false)}
              className="text-xs font-semibold text-[#1a1a1a] hover:text-[#555] transition"
            >
              View all notifications →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
