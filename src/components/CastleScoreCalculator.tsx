"use client";

import { useState } from "react";
import Link from "next/link";

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
      : result >= 70 ? { label: "Castle Silver", emoji: "🥉", color: "text-[#555] bg-[#F0EADD] border-black/8" }
      : { label: "Castle Bronze", emoji: "🏅", color: "text-orange-700 bg-orange-50 border-orange-200" };

    return (
      <div className="bg-[#FFFDF9] border border-black/[0.06] rounded-3xl p-8 text-center shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
        <div className="text-5xl mb-4">{tier.emoji}</div>
        <p className="font-serif text-5xl text-[#1B5E3B] mb-2">{result}</p>
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
    <div className="bg-[#FFFDF9] border border-black/[0.06] rounded-3xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
      <div className="bg-[#F0EADD] px-6 py-5 border-b border-black/5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-[#1B5E3B]/70 uppercase tracking-wider">Step {step + 1} of {questions.length} — Let&apos;s find your match!</span>
          <button onClick={reset} className="text-xs text-[#999] hover:text-[#666] transition-colors">Start over</button>
        </div>
        <div className="w-full bg-[#d4c9a8] rounded-full h-2.5">
          <div className="h-2.5 rounded-full bg-[#1B5E3B] transition-all duration-500 ease-out" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="p-6">
        <h3 className="font-serif text-xl text-black mb-5">{currentQ.q}</h3>
        <div className="space-y-2.5">
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
              className={`w-full text-left p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                currentQ.value === opt.id
                  ? "border-[#1B5E3B] bg-[#1B5E3B]/5"
                  : "border-black/5 bg-[#FFFDF9] hover:border-[#1B5E3B]/40 hover:bg-[#1B5E3B]/5"
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
