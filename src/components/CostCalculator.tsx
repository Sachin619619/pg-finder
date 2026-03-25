"use client";

import { useState, useEffect, useCallback, useRef } from "react";

type CostCalculatorProps = {
  isOpen: boolean;
  onClose: () => void;
  prefillRent?: number;
  prefillArea?: string;
  prefillFoodIncluded?: boolean;
  prefillWifiIncluded?: boolean;
};

/* ---- Area average monthly costs (rent + living) ---- */
const areaAverages: Record<string, number> = {
  Koramangala: 22000,
  Indiranagar: 24000,
  "HSR Layout": 20000,
  Bellandur: 18000,
  "BTM Layout": 17000,
  Whitefield: 16000,
  Marathahalli: 17000,
  "Electronic City": 15000,
  Hebbal: 18000,
  "Kalyan Nagar": 17000,
  Kammanahalli: 16000,
  "JP Nagar": 17000,
  Banaswadi: 15000,
  Malleshwaram: 19000,
  Jayanagar: 18000,
  "HRBR Layout": 17000,
  Yelahanka: 14000,
  Banashankari: 15000,
  Rajajinagar: 17000,
  Sadashivanagar: 22000,
};

const foodPlans = [
  { label: "No food plan", value: 0 },
  { label: "Basic (breakfast + dinner)", value: 3000 },
  { label: "Full (3 meals/day)", value: 5000 },
];

/* ---- Animated number hook ---- */
function useAnimatedNumber(target: number, duration = 400) {
  const [display, setDisplay] = useState(target);
  const raf = useRef<number>(0);
  const prev = useRef(target);

  useEffect(() => {
    const start = prev.current;
    const diff = target - start;
    if (diff === 0) return;
    const startTime = performance.now();
    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(start + diff * eased));
      if (progress < 1) {
        raf.current = requestAnimationFrame(tick);
      } else {
        prev.current = target;
      }
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [target, duration]);

  return display;
}

