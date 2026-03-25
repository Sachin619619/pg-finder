"use client";

import { useState } from "react";
import { submitPriceAlert, fetchAreas } from "@/lib/db";
import { useEffect } from "react";

export default function PriceAlertBanner() {
  const [email, setEmail] = useState("");
  const [area, setArea] = useState("");
  const [maxPrice, setMaxPrice] = useState(10000);
  const [subscribed, setSubscribed] = useState(false);
  const [areas, setAreas] = useState<string[]>([]);

  useEffect(() => {
    fetchAreas().then(setAreas);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitPriceAlert(email, area, maxPrice).then(() => setSubscribed(true));
  };

  if (subscribed) {
    return (
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-3xl p-8 text-center text-white">
            <svg className="w-12 h-12 mx-auto mb-3 opacity-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-xl font-bold mb-1">You&apos;re all set! 🔔</h3>
            <p className="text-white/80 text-sm">We&apos;ll notify you when PGs matching your budget drop in price.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-gradient-to-r from-[#1B5E3B] to-[#2d8a5e] text-white rounded-2xl p-6 sm:p-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-6 h-6 text-amber-300" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
              </svg>
              <h3 className="text-xl font-bold text-white">Price Drop Alerts</h3>
            </div>
            <p className="text-white/60 text-sm mb-6 max-w-lg">Get notified when PG prices drop in your preferred area. Never miss a deal!</p>
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
              <input
                required
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 px-4 py-3 rounded-full bg-white/20 border-0 text-white placeholder-white/50 outline-none focus:bg-white/25 text-sm"
              />
              <select
                value={area}
                onChange={(e) => setArea(e.target.value)}
                className="px-4 py-3 rounded-full bg-white/20 border-0 text-white outline-none text-sm"
              >
                <option value="" className="text-gray-900">All Areas</option>
                {areas.map((a) => (
                  <option key={a} value={a} className="text-gray-900">{a}</option>
                ))}
              </select>
              <select
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="px-4 py-3 rounded-full bg-white/20 border-0 text-white outline-none text-sm"
              >
                <option value={7000} className="text-gray-900">Under ₹7,000</option>
                <option value={10000} className="text-gray-900">Under ₹10,000</option>
                <option value={12000} className="text-gray-900">Under ₹12,000</option>
                <option value={15000} className="text-gray-900">Under ₹15,000</option>
              </select>
              <button type="submit" className="px-8 py-3 bg-white text-[#1B5E3B] rounded-full font-semibold text-sm hover:bg-white/90 transition whitespace-nowrap">
                Alert Me
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
