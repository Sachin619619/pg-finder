"use client";

const reasons = [
  {
    emoji: "✅",
    title: "100% Verified Listings",
    desc: "Every PG is verified by our team. Photos, pricing, amenities — all checked.",
  },
  {
    emoji: "💰",
    title: "Zero Brokerage",
    desc: "Connect directly with PG owners. No middlemen, no hidden fees.",
  },
  {
    emoji: "⚡",
    title: "Instant Booking",
    desc: "Book your room in minutes. No lengthy paperwork, no waiting.",
  },
  {
    emoji: "🛡️",
    title: "Safety First",
    desc: "Detailed safety scores for every area. Know before you go.",
  },
  {
    emoji: "💬",
    title: "Real Reviews",
    desc: "Read honest reviews from real tenants. No fake ratings.",
  },
  {
    emoji: "📱",
    title: "Always Supported",
    desc: "24/7 chat and call support. We're here whenever you need us.",
  },
];

export default function WhyCastle() {
  return (
    <section className="py-20 bg-[#FFFDF9]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#1B5E3B]/60 mb-3 text-center">✦ Why Choose Us</p>
          <h2 className="font-serif text-3xl sm:text-4xl text-center text-black mb-3 tracking-tight">
            Why Tenants Choose Castle
          </h2>
          <p className="text-black/50 text-sm max-w-md mx-auto">
            We&apos;re not just another PG finder. We&apos;re building the most trusted platform for rental living.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {reasons.map((r) => (
            <div key={r.title} className="text-center p-6 rounded-3xl hover:shadow-lg transition-all duration-500 hover:-translate-y-1 hover:bg-[#F0EADD] card-shine">
              <div className="text-3xl mb-3">{r.emoji}</div>
              <h3 className="font-semibold text-[#1a1a1a] text-sm mb-2 hover:text-[#1B5E3B] transition-colors">{r.title}</h3>
              <p className="text-xs text-[#888] leading-relaxed">{r.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
