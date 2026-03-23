"use client";

import { useEffect, useState } from "react";

export default function SWRegister() {
  const [showUpdate, setShowUpdate] = useState(false);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .then((reg) => {
        console.log("[SW] Registered with scope:", reg.scope);

        // Check for updates every 60 seconds
        setInterval(() => reg.update(), 60_000);

        reg.addEventListener("updatefound", () => {
          const newSW = reg.installing;
          if (!newSW) return;
          newSW.addEventListener("statechange", () => {
            if (
              newSW.state === "installed" &&
              navigator.serviceWorker.controller
            ) {
              // New version available
              setShowUpdate(true);
            }
          });
        });
      })
      .catch((err) => {
        console.warn("[SW] Registration failed:", err);
      });
  }, []);

  if (!showUpdate) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[9999] animate-slide-up">
      <div className="bg-gray-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-purple-500/30 flex items-center gap-3">
        <span className="text-lg">🔄</span>
        <span className="text-sm font-medium">New version available!</span>
        <button
          onClick={() => window.location.reload()}
          className="bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold px-4 py-1.5 rounded-lg transition-colors"
        >
          Update
        </button>
      </div>
    </div>
  );
}
