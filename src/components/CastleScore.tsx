"use client";

import type { PGListing } from "@/data/listings";
import { areaSafetyScores, metroProximity, busConnectivity } from "@/data/safetyData";

interface CastleScoreProps {
  pg: PGListing;
  compact?: boolean;
}

function calculateCastleScore(pg: PGListing): {
  total: number;
  breakdown: { label: string; score: number; max: number; color: string };
  grade: string;
  gradeColor: string;
} {
  const breakdown: Array<{ label: string; score: number; max: number; color: string }> = [];

  // Safety (0-20)
  const safety = areaSafetyScores[pg.area]?.score || 50;
  breakdown.push({ label: "Safety", score: Math.round(safety * 0.2), max: 20, color: "bg-emerald-400" });

  // Transport (0-15)
  const metro = metroProximity[pg.area];
  const bus = busConnectivity[pg.area];
  let transportScore = 0;
  if (metro) transportScore += 8;
  if (bus && bus.score >= 85) transportScore += 7;
  else if (bus) transportScore += Math.round(bus.score / 15);
  breakdown.push({ label: "Transport", score: Math.min(transportScore, 15), max: 15, color: "bg-blue-400" });

  // Rating (0-20)
  const ratingScore = Math.round(pg.rating * 4);
  breakdown.push({ label: "Rating", score: Math.min(ratingScore, 20), max: 20, color: "bg-amber-400" });

  // Amenities (0-15)
  const amenityScore = Math.min(pg.amenities.length * 1.5, 15);
  breakdown.push({ label: "Amenities", score: amenityScore, max: 15, color: "bg-purple-400" });

  // Value (0-15) - based on price vs area average
  const avgPrices: Record<string, number> = {
    "Kalyan Nagar": 9500, "HRBR Layout": 10000, "Bellandur": 11000, "HSR Layout": 10500,
    "Koramangala": 13000, "Indiranagar": 12500, "Whitefield": 10000, "Marathahalli": 10500,
    "BTM Layout": 8000, "Electronic City": 7500, "JP Nagar": 9500, "Jayanagar": 9000,
    "Hebbal": 8500,
  };
  const avg = avgPrices[pg.area] || 9000;
  const valueScore = pg.price <= avg * 0.9 ? 15 : pg.price <= avg * 1.1 ? 12 : pg.price <= avg * 1.3 ? 8 : 5;
  breakdown.push({ label: "Value", score: valueScore, max: 15, color: "bg-green-400" });

  // Reviews count (0-15)
  const reviewScore = pg.reviews >= 50 ? 15 : pg.reviews >= 20 ? 12 : pg.reviews >= 10 ? 9 : pg.reviews >= 5 ? 6 : pg.reviews >= 1 ? 3 : 1;
  breakdown.push({ label: "Reviews", score: reviewScore, max: 15, color: "bg-pink-400" });

  const total = breakdown.reduce((sum, b) => sum + b.score, 0);
  const max = breakdown.reduce((sum, b) => sum + b.max, 0);
  const pct = (total / max) * 100;

  let grade: string;
  let gradeColor: string;
  if (pct >= 90) { grade = "A+"; gradeColor = "text-emerald-600 bg-emerald-50 border-emerald-200"; }
  else if (pct >= 80) { grade = "A"; gradeColor = "text-green-600 bg-green-50 border-green-200"; }
  else if (pct >= 70) { grade = "B+"; gradeColor = "text-blue-600 bg-blue-50 border-blue-200"; }
  else if (pct >= 60) { grade = "B"; gradeColor = "text-cyan-600 bg-cyan-50 border-cyan-200"; }
  else if (pct >= 50) { grade = "C"; gradeColor = "text-amber-600 bg-amber-50 border-amber-200"; }
  else { grade = "D"; gradeColor = "text-red-600 bg-red-50 border-red-200"; }

  return { total, breakdown, grade, gradeColor };
}

export default function CastleScore({ pg, compact = false }: CastleScoreProps) {
  const { total, grade, gradeColor, breakdown } = calculateCastleScore(pg);
  const max = breakdown.reduce((sum, b) => sum + b.max, 0);
  const pct = Math.round((total / max) * 100);

  if (compact) {
    return (
      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${gradeColor}`}>
        <span>🏰</span>
        <span>Castle {grade}</span>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-violet-50 to-indigo-50 border border-violet-100 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🏰</span>
          <div>
            <p className="text-sm font-bold text-violet-900">Castle Score</p>
            <p className="text-xs text-violet-600">Overall quality rating</p>
          </div>
        </div>
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl font-bold border ${gradeColor}`}>
          <span className="text-2xl">{grade}</span>
          <span className="text-sm opacity-70">{pct}%</span>
        </div>
      </div>

      {/* Overall bar */}
      <div className="w-full bg-white/60 rounded-full h-3 mb-4 overflow-hidden">
        <div
          className="h-3 rounded-full bg-gradient-to-r from-violet-400 to-indigo-500 transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Breakdown */}
      <div className="space-y-2">
        {breakdown.map((item) => {
          const itemPct = Math.round((item.score / item.max) * 100);
          return (
            <div key={item.label} className="flex items-center gap-3">
              <span className="text-xs text-violet-700 w-20 shrink-0">{item.label}</span>
              <div className="flex-1 bg-white/50 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${item.color}`}
                  style={{ width: `${itemPct}%` }}
                />
              </div>
              <span className="text-xs font-semibold text-violet-700 w-10 text-right">
                {item.score}/{item.max}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
