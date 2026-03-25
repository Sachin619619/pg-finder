"use client";

import { useState } from "react";

export default function AppDownloadBanner() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-[360px] z-40 animate-slide-up">
      <div className="bg-[#1B1C15] rounded-2xl overflow-hidden shadow-2xl shadow-black/30">
        {/* Close button */}
        <button
          onClick={() => setDismissed(true)}
          className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition z-10"
        >
          <svg className="w-3 h-3 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        <div className="p-4 flex items-start gap-3">
          <div className="text-3xl shrink-0">🏰</div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-bold text-sm mb-0.5">Castle Living App</p>
            <p className="text-white/60 text-xs mb-3">Get exclusive deals and instant notifications</p>
            <div className="flex gap-2">
              <button className="flex items-center gap-1.5 px-3 py-2 bg-white text-black rounded-xl text-xs font-semibold hover:bg-gray-100 transition">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                </svg>
                App Store
              </button>
              <button className="flex items-center gap-1.5 px-3 py-2 bg-white/10 text-white border border-white/20 rounded-xl text-xs font-semibold hover:bg-white/20 transition">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92zm10.89 10.893l2.877 2.88-2.877 2.879-2.886-2.88 2.886-2.879zm3.1 3.1l2.887 2.88-2.887 2.879-2.877-2.88 2.877-2.879zM3.6 19.366v-8.73l5.58 4.365 2.22-1.738 4.38 4.102V22.18c-4.775-.642-8.235-2.289-12.18-2.814zM5.76 12.77l-5.73-4.47v8.73c4.66-.28 7.64-1.79 11.77-2.78l-6.04-4.73-2.69 2.08-2.26 1.77 4.76 3.73-2.81-2.2z"/>
                </svg>
                Google Play
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
