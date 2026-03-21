"use client";

import Link from "next/link";
import type { PGListing } from "@/data/listings";

export default function PGCard({ pg }: { pg: PGListing }) {
  const genderColors = {
    male: "bg-blue-100 text-blue-700",
    female: "bg-pink-100 text-pink-700",
    coed: "bg-purple-100 text-purple-700",
  };

  const typeLabels = {
    single: "Single Room",
    double: "Double Sharing",
    triple: "Triple Sharing",
    any: "Any",
  };

  return (
    <Link href={`/listing/${pg.id}`}>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg hover:border-violet-200 transition-all duration-300 cursor-pointer group">
        {/* Image placeholder */}
        <div className="relative h-48 bg-gradient-to-br from-violet-100 to-indigo-100 flex items-center justify-center overflow-hidden">
          <div className="text-center">
            <div className="w-16 h-16 bg-white/80 rounded-2xl flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
              <svg className="w-8 h-8 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <span className="text-sm text-violet-600 font-medium">{pg.area}</span>
          </div>
          {/* Price badge */}
          <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm">
            <span className="text-lg font-bold text-gray-900">₹{pg.price.toLocaleString()}</span>
            <span className="text-xs text-gray-500">/mo</span>
          </div>
          {/* Gender badge */}
          <div className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-semibold ${genderColors[pg.gender]}`}>
            {pg.gender === "male" ? "Male" : pg.gender === "female" ? "Female" : "Co-ed"}
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-violet-600 transition">{pg.name}</h3>
            <div className="flex items-center gap-1 shrink-0 ml-2">
              <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="text-sm font-semibold text-gray-700">{pg.rating}</span>
              <span className="text-xs text-gray-400">({pg.reviews})</span>
            </div>
          </div>

          <p className="text-sm text-gray-500 mb-3 flex items-center gap-1">
            <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {pg.locality}, {pg.area}
          </p>

          <div className="flex items-center gap-2 mb-3">
            <span className="px-2.5 py-1 bg-gray-100 rounded-lg text-xs font-medium text-gray-600">{typeLabels[pg.type]}</span>
            {pg.furnished && <span className="px-2.5 py-1 bg-green-50 rounded-lg text-xs font-medium text-green-700">Furnished</span>}
            {pg.foodIncluded && <span className="px-2.5 py-1 bg-orange-50 rounded-lg text-xs font-medium text-orange-700">Food</span>}
            {pg.acAvailable && <span className="px-2.5 py-1 bg-blue-50 rounded-lg text-xs font-medium text-blue-700">AC</span>}
          </div>

          {/* Amenities preview */}
          <div className="flex flex-wrap gap-1.5">
            {pg.amenities.slice(0, 4).map((a) => (
              <span key={a} className="text-xs text-gray-500 bg-gray-50 px-2 py-0.5 rounded">
                {a}
              </span>
            ))}
            {pg.amenities.length > 4 && (
              <span className="text-xs text-violet-600 bg-violet-50 px-2 py-0.5 rounded font-medium">
                +{pg.amenities.length - 4} more
              </span>
            )}
          </div>

          {pg.distanceFromMetro && (
            <div className="mt-3 flex items-center gap-1.5 text-xs text-gray-500">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              Metro: {pg.distanceFromMetro}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
