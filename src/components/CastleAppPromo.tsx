"use client";

export default function CastleAppPromo() {
  return (
    <section className="py-20 bg-[#0a0a0a] text-white overflow-hidden">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <div className="text-5xl mb-4">🏰</div>
          <h2 className="font-serif text-4xl sm:text-5xl mb-4 leading-tight">
            Get the Castle App
          </h2>
          <p className="text-white/50 text-sm max-w-md mx-auto">
            Download the Castle Living app for exclusive deals, instant notifications, and a seamless PG hunting experience on the go.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-10">
          {[
            { emoji: "🔔", title: "Instant Alerts", desc: "Get notified immediately when new PGs match your saved searches" },
            { emoji: "📍", title: "Offline Access", desc: "Save listings and view them even without internet connection" },
            { emoji: "💰", title: "Exclusive Deals", desc: "App-only discounts and special offers from PG owners" },
          ].map(f => (
            <div key={f.title} className="text-center p-6">
              <div className="text-4xl mb-3">{f.emoji}</div>
              <h3 className="font-semibold text-white mb-2">{f.title}</h3>
              <p className="text-xs text-white/50 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button className="flex items-center justify-center gap-2 px-6 py-3.5 bg-white text-black rounded-xl font-semibold text-sm hover:bg-gray-100 transition-colors">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
            </svg>
            App Store
          </button>
          <button className="flex items-center justify-center gap-2 px-6 py-3.5 bg-white/10 border border-white/20 text-white rounded-xl font-semibold text-sm hover:bg-white/20 transition-colors">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92zm10.89 10.893l2.877 2.88-2.877 2.879-2.886-2.88 2.886-2.879zm3.1 3.1l2.887 2.88-2.887 2.879-2.877-2.88 2.877-2.879zM3.6 19.366v-8.73l5.58 4.365 2.22-1.738 4.38 4.102V22.18c-4.775-.642-8.235-2.289-12.18-2.814zM5.76 12.77l-5.73-4.47v8.73c4.66-.28 7.64-1.79 11.77-2.78l-6.04-4.73-2.69 2.08-2.26 1.77 4.76 3.73-2.81-2.2z"/>
            </svg>
            Google Play
          </button>
        </div>
      </div>
    </section>
  );
}
