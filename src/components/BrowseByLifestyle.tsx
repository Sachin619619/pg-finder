"use client";

import Link from "next/link";

const lifestyleCategories = [
  {
    id: "tech",
    label: "Tech Hub Living",
    emoji: "💻",
    description: "Near IT parks & tech corridors",
    areas: ["Bellandur", "Electronic City", "Whitefield", "Marathahalli", "HSR Layout"],
    gradient: "from-blue-500 to-indigo-600",
  },
  {
    id: "students",
    label: "Student Friendly",
    emoji: "🎓",
    description: "Budget-friendly with great connectivity",
    areas: ["BTM Layout", "Jayanagar", "JP Nagar", "Banashankari", "Rajajinagar"],
    gradient: "from-pink-500 to-rose-600",
  },
  {
    id: "families",
    label: "Family Friendly",
    emoji: "👨‍👩‍👧",
    description: "Safe neighborhoods with schools nearby",
    areas: ["Kalyan Nagar", "HRBR Layout", "Malleshwaram", "Jayanagar", "Hebbal"],
    gradient: "from-emerald-500 to-teal-600",
  },
  {
    id: "social",
    label: "Social & Nightlife",
    emoji: "🍻",
    description: "Cafes, pubs, and vibrant social scene",
    areas: ["Indiranagar", "Koramangala", "Whitefield", "HSR Layout", "Marathahalli"],
    gradient: "from-amber-500 to-orange-600",
  },
  {
    id: "commuters",
    label: "Metro Connected",
    emoji: "🚇",
    description: "Quick access to metro stations",
    areas: ["Kalyan Nagar", "Indiranagar", "Malleshwaram", "Hebbal", "Jayanagar"],
    gradient: "from-cyan-500 to-blue-600",
  },
  {
    id: "luxury",
    label: "Premium Living",
    emoji: "✨",
    description: "Top-tier amenities and prime locations",
    areas: ["Koramangala", "Indiranagar", "Sadashivanagar", "Malleshwaram", "Whitefield"],
    gradient: "from-violet-500 to-purple-600",
  },
];

export default function BrowseByLifestyle() {
  return (
    <section className="py-20 bg-[#0a0a0a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-3 inline-block">Personalized Browse</span>
          <h2 className="font-serif text-3xl sm:text-4xl text-white mb-3 tracking-tight">Find PGs by Lifestyle</h2>
          <p className="text-white/50 max-w-md mx-auto text-sm">Choose what describes you — we'll find the perfect area and PGs</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {lifestyleCategories.map((cat) => (
            <Link
              key={cat.id}
              href={`/?lifestyle=${cat.id}`}
              className="group relative bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 hover:border-white/20 transition-all hover:-translate-y-1 overflow-hidden"
            >
              {/* Gradient accent */}
              <div className={`absolute inset-0 bg-gradient-to-br ${cat.gradient} opacity-0 group-hover:opacity-10 transition-opacity`} />
              
              <div className="relative z-10">
                <span className="text-3xl block mb-3">{cat.emoji}</span>
                <p className="text-sm font-semibold text-white mb-1">{cat.label}</p>
                <p className="text-[10px] text-white/50 leading-relaxed">{cat.description}</p>
                
                {/* Areas preview */}
                <div className="mt-3 flex flex-wrap gap-1">
                  {cat.areas.slice(0, 2).map(area => (
                    <span key={area} className="text-[9px] px-1.5 py-0.5 bg-white/10 rounded text-white/60">
                      {area}
                    </span>
                  ))}
                  {cat.areas.length > 2 && (
                    <span className="text-[9px] px-1.5 py-0.5 text-white/40">+{cat.areas.length - 2}</span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
