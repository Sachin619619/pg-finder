"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";

type Notification = {
  id: string;
  icon: string;
  message: string;
  time: string;
  timestamp: number;
  read: boolean;
};

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

export default function NotificationBell() {
  const { user, profile } = useAuth();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const userId = user?.id;
  const role = profile?.role;

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

  // Fetch notifications based on role
  useEffect(() => {
    if (!userId || !role) return;

    const fetchNotifications = async () => {
      setLoading(true);
      const items: Notification[] = [];

      try {
        if (role === "owner" || role === "admin") {
          // Claim notifications (pending)
          const { data: claims } = await supabase
            .from("claim_notifications")
            .select("*")
            .eq("status", "pending")
            .order("created_at", { ascending: false })
            .limit(20);

          claims?.forEach((c: Record<string, string>) => {
            items.push({
              id: `claim_${c.id}`,
              icon: "📋",
              message: `New claim request: ${c.pg_name || "a PG"}`,
              time: timeAgo(new Date(c.created_at).getTime()),
              timestamp: new Date(c.created_at).getTime(),
              read: false,
            });
          });

          // Resident requests (pending)
          const { data: requests } = await supabase
            .from("resident_requests")
            .select("*")
            .eq("status", "pending")
            .order("created_at", { ascending: false })
            .limit(20);

          requests?.forEach((r: Record<string, string>) => {
            items.push({
              id: `req_${r.id}`,
              icon: "🏠",
              message: `${r.user_name || "Someone"} wants to stay at your PG`,
              time: timeAgo(new Date(r.created_at).getTime()),
              timestamp: new Date(r.created_at).getTime(),
              read: false,
            });
          });

          // Callbacks
          const { data: callbacks } = await supabase
            .from("callbacks")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(20);

          callbacks?.forEach((cb: Record<string, string>) => {
            items.push({
              id: `cb_${cb.id}`,
              icon: "📞",
              message: `Callback from ${cb.name || cb.phone || "a user"}`,
              time: timeAgo(new Date(cb.created_at).getTime()),
              timestamp: new Date(cb.created_at).getTime(),
              read: false,
            });
          });
        }

        if (role === "agent") {
          const { data: agentReqs } = await supabase
            .from("agent_requests")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(20);

          agentReqs?.forEach((a: Record<string, string>) => {
            items.push({
              id: `agent_${a.id}`,
              icon: a.status === "approved" ? "✅" : a.status === "rejected" ? "❌" : "🤝",
              message: `Agent request ${a.status || "updated"}${a.pg_name ? ` for ${a.pg_name}` : ""}`,
              time: timeAgo(new Date(a.created_at).getTime()),
              timestamp: new Date(a.created_at).getTime(),
              read: false,
            });
          });
        }

        if (role === "tenant" || (!["owner", "admin", "agent"].includes(role))) {
          const { data: tenantReqs } = await supabase
            .from("resident_requests")
            .select("*")
            .eq("user_id", userId)
            .in("status", ["approved", "rejected"])
            .order("created_at", { ascending: false })
            .limit(20);

          tenantReqs?.forEach((r: Record<string, string>) => {
            items.push({
              id: `tenant_${r.id}`,
              icon: r.status === "approved" ? "🎉" : "😔",
              message: `Your stay request was ${r.status}`,
              time: timeAgo(new Date(r.created_at).getTime()),
              timestamp: new Date(r.created_at).getTime(),
              read: false,
            });
          });
        }
      } catch {
        // Silently handle errors — tables may not exist yet
      }

      // Sort by timestamp descending
      items.sort((a, b) => b.timestamp - a.timestamp);

      // Mark seen ones as read
      const seenKey = `notifications_seen_${userId}`;
      const seenRaw = localStorage.getItem(seenKey);
      const seen: string[] = seenRaw ? JSON.parse(seenRaw) : [];

      items.forEach((n) => {
        if (seen.includes(n.id)) n.read = true;
      });

      setNotifications(items);
      setLoading(false);
    };

    fetchNotifications();
  }, [userId, role]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    if (!userId) return;
    const seenKey = `notifications_seen_${userId}`;
    const allIds = notifications.map((n) => n.id);
    localStorage.setItem(seenKey, JSON.stringify(allIds));
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  if (!user) return null;

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell button */}
      <button
        onClick={() => setOpen(!open)}
        className="relative w-9 h-9 rounded-xl flex items-center justify-center hover:bg-gray-100:bg-gray-800 transition-all text-gray-600 hover:text-[#1B1C15]:text-[#8a8070]"
        aria-label="Notifications"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 01-3.46 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 shadow-lg shadow-red-500/30 animate-pulse">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute right-0 top-12 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 animate-slide-up overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h3 className="text-sm font-bold text-gray-900">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs font-medium text-[#1B1C15] hover:text-[#2a2b22]:text-[#c5bda8] transition"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* Notification list */}
          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-10">
                <svg className="animate-spin w-5 h-5 text-[#1B1C15]" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-10 text-center">
                <div className="text-3xl mb-2">🔔</div>
                <p className="text-sm text-gray-400">No notifications yet</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`flex items-start gap-3 px-5 py-3.5 hover:bg-gray-50:bg-gray-700/50 transition cursor-pointer ${
                    !n.read ? "bg-[#F4EDD9]/50" : ""
                  }`}
                >
                  <span className="text-lg mt-0.5 shrink-0">{n.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm leading-snug ${!n.read ? "font-semibold text-gray-900" : "text-gray-600"}`}>
                      {n.message}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">{n.time}</p>
                  </div>
                  {!n.read && (
                    <span className="w-2 h-2 bg-[#1B1C15] rounded-full mt-2 shrink-0" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
