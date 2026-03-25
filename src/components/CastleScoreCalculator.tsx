"use client";

import { useState } from "react";

const lifestyleOptions = [
  { id: "early_bird", label: "Early Bird 🌅", desc: "6-8 AM" },
  { id: "night_owl", label: "Night Owl 🦉", desc: "10 PM-2 AM" },
  { id: "fit", label: "Fitness Enthusiast 🏋️", desc: "Daily workout" },
  { id: "homebody", label: "Homebody 🏠", desc: "Loves staying in" },
  { id: "social", label: "Social Butterfly 🦋", desc: "Always out" },
  { id: "studious", label: "Studious 📚", desc: "Quiet & focused" },
];

const budgetOptions = [
  { id: "low", label: "Under ₹10K", range: "< 10000", score: 80 },
  { id: "mid", label: "₹10K - ₹15K", range: "10000-15000", score: 60 },
  { id: "high", label: "₹15K - ₹20K", range: "15000-20000", score: 40 },
  { id: "luxury", label: "₹20K+", range: "> 20000", score: 20 },
];

const areaOptions = [
  { id: "it_hub", label: "IT Hub Areas", areas: ["Bellandur", "HSR Layout", "Whitefield", "Electronic City"], score: 90 },
  { id: "central", label: "Central Bangalore", areas: ["Koramangala", "Indiranagar"], score: 85 },
  { id: "south", label: "South Bangalore", areas: ["Jayanagar", "JP Nagar", "Banashankari"], score: 75 },
  { id: "north", label: "North Bangalore", areas: ["Kalyan Nagar", "Hebbal", "Yelahanka"], score: 70 },
];

export default function CastleScoreCalculator() {
  const [step, setStep] = useState(0);
  const [lifestyle, setLifestyle] = useState("");
  const [budget, setBudget] = useState("");
  const [area, setArea] = useState("");
  const [result, setResult] = useState<number | null>(null);

  const handleComplete = () => {
    let score = 50;
    const budgetScore = budgetOptions.find(b => b.id === budget)?.score || 50;
    const areaScore = areaOptions.find(a => a.id === area)?.score || 50;
    score = Math.round((budgetScore + areaScore) / 2);
    if (lifestyle === "fit") score += 10;
    if (lifestyle === "studious") score += 5;
    setResult(Math.min(100, score));
  };

  const reset = () => {
    setStep(0);
    setLifestyle("");
    setBudget("");
    setArea("");
    setResult(null);
  };

  if (result !== null) {
    const tier = result >= 90 ? { label: "Castle Platinum", emoji: "🥇", color: "text-slate-700 bg-slate-50 border-slate-200" }
      : result >= 80 ? { label: "Castle Gold", emoji: "🥈", color: "text-amber-700 bg-amber-50 border-amber-200" }
      : result >= 70 ? { label: "Castle Silver", emoji: "🥉", color: "text-[#555] bg-[#F5F0E8] border-black/8" }
      : { label: "Castle Bronze", emoji: "🏅", color: "text-orange-700 bg-orange-50 border-orange-200" };

    return (
      <div className="bg-[#FFFDF9] border border-black/5 rounded-2xl p-6 text-center shadow-sm">
        <div className="text-5xl mb-3">{tier.emoji}</div>
        <p className="text-5xl font-bold text-black mb-2">{result}</p>
        <p className="text-sm text-[#888] mb-4">Your Castle Score</p>
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border ${tier.color} mb-4`}>
          <span>{tier.emoji}</span>
          <span>{tier.label}</span>
        </div>
        <p className="text-xs text-[#888] mb-6">
          Based on your lifestyle, budget, and preferred area, we recommend PGs in our{" "}
          <Link href={`/?area=${areaOptions.find(a => a.id === area)?.areas[0]}`} className="font-semibold underline">
            {areaOptions.find(a => a.id === area)?.areas[0]}
          </Link>{" "}
          area.
        </p>
        <button
          onClick={reset}
          className="px-6 py-3 bg-[#1a1a1a] text-white rounded-xl font-semibold text-sm hover:opacity-80 transition-opacity"
        >
          Calculate Again
        </button>
      </div>
    );
  }

  const questions = [
    {
      q: "What's your lifestyle?",
      options: lifestyleOptions,
      value: lifestyle,
      setValue: setLifestyle,
    },
    {
      q: "What's your monthly budget?",
      options: budgetOptions,
      value: budget,
      setValue: setBudget,
    },
    {
      q: "Which area do you prefer?",
      options: areaOptions,
      value: area,
      setValue: setArea,
    },
  ];

  const currentQ = questions[step];
  const progress = ((step + 1) / questions.length) * 100;

  return (
    <div className="bg-[#FFFDF9] border border-black/5 rounded-2xl overflow-hidden shadow-sm">
      <div className="bg-[#F5F0E8] px-5 py-4 border-b border-black/5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-[#666]">Question {step + 1} of {questions.length}</span>
          <button onClick={reset} className="text-xs text-[#999] hover:text-[#666]">Reset</button>
        </div>
        <div className="w-full bg-[#d4c9a8] rounded-full h-2">
          <div className="h-2 rounded-full bg-[#1a1a1a] transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="p-5">
        <h3 className="text-lg font-bold text-black mb-4">{currentQ.q}</h3>
        <div className="space-y-2">
          {currentQ.options.map(opt => (
            <button
              key={opt.id}
              onClick={() => {
                currentQ.setValue(opt.id);
                if (step < questions.length - 1) {
                  setTimeout(() => setStep(step + 1), 300);
                } else {
                  setTimeout(handleComplete, 300);
                }
              }}
              className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                currentQ.value === opt.id
                  ? "border-black bg-[#F5F0E8]"
                  : "border-black/5 bg-[#FFFDF9] hover:border-black/8"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[#1a1a1a] text-sm">{opt.label}</span>
                {"desc" in opt && <span className="text-xs text-[#999]">{opt.desc}</span>}
                {"range" in opt && <span className="text-xs text-[#999]">{opt.range}</span>}
                {"areas" in opt && <span className="text-xs text-[#999]">{opt.areas.slice(0, 2).join(", ")}</span>}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
