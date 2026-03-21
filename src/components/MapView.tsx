"use client";

import { useState } from "react";
import type { PGListing } from "@/data/listings";
import Link from "next/link";

type Props = {
  listings: PGListing[];
};

export default function MapView({ listings }: Props) {
  const [selected, setSelected] = useState<PGListing | null>(null);

  // Bangalore center
  const centerLat = 12.9716;
  const centerLng = 77.5946;

  // Calculate position on a 800x500 map
  const toPosition = (lat: number, lng: number) => {
    const x = ((lng - 77.50) / (77.80 - 77.50)) * 100;
    const y = ((13.06 - lat) / (13.06 - 12.83)) * 100;
    return { x: Math.max(2, Math.min(98, x)), y: Math.max(2, Math.min(98, y)) };
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <svg className="w-5 h-5 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Map View — {listings.length} PGs
        </h3>
      </div>
      <div className="relative h-[500px] bg-gradient-to-br from-green-50 to-blue-50 overflow-hidden">
        {/* Map background with area labels */}
        <div className="absolute inset-0">
          {/* Grid lines */}
          <svg className="w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#6366f1" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Bangalore label */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-violet-300 text-3xl font-bold opacity-20 pointer-events-none">
          BANGALORE
        </div>

        {/* PG Markers */}
        {listings.map((pg) => {
          const pos = toPosition(pg.lat, pg.lng);
          const isSelected = selected?.id === pg.id;
          return (
            <div key={pg.id}>
              <button
                onClick={() => setSelected(isSelected ? null : pg)}
                className="absolute transform -translate-x-1/2 -translate-y-full transition-all duration-200 z-10 group"
                style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
              >
                <div className={`relative ${isSelected ? "scale-125" : "hover:scale-110"} transition-transform`}>
                  {/* Pin */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-lg ${
                    isSelected ? "bg-violet-600" : "bg-white border-2 border-violet-500"
                  }`}>
                    <span className={`text-xs font-bold ${isSelected ? "text-white" : "text-violet-600"}`}>
                      {pg.price >= 10000 ? `${Math.round(pg.price / 1000)}K` : `${(pg.price / 1000).toFixed(1)}K`}
                    </span>
                  </div>
                  {/* Pin tail */}
                  <div className={`w-2 h-2 rotate-45 mx-auto -mt-1 ${isSelected ? "bg-violet-600" : "bg-white border-r-2 border-b-2 border-violet-500"}`} />
                </div>
              </button>
            </div>
          );
        })}

        {/* Selected PG popup */}
        {selected && (
          <div className="absolute bottom-4 left-4 right-4 bg-white rounded-xl shadow-2xl border border-gray-200 p-4 z-20 animate-in slide-in-from-bottom">
            <button
              onClick={() => setSelected(null)}
              className="absolute top-2 right-2 w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-200"
            >
              x
            </button>
            <div className="flex gap-4">
              <div className="w-20 h-20 bg-violet-100 rounded-xl flex items-center justify-center shrink-0">
                <svg className="w-8 h-8 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-900 truncate">{selected.name}</h4>
                <p className="text-sm text-gray-500">{selected.locality}, {selected.area}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-lg font-bold text-violet-600">₹{selected.price.toLocaleString()}/mo</span>
                  <span className="flex items-center gap-1 text-sm">
                    <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    {selected.rating}
                  </span>
                </div>
                <Link
                  href={`/listing/${selected.id}`}
                  className="inline-block mt-2 text-sm text-violet-600 font-medium hover:underline"
                >
                  View Details →
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
