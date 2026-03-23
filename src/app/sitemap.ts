import type { MetadataRoute } from "next";
import { fetchListings, fetchAreas } from "@/lib/db";

const BASE_URL = "https://castleliving.in";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/login`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/signup`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/saved`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/roommate-finder`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/privacy`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.2,
    },
    {
      url: `${BASE_URL}/terms`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.2,
    },
  ];

  // Dynamic area pages
  let areaPages: MetadataRoute.Sitemap = [];
  try {
    const areas = await fetchAreas();
    areaPages = areas.map((area) => ({
      url: `${BASE_URL}/area/${area.toLowerCase().replace(/\s+/g, "-")}`,
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: 0.8,
    }));
  } catch {
    // If DB is unavailable, skip dynamic area pages
  }

  // Dynamic listing pages
  let listingPages: MetadataRoute.Sitemap = [];
  try {
    const listings = await fetchListings();
    listingPages = listings.map((listing) => ({
      url: `${BASE_URL}/listing/${listing.id}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));
  } catch {
    // If DB is unavailable, skip dynamic listing pages
  }

  return [...staticPages, ...areaPages, ...listingPages];
}
