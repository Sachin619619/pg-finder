"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import type { PGListing } from "@/data/listings";
import WishlistButton from "@/components/WishlistButton";

const areaEmojis: Record<string, string> = {
  "Koramangala": "🏙️", "Indiranagar": "🎵", "HSR Layout": "💻", "Bellandur": "🌊",
  "BTM Layout": "🎯", "Whitefield": "🏢", "Marathahalli": "🌉", "Electronic City": "⚡",
  "Hebbal": "🌿", "Kalyan Nagar": "🏡", "Kammanahalli": "🛕", "JP Nagar": "🏛️",
  "Banaswadi": "🚂", "Malleshwaram": "🌺", "Jayanagar": "🌳",
};

export default function PGCard({ pg, priority = false }: { pg: PGListing; priority?: boolean }) {
  const [imgError, setImgError] = useState(false);
  const hasImage = pg.images && pg.images.length > 0 && pg.images[0] && !imgError;

  return (
    <Link href={`/listing/${pg.id}`}>
      <div
        className="bg-[#FFFAEC] rounded-[20px] overflow-hidden cursor-pointer group h-full flex flex-col shadow-[0_2px_12px_rgba(0,0,0,0.06)] hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(0,0,0,0.10)] transition-all duration-300"
      >
        {/* Image area */}
        <div className={`relative h-52 ${hasImage ? "bg-gray-100" : "bg-[#F5ECD7]"} overflow-hidden`}>
          {hasImage ? (
            <Image
              src={pg.images[0]}
              alt={pg.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              priority={priority}
              loading={priority ? undefined : "lazy"}
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="w-12 h-12 text-[#D4C9A8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
          )}

          {/* Price badge */}
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-xl px-3.5 py-1.5 shadow-sm">
            {pg.roomOptions && pg.roomOptions.length > 1 ? (
              <>
                <span className="text-base font-semibold text-black">₹{Math.min(...pg.roomOptions.map(r => r.price)).toLocaleString()}</span>
                <span className="text-xs text-gray-500 font-medium"> – ₹{Math.max(...pg.roomOptions.map(r => r.price)).toLocaleString()}</span>
                <span className="text-[10px] text-gray-400 ml-0.5">/mo</span>
              </>
            ) : (
              <>
                <span className="text-lg font-semibold text-black">₹{pg.price.toLocaleString()}</span>
                <span className="text-[10px] text-gray-400 ml-0.5">/mo</span>
              </>
            )}
          </div>

          {/* Gender badge */}
          <div className="absolute top-4 left-4">
            <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[12px] font-semibold shadow-sm ${
              pg.gender === "male" ? "bg-gray-800/80 text-white" :
              pg.gender === "female" ? "bg-gray-700/80 text-white" :
              "bg-gray-600/80 text-white"
            }`}>
              {pg.gender === "male" ? "👨 Male" : pg.gender === "female" ? "👩 Female" : "👥 Co-ed"}
            </span>
          </div>

          {/* Wishlist heart + WhatsApp share */}
          <div className="absolute bottom-3 right-3 z-10 flex items-center gap-1.5">
            <a
              href={`https://wa.me/?text=${encodeURIComponent(`Check out this PG: ${pg.name} in ${pg.area} - ₹${pg.price.toLocaleString()}/month ⭐${pg.rating} — View on Castle: https://castleliving.in/listing/${pg.id}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="w-8 h-8 rounded-full bg-[#1B1C15]/70 backdrop-blur-sm flex items-center justify-center hover:bg-[#1B1C15]/90 hover:scale-110 transition-all duration-300 shadow-sm"
              aria-label={`Share ${pg.name} on WhatsApp`}
              title="Share on WhatsApp"
            >
              <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
            </a>
            <WishlistButton pgId={pg.id} pgName={pg.name} />
          </div>

          {/* Verified badge */}
          {pg.rating >= 4.5 && (
            <div className="absolute bottom-3 left-3">
              <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-[#1B1C15]/70 text-white backdrop-blur-sm shadow-sm">
                ✓ Verified
              </span>
            </div>
          )}

          {/* Area tag */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2">
            <span className="text-[#1B1C15] text-[11px] font-medium bg-[#FFFAEC]/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm">
              {areaEmojis[pg.area] || "📍"} {pg.area}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 flex-1 flex flex-col">
          {/* Title + Rating */}
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-[17px] font-bold text-[#1B1C15] font-serif leading-tight pr-2 tracking-tight">{pg.name}</h3>
            <div className="flex items-center gap-1 bg-[#1B1C15] px-2.5 py-1.5 rounded-xl shrink-0">
              <span className="text-sm">⭐</span>
              <span className="text-sm font-bold text-white">{pg.rating}</span>
            </div>
          </div>

          {/* Location */}
          <p className="text-sm text-gray-400 mb-4 flex items-center gap-1.5">
            <span className="text-xs">📍</span>
            <span className="truncate">{pg.locality}</span>
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {pg.roomOptions && pg.roomOptions.length > 0 ? (
              pg.roomOptions.map(r => (
                <span key={r.type} className="inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-medium bg-[#FFFAEB] text-[#1B1C15] border border-[#F0E6C8]">
                  🛏️ {r.type === "single" ? "Single" : r.type === "double" ? "Double" : "Triple"} ₹{r.price.toLocaleString()}
                </span>
              ))
            ) : (
              <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-medium bg-[#FFFAEB] text-[#1B1C15] border border-[#F0E6C8]">
                {pg.type === "single" ? "🛏️ Single" : pg.type === "double" ? "🛏️ Double" : pg.type === "triple" ? "🛏️ Triple" : "🛏️ Any"}
              </span>
            )}
            {pg.foodIncluded && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-medium bg-[#FFFAEB] text-[#1B1C15] border border-[#F0E6C8]">🍽️ Food</span>
            )}
            {pg.acAvailable && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-medium bg-[#FFFAEB] text-[#1B1C15] border border-[#F0E6C8]">❄️ AC</span>
            )}
            {pg.furnished && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-medium bg-[#FFFAEB] text-[#1B1C15] border border-[#F0E6C8]">✨ Furnished</span>
            )}
          </div>

          {/* Bottom amenities */}
          <div className="mt-auto pt-4 border-t border-[#F0E6C8] flex items-center justify-between">
            <div className="flex -space-x-1.5">
              {pg.amenities.slice(0, 4).map((a) => (
                <span
                  key={a}
                  className="w-7 h-7 rounded-full bg-[#F5F0E1] border-2 border-[#FFFAEC] flex items-center justify-center text-[9px] font-bold text-[#6B6855] shadow-sm"
                  title={a}
                >
                  {a.charAt(0)}
                </span>
              ))}
              {pg.amenities.length > 4 && (
                <span className="w-7 h-7 rounded-full bg-[#F5F0E1] border-2 border-[#FFFAEC] flex items-center justify-center text-[10px] font-bold text-[#6B6855] shadow-sm">
                  +{pg.amenities.length - 4}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {pg.distanceFromMetro && (
                <span className="text-[11px] text-gray-400 flex items-center gap-1 bg-[#F5F0E1] px-2 py-1 rounded-lg">
                  🚇 {pg.distanceFromMetro}
                </span>
              )}
              <a
                href={`https://wa.me/?text=${encodeURIComponent(`Check out this PG: ${pg.name} in ${pg.area} - ₹${pg.price.toLocaleString()}/month ⭐${pg.rating} — View on Castle: https://castleliving.in/listing/${pg.id}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center justify-center px-3 py-1.5 rounded-[14px] bg-[#1B1C15] text-white text-[11px] font-medium hover:bg-[#2C2D24] transition-colors group/wa"
                aria-label={`Share ${pg.name} on WhatsApp`}
                title="Share on WhatsApp"
              >
                <svg className="w-3.5 h-3.5 mr-1 group-hover/wa:scale-110 transition-transform" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Share
              </a>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
