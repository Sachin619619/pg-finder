"use client";

interface AmenityBreakdownProps {
  price: number;
  amenities: string[];
  foodIncluded: boolean;
  furnished: boolean;
  area: string;
}

const amenityValues: Record<string, number> = {
  "WiFi": 500,
  "AC": 2500,
  "Food": 3000,
  "Laundry": 800,
  "Parking": 500,
  "Gym": 800,
  "Power Backup": 400,
  "CCTV": 300,
  "Hot Water": 400,
  "TV": 300,
  "Fridge": 400,
  "Washing Machine": 600,
  "Housekeeping": 1000,
  "Security": 400,
};

const amenityEmojis: Record<string, string> = {
  "WiFi": "📶", "AC": "❄️", "Food": "🍽️", "Laundry": "🧺",
  "Parking": "🅿️", "Gym": "🏋️", "Power Backup": "⚡", "CCTV": "📹",
  "Hot Water": "🚿", "TV": "📺", "Fridge": "🧊", "Washing Machine": "🧼",
  "Housekeeping": "🧹", "Security": "🔒",
};

export default function AmenityBreakdown({ price, amenities, foodIncluded, furnished, area }: AmenityBreakdownProps) {
  const included = amenities.map(a => ({
    name: a,
    emoji: amenityEmojis[a] || "•",
    value: amenityValues[a] || 200,
  }));

  const totalAmenityValue = included.reduce((sum, a) => sum + a.value, 0);
  const baseRent = Math.max(0, price - totalAmenityValue);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
        <span className="text-lg">📊</span> Price Breakdown
      </h3>
      <p className="text-xs text-gray-500 mb-4">See what your ₹{price.toLocaleString()}/month gets you</p>

      {/* Base rent */}
      <div className="flex items-center justify-between py-2 border-b border-gray-50">
        <span className="text-sm text-gray-600">🏠 Base Rent</span>
        <span className="text-sm font-semibold text-gray-900">₹{baseRent.toLocaleString()}</span>
      </div>

      {/* Amenity breakdown */}
      {included.length > 0 && included.map(a => (
        <div key={a.name} className="flex items-center justify-between py-2 border-b border-gray-50">
          <span className="text-sm text-gray-600 flex items-center gap-2">
            <span>{a.emoji}</span> {a.name}
          </span>
          <span className="text-sm font-semibold text-emerald-600">+₹{a.value.toLocaleString()}</span>
        </div>
      ))}

      {/* Total */}
      <div className="flex items-center justify-between py-3 bg-gray-50 -mx-5 px-5 mt-2 rounded-b-2xl">
        <span className="text-sm font-bold text-gray-900">Total Monthly Rent</span>
        <span className="text-lg font-bold text-[#1a1a1a]">₹{price.toLocaleString()}</span>
      </div>

      {/* Tip */}
      <p className="text-xs text-gray-400 mt-3">
        💡 Individual amenity values are estimates based on market rates. Actual value may vary.
      </p>
    </div>
  );
}
