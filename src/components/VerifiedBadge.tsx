"use client";

interface VerifiedBadgeProps {
  verified?: boolean;
  ownerSince?: string;
  totalListings?: number;
}

export default function VerifiedBadge({ verified = true, ownerSince, totalListings }: VerifiedBadgeProps) {
  if (!verified) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {verified && (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200">
          <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
            <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <span className="text-xs font-bold text-emerald-700">Castle Verified</span>
        </div>
      )}
      {ownerSince && (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-blue-50 border border-blue-200">
          <span className="text-xs font-bold text-blue-700">🏰 Since {new Date(ownerSince).getFullYear()}</span>
        </div>
      )}
      {totalListings && totalListings > 1 && (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-violet-50 border border-violet-200">
          <span className="text-xs font-bold text-violet-700">📋 {totalListings} Listings</span>
        </div>
      )}
    </div>
  );
}
