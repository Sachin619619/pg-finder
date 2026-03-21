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
    text: "As a woman moving to Bangalore for the first time, safety was my top priority. PG Finder's verified listings and detailed reviews gave me confidence.",
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
    gradient: "from-violet-400 to-purple-500",
  },
  {
    name: "Amit Verma",
    role: "MBA Student",
    text: "Switched from NoBroker to PG Finder. The UI is so much better and I found my PG without paying any brokerage. Clean and trustworthy.",
    avatar: "AV",
    rating: 5,
    area: "BTM Layout",
    gradient: "from-amber-400 to-orange-500",
  },
  {
    name: "Priya Nair",
    role: "HR at Amazon",
    text: "I recommend PG Finder to every new joiner at our office. The verified badges and callback feature make it super convenient for newcomers.",
    avatar: "PN",
    rating: 5,
    area: "Bellandur",
    gradient: "from-cyan-400 to-blue-500",
  },
];

export default function Testimonials() {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-violet-500/[0.02] rounded-full blur-[150px]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-14">
          <span className="pill bg-amber-50 dark:bg-amber-900/30 text-amber-600 !text-xs font-semibold mb-4 inline-block">Loved by 500+ Tenants ❤️</span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-gray-900 dark:text-white mb-4 tracking-tight">
            What our <span className="gradient-text">tenants say</span>
          </h2>
          <p className="text-gray-400 max-w-md mx-auto">Real stories from people who found their perfect PG through us</p>
        </div>

        {/* Masonry-style grid */}
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-5 space-y-5">
          {testimonials.map((t, i) => (
            <div
              key={t.name}
              className={`premium-card !rounded-2xl p-6 break-inside-avoid ${i === 0 || i === 4 ? "" : ""}`}
            >
              {/* Quote icon */}
              <div className="mb-4">
                <svg className="w-8 h-8 text-violet-200 dark:text-violet-800" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H14.017zM0 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H0z" />
                </svg>
              </div>

              {/* Stars */}
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <span key={idx} className="text-amber-400 text-sm">⭐</span>
                ))}
              </div>

              <p className="text-gray-600 dark:text-gray-300 text-[15px] leading-relaxed mb-6">&ldquo;{t.text}&rdquo;</p>

              <div className="flex items-center gap-3 pt-5 border-t border-gray-100 dark:border-gray-800">
                <div className={`w-11 h-11 bg-gradient-to-br ${t.gradient} rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg`}>
                  {t.avatar}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-900 dark:text-white text-sm">{t.name}</p>
                  <p className="text-xs text-gray-400">{t.role}</p>
                </div>
                <span className="pill bg-violet-50 dark:bg-violet-900/30 text-violet-600 !text-[10px] border border-violet-100 dark:border-violet-800">📍 {t.area}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
