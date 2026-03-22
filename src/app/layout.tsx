import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SWRegister from "@/components/SWRegister";
import DarkModeStyles from "@/components/DarkModeStyles";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const BASE_URL = "https://pg-finder-eight.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default:
      "PG Finder Bangalore | Find PGs, Hostels & Co-living Spaces Near You",
    template: "%s | PG Finder Bangalore",
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
  authors: [{ name: "PG Finder Bangalore" }],
  creator: "PG Finder Bangalore",
  publisher: "PG Finder Bangalore",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "PG Finder",
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
    siteName: "PG Finder Bangalore",
    title: "PG Finder Bangalore | Find PGs, Hostels & Co-living Spaces",
    description:
      "Bangalore's #1 PG finder. Browse 20+ verified PGs across Koramangala, HSR Layout, Indiranagar, Whitefield & more. Compare prices, check reviews, zero brokerage.",
    images: [
      {
        url: "/icons/icon-512.png",
        width: 512,
        height: 512,
        alt: "PG Finder Bangalore",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PG Finder Bangalore | Find PGs, Hostels & Co-living Spaces",
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
  themeColor: "#7c3aed",
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
      name: "PG Finder Bangalore",
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
      name: "PG Finder Bangalore",
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
      name: "PG Finder Bangalore",
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <style
          dangerouslySetInnerHTML={{
            __html: `
.dark h1,.dark h2,.dark h3,.dark h4{color:#fff!important}
.dark .text-gray-900{color:#f3f4f6!important}
.dark .text-gray-700,.dark .text-gray-600{color:#d1d5db!important}
.dark .bg-gray-50{background-color:rgba(30,30,50,.6)!important}
.dark .bg-gray-100{background-color:rgba(40,40,60,.6)!important}
.dark .bg-white{background-color:rgba(20,20,35,.9)!important}
.dark .border-gray-100{border-color:rgba(255,255,255,.08)!important}
.dark .border-gray-200{border-color:rgba(255,255,255,.1)!important}
.dark .border-gray-300{border-color:rgba(255,255,255,.12)!important}
.dark .bg-yellow-50{background-color:rgba(120,100,0,.2)!important}
.dark .bg-violet-50{background-color:rgba(108,60,233,.15)!important}
.dark .bg-blue-50{background-color:rgba(59,130,246,.15)!important}
.dark .bg-pink-50{background-color:rgba(236,72,153,.15)!important}
.dark .bg-purple-50{background-color:rgba(168,85,247,.15)!important}
.dark .bg-green-50{background-color:rgba(34,197,94,.15)!important}
.dark .bg-orange-50{background-color:rgba(249,115,22,.15)!important}
.dark .bg-emerald-50{background-color:rgba(16,185,129,.15)!important}
.dark .bg-amber-50{background-color:rgba(245,158,11,.15)!important}
.dark .bg-red-50{background-color:rgba(239,68,68,.15)!important}
.dark .bg-sky-50{background-color:rgba(14,165,233,.15)!important}
.dark .text-violet-700{color:#c4b5fd!important}
.dark .text-blue-700{color:#93c5fd!important}
.dark .text-pink-700{color:#f9a8d4!important}
.dark .text-purple-700{color:#d8b4fe!important}
.dark .text-green-700{color:#86efac!important}
.dark .text-orange-700{color:#fdba74!important}
.dark .text-emerald-700{color:#6ee7b7!important}
`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-gray-50">
        {children}
        <SWRegister />
      </body>
    </html>
  );
}
