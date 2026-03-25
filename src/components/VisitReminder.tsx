"use client";

import { useState } from "react";

interface VisitReminderProps {
  pgName: string;
  pgId: string;
}

export default function VisitReminder({ pgName, pgId }: VisitReminderProps) {
  const [added, setAdded] = useState(false);

  const handleAddReminder = () => {
    // Generate a Google Calendar link
    const date = new Date();
    date.setDate(date.getDate() + 3); // Default to 3 days from now
    const start = date.toISOString().replace(/-|:|\.\d+/g, "").slice(0, 15) + "Z";
    date.setHours(date.getHours() + 1);
    const end = date.toISOString().replace(/-|:|\.\d+/g, "").slice(0, 15) + "Z";
    
    const title = encodeURIComponent(`PG Visit: ${pgName} - Castle Living`);
    const details = encodeURIComponent(`Scheduled visit to ${pgName} on Castle Living.\nLink: https://castleliving.in/listing/${pgId}`);
    const location = encodeURIComponent("Bangalore, India");
    
    const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&details=${details}&location=${location}`;
    
    window.open(calendarUrl, "_blank");
    setAdded(true);
    setTimeout(() => setAdded(false), 3000);
  };

  return (
    <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 rounded-2xl p-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-lg shrink-0">
          📅
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-amber-900">Set a Visit Reminder</p>
          <p className="text-xs text-amber-700">Add to your calendar so you don&apos;t forget</p>
        </div>
        <button
          onClick={handleAddReminder}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            added
              ? "bg-emerald-100 text-emerald-700"
              : "bg-amber-500 text-white hover:bg-amber-600"
          }`}
        >
          {added ? "✓ Added!" : "Add to Calendar"}
        </button>
      </div>
    </div>
  );
}
