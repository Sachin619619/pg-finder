"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export type RecentlyViewedItem = {
  id: string;
  name: string;
  area: string;
  price: number;
  timestamp: number;
};

const MAX_ITEMS = 10;
const STORAGE_KEY = "recently_viewed";

export function saveRecentlyViewed(item: Omit<RecentlyViewedItem, "timestamp">) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    let items: RecentlyViewedItem[] = raw ? JSON.parse(raw) : [];

    // Remove existing entry for same id
    items = items.filter((i) => i.id !== item.id);

    // Add to front
    items.unshift({ ...item, timestamp: Date.now() });

    // Keep max 10
    items = items.slice(0, MAX_ITEMS);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // localStorage unavailable
  }
}

export default function RecentlyViewed() {
  const [items, setItems] = useState<RecentlyViewedItem[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: RecentlyViewedItem[] = JSON.parse(raw);
        setItems(parsed);
      }
    } catch {
      // localStorage unavailable
    }
  }, []);

  if (items.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 bg-[#1B1C15] rounded-xl flex items-center justify-center shadow-lg shadow-black/20">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">Recently Viewed</h2>
          <p className="text-xs text-gray-400">Pick up where you left off</p>
        </div>
      </div>

      {/* Horizontal scrollable row */}
      <div className="flex gap-4 overflow-x-auto pb-3 scrollbar-hide -mx-1 px-1">
        {items.map((item) => (
          <Link
            key={item.id}
            href={`/listing/${item.id}`}
            className="group flex-shrink-0 w-60 bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-lg hover:shadow-black/10 hover:border-[#d4ccb5]:border-[#3d3829] transition-all hover:-translate-y-0.5"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 bg-[#F4EDD9] rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-[#1B1C15]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18M5 21V7l3-3 4 3 4-3 3 3v14M9 21v-4a2 2 0 012-2h2a2 2 0 012 2v4" />
                </svg>
              </div>
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                Rs.{item.price.toLocaleString("en-IN")}
              </span>
            </div>
            <h3 className="text-sm font-bold text-gray-900 truncate group-hover:text-[#1B1C15]:text-[#8a8070] transition-colors">
              {item.name}
            </h3>
            <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {item.area}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
