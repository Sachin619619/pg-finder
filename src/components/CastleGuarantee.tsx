"use client";

export default function CastleGuarantee() {
  return (
    <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-5">
      <div className="flex items-start gap-3">
        <div className="text-3xl">🏰</div>
        <div>
          <h3 className="text-sm font-bold text-amber-900 mb-1">Castle Guarantee</h3>
          <p className="text-xs text-amber-700 leading-relaxed">
            Every listing on Castle Living is verified by our team. If you find any discrepancy between the listing and reality, let us know and we&apos;ll help resolve it.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {[
              "✅ Verified Photos",
              "✅ Real Pricing",
              "✅ Owner Verified",
              "✅ No Hidden Fees"
            ].map(item => (
              <span key={item} className="text-[11px] px-2 py-0.5 bg-amber-100/70 text-amber-800 rounded-lg font-medium">
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
