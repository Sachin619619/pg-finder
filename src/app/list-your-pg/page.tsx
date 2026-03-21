"use client";

import { useState } from "react";
import Header from "@/components/Header";
import { areas, amenities } from "@/data/listings";

export default function ListYourPG() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: "",
    area: "",
    locality: "",
    price: "",
    type: "double",
    gender: "male",
    contactName: "",
    contactPhone: "",
    description: "",
    amenities: [] as string[],
    foodIncluded: false,
    acAvailable: false,
    furnished: true,
  });

  const update = (partial: Partial<typeof form>) => setForm({ ...form, ...partial });

  const toggleAmenity = (a: string) => {
    const next = form.amenities.includes(a)
      ? form.amenities.filter((x) => x !== a)
      : [...form.amenities, a];
    update({ amenities: next });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <>
        <Header />
        <main className="max-w-2xl mx-auto px-4 py-20 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">PG Listed Successfully!</h1>
          <p className="text-gray-600 mb-2">Your PG <span className="font-semibold">&quot;{form.name}&quot;</span> has been submitted for review.</p>
          <p className="text-gray-500 mb-8">Our team will verify the details and publish it within 24 hours.</p>
          <div className="bg-violet-50 rounded-xl p-6 mb-8">
            <h3 className="font-semibold text-violet-700 mb-2">Premium Listing Benefits</h3>
            <ul className="text-sm text-violet-600 space-y-1">
              <li>Featured at the top of search results</li>
              <li>Highlighted badge on listing card</li>
              <li>Priority in area-based searches</li>
              <li>Analytics dashboard for views & inquiries</li>
            </ul>
            <button className="mt-4 bg-violet-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-violet-700 transition">
              Upgrade to Premium — ₹999/mo
            </button>
          </div>
          <a href="/" className="text-violet-600 font-medium hover:underline">Back to Home</a>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Pricing Banner */}
        <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl p-6 mb-8 text-white">
          <h2 className="text-2xl font-bold mb-2">List Your PG on Bangalore&apos;s #1 PG Finder</h2>
          <p className="text-violet-100 mb-4">Reach thousands of tenants searching for PGs every day.</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white/15 rounded-xl p-4 backdrop-blur-sm">
              <p className="text-2xl font-bold">Free</p>
              <p className="text-sm text-violet-200">Basic Listing</p>
              <ul className="text-xs text-violet-100 mt-2 space-y-1">
                <li>Standard placement</li>
                <li>Contact details shown</li>
                <li>Basic analytics</li>
              </ul>
            </div>
            <div className="bg-white/25 rounded-xl p-4 backdrop-blur-sm border border-white/30">
              <p className="text-2xl font-bold">₹499<span className="text-sm font-normal">/mo</span></p>
              <p className="text-sm text-violet-200">Premium Listing</p>
              <ul className="text-xs text-violet-100 mt-2 space-y-1">
                <li>Featured placement</li>
                <li>Highlighted badge</li>
                <li>Priority support</li>
              </ul>
            </div>
            <div className="bg-white/15 rounded-xl p-4 backdrop-blur-sm">
              <p className="text-2xl font-bold">₹999<span className="text-sm font-normal">/mo</span></p>
              <p className="text-sm text-violet-200">Pro Listing</p>
              <ul className="text-xs text-violet-100 mt-2 space-y-1">
                <li>Top of all searches</li>
                <li>Photo gallery (10 pics)</li>
                <li>Full analytics dashboard</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">List Your PG</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* PG Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">PG Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">PG Name *</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g., GreenNest PG for Men"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500 outline-none"
                    value={form.name}
                    onChange={(e) => update({ name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Area *</label>
                  <select
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500 outline-none bg-white"
                    value={form.area}
                    onChange={(e) => update({ area: e.target.value })}
                  >
                    <option value="">Select Area</option>
                    {areas.map((a) => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Locality / Address *</label>
                <input
                  required
                  type="text"
                  placeholder="e.g., 1st Block, HRBR Layout"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500 outline-none"
                  value={form.locality}
                  onChange={(e) => update({ locality: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Rent (₹) *</label>
                  <input
                    required
                    type="number"
                    placeholder="8500"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500 outline-none"
                    value={form.price}
                    onChange={(e) => update({ price: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Room Type</label>
                  <select
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500 outline-none bg-white"
                    value={form.type}
                    onChange={(e) => update({ type: e.target.value })}
                  >
                    <option value="single">Single</option>
                    <option value="double">Double Sharing</option>
                    <option value="triple">Triple Sharing</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                  <select
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500 outline-none bg-white"
                    value={form.gender}
                    onChange={(e) => update({ gender: e.target.value })}
                  >
                    <option value="male">Male Only</option>
                    <option value="female">Female Only</option>
                    <option value="coed">Co-ed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  rows={4}
                  placeholder="Describe your PG — location benefits, nearby landmarks, food quality, etc."
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500 outline-none resize-none"
                  value={form.description}
                  onChange={(e) => update({ description: e.target.value })}
                />
              </div>
            </div>

            {/* Amenities */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Amenities</h3>
              <div className="flex flex-wrap gap-2">
                {amenities.map((a) => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => toggleAmenity(a)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
                      form.amenities.includes(a)
                        ? "bg-violet-600 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {a}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-violet-600 rounded"
                    checked={form.foodIncluded}
                    onChange={(e) => update({ foodIncluded: e.target.checked })}
                  />
                  <span className="text-sm text-gray-700">Food Included</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-violet-600 rounded"
                    checked={form.acAvailable}
                    onChange={(e) => update({ acAvailable: e.target.checked })}
                  />
                  <span className="text-sm text-gray-700">AC Available</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-violet-600 rounded"
                    checked={form.furnished}
                    onChange={(e) => update({ furnished: e.target.checked })}
                  />
                  <span className="text-sm text-gray-700">Furnished</span>
                </label>
              </div>
            </div>

            {/* Contact */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Contact Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person *</label>
                  <input
                    required
                    type="text"
                    placeholder="Your name"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500 outline-none"
                    value={form.contactName}
                    onChange={(e) => update({ contactName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                  <input
                    required
                    type="tel"
                    placeholder="9876543210"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500 outline-none"
                    value={form.contactPhone}
                    onChange={(e) => update({ contactPhone: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-violet-600 text-white py-3 rounded-xl font-semibold text-lg hover:bg-violet-700 transition"
            >
              Submit PG Listing (Free)
            </button>
            <p className="text-center text-sm text-gray-500">
              Your listing will be reviewed and published within 24 hours.
            </p>
          </form>
        </div>
      </main>
    </>
  );
}
