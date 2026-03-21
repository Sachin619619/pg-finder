"use client";

import { useState } from "react";
import type { Review } from "@/lib/db";

export default function ReviewSection({ reviews, pgName }: { reviews: Review[]; pgName: string }) {
  const [showForm, setShowForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="premium-card !rounded-2xl p-6 sm:p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Reviews ({reviews.length})</h2>
        <button onClick={() => setShowForm(!showForm)} className="btn-premium !py-2 !px-5 !text-sm">
          Write a Review
        </button>
      </div>

      {showForm && !submitted && (
        <form
          onSubmit={(e) => { e.preventDefault(); setSubmitted(true); setShowForm(false); }}
          className="bg-gray-50 rounded-2xl p-5 mb-6 space-y-4 animate-slide-up"
        >
          <div className="grid grid-cols-2 gap-4">
            <input required placeholder="Your name" className="premium-input w-full text-sm" />
            <select required className="premium-input w-full text-sm">
              <option value="">Rating</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>
          <textarea required rows={3} placeholder={`Share your experience at ${pgName}...`} className="premium-input w-full text-sm resize-none" />
          <div className="flex gap-3">
            <button type="submit" className="btn-premium !py-2.5 !px-6 !text-sm">Submit Review</button>
            <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2.5 text-sm text-gray-500 hover:text-gray-700">Cancel</button>
          </div>
        </form>
      )}

      {submitted && (
        <div className="bg-emerald-50 rounded-2xl p-4 mb-6 text-emerald-700 text-sm font-medium animate-slide-up">
          Thanks for your review! It will appear after verification.
        </div>
      )}

      {reviews.length > 0 ? (
        <div className="space-y-5">
          {reviews.map((r) => (
            <div key={r.id} className="border-b border-gray-100 pb-5 last:border-0 last:pb-0">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-violet-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {r.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900 text-sm">{r.name}</span>
                      {r.verified && (
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
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-400 text-sm text-center py-8">No reviews yet. Be the first to review!</p>
      )}
    </div>
  );
}
