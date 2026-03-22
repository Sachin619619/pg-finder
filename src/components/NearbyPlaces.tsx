"use client";

const nearbyCategories = [
  {
    icon: "M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z",
    label: "Grocery & Essentials",
    items: ["BigBasket Delivery", "D-Mart", "More Supermarket", "Local Kirana Store"],
    color: "emerald",
  },
  {
    icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
    label: "Cafes & Restaurants",
    items: ["Third Wave Coffee", "Starbucks", "Truffles", "Meghana Foods"],
    color: "orange",
  },
  {
    icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4",
    label: "Hospitals & Clinics",
    items: ["Apollo Clinic", "Manipal Hospital", "Fortis Hospital", "Local Pharmacy"],
    color: "red",
  },
  {
    icon: "M13 10V3L4 14h7v7l9-11h-7z",
    label: "Fitness & Sports",
    items: ["Cult.fit", "Gold's Gym", "Yoga Studio", "Sports Ground"],
    color: "blue",
  },
  {
    icon: "M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z",
    label: "Banks & ATMs",
    items: ["SBI ATM", "HDFC Bank", "ICICI Bank", "Axis Bank"],
    color: "amber",
  },
  {
    icon: "M12 19l9 2-9-18-9 18 9-2zm0 0v-8",
    label: "Transport",
    items: ["Metro Station", "BMTC Bus Stop", "Ola/Uber Pickup", "Auto Stand"],
    color: "violet",
  },
];

const colorMap: Record<string, string> = {
  emerald: "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400",
  orange: "bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400",
  red: "bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400",
  blue: "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
  amber: "bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400",
  violet: "bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400",
};

export default function NearbyPlaces({ area }: { area: string }) {
  return (
    <div className="premium-card !rounded-2xl p-6 sm:p-8">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Nearby in {area}</h2>
      <p className="text-sm text-gray-400 mb-6">Essential places around this PG</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {nearbyCategories.map((cat) => (
          <div key={cat.label} className="flex gap-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${colorMap[cat.color]}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={cat.icon} />
              </svg>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">{cat.label}</h4>
              <div className="flex flex-wrap gap-1.5">
                {cat.items.map((item) => (
                  <span key={item} className="text-[11px] text-gray-500 bg-gray-50 dark:bg-gray-800 px-2 py-0.5 rounded-md">{item}</span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
