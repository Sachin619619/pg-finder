"use client";

import { useState } from "react";

export default function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 800));
    setSubmitting(false);
    setSubscribed(true);
    
    setTimeout(() => {
      setSubscribed(false);
      setEmail("");
    }, 4000);
  };

  return (
    <section className="py-20 bg-[#FFFDF9]">
      <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#EDE8DE] rounded-3xl p-8 sm:p-12 border border-black/[0.04] text-center">
        <div className="text-4xl mb-4">📬</div>
        <h2 className="font-serif text-2xl sm:text-3xl text-black mb-3">Stay in the Loop</h2>
        <p className="text-[#888] text-sm mb-8 max-w-md mx-auto">
          Get weekly updates on new PG listings, price drops, and neighborhood insights. No spam — unsubscribe anytime.
        </p>

        {!subscribed ? (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="flex-1 px-5 py-4 rounded-full bg-white border border-black/[0.06] text-black placeholder:text-[#999] text-sm focus:outline-none focus:border-[#1B5E3B]/30 transition-colors"
            />
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-4 bg-[#1B5E3B] text-white rounded-full font-semibold text-sm hover:shadow-lg transition-all disabled:opacity-60"
            >
              {submitting ? "Subscribing..." : "Subscribe"}
            </button>
          </form>
        ) : (
          <div className="flex items-center justify-center gap-2 py-4 text-emerald-600">
            <span className="text-2xl">✓</span>
            <span className="font-semibold">You&apos;re subscribed! Check your email.</span>
          </div>
        )}

        <p className="text-[#d4c9a8] text-xs mt-4">
          Join 2,500+ subscribers. We respect your privacy.
        </p>
        </div>
      </div>
    </section>
  );
}
