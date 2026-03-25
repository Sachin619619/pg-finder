"use client";

import { useState } from "react";
import SmartFilters, { type SmartFilterState } from "@/components/SmartFilters";
import { areas } from "@/data/listings";

interface QuickFiltersFABProps {
  onApply: (filters: SmartFilterState) => void;
}

export default function QuickFiltersFAB({ onApply }: QuickFiltersFABProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-24 right-4 md:hidden z-40 w-14 h-14 bg-[#1a1a1a] text-white rounded-full shadow-lg flex items-center justify-center hover:opacity-80 transition-all active:scale-95"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white" />
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 md:hidden" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div
            className="absolute bottom-0 left-0 right-0 max-h-[85vh] bg-[#FFFDF9] rounded-t-3xl overflow-y-auto animate-slide-up"
            onClick={e => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-[#FFFDF9] z-10 flex items-center justify-between p-5 border-b border-black/5">
              <h2 className="text-lg font-bold text-gray-900">🎯 Smart Filters</h2>
              <button
                onClick={() => setOpen(false)}
                className="w-8 h-8 rounded-full bg-[#EDE8DE] flex items-center justify-center hover:bg-[#d4c9a8] transition"
              >
                <svg className="w-4 h-4 text-[#888]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-5">
              <SmartFilters onApply={(filters) => { onApply(filters); setOpen(false); }} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
