"use client";

import { useState } from "react";
import Link from "next/link";
import type { PGListing } from "@/data/listings";
import { areaSafetyScores, metroProximity } from "@/data/safetyData";

interface PGRankingsProps {
  listings: PGListing[];
}

type RankType = "safety" | "value" | "reviews" | "metro" | "transport";

const rankTypes: { id: RankType; label: string; emoji: string; desc: string }[] = [
  { id: "safety", label: "Safest Areas", emoji: "🛡️", desc: "Based on neighborhood safety scores" },
  { id: "value", label: "Best Value", emoji: "💰", desc: "Price vs amenities ratio" },
  { id: "reviews", label: "Top Rated", emoji: "⭐", desc: "Highest rated by tenants" },
  { id: "metro", label: "Near Metro", emoji: "🚇", desc: "Closest to metro stations" },
  { id: "transport", label: "Best Connected", emoji: "🚌", desc: "Bus + Metro combined score" },
];

function getScore(type: RankType, pg: PGListing): number {
  switch (type) {
    case "safety":
      return areaSafetyScores[pg.area]?.score || 50;
    case "metro": {
      const metro = metroProximity[pg.area];
      if (!metro) return 0;
      // Closer = higher score
      const minutes = parseInt(metro.walkTime) || 10;
      return Math.max(0, 100 - minutes * 8);
    }
    case "reviews":
      return pg.rating * 10 + Math.min(pg.reviews, 100) * 0.1;
    case "value":
      // Lower price + more amenities = better value
      return Math.max(0, 200 - pg.price / 200) + pg.amenities.length * 5 + pg.rating * 10;
    case "transport": {
      const metro = metroProximity[pg.area];
      return (metro ? 50 : 0) + Math.min(pg.distanceFromMetro ? 50 : 25, 50);
    }
  }
}

export default function PGRankings({ listings }: PGRankingsProps) {
  const [activeRank, setActiveRank] = useState<RankType>("safety");

  const ranked = [...listings]
    .filter(pg => {
      if (activeRank === "metro") return !!metroProximity[pg.area];
      return true;
    })
    .sort((a, b) => getScore(activeRank, b) - getScore(activeRank, a))
    .slice(0, 5);

  const activeType = rankTypes.find(r => r.id === activeRank)!;

  return (
    <section className="py-20 bg-[#F5F0E8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <span className="text-xs font-semibold text-black/40 uppercase tracking-widest mb-3 inline-block">Smart Rankings</span>
          <h2 className="font-serif text-3xl sm:text-4xl text-black mb-3 tracking-tight">Top PGs by Category</h2>
          <p className="text-black/50 max-w-md mx-auto text-sm">Discover the best PGs ranked by what matters most to you</p>
        </div>

        {/* Rank type tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 mb-8 justify-start sm:justify-center scrollbar-hide">
          {rankTypes.map(type => (
            <button
              key={type.id}
              onClick={() => setActiveRank(type.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
                activeRank === type.id
                  ? "bg-[#1a1a1a] text-white shadow-lg"
                  : "bg-[#FFFDF9] border border-black/8 text-[#666] hover:border-black/12 hover:bg-[#F5F0E8]"
              }`}
            >
              <span>{type.emoji}</span>
              <span>{type.label}</span>
            </button>
          ))}
        </div>

        {/* Rankings list */}
        <div className="bg-[#FFFDF9]/70 backdrop-blur-sm rounded-3xl border border-black/8 overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-black/5">
            <p className="text-sm text-[#888]">{activeType.desc}</p>
          </div>
          <div className="divide-y divide-[#F5F0E8]">
            {ranked.map((pg, i) => {
              const score = getScore(activeRank, pg);
              const safety = areaSafetyScores[pg.area];
              const rank = i + 1;
              
              return (
                <div key={pg.id} className="p-4 sm:p-5 flex items-center gap-4 hover:bg-[#F5F0E8]/50 transition-colors">
                  {/* Rank */}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                    rank === 1 ? "bg-amber-100 text-amber-700" :
                    rank === 2 ? "bg-[#EDE8DE] text-[#666]" :
                    rank === 3 ? "bg-orange-100 text-orange-700" :
                    "bg-[#F5F0E8] text-[#999]"
                  }`}>
                    {rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : `#${rank}`}
                  </div>

                  {/* PG Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h4 className="font-semibold text-[#1a1a1a] text-sm truncate">{pg.name}</h4>
                      <span className="text-xs text-[#999] shrink-0">⭐ {pg.rating}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-[#888]">
                      <span>📍 {pg.area}</span>
                      {safety && (
                        <span className={`font-medium ${
                          safety.score >= 80 ? "text-emerald-600" :
                          safety.score >= 70 ? "text-blue-600" : "text-amber-600"
                        }`}>
                          🛡️ {safety.score}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Score */}
                  <div className="text-right shrink-0">
                    <p className="text-lg font-bold text-[#1a1a1a]">₹{pg.price.toLocaleString()}</p>
                    <p className="text-[10px] text-[#999]">/month</p>
                  </div>

                  {/* CTA */}
                  <Link
                    href={`/listing/${pg.id}`}
                    className="px-4 py-2 bg-[#1a1a1a] text-white rounded-xl text-xs font-semibold shrink-0 hover:bg-[#333333] transition"
                  >
                    View
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
