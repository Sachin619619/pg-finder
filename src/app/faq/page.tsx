"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import AnimatedBanner from "@/components/AnimatedBanner";

type FAQItem = { question: string; answer: string };

type FAQSection = {
  title: string;
  emoji: string;
  gradient: string;
  items: FAQItem[];
};

const faqData: FAQSection[] = [
  {
    title: "For Tenants",
    emoji: "🏠",
    gradient: "from-[#1a1a1a] to-[#2a2b22]",
    items: [
      {
        question: "How do I search for a PG on Castle?",
        answer:
          "Use the search bar on the homepage to look for PGs by area, budget, amenities, or room type. You can also explore by popular neighbourhoods or use smart filters to narrow your results.",
      },
      {
        question: "How do I book a PG?",
        answer:
          "Once you find a PG you like, click on it to view all the details. You can then contact the owner directly via phone or WhatsApp to schedule a visit and finalize your booking.",
      },
      {
        question: "Is it free to use Castle as a tenant?",
        answer:
          "Yes! Searching, comparing, and contacting PG owners on Castle is completely free for tenants. We do not charge any brokerage or service fee.",
      },
      {
        question: "How do I contact a PG owner?",
        answer:
          "Each listing page has a 'Contact Owner' button with the owner's phone number and WhatsApp link. You can reach out directly to ask questions or schedule a visit.",
      },
      {
        question: "How do I write a review for a PG?",
        answer:
          "After visiting or staying at a PG, go to the listing page and scroll to the reviews section. Click 'Write a Review', rate the PG on various parameters, and share your experience.",
      },
      {
        question: "What if a listing seems fake or misleading?",
        answer:
          "You can report any listing by clicking the 'Report' button on the listing page. Our team reviews all reports within 24 hours and takes appropriate action, including removing fraudulent listings.",
      },
    ],
  },
  {
    title: "For Owners",
    emoji: "🔑",
    gradient: "bg-[#1a1a1a]",
    items: [
      {
        question: "How do I list my PG on Castle?",
        answer:
          "Click on 'List Your PG' in the navigation bar, create an owner account, and fill in the details about your property — including photos, pricing, amenities, and house rules. Your listing goes live after a quick review.",
      },
      {
        question: "How much does it cost to list a PG?",
        answer:
          "Basic listings are free. We also offer premium plans with enhanced visibility, featured placement, and analytics starting at affordable monthly rates. Check our pricing page for details.",
      },
      {
        question: "How do I get my PG verified?",
        answer:
          "Once you list your PG, you can request verification. Our team will verify your property details, ownership documents, and photos. Verified listings get a trust badge and rank higher in search results.",
      },
      {
        question: "How do I manage bookings and inquiries?",
        answer:
          "Use the Owner Dashboard to track all inquiries, view tenant profiles, manage your listings, and respond to messages. You'll also receive email and SMS notifications for new inquiries.",
      },
      {
        question: "How do I respond to reviews?",
        answer:
          "Go to your Owner Dashboard, navigate to the Reviews section, and click 'Respond' on any review. Responding to reviews — both positive and negative — helps build trust with potential tenants.",
      },
    ],
  },
  {
    title: "For Agents",
    emoji: "🤝",
    gradient: "from-emerald-500 to-teal-500",
    items: [
      {
        question: "How do I become an agent on Castle?",
        answer:
          "Sign up with an agent account, complete your profile, and submit your documents for verification. Once approved, you can list properties on behalf of owners and manage multiple listings from your Agent Dashboard.",
      },
      {
        question: "How does agent verification work?",
        answer:
          "We verify your identity, professional credentials, and any relevant licenses. Verified agents get a special badge, access to premium tools, and higher visibility on the platform.",
      },
      {
        question: "How do agent payouts work?",
        answer:
          "Agents earn commissions on successful referrals and bookings facilitated through the platform. Payouts are processed monthly to your registered bank account with detailed transaction reports.",
      },
    ],
  },
  {
    title: "General",
    emoji: "💡",
    gradient: "from-orange-500 to-amber-500",
    items: [
      {
        question: "What is Castle?",
        answer:
          "Castle is Bangalore's most trusted platform to find PG accommodations, hostels, and co-living spaces. We connect tenants with verified property owners and agents to make finding a home simple and hassle-free.",
      },
      {
        question: "Which areas does Castle cover?",
        answer:
          "Castle currently covers all major areas in Bangalore including Koramangala, HSR Layout, Indiranagar, Whitefield, Bellandur, BTM Layout, Electronic City, Marathahalli, Hebbal, Kalyan Nagar, and many more.",
      },
      {
        question: "How do I delete my account?",
        answer:
          "Go to your Profile settings and click 'Delete Account'. You'll be asked to confirm. All your data, saved listings, and reviews will be permanently removed within 30 days as per our data retention policy.",
      },
      {
        question: "How does Castle handle my data and privacy?",
        answer:
          "We take data privacy seriously. Your personal information is encrypted and never shared with third parties without your consent. Read our Privacy Policy for complete details on how we collect, store, and protect your data.",
      },
    ],
  },
];

