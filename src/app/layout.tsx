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
      </head>
      <body className="min-h-full flex flex-col bg-gray-50">
        {children}
        <DarkModeStyles />
        <SWRegister />
      </body>
    </html>
  );
}
