"use client";

import Link from "next/link";
import Image from "next/image";
import type { PGListing } from "@/data/listings";
import { listings as allListings } from "@/data/listings";
import CastleScore from "@/components/CastleScore";
import { areaSafetyScores } from "@/data/safetyData";

interface SimilarPGsProps {
  currentPg: PGListing;
}

export default function SimilarPGs({ currentPg }: SimilarPGsProps) {
  // Find similar PGs: same area, similar price, same type
  const similar = allListings
    .filter(pg => pg.id !== currentPg.id)
    .map(pg => {
      let score = 0;
      if (pg.area === currentPg.area) score += 30;
      if (Math.abs(pg.price - currentPg.price) <= 2000) score += 25;
      if (pg.type === currentPg.type) score += 20;
      if (pg.gender === currentPg.gender) score += 15;
      if (pg.foodIncluded === currentPg.foodIncluded) score += 10;
      return { pg, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map(s => s.pg);

  if (similar.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
        <span className="text-lg">🔗</span> Similar PGs in {currentPg.area}
      </h3>
      <div className="space-y-3">
        {similar.map(pg => {
          const safety = areaSafetyScores[pg.area];
          return (
            <Link key={pg.id} href={`/listing/${pg.id}`} className="group flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
              {/* Image */}
              <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                {pg.images[0] ? (
                  <Image src={pg.images[0]} alt={pg.name} fill className="object-cover" sizes="64px" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-300 text-xl">🏠</div>
                )}
              </div>
              
              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 group-hover:text-[#1B1C15] transition-colors truncate">{pg.name}</p>
                <p className="text-xs text-gray-400 flex items-center gap-1.5 mt-0.5">
                  <span>⭐ {pg.rating}</span>
                  {safety && (
                    <span className={`font-medium ${
                      safety.score >= 80 ? "text-emerald-600" : safety.score >= 70 ? "text-blue-600" : "text-amber-600"
                    }`}>
                      🛡️ {safety.score}
                    </span>
                  )}
                </p>
                <div className="flex items-center gap-1.5 mt-1">
                  {pg.foodIncluded && <span className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded">🍽️</span>}
                  {pg.acAvailable && <span className="text-[10px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded">❄️</span>}
                </div>
              </div>

              {/* Price */}
              <div className="text-right shrink-0">
                <p className="text-sm font-bold text-gray-900">₹{pg.price.toLocaleString()}</p>
                <p className="text-[10px] text-gray-400">/month</p>
              </div>
            </Link>
          );
        })}
      </div>
      <Link
        href={`/?area=${encodeURIComponent(currentPg.area)}`}
        className="w-full mt-4 py-2.5 text-center text-sm font-semibold text-[#1B1C15] bg-[#FFFAEC] border border-[#e8e0cc] rounded-xl hover:bg-[#F4EDD9] transition-colors block"
      >
        See all in {currentPg.area} →
      </Link>
    </div>
  );
}
