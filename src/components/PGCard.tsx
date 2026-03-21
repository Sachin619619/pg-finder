"use client";

import Link from "next/link";
import type { PGListing } from "@/data/listings";

const areaGradients: Record<string, string> = {
  "Koramangala": "from-orange-400 to-rose-400",
  "Indiranagar": "from-emerald-400 to-teal-500",
  "HSR Layout": "from-blue-400 to-indigo-500",
  "Bellandur": "from-cyan-400 to-blue-500",
  "BTM Layout": "from-amber-400 to-orange-500",
  "Whitefield": "from-violet-400 to-purple-500",
  "Marathahalli": "from-pink-400 to-rose-500",
  "Electronic City": "from-lime-400 to-emerald-500",
  "Hebbal": "from-fuchsia-400 to-pink-500",
  "Kalyan Nagar": "from-indigo-400 to-violet-500",
  "Kammanahalli": "from-teal-400 to-cyan-500",
  "JP Nagar": "from-rose-400 to-pink-500",
  "Banaswadi": "from-sky-400 to-blue-500",
  "Malleshwaram": "from-purple-400 to-indigo-500",
  "Jayanagar": "from-green-400 to-emerald-500",
};

export default function PGCard({ pg }: { pg: PGListing }) {
  const gradient = areaGradients[pg.area] || "from-violet-400 to-indigo-500";

  return (
    <Link href={`/listing/${pg.id}`}>
      <div className="premium-card overflow-hidden cursor-pointer group h-full flex flex-col">
        {/* Image area */}
        <div className={`relative h-52 bg-gradient-to-br ${gradient} overflow-hidden`}>
          {/* Decorative pattern */}
          <div className="absolute inset-0 opacity-20">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id={`dots-${pg.id}`} width="20" height="20" patternUnits="userSpaceOnUse">
                  <circle cx="2" cy="2" r="1" fill="white" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill={`url(#dots-${pg.id})`} />
            </svg>
          </div>

          {/* Floating icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-xl shadow-black/5">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
          </div>

          {/* Price badge */}
          <div className="absolute top-4 right-4 glass-card rounded-2xl px-4 py-2 shadow-lg">
            <span className="text-xl font-bold text-gray-900">₹{pg.price.toLocaleString()}</span>
            <span className="text-xs text-gray-500 ml-0.5">/mo</span>
          </div>

          {/* Gender badge */}
          <div className="absolute top-4 left-4">
            <span className={`pill shadow-sm ${
              pg.gender === "male" ? "bg-blue-500/90 text-white" :
              pg.gender === "female" ? "bg-pink-500/90 text-white" :
              "bg-purple-500/90 text-white"
            }`}>
              {pg.gender === "male" ? "Male" : pg.gender === "female" ? "Female" : "Co-ed"}
            </span>
          </div>

          {/* Bottom gradient overlay */}
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/20 to-transparent" />
          <div className="absolute bottom-3 left-4">
            <span className="text-white/90 text-xs font-medium bg-black/20 backdrop-blur-sm px-3 py-1 rounded-full">{pg.area}</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 flex-1 flex flex-col">
          {/* Title + Rating */}
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-[17px] font-semibold text-gray-900 group-hover:text-violet-600 transition-colors leading-tight pr-2">{pg.name}</h3>
            <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-xl shrink-0">
              <svg className="w-3.5 h-3.5 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="text-sm font-bold text-gray-800">{pg.rating}</span>
            </div>
          </div>

          {/* Location */}
          <p className="text-sm text-gray-400 mb-4 flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-gray-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
            <span className="truncate">{pg.locality}</span>
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="pill bg-gray-50 text-gray-600 !text-[11px]">
              {pg.type === "single" ? "Single" : pg.type === "double" ? "Double" : "Triple"}
            </span>
            {pg.foodIncluded && (
              <span className="pill bg-orange-50 text-orange-600 !text-[11px]">
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Food
              </span>
            )}
            {pg.acAvailable && (
              <span className="pill bg-sky-50 text-sky-600 !text-[11px]">AC</span>
            )}
            {pg.furnished && (
              <span className="pill bg-emerald-50 text-emerald-600 !text-[11px]">Furnished</span>
            )}
          </div>

          {/* Bottom amenities */}
          <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
            <div className="flex -space-x-1">
              {pg.amenities.slice(0, 3).map((a, i) => (
                <span
                  key={a}
                  className="w-7 h-7 rounded-full bg-violet-50 border-2 border-white flex items-center justify-center text-[9px] font-bold text-violet-500"
                  title={a}
                >
                  {a.charAt(0)}
                </span>
              ))}
              {pg.amenities.length > 3 && (
                <span className="w-7 h-7 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-[10px] font-semibold text-gray-500">
                  +{pg.amenities.length - 3}
                </span>
              )}
            </div>
            {pg.distanceFromMetro && (
              <span className="text-[11px] text-gray-400 flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                Metro {pg.distanceFromMetro}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
