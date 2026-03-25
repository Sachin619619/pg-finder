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
    <section className="py-20 bg-[#F0EADD]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#1B5E3B]/60 mb-3">&#10022; Smart Comparison</p>
          <h2 className="font-serif text-2xl sm:text-3xl text-black mb-3 tracking-tight">Compare Areas</h2>
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
                    ? "bg-[#1B5E3B] text-white border-[#1B5E3B]"
                    : "bg-[#FFFDF9] text-[#666] border-black/[0.06] hover:border-black/12 disabled:opacity-40 disabled:cursor-not-allowed"
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
                  <tr className="bg-[#F0EADD] border-b border-black/5">
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
                  <tr className="border-b border-[#F0EADD] bg-[#F0EADD]/50">
                    <td className="p-4 text-sm font-medium text-[#666]">🛡️ Safety Score</td>
                    {(() => {
                      const scores = selected.map(a => getData(a).safety?.score || 0);
                      const best = Math.max(...scores);
                      return selected.map((area, idx) => {
                        const safety = getData(area).safety;
                        const isWinner = (safety?.score || 0) === best && best > 0;
                        return (
                          <td key={area} className={`p-4 text-center ${isWinner ? "bg-[#1B5E3B]/5" : ""}`}>
                            <span className={`text-lg font-bold ${isWinner ? "text-[#1B5E3B]" : safety && safety.score >= 80 ? "text-emerald-600" : safety && safety.score >= 70 ? "text-blue-600" : "text-amber-600"}`}>
                              {safety?.score || "—"}/100
                            </span>
                            {safety && <div className="text-[10px] text-[#999]">{safety.label}</div>}
                          </td>
                        );
                      });
                    })()}
                  </tr>

                  {/* Metro */}
                  <tr className="border-b border-[#F0EADD]">
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
                  <tr className="border-b border-[#F0EADD] bg-[#F0EADD]/50">
                    <td className="p-4 text-sm font-medium text-[#666]">🚌 Bus Routes</td>
                    {(() => {
                      const counts = selected.map(a => getData(a).bus?.routes || 0);
                      const best = Math.max(...counts);
                      return selected.map((area, idx) => {
                        const bus = getData(area).bus;
                        const isWinner = (bus?.routes || 0) === best && best > 0;
                        return (
                          <td key={area} className={`p-4 text-center ${isWinner ? "bg-[#1B5E3B]/5" : ""}`}>
                            {bus ? (
                              <span className={`text-base font-bold ${isWinner ? "text-[#1B5E3B]" : "text-green-600"}`}>{bus.routes} routes</span>
                            ) : (
                              <span className="text-sm text-[#999]">—</span>
                            )}
                          </td>
                        );
                      });
                    })()}
                  </tr>

                  {/* Bus Score */}
                  <tr className="border-b border-[#F0EADD]">
                    <td className="p-4 text-sm font-medium text-[#666]">🚌 Bus Score</td>
                    {(() => {
                      const scores = selected.map(a => getData(a).bus?.score || 0);
                      const best = Math.max(...scores);
                      return selected.map((area, idx) => {
                        const bus = getData(area).bus;
                        const isWinner = (bus?.score || 0) === best && best > 0;
                        return (
                          <td key={area} className={`p-4 text-center ${isWinner ? "bg-[#1B5E3B]/5" : ""}`}>
                            {bus ? (
                              <span className={`text-base font-bold ${isWinner ? "text-[#1B5E3B]" : bus.score >= 90 ? "text-emerald-600" : bus.score >= 80 ? "text-blue-600" : "text-amber-600"}`}>
                                {bus.score}/100
                              </span>
                            ) : (
                              <span className="text-sm text-[#999]">—</span>
                            )}
                          </td>
                        );
                      });
                    })()}
                  </tr>

                  {/* Overall */}
                  <tr className="bg-[#F0EADD]/50">
                    <td className="p-4 text-sm font-medium text-[#666]">📊 Overall</td>
                    {(() => {
                      const totals = selected.map(a => {
                        const safety = getData(a).safety?.score || 50;
                        const bus = getData(a).bus?.score || 50;
                        const metro = getData(a).metro ? 30 : 0;
                        return safety + bus + metro;
                      });
                      const best = Math.max(...totals);
                      return selected.map((area, idx) => {
                        const safety = getData(area).safety?.score || 50;
                        const bus = getData(area).bus?.score || 50;
                        const metro = getData(area).metro ? 30 : 0;
                        const total = safety + bus + metro;
                        const isWinner = total === best;
                        return (
                          <td key={area} className={`p-4 text-center ${isWinner ? "bg-[#1B5E3B]/5" : ""}`}>
                            <span className={`text-xl font-bold ${isWinner ? "text-[#1B5E3B]" : "text-violet-600"}`}>{total}</span>
                            <div className="text-[10px] text-[#999]">/ 180</div>
                          </td>
                        );
                      });
                    })()}
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
