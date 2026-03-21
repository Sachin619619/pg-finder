"use client";

import { useState, useEffect, useMemo } from "react";
import Header from "@/components/Header";
import { fetchRoommateProfiles, fetchAreas } from "@/lib/db";
import type { RoommateProfile } from "@/lib/db";

export default function RoommateFinder() {
  const [profiles, setProfiles] = useState<RoommateProfile[]>([]);
  const [areas, setAreas] = useState<string[]>([]);
  const [genderFilter, setGenderFilter] = useState("");
  const [areaFilter, setAreaFilter] = useState("");
  const [budgetMax, setBudgetMax] = useState(50000);
  const [showForm, setShowForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetchRoommateProfiles().then(setProfiles);
    fetchAreas().then(setAreas);
  }, []);

  const filtered = useMemo(() => profiles.filter((p) => {
    if (genderFilter && p.gender !== genderFilter) return false;
    if (areaFilter && p.area !== areaFilter) return false;
    if (p.budgetMax > budgetMax) return false;
    return true;
  }), [profiles, genderFilter, areaFilter, budgetMax]);

  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
        {/* Hero */}
        <div className="text-center mb-12">
          <span className="pill bg-pink-50 text-pink-600 !text-xs font-semibold mb-4 inline-block">Find Your Perfect Match 🤝</span>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Roommate <span className="gradient-text">Finder</span>
          </h1>
          <p className="text-gray-400 max-w-lg mx-auto">Connect with compatible roommates in Bangalore. Match by area, budget, and lifestyle.</p>
        </div>

        {/* Filters */}
        <div className="premium-card !rounded-2xl p-5 mb-8 flex flex-wrap items-center gap-4">
          <select className="premium-input text-sm" value={genderFilter} onChange={(e) => setGenderFilter(e.target.value)}>
            <option value="">All Genders</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
          <select className="premium-input text-sm" value={areaFilter} onChange={(e) => setAreaFilter(e.target.value)}>
            <option value="">All Areas</option>
            {areas.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
          <select className="premium-input text-sm" value={budgetMax} onChange={(e) => setBudgetMax(Number(e.target.value))}>
            <option value={50000}>Any Budget</option>
            <option value={8000}>Under ₹8,000</option>
            <option value={10000}>Under ₹10,000</option>
            <option value={12000}>Under ₹12,000</option>
            <option value={15000}>Under ₹15,000</option>
          </select>
          <div className="ml-auto">
            <button onClick={() => setShowForm(!showForm)} className="btn-premium !py-2.5 !px-6 !text-sm">
              {showForm ? "Close" : "Post Your Profile"}
            </button>
          </div>
        </div>

        {/* Post Profile Form */}
        {showForm && !submitted && (
          <div className="premium-card !rounded-2xl p-6 sm:p-8 mb-8 animate-slide-up">
            <h3 className="text-lg font-bold text-gray-900 mb-5">Create Your Roommate Profile</h3>
            <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true); setShowForm(false); }} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input required placeholder="Your Name" className="premium-input text-sm" />
              <input required type="number" placeholder="Age" className="premium-input text-sm" />
              <select required className="premium-input text-sm">
                <option value="">Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
              <input required placeholder="Profession" className="premium-input text-sm" />
              <select required className="premium-input text-sm">
                <option value="">Preferred Area</option>
                {areas.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
              <input required type="number" placeholder="Max Budget (₹)" className="premium-input text-sm" />
              <input placeholder="Interests (comma separated)" className="premium-input text-sm sm:col-span-2" />
              <textarea required rows={3} placeholder="Tell potential roommates about yourself..." className="premium-input text-sm sm:col-span-2 resize-none" />
              <div className="sm:col-span-2 flex gap-3">
                <button type="submit" className="btn-premium !py-2.5 !px-8 !text-sm">Post Profile</button>
                <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2.5 text-sm text-gray-500 hover:text-gray-700">Cancel</button>
              </div>
            </form>
          </div>
        )}

        {submitted && (
          <div className="bg-emerald-50 rounded-2xl p-5 mb-8 text-emerald-700 text-sm font-medium animate-slide-up flex items-center gap-3">
            <svg className="w-6 h-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Your roommate profile has been posted! Others can now see your profile and reach out.
          </div>
        )}

        {/* Profiles Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 stagger-children">
          {filtered.map((p) => (
            <div key={p.id} className="premium-card !rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold bg-gradient-to-br ${p.gradient || (p.gender === "male" ? "from-blue-400 to-indigo-500" : "from-pink-400 to-rose-500")}`}>
                  {p.avatar}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">{p.name}, {p.age}</h3>
                  <p className="text-xs text-gray-400">{p.occupation}</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-4 leading-relaxed">{p.bio}</p>
              {p.lifestyle && (
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {p.lifestyle.split(", ").map((i) => (
                    <span key={i} className="pill bg-violet-50 text-violet-600 !text-[10px] !py-0.5 !px-2.5">{i}</span>
                  ))}
                </div>
              )}
              <div className="flex items-center justify-between text-xs text-gray-400 mb-4 pt-3 border-t border-gray-100">
                <span className="flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  {p.area}
                </span>
                <span className="font-semibold text-emerald-600">₹{p.budgetMin.toLocaleString()} - ₹{p.budgetMax.toLocaleString()}/mo</span>
              </div>
              <button className="w-full btn-premium !py-2.5 !text-sm !rounded-xl">Connect</button>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-400 text-lg">No roommates found matching your criteria 😕</p>
            <p className="text-gray-300 text-sm mt-2">Try adjusting your filters</p>
          </div>
        )}
      </main>
    </>
  );
}
