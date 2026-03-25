"use client";

import Link from "next/link";
import Image from "next/image";
import type { PGListing } from "@/data/listings";
import CastleScore from "@/components/CastleScore";
import { areaSafetyScores } from "@/data/safetyData";

interface FeaturedTodayProps {
  listings: PGListing[];
}

export default function FeaturedToday({ listings }: FeaturedTodayProps) {
  // Pick 3 featured PGs: highest rated, best value, newest
  const sorted = [...listings].sort((a, b) => b.rating - a.rating);
  const featured = sorted.slice(0, 3);

  const labels = [
    { emoji: "⭐", title: "Top Rated", subtitle: "Highest rated by tenants", color: "amber" },
    { emoji: "💎", title: "Best Value", subtitle: "Price meets quality", color: "emerald" },
    { emoji: "🆕", title: "New Listing", subtitle: "Recently added", color: "blue" },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <span className="text-xs font-semibold text-black/40 uppercase tracking-widest mb-3 inline-block">Today&apos;s Picks</span>
          <h2 className="font-serif text-3xl sm:text-4xl text-black mb-3 tracking-tight">Featured PGs</h2>
          <p className="text-black/50 max-w-md mx-auto text-sm">Hand-picked by our team based on reviews, value, and quality</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featured.map((pg, i) => {
            const safety = areaSafetyScores[pg.area];
            const label = labels[i];
            const colorClass = label.color === "amber" ? "bg-amber-50 border-amber-200 text-amber-700"
              : label.color === "emerald" ? "bg-emerald-50 border-emerald-200 text-emerald-700"
              : "bg-blue-50 border-blue-200 text-blue-700";

            return (
              <Link key={pg.id} href={`/listing/${pg.id}`} className="group">
                <div className="bg-white rounded-2xl border border-black/5 overflow-hidden hover:shadow-md hover:-translate-y-1 transition-all duration-200">
                  {/* Image */}
                  <div className="relative h-48 bg-gray-100 overflow-hidden">
                    {pg.images[0] ? (
                      <Image
                        src={pg.images[0]}
                        alt={pg.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-gray-300">
                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                      </div>
                    )}
                    
                    {/* Badge */}
                    <div className={`absolute top-3 left-3 ${colorClass} border px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5`}>
                      <span>{label.emoji}</span>
                      <span>{label.title}</span>
                    </div>

                    {/* Price */}
                    <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm rounded-xl px-3 py-1.5">
                      <span className="text-sm font-bold text-gray-900">₹{pg.price.toLocaleString()}/mo</span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <h3 className="font-serif text-lg text-gray-900 mb-1 group-hover:text-[#1a1a1a] transition-colors">
                      {pg.name}
                    </h3>
                    <p className="text-xs text-gray-400 mb-3 flex items-center gap-1.5">
                      <span>📍</span> {pg.area} • ⭐ {pg.rating} ({pg.reviews} reviews)
                    </p>

                    {/* Quick tags */}
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {pg.foodIncluded && (
                        <span className="text-[10px] px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-lg font-medium">🍽️ Food</span>
                      )}
                      {pg.acAvailable && (
                        <span className="text-[10px] px-2 py-0.5 bg-blue-50 text-blue-700 rounded-lg font-medium">❄️ AC</span>
                      )}
                      {pg.furnished && (
                        <span className="text-[10px] px-2 py-0.5 bg-violet-50 text-violet-700 rounded-lg font-medium">✨ Furnished</span>
                      )}
                    </div>

                    {/* Safety + Castle Score */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                      {safety && (
                        <span className={`text-[11px] font-semibold ${
                          safety.score >= 80 ? "text-emerald-600" : safety.score >= 70 ? "text-blue-600" : "text-amber-600"
                        }`}>
                          🛡️ Safety: {safety.score}/100
                        </span>
                      )}
                      <CastleScore pg={pg} compact />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
