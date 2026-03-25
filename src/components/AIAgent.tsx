"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import type { PGListing } from "@/data/listings";
import { useAuth } from "@/lib/auth";
import { authFetch } from "@/lib/auth-fetch";

type AgentAction = {
  action: string;
  data: Record<string, unknown>;
};

type Message = {
  role: "user" | "assistant";
  content: string;
  listings?: PGListing[];
  action?: AgentAction;
  actionResult?: Record<string, unknown>;
};

const QUICK_PROMPTS = [
  "🏠 PGs under ₹8000",
  "📍 Koramangala PGs",
  "🍽️ Food included PGs",
  "👩 Female-only PGs",
  "📋 My booking status",
  "🔔 Set price alert",
];

const WELCOME_MSG: Message = {
  role: "assistant",
  content: "Hey! 👋 I'm Castle AI. I can find PGs, request callbacks, send stay requests, set price alerts, check your status — ask me anything!",
};

const WELCOME_SUGGESTIONS = [
  { icon: "🏠", text: "Show PGs under ₹8000" },
  { icon: "📍", text: "Find in Koramangala" },
  { icon: "⭐", text: "Top rated PGs" },
  { icon: "🍽️", text: "PGs with food included" },
];

function getStorageKey(userId: string) {
  return `pgai_messages_${userId}`;
}

