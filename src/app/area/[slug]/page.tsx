import { notFound } from "next/navigation";
import { fetchListings, fetchAreas } from "@/lib/db";
import Header from "@/components/Header";
import PGCard from "@/components/PGCard";
import type { Metadata } from "next";
import Link from "next/link";

type Props = {
  params: Promise<{ slug: string }>;
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
  return {
    title: `PG in ${area} | ${areaListings.length}+ PGs & Hostels | PG Finder Bangalore`,
    description: `Find the best PG accommodations in ${area}, Bangalore. ${areaListings.length}+ verified PGs with food, WiFi, AC. Compare prices starting from ₹${Math.min(...areaListings.map((l) => l.price)).toLocaleString()}/month.`,
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
  const avgPrice = Math.round(
    areaListings.reduce((s, l) => s + l.price, 0) / areaListings.length
  );
  const avgRating = (
    areaListings.reduce((s, l) => s + l.rating, 0) / areaListings.length
  ).toFixed(1);

  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <nav className="mb-6 text-sm text-gray-500 flex items-center gap-2">
          <Link href="/" className="hover:text-violet-600">Home</Link>
          <span>/</span>
          <span className="text-gray-900">{area}</span>
        </nav>

        {/* Area Hero */}
        <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl p-8 text-white mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">PG in {area}</h1>
          <p className="text-violet-100 mb-6">
            Find verified PG accommodations in {area}, Bangalore.
            Browse {areaListings.length} listings with detailed amenities, pricing, and reviews.
          </p>
          <div className="flex flex-wrap gap-4">
            <div className="bg-white/15 rounded-xl px-4 py-3 backdrop-blur-sm">
              <p className="text-2xl font-bold">{areaListings.length}</p>
              <p className="text-xs text-violet-200">PGs Available</p>
            </div>
            <div className="bg-white/15 rounded-xl px-4 py-3 backdrop-blur-sm">
              <p className="text-2xl font-bold">₹{avgPrice.toLocaleString()}</p>
              <p className="text-xs text-violet-200">Avg. Rent/Month</p>
            </div>
            <div className="bg-white/15 rounded-xl px-4 py-3 backdrop-blur-sm">
              <p className="text-2xl font-bold">{avgRating}</p>
              <p className="text-xs text-violet-200">Avg. Rating</p>
            </div>
          </div>
        </div>

        {/* Listings */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {areaListings.map((pg) => (
            <PGCard key={pg.id} pg={pg} />
          ))}
        </div>

        {/* SEO Content */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">About PGs in {area}</h2>
          <div className="text-gray-600 space-y-3 leading-relaxed">
            <p>
              {area} is one of the most popular residential areas in Bangalore for working professionals
              and students. With excellent connectivity, vibrant food scene, and proximity to major IT parks,
              it&apos;s a top choice for PG accommodation.
            </p>
            <p>
              PG prices in {area} range from ₹{Math.min(...areaListings.map((l) => l.price)).toLocaleString()} to
              ₹{Math.max(...areaListings.map((l) => l.price)).toLocaleString()} per month, depending on
              room type and amenities. Most PGs offer WiFi, meals, and basic furnishing as standard.
            </p>
          </div>
        </div>

        {/* Other Areas */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Explore Other Areas</h3>
          <div className="flex flex-wrap gap-2">
            {areas.filter((a) => a !== area).map((a) => (
              <Link
                key={a}
                href={`/area/${a.toLowerCase().replace(/\s+/g, "-")}`}
                className="px-4 py-2 bg-gray-100 rounded-lg text-sm font-medium text-gray-700 hover:bg-violet-100 hover:text-violet-700 transition"
              >
                PG in {a}
              </Link>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
