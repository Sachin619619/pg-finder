"use client";

import type { PGListing } from "@/data/listings";

type Props = {
  items: PGListing[];
  onRemove: (id: string) => void;
  onClear: () => void;
};

export default function CompareDrawer({ items, onRemove, onClear }: Props) {
  if (items.length === 0) return null;

  const typeLabels = { single: "Single", double: "Double", triple: "Triple", any: "Any" };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-2xl z-50 animate-in slide-in-from-bottom">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Compare PGs ({items.length}/3)</h3>
          <button onClick={onClear} className="text-sm text-red-500 hover:text-red-700 font-medium">Clear All</button>
        </div>

        {items.length >= 2 ? (
          <div className="overflow-x-auto scrollbar-hide">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 pr-4 text-gray-500 font-medium w-32">Feature</th>
                  {items.map((pg) => (
                    <th key={pg.id} className="text-left py-2 px-4">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-gray-900 truncate">{pg.name}</span>
                        <button onClick={() => onRemove(pg.id)} className="ml-2 text-gray-400 hover:text-red-500">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { label: "Price", render: (pg: PGListing) => `₹${pg.price.toLocaleString()}/mo` },
                  { label: "Area", render: (pg: PGListing) => pg.area },
                  { label: "Room Type", render: (pg: PGListing) => typeLabels[pg.type] },
                  { label: "Rating", render: (pg: PGListing) => `${pg.rating} (${pg.reviews} reviews)` },
                  { label: "Food", render: (pg: PGListing) => pg.foodIncluded ? "Included" : "Not Included" },
                  { label: "AC", render: (pg: PGListing) => pg.acAvailable ? "Available" : "No" },
                  { label: "WiFi", render: (pg: PGListing) => pg.wifiIncluded ? "Included" : "No" },
                  { label: "Metro", render: (pg: PGListing) => pg.distanceFromMetro || "N/A" },
                  { label: "Amenities", render: (pg: PGListing) => `${pg.amenities.length} amenities` },
                ].map((row) => (
                  <tr key={row.label} className="border-b border-gray-100">
                    <td className="py-2 pr-4 text-gray-500 font-medium">{row.label}</td>
                    {items.map((pg) => (
                      <td key={pg.id} className="py-2 px-4 text-gray-700">{row.render(pg)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            {items.map((pg) => (
              <div key={pg.id} className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-lg">
                <span className="text-sm font-medium text-[#1a1a1a]">{pg.name}</span>
                <button onClick={() => onRemove(pg.id)} className="text-[#8a8070] hover:text-red-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
            <span className="text-sm text-gray-500">Add {3 - items.length} more to compare</span>
          </div>
        )}
      </div>
    </div>
  );
}
