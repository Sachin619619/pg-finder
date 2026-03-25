"use client";

const emergencyContacts: Record<string, { name: string; phone: string; description: string }[]> = {
  "default": [
    { name: "Police", phone: "100", description: "Emergency police services" },
    { name: "Ambulance", phone: "108", description: "Medical emergencies" },
    { name: "Fire Brigade", phone: "101", description: "Fire and rescue services" },
    { name: "Women Helpline", phone: "181", description: "Women safety helpline (24/7)" },
    { name: "Child Helpline", phone: "1098", description: "Child protection helpline" },
  ],
  "Bangalore": [
    { name: "Bangalore City Police", phone: "+91 80 2222 1085", description: "Non-emergency police" },
    { name: "ECIL Bangalore", phone: "+91 80 2294 3050", description: "Emergency services information" },
  ],
};

export default function EmergencyContacts() {
  const contacts = emergencyContacts["default"];

  return (
    <div className="bg-[#FFFDF9] rounded-2xl border border-black/5 shadow-sm p-5">
      <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
        <span className="text-lg">🚨</span> Emergency Contacts
      </h3>
      <p className="text-xs text-[#888] mb-4">Important numbers for Bangalore. Save these for emergencies.</p>
      <div className="space-y-2">
        {contacts.map((c) => (
          <a
            key={c.name}
            href={`tel:${c.phone}`}
            className="flex items-center justify-between p-3 bg-[#F5F0E8] rounded-xl hover:bg-[#EDE8DE] transition-colors"
          >
            <div>
              <p className="text-sm font-semibold text-gray-900">{c.name}</p>
              <p className="text-xs text-[#888]">{c.description}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-emerald-600">{c.phone}</span>
              <span className="w-7 h-7 bg-emerald-100 rounded-full flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
