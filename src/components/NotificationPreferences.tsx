"use client";

import { useState } from "react";

interface NotificationPreferencesProps {
  pgId?: string;
  pgName?: string;
  initialPrefs?: NotificationPref;
  onSave?: (prefs: NotificationPref) => void;
}

export type NotificationPref = {
  priceDrop: boolean;
  availability: boolean;
  newReview: boolean;
  visitReminder: boolean;
  whatsapp: boolean;
  telegram: boolean;
  email: boolean;
  phone: string;
};

const defaultPrefs: NotificationPref = {
  priceDrop: true,
  availability: true,
  newReview: false,
  visitReminder: true,
  whatsapp: false,
  telegram: false,
  email: true,
  phone: "",
};

function WhatsAppIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  );
}

function TelegramIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
    </svg>
  );
}

function MailIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  );
}

export default function NotificationPreferences({ initialPrefs, onSave }: NotificationPreferencesProps) {
  const [prefs, setPrefs] = useState<NotificationPref>(initialPrefs || defaultPrefs);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const toggle = (key: keyof NotificationPref) => {
    setPrefs(p => ({ ...p, [key]: !p[key] }));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 800));
    onSave?.(prefs);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
          <span className="text-lg">🔔</span> Notification Preferences
        </h3>
        {saved && (
          <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
            ✓ Saved
          </span>
        )}
      </div>

      {/* Alert types */}
      <div className="space-y-3 mb-5">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Alert Types</p>
        {([
          { key: "priceDrop" as const, label: "Price Drop Alerts", emoji: "💰", desc: "Get notified when prices decrease" },
          { key: "availability" as const, label: "Availability Updates", emoji: "🛏️", desc: "Know when rooms open up" },
          { key: "newReview" as const, label: "New Reviews", emoji: "⭐", desc: "When someone leaves a review" },
          { key: "visitReminder" as const, label: "Visit Reminders", emoji: "📅", desc: "Reminder before scheduled visits" },
        ]).map(item => (
          <div key={item.key} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-3">
              <span className="text-xl">{item.emoji}</span>
              <div>
                <p className="text-sm font-semibold text-gray-800">{item.label}</p>
                <p className="text-xs text-gray-500">{item.desc}</p>
              </div>
            </div>
            <button
              onClick={() => toggle(item.key)}
              className={`w-12 h-7 rounded-full relative transition-all ${
                prefs[item.key] ? "bg-emerald-500" : "bg-gray-300"
              }`}
            >
              <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-all ${
                prefs[item.key] ? "right-1" : "left-1"
              }`} />
            </button>
          </div>
        ))}
      </div>

      {/* Notification channels */}
      <div className="space-y-3 mb-5">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Notification Channels</p>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => toggle("whatsapp")}
            className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all ${
              prefs.whatsapp
                ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                : "border-gray-100 text-gray-500 hover:border-gray-200"
            }`}
          >
            <span className={prefs.whatsapp ? "text-emerald-600" : ""}><WhatsAppIcon /></span>
            <span className="text-xs font-semibold">WhatsApp</span>
            <div className={`w-2 h-2 rounded-full ${prefs.whatsapp ? "bg-emerald-500" : "bg-gray-300"}`} />
          </button>

          <button
            onClick={() => toggle("telegram")}
            className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all ${
              prefs.telegram
                ? "border-blue-500 bg-blue-50 text-blue-700"
                : "border-gray-100 text-gray-500 hover:border-gray-200"
            }`}
          >
            <span className={prefs.telegram ? "text-blue-600" : ""}><TelegramIcon /></span>
            <span className="text-xs font-semibold">Telegram</span>
            <div className={`w-2 h-2 rounded-full ${prefs.telegram ? "bg-blue-500" : "bg-gray-300"}`} />
          </button>

          <button
            onClick={() => toggle("email")}
            className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all ${
              prefs.email
                ? "border-amber-500 bg-amber-50 text-amber-700"
                : "border-gray-100 text-gray-500 hover:border-gray-200"
            }`}
          >
            <span className={prefs.email ? "text-amber-600" : ""}><MailIcon /></span>
            <span className="text-xs font-semibold">Email</span>
            <div className={`w-2 h-2 rounded-full ${prefs.email ? "bg-amber-500" : "bg-gray-300"}`}
          </button>
        </div>
      </div>

      {/* Phone input */}
      {(prefs.whatsapp || prefs.telegram) && (
        <div className="mb-5">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Phone Number</p>
          <input
            type="tel"
            value={prefs.phone}
            onChange={(e) => setPrefs(p => ({ ...p, phone: e.target.value }))}
            placeholder="+91 98765 43210"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:border-emerald-400 focus:bg-white transition-all"
          />
          <p className="text-xs text-gray-400 mt-1.5">
            {prefs.whatsapp && prefs.telegram
              ? "Updates will be sent via both WhatsApp and Telegram"
              : prefs.whatsapp
              ? "We'll send updates to your WhatsApp"
              : "We'll send updates to your Telegram"
            }
          </p>
        </div>
      )}

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full py-3 rounded-xl bg-[#1B1C15] text-white text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-60 transition-opacity"
      >
        {saving ? (
          <>
            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Saving...
          </>
        ) : "Save Preferences"}
      </button>
    </div>
  );
}
