"use client";

interface PricePerDayProps {
  monthlyPrice: number;
}

export default function PricePerDay({ monthlyPrice }: PricePerDayProps) {
  const pricePerDay = Math.round(monthlyPrice / 30);
  const pricePerWeek = Math.round(monthlyPrice / 4.33);
  const coffees = Math.round(pricePerDay / 50); // avg coffee = 50rs

  return (
    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 rounded-2xl p-5">
      <h4 className="text-sm font-bold text-emerald-900 mb-3 flex items-center gap-2">
        <span>💡</span> Cost Insight
      </h4>
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="text-center p-2 bg-white/70 rounded-xl">
          <p className="text-xl font-bold text-emerald-700">₹{pricePerDay}</p>
          <p className="text-[10px] text-emerald-600">/day</p>
        </div>
        <div className="text-center p-2 bg-white/70 rounded-xl">
          <p className="text-xl font-bold text-emerald-700">₹{pricePerWeek.toLocaleString()}</p>
          <p className="text-[10px] text-emerald-600">/week</p>
        </div>
        <div className="text-center p-2 bg-white/70 rounded-xl">
          <p className="text-xl font-bold text-emerald-700">≈ {coffees}</p>
          <p className="text-[10px] text-emerald-600">coffees</p>
        </div>
      </div>
      <p className="text-xs text-emerald-700 leading-relaxed">
        Your ₹{monthlyPrice.toLocaleString()}/month = just ₹{pricePerDay}/day. That&apos;s about {coffees} cups of filter coffee!
      </p>
    </div>
  );
}
