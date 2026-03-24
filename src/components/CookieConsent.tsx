"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface CookiePreferences {
  essential: boolean;
  analytics: boolean;
  preferences: boolean;
}

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [showManage, setShowManage] = useState(false);
  const [prefs, setPrefs] = useState<CookiePreferences>({
    essential: true,
    analytics: true,
    preferences: true,
  });

  useEffect(() => {
    const consent = localStorage.getItem("cookie_consent");
    if (!consent || consent === "declined") {
      // Small delay so it doesn't flash on mount
      const timer = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const acceptAll = () => {
    const allPrefs: CookiePreferences = {
      essential: true,
      analytics: true,
      preferences: true,
    };
    localStorage.setItem("cookie_consent", "accepted");
    localStorage.setItem("cookie_preferences", JSON.stringify(allPrefs));
    window.dispatchEvent(new Event("cookie-consent-accepted"));
    setVisible(false);
  };

  const savePreferences = () => {
    const consentValue = prefs.analytics ? "accepted" : "declined";
    localStorage.setItem("cookie_consent", consentValue);
    localStorage.setItem("cookie_preferences", JSON.stringify(prefs));
    if (prefs.analytics) {
      window.dispatchEvent(new Event("cookie-consent-accepted"));
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-0 inset-x-0 z-[9999] p-4 sm:p-6 animate-slide-up"
      style={{ pointerEvents: "none" }}
    >
      <div
        className="max-w-2xl mx-auto rounded-2xl border border-white/10 p-5 sm:p-6 shadow-2xl"
        style={{
          background: "rgba(10, 10, 25, 0.85)",
          backdropFilter: "blur(24px) saturate(180%)",
          WebkitBackdropFilter: "blur(24px) saturate(180%)",
          pointerEvents: "auto",
        }}
      >
        {/* Main banner */}
        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#1B1C15]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg
                className="w-4 h-4 text-[#8a8070]"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
                />
              </svg>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed">
              We use cookies and local storage to enhance your experience. By
              continuing to use Castle, you consent to our use of cookies.{" "}
              <Link
                href="/privacy"
                className="text-[#8a8070] hover:text-[#c5bda8] underline underline-offset-2 transition-colors"
              >
                Privacy Policy
              </Link>
            </p>
          </div>

          {/* Manage panel */}
          {showManage && (
            <div className="border-t border-white/10 pt-4 space-y-3 animate-fade-in-up">
              {/* Essential */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white">Essential</p>
                  <p className="text-xs text-gray-500">
                    Required for the site to function
                  </p>
                </div>
                <div className="relative w-10 h-6 bg-[#1B1C15] rounded-full cursor-not-allowed opacity-70">
                  <div className="absolute right-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow" />
                </div>
              </div>

              {/* Analytics */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white">Analytics</p>
                  <p className="text-xs text-gray-500">
                    Help us understand how you use the site
                  </p>
                </div>
                <button
                  onClick={() =>
                    setPrefs((p) => ({ ...p, analytics: !p.analytics }))
                  }
                  className={`relative w-10 h-6 rounded-full transition-colors duration-200 ${
                    prefs.analytics ? "bg-[#1B1C15]" : "bg-gray-600"
                  }`}
                  aria-label="Toggle analytics cookies"
                >
                  <div
                    className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
                      prefs.analytics
                        ? "translate-x-[18px]"
                        : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>

              {/* Preferences */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white">Preferences</p>
                  <p className="text-xs text-gray-500">
                    Remember your settings and preferences
                  </p>
                </div>
                <button
                  onClick={() =>
                    setPrefs((p) => ({ ...p, preferences: !p.preferences }))
                  }
                  className={`relative w-10 h-6 rounded-full transition-colors duration-200 ${
                    prefs.preferences ? "bg-[#1B1C15]" : "bg-gray-600"
                  }`}
                  aria-label="Toggle preference cookies"
                >
                  <div
                    className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
                      prefs.preferences
                        ? "translate-x-[18px]"
                        : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex items-center gap-3 pt-1">
            <button
              onClick={acceptAll}
              className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-300 hover:scale-[1.03] active:scale-95"
              style={{
                background: "#1B1C15",
                boxShadow:
                  "0 4px 14px rgba(27, 28, 21, 0.3), inset 0 1px 0 rgba(255,255,255,0.1)",
              }}
            >
              Accept
            </button>
            <button
              onClick={() => {
                if (showManage) {
                  savePreferences();
                } else {
                  setShowManage(true);
                }
              }}
              className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-sm font-medium text-gray-300 border border-white/15 hover:border-white/30 hover:bg-white/5 transition-all duration-300"
            >
              {showManage ? "Save" : "Manage"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
