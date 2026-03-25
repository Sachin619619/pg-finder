"use client";

import Link from "next/link";

const posts = [
  { title: "Top 10 PGs Near Electronic City Under ₹10K", category: "Budget", emoji: "💰", date: "Mar 20, 2026" },
  { title: "How to Spot a Fake PG Listing (Red Flags)", category: "Guide", emoji: "⚠️", date: "Mar 18, 2026" },
  { title: "Living in Koramangala vs Indiranagar", category: "Neighborhood", emoji: "🏘️", date: "Mar 15, 2026" },
  { title: "Complete Moving Checklist for First-Timers", category: "Checklist", emoji: "✅", date: "Mar 12, 2026" },
  { title: "AC vs Non-AC PGs: What Actually Saves Money?", category: "Finance", emoji: "💡", date: "Mar 10, 2026" },
];

export default function CastleBlog() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-10">
          <div>
            <span className="text-xs font-semibold text-black/40 uppercase tracking-widest mb-2 inline-block">From Our Blog</span>
            <h2 className="font-serif text-3xl text-black tracking-tight">Castle Guides</h2>
          </div>
          <Link href="/blog" className="hidden sm:block text-sm font-semibold text-[#1B1C15] hover:underline">
            View all →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.slice(0, 3).map((post, i) => (
            <Link key={i} href="/blog" className="group">
              <div className={`rounded-2xl overflow-hidden ${i === 0 ? "sm:col-span-2 lg:col-span-1 lg:row-span-2" : ""}`}>
                <div className={`bg-gradient-to-br ${i === 0 ? "h-48 sm:h-64" : "h-32"} flex items-center justify-center ${i === 0 ? "from-amber-50 to-orange-100" : "from-gray-50 to-gray-100"}`}>
                  <span className="text-5xl">{post.emoji}</span>
                </div>
                <div className="p-5 bg-[#FFFAEC] border border-[#e8e0cc]">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-bold text-[#1B1C15] bg-[#F4EDD9] px-2 py-0.5 rounded-full">{post.category}</span>
                    <span className="text-[10px] text-gray-400">{post.date}</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-[#1B1C15] transition-colors leading-snug">{post.title}</h3>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-6 text-center sm:hidden">
          <Link href="/blog" className="text-sm font-semibold text-[#1B1C15] hover:underline">
            View all articles →
          </Link>
        </div>
      </div>
    </section>
  );
}
