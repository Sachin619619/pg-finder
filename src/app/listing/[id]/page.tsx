"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
import { fetchListingById, fetchReviews } from "@/lib/db";
import type { PGListing } from "@/data/listings";
import type { Review } from "@/lib/db";
import Header from "@/components/Header";
import ReviewSection from "@/components/ReviewSection";
import CallbackModal from "@/components/CallbackModal";
import ShareButtons from "@/components/ShareButtons";
import WishlistButton from "@/components/WishlistButton";
import NearbyPlaces from "@/components/NearbyPlaces";
import PhotoGallery from "@/components/PhotoGallery";

export default function ListingPage() {
  const { id } = useParams();
  const [pg, setPg] = useState<PGListing | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCallback, setShowCallback] = useState(false);

  useEffect(() => {
    if (typeof id === "string") {
      Promise.all([fetchListingById(id), fetchReviews(id)])
        .then(([listing, revs]) => {
          setPg(listing);
          setReviews(revs);
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
    }
  }, [id]);

  if (loading) {
    return (
      <>
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-6" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-80 bg-gray-200 dark:bg-gray-700 rounded-2xl" />
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
                <div className="flex gap-3">
                  <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-xl w-32" />
                  <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-xl w-28" />
                  <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-xl w-36" />
                </div>
              </div>
              <div className="space-y-4">
                <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-2xl" />
              </div>
            </div>
          </div>
        </main>
      </>
    );
  }

  if (!pg) {
    return (
      <>
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">PG Not Found 😕</h1>
          <Link href="/" className="text-violet-600 hover:underline">Back to listings</Link>
        </div>
      </>
    );
  }
  const genderLabels = { male: "Male Only", female: "Female Only", coed: "Co-ed (Male & Female)" };
  const typeLabels = { single: "Single Occupancy", double: "Double Sharing", triple: "Triple Sharing", any: "Any" };

  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm text-gray-500 flex items-center gap-2">
          <Link href="/" className="hover:text-violet-600">Home</Link>
          <span>/</span>
          <Link href={`/area/${pg.area.toLowerCase().replace(/\s+/g, "-")}`} className="hover:text-violet-600">{pg.area}</Link>
          <span>/</span>
          <span className="text-gray-900 dark:text-gray-200">{pg.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Photo Gallery */}
            <div className="relative">
              <PhotoGallery pgName={pg.name} images={pg.images} />
              {/* Wishlist + Verified badges */}
              <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
                <WishlistButton pgId={pg.id} size="lg" />
              </div>
              {pg.rating >= 4.5 && (
                <div className="absolute top-4 left-4 z-10">
                  <span className="pill bg-emerald-500 text-white shadow-lg !text-xs">
                    <svg className="w-3.5 h-3.5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Verified
                  </span>
                </div>
              )}
            </div>

            {/* Title & Rating & Share */}
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{pg.name}</h1>
                  <p className="text-gray-500 mt-1 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {pg.locality}, {pg.area}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <ShareButtons pgName={pg.name} pgArea={pg.area} pgPrice={pg.price} />
                  <div className="flex items-center gap-1 bg-yellow-50 dark:bg-yellow-900/30 px-3 py-2 rounded-xl">
                    <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="text-lg font-bold text-gray-900 dark:text-amber-400">{pg.rating}</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">({pg.reviews})</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Info Badges */}
            <div className="flex flex-wrap gap-3">
              <span className="px-4 py-2 bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 rounded-xl font-medium">{typeLabels[pg.type]}</span>
              <span className={`px-4 py-2 rounded-xl font-medium ${pg.gender === "male" ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300" : pg.gender === "female" ? "bg-pink-50 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300" : "bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"}`}>
                {genderLabels[pg.gender]}
              </span>
              {pg.furnished && <span className="px-4 py-2 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-xl font-medium">✨ Fully Furnished</span>}
              {pg.foodIncluded && <span className="px-4 py-2 bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-xl font-medium">🍽️ Food Included</span>}
              {pg.acAvailable && <span className="px-4 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-xl font-medium">❄️ AC Available</span>}
            </div>

            {/* Description */}
            <div className="premium-card !rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">About this PG</h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{pg.description}</p>
            </div>

            {/* Amenities */}
            <div className="premium-card !rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Amenities</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {pg.amenities.map((a) => (
                  <div key={a} className="flex items-center gap-2 text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 px-4 py-3 rounded-xl">
                    <svg className="w-5 h-5 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm font-medium">{a}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Nearby Landmarks */}
            <div className="premium-card !rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Nearby Landmarks</h2>
              <div className="flex flex-wrap gap-2">
                {pg.nearbyLandmarks.map((l) => (
                  <span key={l} className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm text-gray-700 dark:text-gray-300">{l}</span>
                ))}
              </div>
              {pg.distanceFromMetro && (
                <p className="mt-3 text-sm text-gray-500 flex items-center gap-1">
                  <svg className="w-4 h-4 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  Nearest Metro: {pg.distanceFromMetro}
                </p>
              )}
            </div>

            {/* Nearby Places */}
            <NearbyPlaces area={pg.area} />

            {/* Reviews */}
            <ReviewSection reviews={reviews} pgId={pg.id} pgName={pg.name} />
          </div>

          {/* Right Column — Contact & Price */}
          <div className="space-y-6">
            {/* Price Card */}
            <div className="premium-card !rounded-2xl p-6 sticky top-24">
              <div className="text-center mb-6">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Monthly Rent</p>
                <p className="text-4xl font-bold text-gray-900 dark:text-white">₹{pg.price.toLocaleString()}</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">per month / per person</p>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-gray-500">Available From</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {new Date(pg.availableFrom).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-gray-500">Room Type</span>
                  <span className="font-medium text-gray-900 dark:text-white">{typeLabels[pg.type]}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-gray-500">Food</span>
                  <span className="font-medium text-gray-900 dark:text-white">{pg.foodIncluded ? "✅ Included" : "❌ Not Included"}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-500">WiFi</span>
                  <span className="font-medium text-gray-900 dark:text-white">{pg.wifiIncluded ? "✅ Included" : "❌ Not Included"}</span>
                </div>
              </div>

              {/* Contact */}
              <div className="bg-violet-50 dark:bg-violet-900/20 rounded-xl p-4 mb-4">
                <p className="text-sm font-medium text-violet-700 dark:text-violet-400 mb-1">Contact Person</p>
                <p className="font-semibold text-gray-900 dark:text-white">{pg.contactName}</p>
              </div>

              <a
                href={`tel:${pg.contactPhone}`}
                className="w-full bg-violet-600 text-white py-3 rounded-xl font-semibold text-center block hover:bg-violet-700 transition"
              >
                📞 Call {pg.contactPhone}
              </a>

              <a
                href={`https://wa.me/91${pg.contactPhone}?text=Hi, I found your PG "${pg.name}" on PG Finder. I'm interested in a ${pg.type} room. Is it available?`}
                target="_blank"
                className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold text-center block hover:bg-green-700 transition mt-3"
              >
                💬 WhatsApp
              </a>

              <button
                onClick={() => setShowCallback(true)}
                className="w-full bg-amber-500 text-white py-3 rounded-xl font-semibold text-center block hover:bg-amber-600 transition mt-3"
              >
                📲 Request Callback
              </button>

              <a
                href={pg.mapUrl}
                target="_blank"
                className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-3 rounded-xl font-semibold text-center block hover:bg-gray-50 dark:hover:bg-gray-700 transition mt-3"
              >
                📍 View on Map
              </a>

              {/* Safety Badge */}
              <div className="mt-6 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="font-semibold text-emerald-700 dark:text-emerald-400 text-sm">PG Finder Verified</span>
                </div>
                <p className="text-xs text-emerald-600 dark:text-emerald-500">This listing has been verified by our team. Photos, amenities, and pricing are accurate.</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Callback Modal */}
      {showCallback && <CallbackModal pgId={pg.id} pgName={pg.name} onClose={() => setShowCallback(false)} />}
    </>
  );
}
