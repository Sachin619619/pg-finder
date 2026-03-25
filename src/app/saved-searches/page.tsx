"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Header from "@/components/Header";

interface SavedSearch {
  id: string;
  criteria: {
    area?: string;
    minPrice?: number;
    maxPrice?: number;
    gender?: string;
    type?: string;
    amenities?: string[];
    foodIncluded?: boolean;
    acAvailable?: boolean;
  };
  createdAt: string;
  alertEnabled: boolean;
}

export default function SavedSearchesPage() {
  const [searches, setSearches] = useState<SavedSearch[]>([]);
  const [filter, setFilter] = useState<"all" | "active">("all");

  useEffect(() => {
    const stored: SavedSearch[] = JSON.parse(localStorage.getItem("castle_saved_searches") || "[]");
    setSearches(stored);
  }, []);

  const toggleAlert = (id: string) => {
    const updated = searches.map(s => s.id === id ? { ...s, alertEnabled: !s.alertEnabled } : s);
    setSearches(updated);
    localStorage.setItem("castle_saved_searches", JSON.stringify(updated));
  };

  const deleteSearch = (id: string) => {
    const updated = searches.filter(s => s.id !== id);
    setSearches(updated);
    localStorage.setItem("castle_saved_searches", JSON.stringify(updated));
  };

  const filtered = filter === "active" ? searches.filter(s => s.alertEnabled) : searches;

  const formatCriteria = (criteria: SavedSearch["criteria"]) => {
    const parts: string[] = [];
    if (criteria.area) parts.push(`📍 ${criteria.area}`);
    if (criteria.minPrice || criteria.maxPrice) {
      parts.push(`💰 ₹${(criteria.minPrice || 0).toLocaleString()} - ₹${(criteria.maxPrice || 50000).toLocaleString()}`);
    }
    if (criteria.gender) parts.push(`👤 ${criteria.gender}`);
    if (criteria.type) parts.push(`🛏️ ${criteria.type}`);
    if (criteria.foodIncluded) parts.push("🍽️ Food included");
    if (criteria.acAvailable) parts.push("❄️ AC");
    if (criteria.amenities && criteria.amenities.length > 0) {
      parts.push(`🛋️ ${criteria.amenities.length} amenities`);
    }
    return parts.length > 0 ? parts : ["All PGs"];
  };

  return (
    <>
      <Header />
      <main className="max-w-3xl mx-auto px-4 py-8 pt-24 animate-fade-in-up">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              🔔 Saved Searches
            </h1>
            <p className="text-sm text-gray-400 mt-1">Get notified when new PGs match your criteria</p>
          </div>
          <Link
            href="/"
            className="px-4 py-2 rounded-xl text-sm font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
          >
            New Search
          </Link>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6">
          {(["all", "active"] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                filter === f ? "bg-[#1a1a1a] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
              <span className="ml-1.5 text-xs opacity-60">
                ({f === "all" ? searches.length : searches.filter(s => s.alertEnabled).length})
              </span>
            </button>
          ))}
        </div>

        {/* Saved searches list */}
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No saved searches</h3>
            <p className="text-sm text-gray-400 mb-6">
              {filter === "active"
                ? "Enable alerts on your saved searches to get notified"
                : "Save a search from the home page to get notified when matching PGs are added"}
            </p>
            <Link
              href="/"
              className="px-6 py-3 bg-[#1a1a1a] text-white rounded-xl font-semibold text-sm inline-block"
            >
              Browse PGs
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((search) => (
              <div key={search.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-800 mb-2">
                      {formatCriteria(search.criteria).join(" • ")}
                    </p>
                    <p className="text-xs text-gray-400">
                      Saved {new Date(search.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                  <button
                    onClick={() => deleteSearch(search.id)}
                    className="p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                    </svg>
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleAlert(search.id)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                        search.alertEnabled
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-gray-100 text-gray-500 border border-gray-200"
                      }`}
                    >
                      <span>{search.alertEnabled ? "🔔" : "🔕"}</span>
                      {search.alertEnabled ? "Alerts On" : "Alerts Off"}
                    </button>
                  </div>

                  <Link
                    href={`/?area=${search.criteria.area || ""}&minPrice=${search.criteria.minPrice || 0}&maxPrice=${search.criteria.maxPrice || 50000}`}
                    className="px-4 py-2 bg-[#1a1a1a] text-white rounded-xl text-xs font-semibold hover:bg-[#333333] transition"
                  >
                    Search →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
