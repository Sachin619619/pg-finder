"use client";

import type { PGListing } from "@/data/listings";

interface ListingQualityScoreProps {
  pg: Pick<PGListing, "images" | "amenities" | "rating" | "reviews" | "description" | "roomOptions" | "nearbyLandmarks" | "distanceFromMetro">;
  compact?: boolean;
}

function calculateQualityScore(pg: ListingQualityScoreProps["pg"]): {
  total: number;
  breakdown: { label: string; score: number; max: number; icon: string }[];
  grade: string;
  color: string;
} {
  const breakdown = [];
  
  // Photos (0-25 points)
  const photoScore = Math.min(pg.images.length * 5, 25);
  breakdown.push({ label: "Photos", score: photoScore, max: 25, icon: "📷" });

  // Amenities (0-20 points)
  const amenityScore = Math.min(pg.amenities.length * 2, 20);
  breakdown.push({ label: "Amenities", score: amenityScore, max: 20, icon: "🛋️" });

  // Reviews & Rating (0-20 points)
  let reviewScore = 0;
  if (pg.reviews >= 10) reviewScore = 20;
  else if (pg.reviews >= 5) reviewScore = 15;
  else if (pg.reviews >= 1) reviewScore = 10;
  if (pg.rating >= 4.5) reviewScore += 0;
  else if (pg.rating >= 4) reviewScore += 0;
  reviewScore = Math.min(reviewScore, 20);
  breakdown.push({ label: "Reviews", score: reviewScore, max: 20, icon: "⭐" });

  // Description (0-15 points)
  const descLen = pg.description?.length || 0;
  const descScore = descLen >= 150 ? 15 : descLen >= 80 ? 10 : descLen >= 40 ? 5 : 0;
  breakdown.push({ label: "Description", score: descScore, max: 15, icon: "📝" });

  // Room Options (0-10 points)
  const roomScore = pg.roomOptions && pg.roomOptions.length > 1 ? 10 : pg.roomOptions?.length === 1 ? 5 : 3;
  breakdown.push({ label: "Room Options", score: roomScore, max: 10, icon: "🛏️" });

  // Location details (0-10 points)
  let locationScore = 0;
  if (pg.nearbyLandmarks && pg.nearbyLandmarks.length > 0) locationScore += 5;
  if (pg.distanceFromMetro) locationScore += 5;
  breakdown.push({ label: "Location Info", score: locationScore, max: 10, icon: "📍" });

  const total = breakdown.reduce((sum, b) => sum + b.score, 0);
  const max = breakdown.reduce((sum, b) => sum + b.max, 0);

  let grade: string;
  let color: string;
  const pct = (total / max) * 100;
  if (pct >= 85) { grade = "A+"; color = "text-emerald-600 bg-emerald-50 border-emerald-200"; }
  else if (pct >= 70) { grade = "A"; color = "text-green-600 bg-green-50 border-green-200"; }
  else if (pct >= 55) { grade = "B"; color = "text-blue-600 bg-blue-50 border-blue-200"; }
  else if (pct >= 40) { grade = "C"; color = "text-amber-600 bg-amber-50 border-amber-200"; }
  else { grade = "D"; color = "text-red-600 bg-red-50 border-red-200"; }

  return { total, breakdown, grade, color };
}

export default function ListingQualityScore({ pg, compact = false }: ListingQualityScoreProps) {
  const { total, breakdown, grade, color } = calculateQualityScore(pg);
  const max = breakdown.reduce((sum, b) => sum + b.max, 0);
  const pct = Math.round((total / max) * 100);

  if (compact) {
    return (
      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${color}`}>
        <span>📊</span>
        <span>Quality {grade} ({pct}%)</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
          <span className="text-lg">📊</span> Listing Quality
        </h3>
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl font-bold border ${color}`}>
          <span className="text-lg">{grade}</span>
          <span className="text-sm opacity-70">{pct}%</span>
        </div>
      </div>

      {/* Overall bar */}
      <div className="w-full bg-gray-100 rounded-full h-3 mb-5 overflow-hidden">
        <div
          className="h-3 rounded-full bg-gradient-to-r from-emerald-400 to-blue-500 transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Breakdown */}
      <div className="space-y-2.5">
        {breakdown.map((item) => {
          const itemPct = Math.round((item.score / item.max) * 100);
          return (
            <div key={item.label} className="flex items-center gap-3">
              <span className="text-base w-6 text-center shrink-0">{item.icon}</span>
              <span className="text-xs text-gray-600 w-24 shrink-0">{item.label}</span>
              <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${
                    itemPct >= 80 ? "bg-emerald-400" : itemPct >= 50 ? "bg-amber-400" : "bg-red-400"
                  }`}
                  style={{ width: `${itemPct}%` }}
                />
              </div>
              <span className="text-xs font-semibold text-gray-500 w-12 text-right">
                {item.score}/{item.max}
              </span>
            </div>
          );
        })}
      </div>

      {/* Tip */}
      {pct < 70 && (
        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl">
          <p className="text-xs text-amber-800">
            💡 <strong>Tip:</strong> Listings with more photos, detailed descriptions, and multiple room options rank higher and get more inquiries.
          </p>
        </div>
      )}
    </div>
  );
}
