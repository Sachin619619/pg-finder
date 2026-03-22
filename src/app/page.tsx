"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import Header from "@/components/Header";
import SearchFilters from "@/components/SearchFilters";
import PGCard from "@/components/PGCard";
import MapView from "@/components/MapView";
import CompareDrawer from "@/components/CompareDrawer";
import PriceInsights from "@/components/PriceInsights";
import Testimonials from "@/components/Testimonials";
import PriceAlertBanner from "@/components/PriceAlertBanner";
import { fetchListings } from "@/lib/db";
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

const areaEmojis: Record<string, string> = {
  "Koramangala": "🏙️", "Indiranagar": "🎵", "HSR Layout": "💻", "Bellandur": "🌊",
  "BTM Layout": "🎯", "Whitefield": "🏢", "Marathahalli": "🌉", "Electronic City": "⚡",
  "Hebbal": "🌿", "Kalyan Nagar": "🏡", "Kammanahalli": "🛕", "JP Nagar": "🏛️",
  "Banaswadi": "🚂", "Malleshwaram": "🌺", "Jayanagar": "🌳",
};

/* Animated counter hook */
function useCounter(end: number, duration = 1500) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    started.current = false;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const startTime = Date.now();
          const tick = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * end));
            if (progress < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end, duration]);

  return { count, ref };
}

