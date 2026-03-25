"use client";

import { metroProximity, busConnectivity } from "@/data/safetyData";

interface TransportProximityProps {
  area: string;
  compact?: boolean;
}

function MetroIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 11a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z" />
      <path d="M5 11V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v5" />
      <path d="M3 15h18" />
      <circle cx="8" cy="19" r="2" />
      <circle cx="16" cy="19" r="2" />
    </svg>
  );
}

function BusIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 6v6" />
      <path d="M16 6v6" />
      <path d="M2 12h20" />
      <path d="M4 6h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z" />
      <circle cx="7.5" cy="17" r="1.5" />
      <circle cx="16.5" cy="17" r="1.5" />
    </svg>
  );
}

function WalkingIcon() {
  return (
    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="5" r="1" />
      <path d="M9 20l3-6 2 1.5" />
      <path d="M7 10l5-5 4 2-3 6" />
      <path d="M11 17l-2 3" />
    </svg>
  );
}

export default function TransportProximity({ area, compact = false }: TransportProximityProps) {
  const metro = metroProximity[area];
  const bus = busConnectivity[area];

  if (!metro && !bus) return null;

  if (compact) {
    return (
      <div className="flex items-center gap-3">
        {metro && (
          <div className="flex items-center gap-1.5 text-xs text-gray-600">
            <span className="text-blue-600"><MetroIcon /></span>
            <span>🚇 {metro.walkTime}</span>
          </div>
        )}
        {bus && bus.routes >= 10 && (
          <div className="flex items-center gap-1.5 text-xs text-gray-600">
            <span className="text-green-600"><BusIcon /></span>
            <span>🚌 {bus.routes} routes</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
      <h3 className="text-sm font-bold text-blue-900 mb-3 flex items-center gap-2">
        <span className="text-lg">🚇</span> Public Transport
      </h3>
      <div className="space-y-3">
        {metro && (
          <div className="flex items-center gap-3 p-3 bg-white/70 rounded-xl">
            <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 shrink-0">
              <MetroIcon />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-blue-900 truncate">{metro.metroStation}</p>
              <p className="text-xs text-blue-600">{metro.distance} away</p>
            </div>
            <div className="flex items-center gap-1 bg-blue-100 text-blue-700 px-2.5 py-1 rounded-lg text-xs font-semibold shrink-0">
              <WalkingIcon />
              {metro.walkTime}
            </div>
          </div>
        )}
        {bus && (
          <div className="flex items-center gap-3 p-3 bg-white/70 rounded-xl">
            <div className="w-9 h-9 bg-green-100 rounded-xl flex items-center justify-center text-green-600 shrink-0">
              <BusIcon />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-green-900">BMTC Bus Connectivity</p>
              <p className="text-xs text-green-600">{bus.routes} routes • {bus.stops} stops nearby</p>
            </div>
            <div className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
              bus.score >= 90 ? "bg-green-100 text-green-700" :
              bus.score >= 80 ? "bg-blue-100 text-blue-700" :
              "bg-amber-100 text-amber-700"
            }`}>
              {bus.score}/100
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
