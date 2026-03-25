"use client";

import { useState } from "react";
import { areaSafetyScores, metroProximity, busConnectivity } from "@/data/safetyData";
import { areas } from "@/data/listings";

const allAreas = Object.keys(areaSafetyScores);

export default function AreaCompare() {
  const [selected, setSelected] = useState<string[]>([]);

  const toggleArea = (area: string) => {
    if (selected.includes(area)) {
      setSelected(selected.filter(a => a !== area));
    } else if (selected.length < 3) {
      setSelected([...selected, area]);
    }
  };

  const getData = (area: string) => ({
    safety: areaSafetyScores[area],
    metro: metroProximity[area],
    bus: busConnectivity[area],
  });

  return (
    <section className="py-20 bg-[#F5F0E8]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <span className="text-xs font-semibold text-black/40 uppercase tracking-widest mb-3 inline-block">Smart Comparison</span>
          <h2 className="font-serif text-3xl sm:text-4xl text-black mb-3 tracking-tight">Compare Areas</h2>
          <p className="text-black/50 max-w-md mx-auto text-sm">Select up to 3 areas to compare safety, transport, and connectivity</p>
        </div>

        {/* Area selector */}
        <div className="mb-8">
          <p className="text-xs font-semibold text-[#888] uppercase tracking-wider mb-3">Select areas to compare ({selected.length}/3)</p>
          <div className="flex flex-wrap gap-2">
            {allAreas.slice(0, 15).map(area => (
              <button
                key={area}
                onClick={() => toggleArea(area)}
                disabled={!selected.includes(area) && selected.length >= 3}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                  selected.includes(area)
                    ? "bg-[#1a1a1a] text-white border-[#1a1a1a]"
                    : "bg-[#FFFDF9] text-[#666] border-black/8 hover:border-black/12 disabled:opacity-40 disabled:cursor-not-allowed"
                }`}
              >
                {selected.includes(area) && <span className="mr-1">✓</span>}
                {area}
              </button>
            ))}
          </div>
        </div>

        {/* Comparison table */}
        {selected.length >= 2 && (
          <div className="bg-[#FFFDF9] rounded-2xl border border-black/5 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#F5F0E8] border-b border-black/5">
                    <th className="text-left p-4 text-sm font-semibold text-[#888] w-40">Metric</th>
                    {selected.map(area => (
                      <th key={area} className="text-center p-4 text-sm font-bold text-[#1a1a1a] min-w-44">
                        {area}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {/* Safety Score */}
                  <tr className="border-b border-[#F5F0E8]">
                    <td className="p-4 text-sm font-medium text-[#666]">🛡️ Safety Score</td>
                    {selected.map(area => {
                      const safety = getData(area).safety;
                      return (
                        <td key={area} className="p-4 text-center">
                          <span className={`text-lg font-bold ${safety && safety.score >= 80 ? "text-emerald-600" : safety && safety.score >= 70 ? "text-blue-600" : "text-amber-600"}`}>
                            {safety?.score || "—"}/100
                          </span>
                          {safety && <div className="text-[10px] text-[#999]">{safety.label}</div>}
                        </td>
                      );
                    })}
                  </tr>

                  {/* Metro */}
                  <tr className="border-b border-[#F5F0E8]">
                    <td className="p-4 text-sm font-medium text-[#666]">🚇 Metro Walk</td>
                    {selected.map(area => {
                      const metro = getData(area).metro;
                      return (
                        <td key={area} className="p-4 text-center">
                          {metro ? (
                            <div>
                              <span className="text-base font-bold text-blue-600">{metro.walkTime}</span>
                              <div className="text-[10px] text-[#999]">{metro.metroStation.split(" ").slice(0, 2).join(" ")}</div>
                            </div>
                          ) : (
                            <span className="text-sm text-[#999]">No metro</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>

                  {/* Bus */}
                  <tr className="border-b border-[#F5F0E8]">
                    <td className="p-4 text-sm font-medium text-[#666]">🚌 Bus Routes</td>
                    {selected.map(area => {
                      const bus = getData(area).bus;
                      return (
                        <td key={area} className="p-4 text-center">
                          {bus ? (
                            <span className="text-base font-bold text-green-600">{bus.routes} routes</span>
                          ) : (
                            <span className="text-sm text-[#999]">—</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>

                  {/* Bus Score */}
                  <tr className="border-b border-[#F5F0E8]">
                    <td className="p-4 text-sm font-medium text-[#666]">🚌 Bus Score</td>
                    {selected.map(area => {
                      const bus = getData(area).bus;
                      return (
                        <td key={area} className="p-4 text-center">
                          {bus ? (
                            <span className={`text-base font-bold ${bus.score >= 90 ? "text-emerald-600" : bus.score >= 80 ? "text-blue-600" : "text-amber-600"}`}>
                              {bus.score}/100
                            </span>
                          ) : (
                            <span className="text-sm text-[#999]">—</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>

                  {/* Overall */}
                  <tr>
                    <td className="p-4 text-sm font-medium text-[#666]">📊 Overall</td>
                    {selected.map(area => {
                      const safety = getData(area).safety?.score || 50;
                      const bus = getData(area).bus?.score || 50;
                      const metro = getData(area).metro ? 30 : 0;
                      const total = safety + bus + metro;
                      return (
                        <td key={area} className="p-4 text-center">
                          <span className="text-xl font-bold text-violet-600">{total}</span>
                          <div className="text-[10px] text-[#999]">/ 180</div>
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {selected.length < 2 && selected.length > 0 && (
          <p className="text-center text-sm text-[#999]">Select at least one more area to compare</p>
        )}

        {selected.length === 0 && (
          <p className="text-center text-sm text-[#999]">Select areas above to compare them side by side</p>
        )}
      </div>
    </section>
  );
}
