"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { addReview } from "@/lib/db";
import { supabase } from "@/lib/supabase";
import type { Review } from "@/lib/db";
import ReviewForm from "./ReviewForm";
import type { ReviewFormData, CategoryRatings } from "./ReviewForm";

type SortMode = "newest" | "highest" | "lowest";

type LocalReview = Review & {
  categoryRatings?: CategoryRatings;
  pros?: string;
  cons?: string;
  helpfulCount?: number;
  notHelpfulCount?: number;
};

type ReviewSectionProps = {
  reviews: Review[];
  pgId: string;
  pgName: string;
  isResident?: boolean;
  userId?: string;
  userName?: string;
  isLoggedIn?: boolean;
  isOwner?: boolean;
};

// Mock reviews data keyed by PG ID
const MOCK_REVIEWS: Record<string, LocalReview[]> = {
  "1": [
    {
      id: "mock-1a", pgId: "1", name: "Arjun Mehta", rating: 5, comment: "Outstanding PG! The rooms are spacious and well-maintained. The food quality is excellent with variety every day. Staff is very responsive and helpful. Highly recommend for working professionals.",
      date: "2026-02-15", verified: true, isResident: true, reply: null, replyDate: null,
      categoryRatings: { cleanliness: 5, food: 5, value: 4, location: 5, safety: 5 },
      pros: "Excellent food, spacious rooms, great WiFi, helpful staff",
      cons: "Parking could be better",
      helpfulCount: 12, notHelpfulCount: 1,
    },
    {
      id: "mock-1b", pgId: "1", name: "Priya Sharma", rating: 4, comment: "Very good PG overall. Clean rooms, decent food, and great location near metro. The only downside is occasional water issues in the morning but management is working on it.",
      date: "2026-01-28", verified: true, isResident: true, reply: "Thank you for your feedback, Priya! We have upgraded our water system and the issue should be resolved now.", replyDate: "2026-02-01",
      categoryRatings: { cleanliness: 4, food: 4, value: 4, location: 5, safety: 4 },
      pros: "Great location, clean rooms, friendly roommates",
      cons: "Morning water supply can be inconsistent",
      helpfulCount: 8, notHelpfulCount: 0,
    },
    {
      id: "mock-1c", pgId: "1", name: "Rahul K", rating: 4, comment: "Living here for 6 months now. The value for money is great considering the amenities provided. Food is home-style and tastes good. Security is top-notch with CCTV and biometric entry.",
      date: "2026-01-10", verified: true, isResident: true, reply: null, replyDate: null,
      categoryRatings: { cleanliness: 4, food: 4, value: 5, location: 4, safety: 5 },
      pros: "Great value, good security, home-style food",
      cons: "Laundry service could be faster",
      helpfulCount: 6, notHelpfulCount: 2,
    },
    {
      id: "mock-1d", pgId: "1", name: "Anonymous", rating: 3, comment: "Decent place to stay. Rooms are clean but a bit small for the price. Food is okay, not great. Location is convenient though.",
      date: "2025-12-20", verified: false, isResident: false, reply: null, replyDate: null,
      categoryRatings: { cleanliness: 3, food: 3, value: 3, location: 4, safety: 3 },
      pros: "Good location, clean",
      cons: "Rooms are small, food could improve",
      helpfulCount: 3, notHelpfulCount: 4,
    },
  ],
  "2": [
    {
      id: "mock-2a", pgId: "2", name: "Sneha Reddy", rating: 5, comment: "Best PG I have stayed in Bangalore! The ambience is amazing and the facilities are premium. Worth every rupee.",
      date: "2026-03-01", verified: true, isResident: true, reply: null, replyDate: null,
      categoryRatings: { cleanliness: 5, food: 4, value: 5, location: 5, safety: 5 },
      pros: "Premium facilities, great ambience, helpful management",
      cons: "Nothing significant",
      helpfulCount: 15, notHelpfulCount: 0,
    },
    {
      id: "mock-2b", pgId: "2", name: "Karthik V", rating: 4, comment: "Good PG with nice amenities. The gym is a big plus. Food quality varies but overall good. Would recommend to friends.",
      date: "2026-02-10", verified: true, isResident: true, reply: null, replyDate: null,
      categoryRatings: { cleanliness: 4, food: 3, value: 4, location: 4, safety: 5 },
      pros: "Gym, good security, AC rooms",
      cons: "Food quality inconsistent",
      helpfulCount: 7, notHelpfulCount: 1,
    },
    {
      id: "mock-2c", pgId: "2", name: "Divya M", rating: 5, comment: "Absolutely love this place. Clean, safe, and the staff treats you like family. The common area is great for socializing.",
      date: "2026-01-22", verified: true, isResident: true, reply: "Thank you Divya! We are glad you feel at home here.", replyDate: "2026-01-25",
      categoryRatings: { cleanliness: 5, food: 5, value: 4, location: 4, safety: 5 },
      pros: "Family-like atmosphere, cleanliness, safety",
      cons: "Could use more parking space",
      helpfulCount: 10, notHelpfulCount: 0,
    },
  ],
};

