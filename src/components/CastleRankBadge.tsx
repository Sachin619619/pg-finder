"use client";

interface CastleRankBadgeProps {
  rank?: number; // 1-10
  tier: "platinum" | "gold" | "silver" | "bronze";
  label: string;
}

const tierConfig = {
  platinum: {
    bg: "bg-gradient-to-br from-slate-800 to-slate-900",
    border: "border-slate-600",
    text: "text-white",
    icon: "🥇",
    label: "Castle Platinum",
  },
  gold: {
    bg: "bg-gradient-to-br from-amber-400 to-amber-600",
    border: "border-amber-500",
    text: "text-white",
    icon: "🥈",
    label: "Castle Gold",
  },
  silver: {
    bg: "bg-gradient-to-br from-gray-300 to-gray-500",
    border: "border-gray-400",
    text: "text-white",
    icon: "🥉",
    label: "Castle Silver",
  },
  bronze: {
    bg: "bg-gradient-to-br from-orange-400 to-orange-600",
    border: "border-orange-500",
    text: "text-white",
    icon: "🏅",
    label: "Castle Bronze",
  },
};

export default function CastleRankBadge({ rank, tier, label }: CastleRankBadgeProps) {
  const config = tierConfig[tier];
  
  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border-2 ${config.bg} ${config.border} ${config.text}`}>
      <span className="text-base">{config.icon}</span>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider opacity-80">{config.label}</p>
        {rank && <p className="text-xs font-bold">#{rank} in {label}</p>}
      </div>
    </div>
  );
}
