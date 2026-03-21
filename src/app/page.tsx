"use client";

import { useState, useMemo } from "react";
import Header from "@/components/Header";
import SearchFilters from "@/components/SearchFilters";
import PGCard from "@/components/PGCard";
import { listings, areas } from "@/data/listings";

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

const defaultFilters: Filters = {
  search: "",
  area: "",
  minPrice: 0,
  maxPrice: 50000,
  gender: "",
  roomType: "",
  amenities: [],
  foodIncluded: null,
  acAvailable: null,
};

export default function Home() {
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [sortBy, setSortBy] = useState<string>("rating");

  const filtered = useMemo(() => {
    let result = listings.filter((pg) => {
      if (filters.search) {
        const q = filters.search.toLowerCase();
        const match =
          pg.name.toLowerCase().includes(q) ||
          pg.area.toLowerCase().includes(q) ||
          pg.locality.toLowerCase().includes(q) ||
          pg.nearbyLandmarks.some((l) => l.toLowerCase().includes(q));
        if (!match) return false;
      }
      if (filters.area && pg.area !== filters.area) return false;
      if (pg.price < filters.minPrice || pg.price > filters.maxPrice) return false;
      if (filters.gender && pg.gender !== filters.gender) return false;
      if (filters.roomType && pg.type !== filters.roomType) return false;
      if (filters.foodIncluded !== null && pg.foodIncluded !== filters.foodIncluded) return false;
      if (filters.acAvailable !== null && pg.acAvailable !== filters.acAvailable) return false;
      if (filters.amenities.length > 0) {
        const hasAll = filters.amenities.every((a) => pg.amenities.includes(a));
        if (!hasAll) return false;
      }
      return true;
    });

    result.sort((a, b) => {
      switch (sortBy) {
        case "price-low": return a.price - b.price;
        case "price-high": return b.price - a.price;
        case "rating": return b.rating - a.rating;
        case "reviews": return b.reviews - a.reviews;
        default: return 0;
      }
    });

    return result;
  }, [filters, sortBy]);

  const areaCount = useMemo(() => {
    const counts: Record<string, number> = {};
    listings.forEach((pg) => {
      counts[pg.area] = (counts[pg.area] || 0) + 1;
    });
    return counts;
  }, []);

  return (
    <>
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-gradient-to-br from-violet-600 via-indigo-600 to-purple-700 text-white py-16 sm:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4">
              Find Your Perfect PG
              <br />
              <span className="text-violet-200">in Bangalore</span>
            </h1>
            <p className="text-lg sm:text-xl text-violet-100 max-w-2xl mx-auto mb-8">
              Discover verified PGs, hostels & co-living spaces across Bangalore.
              Filter by budget, area, amenities and more.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {["Koramangala", "HSR Layout", "Indiranagar", "Whitefield", "Bellandur"].map((a) => (
                <button
                  key={a}
                  onClick={() => setFilters({ ...defaultFilters, area: a })}
                  className="px-4 py-2 bg-white/15 hover:bg-white/25 rounded-full text-sm font-medium transition backdrop-blur-sm"
                >
                  {a}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Listed PGs", value: listings.length + "+", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
              { label: "Areas Covered", value: areas.length + "+", icon: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" },
              { label: "Happy Tenants", value: "500+", icon: "M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
              { label: "Avg Rating", value: "4.3", icon: "M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 text-center">
                <svg className="w-6 h-6 text-violet-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={s.icon} />
                </svg>
                <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                <p className="text-sm text-gray-500">{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Filters + Listings */}
        <section id="listings" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <SearchFilters filters={filters} onChange={setFilters} />

          {/* Sort + Results count */}
          <div className="flex items-center justify-between mt-8 mb-6">
            <p className="text-gray-600">
              <span className="font-semibold text-gray-900">{filtered.length}</span> PGs found
              {filters.area && <span> in <span className="font-medium text-violet-600">{filters.area}</span></span>}
            </p>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Sort:</span>
              <select
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 outline-none bg-white text-gray-700"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="rating">Top Rated</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="reviews">Most Reviews</option>
              </select>
            </div>
          </div>

          {/* Listing Grid */}
          {filtered.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((pg) => (
                <PGCard key={pg.id} pg={pg} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-violet-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No PGs Found</h3>
              <p className="text-gray-500 mb-4">Try adjusting your filters or search in a different area.</p>
              <button
                onClick={() => setFilters(defaultFilters)}
                className="px-6 py-2 bg-violet-600 text-white rounded-xl font-medium hover:bg-violet-700 transition"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </section>

        {/* Popular Areas */}
        <section id="areas" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Popular Areas in Bangalore</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {Object.entries(areaCount).map(([area, count]) => (
              <button
                key={area}
                onClick={() => setFilters({ ...defaultFilters, area })}
                className="bg-white rounded-xl border border-gray-200 p-4 text-left hover:border-violet-300 hover:shadow-md transition group"
              >
                <p className="font-semibold text-gray-900 group-hover:text-violet-600 transition">{area}</p>
                <p className="text-sm text-gray-500">{count} PGs</p>
              </button>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-gray-400 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold">P</span>
                  </div>
                  <span className="text-white font-bold text-lg">PG Finder</span>
                </div>
                <p className="text-sm">Find the best PG accommodations across Bangalore. Verified listings, real reviews.</p>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-3">Popular Areas</h4>
                <ul className="space-y-1.5 text-sm">
                  {["Koramangala", "HSR Layout", "Indiranagar", "Whitefield", "BTM Layout"].map((a) => (
                    <li key={a}><span className="hover:text-white cursor-pointer transition">{a}</span></li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-3">Contact</h4>
                <ul className="space-y-1.5 text-sm">
                  <li>support@pgfinder.in</li>
                  <li>Bangalore, Karnataka</li>
                </ul>
              </div>
            </div>
            <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
              <p>&copy; 2026 PG Finder Bangalore. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
