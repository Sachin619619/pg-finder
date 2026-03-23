"use client";

import Script from "next/script";
import { useState, useEffect } from "react";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

export default function GoogleAnalytics() {
  const [consentGiven, setConsentGiven] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie_consent");
    if (consent === "accepted") {
      setConsentGiven(true);
    }

    // Listen for consent changes (from CookieConsent component)
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "cookie_consent" && e.newValue === "accepted") {
        setConsentGiven(true);
      }
    };
    window.addEventListener("storage", handleStorage);

    // Also listen for custom event (same-tab consent)
    const handleConsent = () => setConsentGiven(true);
    window.addEventListener("cookie-consent-accepted", handleConsent);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("cookie-consent-accepted", handleConsent);
    };
  }, []);

  if (!GA_ID || !consentGiven) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}');
        `}
      </Script>
    </>
  );
}
