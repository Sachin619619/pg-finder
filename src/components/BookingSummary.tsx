"use client";

interface BookingSummaryProps {
  pgName: string;
  pgArea: string;
  roomType: string;
  monthlyRent: number;
  securityDeposit: number;
  moveInDate: string;
  duration: number;
}

export default function BookingSummary({
  pgName,
  pgArea,
  roomType,
  monthlyRent,
  securityDeposit,
  moveInDate,
  duration
}: BookingSummaryProps) {
  const totalFirstPayment = monthlyRent + securityDeposit;
  const monthlyCost = monthlyRent;
  const totalCost = monthlyRent * duration + securityDeposit;

  return (
    <div className="bg-gradient-to-br from-[#F5F0E8] to-[#EDE8DE] rounded-2xl border border-black/8 p-5">
      <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
        <span className="text-lg">📋</span> Booking Summary
      </h3>

      {/* PG Info */}
      <div className="bg-[#FFFDF9]/70 rounded-xl p-4 mb-4">
        <p className="font-semibold text-gray-900 text-sm">{pgName}</p>
        <p className="text-xs text-[#999] mt-0.5">📍 {pgArea}</p>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-xs bg-[#EDE8DE] text-gray-700 px-2 py-1 rounded-lg font-medium">{roomType}</span>
          <span className="text-xs bg-[#EDE8DE] text-gray-700 px-2 py-1 rounded-lg font-medium">Move in: {moveInDate || "TBD"}</span>
        </div>
      </div>

      {/* Cost Breakdown */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-[#666]">Monthly Rent</span>
          <span className="font-semibold text-gray-900">₹{monthlyRent.toLocaleString()}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-[#666]">Security Deposit</span>
          <span className="font-semibold text-gray-900">₹{securityDeposit.toLocaleString()}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-[#666]">Duration</span>
          <span className="font-semibold text-gray-900">{duration} month{duration !== 1 ? "s" : ""}</span>
        </div>
        <div className="border-t border-black/8 pt-2 flex items-center justify-between">
          <span className="text-sm font-bold text-gray-900">First Payment</span>
          <span className="text-lg font-bold text-emerald-700">₹{totalFirstPayment.toLocaleString()}</span>
        </div>
      </div>

      {/* Total cost */}
      <div className="bg-[#FFFDF9]/70 rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-[#666]">Total Contract Value</span>
          <span className="text-lg font-bold text-gray-900">₹{totalCost.toLocaleString()}</span>
        </div>
        <p className="text-xs text-[#999]">
          Inclusive of {duration} month{duration !== 1 ? "s" : ""} rent + security deposit
        </p>
      </div>
    </div>
  );
}
