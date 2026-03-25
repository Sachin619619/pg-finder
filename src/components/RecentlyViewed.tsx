"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";

export default function RecentlyViewed() {
  const { items, clearRecent } = useRecentlyViewed();

  if (items.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#1B1C15] rounded-xl flex items-center justify-center shadow-lg shadow-black/20">
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">
              Recently Viewed
            </h2>
            <p className="text-xs text-gray-400">Pick up where you left off</p>
          </div>
        </div>
        <button
          onClick={clearRecent}
          className="text-xs text-gray-400 hover:text-red-500 transition-colors font-medium"
        >
          Clear History
        </button>
      </div>

      {/* Horizontal scrollable row with snap */}
      <div className="flex gap-4 overflow-x-auto pb-3 scrollbar-hide -mx-1 px-1 snap-x snap-mandatory scroll-smooth">
        {items.map((item) => (
          <RecentCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}

function RecentCard({
  item,
}: {
  item: {
    id: string;
    name: string;
    area: string;
    price: number;
    rating: number;
    image: string;
  };
}) {
  const [imgError, setImgError] = useState(false);
  const hasImage = item.image && !imgError;

  return (
    <Link
      href={`/listing/${item.id}`}
      className="group flex-shrink-0 w-56 bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg hover:shadow-black/10 hover:border-[#d4ccb5] transition-all hover:-translate-y-0.5 snap-start"
    >
      {/* Thumbnail */}
      <div className="relative h-28 bg-[#F5ECD7] overflow-hidden">
        {hasImage ? (
          <Image
            src={item.image}
            alt={item.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="224px"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-[#D4C9A8]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
          </div>
        )}

        {/* Rating badge */}
        {item.rating > 0 && (
          <div className="absolute top-2 right-2 flex items-center gap-0.5 bg-[#1B1C15]/80 backdrop-blur-sm px-1.5 py-0.5 rounded-lg">
            <span className="text-[10px]">⭐</span>
            <span className="text-[11px] font-bold text-white">
              {item.rating}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3">
        <h3 className="text-sm font-bold text-gray-900 truncate group-hover:text-[#3d3829] transition-colors">
          {item.name}
        </h3>
        <div className="flex items-center justify-between mt-1.5">
          <p className="text-xs text-gray-400 flex items-center gap-1 truncate">
            <svg
              className="w-3 h-3 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            {item.area}
          </p>
          <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full whitespace-nowrap">
            ₹{item.price.toLocaleString("en-IN")}
          </span>
        </div>
      </div>
    </Link>
  );
}
