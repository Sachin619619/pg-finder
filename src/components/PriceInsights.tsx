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
    <section className="py-20 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="pill bg-violet-50 dark:bg-violet-900/30 text-violet-600 !text-xs font-semibold mb-4 inline-block">Price Intelligence</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-3">
            Area-wise <span className="gradient-text">Price Insights</span>
          </h2>
          <p className="text-gray-400 max-w-md mx-auto">Compare PG rental prices across Bangalore&apos;s top neighborhoods</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 stagger-children">
          {insights.map((item) => (
            <div key={item.area} className="premium-card !rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 dark:text-white">{item.area}</h3>
                <span className="text-xs text-gray-400">{item.count} PGs</span>
              </div>
              {/* Bar */}
              <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden mb-4">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all duration-1000"
                  style={{ width: `${(item.avg / globalMax) * 100}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-sm">
                <div>
                  <span className="text-gray-400 text-xs">From</span>
                  <p className="font-bold text-emerald-600 dark:text-emerald-400">₹{item.min.toLocaleString()}</p>
                </div>
                <div className="text-center">
                  <span className="text-gray-400 text-xs">Average</span>
                  <p className="font-bold text-violet-600 dark:text-violet-400">₹{item.avg.toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <span className="text-gray-400 text-xs">Up to</span>
                  <p className="font-bold text-rose-500 dark:text-rose-400">₹{item.max.toLocaleString()}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
