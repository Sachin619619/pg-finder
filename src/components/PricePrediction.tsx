"use client";

import { useState, useMemo } from "react";
import type { PGListing } from "@/data/listings";
import { areas } from "@/data/listings";

interface PricePredictionProps {
  listings?: PGListing[];
  area?: string;
  currentPrice?: number;
}

interface PriceFactor {
  label: string;
  impact: number;
  icon: string;
}

// Factors that influence PG pricing
const priceFactors: Record<string, PriceFactor[]> = {
  "Kalyan Nagar": [
    { label: "IT hub proximity", impact: 8, icon: "💻" },
    { label: "Metro connectivity", impact: 10, icon: "🚇" },
    { label: "Market accessibility", impact: 5, icon: "🛒" },
  ],
  "Bellandur": [
    { label: "Tech park area", impact: 12, icon: "🏢" },
    { label: "Lake surroundings", impact: 6, icon: "🌊" },
    { label: "Traffic factor", impact: -5, icon: "🚗" },
  ],
  "Koramangala": [
    { label: "Premium locality", impact: 15, icon: "✨" },
    { label: "Nightlife & dining", impact: 8, icon: "🍽️" },
    { label: "Startup ecosystem", impact: 10, icon: "🚀" },
  ],
  "Whitefield": [
    { label: "IT corridor", impact: 12, icon: "🏢" },
    { label: "Mall proximity", impact: 6, icon: "🛍️" },
    { label: "Growing infrastructure", impact: 5, icon: "🏗️" },
  ],
  "HSR Layout": [
    { label: "IT park proximity", impact: 10, icon: "💻" },
    { label: "Planned layout", impact: 7, icon: "📐" },
    { label: "Good roads", impact: 5, icon: "🛣️" },
  ],
  "Indiranagar": [
    { label: "Hip neighborhood", impact: 12, icon: "🎵" },
    { label: "Cafe culture", impact: 8, icon: "☕" },
    { label: "Central location", impact: 10, icon: "📍" },
  ],
  "Marathahalli": [
    { label: "IT hub proximity", impact: 11, icon: "💻" },
    { label: "Shopping centers", impact: 6, icon: "🛍️" },
    { label: "Traffic concerns", impact: -4, icon: "🚗" },
  ],
};

function estimatePrice(area: string, amenities: string[], furnished: boolean, foodIncluded: boolean, acAvailable: boolean): { estimated: number; range: { min: number; max: number } } {
  // Base prices per area
  const basePrices: Record<string, number> = {
    "Kalyan Nagar": 9500, "HRBR Layout": 10000, "Bellandur": 11000, "HSR Layout": 10500,
    "Koramangala": 13000, "Indiranagar": 12500, "Whitefield": 10000, "Marathahalli": 10500,
    "BTM Layout": 8000, "Electronic City": 7500, "JP Nagar": 9500, "Jayanagar": 9000,
    "Hebbal": 8500, "Yelahanka": 7500, "Banashankari": 8000, "Rajajinagar": 8500,
    "Malleshwaram": 9500, "Sadashivanagar": 11000, "Banaswadi": 8000, "Kammanahalli": 7500,
  };

  let base = basePrices[area] || 8500;
  
  // Amenity adjustments
  if (furnished) base += 1500;
  if (foodIncluded) base += 3000;
  if (acAvailable) base += 2500;
  if (amenities.includes("WiFi")) base += 500;
  if (amenities.includes("Gym")) base += 800;
  if (amenities.includes("Parking")) base += 500;
  if (amenities.includes("Housekeeping")) base += 1000;
  if (amenities.includes("Security")) base += 400;
  if (amenities.includes("Washing Machine")) base += 600;
  if (amenities.includes("TV")) base += 300;
  if (amenities.includes("Fridge")) base += 400;

  const variation = base * 0.15;
  return {
    estimated: Math.round(base / 100) * 100,
    range: {
      min: Math.round((base - variation) / 100) * 100,
      max: Math.round((base + variation) / 100) * 100,
    },
  };
}

export default function PricePrediction({ area = "", amenities = [], furnished = false, foodIncluded = false, acAvailable = false, currentPrice }: PricePredictionProps) {
  const prediction = useMemo(() => {
    if (!area) return null;
    return estimatePrice(area, amenities, furnished, foodIncluded, acAvailable);
  }, [area, amenities, furnished, foodIncluded, acAvailable]);

  const factors = priceFactors[area] || [
    { label: "Location factor", impact: 5, icon: "📍" },
    { label: "Connectivity", impact: 5, icon: "🛣️" },
  ];

  if (!prediction) return null;

  const isUnderpriced = currentPrice && currentPrice < prediction.range.min;
  const isOverpriced = currentPrice && currentPrice > prediction.range.max;
  const isFair = currentPrice && currentPrice >= prediction.range.min && currentPrice <= prediction.range.max;

  return (
    <div className="bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-200 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">🔮</span>
        <h3 className="text-base font-bold text-violet-900">Price Insight</h3>
      </div>

      {/* Price range */}
      <div className="bg-white/70 rounded-xl p-4 mb-4">
        <p className="text-xs text-violet-600 font-medium mb-1">Estimated Market Rate</p>
        <div className="flex items-end gap-2 mb-2">
          <span className="text-3xl font-bold text-violet-900">₹{prediction.estimated.toLocaleString()}</span>
          <span className="text-sm text-violet-600 mb-1">/month</span>
        </div>
        <p className="text-xs text-violet-500">
          Range: ₹{prediction.range.min.toLocaleString()} – ₹{prediction.range.max.toLocaleString()}
        </p>
      </div>

      {/* Current vs estimated */}
      {currentPrice && (
        <div className="mb-4">
          {isFair && (
            <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
              <span className="text-emerald-600">✓</span>
              <span className="text-sm font-semibold text-emerald-800">Fair price — within market range</span>
            </div>
          )}
          {isUnderpriced && (
            <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-xl">
              <span className="text-blue-600">💰</span>
              <span className="text-sm font-semibold text-blue-800">Below market rate — potential deal!</span>
            </div>
          )}
          {isOverpriced && (
            <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl">
              <span className="text-amber-600">📈</span>
              <span className="text-sm font-semibold text-amber-800">Above market rate — consider negotiating</span>
            </div>
          )}
        </div>
      )}

      {/* Factors */}
      <div className="space-y-1.5">
        <p className="text-xs font-semibold text-violet-600 uppercase tracking-wider">Price Factors</p>
        {factors.map((f) => (
          <div key={f.label} className="flex items-center justify-between">
            <span className="text-xs text-violet-700 flex items-center gap-1.5">
              <span>{f.icon}</span> {f.label}
            </span>
            <span className={`text-xs font-bold ${f.impact >= 0 ? "text-emerald-600" : "text-red-500"}`}>
              {f.impact >= 0 ? "+" : ""}{f.impact}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
