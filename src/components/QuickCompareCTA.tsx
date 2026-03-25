"use client";

export default function QuickCompareCTA() {
  return (
    <div className="fixed bottom-24 right-4 z-40 max-w-xs">
      <div className="bg-gradient-to-r from-amber-400 to-orange-400 rounded-2xl p-4 shadow-xl shadow-black/10 text-white">
        <div className="flex items-start gap-3">
          <span className="text-2xl">⚖️</span>
          <div>
            <p className="font-semibold text-sm">Compare PGs</p>
            <p className="text-xs text-white/80 mt-0.5">Add 2+ PGs to compare side-by-side</p>
            <a
              href="/compare"
              className="inline-flex items-center gap-1 mt-2 px-3 py-1.5 bg-white text-amber-700 rounded-xl text-xs font-bold hover:bg-amber-50 transition-colors"
            >
              View Comparison →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
