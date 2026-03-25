"use client";

import { useEffect, useState } from "react";

const recentActivities = [
  { text: "Just booked in Koramangala", time: "2 min ago", emoji: "✅" },
  { text: "Virtual tour completed in Bellandur", time: "5 min ago", emoji: "🎥" },
  { text: "New review for Sunrise PG", time: "12 min ago", emoji: "⭐" },
  { text: "Room booked in HSR Layout", time: "18 min ago", emoji: "🛏️" },
  { text: "Virtual tour completed in Whitefield", time: "23 min ago", emoji: "🎥" },
  { text: "Just booked in Indiranagar", time: "28 min ago", emoji: "✅" },
  { text: "New inquiry for Starlight PG", time: "35 min ago", emoji: "💬" },
  { text: "Review added for Sunrise PG", time: "42 min ago", emoji: "⭐" },
];

export default function SocialProof() {
  const [activity, setActivity] = useState(recentActivities[0]);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setActivity(recentActivities[Math.floor(Math.random() * recentActivities.length)]);
        setVisible(true);
      }, 500);
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed bottom-24 right-4 md:right-6 z-40 max-w-xs">
      <div
        className={`bg-white/95 backdrop-blur-xl border border-gray-200 rounded-2xl p-4 shadow-xl shadow-black/10 transition-all duration-500 ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
        }`}
      >
        <div className="flex items-start gap-3">
          <span className="text-xl">{activity.emoji}</span>
          <div>
            <p className="text-sm font-medium text-gray-900">{activity.text}</p>
            <p className="text-[10px] text-gray-400 mt-0.5">{activity.time}</p>
          </div>
          <div className="flex gap-1 ml-auto">
            {[0, 1, 2].map(i => (
              <div
                key={i}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${visible ? "bg-emerald-400" : "bg-gray-200"}`}
                style={{ transitionDelay: `${i * 100}ms` }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
