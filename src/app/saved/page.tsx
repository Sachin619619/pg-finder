"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import PGCard from "@/components/PGCard";
import { fetchListings } from "@/lib/db";
import { getWishlist } from "@/lib/store";
import type { PGListing } from "@/data/listings";
import Link from "next/link";

export default function SavedPage() {
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [allListings, setAllListings] = useState<PGListing[]>([]);

  useEffect(() => {
    fetchListings().then(setAllListings);
    setSavedIds(getWishlist());
    const interval = setInterval(() => setSavedIds(getWishlist()), 1000);
    return () => clearInterval(interval);
  }, []);

  const savedPGs = allListings.filter((pg) => savedIds.includes(pg.id));

  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">
            Saved PGs <span className="gradient-text">❤️</span>
          </h1>
          <p className="text-gray-400">Your shortlisted PG accommodations</p>
        </div>

        {savedPGs.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7 stagger-children">
            {savedPGs.map((pg) => (
              <PGCard key={pg.id} pg={pg} />
            ))}
          </div>
        ) : (
          <div className="text-center py-24">
            <div className="w-24 h-24 bg-red-50 dark:bg-red-900/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No saved PGs yet</h3>
            <p className="text-gray-400 mb-6">Start browsing and tap the heart icon to save PGs you like!</p>
            <Link href="/" className="btn-premium inline-block">
              Browse PGs
            </Link>
          </div>
        )}
      </main>
    </>
  );
}