// Generate default mock reviews for PG IDs that don't have specific ones
function getDefaultMockReviews(pgId: string): LocalReview[] {
  return [
    {
      id: `mock-${pgId}-a`, pgId, name: "Vikram S", rating: 4, comment: "Good PG with clean rooms and decent amenities. The location is convenient for daily commute. Staff is cooperative and responsive to complaints.",
      date: "2026-02-20", verified: true, isResident: true, reply: null, replyDate: null,
      categoryRatings: { cleanliness: 4, food: 4, value: 4, location: 4, safety: 4 },
      pros: "Clean rooms, good location, responsive staff",
      cons: "WiFi speed could be better",
      helpfulCount: 5, notHelpfulCount: 1,
    },
    {
      id: `mock-${pgId}-b`, pgId, name: "Neha Gupta", rating: 5, comment: "Excellent experience! I have been staying here for 4 months and everything has been smooth. The food is homely and the rooms are well-furnished.",
      date: "2026-01-15", verified: true, isResident: true, reply: null, replyDate: null,
      categoryRatings: { cleanliness: 5, food: 5, value: 4, location: 5, safety: 5 },
      pros: "Homely food, well-furnished, great community",
      cons: "Hot water timing is fixed",
      helpfulCount: 9, notHelpfulCount: 0,
    },
    {
      id: `mock-${pgId}-c`, pgId, name: "Amit P", rating: 3, comment: "Average PG. Gets the job done but nothing extraordinary. Maintenance could be quicker. Food is basic but filling.",
      date: "2025-12-28", verified: false, isResident: false, reply: null, replyDate: null,
      categoryRatings: { cleanliness: 3, food: 3, value: 3, location: 4, safety: 3 },
      pros: "Affordable, decent location",
      cons: "Slow maintenance, basic food",
      helpfulCount: 2, notHelpfulCount: 3,
    },
  ];
}

function getMockReviews(pgId: string): LocalReview[] {
  return MOCK_REVIEWS[pgId] || getDefaultMockReviews(pgId);
}

// localStorage helpers
const STORAGE_KEY = "pg_finder_reviews";
const HELPFUL_KEY = "pg_finder_helpful_votes";

function getLocalReviews(pgId: string): LocalReview[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const all: LocalReview[] = JSON.parse(stored);
    return all.filter((r) => r.pgId === pgId);
  } catch {
    return [];
  }
}

function saveLocalReview(review: LocalReview) {
  if (typeof window === "undefined") return;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const all: LocalReview[] = stored ? JSON.parse(stored) : [];
    all.unshift(review);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch {
    // fail silently
  }
}

function getHelpfulVotes(): Record<string, "helpful" | "not_helpful"> {
  if (typeof window === "undefined") return {};
  try {
    const stored = localStorage.getItem(HELPFUL_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

function saveHelpfulVote(reviewId: string, vote: "helpful" | "not_helpful") {
  if (typeof window === "undefined") return;
  try {
    const votes = getHelpfulVotes();
    votes[reviewId] = vote;
    localStorage.setItem(HELPFUL_KEY, JSON.stringify(votes));
  } catch {
    // fail silently
  }
}

// Star SVG path constant
const STAR_PATH = "M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z";

function Stars({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" | "lg" }) {
  const sizeClass = size === "lg" ? "w-7 h-7" : size === "md" ? "w-5 h-5" : "w-4 h-4";
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} className={`${sizeClass} ${i <= rating ? "text-amber-400" : "text-gray-200"}`} fill="currentColor" viewBox="0 0 20 20">
          <path d={STAR_PATH} />
        </svg>
      ))}
    </div>
  );
}

