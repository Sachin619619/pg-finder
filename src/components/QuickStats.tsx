"use client";

interface QuickStatsProps {
  rating: number;
  reviews: number;
  price: number;
  furnished: boolean;
  foodIncluded: boolean;
  acAvailable: boolean;
}

export default function QuickStats({ rating, reviews, price, furnished, foodIncluded, acAvailable }: QuickStatsProps) {
  const stats = [
    { label: "Rating", value: `${rating} ⭐`, sub: `${reviews} reviews`, color: "text-amber-600" },
    { label: "Price", value: `₹${price.toLocaleString()}`, sub: "per month", color: "text-emerald-600" },
    { label: "Food", value: foodIncluded ? "Included ✓" : "Self", sub: foodIncluded ? "In rent" : "Optional", color: foodIncluded ? "text-emerald-600" : "text-gray-400" },
    { label: "AC", value: acAvailable ? "Available ✓" : "N/A", sub: acAvailable ? "Extra cost" : "Not available", color: acAvailable ? "text-blue-600" : "text-gray-400" },
  ];

  return (
    <div className="bg-gray-50 rounded-2xl border border-gray-200 p-4">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Quick Stats</p>
      <div className="grid grid-cols-2 gap-3">
        {stats.map(s => (
          <div key={s.label} className="text-center p-3 bg-white/70 rounded-xl">
            <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
            <p className="text-[10px] text-gray-400">{s.sub}</p>
          </div>
        ))}
      </div>
      <div className="mt-3 pt-3 border-t border-gray-200">
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold ${furnished ? "bg-violet-50 text-violet-700 border border-violet-200" : "bg-gray-50 text-gray-400 border border-gray-200"}`}>
            {furnished ? "✓" : "✗"} Furnished
          </span>
          <span className="text-xs text-gray-400">•</span>
          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold ${acAvailable ? "bg-blue-50 text-blue-700 border border-blue-200" : "bg-gray-50 text-gray-400 border border-gray-200"}`}>
            {acAvailable ? "✓" : "✗"} AC
          </span>
        </div>
      </div>
    </div>
  );
}
