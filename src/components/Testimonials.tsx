"use client";

const testimonials = [
  {
    name: "Rohit Sharma",
    role: "Software Engineer at Google",
    text: "Found my perfect PG in Koramangala within a day! The filters and reviews made it so easy to compare options. Saved me hours of visiting random PGs.",
    avatar: "RS",
    rating: 5,
    area: "Koramangala",
    gradient: "from-orange-400 to-rose-400",
  },
  {
    name: "Sneha Patil",
    role: "Data Analyst at Wipro",
    text: "As a woman moving to Bangalore for the first time, safety was my top priority. Castle's verified listings and detailed reviews gave me confidence.",
    avatar: "SP",
    rating: 5,
    area: "HSR Layout",
    gradient: "from-blue-400 to-indigo-500",
  },
  {
    name: "Karthik Menon",
    role: "Fresher at TCS",
    text: "The price comparison feature is amazing! I could see exactly how much PGs cost in different areas and found an affordable option near my office.",
    avatar: "KM",
    rating: 5,
    area: "Electronic City",
    gradient: "from-emerald-400 to-teal-500",
  },
  {
    name: "Divya Reddy",
    role: "UX Designer",
    text: "The roommate finder feature connected me with like-minded people. Now I share a great PG in Indiranagar with amazing flatmates!",
    avatar: "DR",
    rating: 5,
    area: "Indiranagar",
    gradient: "from-[#2a2a2a] to-[#1a1a1a]",
  },
  {
    name: "Amit Verma",
    role: "MBA Student",
    text: "Switched from NoBroker to Castle. The UI is so much better and I found my PG without paying any brokerage. Clean and trustworthy.",
    avatar: "AV",
    rating: 5,
    area: "BTM Layout",
    gradient: "from-amber-400 to-orange-500",
  },
  {
    name: "Priya Nair",
    role: "HR at Amazon",
    text: "I recommend Castle to every new joiner at our office. The verified badges and callback feature make it super convenient for newcomers.",
    avatar: "PN",
    rating: 5,
    area: "Bellandur",
    gradient: "from-cyan-400 to-blue-500",
  },
];

export default function Testimonials() {
  return (
    <section className="py-20 sm:py-28 bg-[#1B5E3B] text-white relative overflow-hidden">
      {/* Decorative circles */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10">
        <div className="absolute top-10 left-10 w-40 h-40 border border-white/20 rounded-full" />
        <div className="absolute bottom-10 right-10 w-60 h-60 border border-white/10 rounded-full" />
        <div className="absolute top-1/2 left-1/3 w-24 h-24 border border-white/15 rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-14">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/50 mb-4 text-center">What Our Residents Say</p>
          <h2 className="font-serif text-3xl sm:text-4xl text-white text-center mb-12">
            What our tenants say
          </h2>
        </div>

        {/* Masonry-style grid */}
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-5 space-y-5">
          {testimonials.map((t, i) => (
            <div
              key={t.name}
              className="bg-white text-[#1a1a1a] rounded-3xl p-8 sm:p-10 shadow-xl break-inside-avoid"
            >
              {/* Decorative quote mark */}
              <span className="text-6xl font-serif text-[#1B5E3B]/20 leading-none block mb-4">&ldquo;</span>

              {/* Stars */}
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <span key={idx} className="text-amber-400 text-sm">⭐</span>
                ))}
              </div>

              <p className="font-serif text-xl sm:text-2xl leading-relaxed text-[#333] mb-6">&ldquo;{t.text}&rdquo;</p>

              <div className="flex items-center gap-3 pt-5 border-t border-black/5">
                <div className={`w-14 h-14 bg-gradient-to-br ${t.gradient} rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg`}>
                  {t.avatar}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-900 text-sm">{t.name}</p>
                  <p className="text-[#1B5E3B] font-medium text-xs">{t.role}</p>
                </div>
                <span className="pill bg-white/80 text-[#1a1a1a] !text-[10px] border border-black/5">📍 {t.area}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
