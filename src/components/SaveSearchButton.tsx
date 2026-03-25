"use client";

import { useState } from "react";

interface SaveSearchButtonProps {
  searchCriteria: {
    area?: string;
    minPrice?: number;
    maxPrice?: number;
    gender?: string;
    type?: string;
    amenities?: string[];
    foodIncluded?: boolean;
    acAvailable?: boolean;
  };
}

export default function SaveSearchButton({ searchCriteria }: SaveSearchButtonProps) {
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (saved) return;
    setSaving(true);
    
    // Simulate saving to localStorage (in production this would go to Supabase)
    const savedSearches = JSON.parse(localStorage.getItem("castle_saved_searches") || "[]");
    const newSearch = {
      id: Date.now().toString(),
      criteria: searchCriteria,
      createdAt: new Date().toISOString(),
      alertEnabled: true,
    };
    savedSearches.push(newSearch);
    localStorage.setItem("castle_saved_searches", JSON.stringify(savedSearches));
    
    await new Promise(r => setTimeout(r, 500));
    setSaving(false);
    setSaved(true);
    
    // Auto-reset after 3 seconds
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <button
      onClick={handleSave}
      disabled={saving || saved}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
        saved
          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
          : "bg-[#EDE8DE] text-gray-700 hover:bg-[#d4c9a8] border border-black/8"
      }`}
    >
      {saving ? (
        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : saved ? (
        <span>✅</span>
      ) : (
        <span>🔔</span>
      )}
      <span>{saving ? "Saving..." : saved ? "Search Saved!" : "Save Search"}</span>
    </button>
  );
}
