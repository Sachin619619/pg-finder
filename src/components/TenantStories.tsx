"use client";

const stories = [
  {
    name: "Priya S.",
    role: "Software Engineer at Microsoft",
    avatar: "👩‍💻",
    pg: "Sunrise PG, Koramangala",
    quote: "Castle made finding a PG so easy. I was new to Bangalore and the safety scores helped me pick a great area. The virtual tour was super helpful!",
    rating: 5,
  },
  {
    name: "Rahul K.",
    role: "Student at Christ University",
    avatar: "👨‍🎓",
    pg: "Starlight PG, HSR Layout",
    quote: "Found my room within 2 days. The roommate finder helped me connect with guys who had similar routines. Best decision of my college life!",
    rating: 5,
  },
  {
    name: "Ananya M.",
    role: "Product Designer at Startup",
    avatar: "👩‍🎨",
    pg: "Urban Nest, Indiranagar",
    quote: "The comparison feature saved me so much time. I could see all the PGs I liked side-by-side and make an informed decision.",
    rating: 5,
  },
];

export default function TenantStories() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="text-xs font-semibold text-black/40 uppercase tracking-widest mb-3 inline-block">Testimonials</span>
          <h2 className="font-serif text-3xl sm:text-4xl text-black mb-3 tracking-tight">What Our Tenants Say</h2>
          <p className="text-black/50 max-w-md mx-auto text-sm">Real stories from real people who found their perfect home through Castle Living</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stories.map((s) => (
            <div key={s.name} className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg hover:-translate-y-1 transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center text-2xl">
                  {s.avatar}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{s.name}</p>
                  <p className="text-xs text-gray-500">{s.role}</p>
                </div>
              </div>
              
              <p className="text-sm text-gray-600 leading-relaxed mb-4 italic">"{s.quote}"</p>
              
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div>
                  <p className="text-xs text-gray-400">Stayed at</p>
                  <p className="text-sm font-semibold text-gray-800">{s.pg}</p>
                </div>
                <div className="flex gap-0.5">
                  {Array.from({ length: s.rating }).map((_, i) => (
                    <span key={i} className="text-amber-400">⭐</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
