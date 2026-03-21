"use client";

import { useState } from "react";
import Header from "@/components/Header";

const mockListings = [
  { id: 1, name: "GreenNest PG for Men", area: "Kalyan Nagar", views: 1247, inquiries: 34, occupancy: 85, status: "active" },
  { id: 2, name: "CozyStay Premium PG", area: "Koramangala", views: 2891, inquiries: 89, occupancy: 95, status: "active" },
];

const mockInquiries = [
  { id: 1, name: "Rahul Kumar", phone: "98765xxxxx", pg: "GreenNest PG", time: "2 hours ago", status: "new" },
  { id: 2, name: "Sneha M.", phone: "87654xxxxx", pg: "CozyStay Premium", time: "5 hours ago", status: "new" },
  { id: 3, name: "Amit V.", phone: "76543xxxxx", pg: "GreenNest PG", time: "1 day ago", status: "contacted" },
  { id: 4, name: "Priya D.", phone: "65432xxxxx", pg: "CozyStay Premium", time: "2 days ago", status: "contacted" },
  { id: 5, name: "Karthik N.", phone: "54321xxxxx", pg: "CozyStay Premium", time: "3 days ago", status: "converted" },
];

export default function OwnerDashboard() {
  const [activeTab, setActiveTab] = useState<"overview" | "listings" | "inquiries" | "analytics">("overview");

  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Owner Dashboard 🏠</h1>
            <p className="text-gray-400 mt-1">Manage your PG listings and track performance</p>
          </div>
          <button className="btn-premium !text-sm">+ Add New PG</button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-2xl p-1 mb-8 w-fit">
          {(["overview", "listings", "inquiries", "analytics"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all capitalize ${
                activeTab === tab ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Overview */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
              {[
                { label: "Total Views", value: "4,138", change: "+12%", icon: "M15 12a3 3 0 11-6 0 3 3 0 016 0z", color: "violet" },
                { label: "Inquiries", value: "123", change: "+8%", icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z", color: "blue" },
                { label: "Occupancy", value: "90%", change: "+5%", icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4", color: "emerald" },
                { label: "Revenue", value: "₹2.4L", change: "+15%", icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z", color: "amber" },
              ].map((stat) => (
                <div key={stat.label} className="premium-card !rounded-2xl p-5">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 bg-${stat.color}-50`}>
                    <svg className={`w-5 h-5 text-${stat.color}-500`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={stat.icon} />
                    </svg>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-gray-400">{stat.label}</p>
                    <span className="text-xs font-medium text-emerald-500">{stat.change}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Recent Inquiries */}
            <div className="premium-card !rounded-2xl p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Inquiries 📩</h2>
              <div className="space-y-3">
                {mockInquiries.slice(0, 3).map((inq) => (
                  <div key={inq.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-violet-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {inq.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{inq.name}</p>
                        <p className="text-xs text-gray-400">{inq.pg} · {inq.time}</p>
                      </div>
                    </div>
                    <span className={`pill !text-[10px] !py-1 ${
                      inq.status === "new" ? "bg-blue-50 text-blue-600" :
                      inq.status === "contacted" ? "bg-amber-50 text-amber-600" :
                      "bg-emerald-50 text-emerald-600"
                    }`}>
                      {inq.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Performance Chart (visual bars) */}
            <div className="premium-card !rounded-2xl p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Views This Week 📊</h2>
              <div className="flex items-end gap-3 h-40">
                {[65, 45, 80, 55, 90, 70, 85].map((val, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2">
                    <div
                      className="w-full bg-gradient-to-t from-violet-500 to-fuchsia-400 rounded-t-lg transition-all hover:opacity-80"
                      style={{ height: `${val}%` }}
                    />
                    <span className="text-[10px] text-gray-400">
                      {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Listings Tab */}
        {activeTab === "listings" && (
          <div className="space-y-5">
            {mockListings.map((listing) => (
              <div key={listing.id} className="premium-card !rounded-2xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">{listing.name}</h3>
                    <p className="text-sm text-gray-400">{listing.area}</p>
                  </div>
                  <span className="pill bg-emerald-50 text-emerald-600 !text-xs">Active</span>
                </div>
                <div className="grid grid-cols-3 gap-4 mt-5">
                  <div className="text-center p-3 bg-gray-50 rounded-xl">
                    <p className="text-xl font-bold text-gray-900">{listing.views.toLocaleString()}</p>
                    <p className="text-xs text-gray-400">Views</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-xl">
                    <p className="text-xl font-bold text-gray-900">{listing.inquiries}</p>
                    <p className="text-xs text-gray-400">Inquiries</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-xl">
                    <p className="text-xl font-bold text-gray-900">{listing.occupancy}%</p>
                    <p className="text-xs text-gray-400">Occupancy</p>
                  </div>
                </div>
                <div className="flex gap-3 mt-5">
                  <button className="btn-premium !py-2 !px-5 !text-sm">Edit Listing</button>
                  <button className="px-5 py-2 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 rounded-xl">Boost 🚀</button>
                  <button className="px-5 py-2 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 rounded-xl">Analytics</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Inquiries Tab */}
        {activeTab === "inquiries" && (
          <div className="premium-card !rounded-2xl overflow-hidden">
            <div className="p-5 border-b border-gray-100">
              <h2 className="font-bold text-gray-900">All Inquiries ({mockInquiries.length})</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {mockInquiries.map((inq) => (
                <div key={inq.id} className="p-5 flex items-center justify-between hover:bg-gray-50 transition">
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 bg-gradient-to-br from-violet-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {inq.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{inq.name}</p>
                      <p className="text-sm text-gray-400">{inq.phone} · {inq.pg}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400">{inq.time}</span>
                    <span className={`pill !text-[10px] !py-1 ${
                      inq.status === "new" ? "bg-blue-50 text-blue-600" :
                      inq.status === "contacted" ? "bg-amber-50 text-amber-600" :
                      "bg-emerald-50 text-emerald-600"
                    }`}>
                      {inq.status}
                    </span>
                    <button className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-100">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === "analytics" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="premium-card !rounded-2xl p-6">
              <h3 className="font-bold text-gray-900 mb-4">Traffic Sources</h3>
              <div className="space-y-4">
                {[
                  { source: "Google Search", pct: 45, color: "bg-blue-500" },
                  { source: "Direct", pct: 25, color: "bg-violet-500" },
                  { source: "Social Media", pct: 18, color: "bg-pink-500" },
                  { source: "Referral", pct: 12, color: "bg-amber-500" },
                ].map((s) => (
                  <div key={s.source}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">{s.source}</span>
                      <span className="font-medium text-gray-900">{s.pct}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full">
                      <div className={`h-full rounded-full ${s.color}`} style={{ width: `${s.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="premium-card !rounded-2xl p-6">
              <h3 className="font-bold text-gray-900 mb-4">Conversion Funnel</h3>
              <div className="space-y-4">
                {[
                  { step: "Page Views", value: 4138, pct: 100 },
                  { step: "Phone Revealed", value: 856, pct: 21 },
                  { step: "WhatsApp Click", value: 423, pct: 10 },
                  { step: "Callback Request", value: 123, pct: 3 },
                  { step: "Moved In", value: 47, pct: 1.1 },
                ].map((s) => (
                  <div key={s.step} className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">{s.step}</span>
                        <span className="font-medium text-gray-900">{s.value.toLocaleString()}</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full">
                        <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500" style={{ width: `${s.pct}%` }} />
                      </div>
                    </div>
                    <span className="text-xs text-gray-400 w-10 text-right">{s.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="premium-card !rounded-2xl p-6 lg:col-span-2">
              <h3 className="font-bold text-gray-900 mb-4">Monthly Revenue Trend 💰</h3>
              <div className="flex items-end gap-4 h-48">
                {[
                  { month: "Oct", value: 180000 },
                  { month: "Nov", value: 195000 },
                  { month: "Dec", value: 170000 },
                  { month: "Jan", value: 210000 },
                  { month: "Feb", value: 225000 },
                  { month: "Mar", value: 240000 },
                ].map((m) => (
                  <div key={m.month} className="flex-1 flex flex-col items-center gap-2">
                    <span className="text-xs font-medium text-gray-900">₹{(m.value / 1000).toFixed(0)}K</span>
                    <div
                      className="w-full bg-gradient-to-t from-emerald-500 to-teal-400 rounded-t-lg"
                      style={{ height: `${(m.value / 240000) * 100}%` }}
                    />
                    <span className="text-[10px] text-gray-400">{m.month}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
