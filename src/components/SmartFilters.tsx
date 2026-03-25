"use client";

import { useState } from "react";
import { areas } from "@/data/listings";
import { areaSafetyScores } from "@/data/safetyData";

interface SmartFiltersProps {
  onApply: (filters: SmartFilterState) => void;
  initialFilters?: Partial<SmartFilterState>;
}

export type SmartFilterState = {
  maxSafetyScore: number;  // Only show areas with safety >= this
  maxMetroWalk: number;   // Only show areas with metro walk <= this (in minutes)
  minBusScore: number;    // Only show areas with bus score >= this
  nearMetroOnly: boolean;
  foodIncluded: boolean | null;
  acAvailable: boolean | null;
};

const defaultSmartFilters: SmartFilterState = {
  maxSafetyScore: 100,
  maxMetroWalk: 30,
  minBusScore: 0,
  nearMetroOnly: false,
  foodIncluded: null,
  acAvailable: null,
};

export default function SmartFilters({ onApply, initialFilters }: SmartFiltersProps) {
  const [filters, setFilters] = useState<SmartFilterState>({ ...defaultSmartFilters, ...initialFilters });

  const safeAreas = Object.entries(areaSafetyScores).filter(([, s]) => s.score >= 60).length;
  const metroAreas = Object.entries(Object.fromEntries(
    Object.entries(import("@/data/safetyData").then(m => Object.keys(m.metroProximity || {}))
  )).length;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">🎯</span>
        <h3 className="text-sm font-bold text-gray-900">Smart Filters</h3>
      </div>

      <div className="space-y-4">
        {/* Near Metro Only */}
        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl">
          <div>
            <p className="text-sm font-semibold text-gray-800">🚇 Near Metro Only</p>
            <p className="text-xs text-gray-500">Show only PGs within walking distance of metro</p>
          </div>
          <button
            onClick={() => {
              const next = { ...filters, nearMetroOnly: !filters.nearMetroOnly };
              setFilters(next);
              onApply(next);
            }}
            className={`w-12 h-7 rounded-full relative transition-all ${filters.nearMetroOnly ? "bg-blue-500" : "bg-gray-300"}`}
          >
            <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-all ${filters.nearMetroOnly ? "right-1" : "left-1"}`} />
          </button>
        </div>

        {/* Safety Score Slider */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-gray-700">🛡️ Min Safety Score</p>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg">
              ≥ {filters.maxSafetyScore === 100 ? "Any" : filters.maxSafetyScore}
            </span>
          </div>
          <input
            type="range"
            min="50"
            max="100"
            step="5"
            value={filters.maxSafetyScore}
            onChange={(e) => {
              const next = { ...filters, maxSafetyScore: parseInt(e.target.value) };
              setFilters(next);
              onApply(next);
            }}
            className="w-full accent-emerald-500"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>50</span>
            <span>75</span>
            <span>100</span>
          </div>
        </div>

        {/* Metro Walk Time */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-gray-700">🚶 Max Metro Walk</p>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg">
              ≤ {filters.maxMetroWalk} min
            </span>
          </div>
          <input
            type="range"
            min="5"
            max="30"
            step="5"
            value={filters.maxMetroWalk}
            onChange={(e) => {
              const next = { ...filters, maxMetroWalk: parseInt(e.target.value) };
              setFilters(next);
              onApply(next);
            }}
            className="w-full accent-blue-500"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>5 min</span>
            <span>15 min</span>
            <span>30 min</span>
          </div>
        </div>

        {/* Food Included Toggle */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
          <p className="text-sm font-semibold text-gray-700">🍽️ Food Included</p>
          <select
            value={filters.foodIncluded === null ? "any" : filters.foodIncluded ? "yes" : "no"}
            onChange={(e) => {
              const val = e.target.value === "any" ? null : e.target.value === "yes";
              const next = { ...filters, foodIncluded: val };
              setFilters(next);
              onApply(next);
            }}
            className="px-3 py-1.5 rounded-xl text-sm border border-gray-200 bg-white focus:outline-none focus:border-[#1B1C15]"
          >
            <option value="any">Any</option>
            <option value="yes">Yes Only</option>
            <option value="no">No Only</option>
          </select>
        </div>

        {/* AC Toggle */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
          <p className="text-sm font-semibold text-gray-700">❄️ AC Available</p>
          <select
            value={filters.acAvailable === null ? "any" : filters.acAvailable ? "yes" : "no"}
            onChange={(e) => {
              const val = e.target.value === "any" ? null : e.target.value === "yes";
              const next = { ...filters, acAvailable: val };
              setFilters(next);
              onApply(next);
            }}
            className="px-3 py-1.5 rounded-xl text-sm border border-gray-200 bg-white focus:outline-none focus:border-[#1B1C15]"
          >
            <option value="any">Any</option>
            <option value="yes">Yes Only</option>
            <option value="no">No Only</option>
          </select>
        </div>

        {/* Reset */}
        <button
          onClick={() => {
            setFilters(defaultSmartFilters);
            onApply(defaultSmartFilters);
          }}
          className="w-full py-2.5 rounded-xl bg-gray-100 text-gray-600 text-sm font-semibold hover:bg-gray-200 transition"
        >
          Reset Smart Filters
        </button>
      </div>
    </div>
  );
}
