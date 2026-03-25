"use client";

interface NearbyEssentialsProps {
  area: string;
}

const essentials: Record<string, { type: string; name: string; distance: string; rating?: string }[]> = {
  "Kalyan Nagar": [
    { type: "supermarket", name: "More Supermarket", distance: "0.5 km", rating: "4.2" },
    { type: "hospital", name: "Curewell Hospital", distance: "1.2 km", rating: "4.5" },
    { type: "gym", name: "Gold's Gym", distance: "0.8 km", rating: "4.1" },
    { type: "atm", name: "HDFC ATM", distance: "0.3 km" },
    { type: "cafe", name: "Third Wave Coffee", distance: "0.6 km", rating: "4.3" },
    { type: "pharmacy", name: "Medplus Pharmacy", distance: "0.4 km", rating: "4.0" },
  ],
  "Bellandur": [
    { type: "supermarket", name: "Star Hypermarket", distance: "0.8 km", rating: "4.0" },
    { type: "hospital", name: "Columbia Asia Hospital", distance: "2.1 km", rating: "4.4" },
    { type: "gym", name: "Fitness First", distance: "1.0 km", rating: "4.2" },
    { type: "cafe", name: "Starbucks", distance: "0.5 km", rating: "4.3" },
    { type: "pharmacy", name: "Apollo Pharmacy", distance: "0.3 km", rating: "4.1" },
  ],
  "Koramangala": [
    { type: "supermarket", name: "Foodhall", distance: "0.7 km", rating: "4.5" },
    { type: "hospital", name: "St. Philomena's Hospital", distance: "1.5 km", rating: "4.3" },
    { type: "gym", name: "Fitso", distance: "0.4 km", rating: "4.4" },
    { type: "cafe", name: "Matteo Coffea", distance: "0.3 km", rating: "4.6" },
    { type: "pharmacy", name: "Medlife Pharmacy", distance: "0.5 km", rating: "4.0" },
    { type: "atm", name: "ICICI ATM", distance: "0.2 km" },
  ],
};

const typeIcons: Record<string, { emoji: string; color: string }> = {
  supermarket: { emoji: "🛒", color: "bg-amber-50 border-amber-200 text-amber-700" },
  hospital: { emoji: "🏥", color: "bg-red-50 border-red-200 text-red-700" },
  gym: { emoji: "🏋️", color: "bg-blue-50 border-blue-200 text-blue-700" },
  cafe: { emoji: "☕", color: "bg-orange-50 border-orange-200 text-orange-700" },
  pharmacy: { emoji: "💊", color: "bg-green-50 border-green-200 text-green-700" },
  atm: { emoji: "🏧", color: "bg-violet-50 border-violet-200 text-violet-700" },
  park: { emoji: "🌳", color: "bg-emerald-50 border-emerald-200 text-emerald-700" },
  metro: { emoji: "🚇", color: "bg-cyan-50 border-cyan-200 text-cyan-700" },
  school: { emoji: "🏫", color: "bg-pink-50 border-pink-200 text-pink-700" },
};

export default function NearbyEssentials({ area }: NearbyEssentialsProps) {
  const nearby = essentials[area] || essentials["Kalyan Nagar"];
  const categories = ["supermarket", "hospital", "gym", "cafe", "pharmacy", "atm"] as const;
  
  const byCategory = categories
    .map(cat => nearby.filter(n => n.type === cat))
    .filter(arr => arr.length > 0);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
        <span className="text-lg">🗺️</span> What&apos;s Nearby
      </h3>
      <p className="text-xs text-gray-500 mb-4">Essential places in the neighborhood</p>

      <div className="space-y-3">
        {byCategory.map(items => {
          const first = items[0];
          const icon = typeIcons[first.type] || { emoji: "📍", color: "bg-gray-50 border-gray-200 text-gray-700" };
          
          return (
            <div key={first.type} className="flex items-start gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0 border ${icon.color}`}>
                {icon.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-700 capitalize">{first.type}s</p>
                {items.map(item => (
                  <div key={item.name} className="flex items-center justify-between mt-0.5">
                    <span className="text-xs text-gray-500 truncate">{item.name}</span>
                    <span className="text-[10px] text-gray-400 shrink-0 ml-2">{item.distance}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-gray-400 mt-4 pt-3 border-t border-gray-100">
        💡 Distances are approximate. Actual distances may vary based on exact location.
      </p>
    </div>
  );
}
