"use client";

import { useEffect, useRef } from "react";

type AdSize = "banner" | "rectangle" | "leaderboard" | "in-feed";

type Props = {
  size?: AdSize;
  slot?: string; // AdSense ad slot ID
  className?: string;
};

const AD_SIZES: Record<AdSize, { w: string; h: string; format: string }> = {
  banner: { w: "100%", h: "90px", format: "horizontal" },
  rectangle: { w: "100%", h: "250px", format: "rectangle" },
  leaderboard: { w: "100%", h: "90px", format: "horizontal" },
  "in-feed": { w: "100%", h: "auto", format: "fluid" },
};

// Set your AdSense publisher ID here when approved
const ADSENSE_PUB_ID = process.env.NEXT_PUBLIC_ADSENSE_PUB_ID || "";

export default function AdBanner({ size = "banner", slot, className = "" }: Props) {
  const adRef = useRef<HTMLDivElement>(null);
  const pushed = useRef(false);
  const config = AD_SIZES[size];

  useEffect(() => {
    // Only push ads if AdSense is loaded and we have a slot
    if (ADSENSE_PUB_ID && slot && !pushed.current && typeof window !== "undefined") {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
        pushed.current = true;
      } catch {}
    }
  }, [slot]);

  // If AdSense is configured, render real ad
  if (ADSENSE_PUB_ID && slot) {
    return (
      <div className={`ad-container flex justify-center ${className}`}>
        <ins
          className="adsbygoogle"
          style={{ display: "block", width: config.w, height: config.h === "auto" ? undefined : config.h }}
          data-ad-client={`ca-pub-${ADSENSE_PUB_ID}`}
          data-ad-slot={slot}
          data-ad-format={config.format}
          data-full-width-responsive="true"
        />
      </div>
    );
  }

  // Placeholder ads (shown until AdSense is set up)
  return (
    <div className={`relative overflow-hidden rounded-2xl ${className}`}>
      {size === "in-feed" ? (
        // In-feed native ad style
        <div className="bg-gradient-to-r from-violet-50 via-fuchsia-50 to-purple-50 dark:from-violet-900/10 dark:via-fuchsia-900/10 dark:to-purple-900/10 border border-violet-100 dark:border-violet-800/30 rounded-2xl p-5">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-violet-500/20">
              <span className="text-white text-2xl font-bold">P</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-semibold text-violet-500 uppercase tracking-wider">Sponsored</span>
              </div>
              <h4 className="font-bold text-gray-900 dark:text-white text-sm">List Your PG on Castle</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Get 10x more inquiries. Premium listing starts at just ₹499/month</p>
              <button className="mt-3 px-4 py-1.5 bg-violet-600 text-white text-xs font-semibold rounded-lg hover:bg-violet-700 transition">
                Get Started
              </button>
            </div>
          </div>
        </div>
      ) : size === "rectangle" ? (
        // Rectangle ad
        <div className="bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-500 rounded-2xl p-6 text-center" style={{ minHeight: "250px" }}>
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <div className="w-14 h-14 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
              <span className="text-white text-3xl font-bold">P</span>
            </div>
            <div>
              <h3 className="text-white font-extrabold text-xl">Castle Premium</h3>
              <p className="text-white/70 text-sm mt-1">Featured listings get 5x more views</p>
            </div>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-white/50 text-sm line-through">₹999</span>
              <span className="text-white font-extrabold text-2xl">₹499</span>
              <span className="text-white/60 text-sm">/month</span>
            </div>
            <button className="px-6 py-2.5 bg-white text-violet-600 font-bold text-sm rounded-xl hover:bg-gray-100 transition shadow-lg">
              Boost Your PG
            </button>
            <span className="text-white/40 text-[10px]">Ad</span>
          </div>
        </div>
      ) : (
        // Horizontal banner
        <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-500 rounded-2xl px-5 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-lg">P</span>
            </div>
            <div className="min-w-0">
              <p className="text-white font-bold text-sm truncate">Own a PG? List it free!</p>
              <p className="text-white/60 text-xs truncate">Get inquiries from verified tenants</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button className="px-4 py-2 bg-white text-violet-600 font-semibold text-xs rounded-xl hover:bg-gray-100 transition whitespace-nowrap">
              List Now
            </button>
            <span className="text-white/30 text-[10px]">Ad</span>
          </div>
        </div>
      )}
    </div>
  );
}
