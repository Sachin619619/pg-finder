"use client";

import { useState } from "react";

export type CategoryRatings = {
  cleanliness: number;
  food: number;
  value: number;
  location: number;
  safety: number;
};

export type ReviewFormData = {
  name: string;
  rating: number;
  categoryRatings: CategoryRatings;
  comment: string;
  pros: string;
  cons: string;
};

type ReviewFormProps = {
  pgName: string;
  onSubmit: (data: ReviewFormData) => void;
  onClose: () => void;
  submitting?: boolean;
  userName?: string;
};

const categories: { key: keyof CategoryRatings; label: string; icon: string }[] = [
  { key: "cleanliness", label: "Cleanliness", icon: "🧹" },
  { key: "food", label: "Food", icon: "🍽️" },
  { key: "value", label: "Value for Money", icon: "💰" },
  { key: "location", label: "Location", icon: "📍" },
  { key: "safety", label: "Safety", icon: "🛡️" },
];

const ratingLabels = ["", "Poor", "Below Average", "Average", "Good", "Excellent"];

function StarSelector({ value, onChange, size = "lg" }: { value: number; onChange: (v: number) => void; size?: "sm" | "lg" }) {
  const [hover, setHover] = useState(0);
  const starSize = size === "lg" ? "w-10 h-10" : "w-6 h-6";

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(star)}
          className="transition-transform hover:scale-110 focus:outline-none"
        >
          <svg
            className={`${starSize} transition-colors ${
              star <= (hover || value) ? "text-[#d4a574]" : "text-[#EDE8DE]"
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </button>
      ))}
      {size === "lg" && value > 0 && (
        <span className="ml-3 text-sm font-medium text-[#666]">{ratingLabels[value]}</span>
      )}
    </div>
  );
}

export default function ReviewForm({ pgName, onSubmit, onClose, submitting, userName }: ReviewFormProps) {
  const [name, setName] = useState(userName || "");
  const [rating, setRating] = useState(0);
  const [categoryRatings, setCategoryRatings] = useState<CategoryRatings>({
    cleanliness: 0,
    food: 0,
    value: 0,
    location: 0,
    safety: 0,
  });
  const [comment, setComment] = useState("");
  const [pros, setPros] = useState("");
  const [cons, setCons] = useState("");
  const [errors, setErrors] = useState<string[]>([]);

  const handleCategoryChange = (key: keyof CategoryRatings, val: number) => {
    setCategoryRatings((prev) => ({ ...prev, [key]: val }));
  };

  const validate = (): boolean => {
    const errs: string[] = [];
    if (!name.trim()) errs.push("Name is required");
    if (rating === 0) errs.push("Overall rating is required");
    if (!comment.trim()) errs.push("Please write a review");
    setErrors(errs);
    return errs.length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({ name: name.trim(), rating, categoryRatings, comment: comment.trim(), pros: pros.trim(), cons: cons.trim() });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative bg-[#FFFDF9] rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-[#FFFDF9] rounded-t-3xl border-b border-black/5 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h3 className="text-lg font-bold text-[#1a1a1a]">Write a Review</h3>
            <p className="text-xs text-[#888] mt-0.5">Share your experience at {pgName}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[#EDE8DE] rounded-full transition">
            <svg className="w-5 h-5 text-[#888]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Errors */}
          {errors.length > 0 && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
              {errors.map((err, i) => (
                <div key={i}>{err}</div>
              ))}
            </div>
          )}

          {/* Name */}
          <div>
            <label className="block text-sm font-semibold text-[#666] mb-1.5">Your Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name or stay anonymous"
              className="premium-input w-full text-sm"
            />
          </div>

          {/* Overall Rating */}
          <div>
            <label className="block text-sm font-semibold text-[#666] mb-2">Overall Rating *</label>
            <StarSelector value={rating} onChange={setRating} size="lg" />
          </div>

          {/* Category Ratings */}
          <div>
            <label className="block text-sm font-semibold text-[#666] mb-3">Rate by Category</label>
            <div className="space-y-3">
              {categories.map(({ key, label, icon }) => (
                <div key={key} className="flex items-center justify-between bg-[#F0EADD] rounded-xl px-4 py-2.5">
                  <span className="text-sm text-[#666] font-medium flex items-center gap-2">
                    <span>{icon}</span> {label}
                  </span>
                  <StarSelector value={categoryRatings[key]} onChange={(v) => handleCategoryChange(key, v)} size="sm" />
                </div>
              ))}
            </div>
          </div>

          {/* Review Text */}
          <div>
            <label className="block text-sm font-semibold text-[#666] mb-1.5">Your Review *</label>
            <textarea
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell others about your experience — what did you like or dislike?"
              className="w-full text-sm resize-none rounded-2xl border border-black/[0.06] focus:border-[#1B5E3B]/30 focus:ring-2 focus:ring-[#1B5E3B]/10 px-4 py-3 bg-transparent outline-none transition-all"
            />
          </div>

          {/* Pros & Cons */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-emerald-700 mb-1.5 flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3H14z" />
                </svg>
                Pros
              </label>
              <textarea
                rows={2}
                value={pros}
                onChange={(e) => setPros(e.target.value)}
                placeholder="Best things about this PG..."
                className="premium-input w-full text-sm resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-red-600 mb-1.5 flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10 15V19a3 3 0 003 3l4-9V2H5.72a2 2 0 00-2 1.7l-1.38 9a2 2 0 002 2.3H10z" />
                </svg>
                Cons
              </label>
              <textarea
                rows={2}
                value={cons}
                onChange={(e) => setCons(e.target.value)}
                placeholder="Things that could improve..."
                className="premium-input w-full text-sm resize-none"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="bg-[#1B5E3B] text-white rounded-full py-3 px-8 text-sm font-semibold flex-1 disabled:opacity-50 hover:bg-[#164a2f] transition-colors"
            >
              {submitting ? "Submitting..." : "Submit Review"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-sm text-[#888] hover:text-[#666] rounded-xl hover:bg-[#EDE8DE] transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
