import { supabase } from "./supabase";
import type { PGListing } from "@/data/listings";
import { getPhotos } from "./photos";

// Map snake_case DB rows to camelCase PGListing type
function mapListing(row: Record<string, unknown>): PGListing {
  return {
    id: row.id as string,
    name: row.name as string,
    area: row.area as string,
    locality: row.locality as string,
    price: row.price as number,
    type: row.type as PGListing["type"],
    gender: row.gender as PGListing["gender"],
    amenities: row.amenities as string[],
    rating: Number(row.rating),
    reviews: row.reviews as number,
    images: getPhotos(row.id as string, row.images as string[]),
    description: row.description as string,
    contactPhone: row.contact_phone as string,
    contactName: row.contact_name as string,
    mapUrl: row.map_url as string,
    lat: Number(row.lat),
    lng: Number(row.lng),
    availableFrom: row.available_from as string,
    furnished: row.furnished as boolean,
    foodIncluded: row.food_included as boolean,
    wifiIncluded: row.wifi_included as boolean,
    acAvailable: row.ac_available as boolean,
    nearbyLandmarks: row.nearby_landmarks as string[],
    distanceFromMetro: row.distance_from_metro as string | undefined,
  };
}

export async function fetchListings(): Promise<PGListing[]> {
  // Include listings with status "active" or null (legacy listings without status)
  const { data, error } = await supabase
    .from("listings")
    .select("*")
    .or("status.eq.active,status.is.null")
    .order("rating", { ascending: false });

  if (error) {
    console.error("Error fetching listings:", error);
    // Fallback: try without status filter in case column doesn't exist yet
    const { data: fallbackData, error: fallbackError } = await supabase
      .from("listings")
      .select("*")
      .neq("status", "agent_draft")
      .order("rating", { ascending: false });
    if (fallbackError) return [];
    return (fallbackData || []).map(mapListing);
  }
  return (data || []).map(mapListing);
}

export async function fetchListingById(id: string): Promise<PGListing | null> {
  const { data, error } = await supabase
    .from("listings")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching listing:", error);
    return null;
  }
  return data ? mapListing(data) : null;
}

export type Review = {
  id: string;
  pgId: string;
  name: string;
  rating: number;
  comment: string;
  date: string;
  verified: boolean;
  userId?: string | null;
  isResident?: boolean;
  reply?: string | null;
  replyDate?: string | null;
};

function mapReview(row: Record<string, unknown>): Review {
  return {
    id: row.id as string,
    pgId: row.pg_id as string,
    name: row.name as string,
    rating: row.rating as number,
    comment: row.comment as string,
    date: row.date as string,
    verified: row.verified as boolean,
    userId: (row.user_id as string) || null,
    isResident: (row.is_resident as boolean) || false,
    reply: (row.reply as string) || null,
    replyDate: (row.reply_date as string) || null,
  };
}

export async function fetchReviews(pgId: string): Promise<Review[]> {
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("pg_id", pgId)
    .order("date", { ascending: false });

  if (error) {
    console.error("Error fetching reviews:", error);
    return [];
  }
  return (data || []).map(mapReview);
}

export async function addReview(review: {
  pgId: string;
  name: string;
  rating: number;
  comment: string;
  userId?: string;
  isResident?: boolean;
}): Promise<Review | null> {
  const id = `r${Date.now()}`;
  const { data, error } = await supabase
    .from("reviews")
    .insert({
      id,
      pg_id: review.pgId,
      name: review.name,
      rating: review.rating,
      comment: review.comment,
      date: new Date().toISOString().split("T")[0],
      verified: review.isResident || false,
      user_id: review.userId || null,
      is_resident: review.isResident || false,
    })
    .select()
    .single();

  if (error) {
    console.error("Error adding review:", error);
    return null;
  }
  return data ? mapReview(data) : null;
}

export async function submitCallback(pgId: string, name: string, phone: string): Promise<boolean> {
  const { error } = await supabase
    .from("callbacks")
    .insert({ pg_id: pgId, name, phone });

  if (error) {
    console.error("Error submitting callback:", error);
    return false;
  }
  return true;
}

export async function submitPriceAlert(email: string, area: string, maxPrice: number): Promise<boolean> {
  const { error } = await supabase
    .from("price_alerts")
    .insert({ email, area, max_price: maxPrice });

  if (error) {
    console.error("Error submitting price alert:", error);
    return false;
  }
  return true;
}

export type RoommateProfile = {
  id: string;
  name: string;
  age: number;
  gender: string;
  occupation: string;
  area: string;
  budgetMin: number;
  budgetMax: number;
  moveInDate: string;
  lifestyle: string;
  bio: string;
  avatar: string;
  gradient: string;
};

function mapRoommate(row: Record<string, unknown>): RoommateProfile {
  return {
    id: row.id as string,
    name: row.name as string,
    age: row.age as number,
    gender: row.gender as string,
    occupation: row.occupation as string,
    area: row.area as string,
    budgetMin: row.budget_min as number,
    budgetMax: row.budget_max as number,
    moveInDate: row.move_in_date as string,
    lifestyle: row.lifestyle as string,
    bio: row.bio as string,
    avatar: row.avatar as string,
    gradient: row.gradient as string,
  };
}

export async function fetchRoommateProfiles(): Promise<RoommateProfile[]> {
  const { data, error } = await supabase
    .from("roommate_profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching roommate profiles:", error);
    return [];
  }
  return (data || []).map(mapRoommate);
}

export async function addRoommateProfile(profile: Omit<RoommateProfile, "id">): Promise<boolean> {
  const { error } = await supabase
    .from("roommate_profiles")
    .insert({
      name: profile.name,
      age: profile.age,
      gender: profile.gender,
      occupation: profile.occupation,
      area: profile.area,
      budget_min: profile.budgetMin,
      budget_max: profile.budgetMax,
      move_in_date: profile.moveInDate,
      lifestyle: profile.lifestyle,
      bio: profile.bio,
      avatar: profile.avatar,
      gradient: profile.gradient,
    });

  if (error) {
    console.error("Error adding roommate profile:", error);
    return false;
  }
  return true;
}

export async function fetchAreas(): Promise<string[]> {
  const { data, error } = await supabase
    .from("listings")
    .select("area");

  if (error) return [];
  const unique = [...new Set((data || []).map((d: { area: string }) => d.area))];
  return unique.sort();
}
