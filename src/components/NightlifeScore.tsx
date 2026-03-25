"use client";

interface NightlifeScoreProps {
  area: string;
}

const nightlifeScores: Record<string, { score: number; label: string; cafes: number; bars: number; lateNight: boolean }> = {
  "Koramangala": { score: 92, label: "Very High", cafes: 150, bars: 40, lateNight: true },
  "Indiranagar": { score: 88, label: "Very High", cafes: 120, bars: 35, lateNight: true },
  "Whitefield": { score: 72, label: "Moderate", cafes: 60, bars: 15, lateNight: false },
  "HSR Layout": { score: 65, label: "Moderate", cafes: 45, bars: 10, lateNight: false },
  "Bellandur": { score: 70, label: "Moderate", cafes: 55, bars: 12, lateNight: false },
  "Marathahalli": { score: 68, label: "Moderate", cafes: 50, bars: 10, lateNight: false },
  "BTM Layout": { score: 58, label: "Low", cafes: 30, bars: 5, lateNight: false },
  "Electronic City": { score: 40, label: "Low", cafes: 20, bars: 3, lateNight: false },
  "JP Nagar": { score: 62, label: "Moderate", cafes: 40, bars: 8, lateNight: false },
  "Jayanagar": { score: 60, label: "Low", cafes: 35, bars: 6, lateNight: false },
  "Kalyan Nagar": { score: 70, label: "Moderate", cafes: 50, bars: 12, lateNight: false },
  "Hebbal": { score: 45, label: "Low", cafes: 15, bars: 3, lateNight: false },
};

export default function NightlifeScore({ area }: NightlifeScoreProps) {
  const data = nightlifeScores[area];
  if (!data) return null;

  const scoreColor = data.score >= 80 ? "text-violet-600 bg-violet-50" 
    : data.score >= 60 ? "text-blue-600 bg-blue-50"
    : "text-gray-600 bg-gray-50";

  return (
    <div className="bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-100 rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-bold text-violet-900 flex items-center gap-2">
          <span>🌙</span> Nightlife Score
        </h4>
        <span className={`text-xs font-bold px-2 py-1 rounded-lg ${scoreColor}`}>
          {data.label}
        </span>
      </div>

      <div className="flex items-center gap-3 mb-3">
        <span className="text-3xl font-bold text-violet-700">{data.score}</span>
        <span className="text-xs text-violet-600">/100</span>
        <div className="flex-1">
          <div className="w-full bg-white/60 rounded-full h-2">
            <div className="h-2 rounded-full bg-gradient-to-r from-violet-400 to-purple-500" style={{ width: `${data.score}%` }} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="flex items-center gap-1.5 text-xs text-violet-700">
          <span>☕</span>
          <span>{data.cafes} Cafes</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-violet-700">
          <span>🍺</span>
          <span>{data.bars} Bars</span>
        </div>
        {data.lateNight && (
          <div className="col-span-2 text-xs text-violet-600 font-semibold">
            ✨ Late-night options available
          </div>
        )}
      </div>
    </div>
  );
}
