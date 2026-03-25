"use client";

import Link from "next/link";
import { useState } from "react";

const trendingSearches = {
  "Top Searches": [
    { label: "PG in Koramangala", query: "Koramangala", count: 234 },
    { label: "PG with AC", query: "ac", count: 198 },
    { label: "PG with Food", query: "food", count: 176 },
    { label: "Budget PG under 10k", query: "under-10000", count: 165 },
    { label: "PG near Metro", query: "metro", count: 143 },
  ],
  "Trending Areas": [
    { label: "Bellandur", query: "Bellandur", emoji: "💻", count: 187 },
    { label: "HSR Layout", query: "HSR Layout", emoji: "🌿", count: 156 },
    { label: "Whitefield", query: "Whitefield", emoji: "🏢", count: 134 },
    { label: "Kalyan Nagar", query: "Kalyan Nagar", emoji: "📍", count: 121 },
    { label: "Indiranagar", query: "Indiranagar", emoji: "🍺", count: 109 },
  ],
  "Popular Amenities": [
    { label: "AC Rooms", query: "ac", emoji: "❄️", count: 198 },
    { label: "WiFi Included", query: "wifi", emoji: "📶", count: 176 },
    { label: "Single Room", query: "single", emoji: "🛏️", count: 165 },
    { label: "Furnished", query: "furnished", emoji: "✨", count: 143 },
    { label: "Food Included", query: "food", emoji: "🍽️", count: 134 },
  ],
};

export default function TrendingSearches() {
  const [activeTab, setActiveTab] = useState<keyof typeof trendingSearches>("Top Searches");
  const tabs = Object.keys(trendingSearches) as Array<keyof typeof trendingSearches>;

  return (
    <section className="py-16 bg-[#F0EADD] border-y border-black/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <span className="text-xs font-semibold text-black/40 uppercase tracking-widest mb-2 inline-block">What People Search</span>
          <h3 className="text-xl font-semibold text-[#1a1a1a]">Trending Right Now</h3>
        </div>

        {/* Tabs */}
        <div className="flex justify-center gap-2 mb-6">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === tab
                  ? "bg-[#1a1a1a] text-white"
                  : "bg-[#FFFDF9] border border-black/8 text-[#666] hover:border-black/12"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search tags */}
        <div className="flex flex-wrap justify-center gap-3">
          {trendingSearches[activeTab].map((item) => (
            <Link
              key={item.label}
              href={`/?search=${encodeURIComponent(item.label)}`}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#FFFDF9] border border-black/8 rounded-full text-sm text-[#555] hover:border-[#1a1a1a] hover:text-[#1a1a1a] hover:shadow-sm transition-all"
            >
              {"emoji" in item && <span className="text-base">{item.emoji}</span>}
              <span className="font-medium">{item.label}</span>
              <span className="text-xs text-[#999]">({item.count})</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