export default function Home() {
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [sortBy, setSortBy] = useState<string>("rating");
  const [viewMode, setViewMode] = useState<"grid" | "map">("grid");
  const [compareList, setCompareList] = useState<PGListing[]>([]);
  const [listings, setListings] = useState<PGListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchListings().then((data) => {
      setListings(data);
      setLoading(false);
    });
  }, []);

  const areas = useMemo(() => {
    return [...new Set(listings.map((l) => l.area))].sort();
  }, [listings]);

  const stat1 = useCounter(listings.length);
  const stat2 = useCounter(areas.length);
  const stat3 = useCounter(500);

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
  }, [listings, filters, sortBy]);

  const areaCount = useMemo(() => {
    const counts: Record<string, number> = {};
    listings.forEach((pg) => {
      counts[pg.area] = (counts[pg.area] || 0) + 1;
    });
    return counts;
  }, [listings]);

  return (
    <>
      <Header />
      <main className="flex-1">
        {/* ===== PREMIUM HERO WITH AURORA ===== */}
        <section className="hero-gradient text-white pt-36 pb-28 sm:pt-44 sm:pb-36 relative overflow-hidden">
          {/* Aurora orbs */}
          <div className="absolute top-0 left-[15%] w-[500px] h-[500px] bg-violet-600/15 rounded-full blur-[120px] orb-1" />
          <div className="absolute bottom-0 right-[10%] w-[600px] h-[600px] bg-fuchsia-500/10 rounded-full blur-[150px] orb-2" />
          <div className="absolute top-[30%] right-[30%] w-[400px] h-[400px] bg-blue-500/8 rounded-full blur-[100px] orb-1" style={{ animationDelay: "5s" }} />

          {/* Grid pattern overlay */}
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }} />

          {/* Floating geometric shapes */}
          <div className="absolute top-32 right-[12%] w-20 h-20 border border-white/[0.06] rounded-2xl rotate-12 animate-float" />
          <div className="absolute top-[60%] right-[25%] w-14 h-14 border border-violet-400/10 rounded-xl -rotate-6 animate-float" style={{ animationDelay: "3s" }} />
          <div className="absolute bottom-32 left-[8%] w-10 h-10 bg-violet-500/10 rounded-lg rotate-45 animate-float" style={{ animationDelay: "1.5s" }} />
          <div className="absolute top-44 left-[30%] w-6 h-6 bg-fuchsia-500/15 rounded-full animate-float" style={{ animationDelay: "4s" }} />
          <div className="absolute bottom-[20%] right-[8%] w-3 h-3 bg-emerald-400/30 rounded-full animate-float" style={{ animationDelay: "2.5s" }} />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-3xl">
              {/* Status badge */}
              <div className="inline-flex items-center gap-2.5 bg-white/[0.06] backdrop-blur-xl rounded-full px-5 py-2.5 mb-10 border border-white/[0.08] shadow-lg shadow-black/10">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400" />
                </span>
                <span className="text-sm font-medium text-white/70">{listings.length} PGs available across Bangalore</span>
                <span className="w-px h-4 bg-white/10" />
                <span className="text-sm font-medium text-emerald-400/80">Updated today</span>
              </div>

              {/* Hero heading */}
              <h1 className="text-5xl sm:text-6xl lg:text-[5.5rem] font-extrabold mb-7 leading-[1.02] tracking-[-0.03em]">
                <span className="text-white/90">Find your</span>
                <br />
                <span className="gradient-text text-glow">perfect stay</span>
                <br />
                <span className="text-white/90">in Bangalore</span>
              </h1>

              <p className="text-lg sm:text-xl text-white/40 max-w-xl mb-12 leading-relaxed font-light">
                Discover premium PGs, hostels & co-living spaces. Curated listings with verified reviews and transparent pricing.
              </p>

              {/* Search bar with glow */}
              <div className="flex flex-col sm:flex-row gap-3 max-w-xl">
                <div className="flex-1 relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-600/20 to-fuchsia-600/20 rounded-2xl blur-lg opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
                  <div className="relative">
                    <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                      type="text"
                      placeholder="Search area, PG name, landmark..."
                      className="w-full pl-12 pr-4 py-4.5 bg-white/[0.06] backdrop-blur-xl border border-white/[0.08] rounded-2xl text-white placeholder-white/25 focus:bg-white/[0.1] focus:border-violet-400/30 outline-none transition-all text-[15px]"
                      value={filters.search}
                      onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    />
                  </div>
                </div>
                <button
                  onClick={() => document.getElementById("listings")?.scrollIntoView({ behavior: "smooth" })}
                  className="btn-premium !py-4 !px-8 whitespace-nowrap"
                >
                  Search PGs
                </button>
              </div>
            </div>

            {/* Animated Stats */}
            <div className="mt-20 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl">
              {[
                { ref: stat1.ref, value: `${stat1.count}+`, label: "Verified PGs", icon: "🏠" },
                { ref: stat2.ref, value: `${stat2.count}+`, label: "Areas Covered", icon: "📍" },
                { ref: null, value: "4.3", label: "Avg Rating", icon: "⭐" },
                { ref: stat3.ref, value: `${stat3.count}+`, label: "Happy Tenants", icon: "😊" },
              ].map((s) => (
                <div
                  key={s.label}
                  ref={s.ref}
                  className="glass-dark rounded-2xl p-4 text-center hover-lift cursor-default"
                >
                  <span className="text-lg mb-1 block">{s.icon}</span>
                  <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{s.value}</span>
                  <span className="block text-[11px] font-medium text-white/30 uppercase tracking-widest mt-1">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== TRUST MARQUEE ===== */}
        <section className="bg-gray-950 border-y border-white/[0.04] py-4 overflow-hidden">
          <div className="animate-marquee flex items-center gap-12 whitespace-nowrap">
            {[...Array(2)].map((_, setIdx) => (
              <div key={setIdx} className="flex items-center gap-12">
                {[
                  "🔒 Verified Listings", "⭐ 4.3 Average Rating", "📞 Instant Callbacks",
                  "🏠 20+ Premium PGs", "💰 No Brokerage", "🛡️ Safe & Secure",
                  "📍 15+ Areas", "🔥 Updated Daily", "❤️ 500+ Happy Tenants",
                  "🏆 #1 PG Finder in Bangalore",
                ].map((item) => (
                  <span key={`${setIdx}-${item}`} className="text-sm font-medium text-white/25 flex items-center gap-2">
                    {item}
                    <span className="w-1.5 h-1.5 bg-violet-500/40 rounded-full" />
                  </span>
                ))}
              </div>
            ))}
          </div>
        </section>

        {/* ===== AREA PILLS WITH EMOJI ===== */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            <button
              onClick={() => setFilters(defaultFilters)}
              className={`shrink-0 px-6 py-3.5 rounded-2xl font-medium text-sm transition-all ${
                !filters.area
                  ? "bg-gray-900 text-white shadow-lg shadow-gray-900/25 ring-1 ring-white/10"
                  : "bg-white text-gray-600 shadow-sm border border-gray-100 hover:border-violet-200 hover:shadow-md"
              }`}
            >
              🌍 All Areas
            </button>
            {Object.entries(areaCount).map(([area, count]) => (
              <button
                key={area}
                onClick={() => setFilters({ ...defaultFilters, area })}
                className={`shrink-0 px-6 py-3.5 rounded-2xl font-medium text-sm transition-all ${
                  filters.area === area
                    ? "bg-gray-900 text-white shadow-lg shadow-gray-900/25 ring-1 ring-white/10"
                    : "bg-white text-gray-600 shadow-sm border border-gray-100 hover:border-violet-200 hover:shadow-md"
                }`}
              >
                {areaEmojis[area] || "📍"} {area} <span className="text-xs opacity-50 ml-1">{count}</span>
              </button>
            ))}
          </div>
        </section>

        {/* ===== FILTERS + LISTINGS ===== */}
        <section id="listings" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <SearchFilters filters={filters} onChange={setFilters} />

          {/* Toolbar */}
          <div className="flex items-center justify-between mt-10 mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                {filters.area ? `PGs in ${filters.area}` : "All PG Listings"}
              </h2>
              <p className="text-sm text-gray-400 mt-1">{filtered.length} results found</p>
            </div>
            <div className="flex items-center gap-3">
              {/* View Toggle */}
              <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2.5 rounded-lg transition-all ${viewMode === "grid" ? "bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white" : "text-gray-400"}`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode("map")}
                  className={`p-2.5 rounded-lg transition-all ${viewMode === "map" ? "bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white" : "text-gray-400"}`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                </button>
              </div>
              <select
                className="premium-input !py-2.5 !px-4 text-sm text-gray-600"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="rating">⭐ Top Rated</option>
                <option value="price-low">💰 Price: Low to High</option>
                <option value="price-high">💎 Price: High to Low</option>
                <option value="reviews">💬 Most Reviews</option>
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
                      className={`absolute top-4 left-14 z-10 pill text-[11px] transition-all shadow-sm backdrop-blur-sm ${
                        compareList.find((c) => c.id === pg.id)
                          ? "bg-violet-600 text-white shadow-violet-500/30"
                          : "bg-white/80 text-gray-600 hover:bg-violet-50 border border-white/50"
                      }`}
                    >
                      {compareList.find((c) => c.id === pg.id) ? "✓ Added" : "⚖️ Compare"}
                    </button>
                  </div>
                ))}
              </div>
            )
          ) : (
            <div className="text-center py-24">
              <div className="w-24 h-24 bg-violet-50 dark:bg-violet-900/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <span className="text-5xl">🔍</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No PGs found</h3>
              <p className="text-gray-400 mb-6">Try adjusting your filters or explore a different area.</p>
              <button onClick={() => setFilters(defaultFilters)} className="btn-premium">
                Clear All Filters
              </button>
            </div>
          )}
        </section>

        {/* ===== BENTO AREAS GRID ===== */}
        <section id="areas" className="bg-white dark:bg-gray-950 py-24 border-t border-gray-100 dark:border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <span className="pill bg-violet-50 dark:bg-violet-900/30 text-violet-600 !text-xs font-semibold mb-4 inline-block">Popular Neighborhoods</span>
              <h2 className="text-3xl sm:text-5xl font-extrabold text-gray-900 dark:text-white mb-4 tracking-tight">
                Explore by <span className="gradient-text">Area</span>
              </h2>
              <p className="text-gray-400 max-w-md mx-auto">Browse PGs across Bangalore&apos;s most popular neighbourhoods</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 stagger-children">
              {Object.entries(areaCount).map(([area, count], i) => (
                <button
                  key={area}
                  onClick={() => {
                    setFilters({ ...defaultFilters, area });
                    document.getElementById("listings")?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className={`premium-card !rounded-2xl p-5 text-left group relative overflow-hidden ${
                    i === 0 ? "sm:col-span-2 sm:row-span-2" : ""
                  }`}
                >
                  {/* Gradient background on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-fuchsia-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative z-10">
                    <span className={`${i === 0 ? "text-4xl" : "text-2xl"} block mb-3`}>{areaEmojis[area] || "📍"}</span>
                    <p className={`font-bold text-gray-900 dark:text-white ${i === 0 ? "text-xl" : "text-[15px]"} group-hover:text-violet-600 transition-colors`}>{area}</p>
                    <p className="text-xs text-gray-400 mt-1">{count} PGs available</p>
                    {i === 0 && (
                      <p className="text-sm text-gray-400 mt-3 leading-relaxed">The startup capital of Bangalore. Most popular area for tech professionals.</p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ===== PRICE DROP ALERT ===== */}
        <PriceAlertBanner />

        {/* ===== PRICE INSIGHTS ===== */}
        <PriceInsights />

        {/* ===== TESTIMONIALS ===== */}
        <Testimonials />

        {/* ===== HOW IT WORKS — VISUAL STEPS ===== */}
        <section className="py-24 relative overflow-hidden">
          {/* Background accents */}
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-500/[0.03] rounded-full blur-[100px]" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-fuchsia-500/[0.03] rounded-full blur-[100px]" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-16">
              <span className="pill bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 !text-xs font-semibold mb-4 inline-block">Simple Process</span>
              <h2 className="text-3xl sm:text-5xl font-extrabold text-gray-900 dark:text-white mb-4 tracking-tight">
                How it <span className="gradient-text">works</span>
              </h2>
              <p className="text-gray-400 max-w-md mx-auto">Find and move into your PG in 3 simple steps</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 relative">
              {/* Connecting line */}
              <div className="hidden sm:block absolute top-16 left-[16%] right-[16%] h-[2px] bg-gradient-to-r from-violet-200 via-fuchsia-200 to-pink-200 dark:from-violet-800 dark:via-fuchsia-800 dark:to-pink-800" />

              {[
                { step: "01", title: "Search & Filter", desc: "Browse PGs by area, budget, amenities, and room type. Use our smart filters to narrow down.", emoji: "🔍", gradient: "from-violet-500 to-indigo-500" },
                { step: "02", title: "Compare & Choose", desc: "Compare up to 3 PGs side by side. Check ratings, reviews, and amenities at a glance.", emoji: "⚖️", gradient: "from-fuchsia-500 to-pink-500" },
                { step: "03", title: "Contact & Move In", desc: "Call or WhatsApp the PG owner directly. Schedule a visit and move in hassle-free.", emoji: "🏠", gradient: "from-orange-500 to-amber-500" },
              ].map((item) => (
                <div key={item.step} className="premium-card !rounded-3xl p-8 text-center group relative">
                  {/* Step number circle */}
                  <div className={`w-14 h-14 bg-gradient-to-br ${item.gradient} rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg`}>
                    <span className="text-2xl">{item.emoji}</span>
                  </div>
                  <span className="text-[10px] font-extrabold text-violet-400 tracking-[0.2em] uppercase">Step {item.step}</span>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mt-2 mb-3">{item.title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== CTA WITH ANIMATED BORDER ===== */}
        <section className="py-20 bg-white dark:bg-gray-950 border-t border-gray-100 dark:border-gray-800">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <div className="hero-gradient rounded-3xl p-14 sm:p-20 relative overflow-hidden">
              {/* Aurora orbs */}
              <div className="absolute top-0 right-0 w-80 h-80 bg-violet-500/15 rounded-full blur-[100px] orb-1" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-fuchsia-500/10 rounded-full blur-[80px] orb-2" />
              <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-blue-500/5 rounded-full blur-[120px]" />

              {/* Grid */}
              <div className="absolute inset-0 opacity-[0.03]" style={{
                backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                backgroundSize: '40px 40px'
              }} />

              <div className="relative z-10">
                <span className="pill bg-white/10 text-white/80 !text-xs font-semibold mb-6 inline-block border border-white/10">For PG Owners</span>
                <h2 className="text-3xl sm:text-5xl font-extrabold text-white mb-5 tracking-tight">
                  Own a PG? List it for <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-300 to-fuchsia-300">free</span>
                </h2>
                <p className="text-white/40 max-w-md mx-auto mb-10 text-lg">
                  Reach thousands of potential tenants every day. Premium plans start from just ₹499/mo.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a href="/list-your-pg" className="btn-premium inline-block !text-base !py-4 !px-10">
                    List Your PG Now
                  </a>
                  <a href="/owner-dashboard" className="inline-block py-4 px-10 bg-white/[0.06] border border-white/10 text-white font-semibold rounded-2xl hover:bg-white/10 transition-all text-base">
                    Owner Dashboard
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== FOOTER ===== */}
        <footer className="bg-gray-950 text-gray-500 pt-20 pb-8 relative overflow-hidden">
          {/* Subtle gradient */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-violet-600/[0.03] rounded-full blur-[150px]" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-10 mb-16">
              <div className="sm:col-span-2">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-11 h-11 bg-gradient-to-br from-violet-600 to-fuchsia-500 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/20">
                    <span className="text-white font-bold text-lg">P</span>
                  </div>
                  <div>
                    <span className="text-white font-bold text-xl block leading-none">PG Finder</span>
                    <span className="text-[10px] text-violet-400 font-semibold uppercase tracking-widest">Bangalore</span>
                  </div>
                </div>
                <p className="text-sm leading-relaxed max-w-xs text-gray-500 mb-6">
                  Bangalore&apos;s most trusted platform to find PG accommodations, hostels, and co-living spaces.
                </p>
                {/* Social links */}
                <div className="flex items-center gap-3">
                  {["Twitter", "Instagram", "LinkedIn"].map((s) => (
                    <div key={s} className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/[0.08] transition-all cursor-pointer">
                      <span className="text-xs font-bold">{s.charAt(0)}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-white text-xs font-semibold mb-5 uppercase tracking-[0.15em]">Popular Areas</h4>
                <ul className="space-y-3 text-sm">
                  {["Koramangala", "HSR Layout", "Indiranagar", "Whitefield", "Bellandur"].map((a) => (
                    <li key={a}>
                      <button
                        onClick={() => {
                          setFilters({ ...defaultFilters, area: a });
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        className="hover:text-white transition-colors flex items-center gap-2"
                      >
                        <span className="w-1 h-1 bg-violet-500/50 rounded-full" />
                        {a}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-white text-xs font-semibold mb-5 uppercase tracking-[0.15em]">Company</h4>
                <ul className="space-y-3 text-sm">
                  {[
                    { label: "About Us", href: "#" },
                    { label: "List Your PG", href: "/list-your-pg" },
                    { label: "Find Roommates", href: "/roommate-finder" },
                    { label: "Owner Dashboard", href: "/owner-dashboard" },
                    { label: "Privacy Policy", href: "#" },
                  ].map((item) => (
                    <li key={item.label}>
                      <a href={item.href} className="hover:text-white transition-colors flex items-center gap-2">
                        <span className="w-1 h-1 bg-violet-500/50 rounded-full" />
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="border-t border-white/[0.04] pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs text-gray-600">&copy; 2026 PG Finder Bangalore. All rights reserved.</p>
              <p className="text-xs text-gray-700 flex items-center gap-1.5">
                Made with <span className="text-red-500">❤️</span> in Bangalore
              </p>
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