function loadMessages(userId: string | undefined): Message[] {
  if (typeof window === "undefined" || !userId) return [WELCOME_MSG];
  try {
    const saved = sessionStorage.getItem(getStorageKey(userId));
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return [WELCOME_MSG];
}

const AUTH_PAGES = ["/login", "/signup", "/forgot-password", "/reset-password"];

export default function AIAgent() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, profile, loading: authLoading } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([WELCOME_MSG]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const sendingRef = useRef(false);
  const messagesRef = useRef(messages);
  const prevUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    const userId = user?.id || null;
    if (userId !== prevUserIdRef.current) {
      prevUserIdRef.current = userId;
      if (userId) {
        setMessages(loadMessages(userId));
      } else {
        setMessages([WELCOME_MSG]);
        setOpen(false);
      }
    }
  }, [user]);

  useEffect(() => {
    messagesRef.current = messages;
    if (user?.id) {
      try {
        sessionStorage.setItem(getStorageKey(user.id), JSON.stringify(messages));
      } catch {}
    }
  }, [messages, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || sendingRef.current || loading) return;
    sendingRef.current = true;
    setInput("");
    setLoading(true);
    const userMsg: Message = { role: "user", content: trimmed };
    setMessages(prev => [...prev, userMsg]);
    try {
      const res = await authFetch("/api/agent/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed, userId: user?.id }),
      });
      if (!res.ok) throw new Error("Agent error");
      const data = await res.json();
      setMessages(prev => [
        ...prev,
        {
          role: "assistant",
          content: data.message || "I couldn't process that. Try again!",
          listings: data.listings,
          action: data.action,
          actionResult: data.actionResult,
        },
      ]);
    } catch {
      setMessages(prev => [
        ...prev,
        { role: "assistant", content: "Something went wrong. Please try again! 😅" },
      ]);
    } finally {
      setLoading(false);
      sendingRef.current = false;
    }
  }, [user, loading]);

  const executeAction = useCallback((action: AgentAction) => {
    switch (action.action) {
      case "call":
        if (action.data.phone) window.location.href = `tel:${action.data.phone}`;
        break;
      case "whatsapp": {
        const phone = action.data.phone as string;
        const name = action.data.name as string;
        const msg = encodeURIComponent(`Hi! I'm interested in ${name} on Castle Living. Is it available?`);
        window.open(`https://wa.me/91${phone}?text=${msg}`, "_blank");
        break;
      }
      case "compare":
        router.push("/compare");
        setOpen(false);
        break;
      case "navigate_optional":
        router.push(action.data.url as string);
        setOpen(false);
        break;
      case "callback":
        sendMessage(`Request callback for ${action.data.name}`);
        break;
      case "request_stay":
        sendMessage(`I want to stay at ${action.data.name}`);
        break;
      case "book":
        router.push(`/listing/${action.data.id}`);
        setOpen(false);
        break;
    }
  }, [router, sendMessage]);

  const handleRemovePg = useCallback((pgId: string) => {
    sendMessage(`remove me from ${pgId}`);
  }, [sendMessage]);

  const clearChat = () => {
    if (user?.id) sessionStorage.removeItem(getStorageKey(user.id));
    setMessages([WELCOME_MSG]);
  };

  if (authLoading || !user || AUTH_PAGES.includes(pathname)) return null;

  const isFirstMessage = messages.length <= 1;

  return (
    <>
      {/* FAB Button */}
      <button
        onClick={() => setOpen(!open)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl transition-all duration-300 ${
          open
            ? "bg-gray-800 rotate-0 scale-90"
            : "bg-[#1a1a1a] hover:scale-110 shadow-black/20"
        }`}
        aria-label="AI Assistant"
      >
        {open ? (
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
          </svg>
        )}
      </button>

      {/* Chat Panel */}
      {open && (
        <div
          className="fixed bottom-20 sm:bottom-24 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[420px] h-[65vh] sm:h-[70vh] max-h-[640px] flex flex-col bg-[#FFFAEC] rounded-3xl shadow-2xl border border-[black/5] overflow-hidden animate-slide-up isolate"
          style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
        >
          {/* Header */}
          <div className="px-4 py-3 bg-[#1a1a1a] flex items-center gap-3 flex-shrink-0">
            <div className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-white font-bold text-sm">Castle AI</h3>
              <p className="text-white/50 text-[10px]">Search • Book • Callback • Alerts</p>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-white/50 text-[10px]">{profile?.name?.split(" ")[0] || "You"}</span>
            </div>
            <button
              onClick={clearChat}
              className="p-1.5 text-white/40 hover:text-red-400 transition-colors flex-shrink-0"
              title="Clear chat"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 scrollbar-thin bg-[#FFFAEC]">
            {messages.map((msg, i) => (
              <div key={i}>
                <div className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-[13px] leading-relaxed ${
                      msg.role === "user"
                        ? "bg-[#1a1a1a] text-white rounded-br-md"
                        : "bg-gray-100 text-gray-800 rounded-bl-md"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>

                {msg.actionResult && (
                  <div className="mt-1.5 ml-2">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold bg-emerald-50 text-emerald-600 rounded-lg">
                      ✅ {msg.actionResult.type === "callback_success" && "Callback requested"}
                      {msg.actionResult.type === "request_stay_success" && "Stay request sent"}
                      {msg.actionResult.type === "price_alert_success" && "Price alert set"}
                      {msg.actionResult.type === "status_shown" && "Status loaded"}
                    </span>
                  </div>
                )}

                {msg.action && !["navigate", "save", "unsave"].includes(msg.action.action) && (
                  <div className="mt-2 ml-2 flex flex-wrap gap-1.5">
                    {msg.action.action === "call" && (
                      <button onClick={() => executeAction(msg.action!)} className="px-3 py-1.5 text-xs font-semibold bg-[#1a1a1a] text-white rounded-xl hover:bg-[#333333] transition">
                        📞 Call {String(msg.action.data.name || "Owner")}
                      </button>
                    )}
                    {msg.action.action === "whatsapp" && (
                      <button onClick={() => executeAction(msg.action!)} className="px-3 py-1.5 text-xs font-semibold bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition">
                        💬 WhatsApp {(msg.action.data.name as string) || "Owner"}
                      </button>
                    )}
                    {msg.action.action === "compare" && (
                      <button onClick={() => executeAction(msg.action!)} className="px-3 py-1.5 text-xs font-semibold bg-[#1a1a1a] text-white rounded-xl hover:bg-[#333333] transition">
                        📊 Open Comparison
                      </button>
                    )}
                    {msg.action.action === "navigate_optional" && (
                      <button onClick={() => { router.push(msg.action!.data.url as string); setOpen(false); }} className="px-3 py-1.5 text-xs font-semibold bg-[#1a1a1a] text-white rounded-xl hover:bg-[#333333] transition">
                        {(msg.action.data.label as string) || "Open"}
                      </button>
                    )}
                    {msg.action.action === "confirm_remove_pg" && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleRemovePg(msg.action!.data.currentPgId as string)}
                          className="px-3 py-1.5 text-xs font-semibold bg-red-500 text-white rounded-xl hover:bg-red-600 transition"
                        >
                          Yes, Remove Me
                        </button>
                        <button
                          onClick={() => setMessages(prev => [...prev, { role: "assistant", content: "Okay, cancelled! You're still linked to your PG 🏠" }])}
                          className="px-3 py-1.5 text-xs font-semibold bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {msg.listings && msg.listings.length > 0 && (
                  <div className="mt-2 space-y-2">
                    {msg.listings.map((pg) => (
                      <div
                        key={pg.id}
                        className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:border-amber-300 transition-all hover:shadow-md"
                      >
                        <Link href={`/listing/${pg.id}`} onClick={() => setOpen(false)} className="flex items-start gap-3 p-3">
                          <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-gray-200">
                            <img src={pg.images[0]} alt={pg.name} className="w-full h-full object-cover hover:scale-110 transition-transform" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-sm text-gray-900 truncate">{pg.name}</h4>
                            <p className="text-[11px] text-gray-400 mt-0.5">📍 {pg.area} • {pg.type} • {pg.gender}</p>
                            <div className="flex items-center justify-between mt-1">
                              <span className="text-sm font-bold text-[#1a1a1a]">₹{pg.price.toLocaleString()}<span className="text-[10px] font-normal text-gray-400">/mo</span></span>
                              <span className="text-[11px] text-amber-500">⭐ {pg.rating}</span>
                            </div>
                          </div>
                        </Link>
                        <div className="flex border-t border-gray-100">
                          <button
                            onClick={() => {
                              const saved = JSON.parse(localStorage.getItem("savedPGs") || "[]");
                              if (!saved.includes(pg.id)) { saved.push(pg.id); localStorage.setItem("savedPGs", JSON.stringify(saved)); }
                              setMessages(prev => [...prev, { role: "assistant", content: `Saved ${pg.name} ❤️` }]);
                            }}
                            className="flex-1 py-2 text-[11px] font-medium text-pink-500 hover:bg-pink-50 transition"
                          >
                            ❤️ Save
                          </button>
                          <button
                            onClick={() => sendMessage(`I want to stay at ${pg.name}`)}
                            className="flex-1 py-2 text-[11px] font-medium text-[#1a1a1a] hover:bg-amber-50 transition border-l border-gray-100"
                          >
                            🏠 Request Stay
                          </button>
                          <button
                            onClick={() => sendMessage(`Request callback for ${pg.name}`)}
                            className="flex-1 py-2 text-[11px] font-medium text-emerald-600 hover:bg-emerald-50 transition border-l border-gray-100"
                          >
                            📞 Callback
                          </button>
                          <button
                            onClick={() => {
                              const msgText = encodeURIComponent(`Hi! I'm interested in ${pg.name}. Is it available?`);
                              window.open(`https://wa.me/91${pg.contactPhone}?text=${msgText}`, "_blank");
                            }}
                            className="flex-1 py-2 text-[11px] font-medium text-green-600 hover:bg-green-50 transition border-l border-gray-100"
                          >
                            💬 WhatsApp
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 px-4 py-3 rounded-2xl rounded-bl-md">
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 bg-[#1a1a1a] rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-[#1a1a1a] rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                    <div className="w-2 h-2 bg-[#1a1a1a] rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Welcome suggestions — only on first message */}
          {isFirstMessage && (
            <div className="px-3 pb-2 bg-[#FFFAEC] border-t border-[black/5]">
              <p className="text-[10px] text-gray-400 font-medium mb-2 px-1">Try asking me:</p>
              <div className="flex flex-wrap gap-1.5">
                {WELCOME_SUGGESTIONS.map((s) => (
                  <button
                    key={s.text}
                    onClick={() => sendMessage(s.text)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium bg-[#1a1a1a] text-white rounded-full hover:bg-[#333333] transition"
                  >
                    <span>{s.icon}</span>
                    <span>{s.text}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quick prompts — only on first message */}
          {isFirstMessage && (
            <div className="px-3 pb-2 bg-[#FFFAEC]">
              <div className="flex gap-1.5 overflow-x-auto pb-1.5 scrollbar-none">
                {QUICK_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => sendMessage(prompt)}
                    className="flex-shrink-0 px-2.5 py-1.5 text-[11px] font-medium bg-gray-100 text-[#1a1a1a] rounded-full hover:bg-gray-200 transition whitespace-nowrap"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="px-3 py-2.5 border-t border-[black/5] bg-[#FFFAEC] flex-shrink-0" style={{ paddingBottom: "max(0.625rem, env(safe-area-inset-bottom))" }}>
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage(input);
                  }
                }}
                placeholder="Ask anything — search, book, callback..."
                className="flex-1 px-3.5 py-2.5 text-sm bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#1a1a1a]/20 focus:border-[#1a1a1a]/30 text-gray-900 placeholder-gray-400 transition-all"
                disabled={loading}
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={loading || !input.trim()}
                className="w-10 h-10 bg-[#1a1a1a] text-white rounded-xl flex items-center justify-center disabled:opacity-40 hover:opacity-90 transition-all flex-shrink-0"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19V5m0 0l-7 7m7-7l7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
