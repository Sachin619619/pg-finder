"use client";

import { useState, useEffect } from "react";
import { isWishlisted, toggleWishlist } from "@/lib/store";

export default function WishlistButton({ pgId, pgName, size = "sm" }: { pgId: string; pgName?: string; size?: "sm" | "lg" }) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSaved(isWishlisted(pgId));
  }, [pgId]);

  const toggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const result = toggleWishlist(pgId);
    setSaved(result);
    window.dispatchEvent(new Event("wishlist-update"));
  };

  const sizeClass = size === "lg" ? "w-12 h-12" : "w-9 h-9";
  const iconSize = size === "lg" ? "w-6 h-6" : "w-4 h-4";

  return (
    <button
      onClick={toggle}
      className={`${sizeClass} rounded-full flex items-center justify-center transition-all ${
        saved
          ? "bg-red-50 text-[#e74c3c] shadow-lg shadow-red-500/20 scale-110"
          : "bg-white/80 backdrop-blur-sm text-gray-400 hover:text-[#e74c3c] hover:bg-red-50 shadow-md"
      }`}
      aria-label={saved ? `Remove${pgName ? ` ${pgName}` : ""} from wishlist` : `Save${pgName ? ` ${pgName}` : ""} to wishlist`}
      title={saved ? "Remove from wishlist" : "Save to wishlist"}
    >
      <svg
        className={`${iconSize} transition-transform ${saved ? "scale-110" : ""}`}
        fill={saved ? "currentColor" : "none"}
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
    </button>
  );
}
