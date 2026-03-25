"use client";

import { areaSafetyScores } from "@/data/safetyData";

interface SafetyScoreProps {
  area: string;
  compact?: boolean;
}

function getScoreColor(score: number): string {
  if (score >= 80) return { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", icon: "🛡️" };
  if (score >= 70) return { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700", icon: "✓" };
  return { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", icon: "○" };
}

export default function SafetyScore({ area, compact = false }: SafetyScoreProps) {
  const safety = areaSafetyScores[area];
  if (!safety) return null;

  const colors = getScoreColor(safety.score);

  if (compact) {
    return (
      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${colors.bg} ${colors.border} border ${colors.text}`}>
        <span>{colors.icon}</span>
        <span>{safety.score}/100</span>
      </div>
    );
  }

  return (
    <div className={`rounded-2xl p-4 ${colors.bg} border ${colors.border}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{colors.icon}</span>
          <div>
            <p className={`text-sm font-bold ${colors.text}`}>Safety Score</p>
            <p className={`text-xs ${colors.text} opacity-70`}>{safety.label}</p>
          </div>
        </div>
        <div className={`text-3xl font-bold ${colors.text}`}>{safety.score}<span className="text-lg opacity-60">/100</span></div>
      </div>
      <div className="w-full bg-white/60 rounded-full h-2 mb-3">
        <div
          className={`h-2 rounded-full transition-all duration-700 ${colors.text.replace("text-", "bg-")}`}
          style={{ width: `${safety.score}%` }}
        />
      </div>
      <div className="flex flex-wrap gap-1.5">
        {safety.notes.map((note) => (
          <span key={note} className={`text-[11px] px-2 py-0.5 rounded-full ${colors.text} bg-white/50`}>
            {note}
          </span>
        ))}
      </div>
    </div>
  );
}
