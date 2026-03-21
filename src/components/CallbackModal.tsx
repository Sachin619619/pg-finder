"use client";

import { useState } from "react";
import { submitCallback } from "@/lib/db";

export default function CallbackModal({ pgId, pgName, onClose }: { pgId: string; pgName: string; onClose: () => void }) {
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  if (submitted) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
        <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center animate-slide-up" onClick={(e) => e.stopPropagation()}>
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Callback Requested!</h3>
          <p className="text-gray-500 text-sm mb-6">The PG owner will call you within 30 minutes.</p>
          <button onClick={onClose} className="btn-premium w-full">Done</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl p-8 max-w-sm w-full animate-slide-up" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-violet-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <svg className="w-7 h-7 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900">Request Callback</h3>
          <p className="text-sm text-gray-400 mt-1">{pgName}</p>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); submitCallback(pgId, name, phone).then(() => setSubmitted(true)); }} className="space-y-4">
          <input required type="text" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} className="premium-input w-full" />
          <input required type="tel" placeholder="Phone number" value={phone} onChange={(e) => setPhone(e.target.value)} className="premium-input w-full" />
          <select className="premium-input w-full text-sm text-gray-600">
            <option>Call me anytime</option>
            <option>Morning (9AM - 12PM)</option>
            <option>Afternoon (12PM - 4PM)</option>
            <option>Evening (4PM - 8PM)</option>
          </select>
          <button type="submit" className="btn-premium w-full">Request Callback</button>
        </form>
      </div>
    </div>
  );
}
