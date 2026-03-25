"use client";

import { useEffect, useState } from "react";

interface StatItem {
  value: number;
  label: string;
  emoji: string;
}

export default function CommunityStats() {
  const [stats, setStats] = useState<StatItem[]>([
    { value: 0, label: "Happy Tenants", emoji: "😊" },
    { value: 0, label: "Verified PGs", emoji: "✅" },
    { value: 0, label: "Areas Covered", emoji: "📍" },
    { value: 0, label: "Avg Rating", emoji: "⭐" },
  ]);

  const targets = [
    { value: 500, label: "Happy Tenants", emoji: "😊" },
    { value: 25, label: "Verified PGs", emoji: "✅" },
    { value: 15, label: "Areas Covered", emoji: "📍" },
    { value: 43, label: "Avg Rating", emoji: "⭐", decimal: 1 },
  ];

  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const interval = duration / steps;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      const easeOut = 1 - Math.pow(1 - progress, 3);

      setStats(targets.map(t => ({
        ...t,
        value: t.decimal ? parseFloat((t.value * easeOut).toFixed(t.decimal)) : Math.round(t.value * easeOut),
      })));

      if (step >= steps) clearInterval(timer);
    }, interval);

    return () => clearInterval(timer);
  }, []);

  return (
    <section className="py-16 bg-[#1a1a1a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <p className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-3">Our Community</p>
          <h2 className="font-serif text-2xl sm:text-3xl text-white mb-2">Trusted by 500+ Tenants</h2>
          <p className="text-white/50 text-sm">Join Bangalore's fastest growing PG finder community</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <span className="text-3xl block mb-2">{stat.emoji}</span>
              <p className="font-serif text-3xl sm:text-4xl font-bold text-white mb-1" style={{textShadow: '0 0 30px rgba(255,255,255,0.15)'}}>
                {stat.value}
                {stat.label === "Avg Rating" ? "" : "+"}
              </p>
              <p className="text-xs text-white/40 uppercase tracking-wider">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Trust badges */}
        <div className="flex flex-wrap justify-center gap-4 mt-10">
          {[
            "🔒 Secure Payments", "✓ Verified Listings", "📞 24/7 Support",
            "💰 No Hidden Fees", "🏠 Homely Stays", "⚡ Instant Booking"
          ].map(badge => (
            <div key={badge} className="flex items-center gap-1.5 px-4 py-2 bg-white/5 border border-white/10 rounded-full">
              <span className="text-xs text-white/70 font-medium">{badge}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
