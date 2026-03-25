"use client";

import { useState, useEffect, useCallback } from "react";
import Header from "@/components/Header";
import PGCard from "@/components/PGCard";
import { fetchListings } from "@/lib/db";
import { getWishlist } from "@/lib/store";
import type { PGListing } from "@/data/listings";
import Link from "next/link";
import AnimatedBanner from "@/components/AnimatedBanner";

export default function SavedPage() {
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [allListings, setAllListings] = useState<PGListing[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshWishlist = useCallback(() => setSavedIds(getWishlist()), []);

  useEffect(() => { document.title = "Saved PGs | Castle"; }, []);

  useEffect(() => {
    fetchListings().then((data) => {
      setAllListings(data);
      setLoading(false);
    });
    refreshWishlist();

    // Listen for storage changes (from other tabs or wishlist button clicks)
    const handleStorage = () => refreshWishlist();
    window.addEventListener("storage", handleStorage);
    // Custom event for same-tab wishlist updates
    window.addEventListener("wishlist-update", handleStorage);
    // Also refresh on focus (covers switching back from listing page)
    window.addEventListener("focus", handleStorage);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("wishlist-update", handleStorage);
      window.removeEventListener("focus", handleStorage);
    };
  }, [refreshWishlist]);

  const savedPGs = allListings.filter((pg) => savedIds.includes(pg.id));

  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16 animate-fade-in-up">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm text-gray-500 flex items-center gap-2">
          <Link href="/" className="hover:text-[#1a1a1a] transition-colors">Home</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">Saved PGs</span>
        </nav>

        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Saved PGs <span className="gradient-text">❤️</span>
          </h1>
          <p className="text-gray-400">Your shortlisted PG accommodations</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
            {[1, 2, 3].map((i) => (
              <div key={i} className="premium-card !rounded-2xl overflow-hidden animate-pulse">
                <div className="h-52 bg-gray-200 rounded-t-2xl" />
                <div className="p-5 space-y-3">
                  <div className="h-5 bg-gray-200 rounded-xl w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                  <div className="h-5 bg-gray-200 rounded-lg w-28" />
                  <div className="flex gap-2 pt-1">
                    <div className="h-2.5 w-2.5 bg-gray-200 rounded-full" />
                    <div className="h-2.5 w-2.5 bg-gray-200 rounded-full" />
                    <div className="h-2.5 w-2.5 bg-gray-200 rounded-full" />
                    <div className="h-2.5 w-2.5 bg-gray-200 rounded-full" />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <div className="h-6 bg-gray-200 rounded-full w-16" />
                    <div className="h-6 bg-gray-200 rounded-full w-16" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : savedPGs.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7 stagger-children">
            {savedPGs.map((pg) => (
              <PGCard key={pg.id} pg={pg} />
            ))}
          </div>
        ) : (
          <div className="text-center py-24">
            <div className="w-24 h-24 bg-red-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No saved PGs yet</h3>
            <p className="text-gray-400 mb-6">Start browsing and tap the heart icon to save PGs you like!</p>
            <Link href="/" className="btn-premium inline-block">
              Browse PGs
            </Link>
          </div>
        )}
        <AnimatedBanner seed={10} />
      </main>
    </>
  );
}
