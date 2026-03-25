"use client";

const changelog = [
  { date: "Mar 25", emoji: "✨", title: "Castle Pro Badges", desc: "Premium verified listings now show Castle Pro badges for easy identification." },
  { date: "Mar 24", emoji: "🎥", title: "Virtual Tour Booking", desc: "Book virtual tours directly from listing pages. Schedule at your convenience." },
  { date: "Mar 23", emoji: "🛡️", title: "Safety Scores", desc: "Every area now has detailed safety scores based on crime data and community feedback." },
  { date: "Mar 22", emoji: "🚇", title: "Metro Proximity", desc: "See how close each PG is to the nearest metro station with walking time." },
  { date: "Mar 21", emoji: "⭐", title: "Castle Score", desc: "New overall quality rating for every PG combining safety, value, amenities, and reviews." },
];

export default function WhatsNew() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
        <span className="text-lg">✨</span> What&apos;s New on Castle
      </h3>
      <div className="space-y-3">
        {changelog.map((item) => (
          <div key={item.date + item.title} className="flex gap-3">
            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm shrink-0">
              {item.emoji}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-xs font-bold text-[#1a1a1a]">{item.title}</span>
                <span className="text-[10px] text-gray-400">{item.date}</span>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