/* ---- Cost bar component ---- */
function CostBar({
  label,
  amount,
  total,
  color,
  icon,
}: {
  label: string;
  amount: number;
  total: number;
  color: string;
  icon: string;
}) {
  const pct = total > 0 ? Math.max((amount / total) * 100, 2) : 0;
  const animated = useAnimatedNumber(amount);
  return (
    <div className="group">
      <div className="flex items-center justify-between mb-1.5">
        <span className="flex items-center gap-2 text-sm text-[#555] font-medium">
          <span className="text-base">{icon}</span>
          {label}
        </span>
        <span className="text-sm font-semibold text-[#1a1a1a] tabular-nums transition-all duration-300">
          {amount > 0 ? `+${animated.toLocaleString("en-IN")}` : "FREE"}
        </span>
      </div>
      <div className="h-2.5 bg-[#EDE8DE] rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default function CostCalculator({
  isOpen,
  onClose,
  prefillRent = 0,
  prefillArea = "",
  prefillFoodIncluded = false,
  prefillWifiIncluded = false,
}: CostCalculatorProps) {
  const [rent, setRent] = useState(prefillRent || 8000);
  const [foodPlan, setFoodPlan] = useState(prefillFoodIncluded ? 0 : 1);
  const [electricity, setElectricity] = useState(1000);
  const [wifiIncluded, setWifiIncluded] = useState(prefillWifiIncluded);
  const [internetCost, setInternetCost] = useState(700);
  const [laundry, setLaundry] = useState(true);
  const [transport, setTransport] = useState(2000);
  const [misc, setMisc] = useState(2000);
  const [closing, setClosing] = useState(false);

  // Reset values when opened with new prefills
  useEffect(() => {
    if (isOpen) {
      if (prefillRent > 0) setRent(prefillRent);
      setWifiIncluded(prefillWifiIncluded);
      if (prefillFoodIncluded) setFoodPlan(0);
      setClosing(false);
    }
  }, [isOpen, prefillRent, prefillFoodIncluded, prefillWifiIncluded]);

  const handleClose = useCallback(() => {
    setClosing(true);
    setTimeout(onClose, 280);
  }, [onClose]);

  if (!isOpen) return null;

  const foodCost = foodPlans[foodPlan].value;
  const internet = wifiIncluded ? 0 : internetCost;
  const laundryCost = laundry ? 500 : 0;

  const total = rent + foodCost + electricity + internet + laundryCost + transport + misc;
  const animatedTotal = useAnimatedNumber(total);

  const areaAvg = areaAverages[prefillArea] || 18000;
  const diff = total - areaAvg;
  const diffPct = Math.round((diff / areaAvg) * 100);

  const items = [
    { label: "PG Rent", amount: rent, color: "bg-[#1a1a1a]", icon: "🏠" },
    { label: foodPlans[foodPlan].label, amount: foodCost, color: "bg-orange-400", icon: "🍽️" },
    { label: "Electricity", amount: electricity, color: "bg-yellow-400", icon: "⚡" },
    { label: wifiIncluded ? "WiFi (included)" : "Internet", amount: internet, color: "bg-blue-400", icon: "📶" },
    { label: "Laundry", amount: laundryCost, color: "bg-purple-400", icon: "👕" },
    { label: "Transport", amount: transport, color: "bg-emerald-400", icon: "🚌" },
    { label: "Miscellaneous", amount: misc, color: "bg-rose-400", icon: "🛒" },
  ];

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
        closing ? "bg-black/0" : "bg-black/50 backdrop-blur-sm"
      }`}
      onClick={handleClose}
    >
      <div
        className={`bg-[#FFFDF9] rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl transition-all duration-300 ${
          closing
            ? "opacity-0 scale-95 translate-y-4"
            : "opacity-100 scale-100 translate-y-0 animate-slide-up"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-[#FFFDF9]/95 backdrop-blur-sm z-10 px-6 pt-6 pb-4 border-b border-black/5 rounded-t-3xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-[#F0EADD] flex items-center justify-center">
                <span className="text-xl">💰</span>
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#1a1a1a]">Monthly Cost Calculator</h2>
                <p className="text-xs text-[#999]">Estimate your total living cost</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="w-9 h-9 rounded-xl bg-[#F0EADD] hover:bg-[#EDE8DE] flex items-center justify-center transition-colors"
              aria-label="Close calculator"
            >
              <svg className="w-4 h-4 text-[#888]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* ---- INPUTS ---- */}

          {/* Rent */}
          <div>
            <label className="flex items-center justify-between text-sm font-medium text-[#555] mb-2">
              <span>🏠 PG Rent</span>
              <span className="text-[#1a1a1a] font-bold tabular-nums">
                {rent.toLocaleString("en-IN")}
              </span>
            </label>
            <input
              type="range"
              min={3000}
              max={30000}
              step={500}
              value={rent}
              onChange={(e) => setRent(Number(e.target.value))}
              className="w-full h-2 rounded-full appearance-none cursor-pointer bg-[#EDE8DE] accent-[#1a1a1a]"
            />
            <div className="flex justify-between text-[10px] text-[#999] mt-1">
              <span>3,000</span>
              <span>30,000</span>
            </div>
          </div>

          {/* Food Plan */}
          <div>
            <label className="text-sm font-medium text-[#555] mb-2 block">🍽️ Food Plan</label>
            <div className="grid grid-cols-3 gap-2">
              {foodPlans.map((plan, i) => (
                <button
                  key={i}
                  onClick={() => setFoodPlan(i)}
                  className={`py-2.5 px-3 rounded-xl text-xs font-semibold transition-all border-2 ${
                    foodPlan === i
                      ? "border-[#1a1a1a] bg-[#F0EADD] text-[#1a1a1a]"
                      : "border-[#EDE8DE] text-[#888] hover:border-[#d4c9a8]"
                  }`}
                >
                  <span className="block text-lg mb-0.5">
                    {i === 0 ? "🚫" : i === 1 ? "🥣" : "🍱"}
                  </span>
                  {plan.label.split("(")[0].trim()}
                  <span className="block text-[10px] mt-0.5 opacity-70">
                    {plan.value === 0 ? "Free" : `+${plan.value.toLocaleString("en-IN")}`}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Electricity */}
          <div>
            <label className="flex items-center justify-between text-sm font-medium text-[#555] mb-2">
              <span>⚡ Electricity</span>
              <span className="text-yellow-600 font-bold tabular-nums">
                +{electricity.toLocaleString("en-IN")}
              </span>
            </label>
            <input
              type="range"
              min={500}
              max={3000}
              step={100}
              value={electricity}
              onChange={(e) => setElectricity(Number(e.target.value))}
              className="w-full h-2 rounded-full appearance-none cursor-pointer bg-[#EDE8DE] accent-yellow-500"
            />
            <div className="flex justify-between text-[10px] text-[#999] mt-1">
              <span>500</span>
              <span>3,000</span>
            </div>
          </div>

          {/* Internet */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-[#555]">📶 Internet / WiFi</label>
              <button
                onClick={() => setWifiIncluded(!wifiIncluded)}
                className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${
                  wifiIncluded ? "bg-emerald-400" : "bg-[#d4c9a8]"
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-300 ${
                    wifiIncluded ? "translate-x-6" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
            <p className="text-[11px] text-[#999] -mt-1 mb-2">
              {wifiIncluded ? "WiFi included in PG rent" : "Separate internet connection"}
            </p>
            {!wifiIncluded && (
              <input
                type="range"
                min={500}
                max={1500}
                step={100}
                value={internetCost}
                onChange={(e) => setInternetCost(Number(e.target.value))}
                className="w-full h-2 rounded-full appearance-none cursor-pointer bg-[#EDE8DE] accent-blue-500"
              />
            )}
          </div>

          {/* Laundry Toggle */}
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-[#555]">👕 Laundry Service (500/mo)</label>
            <button
              onClick={() => setLaundry(!laundry)}
              className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${
                laundry ? "bg-purple-400" : "bg-[#d4c9a8]"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-300 ${
                  laundry ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Transport */}
          <div>
            <label className="flex items-center justify-between text-sm font-medium text-[#555] mb-2">
              <span>🚌 Transport</span>
              <span className="text-emerald-600 font-bold tabular-nums">
                +{transport.toLocaleString("en-IN")}
              </span>
            </label>
            <input
              type="range"
              min={1000}
              max={5000}
              step={250}
              value={transport}
              onChange={(e) => setTransport(Number(e.target.value))}
              className="w-full h-2 rounded-full appearance-none cursor-pointer bg-[#EDE8DE] accent-emerald-500"
            />
            <div className="flex justify-between text-[10px] text-[#999] mt-1">
              <span>1,000 (nearby)</span>
              <span>5,000 (commute)</span>
            </div>
          </div>

          {/* Miscellaneous */}
          <div>
            <label className="flex items-center justify-between text-sm font-medium text-[#555] mb-2">
              <span>🛒 Miscellaneous</span>
              <span className="text-rose-500 font-bold tabular-nums">
                +{misc.toLocaleString("en-IN")}
              </span>
            </label>
            <input
              type="range"
              min={1000}
              max={5000}
              step={250}
              value={misc}
              onChange={(e) => setMisc(Number(e.target.value))}
              className="w-full h-2 rounded-full appearance-none cursor-pointer bg-[#EDE8DE] accent-rose-500"
            />
            <div className="flex justify-between text-[10px] text-[#999] mt-1">
              <span>1,000</span>
              <span>5,000</span>
            </div>
          </div>

          {/* ---- DIVIDER ---- */}
          <div className="border-t border-dashed border-[#d4c9a8] pt-5">
            <p className="text-xs font-semibold text-[#999] uppercase tracking-widest mb-4">
              Breakdown
            </p>
            <div className="space-y-3">
              {items.map((item) => (
                <CostBar key={item.label} {...item} total={total} />
              ))}
            </div>
          </div>

          {/* ---- TOTAL ---- */}
          <div className="bg-[#F0EADD] rounded-2xl p-5 text-center">
            <p className="text-xs font-semibold text-[#1a1a1a]/50 uppercase tracking-widest mb-1">
              Estimated Monthly Total
            </p>
            <p className="text-4xl font-bold text-[#1a1a1a] tabular-nums tracking-tight">
              <span className="text-2xl">&#8377;</span>
              {animatedTotal.toLocaleString("en-IN")}
            </p>
            <p className="text-xs text-[#1a1a1a]/40 mt-1">per month</p>
          </div>

          {/* ---- AREA COMPARISON ---- */}
          {prefillArea && (
            <div className="bg-[#FFFDF9] border border-black/5 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-[#888]">
                  Avg. cost in <strong>{prefillArea}</strong>
                </span>
                <span className="text-sm font-semibold text-[#555] tabular-nums">
                  {areaAvg.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="h-2 bg-[#EDE8DE] rounded-full overflow-hidden mb-2">
                <div
                  className="h-full rounded-full bg-[#1a1a1a]/30 transition-all duration-500"
                  style={{ width: `${Math.min((areaAvg / Math.max(total, areaAvg)) * 100, 100)}%` }}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#888]">Your estimate</span>
                <span className="text-sm font-semibold text-[#1a1a1a] tabular-nums">
                  {total.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="h-2 bg-[#EDE8DE] rounded-full overflow-hidden mb-3">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    diff > 0 ? "bg-rose-400" : "bg-emerald-400"
                  }`}
                  style={{ width: `${Math.min((total / Math.max(total, areaAvg)) * 100, 100)}%` }}
                />
              </div>
              <p
                className={`text-center text-sm font-semibold ${
                  diff > 0 ? "text-rose-500" : "text-emerald-600"
                }`}
              >
                {diff > 0
                  ? `${diffPct}% above area average (+${Math.abs(diff).toLocaleString("en-IN")})`
                  : diff < 0
                  ? `${Math.abs(diffPct)}% below area average (-${Math.abs(diff).toLocaleString("en-IN")})`
                  : "Right at the area average"}
              </p>
            </div>
          )}

          {/* ---- TIPS ---- */}
          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
            <p className="text-xs font-semibold text-amber-700 mb-2 flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
              Money-saving tips
            </p>
            <ul className="text-xs text-amber-700/80 space-y-1.5 leading-relaxed">
              <li>- PGs with food included can save 2,000-4,000/month</li>
              <li>- Choose PGs near metro for cheaper transport</li>
              <li>- Double/triple sharing rooms reduce rent by 30-50%</li>
              <li>- Many PGs include WiFi in the rent</li>
            </ul>
          </div>
        </div>

        {/* ---- FOOTER ---- */}
        <div className="sticky bottom-0 bg-[#FFFDF9]/95 backdrop-blur-sm border-t border-black/5 px-6 py-4 rounded-b-3xl">
          <button
            onClick={handleClose}
            className="w-full py-3.5 rounded-xl bg-[#1a1a1a] text-white font-semibold text-sm hover:opacity-80 transition-opacity active:scale-[0.98]"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
