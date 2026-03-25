import { notFound } from "next/navigation";
import { fetchListings, fetchAreas } from "@/lib/db";
import Header from "@/components/Header";
import AreaPageContent from "@/components/AreaPageContent";
import AnimatedBanner from "@/components/AnimatedBanner";
import type { Metadata } from "next";
import Link from "next/link";

type Props = {
  params: Promise<{ slug: string }>;
};

/* ── Area descriptions for SEO ── */
const areaDescriptions: Record<string, {
  description: string;
  landmarks: string[];
  popularFor: string;
}> = {
  "Koramangala": {
    description: "Koramangala is Bangalore's startup hub and one of the most vibrant neighbourhoods in the city. Known for its trendy cafes, coworking spaces, and buzzing nightlife, it is home to several tech companies and attracts thousands of young professionals every year. The area is well connected via Outer Ring Road and Hosur Road, with easy access to HSR Layout, BTM Layout, and Indiranagar.",
    landmarks: ["Forum Mall", "Jyoti Nivas College", "Sony World Junction", "BDA Complex", "National Games Village"],
    popularFor: "IT professionals, Startup founders, College students",
  },
  "Indiranagar": {
    description: "Indiranagar is one of Bangalore's most upscale and happening residential areas, famous for its tree-lined streets, boutique shopping on 100 Feet Road, and thriving food and pub scene on 12th Main. The area has excellent metro connectivity via the Purple Line, making daily commutes easy across the city.",
    landmarks: ["100 Feet Road", "12th Main", "Indiranagar Metro Station", "Defence Colony", "BDA Complex"],
    popularFor: "IT professionals, Designers, Expats",
  },
  "HSR Layout": {
    description: "HSR Layout is a well-planned residential area that has rapidly transformed into a tech corridor. With numerous coworking spaces, startups, and proximity to Outer Ring Road tech parks, it is one of the most sought-after areas for PG accommodation in South-East Bangalore. The area also boasts excellent parks and a growing food scene.",
    landmarks: ["HSR BDA Complex", "Agara Lake", "27th Main Road", "Outer Ring Road", "Silk Board Junction"],
    popularFor: "IT professionals, Startup employees, Students",
  },
  "Bellandur": {
    description: "Bellandur sits right on the Outer Ring Road, providing direct access to major tech parks including RMZ Ecoworld, Ecoospace, and Embassy TechVillage. Its strategic location between Marathahalli and HSR Layout makes it a top choice for tech workers who want minimal commute times and affordable PG rents.",
    landmarks: ["Bellandur Lake", "RMZ Ecoworld", "Embassy TechVillage", "Outer Ring Road", "Green Glen Layout"],
    popularFor: "IT professionals, Corporate employees",
  },
  "BTM Layout": {
    description: "BTM Layout is one of the most budget-friendly residential areas in South Bangalore. Known for its excellent food joints, proximity to Silk Board and Outer Ring Road, and vibrant local markets, BTM Layout offers great value for money for PG accommodation seekers. The area has a strong community of working professionals and students.",
    landmarks: ["Udupi Garden BTM", "BTM Lake", "Silk Board Junction", "Jayadeva Hospital", "Billing Road"],
    popularFor: "IT professionals, Budget-conscious tenants, Students",
  },
  "Whitefield": {
    description: "Whitefield is Bangalore's largest IT corridor, home to ITPL, Prestige Tech Park, and numerous multinational companies. The area has seen massive development with shopping malls, restaurants, and residential complexes. The upcoming Purple Line metro extension is set to further boost connectivity.",
    landmarks: ["ITPL", "Phoenix Marketcity", "Prestige Tech Park", "VR Bengaluru", "Whitefield Railway Station"],
    popularFor: "IT professionals, Corporate employees, Families",
  },
  "Marathahalli": {
    description: "Marathahalli is centrally located on the Outer Ring Road with easy access to Whitefield, Bellandur, and Indiranagar. It is one of the most affordable areas for PG accommodation near major tech parks. The neighbourhood offers a wide variety of dining options, supermarkets, and entertainment venues.",
    landmarks: ["Marathahalli Bridge", "Innovative Multiplex", "Outer Ring Road", "Adarsh Palm Retreat", "Kalamandir"],
    popularFor: "IT professionals, Fresh graduates, Budget tenants",
  },
  "Electronic City": {
    description: "Electronic City is Bangalore's oldest and largest IT hub, housing giants like Infosys, Wipro, and TCS. Divided into Phase 1 and Phase 2, the area offers very competitive PG rents. The Namma Metro Yellow Line connection has significantly improved commute options to the city center.",
    landmarks: ["Infosys Campus", "Wipro Campus", "Electronic City Flyover", "Velankani Tech Park", "NICE Road"],
    popularFor: "IT professionals, Fresh graduates, Budget tenants",
  },
  "Hebbal": {
    description: "Hebbal is a well-connected neighbourhood in North Bangalore near the international airport road. The area has excellent social infrastructure, proximity to Manyata Tech Park, and a growing number of premium residential projects. Hebbal Lake adds a touch of greenery to this rapidly developing locality.",
    landmarks: ["Manyata Tech Park", "Hebbal Flyover", "Hebbal Lake", "Esteem Mall", "Outer Ring Road"],
    popularFor: "IT professionals, Airport-area workers",
  },
  "Kalyan Nagar": {
    description: "Kalyan Nagar is a peaceful residential area in East Bangalore with tree-lined streets, parks, and a growing café culture. Well connected to the city center and Whitefield corridor via the Outer Ring Road, it is popular among professionals who prefer a quieter neighbourhood without sacrificing accessibility.",
    landmarks: ["HRBR Layout", "Kalyan Nagar Park", "Kammanahalli Main Road", "HBR Layout", "Banaswadi Railway Station"],
    popularFor: "IT professionals, Families, Couples",
  },
  "Kammanahalli": {
    description: "Kammanahalli is a bustling residential area near Kalyan Nagar, known for its vibrant food street, affordable rents, and excellent local amenities. The area has a strong community feel and is popular among young professionals who enjoy a lively neighbourhood vibe.",
    landmarks: ["Kammanahalli Main Road", "St. Francis Church", "CMR Road", "HRBR Layout", "Banaswadi"],
    popularFor: "IT professionals, Young professionals, Foodies",
  },
  "JP Nagar": {
    description: "JP Nagar is a well-established residential area in South Bangalore with excellent infrastructure, parks, and shopping options. Its proximity to Bannerghatta Road and BTM Layout makes it convenient for commuting to multiple tech hubs. The area offers a good mix of affordable and premium PG options.",
    landmarks: ["JP Nagar 2nd Phase", "Ragigudda Temple", "Bannerghatta Road", "JP Nagar Metro Station", "Brigade Millennium"],
    popularFor: "IT professionals, Students, Families",
  },
  "Banaswadi": {
    description: "Banaswadi is one of the older neighbourhoods in East Bangalore that has maintained its charm while modernizing. The area has good railway connectivity, affordable rental markets, and is close to key areas like Kalyan Nagar, Kammanahalli, and the Outer Ring Road.",
    landmarks: ["Banaswadi Railway Station", "Banaswadi Main Road", "HRBR Layout", "Old Madras Road", "Tin Factory"],
    popularFor: "IT professionals, Railway commuters, Budget tenants",
  },
  "Malleshwaram": {
    description: "Malleshwaram is one of Bangalore's oldest and most charming localities, known for its heritage temples, traditional eateries, and Sampige Road shopping district. With excellent metro connectivity via the Green Line, it offers a unique blend of old-world charm and modern amenities.",
    landmarks: ["Mantri Mall", "Sampige Road", "Malleshwaram 8th Cross", "ISKCON Temple", "Sankey Tank"],
    popularFor: "Students, College goers, Professionals",
  },
  "Jayanagar": {
    description: "Jayanagar is a premium residential area in South Bangalore, renowned for its planned layout, lush greenery, and excellent shopping on Jayanagar 4th Block. The area has superb metro connectivity and is ideal for professionals working in South Bangalore tech corridors.",
    landmarks: ["Jayanagar 4th Block", "Cool Joint", "Jayanagar Shopping Complex", "Lalbagh (nearby)", "South End Circle"],
    popularFor: "Students, IT professionals, Families",
  },
  "Yelahanka": {
    description: "Yelahanka is a growing suburb in North Bangalore near the international airport. The area offers very affordable PG rents and has seen rapid development with new tech parks and residential complexes. It is ideal for those working in North Bangalore or near the airport corridor.",
    landmarks: ["Yelahanka Air Force Station", "Jakkur Aerodrome", "Yelahanka New Town", "Allalasandra Lake", "NH44"],
    popularFor: "Defense personnel, Airport workers, Budget tenants",
  },
  "Banashankari": {
    description: "Banashankari is a well-known residential area in South Bangalore, popular for its temples, markets, and affordable living. ISKON Banashankari, BSK BDA complex, and excellent BMTC bus connectivity make it a convenient choice for students and professionals alike.",
    landmarks: ["Banashankari Temple", "BSK BDA Complex", "Banashankari Metro Station", "Kathriguppe", "JP Nagar Link Road"],
    popularFor: "Students, Budget tenants, Families",
  },
  "Rajajinagar": {
    description: "Rajajinagar is one of the oldest and most well-planned neighbourhoods in West Bangalore. It is known for its wide roads, proximity to Majestic and the city center, and excellent metro connectivity. The area offers a mix of traditional charm and modern amenities.",
    landmarks: ["Rajajinagar Metro Station", "Orion Mall (nearby)", "Chord Road", "Navrang Theatre", "MEI Layout"],
    popularFor: "Students, Professionals, Govt. employees",
  },
  "Sadashivanagar": {
    description: "Sadashivanagar is one of Bangalore's most exclusive and green residential areas, located near the Palace Grounds. With spacious roads, heritage properties, and proximity to the CBD, it is a premium locality. PG options here tend to be mid-to-high range with excellent amenities.",
    landmarks: ["Palace Grounds", "Sankey Tank", "Sadashivanagar Railway Station", "ITC Windsor", "Mekhri Circle"],
    popularFor: "Professionals, Expats, Premium tenants",
  },
  "HRBR Layout": {
    description: "HRBR Layout (HBR Layout) is a peaceful, well-planned residential area adjacent to Kalyan Nagar and Banaswadi. Known for its tree-lined streets, parks, and family-friendly atmosphere, the area has seen increasing demand from young professionals looking for affordable PG accommodation in a quiet setting.",
    landmarks: ["HRBR Layout Park", "Kalyan Nagar", "Banaswadi Main Road", "Kammanahalli", "Hennur Road"],
    popularFor: "IT professionals, Students, Families",
  },
};

