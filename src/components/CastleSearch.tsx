"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { areas } from "@/data/listings";

const suggestions = [
  { text: "PG in Koramangala with AC", icon: "❄️", search: "?area=Koramangala&amenities=AC" },
  { text: "Budget PG under ₹10,000", icon: "💰", search: "?maxPrice=10000" },
  { text: "PG near metro station", icon: "🚇", search: "?metro=true" },
  { text: "PG with food included", icon: "🍽️", search: "?food=true" },
  { text: "PG in HSR Layout", icon: "📍", search: "?area=HSR+Layout" },
  { text: "Girls PG in Bellandur", icon: "👩", search: "?area=Bellandur&gender=female" },
  { text: "PG with gym", icon: "🏋️", search: "?amenities=Gym" },
  { text: "Single room PG", icon: "🛏️", search: "?roomType=single" },
];

export default function CastleSearch() {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = query.length > 0
    ? suggestions.filter(s => s.text.toLowerCase().includes(query.toLowerCase()))
    : suggestions;

  const handleSelect = (search: string) => {
    window.location.href = `/${search}`;
  };

  return (
    <div className="relative max-w-2xl mx-auto">
      <div className={`relative transition-all ${focused ? "ring-2 ring-[#1B1C15] ring-offset-2" : ""}`}>
        <div className="absolute left-4 top-1/2 -translate-y-1/2">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 200)}
          placeholder='Try "PG in Koramangala with AC" or "Budget PG under 10k"'
          className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-gray-100 bg-white text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none shadow-sm"
        />
        <button
          className="absolute right-3 top-1/2 -translate-y-1/2 px-4 py-2 bg-[#1B1C15] text-white rounded-xl text-sm font-semibold hover:bg-[#2d2e25] transition-colors"
        >
          Search
        </button>
      </div>

      {/* Suggestions dropdown */}
      {focused && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden z-50">
          <div className="p-3 border-b border-gray-50">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
              {query.length > 0 ? "Search Suggestions" : "Quick Searches"}
            </p>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {filtered.map((s, i) => (
              <button
                key={i}
                onClick={() => handleSelect(s.search)}
                className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors flex items-center gap-3"
              >
                <span className="text-lg">{s.icon}</span>
                <span className="text-sm text-gray-700">{s.text}</span>
                <svg className="w-4 h-4 text-gray-300 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
