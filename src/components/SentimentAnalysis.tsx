"use client";

import { useMemo } from "react";
import type { Review } from "@/lib/db";

interface SentimentAnalysisProps {
  reviews: Review[];
}

// Simple keyword-based sentiment analysis
function analyzeSentiment(comment: string): { positive: number; neutral: number; negative: number } {
  const text = comment.toLowerCase();
  
  const positiveKeywords = [
    "amazing", "awesome", "best", "clean", "excellent", "fantastic", "friendly",
    "good", "great", "happy", "helpful", "loved", "nice", "perfect", "pleasant",
    "recommended", "responsive", "spacious", "stylish", "super", "thank", "top",
    "wonderful", "comfortable", "cozy", "beautiful", "value", "quality", "prompt",
    "professional", "supportive", "homely", "quiet", "peaceful", "convenient"
  ];
  
  const negativeKeywords = [
    "bad", "broken", "complaint", "dirty", "disappointing", "expensive", "far",
    "horrible", "issue", "leak", "loud", "maintenance", "neglected", "noise",
    "noisy", "not good", "overpriced", "poor", "problem", "rude", "slow",
    "terrible", "uncomfortable", "unhygienic", "unresponsive", "worst", "scam",
    "mould", "pest", "insect", "cockroach", "rodent", "theft", "unsafe"
  ];

  let positive = 0, negative = 0;
  
  for (const kw of positiveKeywords) {
    if (text.includes(kw)) positive++;
  }
  for (const kw of negativeKeywords) {
    if (text.includes(kw)) negative++;
  }
  
  const total = positive + negative;
  if (total === 0) return { positive: 0.5, neutral: 0.5, negative: 0 };
  
  return {
    positive: positive / total,
    neutral: 0,
    negative: negative / total,
  };
}

function getSentimentLabel(pos: number, neg: number): { label: string; emoji: string; color: string } {
  const ratio = pos / (pos + neg || 1);
  if (ratio >= 0.75) return { label: "Very Positive", emoji: "😄", color: "text-emerald-600 bg-emerald-50" };
  if (ratio >= 0.55) return { label: "Positive", emoji: "🙂", color: "text-green-600 bg-green-50" };
  if (ratio >= 0.45) return { label: "Mixed", emoji: "😐", color: "text-amber-600 bg-amber-50" };
  if (ratio >= 0.25) return { label: "Negative", emoji: "😕", color: "text-orange-600 bg-orange-50" };
  return { label: "Very Negative", emoji: "😞", color: "text-red-600 bg-red-50" };
}

function getAspectSentiment(reviews: Review[]): Record<string, { pos: number; neg: number; count: number }> {
  const aspects: Record<string, { pos: number; neg: number; count: number }> = {
    "Cleanliness": { pos: 0, neg: 0, count: 0 },
    "Value for Money": { pos: 0, neg: 0, count: 0 },
    "Location": { pos: 0, neg: 0, count: 0 },
    "Staff/Owner": { pos: 0, neg: 0, count: 0 },
    "Food": { pos: 0, neg: 0, count: 0 },
    "Amenities": { pos: 0, neg: 0, count: 0 },
    "Safety": { pos: 0, neg: 0, count: 0 },
    "Noise": { pos: 0, neg: 0, count: 0 },
  };

  const aspectKeywords: Record<string, string[]> = {
    "Cleanliness": ["clean", "hygiene", "dirty", "tidy", "sanitary", "dust", "maintenance"],
    "Value for Money": ["value", "price", "expensive", "cheap", "worth", "affordable", "overpriced", "money"],
    "Location": ["location", "area", "nearby", "neighborhood", "distance", "commute", "far"],
    "Staff/Owner": ["owner", "staff", "manager", "responsive", "rude", "helpful", "friendly", "supportive"],
    "Food": ["food", "meal", "breakfast", "dinner", "lunch", "cooking", "kitchen"],
    "Amenities": ["wifi", "ac", "fan", "water", "power", "amenities", "facility", "furnished"],
    "Safety": ["safe", "security", "lock", "gate", "cctv", "guard", "unsafe"],
    "Noise": ["noise", "loud", "quiet", "peaceful", " disturbance", "sound"],
  };

  for (const review of reviews) {
    const text = review.comment.toLowerCase();
    for (const [aspect, keywords] of Object.entries(aspectKeywords)) {
      const hasPos = keywords.slice(0, 3).some(k => text.includes(k) && !["dirty", "expensive", "far", "rude", "loud"].includes(k));
      const hasNeg = keywords.slice(3).some(k => text.includes(k));
      if (hasPos || hasNeg) {
        aspects[aspect].count++;
        if (hasPos) aspects[aspect].pos++;
        if (hasNeg) aspects[aspect].neg++;
      }
    }
  }

  return aspects;
}

