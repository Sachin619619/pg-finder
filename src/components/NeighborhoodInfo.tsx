"use client";

import { areaSafetyScores, metroProximity, busConnectivity } from "@/data/safetyData";

interface NeighborhoodInfoProps {
  area: string;
  compact?: boolean;
}

const areaProsCons: Record<string, { pros: string[]; cons: string[]; highlights: string[] }> = {
  "Kalyan Nagar": {
    pros: ["Well-connected to city center", "Good metro connectivity", "Active residential community", "Good markets and shops nearby"],
    cons: ["Traffic congestion during peak hours", "Can get noisy near main roads"],
    highlights: ["Tech hub proximity", "Family-friendly area", "Good restaurants"],
  },
  "Bellandur": {
    pros: ["Major IT hub", "Close to tech parks", "Many dining options", "Growing area with new developments"],
    cons: ["Heavy traffic", "Air quality concerns", "Flood-prone in monsoon"],
    highlights: ["IT corridor", "Startups scene", "Lake area"],
  },
  "Koramangala": {
    pros: ["Premium locality", "Excellent nightlife", "Great cafes and restaurants", "Central location"],
    cons: ["High rental prices", "Traffic congestion", "Can be noisy in weekends"],
    highlights: ["Startup ecosystem", "Social hub", "Food paradise"],
  },
  "Indiranagar": {
    pros: ["Hip neighborhood", "Great cafes and bars", "Good connectivity", "Active community"],
    cons: ["Parking challenges", "Weekend crowds", "Higher cost of living"],
    highlights: ["Food & nightlife", "Boutiques", "Young professionals"],
  },
  "HSR Layout": {
    pros: ["Planned layout with wide roads", "Good IT connectivity", "Quiet residential area", "Parks and green spaces"],
    cons: ["Limited metro access", "Fewer dining options", "Can be far from central Bangalore"],
    highlights: ["Residential calm", "IT proximity", "Affordable"],
  },
  "Whitefield": {
    pros: ["Major IT corridor", "Many tech parks", "Good infrastructure", "International schools nearby"],
    cons: ["Traffic bottlenecks", "Rain flooding issues", "Developing public transport"],
    highlights: ["IT hub", "Growing suburb", "Tech parks"],
  },
  "Marathahalli": {
    pros: ["IT hub accessibility", "Many commercial centers", "Great shopping", "Good restaurants"],
    cons: ["Constant traffic jams", "Air pollution", "Crowded"],
    highlights: ["Commercial hub", "Shopping areas", "Connectivity"],
  },
  "BTM Layout": {
    pros: ["Budget-friendly area", "Student-friendly", "Good public transport", "Many PG options"],
    cons: ["Crowded", "Limited nightlife", "Basic amenities"],
    highlights: ["Student area", "Budget living", "Food streets"],
  },
  "Electronic City": {
    pros: ["Major IT hub", "Many tech companies", "Good roads", "Dedicated bus routes"],
    cons: ["Far from city center", "Limited recreational options", "Less green spaces"],
    highlights: ["Tech employment", "Dedicated bus lane", "Corporate campus life"],
  },
  "JP Nagar": {
    pros: ["Quiet residential area", "Good markets", "Well-connected", "Stable neighborhood"],
    cons: ["Older infrastructure", "Limited new developments", "Parking issues"],
    highlights: ["South Bangalore", "Residential charm", "Markets"],
  },
  "Jayanagar": {
    pros: ["Established neighborhood", "Wide roads", "Good markets", "Family-friendly"],
    cons: ["Older buildings", "Limited new constructions", "Can be expensive"],
    highlights: ["Traditional Bangalore", "Markets", "Stable community"],
  },
  "Hebbal": {
    pros: ["Near the lake", "Good roads", "Nice environment", "Airport connectivity"],
    cons: ["Limited metro", "Fewer dining options", "Can be isolated"],
    highlights: ["Lake views", "Airport access", "Peaceful"],
  },
  "Yelahanka": {
    pros: ["Near airport", "Quiet residential area", "Affordable", "Green surroundings"],
    cons: ["Far from IT hubs", "Limited public transport", "Fewer amenities"],
    highlights: ["Airport proximity", "Residential quiet", "Nature"],
  },
  "Banashankari": {
    pros: ["Established South Bangalore area", "Good markets", "Affordable", "Good bus connectivity"],
    cons: ["Far from IT hubs", "Crowded", "Traffic during peak"],
    highlights: ["Traditional area", "Markets", "Affordable living"],
  },
  "Rajajinagar": {
    pros: ["Industrial-residential mix", "Good connectivity", "Near Orion Mall", "Metro available"],
    cons: ["Industrial traffic", "Can be noisy", "Older buildings"],
    highlights: ["Mall access", "Metro connectivity", "Mixed use"],
  },
  "Malleshwaram": {
    pros: ["Cultural hub of Bangalore", "Traditional market", "Good for seniors", "Safe area"],
    cons: ["Limited new developments", "Crowded market days", "Old infrastructure"],
    highlights: ["Cultural heritage", "Traditional markets", "Senior-friendly"],
  },
  "Sadashivanagar": {
    pros: ["Elite and premium area", "Very quiet", "Near city center", "Wide roads"],
    cons: ["Very expensive", "Limited PG options", "Not student-friendly"],
    highlights: ["Premium living", "Quiet streets", "Proximity to center"],
  },
};

