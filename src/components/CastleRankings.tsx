"use client";

import { useState } from "react";
import Link from "next/link";
import type { PGListing } from "@/data/listings";
import CastleScore from "@/components/CastleScore";
import { areaSafetyScores } from "@/data/safetyData";

interface CastleRankingsProps {
  listings: PGListing[];
}

const categories = [
  { id: "castle_score", label: "🏰 Castle Score", desc: "Best overall quality" },
  { id: "safety", label: "🛡️ Safest Areas", desc: "Highest safety scores" },
  { id: "value", label: "💰 Best Value", desc: "Price vs quality ratio" },
  { id: "rating", label: "⭐ Top Rated", desc: "Highest rated by tenants" },
  { id: "reviews", label: "💬 Most Reviewed", desc: "Most tenant reviews" },
];

function getCategoryListings(listings: PGListing[], categoryId: string): PGListing[] {
  switch (categoryId) {
    case "castle_score":
      return [...listings].sort((a, b) => {
        const scoreA = (areaSafetyScores[a.area]?.score || 50) + a.rating * 10 + a.amenities.length * 2;
        const scoreB = (areaSafetyScores[b.area]?.score || 50) + b.rating * 10 + b.amenities.length * 2;
        return scoreB - scoreA;
      }).slice(0, 5);
    case "safety":
      return [...listings]
        .filter(l => areaSafetyScores[l.area])
        .sort((a, b) => (areaSafetyScores[b.area]?.score || 0) - (areaSafetyScores[a.area]?.score || 0))
        .slice(0, 5);
    case "value":
      return [...listings]
        .map(l => {
          const avgPrice = 9500; // simplified average
          return { l, value: (l.rating * 20 - (l.price - avgPrice) / 500) };
        })
        .sort((a, b) => b.value - a.value)
        .map(r => r.l)
        .slice(0, 5);
    case "rating":
      return [...listings].sort((a, b) => b.rating - a.rating || b.reviews - a.reviews).slice(0, 5);
    case "reviews":
      return [...listings].sort((a, b) => b.reviews - a.reviews).slice(0, 5);
    default:
      return listings.slice(0, 5);
  }
}

export default function CastleRankings({ listings }: CastleRankingsProps) {
  const [active, setActive] = useState("castle_score");

  return (
    <section className="py-20 bg-[#F0EADD]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <span className="text-xs font-semibold text-black/40 uppercase tracking-widest mb-3 inline-block">Castle Rankings</span>
          <h2 className="font-serif text-3xl sm:text-4xl text-black mb-3 tracking-tight">Top PGs by Category</h2>
          <p className="text-black/50 max-w-md mx-auto text-sm">Discover the best PGs ranked by what matters most to you</p>
        </div>

        {/* Category tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 mb-8 justify-start sm:justify-center scrollbar-hide">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActive(cat.id)}
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
                active === cat.id
                  ? "bg-[#1a1a1a] text-white"
                  : "bg-[#FFFDF9] border border-black/5 text-[#666] hover:border-black/10 hover:bg-[#F0EADD]"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Rankings */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {getCategoryListings(listings, active).map((pg, i) => (
            <Link key={pg.id} href={`/listing/${pg.id}`} className="group">
              <div className="bg-[#FFFDF9] rounded-2xl border border-black/5 overflow-hidden hover:shadow-md hover:-translate-y-1 transition-all">
                {/* Rank badge */}
                <div className={`relative h-32 flex items-center justify-center ${
                  i === 0 ? "bg-amber-50" :
                  i === 1 ? "bg-[#EDE8DE]" :
                  i === 2 ? "bg-orange-50" :
                  "bg-[#F0EADD]"
                }`}>
                  <span className={`text-5xl font-black ${
                    i === 0 ? "text-amber-500" :
                    i === 1 ? "text-[#999]" :
                    i === 2 ? "text-orange-500" :
                    "text-[#d4c9a8]"
                  }`}>
                    #{i + 1}
                  </span>
                  <div className="absolute top-2 right-2">
                    <CastleScore pg={pg} compact />
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h4 className="font-semibold text-[#1a1a1a] text-sm mb-1 group-hover:text-[#1a1a1a] transition-colors truncate">{pg.name}</h4>
                  <p className="text-xs text-[#999] mb-2">📍 {pg.area}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-[#1a1a1a]">₹{pg.price.toLocaleString()}</span>
                    <span className="text-xs text-[#999]">⭐ {pg.rating}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