export default function SentimentAnalysis({ reviews }: SentimentAnalysisProps) {
  const overall = useMemo(() => {
    let totalPos = 0, totalNeg = 0;
    for (const r of reviews) {
      const s = analyzeSentiment(r.comment);
      totalPos += s.positive;
      totalNeg += s.negative;
    }
    return { pos: totalPos, neg: totalNeg };
  }, [reviews]);

  const overallLabel = getSentimentLabel(overall.pos, overall.neg);
  const aspects = getAspectSentiment(reviews);

  const wordCount = reviews.reduce((sum, r) => sum + r.comment.split(" ").length, 0);
  const avgWords = reviews.length > 0 ? Math.round(wordCount / reviews.length) : 0;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-base font-bold text-gray-900">Review Sentiment Analysis</h3>
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold ${overallLabel.color}`}>
          <span>{overallLabel.emoji}</span>
          <span>{overallLabel.label}</span>
        </div>
      </div>

      {/* Overall sentiment bar */}
      <div className="mb-5">
        <div className="flex h-3 rounded-full overflow-hidden bg-gray-100">
          {overall.pos + overall.neg > 0 && (
            <>
              <div
                className="bg-emerald-400 transition-all duration-500"
                style={{ width: `${(overall.pos / (overall.pos + overall.neg)) * 100}%` }}
              />
              <div
                className="bg-red-400 transition-all duration-500"
                style={{ width: `${(overall.neg / (overall.pos + overall.neg)) * 100}%` }}
              />
            </>
          )}
        </div>
        <div className="flex justify-between mt-1.5 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
            Positive ({reviews.length > 0 ? Math.round((overall.pos / (overall.pos + overall.neg || 1)) * 100) : 0}%)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-400 inline-block" />
            Negative ({reviews.length > 0 ? Math.round((overall.neg / (overall.pos + overall.neg || 1)) * 100) : 0}%)
          </span>
        </div>
      </div>

      {/* Review stats */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="bg-gray-50 rounded-xl p-3 text-center">
          <p className="text-xl font-bold text-gray-900">{reviews.length}</p>
          <p className="text-xs text-gray-500">Reviews</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-3 text-center">
          <p className="text-xl font-bold text-gray-900">{avgWords}</p>
          <p className="text-xs text-gray-500">Avg Words</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-3 text-center">
          <p className="text-xl font-bold text-gray-900">{reviews.filter(r => r.verified).length}</p>
          <p className="text-xs text-gray-500">Verified</p>
        </div>
      </div>

      {/* Aspect breakdown */}
      <div className="space-y-2.5">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Aspect Breakdown</p>
        {Object.entries(aspects).filter(([, v]) => v.count > 0).map(([aspect, data]) => {
          const total = data.pos + data.neg || 1;
          const pct = Math.round((data.pos / total) * 100);
          return (
            <div key={aspect} className="flex items-center gap-3">
              <span className="text-xs text-gray-600 w-28 shrink-0 truncate">{aspect}</span>
              <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-2 rounded-full transition-all ${pct >= 70 ? "bg-emerald-400" : pct >= 50 ? "bg-amber-400" : "bg-red-400"}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="text-xs font-semibold text-gray-500 w-10 text-right">{pct}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
