import type { Metadata, Viewport } from "next";
import { Playfair_Display, DM_Sans } from "next/font/google";
import "./globals.css";

import ScrollProgress from "@/components/ScrollProgress";
// import AIAgent from "@/components/AIAgent"; // Replaced by ActionBot widget
import ActionBotBridge from "@/components/ActionBotBridge";

import ProgressBarProvider from "@/components/ProgressBar";
import { AuthProvider } from "@/lib/auth";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import { ToastProvider } from "@/components/Toast";
import { CompareProvider } from "@/context/CompareContext";
import CompareBar from "@/components/CompareBar";
import CompareModal from "@/components/CompareModal";
import MobileNav from "@/components/MobileNav";



const playfairDisplay = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
});

const dmSans = DM_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
});

const BASE_URL = "https://castleliving.in";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default:
      "Castle | Find PGs, Hostels & Co-living Spaces Near You",
    template: "%s | Castle",
  },
  description:
    "Find the best PG in Bangalore — verified PG accommodations, hostels and co-living spaces in Koramangala, HSR Layout, Indiranagar, Whitefield & more. Compare prices, amenities & reviews. No brokerage.",
  keywords: [
    "PG in Bangalore",
    "PG near me Bangalore",
    "paying guest Koramangala",
    "hostel Bangalore",
    "co-living Bangalore",
    "PG finder Bangalore",
    "PG accommodation Bangalore",
    "boys PG Bangalore",
    "girls PG Bangalore",
    "PG with food Bangalore",
    "PG near tech park Bangalore",
    "affordable PG Bangalore",
    "furnished PG Bangalore",
    "PG in HSR Layout",
    "PG in Indiranagar",
    "PG in Whitefield",
    "PG in Electronic City",
    "PG in BTM Layout",
    "co-living spaces Bangalore",
    "hostel near me Bangalore",
    "single room PG Bangalore",
    "shared accommodation Bangalore",
  ],
  authors: [{ name: "Castle" }],
  creator: "Castle",
  publisher: "Castle",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Castle",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: BASE_URL,
    siteName: "Castle",
    title: "Castle | Find PGs, Hostels & Co-living Spaces",
    description:
      "Bangalore's #1 PG finder. Browse 20+ verified PGs across Koramangala, HSR Layout, Indiranagar, Whitefield & more. Compare prices, check reviews, zero brokerage.",
    images: [
      {
        url: "/icons/icon-512.png",
        width: 512,
        height: 512,
        alt: "Castle",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Castle | Find PGs, Hostels & Co-living Spaces",
    description:
      "Bangalore's #1 PG finder. Browse 20+ verified PGs across Koramangala, HSR Layout, Indiranagar & more. Compare prices, zero brokerage.",
    images: ["/icons/icon-512.png"],
  },
  alternates: {
    canonical: BASE_URL,
  },
  category: "Real Estate",
};

export const viewport: Viewport = {
  themeColor: "#1a1a1a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

// JSON-LD structured data for the site
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${BASE_URL}/#website`,
      url: BASE_URL,
      name: "Castle",
      description:
        "Find the best PG accommodations, hostels and co-living spaces across Bangalore.",
      publisher: {
        "@id": `${BASE_URL}/#organization`,
      },
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${BASE_URL}/?search={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "Organization",
      "@id": `${BASE_URL}/#organization`,
      name: "Castle",
      url: BASE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${BASE_URL}/icons/icon-512.png`,
      },
      sameAs: [],
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "customer service",
        areaServed: "Bangalore",
        availableLanguage: ["English", "Hindi", "Kannada"],
      },
    },
    {
      "@type": "LocalBusiness",
      "@id": `${BASE_URL}/#localbusiness`,
      name: "Castle",
      description:
        "Bangalore's most trusted platform to find PG accommodations, hostels, and co-living spaces. Verified listings with reviews and transparent pricing.",
      url: BASE_URL,
      image: `${BASE_URL}/icons/icon-512.png`,
      address: {
        "@type": "PostalAddress",
        addressLocality: "Bangalore",
        addressRegion: "Karnataka",
        addressCountry: "IN",
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: 12.9716,
        longitude: 77.5946,
      },
      areaServed: {
        "@type": "City",
        name: "Bangalore",
      },
      priceRange: "$$",
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${playfairDisplay.variable} ${dmSans.variable} h-full antialiased`}
    >
      <head>
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="preconnect" href="https://zffbeascmbtzqavccvqb.supabase.co" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {process.env.NEXT_PUBLIC_ADSENSE_PUB_ID && (
          <script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-${process.env.NEXT_PUBLIC_ADSENSE_PUB_ID}`}
            crossOrigin="anonymous"
          />
        )}
      </head>
      <body className="min-h-full flex flex-col bg-[#F0EADD] overflow-x-hidden">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-6 focus:py-3 focus:bg-[#1a1a1a] focus:text-white focus:rounded-xl focus:font-semibold focus:shadow-lg focus:outline-none"
        >
          Skip to main content
        </a>
        <GoogleAnalytics />
        <AuthProvider>
          <CompareProvider>
          <ToastProvider>
            <ScrollProgress />
            <ProgressBarProvider />
            {children}
            {/* <AIAgent /> */}
            <ActionBotBridge />
            <CompareBar />
            <CompareModal />
            <MobileNav />

          </ToastProvider>
          </CompareProvider>
        </AuthProvider>
        <script
          src="https://actionbot-next.vercel.app/widget.js"
          data-tenant="castle-674545ded691fc48edc66366bc5a754d"
          data-api="https://actionbot-next.vercel.app"
          data-color="#1a1a1a"
        />
      </body>
    </html>
  );
}
