"use client";

import dynamic from "next/dynamic";
import type { PGListing } from "@/data/listings";

const LeafletMap = dynamic(() => import("./LeafletMap"), {
  ssr: false,
  loading: () => (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-200 bg-[#FFFAEB]">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <svg
            className="w-5 h-5 text-[#1B1C15] animate-pulse"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          Loading Map...
        </h3>
      </div>
      <div
        className="w-full flex items-center justify-center bg-gradient-to-br from-[#FFFAEB] to-[#F4EDD9]"
        style={{ height: "calc(max(500px, 60vh))" }}
      >
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-[#e8e0cc] border-t-[#1B1C15] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-black/40 font-medium">
            Loading interactive map...
          </p>
        </div>
      </div>
    </div>
  ),
});

type Props = {
  listings: PGListing[];
};

export default function MapView({ listings }: Props) {
  return <LeafletMap listings={listings} />;
}
