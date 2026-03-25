"use client";

import { useState, useEffect, useCallback, useMemo } from "react";

export type NotificationType =
  | "price_drop"
  | "new_pg"
  | "booking"
  | "system"
  | "welcome";

export type Notification = {
  id: string;
  type: NotificationType;
  icon: string;
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
};

const STORAGE_KEY = "castle_notifications";

const SAMPLE_NOTIFICATIONS: Omit<Notification, "id">[] = [
  {
    type: "welcome",
    icon: "\uD83C\uDF89",
    title: "Welcome to Castle Living!",
    message: "Find your perfect PG with verified listings, real photos & honest reviews.",
    timestamp: Date.now() - 1000 * 60 * 5,
    read: false,
  },
  {
    type: "price_drop",
    icon: "\uD83D\uDCC9",
    title: "Price Drop Alert",
    message: "Sunshine PG in Koramangala now \u20B98,500/mo \u2014 down from \u20B910,000!",
    timestamp: Date.now() - 1000 * 60 * 60 * 2,
    read: false,
  },
  {
    type: "new_pg",
    icon: "\uD83C\uDFE0",
    title: "New PGs in HSR Layout",
    message: "3 new PGs added in HSR Layout this week. Check them out!",
    timestamp: Date.now() - 1000 * 60 * 60 * 24,
    read: false,
  },
];

function generateId(): string {
  return `notif_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function loadFromStorage(): Notification[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // corrupted data — reset
  }
  return [];
}

function saveToStorage(notifications: Notification[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
  } catch {
    // quota exceeded — silently fail
  }
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [initialized, setInitialized] = useState(false);

  // Load from localStorage on mount; seed samples if empty
  useEffect(() => {
    let stored = loadFromStorage();
    if (stored.length === 0) {
      stored = SAMPLE_NOTIFICATIONS.map((n) => ({
        ...n,
        id: generateId(),
      }));
      saveToStorage(stored);
    }
    setNotifications(stored);
    setInitialized(true);
  }, []);

  // Persist whenever notifications change (after init)
  useEffect(() => {
    if (initialized) {
      saveToStorage(notifications);
    }
  }, [notifications, initialized]);

  const addNotification = useCallback(
    (notif: Omit<Notification, "id" | "read" | "timestamp"> & { timestamp?: number }) => {
      const newNotif: Notification = {
        ...notif,
        id: generateId(),
        read: false,
        timestamp: notif.timestamp ?? Date.now(),
      };
      setNotifications((prev) => [newNotif, ...prev]);
    },
    []
  );

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  return {
    notifications,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearAll,
    unreadCount,
  };
}
