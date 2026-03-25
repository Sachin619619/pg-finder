"use client";

import { useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";

const steps = [
  {
    step: "01",
    title: "List Your PG",
    description: "Fill in details about your PG - location, rooms, amenities, and pricing.",
    icon: "📝",
  },
  {
    step: "02",
    title: "Get Verified",
    description: "Our team reviews your listing and verifies the details within 24 hours.",
    icon: "✅",
  },
  {
    step: "03",
    title: "Start Receiving Inquiries",
    description: "Once approved, tenants can find and contact you directly. No brokerage!",
    icon: "📱",
  },
];

const benefits = [
  { emoji: "💰", title: "Zero Brokerage", desc: "Connect directly with tenants. No middlemen, no commission." },
  { emoji: "📊", title: "Analytics Dashboard", desc: "Track views, inquiries, and booking rates in real-time." },
  { emoji: "🔔", title: "Instant Notifications", desc: "Get notified immediately when someone is interested." },
  { emoji: "⭐", title: "Build Your Reputation", desc: "Collect reviews and build trust with potential tenants." },
  { emoji: "📸", title: "Professional Photos", desc: "Upload unlimited photos. Good photos = more inquiries." },
  { emoji: "🎯", title: "Smart Matching", desc: "Our AI recommends your PG to the most relevant tenants." },
];

export default function ListYourPGPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    ownerName: "",
    phone: "",
    email: "",
    area: "",
    locality: "",
    address: "",
    type: "",
    rooms: "",
    price: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    // Simulate form submission
    setSubmitted(true);
    await new Promise(r => setTimeout(r, 1500));
  };

  if (submitted) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
          <div className="max-w-md w-full text-center py-20">
            <div className="text-7xl mb-6">🎉</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">Thank You!</h1>
            <p className="text-gray-600 mb-6">
              We&apos;ve received your listing request. Our team will verify your PG and get back to you within 24 hours.
            </p>
            <p className="text-sm text-gray-500 mb-8">
              📞 If you have questions, call us at <strong>+91 98765 43210</strong>
            </p>
            <Link href="/" className="px-6 py-3 bg-[#1a1a1a] text-white rounded-xl font-semibold inline-block">
              Back to Home
            </Link>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#FFFAEC]">
        {/* Hero */}
        <section className="bg-[#1a1a1a] text-white py-20 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="text-5xl mb-4">🏠</div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">List Your PG on Castle</h1>
            <p className="text-white/60 mb-6 max-w-lg mx-auto">
              Join 500+ PG owners who trust Castle Living to connect them with quality tenants in Bangalore.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <span className="flex items-center gap-1.5 text-emerald-400"><span>✓</span> Free to list</span>
              <span className="flex items-center gap-1.5 text-emerald-400"><span>✓</span> No commission</span>
              <span className="flex items-center gap-1.5 text-emerald-400"><span>✓</span> Verified leads</span>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {steps.map(s => (
                <div key={s.step} className="bg-white rounded-2xl border border-gray-100 p-6 text-center">
                  <div className="text-4xl mb-3">{s.icon}</div>
                  <span className="text-xs font-bold text-[#1a1a1a] bg-[#FFFAEC] px-2 py-0.5 rounded-full">{s.step}</span>
                  <h3 className="font-semibold text-gray-900 mt-3 mb-2">{s.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{s.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-16 px-4 bg-white">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">Why List on Castle?</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {benefits.map(b => (
                <div key={b.title} className="bg-[#FFFAEC] rounded-2xl p-5">
                  <div className="text-2xl mb-2">{b.emoji}</div>
                  <h3 className="font-semibold text-gray-900 text-sm mb-1">{b.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{b.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Lead form */}
        <section className="py-16 px-4">
          <div className="max-w-xl mx-auto">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="bg-[#1a1a1a] text-white px-6 py-5">
                <h2 className="text-lg font-bold">Get Started — Tell Us About Your PG</h2>
                <p className="text-white/60 text-sm mt-1">Fill this form and we&apos;ll reach out within 24 hours</p>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">PG Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Sunrise PG for Men"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#1a1a1a] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Your Name *</label>
                    <input
                      type="text"
                      value={formData.ownerName}
                      onChange={e => setFormData({ ...formData, ownerName: e.target.value })}
                      placeholder="Rajesh Kumar"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#1a1a1a] transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Phone *</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#1a1a1a] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Email *</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      placeholder="rajesh@example.com"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#1a1a1a] transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Area *</label>
                    <select
                      value={formData.area}
                      onChange={e => setFormData({ ...formData, area: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#1a1a1a] transition-colors"
                    >
                      <option value="">Select area</option>
                      {["Kalyan Nagar", "Bellandur", "HSR Layout", "Koramangala", "Indiranagar", "Whitefield", "Marathahalli", "BTM Layout", "Electronic City", "JP Nagar", "Jayanagar", "Hebbal"].map(a => (
                        <option key={a} value={a}>{a}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">PG Type *</label>
                    <select
                      value={formData.type}
                      onChange={e => setFormData({ ...formData, type: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#1a1a1a] transition-colors"
                    >
                      <option value="">Select type</option>
                      <option value="boys">Boys Only</option>
                      <option value="girls">Girls Only</option>
                      <option value="co-living">Co-Living / Unisex</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Locality / Address *</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Near Wipro Park, Outer Ring Road"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#1a1a1a] transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Starting Price (₹/month)</label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={e => setFormData({ ...formData, price: e.target.value })}
                      placeholder="8000"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#1a1a1a] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Number of Rooms</label>
                    <input
                      type="number"
                      value={formData.rooms}
                      onChange={e => setFormData({ ...formData, rooms: e.target.value })}
                      placeholder="10"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#1a1a1a] transition-colors"
                    />
                  </div>
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={!formData.name || !formData.phone || !formData.ownerName || !formData.area}
                  className="w-full py-4 bg-[#1a1a1a] text-white rounded-xl font-semibold text-sm hover:bg-[#333333] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Submit Listing Request →
                </button>

                <p className="text-xs text-gray-400 text-center">
                  By submitting, you agree to our Terms of Service. We respect your privacy — no spam calls.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
