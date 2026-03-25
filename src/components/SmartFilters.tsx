"use client";

import { useState } from "react";
import { metroProximity, busConnectivity } from "@/data/safetyData";

interface SmartFiltersProps {
  onApply: (filters: SmartFilterState) => void;
  initialFilters?: Partial<SmartFilterState>;
}

export type SmartFilterState = {
  nearMetroOnly: boolean;
  minSafetyScore: number;
  maxMetroWalk: number;
  minBusScore: number;
  foodIncluded: boolean | null;
  acAvailable: boolean | null;
};

const defaultFilters: SmartFilterState = {
  nearMetroOnly: false,
  minSafetyScore: 50,
  maxMetroWalk: 30,
  minBusScore: 0,
  foodIncluded: null,
  acAvailable: null,
};

export default function SmartFilters({ onApply, initialFilters }: SmartFiltersProps) {
  const [filters, setFilters] = useState<SmartFilterState>({ ...defaultFilters, ...initialFilters });

  const update = (partial: Partial<SmartFilterState>) => {
    const next = { ...filters, ...partial };
    setFilters(next);
    onApply(next);
  };

  const metroCount = Object.keys(metroProximity).length;
  const highBusCount = Object.values(busConnectivity).filter(b => b.score >= 85).length;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">🎯</span>
        <h3 className="text-sm font-bold text-gray-900">Smart Filters</h3>
        <span className="text-xs text-gray-400 ml-auto">by Castle</span>
      </div>

      <div className="space-y-4">
        {/* Near Metro Only */}
        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl">
          <div>
            <p className="text-sm font-semibold text-gray-800">🚇 Near Metro Only</p>
            <p className="text-xs text-gray-500">{metroCount} areas connected</p>
          </div>
          <button
            onClick={() => update({ nearMetroOnly: !filters.nearMetroOnly })}
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
              ≥ {filters.minSafetyScore === 50 ? "Any" : filters.minSafetyScore}
            </span>
          </div>
          <input
            type="range"
            min="50"
            max="100"
            step="5"
            value={filters.minSafetyScore}
            onChange={(e) => update({ minSafetyScore: parseInt(e.target.value) })}
            className="w-full accent-emerald-500"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>50+</span>
            <span>75+</span>
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
            onChange={(e) => update({ maxMetroWalk: parseInt(e.target.value) })}
            className="w-full accent-blue-500"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>5 min</span>
            <span>15 min</span>
            <span>30 min</span>
          </div>
        </div>

        {/* High Bus Connectivity */}
        <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
          <div>
            <p className="text-sm font-semibold text-gray-800">🚌 Good Bus Connectivity</p>
            <p className="text-xs text-gray-500">{highBusCount} areas with 85+ score</p>
          </div>
          <button
            onClick={() => update({ minBusScore: filters.minBusScore === 85 ? 0 : 85 })}
            className={`w-12 h-7 rounded-full relative transition-all ${filters.minBusScore === 85 ? "bg-green-500" : "bg-gray-300"}`}
          >
            <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-all ${filters.minBusScore === 85 ? "right-1" : "left-1"}`} />
          </button>
        </div>

        {/* Food Included Toggle */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
          <p className="text-sm font-semibold text-gray-700">🍽️ Food Included</p>
          <select
            value={filters.foodIncluded === null ? "any" : filters.foodIncluded ? "yes" : "no"}
            onChange={(e) => {
              const val = e.target.value === "any" ? null : e.target.value === "yes";
              update({ foodIncluded: val });
            }}
            className="px-3 py-1.5 rounded-xl text-sm border border-gray-200 bg-white focus:outline-none focus:border-[#1a1a1a]"
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
              update({ acAvailable: val });
            }}
            className="px-3 py-1.5 rounded-xl text-sm border border-gray-200 bg-white focus:outline-none focus:border-[#1a1a1a]"
          >
            <option value="any">Any</option>
            <option value="yes">Yes Only</option>
            <option value="no">No Only</option>
          </select>
        </div>

        {/* Reset */}
        <button
          onClick={() => {
            setFilters(defaultFilters);
            onApply(defaultFilters);
          }}
          className="w-full py-2.5 rounded-xl bg-gray-100 text-gray-600 text-sm font-semibold hover:bg-gray-200 transition"
        >
          Reset Smart Filters
        </button>
      </div>
    </div>
  );
}
