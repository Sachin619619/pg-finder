"use client";

import { useMemo } from "react";
import type { PGListing } from "@/data/listings";

export default function PriceInsights({ listings }: { listings: PGListing[] }) {
  const insights = useMemo(() => {
    const areaMap: Record<string, number[]> = {};
    listings.forEach((pg) => {
      if (!areaMap[pg.area]) areaMap[pg.area] = [];
      areaMap[pg.area].push(pg.price);
    });

    return Object.entries(areaMap)
      .map(([area, prices]) => ({
        area,
        avg: Math.round(prices.reduce((a, b) => a + b, 0) / prices.length),
        min: Math.min(...prices),
        max: Math.max(...prices),
        count: prices.length,
      }))
      .sort((a, b) => a.avg - b.avg);
  }, [listings]);

  const globalMax = Math.max(...insights.map((i) => i.max), 1);

  if (listings.length === 0) return null;

  return (
    <section className="py-20 bg-[#FFFDF9] border-t border-black/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#1B5E3B]/60 mb-3">&#10022; Price Analytics</p>
          <h2 className="font-serif text-2xl sm:text-3xl text-[#1a1a1a] mb-3 tracking-tight">
            Area-wise Price Insights
          </h2>
          <p className="text-[#999] max-w-md mx-auto text-sm">Compare PG rental prices across Bangalore&apos;s top neighborhoods</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 stagger-children">
          {insights.map((item) => (
            <div key={item.area} className="bg-[#FFFDF9] border border-black/[0.06] rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.04)] p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-[#1a1a1a]">{item.area}</h3>
                <span className="text-xs text-[#999]">{item.count} PGs</span>
              </div>
              {/* Bar */}
              <div className="h-3 bg-[#EDE8DE] rounded-full overflow-hidden mb-4">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#1B5E3B] to-[#2d8a5e] transition-all duration-1000"
                  style={{ width: `${(item.avg / globalMax) * 100}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-sm">
                <div>
                  <span className="text-[#999] text-xs">From</span>
                  <p className="font-bold text-emerald-600">₹{item.min.toLocaleString()}</p>
                </div>
                <div className="text-center">
                  <span className="text-[#999] text-xs">Average</span>
                  <p className="font-bold text-[#1a1a1a]">₹{item.avg.toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <span className="text-[#999] text-xs">Up to</span>
                  <p className="font-bold text-rose-500">₹{item.max.toLocaleString()}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
