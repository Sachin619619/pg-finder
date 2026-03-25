"use client";

const commonQuestions: Record<string, Array<{ q: string; a: string }>> = {
  "default": [
    { q: "What is included in the rent?", a: "Typically includes room, bed, wardrobe, and common area access. Food, electricity, and WiFi may be included depending on the PG." },
    { q: "What is the security deposit?", a: "Usually 1-2 months rent as security deposit, refundable at the time of moving out." },
    { q: "Are there any hidden charges?", a: "Castle verified listings show all-inclusive pricing. Any extra charges (maintenance, electricity) are mentioned upfront." },
    { q: "What are the visiting hours?", a: "Most PGs allow visitors until 8-9 PM. Some have 24/7 access. Ask the owner for specific rules." },
    { q: "Is the PG food vegetarian or non-veg?", a: "This varies by PG. Some offer both, some are pure veg. Check the listing details or ask the owner." },
    { q: "What is the notice period?", a: "Typically 1 month notice is required. Some PGs allow immediate exit with deposit forfeiture." },
  ],
  "Kalyan Nagar": [
    { q: "Is Kalyan Nagar safe for women?", a: "Yes, Kalyan Nagar is considered a safe area with good street lighting and an active residents association." },
    { q: "How far is Kalyan Nagar from Manyata Tech Park?", a: "Approximately 8-10 km by road. With traffic, it takes about 30-45 minutes." },
  ],
};

export default function PeopleAlsoAsk({ area }: { area: string }) {
  const questions = commonQuestions[area] || commonQuestions["default"];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
        <span className="text-lg">❓</span> People Also Ask
      </h3>
      <div className="space-y-2">
        {questions.map((item, i) => (
          <details key={i} className="group">
            <summary className="flex items-center justify-between cursor-pointer p-3 rounded-xl hover:bg-gray-50 transition-colors">
              <span className="text-sm font-medium text-gray-800">{item.q}</span>
              <svg className="w-4 h-4 text-gray-400 group-open:rotate-180 transition-transform shrink-0 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path d="M6 9l6 6 6-6" />
              </svg>
            </summary>
            <p className="text-xs text-gray-600 leading-relaxed px-3 pb-3">{item.a}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
