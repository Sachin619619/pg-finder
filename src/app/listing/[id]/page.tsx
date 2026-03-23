import type { Metadata } from "next";
import { fetchListingById } from "@/lib/db";
import ListingClient from "./ListingClient";

const BASE_URL = "https://castleliving.in";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;

  try {
    const pg = await fetchListingById(id);
    if (!pg) {
      return {
        title: "PG Not Found",
        description: "This PG listing could not be found.",
      };
    }

    const priceRange =
      pg.roomOptions && pg.roomOptions.length > 0
        ? `₹${Math.min(...pg.roomOptions.map((r) => r.price))}-₹${Math.max(...pg.roomOptions.map((r) => r.price))}`
        : `₹${pg.price}`;

    const title = `${pg.name} in ${pg.area} — ${priceRange}/month`;
    const description = `${pg.name} — ${pg.gender === "male" ? "Boys" : pg.gender === "female" ? "Girls" : "Co-ed"} PG in ${pg.locality}, ${pg.area}. Starting at ${priceRange}/month. ${pg.amenities.slice(0, 5).join(", ")}. ${pg.rating}★ rating from ${pg.reviews} reviews.`;

    return {
      title,
      description,
      openGraph: {
        type: "website",
        siteName: "Castle",
        title,
        description,
        url: `${BASE_URL}/listing/${id}`,
        images: pg.images.length > 0
          ? [
              {
                url: pg.images[0],
                width: 1200,
                height: 630,
                alt: `${pg.name} in ${pg.area}`,
              },
            ]
          : [
              {
                url: `${BASE_URL}/icons/icon-512.png`,
                width: 512,
                height: 512,
                alt: "Castle",
              },
            ],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: pg.images.length > 0 ? [pg.images[0]] : [`${BASE_URL}/icons/icon-512.png`],
      },
      alternates: {
        canonical: `${BASE_URL}/listing/${id}`,
      },
    };
  } catch {
    return {
      title: "PG Listing",
      description: "View PG listing details on Castle.",
    };
  }
}

export default function ListingPage() {
  return <ListingClient />;
}