function AccordionItem({ item, isOpen, onToggle }: { item: FAQItem; isOpen: boolean; onToggle: () => void }) {
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-5 px-1 text-left group"
      >
        <span className="text-sm font-semibold text-gray-900 group-hover:text-[#1a1a1a] transition-colors pr-4">
          {item.question}
        </span>
        <span
          className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-300 ${
            isOpen
              ? "bg-[#1a1a1a] text-white rotate-180"
              : "bg-gray-100 text-gray-400"
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${
          isOpen ? "max-h-96 pb-5" : "max-h-0"
        }`}
      >
        <p className="text-sm text-gray-500 leading-relaxed px-1">
          {item.answer}
        </p>
      </div>
    </div>
  );
}

export default function FAQPage() {
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});

  useEffect(() => {
    document.title = "FAQ | Castle";
  }, []);

  const toggleItem = (key: string) => {
    setOpenItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="pt-28 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gray-100/80 text-[#1a1a1a] text-xs font-semibold mb-4">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              Help Center
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-3">
              Frequently Asked Questions
            </h1>
            <p className="text-gray-500 text-sm max-w-lg mx-auto">
              Everything you need to know about Castle. Can&apos;t find your answer? Reach out to our support team.
            </p>
          </div>

          {/* FAQ Sections */}
          <div className="space-y-8">
            {faqData.map((section) => (
              <div key={section.title}>
                {/* Section Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-9 h-9 bg-gradient-to-br ${section.gradient} rounded-xl flex items-center justify-center shadow-lg`}>
                    <span className="text-lg">{section.emoji}</span>
                  </div>
                  <h2 className="text-lg font-bold text-gray-900">{section.title}</h2>
                </div>

                {/* Accordion Card */}
                <div className="premium-card !rounded-2xl p-5 sm:p-7">
                  {section.items.map((item, idx) => {
                    const key = `${section.title}-${idx}`;
                    return (
                      <AccordionItem
                        key={key}
                        item={item}
                        isOpen={!!openItems[key]}
                        onToggle={() => toggleItem(key)}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Still have questions */}
          <div className="mt-12 premium-card !rounded-2xl p-8 sm:p-10 text-center">
            <div className="w-14 h-14 bg-[#1a1a1a] rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-black/20">
              <span className="text-2xl">💬</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Still have questions?</h3>
            <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
              Our support team is always ready to help you out with any queries.
            </p>
            <a
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#1a1a1a] text-white text-sm font-semibold rounded-2xl shadow-lg shadow-black/20 hover:shadow-black/20 hover:scale-[1.02] transition-all"
            >
              Contact Us
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </a>
          </div>
        </div>
        <AnimatedBanner seed={40} />
      </main>
    </div>
  );
}
