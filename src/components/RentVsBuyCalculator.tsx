"use client";

import { useState } from "react";

export default function RentVsBuyCalculator() {
  const [monthlyRent, setMonthlyRent] = useState(10000);
  const [years, setYears] = useState(1);

  const buyEstimate = monthlyRent * 12 * years * 10; // Simplified estimate
  const rentPaid = monthlyRent * 12 * years;
  const difference = buyEstimate - rentPaid;

  return (
    <div className="bg-gradient-to-br from-violet-50 to-indigo-50 border border-violet-100 rounded-2xl p-5">
      <h3 className="text-base font-bold text-violet-900 mb-2 flex items-center gap-2">
        <span className="text-lg">🏠</span> Rent vs Buy Calculator
      </h3>
      <p className="text-xs text-violet-700 mb-4">Should you rent or buy? A quick comparison</p>

      <div className="space-y-3 mb-4">
        <div>
          <label className="text-xs font-semibold text-[#666] mb-1 block">Monthly Rent (₹)</label>
          <input
            type="range"
            min="5000"
            max="50000"
            step="1000"
            value={monthlyRent}
            onChange={e => setMonthlyRent(parseInt(e.target.value))}
            className="w-full accent-violet-500"
          />
          <p className="text-right text-sm font-bold text-violet-700">₹{monthlyRent.toLocaleString()}</p>
        </div>
        <div>
          <label className="text-xs font-semibold text-[#666] mb-1 block">Years Planning to Stay</label>
          <input
            type="range"
            min="1"
            max="5"
            step="1"
            value={years}
            onChange={e => setYears(parseInt(e.target.value))}
            className="w-full accent-violet-500"
          />
          <p className="text-right text-sm font-bold text-violet-700">{years} {years === 1 ? "year" : "years"}</p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between p-2 bg-white/60 rounded-lg">
          <span className="text-xs text-[#666]">Total Rent Paid</span>
          <span className="text-sm font-bold text-gray-900">₹{rentPaid.toLocaleString()}</span>
        </div>
        <div className="flex justify-between p-2 bg-white/60 rounded-lg">
          <span className="text-xs text-[#666]">Est. 1BHK Cost</span>
          <span className="text-sm font-bold text-gray-900">₹{buyEstimate.toLocaleString()}</span>
        </div>
        <div className="flex justify-between p-3 bg-violet-100 rounded-lg border border-violet-200">
          <span className="text-xs font-semibold text-violet-800">Recommendation</span>
          <span className="text-sm font-bold text-violet-900">
            {years < 2 ? "📍 Rent - flexibility wins" : "🏠 Consider buying - long-term savings"}
          </span>
        </div>
      </div>

      <p className="text-[10px] text-[#999] mt-3">
        * Estimates are simplified. Actual costs vary significantly.
      </p>
    </div>
  );
}
