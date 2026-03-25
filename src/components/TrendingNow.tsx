"use client";

import Link from "next/link";

const trendingItems = [
  { label: "Top Rated PGs", emoji: "⭐", href: "/?sort=rating", count: 156 },
  { label: "New Listings", emoji: "🆕", href: "/?sort=newest", count: 89 },
  { label: "Budget Friendly", emoji: "💰", href: "/?maxPrice=10000", count: 234 },
  { label: "Near Metro", emoji: "🚇", href: "/?metro=true", count: 178 },
  { label: "AC PGs", emoji: "❄️", href: "/?ac=true", count: 145 },
  { label: "With Food", emoji: "🍽️", href: "/?food=true", count: 198 },
  { label: "Luxury Stays", emoji: "✨", href: "/?minPrice=15000", count: 67 },
  { label: "Girls Only", emoji: "👩", href: "/?gender=female", count: 123 },
];

export default function TrendingNow() {
  return (
    <section className="py-12 bg-gray-50 border-y border-black/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-5">
          <span className="text-lg">🔥</span>
          <h2 className="text-lg font-bold text-gray-900">Trending Now</h2>
          <span className="text-xs text-gray-400">Most popular searches today</span>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {trendingItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="group flex items-center gap-2 px-4 py-2.5 bg-white border border-black/5 rounded-full text-sm text-gray-700 hover:bg-[#1a1a1a] hover:text-white hover:border-[#1a1a1a] transition-all shrink-0"
            >
              <span className="text-base group-hover:scale-110 transition-transform">{item.emoji}</span>
              <span className="font-semibold whitespace-nowrap">{item.label}</span>
              <span className="text-xs text-gray-400 group-hover:text-white/60 ml-1">{item.count}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
