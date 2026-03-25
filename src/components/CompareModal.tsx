"use client";

import { useEffect } from "react";
import Image from "next/image";
import { useCompare } from "@/context/CompareContext";
import type { PGListing } from "@/data/listings";

const typeLabels: Record<string, string> = {
  single: "Single",
  double: "Double",
  triple: "Triple",
  any: "Any",
};

const amenityIcons: Record<string, string> = {
  WiFi: "\uD83D\uDCF6",
  AC: "\u2744\uFE0F",
  Food: "\uD83C\uDF5D",
  Laundry: "\uD83E\uDDFA",
  Parking: "\uD83C\uDD7F\uFE0F",
  Gym: "\uD83C\uDFCB\uFE0F",
  "Power Backup": "\u26A1",
  CCTV: "\uD83D\uDCF7",
  "Hot Water": "\uD83D\uDEB0",
  TV: "\uD83D\uDCFA",
  Fridge: "\uD83E\uDDCA",
  "Washing Machine": "\uD83E\uDDFC",
  Housekeeping: "\uD83E\uDDF9",
  Security: "\uD83D\uDD12",
};

function getBestPrice(items: PGListing[]): number {
  return Math.min(...items.map((pg) => pg.price));
}

function getBestRating(items: PGListing[]): number {
  return Math.max(...items.map((pg) => pg.rating));
}

// Collect all unique amenities across compared PGs
function getAllAmenities(items: PGListing[]): string[] {
  const set = new Set<string>();
  items.forEach((pg) => pg.amenities.forEach((a) => set.add(a)));
  return Array.from(set).sort();
}

