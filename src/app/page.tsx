"use client";

import { useState, useMemo } from "react";
import Header from "@/components/Header";
import SearchFilters from "@/components/SearchFilters";
import PGCard from "@/components/PGCard";
import MapView from "@/components/MapView";
import CompareDrawer from "@/components/CompareDrawer";
import { listings, areas } from "@/data/listings";
import type { PGListing } from "@/data/listings";

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
  const [viewMode, setViewMode] = useState<"grid" | "map">("grid");
  const [compareList, setCompareList] = useState<PGListing[]>([]);

  const toggleCompare = (pg: PGListing) => {
    if (compareList.find((c) => c.id === pg.id)) {
      setCompareList(compareList.filter((c) => c.id !== pg.id));
    } else if (compareList.length < 3) {
      setCompareList([...compareList, pg]);
    }
  };

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
        {/* ===== PREMIUM HERO ===== */}
        <section className="hero-gradient text-white pt-32 pb-24 sm:pt-40 sm:pb-32 relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-20 left-10 w-72 h-72 bg-violet-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-20 w-96 h-96 bg-fuchsia-500/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-600/5 rounded-full blur-3xl" />

          {/* Floating shapes */}
          <div className="absolute top-32 right-[15%] w-16 h-16 border border-white/10 rounded-2xl rotate-12 animate-float" />
          <div className="absolute bottom-20 left-[10%] w-12 h-12 border border-white/10 rounded-xl -rotate-12 animate-float" style={{ animationDelay: "2s" }} />
          <div className="absolute top-40 left-[20%] w-8 h-8 bg-violet-500/20 rounded-lg rotate-45 animate-float" style={{ animationDelay: "4s" }} />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-8 border border-white/10">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                <span className="text-sm font-medium text-white/80">{listings.length} PGs available across Bangalore</span>
              </div>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-[1.05] tracking-tight">
                Find your
                <br />
                <span className="bg-gradient-to-r from-violet-300 via-fuchsia-300 to-pink-300 bg-clip-text text-transparent">perfect stay</span>
                <br />
                in Bangalore
              </h1>

              <p className="text-lg sm:text-xl text-white/50 max-w-xl mb-10 leading-relaxed">
                Discover premium PGs, hostels & co-living spaces. Curated listings with verified reviews and transparent pricing.
              </p>

              {/* Quick search */}
              <div className="flex flex-col sm:flex-row gap-3 max-w-xl">
                <div className="flex-1 relative">
                  <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search area, PG name, landmark..."
                    className="w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl text-white placeholder-white/30 focus:bg-white/15 focus:border-white/30 outline-none transition-all text-[15px]"
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  />
                </div>
                <button
                  onClick={() => document.getElementById("listings")?.scrollIntoView({ behavior: "smooth" })}
                  className="btn-premium !py-4 !px-8 whitespace-nowrap"
                >
                  Search PGs
                </button>
              </div>
            </div>

            {/* Trusted badges */}
            <div className="mt-16 flex flex-wrap items-center gap-8">
              {[
                { value: `${listings.length}+`, label: "Verified PGs" },
                { value: `${areas.length}+`, label: "Areas" },
                { value: "4.3", label: "Avg Rating" },
                { value: "500+", label: "Happy Tenants" },
              ].map((s) => (
                <div key={s.label} className="flex items-center gap-3">
                  <span className="text-2xl font-bold text-white">{s.value}</span>
                  <span className="text-sm text-white/40">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== POPULAR AREAS HORIZONTAL SCROLL ===== */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10 mb-12">
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            <button
              onClick={() => setFilters(defaultFilters)}
              className={`shrink-0 px-5 py-3 rounded-2xl font-medium text-sm transition-all ${
                !filters.area
                  ? "bg-gray-900 text-white shadow-lg shadow-gray-900/20"
                  : "bg-white text-gray-600 shadow-sm border border-gray-100 hover:border-gray-200"
              }`}
            >
              All Areas
            </button>
            {Object.entries(areaCount).map(([area, count]) => (
              <button
                key={area}
                onClick={() => setFilters({ ...defaultFilters, area })}
                className={`shrink-0 px-5 py-3 rounded-2xl font-medium text-sm transition-all ${
                  filters.area === area
                    ? "bg-gray-900 text-white shadow-lg shadow-gray-900/20"
                    : "bg-white text-gray-600 shadow-sm border border-gray-100 hover:border-gray-200"
                }`}
              >
                {area} <span className="text-xs opacity-60 ml-1">{count}</span>
              </button>
            ))}
          </div>
        </section>

        {/* ===== FILTERS + LISTINGS ===== */}
        <section id="listings" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <SearchFilters filters={filters} onChange={setFilters} />

          {/* Toolbar */}
          <div className="flex items-center justify-between mt-10 mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {filters.area ? `PGs in ${filters.area}` : "All PG Listings"}
              </h2>
              <p className="text-sm text-gray-400 mt-1">{filtered.length} results found</p>
            </div>
            <div className="flex items-center gap-3">
              {/* View Toggle */}
              <div className="flex items-center bg-gray-100 rounded-xl p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-lg transition-all ${viewMode === "grid" ? "bg-white shadow-sm text-gray-900" : "text-gray-400"}`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode("map")}
                  className={`p-2 rounded-lg transition-all ${viewMode === "map" ? "bg-white shadow-sm text-gray-900" : "text-gray-400"}`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                </button>
              </div>
              <select
                className="premium-input !py-2 !px-4 text-sm text-gray-600"
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

          {/* Listings */}
          {filtered.length > 0 ? (
            viewMode === "map" ? (
              <MapView listings={filtered} />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7 stagger-children">
                {filtered.map((pg) => (
                  <div key={pg.id} className="relative">
                    <PGCard pg={pg} />
                    <button
                      onClick={(e) => { e.preventDefault(); toggleCompare(pg); }}
                      className={`absolute top-4 left-14 z-10 pill text-[11px] transition-all shadow-sm ${
                        compareList.find((c) => c.id === pg.id)
                          ? "bg-violet-600 text-white shadow-violet-500/30"
                          : "glass-card text-gray-600 hover:bg-violet-50"
                      }`}
                    >
                      {compareList.find((c) => c.id === pg.id) ? "Added" : "Compare"}
                    </button>
                  </div>
                ))}
              </div>
            )
          ) : (
            <div className="text-center py-24">
              <div className="w-24 h-24 bg-violet-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-violet-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No PGs found</h3>
              <p className="text-gray-400 mb-6">Try adjusting your filters or explore a different area.</p>
              <button
                onClick={() => setFilters(defaultFilters)}
                className="btn-premium"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </section>

        {/* ===== AREAS GRID ===== */}
        <section id="areas" className="bg-white py-20 border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
                Explore by <span className="gradient-text">Area</span>
              </h2>
              <p className="text-gray-400 max-w-md mx-auto">Browse PGs across Bangalore&apos;s most popular neighbourhoods</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 stagger-children">
              {Object.entries(areaCount).map(([area, count]) => (
                <button
                  key={area}
                  onClick={() => {
                    setFilters({ ...defaultFilters, area });
                    document.getElementById("listings")?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="premium-card !rounded-2xl p-5 text-left group"
                >
                  <div className="w-10 h-10 bg-violet-50 rounded-xl flex items-center justify-center mb-3 group-hover:bg-violet-100 transition-colors">
                    <svg className="w-5 h-5 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                  </div>
                  <p className="font-semibold text-gray-900 text-[15px] group-hover:text-violet-600 transition-colors">{area}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{count} PGs</p>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ===== HOW IT WORKS ===== */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
                How it <span className="gradient-text">works</span>
              </h2>
              <p className="text-gray-400">Find and move into your PG in 3 simple steps</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              {[
                {
                  step: "01",
                  title: "Search & Filter",
                  desc: "Browse PGs by area, budget, amenities, and room type. Use our smart filters to narrow down.",
                  icon: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
                },
                {
                  step: "02",
                  title: "Compare & Choose",
                  desc: "Compare up to 3 PGs side by side. Check ratings, reviews, and amenities at a glance.",
                  icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
                },
                {
                  step: "03",
                  title: "Contact & Move In",
                  desc: "Call or WhatsApp the PG owner directly. Schedule a visit and move in hassle-free.",
                  icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
                },
              ].map((item) => (
                <div key={item.step} className="premium-card !rounded-3xl p-8 text-center group">
                  <div className="w-16 h-16 bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform">
                    <svg className="w-7 h-7 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} />
                    </svg>
                  </div>
                  <span className="text-xs font-bold text-violet-400 tracking-widest">{item.step}</span>
                  <h3 className="text-lg font-bold text-gray-900 mt-2 mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== CTA ===== */}
        <section className="py-20 bg-white border-t border-gray-100">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <div className="hero-gradient rounded-3xl p-12 sm:p-16 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-fuchsia-500/10 rounded-full blur-3xl" />
              <div className="relative z-10">
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                  Own a PG? List it for <span className="text-violet-300">free</span>
                </h2>
                <p className="text-white/50 max-w-md mx-auto mb-8">
                  Reach thousands of potential tenants every day. Premium plans start from just ₹499/mo.
                </p>
                <a href="/list-your-pg" className="btn-premium inline-block !text-base">
                  List Your PG Now
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ===== FOOTER ===== */}
        <footer className="bg-gray-950 text-gray-500 pt-16 pb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-10 mb-12">
              <div className="sm:col-span-2">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-fuchsia-500 rounded-xl flex items-center justify-center">
                    <span className="text-white font-bold text-lg">P</span>
                  </div>
                  <span className="text-white font-bold text-xl">PG Finder</span>
                </div>
                <p className="text-sm leading-relaxed max-w-xs text-gray-500">
                  Bangalore&apos;s most trusted platform to find PG accommodations, hostels, and co-living spaces.
                </p>
              </div>
              <div>
                <h4 className="text-white text-sm font-semibold mb-4 uppercase tracking-wider">Popular Areas</h4>
                <ul className="space-y-2.5 text-sm">
                  {["Koramangala", "HSR Layout", "Indiranagar", "Whitefield", "Bellandur"].map((a) => (
                    <li key={a}>
                      <button
                        onClick={() => {
                          setFilters({ ...defaultFilters, area: a });
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        className="hover:text-white transition"
                      >
                        {a}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-white text-sm font-semibold mb-4 uppercase tracking-wider">Company</h4>
                <ul className="space-y-2.5 text-sm">
                  <li><span className="hover:text-white cursor-pointer transition">About Us</span></li>
                  <li><a href="/list-your-pg" className="hover:text-white transition">List Your PG</a></li>
                  <li><span className="hover:text-white cursor-pointer transition">Contact</span></li>
                  <li><span className="hover:text-white cursor-pointer transition">Privacy Policy</span></li>
                </ul>
              </div>
            </div>
            <div className="border-t border-gray-800/50 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs text-gray-600">&copy; 2026 PG Finder Bangalore. All rights reserved.</p>
              <p className="text-xs text-gray-700">Made with care in Bangalore</p>
            </div>
          </div>
        </footer>
      </main>

      <CompareDrawer
        items={compareList}
        onRemove={(id) => setCompareList(compareList.filter((c) => c.id !== id))}
        onClear={() => setCompareList([])}
      />
    </>
  );
}
