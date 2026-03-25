"use client";

import { useState } from "react";
import Link from "next/link";
import type { PGListing } from "@/data/listings";

interface AIMatchSectionProps {
  listings: PGListing[];
}

const lifestyleQuestions = [
  { id: "budget", question: "What's your monthly budget?", options: ["Under ₹8,000", "₹8,000 - ₹12,000", "₹12,000 - ₹18,000", "₹18,000+"], icon: "💰" },
  { id: "location", question: "Which area do you prefer?", options: ["Near IT Hub (Whitefield, Bellandur)", "Central (Koramangala, Indiranagar)", "South (Jayanagar, JP Nagar)", "North (Kalyan Nagar, Hebbal)"], icon: "📍" },
  { id: "lifestyle", question: "How would you describe your lifestyle?", options: ["Early to bed, early to rise", "Night owl, love nightlife", "Fitness focused", "Homebody / Study"], icon: "🌙" },
  { id: "food", question: "Do you need food included?", options: ["Yes, always", "No, I'll cook", "Sometimes is fine"], icon: "🍽️" },
  { id: "roommates", question: "Preferred roommate gender?", options: ["Male only", "Female only", "Mixed", "No preference"], icon: "👥" },
];

function getMatchedPGs(listings: PGListing[], answers: Record<string, string>): PGListing[] {
  // Simple matching algorithm
  const matched = listings.map(pg => {
    let score = 50;
    
    // Budget matching
    if (answers.budget === "Under ₹8,000" && pg.price <= 8000) score += 20;
    else if (answers.budget === "₹8,000 - ₹12,000" && pg.price <= 12000) score += 20;
    else if (answers.budget === "₹12,000 - ₹18,000" && pg.price <= 18000) score += 20;
    else if (answers.budget === "₹18,000+" && pg.price >= 18000) score += 20;
    else if (answers.budget) score += Math.max(0, 20 - Math.abs(pg.price - 10000) / 500);
    
    // Food matching
    if (answers.food === "Yes, always" && pg.foodIncluded) score += 15;
    else if (answers.food === "No, I'll cook" && !pg.foodIncluded) score += 15;
    
    // Area matching
    if (answers.location?.includes("IT Hub") && ["Bellandur", "Electronic City", "Whitefield", "Marathahalli", "HSR Layout"].includes(pg.area)) score += 15;
    if (answers.location?.includes("Central") && ["Koramangala", "Indiranagar", "HSR Layout"].includes(pg.area)) score += 15;
    if (answers.location?.includes("South") && ["Jayanagar", "JP Nagar", "Banashankari", "Rajajinagar"].includes(pg.area)) score += 15;
    if (answers.location?.includes("North") && ["Kalyan Nagar", "Hebbal", "HRBR Layout"].includes(pg.area)) score += 15;
    
    // Rating bonus
    if (pg.rating >= 4.5) score += 10;
    else if (pg.rating >= 4.0) score += 5;
    
    return { pg, score };
  });

  return matched.sort((a, b) => b.score - a.score).slice(0, 3).map(m => m.pg);
}

export default function AIMatchSection({ listings }: AIMatchSectionProps) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [matched, setMatched] = useState<PGListing[] | null>(null);

  const currentQ = lifestyleQuestions[step];
  const progress = ((step + 1) / lifestyleQuestions.length) * 100;

  const handleAnswer = (answer: string) => {
    const next = { ...answers, [currentQ.id]: answer };
    setAnswers(next);
    
    if (step < lifestyleQuestions.length - 1) {
      setStep(step + 1);
    } else {
      const results = getMatchedPGs(listings, next);
      setMatched(results);
    }
  };

  const reset = () => {
    setStep(0);
    setAnswers({});
    setMatched(null);
  };

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <span className="text-xs font-semibold text-black/40 uppercase tracking-widest mb-3 inline-block">AI-Powered</span>
          <h2 className="font-serif text-3xl sm:text-4xl text-black mb-3 tracking-tight">Find Your Perfect PG Match</h2>
          <p className="text-black/50 max-w-md mx-auto text-sm">Answer 5 quick questions and our AI will find your best match</p>
        </div>

        <div className="bg-white rounded-2xl border border-black/5 shadow-sm overflow-hidden">
          {!matched ? (
            <>
              {/* Progress */}
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-black">Question {step + 1} of {lifestyleQuestions.length}</span>
                  <button onClick={reset} className="text-xs text-gray-400 hover:text-gray-600">Start Over</button>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-black transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* Question */}
              <div className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-3xl">{currentQ.icon}</span>
                  <h3 className="text-xl font-semibold text-gray-900">{currentQ.question}</h3>
                </div>

                <div className="space-y-3">
                  {currentQ.options.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => handleAnswer(opt)}
                      className="w-full text-left p-4 rounded-xl border border-gray-100 hover:border-black/20 hover:bg-gray-50 transition-all text-sm font-medium text-gray-700 group"
                    >
                      <span className="group-hover:ml-1 transition-all">{opt}</span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Results */}
              <div className="bg-black px-6 py-6">
                <h3 className="text-xl font-bold text-white mb-1">🎉 Your Top Matches</h3>
                <p className="text-white/70 text-sm">Based on your preferences, here are the best PGs for you</p>
              </div>

              <div className="p-6 space-y-4">
                {matched.map((pg, i) => (
                  <Link key={pg.id} href={`/listing/${pg.id}`} className="block group">
                    <div className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-black/10 hover:bg-gray-50 transition-all">
                      <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center text-white font-bold text-sm shrink-0">
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 text-sm group-hover:text-black transition-colors">{pg.name}</p>
                        <p className="text-xs text-gray-400">📍 {pg.area} • ⭐ {pg.rating} • ₹{pg.price.toLocaleString()}/mo</p>
                      </div>
                      <span className="text-xs text-violet-600 font-semibold group-hover:translate-x-1 transition-transform">View →</span>
                    </div>
                  </Link>
                ))}
              </div>

              <div className="px-6 pb-6">
                <button
                  onClick={reset}
                  className="w-full py-3 rounded-xl bg-gray-100 text-gray-700 text-sm font-semibold hover:bg-gray-200 transition"
                >
                  Start Over
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
