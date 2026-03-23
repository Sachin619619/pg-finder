"use client";

import Link from "next/link";
import Image from "next/image";
import { useRef, useState } from "react";
import type { PGListing } from "@/data/listings";
import WishlistButton from "@/components/WishlistButton";

const areaGradients: Record<string, string> = {
  "Koramangala": "from-orange-400 via-rose-400 to-pink-500",
  "Indiranagar": "from-emerald-400 via-teal-500 to-cyan-500",
  "HSR Layout": "from-blue-400 via-indigo-500 to-violet-500",
  "Bellandur": "from-cyan-400 via-blue-500 to-indigo-500",
  "BTM Layout": "from-amber-400 via-orange-500 to-red-400",
  "Whitefield": "from-violet-400 via-purple-500 to-fuchsia-500",
  "Marathahalli": "from-pink-400 via-rose-500 to-red-400",
  "Electronic City": "from-lime-400 via-emerald-500 to-teal-500",
  "Hebbal": "from-fuchsia-400 via-pink-500 to-rose-500",
  "Kalyan Nagar": "from-indigo-400 via-violet-500 to-purple-500",
  "Kammanahalli": "from-teal-400 via-cyan-500 to-blue-500",
  "JP Nagar": "from-rose-400 via-pink-500 to-fuchsia-500",
  "Banaswadi": "from-sky-400 via-blue-500 to-indigo-500",
  "Malleshwaram": "from-purple-400 via-indigo-500 to-blue-500",
  "Jayanagar": "from-green-400 via-emerald-500 to-teal-500",
};

const areaEmojis: Record<string, string> = {
  "Koramangala": "🏙️", "Indiranagar": "🎵", "HSR Layout": "💻", "Bellandur": "🌊",
  "BTM Layout": "🎯", "Whitefield": "🏢", "Marathahalli": "🌉", "Electronic City": "⚡",
  "Hebbal": "🌿", "Kalyan Nagar": "🏡", "Kammanahalli": "🛕", "JP Nagar": "🏛️",
  "Banaswadi": "🚂", "Malleshwaram": "🌺", "Jayanagar": "🌳",
};

