"use client";

import Link from "next/link";

const ownerStats = [
  { value: "500+", label: "PG Owners", emoji: "🏢" },
  { value: "2,500+", label: "Rooms Listed", emoji: "🛏️" },
  { value: "₹0", label: "Listing Fee", emoji: "💰" },
  { value: "100%", label: "Verified Leads", emoji: "✅" },
];

export default function OwnerDashboardLanding() {
  return (
    <section className="py-20 bg-gradient-to-br from-[#1B1C15] to-gray-900 text-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left - Content */}
          <div>
            <span className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-3 inline-block">For PG Owners</span>
            <h2 className="font-serif text-4xl sm:text-5xl mb-4 leading-tight">
              List Your PG<br /> <em>Reach Quality Tenants</em>
            </h2>
            <p className="text-white/60 mb-8 text-sm leading-relaxed">
              Join 500+ PG owners who trust Castle Living to connect them with verified, quality tenants in Bangalore. Zero listing fee, zero brokerage — just direct bookings.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              {ownerStats.map((stat) => (
                <div key={stat.label} className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-white/50">{stat.label}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/list-your-pg"
                className="px-6 py-3.5 bg-white text-[#1B1C15] rounded-xl font-semibold text-sm hover:bg-gray-100 transition-colors text-center"
              >
                List Your PG — Free
              </Link>
              <Link
                href="/owner-dashboard"
                className="px-6 py-3.5 bg-white/10 border border-white/20 rounded-xl font-semibold text-sm hover:bg-white/20 transition-colors text-center"
              >
                Owner Dashboard →
              </Link>
            </div>
          </div>

          {/* Right - Preview */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-sm">
            <div className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-4">Owner Dashboard Preview</div>
            
            <div className="space-y-3">
              {[
                { label: "Total Views", value: "1,234", trend: "+12%", positive: true },
                { label: "Inquiries", value: "48", trend: "+8%", positive: true },
                { label: "Bookings", value: "12", trend: "+25%", positive: true },
                { label: "Avg Response Time", value: "2.3 hrs", trend: "-40%", positive: true },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                  <div>
                    <p className="text-sm font-semibold text-white">{item.value}</p>
                    <p className="text-xs text-white/50">{item.label}</p>
                  </div>
                  <span className={`text-xs font-bold ${item.positive ? "text-emerald-400" : "text-red-400"}`}>
                    {item.trend}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
              <p className="text-xs font-semibold text-emerald-400">💡 Tip: PGs with 5+ photos get 3x more inquiries</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