export default function CompareModal() {
  const { compareList, removeFromCompare, showModal, setShowModal } = useCompare();

  // Lock body scroll when modal is open
  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [showModal]);

  if (!showModal || compareList.length < 2) return null;

  const bestPrice = getBestPrice(compareList);
  const bestRating = getBestRating(compareList);
  const allAmenities = getAllAmenities(compareList);

  const rows: { label: string; icon: string; render: (pg: PGListing) => React.ReactNode }[] = [
    {
      label: "Price",
      icon: "\uD83D\uDCB0",
      render: (pg) => (
        <div className={pg.price === bestPrice ? "text-green-700 font-bold" : ""}>
          <span className="text-lg font-semibold">\u20B9{pg.price.toLocaleString()}</span>
          <span className="text-xs text-[#8a8070] ml-1">/mo</span>
          {pg.price === bestPrice && (
            <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-700">
              Best
            </span>
          )}
        </div>
      ),
    },
    {
      label: "Rating",
      icon: "\u2B50",
      render: (pg) => (
        <div className={pg.rating === bestRating ? "text-amber-700 font-bold" : ""}>
          <span className="text-lg font-semibold">{pg.rating}</span>
          <span className="text-xs text-[#8a8070] ml-1">({pg.reviews} reviews)</span>
          {pg.rating === bestRating && (
            <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700">
              Top
            </span>
          )}
        </div>
      ),
    },
    {
      label: "Location",
      icon: "\uD83D\uDCCD",
      render: (pg) => (
        <div>
          <div className="font-medium text-[#1a1a1a]">{pg.area}</div>
          <div className="text-xs text-[#8a8070]">{pg.locality}</div>
        </div>
      ),
    },
    {
      label: "Gender",
      icon: "\uD83D\uDC65",
      render: (pg) => (
        <span className="capitalize">
          {pg.gender === "male" ? "\uD83D\uDC68 Male" : pg.gender === "female" ? "\uD83D\uDC69 Female" : "\uD83D\uDC65 Co-ed"}
        </span>
      ),
    },
    {
      label: "Room Type",
      icon: "\uD83D\uDECF\uFE0F",
      render: (pg) => {
        if (pg.roomOptions && pg.roomOptions.length > 0) {
          return (
            <div className="space-y-1">
              {pg.roomOptions.map((r) => (
                <div key={r.type} className="text-xs">
                  <span className="font-medium">{typeLabels[r.type]}</span>
                  <span className="text-[#8a8070] ml-1">\u20B9{r.price.toLocaleString()}</span>
                  {r.available ? (
                    <span className="ml-1 text-green-600">\u2713</span>
                  ) : (
                    <span className="ml-1 text-red-400">Full</span>
                  )}
                </div>
              ))}
            </div>
          );
        }
        return <span>{typeLabels[pg.type]}</span>;
      },
    },
    {
      label: "Food",
      icon: "\uD83C\uDF7D\uFE0F",
      render: (pg) =>
        pg.foodIncluded ? (
          <span className="text-green-600 font-medium">\u2713 Included</span>
        ) : (
          <span className="text-[#8a8070]">\u2717 Not Included</span>
        ),
    },
    {
      label: "AC",
      icon: "\u2744\uFE0F",
      render: (pg) =>
        pg.acAvailable ? (
          <span className="text-green-600 font-medium">\u2713 Available</span>
        ) : (
          <span className="text-[#8a8070]">\u2717 No</span>
        ),
    },
    {
      label: "WiFi",
      icon: "\uD83D\uDCF6",
      render: (pg) =>
        pg.wifiIncluded ? (
          <span className="text-green-600 font-medium">\u2713 Included</span>
        ) : (
          <span className="text-[#8a8070]">\u2717 No</span>
        ),
    },
    {
      label: "Furnished",
      icon: "\uD83E\uDE91",
      render: (pg) =>
        pg.furnished ? (
          <span className="text-green-600 font-medium">\u2713 Yes</span>
        ) : (
          <span className="text-[#8a8070]">\u2717 No</span>
        ),
    },
    {
      label: "Metro",
      icon: "\uD83D\uDE87",
      render: (pg) => (
        <span>{pg.distanceFromMetro || "N/A"}</span>
      ),
    },
  ];

  return (
    <div className="fixed inset-0 z-[60] flex flex-col">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => setShowModal(false)}
      />

      {/* Modal container */}
      <div className="relative z-10 flex flex-col h-full max-h-screen animate-in fade-in duration-200">
        {/* Header */}
        <div className="bg-[#EDE8DE] border-b border-black/8 px-4 sm:px-6 py-4 shrink-0">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div>
              <h2 className="font-serif text-xl sm:text-2xl text-[#1a1a1a] tracking-tight">
                Compare PGs
              </h2>
              <p className="text-xs text-[#8a8070] mt-0.5">
                Side-by-side comparison of {compareList.length} PGs
              </p>
            </div>
            <button
              onClick={() => setShowModal(false)}
              className="w-10 h-10 rounded-xl bg-[#1a1a1a]/10 hover:bg-[#1a1a1a]/20 flex items-center justify-center transition-colors"
              aria-label="Close comparison"
            >
              <svg className="w-5 h-5 text-[#1a1a1a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-auto bg-[#FDFAF0]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
            {/* PG header cards */}
            <div className="grid gap-4" style={{ gridTemplateColumns: `140px repeat(${compareList.length}, 1fr)` }}>
              {/* Empty corner */}
              <div />
              {compareList.map((pg) => (
                <div
                  key={pg.id}
                  className="bg-[#F5F0E8] rounded-2xl border border-black/8 p-4 text-center relative group"
                >
                  {/* Remove button */}
                  <button
                    onClick={() => {
                      removeFromCompare(pg.id);
                      if (compareList.length <= 2) setShowModal(false);
                    }}
                    className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[#1a1a1a]/10 hover:bg-red-100 hover:text-red-500 flex items-center justify-center text-[#8a8070] opacity-0 group-hover:opacity-100 transition-all"
                    aria-label={`Remove ${pg.name}`}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>

                  {/* Image */}
                  <div className="relative w-20 h-20 mx-auto rounded-xl overflow-hidden bg-[#d4c9a8] mb-3">
                    {pg.images && pg.images.length > 0 && pg.images[0] ? (
                      <Image
                        src={pg.images[0]}
                        alt={pg.name}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-[#D4C9A8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Name */}
                  <h3 className="font-serif text-sm font-bold text-[#1a1a1a] leading-tight mb-1">
                    {pg.name}
                  </h3>

                  {/* Gender badge */}
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                      pg.gender === "male"
                        ? "bg-blue-50 text-blue-700"
                        : pg.gender === "female"
                        ? "bg-pink-50 text-pink-700"
                        : "bg-purple-50 text-purple-700"
                    }`}
                  >
                    {pg.gender === "male" ? "\uD83D\uDC68 Male" : pg.gender === "female" ? "\uD83D\uDC69 Female" : "\uD83D\uDC65 Co-ed"}
                  </span>
                </div>
              ))}
            </div>

            {/* Comparison rows */}
            <div className="mt-6 rounded-2xl border border-black/8 overflow-hidden bg-[#FFFDF9]">
              {rows.map((row, rowIdx) => (
                <div
                  key={row.label}
                  className={`grid items-center ${rowIdx !== rows.length - 1 ? "border-b border-[#f0e6c8]" : ""}`}
                  style={{ gridTemplateColumns: `140px repeat(${compareList.length}, 1fr)` }}
                >
                  {/* Label */}
                  <div className="px-4 py-3.5 bg-[#FDFAF0] border-r border-[#f0e6c8]">
                    <span className="text-sm font-medium text-[#1a1a1a] flex items-center gap-2">
                      <span className="text-base">{row.icon}</span>
                      {row.label}
                    </span>
                  </div>

                  {/* Values */}
                  {compareList.map((pg) => (
                    <div
                      key={pg.id}
                      className="px-4 py-3.5 text-sm text-[#1a1a1a]"
                    >
                      {row.render(pg)}
                    </div>
                  ))}
                </div>
              ))}

              {/* Amenities section */}
              <div className="border-t-2 border-black/8">
                <div
                  className="grid items-start"
                  style={{ gridTemplateColumns: `140px repeat(${compareList.length}, 1fr)` }}
                >
                  <div className="px-4 py-3.5 bg-[#FDFAF0] border-r border-[#f0e6c8]">
                    <span className="text-sm font-semibold text-[#1a1a1a] flex items-center gap-2">
                      <span className="text-base">{"\u2728"}</span>
                      Amenities
                    </span>
                  </div>
                  {compareList.map((pg) => (
                    <div key={pg.id} className="px-4 py-3.5">
                      <span className="text-xs font-semibold text-[#8a8070]">
                        {pg.amenities.length} total
                      </span>
                    </div>
                  ))}
                </div>

                {allAmenities.map((amenity, aIdx) => (
                  <div
                    key={amenity}
                    className={`grid items-center ${aIdx !== allAmenities.length - 1 ? "border-b border-[#f0e6c8]/60" : ""}`}
                    style={{ gridTemplateColumns: `140px repeat(${compareList.length}, 1fr)` }}
                  >
                    <div className="px-4 py-2.5 bg-[#FDFAF0]/50 border-r border-[#f0e6c8] pl-8">
                      <span className="text-xs text-[#8a8070] flex items-center gap-1.5">
                        <span>{amenityIcons[amenity] || "\u2022"}</span>
                        {amenity}
                      </span>
                    </div>
                    {compareList.map((pg) => (
                      <div key={pg.id} className="px-4 py-2.5">
                        {pg.amenities.includes(amenity) ? (
                          <span className="text-green-600 text-sm font-bold">{"\u2713"}</span>
                        ) : (
                          <span className="text-red-300 text-sm">{"\u2717"}</span>
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Nearby landmarks */}
            <div className="mt-6 rounded-2xl border border-black/8 overflow-hidden bg-[#FFFDF9]">
              <div
                className="grid items-start"
                style={{ gridTemplateColumns: `140px repeat(${compareList.length}, 1fr)` }}
              >
                <div className="px-4 py-3.5 bg-[#FDFAF0] border-r border-[#f0e6c8]">
                  <span className="text-sm font-semibold text-[#1a1a1a] flex items-center gap-2">
                    <span className="text-base">{"\uD83D\uDDFA\uFE0F"}</span>
                    Nearby
                  </span>
                </div>
                {compareList.map((pg) => (
                  <div key={pg.id} className="px-4 py-3.5">
                    <div className="flex flex-wrap gap-1.5">
                      {pg.nearbyLandmarks.slice(0, 5).map((l) => (
                        <span
                          key={l}
                          className="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-medium bg-[#EDE8DE] text-[#1a1a1a] border border-black/8"
                        >
                          {l}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
