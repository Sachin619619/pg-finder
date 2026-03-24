"use client";

import { useState, useEffect, useMemo } from "react";
import Header from "@/components/Header";
import Link from "next/link";
import AnimatedBanner from "@/components/AnimatedBanner";
import { fetchRoommateProfiles, fetchAreas, addRoommateProfile } from "@/lib/db";
import type { RoommateProfile } from "@/lib/db";

function sanitize(str: string, maxLen: number): string {
  return str.replace(/[<>&"'/]/g, "").trim().slice(0, maxLen);
}

const gradients = [
  "bg-[#1B1C15]",
  "from-blue-400 to-indigo-500",
  "from-pink-400 to-rose-500",
  "from-emerald-400 to-teal-500",
  "from-amber-400 to-orange-500",
  "from-cyan-400 to-blue-500",
];

export default function RoommateFinder() {
  const [profiles, setProfiles] = useState<RoommateProfile[]>([]);
  const [areas, setAreas] = useState<string[]>([]);
  const [genderFilter, setGenderFilter] = useState("");
  const [areaFilter, setAreaFilter] = useState("");
  const [budgetMax, setBudgetMax] = useState(50000);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Form state
  const [formName, setFormName] = useState("");
  const [formAge, setFormAge] = useState("");
  const [formGender, setFormGender] = useState("");
  const [formOccupation, setFormOccupation] = useState("");
  const [formArea, setFormArea] = useState("");
  const [formBudget, setFormBudget] = useState("");
  const [formLifestyle, setFormLifestyle] = useState("");
  const [formBio, setFormBio] = useState("");

  useEffect(() => { document.title = "Find Roommates in Bangalore | Castle"; }, []);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const budget = Number(formBudget);
    const safeName = sanitize(formName, 100);
    const safeOccupation = sanitize(formOccupation, 100);
    const safeLifestyle = sanitize(formLifestyle, 50);
    const safeBio = sanitize(formBio, 500);

    if (!safeName || !safeOccupation || !safeBio) {
      setSubmitting(false);
      return;
    }

    const success = await addRoommateProfile({
      name: safeName,
      age: Number(formAge),
      gender: formGender,
      occupation: safeOccupation,
      area: formArea,
      budgetMin: Math.round(budget * 0.7),
      budgetMax: budget,
      moveInDate: new Date().toISOString().split("T")[0],
      lifestyle: safeLifestyle,
      bio: safeBio,
      avatar: safeName.charAt(0).toUpperCase(),
      gradient: gradients[Math.floor(Math.random() * gradients.length)],
    });
    if (success) {
      setSubmitted(true);
      setShowForm(false);
      // Refresh profiles
      fetchRoommateProfiles().then(setProfiles);
    }
    setSubmitting(false);
  };

  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16 animate-fade-in-up">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm text-gray-500 flex items-center gap-2">
          <Link href="/" className="hover:text-[#1B1C15] transition-colors">Home</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">Find Roommates</span>
        </nav>

        {/* Hero */}
        <div className="text-center mb-12">
          <span className="pill bg-pink-50 text-pink-600 !text-xs font-semibold mb-4 inline-block">Find Your Perfect Match</span>
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
            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input required placeholder="Your Name" value={formName} onChange={(e) => setFormName(e.target.value)} className="premium-input text-sm" />
              <input required type="number" min="18" max="60" placeholder="Age" value={formAge} onChange={(e) => setFormAge(e.target.value)} className="premium-input text-sm" />
              <select required value={formGender} onChange={(e) => setFormGender(e.target.value)} className="premium-input text-sm">
                <option value="">Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
              <input required placeholder="Profession" value={formOccupation} onChange={(e) => setFormOccupation(e.target.value)} className="premium-input text-sm" />
              <select required value={formArea} onChange={(e) => setFormArea(e.target.value)} className="premium-input text-sm">
                <option value="">Preferred Area</option>
                {areas.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
              <input required type="number" placeholder="Max Budget (₹)" value={formBudget} onChange={(e) => setFormBudget(e.target.value)} className="premium-input text-sm" />
              <input placeholder="Interests (comma separated)" value={formLifestyle} onChange={(e) => setFormLifestyle(e.target.value)} className="premium-input text-sm sm:col-span-2" />
              <textarea required rows={3} maxLength={500} placeholder="Tell potential roommates about yourself... (max 500 chars)" value={formBio} onChange={(e) => setFormBio(e.target.value)} className="premium-input text-sm sm:col-span-2 resize-none" />
              <div className="sm:col-span-2 flex gap-3">
                <button type="submit" disabled={submitting} className="btn-premium !py-2.5 !px-8 !text-sm disabled:opacity-50">
                  {submitting ? "Posting..." : "Post Profile"}
                </button>
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
                    <span key={i} className="pill bg-[#F4EDD9] text-[#1B1C15] !text-[10px] !py-0.5 !px-2.5">{i}</span>
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
              <a
                href={`https://wa.me/?text=${encodeURIComponent(`Hi ${p.name}! I found your roommate profile on Castle. I'm interested in sharing a PG in ${p.area}. Let's connect!`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full btn-premium !py-2.5 !text-sm !rounded-xl block text-center"
              >
                Connect via WhatsApp
              </a>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-24">
            <div className="w-28 h-28 bg-pink-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-14 h-14 text-pink-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No roommates found</h3>
            <p className="text-gray-400 mb-2">No one matches your current filters yet.</p>
            <p className="text-gray-300 text-sm mb-8">Try adjusting your filters or be the first to post a profile!</p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => { setGenderFilter(""); setAreaFilter(""); setBudgetMax(50000); }}
                className="px-6 py-3 rounded-2xl text-sm font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all"
              >
                Clear Filters
              </button>
              <button
                onClick={() => setShowForm(true)}
                className="btn-premium !py-3 !px-6 !text-sm"
              >
                Post Your Profile
              </button>
            </div>
          </div>
        )}
        <AnimatedBanner seed={20} />
      </main>
    </>
  );
}
