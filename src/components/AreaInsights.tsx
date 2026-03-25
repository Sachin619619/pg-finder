"use client";

import { useState } from "react";
import { areaSafetyScores, metroProximity, busConnectivity } from "@/data/safetyData";

const areaOrder = [
  "Kalyan Nagar", "HRBR Layout", "Bellandur", "HSR Layout", "Koramangala",
  "Indiranagar", "Whitefield", "Marathahalli", "BTM Layout", "Electronic City",
  "JP Nagar", "Jayanagar", "Hebbal", "Yelahanka", "Banashankari",
  "Rajajinagar", "Malleshwaram", "Sadashivanagar", "Banaswadi", "Kammanahalli",
];

export default function AreaInsights() {
  const [activeTab, setActiveTab] = useState<"safety" | "transport" | "value">("safety");

  const tabs = [
    { id: "safety" as const, label: "🛡️ Safety", emoji: "🛡️" },
    { id: "transport" as const, label: "🚇 Transport", emoji: "🚇" },
    { id: "value" as const, label: "💰 Value", emoji: "💰" },
  ];

  const getSafetySorted = () =>
    [...areaOrder].filter(a => areaSafetyScores[a]).sort((a, b) => (areaSafetyScores[b]?.score || 0) - (areaSafetyScores[a]?.score || 0));

  const getTransportSorted = () =>
    [...areaOrder].filter(a => metroProximity[a] || busConnectivity[a]).sort((a, b) => {
      const aScore = (metroProximity[a] ? 30 : 0) + (busConnectivity[a]?.score || 0);
      const bScore = (metroProximity[b] ? 30 : 0) + (busConnectivity[b]?.score || 0);
      return bScore - aScore;
    });

  const getValueSorted = () => {
    // Value = lower price + good safety + good transport
    const valueScores: Record<string, number> = {};
    for (const area of areaOrder) {
      const safety = areaSafetyScores[area]?.score || 50;
      const bus = busConnectivity[area]?.score || 50;
      const metro = metroProximity[area] ? 30 : 0;
      valueScores[area] = safety + bus + metro;
    }
    return [...areaOrder].filter(a => valueScores[a]).sort((a, b) => valueScores[b] - valueScores[a]);
  };

  const sorted = activeTab === "safety" ? getSafetySorted() : activeTab === "transport" ? getTransportSorted() : getValueSorted();

  return (
    <section className="py-20 bg-[#FFFDF9]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <span className="text-xs font-semibold text-black/40 uppercase tracking-widest mb-3 inline-block">Area Intelligence</span>
          <h2 className="font-serif text-3xl sm:text-4xl text-black mb-3 tracking-tight">Find the Best Area for You</h2>
          <p className="text-black/50 max-w-md mx-auto text-sm">Compare neighborhoods across safety, connectivity, and value for money</p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center gap-2 mb-8">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeTab === tab.id
                  ? "bg-[#1a1a1a] text-white shadow-lg"
                  : "bg-[#EDE8DE] text-[#666] hover:bg-[#d4c9a8]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Area Rankings */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
          {sorted.map((area, i) => {
            const safety = areaSafetyScores[area];
            const metro = metroProximity[area];
            const bus = busConnectivity[area];
            const rank = i + 1;

            return (
              <div key={area} className={`rounded-2xl p-4 border transition-all hover:shadow-md ${
                rank <= 3 ? "bg-amber-50 border-amber-200" : "bg-[#F5F0E8] border-black/5 hover:border-black/8"
              }`}>
                <div className="flex items-start justify-between mb-2">
                  <span className={`text-lg font-bold ${rank === 1 ? "text-amber-600" : rank === 2 ? "text-[#666]" : rank === 3 ? "text-orange-600" : "text-[#999]"}`}>
                    #{rank}
                  </span>
                  {rank <= 3 && <span className="text-sm">
                    {rank === 1 ? "🥇" : rank === 2 ? "🥈" : "🥉"}
                  </span>}
                </div>
                <p className="text-sm font-semibold text-[#1a1a1a] mb-1">{area}</p>

                {activeTab === "safety" && safety && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-[#888]">Safety</span>
                      <span className={`text-[11px] font-bold ${safety.score >= 80 ? "text-emerald-600" : safety.score >= 70 ? "text-blue-600" : "text-amber-600"}`}>
                        {safety.score}
                      </span>
                    </div>
                    <div className="w-full bg-white/60 rounded-full h-1.5">
                      <div className={`h-1.5 rounded-full ${safety.score >= 80 ? "bg-emerald-400" : safety.score >= 70 ? "bg-blue-400" : "bg-amber-400"}`}
                        style={{ width: `${safety.score}%` }} />
                    </div>
                    <p className="text-[10px] text-[#999]">{safety.label}</p>
                  </div>
                )}

                {activeTab === "transport" && (
                  <div className="space-y-1">
                    {metro && (
                      <div className="flex items-center gap-1 text-[11px] text-blue-600 font-medium">
                        <span>🚇</span>
                        <span>{metro.walkTime}</span>
                      </div>
                    )}
                    {bus && (
                      <div className="flex items-center gap-1 text-[11px] text-green-600 font-medium">
                        <span>🚌</span>
                        <span>{bus.routes} routes</span>
                      </div>
                    )}
                    {!metro && !bus && (
                      <p className="text-[11px] text-[#999]">Limited transit</p>
                    )}
                  </div>
                )}

                {activeTab === "value" && safety && bus && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-[#888]">Score</span>
                      <span className="text-[11px] font-bold text-violet-600">
                        {safety.score + bus.score + (metroProximity[area] ? 30 : 0)}
                      </span>
                    </div>
                    <div className="flex gap-1 text-[10px] text-[#999]">
                      <span title="Safety">🛡️{safety.score}</span>
                      <span title="Bus">🚌{bus.score}</span>
                      {metro && <span title="Metro">🚇✓</span>}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <p className="text-center text-xs text-[#999] mt-6">
          💡 Data based on area statistics — individual PGs may vary. Always visit before committing.
        </p>
      </div>
    </section>
  );
}