// Rating Breakdown Bar
function RatingBar({ star, count, total }: { star: number; count: number; total: number }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-2.5">
      <span className="text-xs font-medium text-gray-600 w-3 text-right">{star}</span>
      <svg className="w-3.5 h-3.5 text-amber-400 shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path d={STAR_PATH} />
      </svg>
      <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${pct}%`,
            background: star >= 4 ? "linear-gradient(90deg, #f59e0b, #fbbf24)" : star === 3 ? "#fbbf24" : star === 2 ? "#fb923c" : "#ef4444",
          }}
        />
      </div>
      <span className="text-xs text-gray-400 w-8 text-right">{pct}%</span>
    </div>
  );
}

// Category Rating Row
function CategoryRow({ label, icon, rating }: { label: string; icon: string; rating: number }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-gray-600 font-medium flex items-center gap-1.5">
        <span>{icon}</span> {label}
      </span>
      <div className="flex items-center gap-1.5">
        <div className="flex gap-0.5">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className={`w-3 h-3 rounded-sm ${i <= rating ? "bg-amber-400" : "bg-gray-200"}`} />
          ))}
        </div>
        <span className="text-xs font-semibold text-gray-700 w-4 text-right">{rating.toFixed(1)}</span>
      </div>
    </div>
  );
}

export default function ReviewSection({ reviews: initialReviews, pgId, pgName, isResident, userId, userName, isLoggedIn, isOwner }: ReviewSectionProps) {
  const [dbReviews, setDbReviews] = useState<Review[]>(initialReviews);
  const [localReviews, setLocalReviews] = useState<LocalReview[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [sortMode, setSortMode] = useState<SortMode>("newest");
  const [helpfulVotes, setHelpfulVotes] = useState<Record<string, "helpful" | "not_helpful">>({});
  // Owner reply state
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [replySubmitting, setReplySubmitting] = useState(false);

  // Load localStorage reviews and mock reviews on mount
  useEffect(() => {
    const stored = getLocalReviews(pgId);
    const mocks = getMockReviews(pgId);
    // Merge: local stored reviews + mocks (avoid duplicates)
    const existingIds = new Set([...stored.map((r) => r.id), ...initialReviews.map((r) => r.id)]);
    const filteredMocks = mocks.filter((m) => !existingIds.has(m.id));
    setLocalReviews([...stored, ...filteredMocks]);
    setHelpfulVotes(getHelpfulVotes());
  }, [pgId, initialReviews]);

  // Merge DB reviews and local reviews
  const allReviews: LocalReview[] = useMemo(() => {
    const dbIds = new Set(dbReviews.map((r) => r.id));
    const uniqueLocal = localReviews.filter((r) => !dbIds.has(r.id));
    return [...dbReviews.map((r) => ({ ...r } as LocalReview)), ...uniqueLocal];
  }, [dbReviews, localReviews]);

  const sortedReviews = useMemo(() => {
    const sorted = [...allReviews];
    switch (sortMode) {
      case "newest":
        return sorted.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      case "highest":
        return sorted.sort((a, b) => b.rating - a.rating || new Date(b.date).getTime() - new Date(a.date).getTime());
      case "lowest":
        return sorted.sort((a, b) => a.rating - b.rating || new Date(b.date).getTime() - new Date(a.date).getTime());
      default:
        return sorted;
    }
  }, [allReviews, sortMode]);

  // Compute stats
  const stats = useMemo(() => {
    if (allReviews.length === 0) return { avg: 0, total: 0, breakdown: [0, 0, 0, 0, 0], categories: null };
    const total = allReviews.length;
    const sum = allReviews.reduce((s, r) => s + r.rating, 0);
    const avg = sum / total;
    const breakdown = [0, 0, 0, 0, 0]; // index 0 = 1 star, index 4 = 5 stars
    allReviews.forEach((r) => { if (r.rating >= 1 && r.rating <= 5) breakdown[r.rating - 1]++; });

    // Aggregate category ratings from reviews that have them
    const withCats = allReviews.filter((r) => r.categoryRatings);
    let categories: { cleanliness: number; food: number; value: number; location: number; safety: number } | null = null;
    if (withCats.length > 0) {
      const catSum = { cleanliness: 0, food: 0, value: 0, location: 0, safety: 0 };
      let catCount = 0;
      withCats.forEach((r) => {
        if (!r.categoryRatings) return;
        const c = r.categoryRatings;
        if (c.cleanliness > 0 || c.food > 0 || c.value > 0 || c.location > 0 || c.safety > 0) {
          catSum.cleanliness += c.cleanliness;
          catSum.food += c.food;
          catSum.value += c.value;
          catSum.location += c.location;
          catSum.safety += c.safety;
          catCount++;
        }
      });
      if (catCount > 0) {
        categories = {
          cleanliness: catSum.cleanliness / catCount,
          food: catSum.food / catCount,
          value: catSum.value / catCount,
          location: catSum.location / catCount,
          safety: catSum.safety / catCount,
        };
      }
    }

    return { avg, total, breakdown, categories };
  }, [allReviews]);

  const handleFormSubmit = useCallback(async (data: ReviewFormData) => {
    setSubmitting(true);

    // Try adding to Supabase if user is a resident
    if (isResident) {
      try {
        const modRes = await fetch("/api/moderation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "text", text: data.comment }),
        });
        const modData = await modRes.json();
        if (modData.safe === false) {
          setSubmitting(false);
          return;
        }
      } catch {
        // fail closed for residents
        setSubmitting(false);
        return;
      }

      const newReview = await addReview({
        pgId,
        name: data.name,
        rating: data.rating,
        comment: data.comment,
        userId: userId || undefined,
        isResident: true,
      });
      if (newReview) {
        setDbReviews((prev) => [newReview, ...prev]);
        // Also store extended data locally
        const extended: LocalReview = {
          ...newReview,
          categoryRatings: data.categoryRatings,
          pros: data.pros,
          cons: data.cons,
          helpfulCount: 0,
          notHelpfulCount: 0,
        };
        saveLocalReview(extended);
        setLocalReviews((prev) => [extended, ...prev]);
      }
    } else {
      // Store in localStorage only
      const localReview: LocalReview = {
        id: `local-${Date.now()}`,
        pgId,
        name: data.name || "Anonymous",
        rating: data.rating,
        comment: data.comment,
        date: new Date().toISOString().split("T")[0],
        verified: false,
        isResident: false,
        reply: null,
        replyDate: null,
        categoryRatings: data.categoryRatings,
        pros: data.pros,
        cons: data.cons,
        helpfulCount: 0,
        notHelpfulCount: 0,
      };
      saveLocalReview(localReview);
      setLocalReviews((prev) => [localReview, ...prev]);
    }

    setShowForm(false);
    setSubmitting(false);
  }, [pgId, userId, isResident]);

  const handleReply = async (reviewId: string) => {
    if (!replyText.trim()) return;
    setReplySubmitting(true);
    try {
      const { error } = await supabase
        .from("reviews")
        .update({ reply: replyText.trim(), reply_date: new Date().toISOString().split("T")[0] })
        .eq("id", reviewId);
      if (!error) {
        setDbReviews((prev) => prev.map((r) => (r.id === reviewId ? { ...r, reply: replyText.trim(), replyDate: new Date().toISOString().split("T")[0] } : r)));
        setReplyingTo(null);
        setReplyText("");
      }
    } catch {
      // fail silently
    }
    setReplySubmitting(false);
  };

  const handleHelpful = (reviewId: string, vote: "helpful" | "not_helpful") => {
    const existing = helpfulVotes[reviewId];
    if (existing === vote) return; // Already voted same way
    saveHelpfulVote(reviewId, vote);
    setHelpfulVotes((prev) => ({ ...prev, [reviewId]: vote }));
    // Update counts on mock/local reviews
    setLocalReviews((prev) =>
      prev.map((r) => {
        if (r.id !== reviewId) return r;
        const delta = existing ? (vote === "helpful" ? 1 : -1) : 0;
        return {
          ...r,
          helpfulCount: (r.helpfulCount || 0) + (vote === "helpful" ? 1 : 0) + (existing === "helpful" ? -1 : 0),
          notHelpfulCount: (r.notHelpfulCount || 0) + (vote === "not_helpful" ? 1 : 0) + (existing === "not_helpful" ? -1 : 0),
        };
      })
    );
  };

  const canReview = isResident;

  const sortButtons: { key: SortMode; label: string }[] = [
    { key: "newest", label: "Newest" },
    { key: "highest", label: "Highest" },
    { key: "lowest", label: "Lowest" },
  ];

  return (
    <div className="premium-card !rounded-2xl p-6 sm:p-8">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Reviews & Ratings</h2>
        {canReview ? (
          <button onClick={() => setShowForm(true)} className="btn-premium !py-2.5 !px-6 !text-sm flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            Write a Review
          </button>
        ) : isLoggedIn ? (
          <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-xl">
            <svg className="w-4 h-4 text-amber-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span className="text-xs text-amber-700 font-medium">Select this as your PG to review</span>
          </div>
        ) : (
          <button onClick={() => setShowForm(true)} className="px-5 py-2.5 text-sm font-medium text-[#1a1a1a] bg-gray-100 hover:bg-gray-200 rounded-xl transition flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            Write a Review
          </button>
        )}
      </div>

      {/* Overall Rating Summary */}
      {stats.total > 0 && (
        <div className="bg-gray-50 rounded-2xl p-6 mb-6 border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Big Rating Number */}
            <div className="flex flex-col items-center justify-center text-center">
              <div className="text-5xl font-black text-[#1a1a1a] mb-1">{stats.avg.toFixed(1)}</div>
              <Stars rating={Math.round(stats.avg)} size="md" />
              <p className="text-xs text-gray-500 mt-2 font-medium">Based on {stats.total} review{stats.total !== 1 ? "s" : ""}</p>
            </div>

            {/* Rating Breakdown Bars */}
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((star) => (
                <RatingBar key={star} star={star} count={stats.breakdown[star - 1]} total={stats.total} />
              ))}
            </div>

            {/* Category Averages */}
            {stats.categories && (
              <div className="space-y-2.5 border-l border-gray-200/60 pl-6">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Category Ratings</h4>
                <CategoryRow label="Cleanliness" icon="🧹" rating={stats.categories.cleanliness} />
                <CategoryRow label="Food" icon="🍽️" rating={stats.categories.food} />
                <CategoryRow label="Value" icon="💰" rating={stats.categories.value} />
                <CategoryRow label="Location" icon="📍" rating={stats.categories.location} />
                <CategoryRow label="Safety" icon="🛡️" rating={stats.categories.safety} />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sort Buttons */}
      {allReviews.length > 1 && (
        <div className="flex items-center gap-2 mb-5">
          <span className="text-xs text-gray-400 font-medium mr-1">Sort:</span>
          {sortButtons.map((btn) => (
            <button
              key={btn.key}
              onClick={() => setSortMode(btn.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                sortMode === btn.key
                  ? "bg-gray-100 text-[#1a1a1a]"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
            >
              {btn.label}
            </button>
          ))}
          <span className="ml-auto text-xs text-gray-400">{allReviews.length} review{allReviews.length !== 1 ? "s" : ""}</span>
        </div>
      )}

      {/* Review Cards */}
      {sortedReviews.length > 0 ? (
        <div className="space-y-0">
          {sortedReviews.map((r, idx) => (
            <div key={r.id} className={`py-5 ${idx < sortedReviews.length - 1 ? "border-b border-gray-100" : ""}`}>
              {/* Review Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 ${r.isResident ? "bg-gradient-to-br from-emerald-400 to-teal-500" : "bg-[#1a1a1a]"}`}>
                    {r.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-gray-900 text-sm">{r.name}</span>
                      {r.isResident && (
                        <span className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[10px] font-semibold rounded-full">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                            <polyline points="9 22 9 12 15 12 15 22" />
                          </svg>
                          Resident
                        </span>
                      )}
                      {r.verified && !r.isResident && (
                        <span className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[10px] font-semibold rounded-full">
                          <svg className="w-3 h-3 inline" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Verified
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-400">{new Date(r.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                  </div>
                </div>
                <Stars rating={r.rating} size="sm" />
              </div>

              {/* Review Text */}
              <p className="text-sm text-gray-600 leading-relaxed ml-[52px] mb-3">{r.comment}</p>

              {/* Pros & Cons */}
              {(r.pros || r.cons) && (
                <div className="ml-[52px] flex flex-wrap gap-3 mb-3">
                  {r.pros && (
                    <div className="flex items-start gap-1.5 bg-emerald-50/70 px-3 py-2 rounded-lg">
                      <svg className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3H14z" />
                      </svg>
                      <span className="text-xs text-emerald-700">{r.pros}</span>
                    </div>
                  )}
                  {r.cons && (
                    <div className="flex items-start gap-1.5 bg-red-50/70 px-3 py-2 rounded-lg">
                      <svg className="w-3.5 h-3.5 text-red-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                        <path d="M10 15V19a3 3 0 003 3l4-9V2H5.72a2 2 0 00-2 1.7l-1.38 9a2 2 0 002 2.3H10z" />
                      </svg>
                      <span className="text-xs text-red-600">{r.cons}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Helpful Buttons */}
              <div className="ml-[52px] flex items-center gap-3">
                <span className="text-[11px] text-gray-400">Was this helpful?</span>
                <button
                  onClick={() => handleHelpful(r.id, "helpful")}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium transition ${
                    helpfulVotes[r.id] === "helpful"
                      ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                      : "bg-gray-50 text-gray-500 hover:bg-gray-100 border border-transparent"
                  }`}
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3H14z" />
                  </svg>
                  Yes{r.helpfulCount ? ` (${r.helpfulCount})` : ""}
                </button>
                <button
                  onClick={() => handleHelpful(r.id, "not_helpful")}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium transition ${
                    helpfulVotes[r.id] === "not_helpful"
                      ? "bg-red-50 text-red-500 border border-red-200"
                      : "bg-gray-50 text-gray-500 hover:bg-gray-100 border border-transparent"
                  }`}
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10 15V19a3 3 0 003 3l4-9V2H5.72a2 2 0 00-2 1.7l-1.38 9a2 2 0 002 2.3H10z" />
                  </svg>
                  No{r.notHelpfulCount ? ` (${r.notHelpfulCount})` : ""}
                </button>
              </div>

              {/* Owner Reply Display */}
              {r.reply && (
                <div className="ml-[52px] mt-3 p-3 bg-gray-100 border border-gray-200 rounded-xl">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#1a1a1a] bg-gray-200 px-2 py-0.5 rounded-full uppercase tracking-wider">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                        <polyline points="9 22 9 12 15 12 15 22" />
                      </svg>
                      Owner
                    </span>
                    {r.replyDate && (
                      <span className="text-[10px] text-gray-400">{new Date(r.replyDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">{r.reply}</p>
                </div>
              )}

              {/* Owner Reply Button & Input */}
              {isOwner && !r.reply && (
                <div className="ml-[52px] mt-2">
                  {replyingTo === r.id ? (
                    <div className="space-y-2 animate-slide-up">
                      <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        rows={2}
                        placeholder="Write your reply..."
                        className="premium-input w-full text-sm resize-none"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleReply(r.id)}
                          disabled={replySubmitting || !replyText.trim()}
                          className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-[#1a1a1a] text-white hover:opacity-80 transition disabled:opacity-50"
                        >
                          {replySubmitting ? "Sending..." : "Send Reply"}
                        </button>
                        <button
                          onClick={() => { setReplyingTo(null); setReplyText(""); }}
                          className="px-4 py-1.5 rounded-lg text-xs font-medium text-gray-500 hover:text-gray-700 transition"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => { setReplyingTo(r.id); setReplyText(""); }}
                      className="flex items-center gap-1 text-xs font-medium text-[#1a1a1a] hover:text-[#2a2b22] transition mt-1"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 17 4 12 9 7" />
                        <path d="M20 18v-2a4 4 0 0 0-4-4H4" />
                      </svg>
                      Reply
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-4xl mb-3">📝</div>
          <p className="text-gray-500 text-sm font-medium">No reviews yet</p>
          <p className="text-gray-400 text-xs mt-1">Be the first to share your experience!</p>
        </div>
      )}

      {/* Review Form Modal */}
      {showForm && (
        <ReviewForm
          pgName={pgName}
          onSubmit={handleFormSubmit}
          onClose={() => setShowForm(false)}
          submitting={submitting}
          userName={userName}
        />
      )}
    </div>
  );
}
