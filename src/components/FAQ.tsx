"use client";

import { useState } from "react";

const faqs = [
  {
    q: "What is Castle Living?",
    a: "Castle Living is Bangalore's premier PG (Paying Guest) finder platform. We help students and working professionals find verified, quality PG accommodations across 15+ areas in Bangalore.",
  },
  {
    q: "Are all listings verified?",
    a: "Yes! Every PG listing on Castle goes through our verification process. We verify photos, amenities, pricing, and owner credentials before publishing.",
  },
  {
    q: "Is there any brokerage or hidden fee?",
    a: "Zero brokerage! Castle Living connects you directly with PG owners. No middlemen, no hidden charges. What you see is what you pay.",
  },
  {
    q: "How does the visit booking work?",
    a: "Simply click 'Schedule Visit' on any PG listing, pick a date and time that works for you, and we'll coordinate with the PG owner. You'll receive a confirmation with all the details.",
  },
  {
    q: "Can I compare multiple PGs?",
    a: "Absolutely! Use the 'Compare' button on any PG listing to add it to your comparison list. You can compare up to 3 PGs side-by-side with detailed metrics.",
  },
  {
    q: "How does the roommate finder work?",
    a: "Our roommate finder helps you find compatible roommates based on lifestyle preferences, budget, preferred area, and more. Create a profile and let Castle find your perfect match!",
  },
  {
    q: "What safety features do you show for each area?",
    a: "We provide comprehensive safety scores for each area based on crime rates, street lighting, police presence, and community feedback. Transport connectivity (metro, bus) is also shown.",
  },
  {
    q: "How do I list my PG on Castle?",
    a: "PG owners can sign up for free on Castle Living. Once verified, you can list your PG with photos, amenities, pricing, and room availability. Reach quality tenants directly!",
  },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="py-20 bg-[#F0EADD]">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="text-xs font-semibold text-black/40 uppercase tracking-widest mb-3 inline-block">Help Center</span>
          <h2 className="font-serif text-3xl sm:text-4xl text-black mb-3 tracking-tight">Frequently Asked Questions</h2>
          <p className="text-black/50 text-sm">Everything you need to know about Castle Living</p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className="bg-[#FFFDF9] rounded-2xl border border-black/5 overflow-hidden">
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full text-left p-5 flex items-center justify-between gap-4"
              >
                <span className="font-semibold text-[#1a1a1a] text-sm">{faq.q}</span>
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold shrink-0 transition-all ${
                  open === i ? "bg-[#1a1a1a] text-white rotate-45" : "bg-[#F0EADD] text-[#888]"
                }`}>
                  +
                </span>
              </button>
              {open === i && (
                <div className="px-5 pb-5">
                  <p className="text-sm text-[#888] leading-relaxed">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="text-center mt-8">
          <p className="text-sm text-[#888] mb-4">Still have questions?</p>
          <a
            href="mailto:hello@castleliving.in"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#1a1a1a] text-white rounded-xl text-sm font-semibold hover:bg-[#2d2e25] transition"
          >
            <span>💬</span>
            Chat with us
          </a>
        </div>
      </div>
    </section>
  );
}