export default function NeighborhoodInfo({ area, compact = false }: NeighborhoodInfoProps) {
  const data = areaProsCons[area];
  const safety = areaSafetyScores[area];
  const metro = metroProximity[area];
  const bus = busConnectivity[area];

  if (!data && !safety) return null;

  if (compact) {
    return (
      <div className="flex items-center gap-3 text-xs text-gray-600">
        {safety && (
          <span className={`font-semibold ${safety.score >= 80 ? "text-emerald-600" : safety.score >= 70 ? "text-blue-600" : "text-amber-600"}`}>
            🛡️ {safety.score}
          </span>
        )}
        {metro && (
          <span className="text-blue-600 font-semibold">🚇 {metro.walkTime}</span>
        )}
        {bus && bus.score >= 85 && (
          <span className="text-green-600 font-semibold">🚌 {bus.routes} routes</span>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
        <span className="text-lg">🏘️</span> About {area}
      </h3>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {safety && (
          <div className="text-center p-2 bg-emerald-50 rounded-xl">
            <p className={`text-lg font-bold ${safety.score >= 80 ? "text-emerald-600" : safety.score >= 70 ? "text-blue-600" : "text-amber-600"}`}>
              {safety.score}
            </p>
            <p className="text-[10px] text-emerald-700">Safety</p>
          </div>
        )}
        {metro && (
          <div className="text-center p-2 bg-blue-50 rounded-xl">
            <p className="text-lg font-bold text-blue-600">{metro.walkTime}</p>
            <p className="text-[10px] text-blue-700">Metro Walk</p>
          </div>
        )}
        {bus && (
          <div className="text-center p-2 bg-green-50 rounded-xl">
            <p className="text-lg font-bold text-green-600">{bus.routes}</p>
            <p className="text-[10px] text-green-700">Bus Routes</p>
          </div>
        )}
      </div>

      {data && (
        <>
          {/* Highlights */}
          {data.highlights.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Highlights</p>
              <div className="flex flex-wrap gap-1.5">
                {data.highlights.map(h => (
                  <span key={h} className="text-[11px] px-2.5 py-1 bg-violet-50 text-violet-700 rounded-full font-medium">
                    ✨ {h}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Pros */}
          {data.pros.length > 0 && (
            <div className="mb-3">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <span className="text-emerald-600">✓</span> Pros
              </p>
              <ul className="space-y-1">
                {data.pros.map(p => (
                  <li key={p} className="text-xs text-gray-600 flex items-start gap-1.5">
                    <span className="text-emerald-500 shrink-0 mt-0.5">✓</span>
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Cons */}
          {data.cons.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <span className="text-red-500">○</span> Considerations
              </p>
              <ul className="space-y-1">
                {data.cons.map(c => (
                  <li key={c} className="text-xs text-gray-500 flex items-start gap-1.5">
                    <span className="text-red-400 shrink-0 mt-0.5">○</span>
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}

      {safety && (
        <p className="text-xs text-gray-400 mt-4 pt-3 border-t border-gray-100">
          💡 Safety data based on area crime statistics, street lighting, and community reports. Individual experiences may vary.
        </p>
      )}
    </div>
  );
}
