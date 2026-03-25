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
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#1B5E3B]/60 mb-3">&#10022; Castle Rankings</p>
          <h2 className="font-serif text-2xl sm:text-3xl text-black mb-3 tracking-tight">Top PGs by Category</h2>
          <p className="text-black/50 max-w-md mx-auto text-sm">Discover the best PGs ranked by what matters most to you</p>
        </div>

        {/* Category tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 mb-8 justify-start sm:justify-center scrollbar-hide">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActive(cat.id)}
              className={`px-4 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
                active === cat.id
                  ? "bg-[#1B5E3B] text-white shadow-lg"
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
              <div className="bg-[#FFFDF9] rounded-3xl border border-black/5 overflow-hidden hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
                {/* Rank badge */}
                <div className={`relative h-32 flex items-center justify-center ${
                  i === 0 ? "bg-gradient-to-br from-[#d4a574] to-[#b8956a]" :
                  i === 1 ? "bg-gradient-to-br from-[#c0c0c0] to-[#a8a8a8]" :
                  i === 2 ? "bg-gradient-to-br from-[#cd7f32] to-[#a0522d]" :
                  "bg-[#F0EADD]"
                }`}>
                  <span className={`text-5xl font-black ${
                    i <= 2 ? "text-white drop-shadow-md" :
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
