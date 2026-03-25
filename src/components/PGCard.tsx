"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import type { PGListing } from "@/data/listings";
import WishlistButton from "@/components/WishlistButton";
import ShareButtons from "@/components/ShareButtons";
import { useCompare } from "@/context/CompareContext";
import CastleScore from "@/components/CastleScore";


export default function PGCard({ pg, priority = false, showCompare = true }: { pg: PGListing; priority?: boolean; showCompare?: boolean }) {
  const [imgError, setImgError] = useState(false);
  const hasImage = pg.images && pg.images.length > 0 && pg.images[0] && !imgError;

  const { isInCompare, toggleCompare } = useCompare();
  const isCompared = isInCompare(pg.id);

  return (
    <Link href={`/listing/${pg.id}`}>
      <div
        className="bg-[#FFFDF9] rounded-2xl overflow-hidden cursor-pointer group h-full flex flex-col shadow-sm hover:shadow-md transition-all duration-300"
      >
        {/* Image area */}
        <div className={`relative h-52 ${hasImage ? "bg-gray-100" : "bg-[#F0EBE0]"} overflow-hidden`}>
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
              <svg className="w-12 h-12 text-[#d4d4d4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              {pg.gender === "male" ? "Male" : pg.gender === "female" ? "Female" : "Co-ed"}
            </span>
          </div>

          {/* Compare button */}
          {showCompare && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleCompare(pg);
              }}
              aria-label={isCompared ? `Remove ${pg.name} from compare` : `Add ${pg.name} to compare`}
              className={`absolute top-[52px] left-4 z-10 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold shadow-sm backdrop-blur-sm transition-all ${
                isCompared
                  ? "bg-[#1a1a1a] text-white"
                  : "bg-white/80 text-[#1a1a1a] hover:bg-[white] border border-gray-200"
              }`}
            >
              {isCompared ? (
                <>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                  Added
                </>
              ) : (
                <>
                  Compare
                </>
              )}
            </button>
          )}

          {/* Wishlist heart + Share */}
          <div className="absolute bottom-3 right-3 z-10 flex items-center gap-1.5">
            <ShareButtons
              pgName={pg.name}
              pgArea={pg.area}
              pgPrice={pg.price}
              compact
              shareUrl={`https://castleliving.in/listing/${pg.id}`}
            />
            <WishlistButton pgId={pg.id} pgName={pg.name} />
          </div>

          {/* Verified badge */}
          {pg.rating >= 4.5 && (
            <div className="absolute bottom-3 left-3">
              <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-[#1a1a1a]/70 text-white backdrop-blur-sm shadow-sm">
                ✓ Verified
              </span>
            </div>
          )}

          {/* Area tag */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
            <span className="text-gray-700 text-[11px] font-medium bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm">
              {pg.area}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 flex-1 flex flex-col">
          {/* Title + Rating */}
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-[17px] font-bold text-[#1a1a1a] font-serif leading-tight pr-2 tracking-tight">{pg.name}</h3>
            <div className="flex flex-col items-end gap-1 shrink-0">
              <div className="flex items-center gap-1 bg-[#1a1a1a] px-2.5 py-1.5 rounded-xl">
                
                <span className="text-sm font-bold text-white">{pg.rating}</span>
              </div>
              <CastleScore pg={pg} compact />
            </div>
          </div>

          {/* Location */}
          <p className="text-sm text-[#999] mb-4 flex items-center gap-1.5">
            
            <span className="truncate">{pg.locality}</span>
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {pg.roomOptions && pg.roomOptions.length > 0 ? (
              pg.roomOptions.map(r => (
                <span key={r.type} className="inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-medium bg-[#F0EADD] text-[#333] border border-black/5">
                  {r.type === "single" ? "Single" : r.type === "double" ? "Double" : "Triple"} · ₹{r.price.toLocaleString()}
                </span>
              ))
            ) : (
              <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-medium bg-[#F0EADD] text-[#333] border border-black/5">
                {pg.type === "single" ? "Single" : pg.type === "double" ? "Double" : pg.type === "triple" ? "Triple" : "Any"} Occupancy
              </span>
            )}
            {pg.foodIncluded && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-medium bg-[#F0EADD] text-[#333] border border-black/5">Food Inc.</span>
            )}
            {pg.acAvailable && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-medium bg-[#F0EADD] text-[#333] border border-black/5">AC</span>
            )}
            {pg.furnished && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-medium bg-[#F0EADD] text-[#333] border border-black/5">Furnished</span>
            )}
          </div>

          {/* Bottom amenities */}
          <div className="mt-auto pt-4 border-t border-black/5 flex items-center justify-between">
            <div className="flex -space-x-1.5">
              {pg.amenities.slice(0, 4).map((a) => (
                <span
                  key={a}
                  className="w-7 h-7 rounded-full bg-[#F0EBE0] border-2 border-white flex items-center justify-center text-[9px] font-bold text-[#666] shadow-sm"
                  title={a}
                >
                  {a.charAt(0)}
                </span>
              ))}
              {pg.amenities.length > 4 && (
                <span className="w-7 h-7 rounded-full bg-[#F0EBE0] border-2 border-white flex items-center justify-center text-[10px] font-bold text-[#666] shadow-sm">
                  +{pg.amenities.length - 4}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {pg.distanceFromMetro && (
                <span className="text-[11px] text-[#888] flex items-center gap-1 bg-[#F0EBE0] px-2 py-1 rounded-lg">
                  {pg.distanceFromMetro}
                </span>
              )}
              <div onClick={(e) => e.stopPropagation()}>
                <ShareButtons
                  pgName={pg.name}
                  pgArea={pg.area}
                  pgPrice={pg.price}
                  compact
                  shareUrl={`https://castleliving.in/listing/${pg.id}`}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