export default function PGCard({ pg, priority = false }: { pg: PGListing; priority?: boolean }) {
  const gradient = areaGradients[pg.area] || "from-violet-400 via-purple-500 to-indigo-500";
  const cardRef = useRef<HTMLDivElement>(null);
  const [imgError, setImgError] = useState(false);
  const hasImage = pg.images && pg.images.length > 0 && pg.images[0] && !imgError;

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    cardRef.current.style.setProperty("--mouse-x", `${x}%`);
    cardRef.current.style.setProperty("--mouse-y", `${y}%`);
  };

  return (
    <Link href={`/listing/${pg.id}`}>
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        className="premium-card spotlight overflow-hidden cursor-pointer group h-full flex flex-col"
      >
        {/* Image area */}
        <div className={`relative h-52 ${hasImage ? "bg-gray-200" : `bg-gradient-to-br ${gradient}`} overflow-hidden`}>
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
            <>
              {/* Animated mesh pattern */}
              <div className="absolute inset-0 opacity-[0.15]">
                <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <pattern id={`mesh-${pg.id}`} width="30" height="30" patternUnits="userSpaceOnUse">
                      <circle cx="2" cy="2" r="1" fill="white" />
                      <circle cx="15" cy="15" r="0.5" fill="white" opacity="0.5" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill={`url(#mesh-${pg.id})`} />
                </svg>
              </div>
              {/* Floating house icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 bg-white/15 backdrop-blur-xl rounded-3xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-700 shadow-2xl shadow-black/10 border border-white/10">
                  <svg className="w-10 h-10 text-white drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
              </div>
            </>
          )}

          {/* Price badge — glassmorphism */}
          <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-xl rounded-2xl px-4 py-2 shadow-lg border border-white/50">
            {pg.roomOptions && pg.roomOptions.length > 1 ? (
              <>
                <span className="text-lg font-extrabold text-gray-900">₹{Math.min(...pg.roomOptions.map(r => r.price)).toLocaleString()}</span>
                <span className="text-xs text-gray-500 font-medium"> – ₹{Math.max(...pg.roomOptions.map(r => r.price)).toLocaleString()}</span>
                <span className="text-[10px] text-gray-500 ml-0.5 font-medium">/mo</span>
              </>
            ) : (
              <>
                <span className="text-xl font-extrabold text-gray-900">₹{pg.price.toLocaleString()}</span>
                <span className="text-[10px] text-gray-500 ml-0.5 font-medium">/mo</span>
              </>
            )}
          </div>

          {/* Gender badge */}
          <div className="absolute top-4 left-4">
            <span className={`pill shadow-lg backdrop-blur-sm border border-white/20 !text-[12px] !font-semibold ${
              pg.gender === "male" ? "bg-blue-500/90 text-white" :
              pg.gender === "female" ? "bg-pink-500/90 text-white" :
              "bg-purple-500/90 text-white"
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
              className="w-8 h-8 rounded-full bg-green-500/90 backdrop-blur-sm flex items-center justify-center hover:bg-green-600 hover:scale-110 transition-all duration-300 shadow-lg border border-green-400/30"
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
              <span className="pill bg-emerald-500/90 text-white !text-[10px] !py-1 !px-2.5 shadow-lg backdrop-blur-sm border border-emerald-400/30">
                ✓ Verified
              </span>
            </div>
          )}

          {/* Area tag */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2">
            <span className="text-white/70 text-[11px] font-medium bg-black/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/5">
              {areaEmojis[pg.area] || "📍"} {pg.area}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 flex-1 flex flex-col">
          {/* Title + Rating */}
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-[17px] font-bold text-gray-900 dark:text-white group-hover:text-violet-600 transition-colors leading-tight pr-2 tracking-tight">{pg.name}</h3>
            <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-900/30 px-2.5 py-1.5 rounded-xl shrink-0">
              <span className="text-sm">⭐</span>
              <span className="text-sm font-extrabold text-gray-800 dark:text-amber-400">{pg.rating}</span>
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
                <span key={r.type} className="pill bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 !text-[11px] border border-gray-100 dark:border-gray-700">
                  🛏️ {r.type === "single" ? "Single" : r.type === "double" ? "Double" : "Triple"} ₹{r.price.toLocaleString()}
                </span>
              ))
            ) : (
              <span className="pill bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 !text-[11px] border border-gray-100 dark:border-gray-700">
                {pg.type === "single" ? "🛏️ Single" : pg.type === "double" ? "🛏️ Double" : pg.type === "triple" ? "🛏️ Triple" : "🛏️ Any"}
              </span>
            )}
            {pg.foodIncluded && (
              <span className="pill bg-orange-50 dark:bg-orange-900/30 text-orange-600 !text-[11px] border border-orange-100 dark:border-orange-800">🍽️ Food</span>
            )}
            {pg.acAvailable && (
              <span className="pill bg-sky-50 dark:bg-sky-900/30 text-sky-600 !text-[11px] border border-sky-100 dark:border-sky-800">❄️ AC</span>
            )}
            {pg.furnished && (
              <span className="pill bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 !text-[11px] border border-emerald-100 dark:border-emerald-800">✨ Furnished</span>
            )}
          </div>

          {/* Bottom amenities */}
          <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <div className="flex -space-x-1.5">
              {pg.amenities.slice(0, 4).map((a) => (
                <span
                  key={a}
                  className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/50 dark:to-purple-900/50 border-2 border-white dark:border-gray-900 flex items-center justify-center text-[9px] font-bold text-violet-500 shadow-sm"
                  title={a}
                >
                  {a.charAt(0)}
                </span>
              ))}
              {pg.amenities.length > 4 && (
                <span className="w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-800 border-2 border-white dark:border-gray-900 flex items-center justify-center text-[10px] font-bold text-gray-500 shadow-sm">
                  +{pg.amenities.length - 4}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {pg.distanceFromMetro && (
                <span className="text-[11px] text-gray-400 flex items-center gap-1 bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded-lg">
                  🚇 {pg.distanceFromMetro}
                </span>
              )}
              <a
                href={`https://wa.me/?text=${encodeURIComponent(`Check out this PG: ${pg.name} in ${pg.area} - ₹${pg.price.toLocaleString()}/month ⭐${pg.rating} — View on Castle: https://castleliving.in/listing/${pg.id}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="w-7 h-7 rounded-lg bg-green-50 dark:bg-green-900/30 flex items-center justify-center hover:bg-green-100 dark:hover:bg-green-900/50 transition-all group/wa"
                aria-label={`Share ${pg.name} on WhatsApp`}
                title="Share on WhatsApp"
              >
                <svg className="w-3.5 h-3.5 text-green-600 dark:text-green-400 group-hover/wa:scale-110 transition-transform" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
