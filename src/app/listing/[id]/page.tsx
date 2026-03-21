"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { listings } from "@/data/listings";
import Header from "@/components/Header";

export default function ListingPage() {
  const { id } = useParams();
  const pg = listings.find((l) => l.id === id);

  if (!pg) {
    return (
      <>
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">PG Not Found</h1>
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm text-gray-500 flex items-center gap-2">
          <Link href="/" className="hover:text-violet-600">Home</Link>
          <span>/</span>
          <Link href={`/?area=${pg.area}`} className="hover:text-violet-600">{pg.area}</Link>
          <span>/</span>
          <span className="text-gray-900">{pg.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero image */}
            <div className="h-72 sm:h-96 bg-gradient-to-br from-violet-100 to-indigo-100 rounded-2xl flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 bg-white/80 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <svg className="w-10 h-10 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
                <p className="text-violet-600 font-medium">{pg.name}</p>
              </div>
            </div>

            {/* Title & Rating */}
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{pg.name}</h1>
                  <p className="text-gray-500 mt-1 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {pg.locality}, {pg.area}
                  </p>
                </div>
                <div className="flex items-center gap-1 bg-yellow-50 px-3 py-2 rounded-xl">
                  <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="text-lg font-bold text-gray-900">{pg.rating}</span>
                  <span className="text-sm text-gray-500">({pg.reviews} reviews)</span>
                </div>
              </div>
            </div>

            {/* Quick Info Badges */}
            <div className="flex flex-wrap gap-3">
              <span className="px-4 py-2 bg-violet-50 text-violet-700 rounded-xl font-medium">{typeLabels[pg.type]}</span>
              <span className={`px-4 py-2 rounded-xl font-medium ${pg.gender === "male" ? "bg-blue-50 text-blue-700" : pg.gender === "female" ? "bg-pink-50 text-pink-700" : "bg-purple-50 text-purple-700"}`}>
                {genderLabels[pg.gender]}
              </span>
              {pg.furnished && <span className="px-4 py-2 bg-green-50 text-green-700 rounded-xl font-medium">Fully Furnished</span>}
              {pg.foodIncluded && <span className="px-4 py-2 bg-orange-50 text-orange-700 rounded-xl font-medium">Food Included</span>}
              {pg.acAvailable && <span className="px-4 py-2 bg-blue-50 text-blue-700 rounded-xl font-medium">AC Available</span>}
            </div>

            {/* Description */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">About this PG</h2>
              <p className="text-gray-600 leading-relaxed">{pg.description}</p>
            </div>

            {/* Amenities */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Amenities</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {pg.amenities.map((a) => (
                  <div key={a} className="flex items-center gap-2 text-gray-700">
                    <svg className="w-5 h-5 text-green-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {a}
                  </div>
                ))}
              </div>
            </div>

            {/* Nearby Landmarks */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Nearby Landmarks</h2>
              <div className="flex flex-wrap gap-2">
                {pg.nearbyLandmarks.map((l) => (
                  <span key={l} className="px-3 py-1.5 bg-gray-100 rounded-lg text-sm text-gray-700">{l}</span>
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
          </div>

          {/* Right Column — Contact & Price */}
          <div className="space-y-6">
            {/* Price Card */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 sticky top-24">
              <div className="text-center mb-6">
                <p className="text-sm text-gray-500 mb-1">Monthly Rent</p>
                <p className="text-4xl font-bold text-gray-900">₹{pg.price.toLocaleString()}</p>
                <p className="text-sm text-gray-400 mt-1">per month / per person</p>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Available From</span>
                  <span className="font-medium text-gray-900">
                    {new Date(pg.availableFrom).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Room Type</span>
                  <span className="font-medium text-gray-900">{typeLabels[pg.type]}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Food</span>
                  <span className="font-medium text-gray-900">{pg.foodIncluded ? "Included" : "Not Included"}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-500">WiFi</span>
                  <span className="font-medium text-gray-900">{pg.wifiIncluded ? "Included" : "Not Included"}</span>
                </div>
              </div>

              {/* Contact */}
              <div className="bg-violet-50 rounded-xl p-4 mb-4">
                <p className="text-sm font-medium text-violet-700 mb-1">Contact Person</p>
                <p className="font-semibold text-gray-900">{pg.contactName}</p>
              </div>

              <a
                href={`tel:${pg.contactPhone}`}
                className="w-full bg-violet-600 text-white py-3 rounded-xl font-semibold text-center block hover:bg-violet-700 transition"
              >
                Call {pg.contactPhone}
              </a>

              <a
                href={`https://wa.me/91${pg.contactPhone}?text=Hi, I found your PG "${pg.name}" on PG Finder. I'm interested in a ${pg.type} room. Is it available?`}
                target="_blank"
                className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold text-center block hover:bg-green-700 transition mt-3"
              >
                WhatsApp
              </a>

              <a
                href={pg.mapUrl}
                target="_blank"
                className="w-full bg-white border border-gray-300 text-gray-700 py-3 rounded-xl font-semibold text-center block hover:bg-gray-50 transition mt-3"
              >
                View on Map
              </a>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
