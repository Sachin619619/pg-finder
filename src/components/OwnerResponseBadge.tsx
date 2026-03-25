"use client";

interface OwnerResponseBadgeProps {
  avgResponseTime?: number; // in minutes
  contactName?: string;
}

function getResponseBadge(minutes: number): { label: string; color: string; bg: string; text: string } {
  if (minutes <= 15) return { label: "⚡ Responds in minutes", color: "text-emerald-600 bg-emerald-50 border-emerald-200", bg: "bg-emerald-50", text: "text-emerald-700" };
  if (minutes <= 60) return { label: "✓ Usually within an hour", color: "text-blue-600 bg-blue-50 border-blue-200", bg: "bg-blue-50", text: "text-blue-700" };
  if (minutes <= 240) return { label: "🕐 Responds same day", color: "text-amber-600 bg-amber-50 border-amber-200", bg: "bg-amber-50", text: "text-amber-700" };
  return { label: "🐌 May take time", color: "text-gray-600 bg-gray-50 border-gray-200", bg: "bg-gray-50", text: "text-gray-700" };
}

export default function OwnerResponseBadge({ avgResponseTime = 45, contactName }: OwnerResponseBadgeProps) {
  const badge = getResponseBadge(avgResponseTime);

  return (
    <div className={`rounded-xl border p-4 ${badge.bg} ${badge.color}`}>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-white/70 rounded-full flex items-center justify-center text-lg shrink-0">
          👤
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-gray-600">Response Rate</p>
          <p className={`text-sm font-bold ${badge.text}`}>{badge.label}</p>
          {contactName && <p className="text-xs text-gray-500 mt-0.5">via {contactName}</p>}
        </div>
      </div>
    </div>
  );
}
