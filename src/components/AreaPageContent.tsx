"use client";

import { useState, useMemo } from "react";
import PGCard from "@/components/PGCard";
import type { PGListing } from "@/data/listings";

type SortOption = "price-asc" | "price-desc" | "rating" | "newest";
type GenderFilter = "" | "male" | "female" | "coed";

const PRICE_CHIPS = [
  { label: "Under 8K", min: 0, max: 8000 },
  { label: "8K - 12K", min: 8000, max: 12000 },
  { label: "12K - 18K", min: 12000, max: 18000 },
  { label: "18K+", min: 18000, max: Infinity },
];

const AMENITY_TOGGLES = [
  { key: "wifi", label: "WiFi", icon: "📶" },
  { key: "ac", label: "AC", icon: "❄️" },
  { key: "food", label: "Food", icon: "🍽️" },
  { key: "laundry", label: "Laundry", icon: "🧺" },
];

export default function AreaPageContent({ listings }: { listings: PGListing[] }) {
  const [sortBy, setSortBy] = useState<SortOption>("rating");
  const [gender, setGender] = useState<GenderFilter>("");
  const [priceRange, setPriceRange] = useState<{ min: number; max: number } | null>(null);
  const [activeAmenities, setActiveAmenities] = useState<Set<string>>(new Set());

  const toggleAmenity = (key: string) => {
    setActiveAmenities((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const filtered = useMemo(() => {
    let result = [...listings];

    // Gender filter
    if (gender) {
      result = result.filter((pg) => pg.gender === gender);
    }

    // Price range
    if (priceRange) {
      result = result.filter((pg) => pg.price >= priceRange.min && pg.price < priceRange.max);
    }

    // Amenity filters
    if (activeAmenities.has("wifi")) result = result.filter((pg) => pg.wifiIncluded);
    if (activeAmenities.has("ac")) result = result.filter((pg) => pg.acAvailable);
    if (activeAmenities.has("food")) result = result.filter((pg) => pg.foodIncluded);
    if (activeAmenities.has("laundry")) result = result.filter((pg) => pg.amenities.some((a) => a.toLowerCase().includes("laundry") || a.toLowerCase().includes("washing")));

    // Sort
    switch (sortBy) {
      case "price-asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        result.sort((a, b) => b.rating - a.rating);
        break;
      case "newest":
        result.sort((a, b) => new Date(b.availableFrom).getTime() - new Date(a.availableFrom).getTime());
        break;
    }

    return result;
  }, [listings, gender, priceRange, activeAmenities, sortBy]);

  const activeFilterCount = (gender ? 1 : 0) + (priceRange ? 1 : 0) + activeAmenities.size;

  return (
    <div>
      {/* Quick Filters */}
      <div className="bg-white rounded-2xl border border-[#E8E0CC] p-5 sm:p-6 mb-8 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-[#1a1a1a]">Filter PGs</h2>
          {activeFilterCount > 0 && (
            <button
              onClick={() => { setGender(""); setPriceRange(null); setActiveAmenities(new Set()); }}
              className="text-sm text-gray-500 hover:text-[#1a1a1a] underline underline-offset-2 transition-colors"
            >
              Clear all ({activeFilterCount})
            </button>
          )}
        </div>

        {/* Gender */}
        <div className="mb-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Gender</p>
          <div className="flex flex-wrap gap-2">
            {([
              { value: "" as GenderFilter, label: "All", icon: "👥" },
              { value: "male" as GenderFilter, label: "Boys", icon: "👨" },
              { value: "female" as GenderFilter, label: "Girls", icon: "👩" },
              { value: "coed" as GenderFilter, label: "Unisex", icon: "🏠" },
            ]).map((g) => (
              <button
                key={g.value}
                onClick={() => setGender(g.value)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  gender === g.value
                    ? "bg-[#1a1a1a] text-white"
                    : "bg-gray-100 text-[#1a1a1a] hover:bg-gray-200"
                }`}
              >
                {g.icon} {g.label}
              </button>
            ))}
          </div>
        </div>

        {/* Price Range Chips */}
        <div className="mb-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Budget / month</p>
          <div className="flex flex-wrap gap-2">
            {PRICE_CHIPS.map((chip) => {
              const isActive = priceRange?.min === chip.min && priceRange?.max === chip.max;
              return (
                <button
                  key={chip.label}
                  onClick={() => setPriceRange(isActive ? null : { min: chip.min, max: chip.max })}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? "bg-[#1B1C15] text-white shadow-md"
                      : "bg-[#F5F0E1] text-[#1B1C15] hover:bg-[#EDE5D0]"
                  }`}
                >
                  {chip.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Amenity Toggles */}
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Amenities</p>
          <div className="flex flex-wrap gap-2">
            {AMENITY_TOGGLES.map((am) => {
              const isActive = activeAmenities.has(am.key);
              return (
                <button
                  key={am.key}
                  onClick={() => toggleAmenity(am.key)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? "bg-[#1B1C15] text-white shadow-md"
                      : "bg-[#F5F0E1] text-[#1B1C15] hover:bg-[#EDE5D0]"
                  }`}
                >
                  {am.icon} {am.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Sort bar + count */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-gray-600">
          <span className="font-bold text-[#1a1a1a]">{filtered.length}</span>{" "}
          {filtered.length === 1 ? "PG" : "PGs"} found
        </p>
        <div className="flex items-center gap-2">
          <label htmlFor="sort" className="text-xs text-gray-500 hidden sm:inline">Sort by:</label>
          <select
            id="sort"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white text-[#1a1a1a] focus:outline-none focus:ring-2 focus:ring-black/10"
          >
            <option value="rating">Top Rated</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="newest">Newest First</option>
          </select>
        </div>
      </div>

      {/* PG Listings Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {filtered.map((pg) => (
            <PGCard key={pg.id} pg={pg} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 mb-12">
          <div className="text-5xl mb-4">🏠</div>
          <h3 className="text-xl font-bold text-[#1a1a1a] mb-2">No PGs match your filters</h3>
          <p className="text-gray-500 mb-4">Try adjusting your filters to see more results.</p>
          <button
            onClick={() => { setGender(""); setPriceRange(null); setActiveAmenities(new Set()); }}
            className="px-6 py-2.5 bg-[#1a1a1a] text-white rounded-xl text-sm font-medium hover:opacity-80 transition-opacity"
          >
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  );
}
