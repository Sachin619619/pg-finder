"use client";

import { useState, useEffect, useCallback } from "react";

export type RecentlyViewedItem = {
  id: string;
  name: string;
  area: string;
  price: number;
  rating: number;
  image: string;
  timestamp: number;
};

const MAX_ITEMS = 8;
const STORAGE_KEY = "recently_viewed";

function readStorage(): RecentlyViewedItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeStorage(items: RecentlyViewedItem[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // localStorage unavailable
  }
}

export function useRecentlyViewed() {
  const [items, setItems] = useState<RecentlyViewedItem[]>([]);

  // Load from localStorage on mount (SSR-safe)
  useEffect(() => {
    setItems(readStorage());
  }, []);

  const addToRecent = useCallback(
    (item: Omit<RecentlyViewedItem, "timestamp">) => {
      const current = readStorage();
      // Remove existing entry for same id
      const filtered = current.filter((i) => i.id !== item.id);
      // Add to front with timestamp
      const updated = [{ ...item, timestamp: Date.now() }, ...filtered].slice(
        0,
        MAX_ITEMS,
      );
      writeStorage(updated);
      setItems(updated);
    },
    [],
  );

  const getRecent = useCallback((): RecentlyViewedItem[] => {
    return readStorage();
  }, []);

  const clearRecent = useCallback(() => {
    writeStorage([]);
    setItems([]);
  }, []);

  return { items, addToRecent, getRecent, clearRecent };
}
