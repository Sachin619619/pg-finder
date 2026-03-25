"use client";

export default function PGStatsBanner() {
  const stats = [
    { value: "500+", label: "PG Listings", emoji: "🏠" },
    { value: "15+", label: "Areas Covered", emoji: "📍" },
    { value: "4.3", label: "Avg Rating", emoji: "⭐" },
    { value: "2000+", label: "Happy Tenants", emoji: "😊" },
    { value: "₹8K", label: "Starting Price", emoji: "💰" },
    { value: "98%", label: "Satisfaction", emoji: "❤️" },
  ];

  return (
    <section className="py-16 bg-[#0a0a0a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <span className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-3 inline-block">By the Numbers</span>
          <h2 className="font-serif text-3xl text-white mb-3">India&apos;s Fastest Growing PG Platform</h2>
          <p className="text-white/50 text-sm max-w-md mx-auto">Join thousands of tenants who found their perfect home through Castle Living</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center p-4">
              <div className="text-3xl mb-2">{stat.emoji}</div>
              <p className="text-2xl sm:text-3xl font-bold text-white">{stat.value}</p>
              <p className="text-xs text-white/40 uppercase tracking-wider mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
