"use client";

interface PGHistoryProps {
  listedDate?: string;
  lastUpdated?: string;
  totalViews?: number;
  totalInquiries?: number;
}

export default function PGHistory({ listedDate, lastUpdated, totalViews = 0, totalInquiries = 0 }: PGHistoryProps) {
  const listed = listedDate ? new Date(listedDate) : new Date();
  const updated = lastUpdated ? new Date(lastUpdated) : new Date();
  const daysListed = Math.floor((Date.now() - listed.getTime()) / (1000 * 60 * 60 * 24));

  const timeSinceUpdate = Math.floor((Date.now() - updated.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="bg-gray-50 rounded-xl p-4">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Listing History</p>
      
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500 flex items-center gap-1.5">
            <span>📅</span> Listed
          </span>
          <div className="text-right">
            <p className="text-xs font-semibold text-gray-700">
              {listed.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
            </p>
            <p className="text-[10px] text-gray-400">{daysListed} days ago</p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500 flex items-center gap-1.5">
            <span>🔄</span> Last Updated
          </span>
          <div className="text-right">
            <p className="text-xs font-semibold text-gray-700">
              {updated.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
            </p>
            <p className="text-[10px] text-gray-400">{timeSinceUpdate === 0 ? "Today" : `${timeSinceUpdate}d ago`}</p>
          </div>
        </div>

        {(totalViews > 0 || totalInquiries > 0) && (
          <>
            <div className="border-t border-gray-200 pt-2.5 flex items-center justify-between">
              <span className="text-xs text-gray-500 flex items-center gap-1.5">
                <span>👁️</span> Views
              </span>
              <p className="text-xs font-semibold text-gray-700">{totalViews.toLocaleString()}</p>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500 flex items-center gap-1.5">
                <span>💬</span> Inquiries
              </span>
              <p className="text-xs font-semibold text-gray-700">{totalInquiries}</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
