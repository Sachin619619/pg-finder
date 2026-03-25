"use client";

export default function BookingTimeline() {
  const steps = [
    { step: 1, title: "Browse & Shortlist", desc: "Browse PGs, compare prices, read reviews, and shortlist your top picks.", emoji: "🔍", time: "5-10 min" },
    { step: 2, title: "Schedule a Visit", desc: "Book a virtual or in-person tour at a time that works for you.", emoji: "📅", time: "2 min" },
    { step: 3, title: "Visit the PG", desc: "Tour the property in person or virtually. Meet the owner and see the rooms.", emoji: "🏠", time: "30-60 min" },
    { step: 4, title: "Book Your Room", desc: "Select your room type and pay the first month's rent + security deposit.", emoji: "✅", time: "15 min" },
    { step: 5, title: "Move In!", desc: "Pack your bags and move into your new home. Welcome to Castle!", emoji: "🎉", time: "Day 1" },
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
        <span className="text-lg">📋</span> How Booking Works
      </h3>

      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-5 top-5 bottom-5 w-px bg-gray-200" />

        <div className="space-y-5">
          {steps.map((s, i) => (
            <div key={s.step} className="relative flex items-start gap-4 pl-1">
              {/* Circle */}
              <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0 ${
                i === 0 ? "bg-blue-100 text-blue-600" :
                i === steps.length - 1 ? "bg-emerald-100 text-emerald-600" :
                "bg-gray-100 text-gray-600"
              }`}>
                {s.emoji}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 pt-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[10px] font-bold text-gray-400">STEP {s.step}</span>
                  <span className="text-[10px] text-gray-300">•</span>
                  <span className="text-[10px] text-gray-400">{s.time}</span>
                </div>
                <p className="text-sm font-semibold text-gray-900">{s.title}</p>
                <p className="text-xs text-gray-500 leading-relaxed mt-0.5">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
