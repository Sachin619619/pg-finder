"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useDebounce } from "@/lib/hooks";
import Header from "@/components/Header";
import SearchFilters from "@/components/SearchFilters";
import PGCard from "@/components/PGCard";
import MapView from "@/components/MapView";
import PriceInsights from "@/components/PriceInsights";
import AreaInsights from "@/components/AreaInsights";
import PGRankings from "@/components/PGRankings";
import Testimonials from "@/components/Testimonials";
import PriceAlertBanner from "@/components/PriceAlertBanner";
import ScrollReveal from "@/components/ScrollReveal";
import AdBanner from "@/components/AdBanner";
import AnimatedBanner from "@/components/AnimatedBanner";
import GhibliShowcase from "@/components/GhibliShowcase";
import RecentlyViewed from "@/components/RecentlyViewed";
import SearchAutocomplete from "@/components/SearchAutocomplete";
import CostCalculator from "@/components/CostCalculator";
import Link from "next/link";
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
  const [showCostCalc, setShowCostCalc] = useState(false);
  const [listings, setListings] = useState<PGListing[]>([]);
  const [loading, setLoading] = useState(true);
  const debouncedSearch = useDebounce(filters.search, 300);

  useEffect(() => {
    fetchListings()
      .then((data) => {
        setListings(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  const areas = useMemo(() => {
    return [...new Set(listings.map((l) => l.area))].sort();
  }, [listings]);

  const stat1 = useCounter(listings.length);
  const stat2 = useCounter(areas.length);
  const totalReviews = useMemo(() => listings.reduce((acc, pg) => acc + pg.reviews, 0), [listings]);
  const stat3 = useCounter(totalReviews || 500);

  const filtered = useMemo(() => {
    let result = listings.filter((pg) => {
      if (debouncedSearch) {
        const q = debouncedSearch.toLowerCase();
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
  }, [listings, filters, debouncedSearch, sortBy]);

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
      <main id="main-content" className="flex-1 overflow-x-hidden">
        {/* ===== HERO ===== */}
        <section className="bg-[#F4EDD9] pt-36 pb-28 sm:pt-44 sm:pb-36 relative overflow-hidden">
          {/* Subtle Ghibli watercolor hero background */}
          <div className="absolute inset-0 opacity-[0.35] pointer-events-none" style={{backgroundImage: 'url(/images/ghibli/bg-watercolor.png)', backgroundSize: 'cover', backgroundPosition: 'top center'}} />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              {/* Hero heading */}
              <h1 className="font-serif text-5xl sm:text-7xl font-normal mb-7 leading-[1.05] tracking-tight text-black">
                Find your
                <br />
                <em>perfect stay</em>
                <br />
                in Bangalore
              </h1>

              <p className="text-lg text-black/50 max-w-lg mx-auto mb-12 leading-relaxed">
                Discover premium PGs, hostels & co-living spaces. Curated listings with verified reviews and transparent pricing.
              </p>

              {/* Search bar with autocomplete */}
              <div className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto">
                <SearchAutocomplete
                  areas={Object.entries(areaCount).map(([name, count]) => ({
                    name,
                    count,
                    slug: name.toLowerCase().replace(/\s+/g, "-"),
                  }))}
                  value={filters.search}
                  onChange={(val) => setFilters({ ...filters, search: val })}
                  onSearch={() => document.getElementById("listings")?.scrollIntoView({ behavior: "smooth" })}
                />
                <button
                  onClick={() => document.getElementById("listings")?.scrollIntoView({ behavior: "smooth" })}
                  className="bg-[#1B1C15] text-white py-4 px-8 rounded-[14px] font-medium text-sm hover:opacity-90 transition-opacity whitespace-nowrap"
                >
                  Search PGs
                </button>
              </div>

              {/* Popular area chips */}
              <div className="flex flex-wrap justify-center gap-2 mt-6 max-w-xl mx-auto">
                <span className="text-xs text-black/35 font-medium self-center mr-1">Popular:</span>
                {[
                  { name: "Koramangala", emoji: "🏙️" },
                  { name: "HSR Layout", emoji: "💻" },
                  { name: "Indiranagar", emoji: "🎵" },
                  { name: "Whitefield", emoji: "🏢" },
                  { name: "BTM Layout", emoji: "🎯" },
                  { name: "Marathahalli", emoji: "🌉" },
                  { name: "Electronic City", emoji: "⚡" },
                ].map((area) => (
                  <Link
                    key={area.name}
                    href={`/area/${area.name.toLowerCase().replace(/\s+/g, "-")}`}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white/60 backdrop-blur-sm border border-[#e8e0cc]/80 rounded-full text-xs font-medium text-black/60 hover:bg-white hover:border-black/20 hover:text-black/80 transition-all"
                  >
                    <span>{area.emoji}</span>
                    {area.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="mt-20 grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-3xl mx-auto">
              {[
                { ref: stat1.ref, value: `${stat1.count}+`, label: "Verified PGs" },
                { ref: stat2.ref, value: `${stat2.count}+`, label: "Areas Covered" },
                { ref: null, value: "4.3", label: "Avg Rating" },
                { ref: stat3.ref, value: `${stat3.count}+`, label: "Happy Tenants" },
              ].map((s) => (
                <div
                  key={s.label}
                  ref={s.ref}
                  className="text-center"
                >
                  <span className="text-3xl sm:text-4xl font-serif text-black tracking-tight block">{s.value}</span>
                  <span className="block text-[11px] font-medium text-black/40 uppercase tracking-widest mt-1">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== TRUST MARQUEE ===== */}
        <section className="bg-[#FFFAEB] border-y border-[#e8e0cc] py-4 overflow-hidden">
          <div className="animate-marquee flex items-center gap-12 whitespace-nowrap">
            {[...Array(2)].map((_, setIdx) => (
              <div key={setIdx} className="flex items-center gap-12">
                {[
                  "Verified Listings", "4.3 Average Rating", "Instant Callbacks",
                  "20+ Premium PGs", "No Brokerage", "Safe & Secure",
                  "15+ Areas", "Updated Daily", "500+ Happy Tenants",
                  "#1 Castle in Bangalore",
                ].map((item) => (
                  <span key={`${setIdx}-${item}`} className="text-sm font-medium text-black/40 flex items-center gap-2">
                    {item}
                    <span className="w-1.5 h-1.5 bg-black/20 rounded-full" />
                  </span>
                ))}
              </div>
            ))}
          </div>
        </section>

        {/* ===== GHIBLI SHOWCASE ===== */}
        <GhibliShowcase />

        {/* Dynamic Banner — after trust marquee */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedBanner seed={1} style="marquee" />
        </div>

        {/* ===== AREA PILLS ===== */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            <button
              onClick={() => setFilters(defaultFilters)}
              className={`shrink-0 px-6 py-3.5 rounded-full font-medium text-sm transition-all ${
                !filters.area
                  ? "bg-[#1B1C15] text-white"
                  : "bg-[#FFFAEB] text-black border border-[#e8e0cc] hover:border-black/30"
              }`}
            >
              All Areas
            </button>
            {Object.entries(areaCount).map(([area, count]) => (
              <button
                key={area}
                onClick={() => setFilters({ ...defaultFilters, area })}
                className={`shrink-0 px-6 py-3.5 rounded-full font-medium text-sm transition-all ${
                  filters.area === area
                    ? "bg-[#1B1C15] text-white"
                    : "bg-[#FFFAEB] text-black border border-[#e8e0cc] hover:border-black/30"
                }`}
              >
                {area} <span className="text-xs opacity-50 ml-1">{count}</span>
              </button>
            ))}
          </div>
        </section>

        {/* ===== RECENTLY VIEWED ===== */}
        <RecentlyViewed />

        {/* ===== FILTERS + LISTINGS ===== */}
        <section id="listings" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 relative">
          {/* Subtle Ghibli watercolor background */}
          <div className="absolute inset-0 -mx-[50vw] left-1/2 right-1/2 w-screen opacity-[0.25] pointer-events-none" style={{backgroundImage: 'url(/images/ghibli/bg-watercolor.png)', backgroundSize: 'cover', backgroundPosition: 'center'}} />
          <SearchFilters filters={filters} onChange={setFilters} />

          {/* Toolbar */}
          <div className="flex items-center justify-between mt-10 mb-8">
            <div>
              <h2 className="font-serif text-2xl sm:text-3xl font-normal text-black tracking-tight">
                {filters.area ? `PGs in ${filters.area}` : "All PG Listings"}
              </h2>
              <p className="text-sm text-black/40 mt-1">{filtered.length} results found</p>
            </div>
            <div className="flex items-center gap-3">
              {/* View Toggle */}
              <div className="flex items-center bg-[#FFFAEB] border border-[#e8e0cc] rounded-xl p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2.5 rounded-lg transition-all ${viewMode === "grid" ? "bg-white shadow-sm text-black" : "text-black/30"}`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode("map")}
                  className={`p-2.5 rounded-lg transition-all ${viewMode === "map" ? "bg-white shadow-sm text-black" : "text-black/30"}`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                </button>
              </div>
              <select
                className="bg-[#FFFAEB] border border-[#e8e0cc] rounded-xl py-2.5 px-4 text-sm text-black outline-none"
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
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-[#FFFAEB] border border-[#e8e0cc] rounded-2xl overflow-hidden animate-pulse">
                  <div className="h-52 bg-[#e8e0cc] rounded-t-2xl" />
                  <div className="p-5 space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2 flex-1">
                        <div className="h-5 bg-[#e8e0cc] rounded-xl w-3/4" />
                        <div className="h-3 bg-[#e8e0cc] rounded w-1/2" />
                      </div>
                      <div className="h-8 bg-[#e8e0cc] rounded-xl w-16" />
                    </div>
                    <div className="h-5 bg-[#e8e0cc] rounded-lg w-28" />
                    <div className="flex gap-2 pt-1">
                      <div className="h-2.5 w-2.5 bg-[#e8e0cc] rounded-full" />
                      <div className="h-2.5 w-2.5 bg-[#e8e0cc] rounded-full" />
                      <div className="h-2.5 w-2.5 bg-[#e8e0cc] rounded-full" />
                      <div className="h-2.5 w-2.5 bg-[#e8e0cc] rounded-full" />
                      <div className="h-2.5 w-2.5 bg-[#e8e0cc] rounded-full" />
                    </div>
                    <div className="flex gap-2 pt-2">
                      <div className="h-6 bg-[#e8e0cc] rounded-full w-16" />
                      <div className="h-6 bg-[#e8e0cc] rounded-full w-14" />
                      <div className="h-6 bg-[#e8e0cc] rounded-full w-12" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length > 0 ? (
            viewMode === "map" ? (
              <MapView listings={filtered} />
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7 stagger-children">
                  {filtered.map((pg, index) => (
                    <div key={pg.id}>
                      <PGCard pg={pg} priority={index < 3} />
                      {/* In-feed ad after every 6th listing */}
                      {index === 5 && filtered.length > 6 && (
                        <div className="mt-7">
                          <AdBanner size="in-feed" slot="1234567890" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                {/* Bottom banner ad after listings */}
                {filtered.length > 3 && (
                  <div className="mt-10">
                    <AdBanner size="banner" slot="0987654321" />
                  </div>
                )}
              </>
            )
          ) : (
            <div className="text-center py-24">
              <div className="w-28 h-28 bg-[#FFFAEB] rounded-3xl flex items-center justify-center mx-auto mb-6 relative">
                <span className="text-5xl">🏠</span>
                <div className="absolute -bottom-1 -right-1 w-10 h-10 bg-red-50 rounded-full flex items-center justify-center border-4 border-white">
                  <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              </div>
              <h3 className="font-serif text-xl text-black mb-2">No PGs match your filters</h3>
              <p className="text-black/40 mb-2">We couldn&apos;t find any PGs matching your current criteria.</p>
              <p className="text-black/30 text-sm mb-8">Try broadening your search or removing some filters.</p>
              <div className="flex items-center justify-center gap-3">
                <button onClick={() => setFilters(defaultFilters)} className="bg-[#1B1C15] text-white py-3 px-6 rounded-[14px] font-medium text-sm hover:opacity-90 transition-opacity">
                  Clear Filters
                </button>
                <button
                  onClick={() => setFilters({ ...defaultFilters, search: "" })}
                  className="px-6 py-3 rounded-[14px] text-sm font-medium bg-[#FFFAEB] border border-[#e8e0cc] text-black hover:border-black/30 transition-all"
                >
                  Browse All PGs
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Dynamic Banner — between listings and areas */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedBanner seed={2} style="floating" />
        </div>

        {/* ===== BENTO AREAS GRID ===== */}
        <section id="areas" className="bg-[#F4EDD9] py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ScrollReveal>
            <div className="text-center mb-14">
              <span className="text-xs font-semibold text-black/40 uppercase tracking-widest mb-4 inline-block">Popular Neighborhoods</span>
              <h2 className="font-serif text-3xl sm:text-5xl font-normal text-black mb-4 tracking-tight">
                Explore by Area
              </h2>
              <p className="text-black/50 max-w-md mx-auto">Browse PGs across Bangalore&apos;s most popular neighbourhoods</p>
            </div>
            </ScrollReveal>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {Object.entries(areaCount).map(([area, count], i) => (
                <ScrollReveal key={area} delay={i * 80} direction={i % 2 === 0 ? "up" : "scale"}>
                <button
                  onClick={() => {
                    setFilters({ ...defaultFilters, area });
                    document.getElementById("listings")?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className={`w-full bg-[#FFFAEB] border border-[#e8e0cc] rounded-2xl p-5 text-left group relative overflow-hidden hover:border-black/20 transition-all ${
                    i === 0 ? "sm:col-span-2 sm:row-span-2" : ""
                  }`}
                >
                  <div className="relative z-10">
                    <span className={`${i === 0 ? "text-4xl" : "text-2xl"} block mb-3`}>{areaEmojis[area] || "📍"}</span>
                    <p className={`font-serif text-black ${i === 0 ? "text-xl" : "text-[15px]"}`}>{area}</p>
                    <p className="text-xs text-black/40 mt-1">{count} PGs available</p>
                    {i === 0 && (
                      <p className="text-sm text-black/40 mt-3 leading-relaxed">The startup capital of Bangalore. Most popular area for tech professionals.</p>
                    )}
                  </div>
                </button>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* ===== AREA INSIGHTS ===== */}
        <AreaInsights />

        {/* ===== PRICE DROP ALERT ===== */}
        <ScrollReveal direction="scale">
          <PriceAlertBanner />
        </ScrollReveal>

        {/* Dynamic Banner — after price alert */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedBanner seed={3} style="split" />
        </div>

        {/* ===== PRICE INSIGHTS ===== */}
        <ScrollReveal direction="left">
          <PriceInsights listings={listings} />
        </ScrollReveal>

        {/* ===== TESTIMONIALS ===== */}
        <ScrollReveal direction="right">
          <Testimonials />
        </ScrollReveal>

        {/* ===== PG RANKINGS ===== */}
        <PGRankings listings={listings} />

        {/* Dynamic Banner — before how it works */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedBanner seed={4} style="pulse" />
        </div>

        {/* ===== HOW IT WORKS — VISUAL STEPS ===== */}
        <section className="py-24 bg-white relative overflow-hidden">
          {/* Subtle Ghibli botanical background */}
          <div className="absolute inset-0 opacity-[0.25] pointer-events-none" style={{backgroundImage: 'url(/images/ghibli/bg-botanical.png)', backgroundSize: 'cover', backgroundPosition: 'center'}} />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <ScrollReveal>
            <div className="text-center mb-16">
              <span className="text-xs font-semibold text-black/40 uppercase tracking-widest mb-4 inline-block">Simple Process</span>
              <h2 className="font-serif text-3xl sm:text-5xl font-normal text-black mb-4 tracking-tight">
                How it works
              </h2>
              <p className="text-black/50 max-w-md mx-auto">Find and move into your PG in 3 simple steps</p>
            </div>
            </ScrollReveal>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 relative">
              {/* Connecting line */}
              <div className="hidden sm:block absolute top-[180px] left-[16%] right-[16%] h-[1px] bg-[#e8e0cc] z-0" />

              {[
                { step: "01", title: "Search & Filter", desc: "Browse PGs by area, budget, amenities, and room type. Use our smart filters to narrow down.", image: "/images/ghibli/step-search.png" },
                { step: "02", title: "Compare & Visit", desc: "Visit PGs, meet owners, and compare amenities. Find the perfect match for your lifestyle.", image: "/images/ghibli/step-visit.png" },
                { step: "03", title: "Move In & Settle", desc: "Pack your bags and move into your new home. Zero brokerage, zero hassle.", image: "/images/ghibli/step-movein.png" },
              ].map((item, idx) => (
                <ScrollReveal key={item.step} delay={idx * 150} direction="up">
                <div className="bg-[#FFFAEB] border border-[#e8e0cc] rounded-3xl overflow-hidden text-center group relative hover:border-black/20 transition-all">
                  {/* Ghibli illustration */}
                  <div className="relative h-44 overflow-hidden">
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#FFFAEB] via-transparent to-transparent" />
                    <div className="absolute top-3 left-3 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-lg flex items-center justify-center text-xs font-bold text-[#1B1C15] border border-white/50">{item.step}</div>
                  </div>
                  <div className="p-6 pt-2">
                    <h3 className="font-serif text-lg text-black mt-1 mb-3">{item.title}</h3>
                    <p className="text-sm text-black/50 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>


        {/* ===== FOOTER ===== */}
        <footer className="bg-[#F4EDD9] text-black/50 pt-20 pb-8 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-10 mb-16">
              <div className="sm:col-span-2">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-11 h-11 bg-[#1B1C15] rounded-xl flex items-center justify-center">
                    <span className="text-white text-lg">🏰</span>
                  </div>
                  <div>
                    <span className="font-serif text-black text-xl block leading-none">Castle</span>
                    <span className="text-[10px] text-black/40 font-semibold uppercase tracking-widest">Find Your Home</span>
                  </div>
                </div>
                <p className="text-sm leading-relaxed max-w-xs text-black/50 mb-6">
                  Bangalore&apos;s most trusted platform to find PG accommodations, hostels, and co-living spaces.
                </p>
                {/* Social links */}
                <div className="flex items-center gap-3">
                  <a href="#" aria-label="Twitter" className="w-9 h-9 rounded-xl bg-black/[0.04] border border-black/[0.08] flex items-center justify-center text-black/40 hover:text-black hover:bg-black/[0.08] transition-all cursor-pointer">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                  </a>
                  <a href="#" aria-label="Instagram" className="w-9 h-9 rounded-xl bg-black/[0.04] border border-black/[0.08] flex items-center justify-center text-black/40 hover:text-black hover:bg-black/[0.08] transition-all cursor-pointer">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                  </a>
                  <a href="#" aria-label="LinkedIn" className="w-9 h-9 rounded-xl bg-black/[0.04] border border-black/[0.08] flex items-center justify-center text-black/40 hover:text-black hover:bg-black/[0.08] transition-all cursor-pointer">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                  </a>
                </div>
              </div>
              <div>
                <h4 className="font-serif text-black text-xs font-semibold mb-5 uppercase tracking-[0.15em]">Popular Areas</h4>
                <ul className="space-y-3 text-sm">
                  {["Koramangala", "HSR Layout", "Indiranagar", "Whitefield", "Bellandur"].map((a) => (
                    <li key={a}>
                      <button
                        onClick={() => {
                          setFilters({ ...defaultFilters, area: a });
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        className="hover:text-black transition-colors flex items-center gap-2"
                      >
                        <span className="w-1 h-1 bg-black/30 rounded-full" />
                        {a}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-serif text-black text-xs font-semibold mb-5 uppercase tracking-[0.15em]">Company</h4>
                <ul className="space-y-3 text-sm">
                  {[
                    { label: "Find Roommates", href: "/roommate-finder" },
                    { label: "Owner Dashboard", href: "/owner-dashboard" },
                    { label: "Saved PGs", href: "/saved" },
                    { label: "FAQ", href: "/faq" },
                    { label: "Contact Us", href: "/contact" },
                  ].map((item) => (
                    <li key={item.label}>
                      <a href={item.href} className="hover:text-black transition-colors flex items-center gap-2">
                        <span className="w-1 h-1 bg-black/30 rounded-full" />
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="border-t border-black/[0.08] pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs text-black/40">&copy; 2026 Castle. All rights reserved.</p>
              <div className="flex items-center gap-4">
                <a href="/privacy" className="text-xs text-black/40 hover:text-black transition-colors">Privacy Policy</a>
                <span className="text-black/20">·</span>
                <a href="/terms" className="text-xs text-black/40 hover:text-black transition-colors">Terms of Service</a>
              </div>
              <p className="text-xs text-black/40 flex items-center gap-1.5">
                Made with <span className="text-red-500">❤️</span> in Bangalore
              </p>
            </div>
          </div>
        </footer>
      </main>

      {/* Floating Cost Calculator Button */}
      <button
        onClick={() => setShowCostCalc(true)}
        className="fixed bottom-6 right-6 z-40 bg-[#1B1C15] text-white px-5 py-3.5 rounded-2xl font-semibold text-sm shadow-2xl shadow-black/30 hover:shadow-black/40 hover:-translate-y-1 active:translate-y-0 transition-all flex items-center gap-2 group"
        aria-label="Open cost calculator"
      >
        <span className="text-lg group-hover:animate-bounce">💰</span>
        <span className="hidden sm:inline">Calculate Cost</span>
      </button>

      {/* Cost Calculator Modal */}
      <CostCalculator
        isOpen={showCostCalc}
        onClose={() => setShowCostCalc(false)}
      />
    </>
  );
}
