"use client";

import { useState, useMemo } from "react";
import { addReview } from "@/lib/db";
import { supabase } from "@/lib/supabase";
import type { Review } from "@/lib/db";

type SortMode = "newest" | "highest" | "lowest";

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

export default function ReviewSection({ reviews: initialReviews, pgId, pgName, isResident, userId, userName, isLoggedIn, isOwner }: ReviewSectionProps) {
  const [reviews, setReviews] = useState(initialReviews);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState(userName || "");
  const [rating, setRating] = useState("");
  const [comment, setComment] = useState("");
  const [modError, setModError] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("newest");
  // Owner reply state
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [replySubmitting, setReplySubmitting] = useState(false);

  const sortedReviews = useMemo(() => {
    const sorted = [...reviews];
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
  }, [reviews, sortMode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !rating || !comment) return;
    setSubmitting(true);
    setModError("");

    // AI moderation check
    try {
      const modRes = await fetch("/api/moderation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "text", text: comment }),
      });
      const modData = await modRes.json();
      if (modData.safe === false) {
        setModError(modData.reason || "Your review was flagged as inappropriate. Please revise.");
        setSubmitting(false);
        return;
      }
    } catch {
      // If moderation network request fails, block submission (fail closed)
      setModError("Could not verify your review. Please check your connection and try again.");
      setSubmitting(false);
      return;
    }

    const newReview = await addReview({
      pgId,
      name,
      rating: Number(rating),
      comment,
      userId: userId || undefined,
      isResident: isResident || false,
    });
    if (newReview) {
      setReviews([newReview, ...reviews]);
      setShowForm(false);
      setName(userName || "");
      setRating("");
      setComment("");
      setModError("");
    }
    setSubmitting(false);
  };

  const handleReply = async (reviewId: string) => {
    if (!replyText.trim()) return;
    setReplySubmitting(true);
    try {
      const { error } = await supabase
        .from("reviews")
        .update({ reply: replyText.trim(), reply_date: new Date().toISOString().split("T")[0] })
        .eq("id", reviewId);
      if (!error) {
        setReviews(reviews.map(r => r.id === reviewId ? { ...r, reply: replyText.trim(), replyDate: new Date().toISOString().split("T")[0] } : r));
        setReplyingTo(null);
        setReplyText("");
      }
    } catch {
      // fail silently
    }
    setReplySubmitting(false);
  };

  const canReview = isResident;

  const sortButtons: { key: SortMode; label: string }[] = [
    { key: "newest", label: "Newest First" },
    { key: "highest", label: "Highest Rated" },
    { key: "lowest", label: "Lowest Rated" },
  ];

  return (
    <div className="premium-card !rounded-2xl p-6 sm:p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Reviews ({reviews.length})</h2>
        {canReview ? (
          <button onClick={() => setShowForm(!showForm)} className="btn-premium !py-2 !px-5 !text-sm">
            ✍️ Write a Review
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
          <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl">
            <span className="text-xs text-gray-500 font-medium">Login & select your PG to review</span>
          </div>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-gray-50 rounded-2xl p-5 mb-6 space-y-4 animate-slide-up">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
              🏠 Resident Review
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <input required placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} className="premium-input w-full text-sm" />
            <select required value={rating} onChange={(e) => setRating(e.target.value)} className="premium-input w-full text-sm">
              <option value="">Rating</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>
          <textarea required rows={3} value={comment} onChange={(e) => { setComment(e.target.value); setModError(""); }} placeholder={`Share your experience living at ${pgName}...`} className="premium-input w-full text-sm resize-none" />
          {modError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 flex items-start gap-2">
              <span>🛡️</span>
              <span>{modError}</span>
            </div>
          )}
          <div className="flex gap-3">
            <button type="submit" disabled={submitting} className="btn-premium !py-2.5 !px-6 !text-sm disabled:opacity-50">
              {submitting ? "Submitting..." : "Submit Review"}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2.5 text-sm text-gray-500 hover:text-gray-700">Cancel</button>
          </div>
        </form>
      )}

      {/* Sort Buttons */}
      {reviews.length > 1 && (
        <div className="flex items-center gap-2 mb-5">
          <span className="text-xs text-gray-400 font-medium mr-1">Sort:</span>
          {sortButtons.map((btn) => (
            <button
              key={btn.key}
              onClick={() => setSortMode(btn.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                sortMode === btn.key
                  ? "bg-[#F4EDD9] text-[#1B1C15] shadow-sm"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200:bg-gray-700"
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      )}

      {sortedReviews.length > 0 ? (
        <div className="space-y-5">
          {sortedReviews.map((r) => (
            <div key={r.id} className="border-b border-gray-100 pb-5 last:border-0 last:pb-0">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${r.isResident ? "bg-gradient-to-br from-emerald-400 to-teal-500" : "bg-[#1B1C15]"}`}>
                    {r.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-gray-900 text-sm">{r.name}</span>
                      {r.isResident && (
                        <span className="inline-flex items-center gap-0.5 pill !py-0.5 !px-2 bg-emerald-50 text-emerald-600 !text-[10px]">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                            <polyline points="9 22 9 12 15 12 15 22" />
                          </svg>
                          Resident
                        </span>
                      )}
                      {r.verified && !r.isResident && (
                        <span className="pill !py-0.5 !px-2 bg-emerald-50 text-emerald-600 !text-[10px]">
                          <svg className="w-3 h-3 mr-0.5 inline" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Verified
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-400">{new Date(r.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                  </div>
                </div>
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <svg key={i} className={`w-4 h-4 ${i < r.rating ? "text-amber-400" : "text-gray-200"}`} fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed ml-[52px]">{r.comment}</p>

              {/* Owner Reply Display */}
              {r.reply && (
                <div className="ml-[52px] mt-3 p-3 bg-[#F4EDD9]/70 border border-[#F4EDD9] rounded-xl">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#1B1C15] bg-[#F4EDD9] px-2 py-0.5 rounded-full uppercase tracking-wider">
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
                          className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-[#1B1C15] text-white hover:bg-[#2a2b22] transition disabled:opacity-50"
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
                      className="flex items-center gap-1 text-xs font-medium text-[#1B1C15] hover:text-[#2a2b22]:text-[#c5bda8] transition mt-1"
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
        <p className="text-gray-400 text-sm text-center py-8">No reviews yet. Be the first to review!</p>
      )}
    </div>
  );
}
