"use client";

interface OwnerStatsProps {
  totalListings?: number;
  avgRating?: number;
  avgResponseTime?: number;
  memberSince?: string;
  verified?: boolean;
}

function getResponseLabel(minutes: number): { label: string; color: string } {
  if (minutes <= 15) return { label: "⚡ Within minutes", color: "text-emerald-600 bg-emerald-50" };
  if (minutes <= 60) return { label: "✓ Within an hour", color: "text-blue-600 bg-blue-50" };
  if (minutes <= 240) return { label: "🕐 Same day", color: "text-amber-600 bg-amber-50" };
  return { label: "🐌 Takes time", color: "text-gray-600 bg-gray-50" };
}

export default function OwnerStats({ totalListings = 1, avgRating = 4.0, avgResponseTime = 45, memberSince, verified = true }: OwnerStatsProps) {
  const response = getResponseLabel(avgResponseTime);
  const years = memberSince ? Math.floor((Date.now() - new Date(memberSince).getTime()) / (1000 * 60 * 60 * 24 * 365)) : null;

  return (
    <div className="bg-gradient-to-br from-violet-50 to-indigo-50 border border-violet-100 rounded-2xl p-5">
      <h3 className="text-sm font-bold text-violet-900 mb-4 flex items-center gap-2">
        <span className="text-lg">🏰</span> Owner Stats
      </h3>

      <div className="grid grid-cols-2 gap-3">
        {/* Total Listings */}
        <div className="text-center p-3 bg-white/70 rounded-xl">
          <p className="text-2xl font-bold text-violet-700">{totalListings}</p>
          <p className="text-[10px] text-violet-500">PG{totalListings !== 1 ? "s" : ""} Listed</p>
        </div>

        {/* Avg Rating */}
        <div className="text-center p-3 bg-white/70 rounded-xl">
          <p className="text-2xl font-bold text-amber-600">⭐ {avgRating}</p>
          <p className="text-[10px] text-amber-500">Avg Rating</p>
        </div>

        {/* Response Time */}
        <div className="text-center p-3 bg-white/70 rounded-xl col-span-2">
          <p className={`text-sm font-bold ${response.color.split(" ")[1]} px-3 py-1 rounded-xl inline-block`}>
            {response.label}
          </p>
          <p className="text-[10px] text-violet-500 mt-1">Avg Response Time</p>
        </div>

        {/* Verified */}
        {verified && (
          <div className="text-center p-3 bg-emerald-50 rounded-xl col-span-2">
            <p className="text-sm font-bold text-emerald-700">✓ Verified Owner</p>
            {years !== null && years > 0 && (
              <p className="text-[10px] text-emerald-500">On Castle for {years} {years === 1 ? "year" : "years"}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
