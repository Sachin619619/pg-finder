"use client";

import { useState } from "react";
import { areas, amenities } from "@/data/listings";

type Filters = {
  search: string;
  area: string;
  minPrice: number;
  maxPrice: number;
  gender: string;
  roomType: string;
  amenities: string[];
  foodIncluded: boolean | null;
  acAvailable: boolean | null;
};

type Props = {
  filters: Filters;
  onChange: (filters: Filters) => void;
};

export default function SearchFilters({ filters, onChange }: Props) {
  const [expanded, setExpanded] = useState(false);

  const update = (partial: Partial<Filters>) => {
    onChange({ ...filters, ...partial });
  };

  const toggleAmenity = (a: string) => {
    const next = filters.amenities.includes(a)
      ? filters.amenities.filter((x) => x !== a)
      : [...filters.amenities, a];
    update({ amenities: next });
  };

  const activeFilters = [
    filters.area,
    filters.gender,
    filters.roomType,
    filters.minPrice > 0 ? "min" : "",
    filters.maxPrice < 50000 ? "max" : "",
    filters.foodIncluded !== null ? "food" : "",
    filters.acAvailable !== null ? "ac" : "",
    ...filters.amenities,
  ].filter(Boolean).length;

  return (
    <div className="premium-card !rounded-2xl overflow-hidden">
      {/* Collapsed view — always visible */}
      <div className="p-5 flex items-center gap-4">
        <div className="flex-1 relative">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search PG name, area, landmark..."
            className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-xl text-[15px] text-gray-700 placeholder-gray-300 focus:bg-white:bg-gray-800 focus:ring-2 focus:ring-[#1B1C15]/20 border border-transparent focus:border-[#d4ccb5]:border-[#1B1C15]/30 outline-none transition-all"
            value={filters.search}
            onChange={(e) => update({ search: e.target.value })}
          />
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium transition-all ${
            expanded || activeFilters > 0
              ? "bg-[#1B1C15] text-white shadow-lg shadow-black/20"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200:bg-gray-700"
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Filters
          {activeFilters > 0 && (
            <span className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center text-[11px] font-bold">
              {activeFilters}
            </span>
          )}
        </button>
      </div>

      {/* Expanded filters */}
      {expanded && (
        <div className="px-5 pb-6 border-t border-gray-100 pt-5 animate-slide-up space-y-5">
          {/* Row 1 — Area, Price */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Area</label>
              <select
                className="premium-input w-full text-sm"
                value={filters.area}
                onChange={(e) => update({ area: e.target.value })}
              >
                <option value="">All Areas</option>
                {areas.map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Min Budget</label>
              <select
                className="premium-input w-full text-sm"
                value={filters.minPrice}
                onChange={(e) => update({ minPrice: Number(e.target.value) })}
              >
                <option value={0}>No Min</option>
                <option value={5000}>₹5,000</option>
                <option value={7000}>₹7,000</option>
                <option value={8000}>₹8,000</option>
                <option value={10000}>₹10,000</option>
                <option value={12000}>₹12,000</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Max Budget</label>
              <select
                className="premium-input w-full text-sm"
                value={filters.maxPrice}
                onChange={(e) => update({ maxPrice: Number(e.target.value) })}
              >
                <option value={50000}>No Max</option>
                <option value={7000}>₹7,000</option>
                <option value={8000}>₹8,000</option>
                <option value={10000}>₹10,000</option>
                <option value={12000}>₹12,000</option>
                <option value={15000}>₹15,000</option>
              </select>
            </div>
          </div>

          {/* Row 2 — Gender, Room, Food, AC */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Gender</label>
              <select className="premium-input w-full text-sm" value={filters.gender} onChange={(e) => update({ gender: e.target.value })}>
                <option value="">Any</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="coed">Co-ed</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Room Type</label>
              <select className="premium-input w-full text-sm" value={filters.roomType} onChange={(e) => update({ roomType: e.target.value })}>
                <option value="">Any</option>
                <option value="single">Single</option>
                <option value="double">Double</option>
                <option value="triple">Triple</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Food</label>
              <select
                className="premium-input w-full text-sm"
                value={filters.foodIncluded === null ? "" : filters.foodIncluded ? "yes" : "no"}
                onChange={(e) => update({ foodIncluded: e.target.value === "" ? null : e.target.value === "yes" })}
              >
                <option value="">Any</option>
                <option value="yes">Included</option>
                <option value="no">Not Included</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">AC</label>
              <select
                className="premium-input w-full text-sm"
                value={filters.acAvailable === null ? "" : filters.acAvailable ? "yes" : "no"}
                onChange={(e) => update({ acAvailable: e.target.value === "" ? null : e.target.value === "yes" })}
              >
                <option value="">Any</option>
                <option value="yes">AC</option>
                <option value="no">Non-AC</option>
              </select>
            </div>
          </div>

          {/* Amenities */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Amenities</label>
            <div className="flex flex-wrap gap-2">
              {amenities.map((a) => (
                <button
                  key={a}
                  onClick={() => toggleAmenity(a)}
                  className={`pill transition-all text-[13px] ${
                    filters.amenities.includes(a)
                      ? "bg-[#1B1C15] text-white shadow-md shadow-black/20"
                      : "bg-gray-50 text-gray-500 hover:bg-gray-100:bg-gray-700 border border-gray-100"
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>

          {/* Clear button */}
          {activeFilters > 0 && (
            <button
              onClick={() => onChange({ ...filters, area: "", minPrice: 0, maxPrice: 50000, gender: "", roomType: "", amenities: [], foodIncluded: null, acAvailable: null })}
              className="text-sm text-[#1B1C15] hover:text-[#2a2b22] font-medium"
            >
              Clear all filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}
