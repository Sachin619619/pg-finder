"use client";

import Image from "next/image";
import { useCompare } from "@/context/CompareContext";

export default function CompareBar() {
  const { compareList, removeFromCompare, clearCompare, setShowModal } = useCompare();

  if (compareList.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 animate-in slide-in-from-bottom duration-300">
      <div className="bg-[#FFFDF9] border-t border-black/[0.06] shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Left: Selected PG thumbnails */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-lg">&#x2696;&#xFE0F;</span>
                <span className="text-sm font-semibold text-[#1a1a1a] hidden sm:inline">
                  Compare
                </span>
                <span className="text-xs text-[#8a8070] font-medium">
                  ({compareList.length}/3)
                </span>
              </div>

              <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
                {compareList.map((pg) => (
                  <div
                    key={pg.id}
                    className="flex items-center gap-2 bg-[#FFFDF9] border border-black/8 rounded-xl px-2 py-1.5 shrink-0 group"
                  >
                    {/* Thumbnail */}
                    <div className="relative w-9 h-9 rounded-lg overflow-hidden bg-[#EDE8DE] shrink-0">
                      {pg.images && pg.images.length > 0 && pg.images[0] ? (
                        <Image
                          src={pg.images[0]}
                          alt={pg.name}
                          fill
                          className="object-cover"
                          sizes="36px"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-xs">&#x1F3E0;</span>
                        </div>
                      )}
                    </div>

                    {/* Name */}
                    <span className="text-xs font-medium text-[#1a1a1a] max-w-[100px] truncate hidden sm:inline">
                      {pg.name}
                    </span>

                    {/* Remove button */}
                    <button
                      onClick={() => removeFromCompare(pg.id)}
                      className="w-5 h-5 rounded-full bg-[#1a1a1a]/10 hover:bg-red-100 hover:text-red-500 flex items-center justify-center text-[#8a8070] transition-colors shrink-0"
                      aria-label={`Remove ${pg.name} from compare`}
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}

                {/* Empty slots */}
                {Array.from({ length: 3 - compareList.length }).map((_, i) => (
                  <div
                    key={`empty-${i}`}
                    className="w-9 h-9 rounded-xl border-2 border-dashed border-[#1B5E3B]/20 flex items-center justify-center shrink-0"
                  >
                    <span className="text-[#1B5E3B]/30 text-xs">+</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={clearCompare}
                className="text-xs font-medium text-[#8a8070] hover:text-red-500 transition-colors px-3 py-2 rounded-lg hover:bg-red-50"
              >
                Clear
              </button>
              <button
                onClick={() => setShowModal(true)}
                disabled={compareList.length < 2}
                className={`rounded-full px-6 py-3 text-sm font-semibold transition-all ${
                  compareList.length >= 2
                    ? "bg-[#1B5E3B] text-white hover:shadow-lg shadow-md"
                    : "bg-[#EDE8DE] text-[#8a8070] cursor-not-allowed"
                }`}
              >
                Compare Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
