"use client";

export default function CastleProBadge({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizeClass = size === "sm" ? "text-[10px] px-2 py-0.5" : size === "lg" ? "text-sm px-4 py-1.5" : "text-xs px-3 py-1";
  return (
    <div className={`inline-flex items-center gap-1 bg-gradient-to-r from-amber-400 to-orange-400 text-white rounded-full font-bold ${sizeClass} shadow-sm`}>
      <span className="text-[0.7em]">🏰</span>
      <span className="tracking-wide">Castle Pro</span>
    </div>
  );
}