const defaultAreaInfo = {
  description: "This is a popular residential area in Bangalore known for good connectivity, local amenities, and proximity to major employment hubs. The area offers a variety of PG accommodations ranging from budget to premium, catering to students and working professionals.",
  landmarks: ["Local Bus Stand", "Nearby Metro Station", "Shopping Complex", "Parks", "Hospitals"],
  popularFor: "IT professionals, Students, Working professionals",
};

async function slugToArea(slug: string): Promise<string | undefined> {
  const areas = await fetchAreas();
  return areas.find(
    (a) => a.toLowerCase().replace(/\s+/g, "-") === slug.toLowerCase()
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const area = await slugToArea(slug);
  if (!area) return { title: "Area Not Found" };
  const allListings = await fetchListings();
  const areaListings = allListings.filter((l) => l.area === area);
  const minPrice = areaListings.length > 0 ? Math.min(...areaListings.map((l) => l.price)) : 0;
  const maxPrice = areaListings.length > 0 ? Math.max(...areaListings.map((l) => l.price)) : 0;
  const avgRating = areaListings.length > 0
    ? (areaListings.reduce((s, l) => s + l.rating, 0) / areaListings.length).toFixed(1)
    : "0";

  const title = `PG in ${area}, Bangalore | ${areaListings.length}+ Verified PGs & Hostels | Castle Living`;
  const description = `Find the best PG accommodations in ${area}, Bangalore. ${areaListings.length}+ verified PGs with food, WiFi, AC. Prices from ₹${minPrice.toLocaleString()} to ₹${maxPrice.toLocaleString()}/month. Avg rating: ${avgRating}/5.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url: `https://castleliving.in/area/${slug}`,
      siteName: "Castle Living",
      images: [
        {
          url: "https://castleliving.in/og-image.png",
          width: 1200,
          height: 630,
          alt: `PG in ${area} - Castle Living`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    alternates: {
      canonical: `https://castleliving.in/area/${slug}`,
    },
  };
}

export async function generateStaticParams() {
  const areas = await fetchAreas();
  return areas.map((a) => ({ slug: a.toLowerCase().replace(/\s+/g, "-") }));
}

export default async function AreaPage({ params }: Props) {
  const { slug } = await params;
  const area = await slugToArea(slug);
  if (!area) notFound();

  const allListings = await fetchListings();
  const areas = await fetchAreas();
  const areaListings = allListings.filter((l) => l.area === area);

  const minPrice = areaListings.length > 0 ? Math.min(...areaListings.map((l) => l.price)) : 0;
  const maxPrice = areaListings.length > 0 ? Math.max(...areaListings.map((l) => l.price)) : 0;
  const avgPrice = areaListings.length > 0
    ? Math.round(areaListings.reduce((s, l) => s + l.price, 0) / areaListings.length)
    : 0;
  const avgRating = areaListings.length > 0
    ? (areaListings.reduce((s, l) => s + l.rating, 0) / areaListings.length).toFixed(1)
    : "0";
  const totalReviews = areaListings.reduce((s, l) => s + l.reviews, 0);

  const info = areaDescriptions[area] || defaultAreaInfo;

  // Generate FAQ data
  const faqs = [
    {
      q: `What is the average PG rent in ${area}?`,
      a: `The average PG rent in ${area}, Bangalore is approximately ₹${avgPrice.toLocaleString()} per month. Prices range from ₹${minPrice.toLocaleString()} to ₹${maxPrice.toLocaleString()} depending on room type, amenities, and furnishing.`,
    },
    {
      q: `How many PGs are available in ${area}?`,
      a: `There are currently ${areaListings.length} verified PG accommodations listed in ${area} on Castle Living. Options include single, double, and triple sharing rooms for both boys and girls.`,
    },
    {
      q: `Are there PGs with food included in ${area}?`,
      a: `Yes, ${areaListings.filter((l) => l.foodIncluded).length} out of ${areaListings.length} PGs in ${area} include meals in their rent. Use the "Food" filter above to find PGs that serve breakfast, lunch, and dinner.`,
    },
    {
      q: `Is ${area} a good location for PG accommodation?`,
      a: `${area} is a popular choice for PG accommodation in Bangalore. The area is well-known for ${info.landmarks.slice(0, 3).join(", ")} and is popular among ${info.popularFor.toLowerCase()}. With an average PG rating of ${avgRating}/5 from ${totalReviews} reviews, residents generally have a positive experience.`,
    },
  ];

  // JSON-LD structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `PG Accommodations in ${area}, Bangalore`,
    description: `${areaListings.length} verified PG listings in ${area}`,
    numberOfItems: areaListings.length,
    itemListElement: areaListings.slice(0, 10).map((pg, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "LodgingBusiness",
        name: pg.name,
        address: {
          "@type": "PostalAddress",
          addressLocality: area,
          addressRegion: "Karnataka",
          addressCountry: "IN",
        },
        priceRange: `₹${pg.price.toLocaleString()}/month`,
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: pg.rating,
          reviewCount: pg.reviews,
        },
      },
    })),
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.a,
      },
    })),
  };

  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Breadcrumb */}
        <nav className="mb-6 text-sm text-gray-500 flex items-center gap-2" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-[#1a1a1a] transition-colors">Home</Link>
          <span className="text-gray-300">/</span>
          <span className="text-gray-400">Areas</span>
          <span className="text-gray-300">/</span>
          <span className="text-[#1a1a1a] font-medium">{area}</span>
        </nav>

        {/* ── Hero Section ── */}
        <div className="bg-[#1a1a1a] rounded-2xl p-8 sm:p-10 text-white mb-8 relative overflow-hidden">
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#2B2C25]/50 to-transparent pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white/10 text-gray-300 backdrop-blur-sm">
                Bangalore
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 tracking-tight">
              PG in {area}
            </h1>
            <p className="text-gray-400 max-w-2xl mb-8 text-base sm:text-lg leading-relaxed">
              {info.description.slice(0, 160)}...
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-white/10 rounded-xl px-4 py-4 backdrop-blur-sm border border-white/5">
                <p className="text-3xl font-bold">{areaListings.length}</p>
                <p className="text-xs text-gray-400 mt-0.5">PGs Available</p>
              </div>
              <div className="bg-white/10 rounded-xl px-4 py-4 backdrop-blur-sm border border-white/5">
                <p className="text-3xl font-bold">
                  ₹{(minPrice / 1000).toFixed(0)}K<span className="text-lg font-normal text-gray-400"> – </span>₹{(maxPrice / 1000).toFixed(0)}K
                </p>
                <p className="text-xs text-gray-400 mt-0.5">Price Range</p>
              </div>
              <div className="bg-white/10 rounded-xl px-4 py-4 backdrop-blur-sm border border-white/5">
                <p className="text-3xl font-bold">₹{avgPrice.toLocaleString()}</p>
                <p className="text-xs text-gray-400 mt-0.5">Avg. Rent/Month</p>
              </div>
              <div className="bg-white/10 rounded-xl px-4 py-4 backdrop-blur-sm border border-white/5">
                <div className="flex items-center gap-1.5">
                  <span className="text-xl">⭐</span>
                  <p className="text-3xl font-bold">{avgRating}</p>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">{totalReviews} Reviews</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Quick Filters + Listings ── */}
        <AreaPageContent listings={areaListings} />

        {/* ── Area Info Card ── */}
        <div className="bg-white rounded-2xl border border-[black/5] p-8 mb-8 shadow-sm">
          <h2 className="text-2xl font-bold text-[#1a1a1a] mb-4">About {area}, Bangalore</h2>
          <p className="text-gray-600 leading-relaxed mb-6">
            {info.description}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* Nearby Landmarks */}
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Nearby Landmarks</h3>
              <ul className="space-y-2">
                {info.landmarks.map((lm) => (
                  <li key={lm} className="flex items-center gap-2 text-sm text-gray-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#1a1a1a] shrink-0" />
                    {lm}
                  </li>
                ))}
              </ul>
            </div>

            {/* Average Prices */}
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Average Prices</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Minimum</span>
                  <span className="font-semibold text-[#1a1a1a]">₹{minPrice.toLocaleString()}/mo</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Average</span>
                  <span className="font-semibold text-[#1a1a1a]">₹{avgPrice.toLocaleString()}/mo</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Maximum</span>
                  <span className="font-semibold text-[#1a1a1a]">₹{maxPrice.toLocaleString()}/mo</span>
                </div>
              </div>
            </div>

            {/* Popular For */}
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Popular For</h3>
              <div className="flex flex-wrap gap-2">
                {info.popularFor.split(", ").map((tag) => (
                  <span key={tag} className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium bg-[gray-100] text-[#1a1a1a] border border-[black/5]">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── FAQ Section ── */}
        <div className="bg-[#FFFAEC] rounded-2xl border border-[black/5] p-8 mb-8">
          <h2 className="text-2xl font-bold text-[#1a1a1a] mb-6">
            Frequently Asked Questions about PGs in {area}
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <details key={i} className="group bg-white rounded-xl border border-[black/5] overflow-hidden">
                <summary className="flex items-center justify-between p-5 cursor-pointer select-none hover:bg-[#FDFAF0] transition-colors">
                  <h3 className="text-[15px] font-semibold text-[#1a1a1a] pr-4">{faq.q}</h3>
                  <span className="text-gray-400 group-open:rotate-180 transition-transform duration-200 shrink-0">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </summary>
                <div className="px-5 pb-5 text-sm text-gray-600 leading-relaxed border-t border-[#F0E6C8]">
                  <p className="pt-4">{faq.a}</p>
                </div>
              </details>
            ))}
          </div>
        </div>

        {/* ── Explore Other Areas ── */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-[#1a1a1a] mb-4">Explore Other Areas in Bangalore</h3>
          <div className="flex flex-wrap gap-2">
            {areas.filter((a) => a !== area).map((a) => (
              <Link
                key={a}
                href={`/area/${a.toLowerCase().replace(/\s+/g, "-")}`}
                className="px-4 py-2 bg-gray-100 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-[#1a1a1a] transition"
              >
                PG in {a}
              </Link>
            ))}
          </div>
        </div>

        <AnimatedBanner seed={70} />
      </main>
    </>
  );
}
