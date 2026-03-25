"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCompare } from "@/context/CompareContext";
import type { PGListing } from "@/data/listings";
import Header from "@/components/Header";
import { areaSafetyScores, metroProximity, busConnectivity } from "@/data/safetyData";

const typeLabels: Record<string, string> = {
  single: "Single", double: "Double", triple: "Triple", any: "Any",
};

const amenityIcons: Record<string, string> = {
  WiFi: "📶", AC: "❄️", Food: "🍽️", Laundry: "🧺", Parking: "🅿️",
  Gym: "🏋️", "Power Backup": "⚡", CCTV: "📹", "Hot Water": "🚿",
  TV: "📺", Fridge: "🧊", "Washing Machine": "🧼", Housekeeping: "🧹", Security: "🔒",
};

export default function ComparePage() {
  const { compareList, removeFromCompare, clearCompare } = useCompare();

  useEffect(() => {
    document.title = "Compare PGs | Castle";
  }, []);

  if (compareList.length < 2) {
    return (
      <>
        <Header />
        <main className="max-w-4xl mx-auto px-4 py-32 text-center">
          <div className="text-6xl mb-4">⚖️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Compare PG Listings</h1>
          <p className="text-gray-500 mb-8">Add at least 2 PGs to compare them side by side.</p>
          <Link href="/" className="px-6 py-3 bg-[#1B1C15] text-white rounded-xl font-semibold inline-block">
            Browse PGs
          </Link>
        </main>
      </>
    );
  }

  const getAllAmenities = (): string[] => {
    const set = new Set<string>();
    compareList.forEach(pg => pg.amenities.forEach(a => set.add(a)));
    return Array.from(set).sort();
  };

  const allAmenities = getAllAmenities();

  const getBadge = (pg: PGListing, metric: string, best: number | boolean, worst: number | boolean, formatter?: (v: number) => string) => {
    const isBest = best === true || (typeof best === 'number' && Number(pg[metric as keyof PGListing]) === best);
    const isWorst = worst === true || (typeof worst === 'number' && Number(pg[metric as keyof PGListing]) === worst);
    return { isBest, isWorst };
  };

  const prices = compareList.map(pg => pg.price);
  const bestPrice = Math.min(...prices);
  const worstPrice = Math.max(...prices);

  const ratings = compareList.map(pg => pg.rating);
  const bestRating = Math.max(...ratings);
  const worstRating = Math.min(...ratings);

  const reviewCounts = compareList.map(pg => pg.reviews);
  const mostReviews = Math.max(...reviewCounts);

  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-8 pt-24">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <span>⚖️</span> Compare PGs
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Comparing {compareList.length} listings — {compareList.map(p => p.name).join(", ")}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/" className="px-4 py-2 rounded-xl text-sm font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition">
              + Add More
            </Link>
            <button
              onClick={clearCompare}
              className="px-4 py-2 rounded-xl text-sm font-semibold bg-red-50 text-red-600 hover:bg-red-100 transition"
            >
              Clear All
            </button>
          </div>
        </div>

        {/* Cards overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {compareList.map((pg) => {
            const safety = areaSafetyScores[pg.area];
            const metro = metroProximity[pg.area];
            const bus = busConnectivity[pg.area];
            return (
              <div key={pg.id} className="bg-[#FFFAEC] rounded-2xl overflow-hidden border border-[#e8e0cc]">
                {/* Image */}
                <div className="relative h-40 bg-gray-100">
                  {pg.images[0] ? (
                    <Image src={pg.images[0]} alt={pg.name} fill className="object-cover" sizes="400px" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-300">
                      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                    </div>
                  )}
                  <button
                    onClick={() => removeFromCompare(pg.id)}
                    className="absolute top-2 right-2 w-7 h-7 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition shadow"
                  >
                    <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                  <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm rounded-xl px-2 py-1">
                    <span className="text-sm font-bold text-gray-900">₹{pg.price.toLocaleString()}/mo</span>
                  </div>
                </div>
                {/* Info */}
                <div className="p-4">
                  <h3 className="font-bold text-gray-900 text-sm mb-1">{pg.name}</h3>
                  <p className="text-xs text-gray-500 mb-3">📍 {pg.area} • ⭐ {pg.rating} ({pg.reviews} reviews)</p>

                  {/* Quick metrics */}
                  <div className="space-y-1.5">
                    {safety && (
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">🛡️ Safety</span>
                        <span className={`font-semibold ${safety.score >= 80 ? "text-emerald-600" : safety.score >= 70 ? "text-blue-600" : "text-amber-600"}`}>
                          {safety.score}/100 ({safety.label})
                        </span>
                      </div>
                    )}
                    {metro && (
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">🚇 Metro</span>
                        <span className="font-semibold text-blue-600">{metro.walkTime} walk</span>
                      </div>
                    )}
                    {bus && (
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">🚌 Bus</span>
                        <span className="font-semibold text-green-600">{bus.routes} routes</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">🍽️ Food</span>
                      <span className={`font-semibold ${pg.foodIncluded ? "text-emerald-600" : "text-gray-400"}`}>
                        {pg.foodIncluded ? "Included" : "Not included"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">❄️ AC</span>
                      <span className={`font-semibold ${pg.acAvailable ? "text-emerald-600" : "text-gray-400"}`}>
                        {pg.acAvailable ? "Available" : "N/A"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">🏠 Furnished</span>
                      <span className={`font-semibold ${pg.furnished ? "text-emerald-600" : "text-gray-400"}`}>
                        {pg.furnished ? "Yes" : "No"}
                      </span>
                    </div>
                  </div>

                  <Link
                    href={`/listing/${pg.id}`}
                    className="w-full mt-4 py-2.5 bg-[#1B1C15] text-white rounded-xl text-xs font-semibold text-center block hover:bg-[#2d2e25] transition"
                  >
                    View Details →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Detailed comparison table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left p-4 text-sm font-semibold text-gray-500 w-40">Metric</th>
                  {compareList.map((pg) => (
                    <th key={pg.id} className="text-center p-4 text-sm font-bold text-gray-900 min-w-44">
                      {pg.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Price */}
                <tr className="border-b border-gray-50">
                  <td className="p-4 text-sm font-medium text-gray-600 flex items-center gap-2">
                    💰 Price
                  </td>
                  {compareList.map((pg) => {
                    const isBest = pg.price === bestPrice;
                    return (
                      <td key={pg.id} className="p-4 text-center">
                        <span className={`text-lg font-bold ${isBest ? "text-emerald-600" : "text-gray-900"}`}>
                          ₹{pg.price.toLocaleString()}
                        </span>
                        <span className="text-xs text-gray-400">/mo</span>
                        {isBest && <div className="text-[10px] font-bold text-emerald-600 mt-0.5">💚 Best Price</div>}
                      </td>
                    );
                  })}
                </tr>

                {/* Rating */}
                <tr className="border-b border-gray-50">
                  <td className="p-4 text-sm font-medium text-gray-600 flex items-center gap-2">
                    ⭐ Rating
                  </td>
                  {compareList.map((pg) => {
                    const isBest = pg.rating === bestRating;
                    return (
                      <td key={pg.id} className="p-4 text-center">
                        <span className={`text-lg font-bold ${isBest ? "text-amber-600" : "text-gray-900"}`}>
                          {pg.rating}
                        </span>
                        <span className="text-xs text-gray-400">({pg.reviews} reviews)</span>
                        {isBest && <div className="text-[10px] font-bold text-amber-600 mt-0.5">🏆 Top Rated</div>}
                      </td>
                    );
                  })}
                </tr>

                {/* Safety Score */}
                <tr className="border-b border-gray-50">
                  <td className="p-4 text-sm font-medium text-gray-600 flex items-center gap-2">
                    🛡️ Safety Score
                  </td>
                  {compareList.map((pg) => {
                    const safety = areaSafetyScores[pg.area];
                    if (!safety) return <td key={pg.id} className="p-4 text-center text-gray-400">—</td>;
                    const isBest = compareList.every(other => (areaSafetyScores[other.area]?.score || 0) <= safety.score);
                    return (
                      <td key={pg.id} className="p-4 text-center">
                        <span className={`text-lg font-bold ${safety.score >= 80 ? "text-emerald-600" : safety.score >= 70 ? "text-blue-600" : "text-amber-600"}`}>
                          {safety.score}
                        </span>
                        <span className="text-xs text-gray-400">/100</span>
                        {isBest && <div className="text-[10px] font-bold text-emerald-600 mt-0.5">✓ Safest</div>}
                      </td>
                    );
                  })}
                </tr>

                {/* Transport */}
                <tr className="border-b border-gray-50">
                  <td className="p-4 text-sm font-medium text-gray-600 flex items-center gap-2">
                    🚇 Metro Distance
                  </td>
                  {compareList.map((pg) => {
                    const metro = metroProximity[pg.area];
                    if (!metro) return <td key={pg.id} className="p-4 text-center text-gray-400">—</td>;
                    return (
                      <td key={pg.id} className="p-4 text-center">
                        <span className="text-base font-bold text-blue-600">{metro.walkTime}</span>
                        <div className="text-[10px] text-gray-400 mt-0.5">{metro.metroStation}</div>
                      </td>
                    );
                  })}
                </tr>

                {/* Food */}
                <tr className="border-b border-gray-50">
                  <td className="p-4 text-sm font-medium text-gray-600 flex items-center gap-2">
                    🍽️ Food Included
                  </td>
                  {compareList.map((pg) => (
                    <td key={pg.id} className="p-4 text-center">
                      <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-sm font-semibold ${pg.foodIncluded ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-400"}`}>
                        {pg.foodIncluded ? "✅ Yes" : "❌ No"}
                      </span>
                    </td>
                  ))}
                </tr>

                {/* AC */}
                <tr className="border-b border-gray-50">
                  <td className="p-4 text-sm font-medium text-gray-600 flex items-center gap-2">
                    ❄️ AC Available
                  </td>
                  {compareList.map((pg) => (
                    <td key={pg.id} className="p-4 text-center">
                      <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-sm font-semibold ${pg.acAvailable ? "bg-blue-50 text-blue-700" : "bg-gray-100 text-gray-400"}`}>
                        {pg.acAvailable ? "✅ Yes" : "❌ No"}
                      </span>
                    </td>
                  ))}
                </tr>

                {/* Furnished */}
                <tr className="border-b border-gray-50">
                  <td className="p-4 text-sm font-medium text-gray-600 flex items-center gap-2">
                    ✨ Furnished
                  </td>
                  {compareList.map((pg) => (
                    <td key={pg.id} className="p-4 text-center">
                      <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-sm font-semibold ${pg.furnished ? "bg-violet-50 text-violet-700" : "bg-gray-100 text-gray-400"}`}>
                        {pg.furnished ? "✅ Yes" : "❌ No"}
                      </span>
                    </td>
                  ))}
                </tr>

                {/* Amenities row */}
                <tr className="border-b border-gray-50">
                  <td className="p-4 text-sm font-medium text-gray-600 align-top">
                    🛋️ Amenities
                  </td>
                  {compareList.map((pg) => (
                    <td key={pg.id} className="p-4">
                      <div className="flex flex-wrap gap-1 justify-center">
                        {allAmenities.map(amenity => {
                          const has = pg.amenities.includes(amenity);
                          return (
                            <span
                              key={amenity}
                              className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium ${
                                has ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-gray-50 text-gray-300 border border-gray-100"
                              }`}
                              title={has ? amenity : `${amenity} — not available`}
                            >
                              {amenityIcons[amenity] || "•"} {amenity}
                            </span>
                          );
                        })}
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Room Types */}
                <tr className="border-b border-gray-50">
                  <td className="p-4 text-sm font-medium text-gray-600 flex items-center gap-2">
                    🛏️ Room Types
                  </td>
                  {compareList.map((pg) => (
                    <td key={pg.id} className="p-4 text-center">
                      {pg.roomOptions && pg.roomOptions.length > 0 ? (
                        <div className="flex flex-wrap gap-1 justify-center">
                          {pg.roomOptions.map(r => (
                            <span key={r.type} className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold bg-gray-50 text-gray-700">
                              {typeLabels[r.type]} ₹{r.price.toLocaleString()}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">{typeLabels[pg.type]}</span>
                      )}
                    </td>
                  ))}
                </tr>

                {/* CTA */}
                <tr>
                  <td className="p-4"></td>
                  {compareList.map((pg) => (
                    <td key={pg.id} className="p-4 text-center">
                      <Link
                        href={`/booking/${pg.id}`}
                        className="px-5 py-2.5 bg-[#1B1C15] text-white rounded-xl text-sm font-semibold hover:bg-[#2d2e25] transition inline-block"
                      >
                        Book Now
                      </Link>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </>
  );
}
