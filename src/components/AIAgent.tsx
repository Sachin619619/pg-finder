"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { PGListing } from "@/data/listings";

type AgentAction = {
  action: string;
  data: Record<string, unknown>;
};

type Message = {
  role: "user" | "assistant";
  content: string;
  listings?: PGListing[];
  action?: AgentAction;
};

const QUICK_PROMPTS = [
  "🏠 PGs under ₹8000",
  "📍 Koramangala PGs",
  "🍽️ Food included PGs",
  "👩 Female-only PGs",
  "📊 Compare top rated",
  "🤝 Find roommates",
];

export default function AIAgent() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hey! 👋 I can find PGs, save them, book, compare, call owners — ask me anything!",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const sendingRef = useRef(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  // Execute agent actions
  const executeAction = (action: AgentAction) => {
    switch (action.action) {
      case "navigate":
        router.push(action.data.url as string);
        setOpen(false);
        break;
      case "save": {
        const pgId = action.data.pgId as string;
        const saved = JSON.parse(localStorage.getItem("savedPGs") || "[]");
        if (!saved.includes(pgId)) {
          saved.push(pgId);
          localStorage.setItem("savedPGs", JSON.stringify(saved));
        }
        break;
      }
      case "unsave": {
        const unsaveId = action.data.pgId as string;
        const savedList = JSON.parse(localStorage.getItem("savedPGs") || "[]");
        localStorage.setItem("savedPGs", JSON.stringify(savedList.filter((id: string) => id !== unsaveId)));
        break;
      }
      case "call":
        window.open(`tel:${action.data.phone}`, "_self");
        break;
      case "whatsapp": {
        const msg = encodeURIComponent(`Hi! I'm interested in ${action.data.pgName}. Is it available?`);
        window.open(`https://wa.me/91${action.data.phone}?text=${msg}`, "_blank");
        break;
      }
      case "compare": {
        const ids = action.data.pgIds as string[];
        router.push(`/?compare=${ids.join(",")}`);
        setOpen(false);
        break;
      }
      case "filter":
        router.push("/#listings");
        setOpen(false);
        break;
    }
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading || sendingRef.current) return;
    sendingRef.current = true;

    const userMsg: Message = { role: "user", content: text.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages
            .filter((m) => m.role === "user" || m.role === "assistant")
            .slice(-10) // keep last 10 for context
            .map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!res.ok) throw new Error("API error");

      const data = await res.json();
      const aiMsg: Message = {
        role: "assistant",
        content: data.reply,
        listings: data.listings?.length > 0 ? data.listings : undefined,
        action: data.action || undefined,
      };
      setMessages([...newMessages, aiMsg]);

      // Auto-execute navigation actions
      if (data.action && data.action.action === "navigate") {
        setTimeout(() => executeAction(data.action), 1500);
      }
      // Auto-execute save/unsave
      if (data.action && (data.action.action === "save" || data.action.action === "unsave")) {
        executeAction(data.action);
      }
    } catch {
      setMessages([
        ...newMessages,
        { role: "assistant", content: "Oops! Something went wrong 😅 Try again." },
      ]);
    } finally {
      setLoading(false);
      sendingRef.current = false;
    }
  };

  return (
    <>
      {/* Floating AI Button */}
      <button
        onClick={() => setOpen(!open)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl transition-all duration-300 ${
          open
            ? "bg-gray-800 rotate-0 scale-90"
            : "bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-500 hover:scale-110 shadow-violet-500/40"
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

      {!open && (
        <div className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-2xl bg-violet-500/30 animate-ping pointer-events-none" />
      )}

      {/* Chat Panel */}
      {open && (
        <div className="fixed bottom-24 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[420px] h-[70vh] max-h-[600px] flex flex-col bg-white dark:bg-[#0f0a1e] rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700/50 overflow-hidden animate-slide-up isolate [backdrop-filter:none]">
          {/* Header */}
          <div className="px-5 py-3.5 bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-500 flex items-center gap-3">
            <div className="w-9 h-9 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
            </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-white font-bold text-sm">PG Finder AI</h3>
              <p className="text-white/60 text-[10px]">Search • Save • Book • Compare • Call</p>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-white/60 text-[10px]">Online</span>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 scrollbar-thin bg-white dark:bg-[#0f0a1e]">
            {messages.map((msg, i) => (
              <div key={i}>
                {/* Text bubble */}
                <div className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-[13px] leading-relaxed ${
                      msg.role === "user"
                        ? "bg-gradient-to-br from-violet-600 to-fuchsia-500 text-white rounded-br-md"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-bl-md"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>

                {/* Action buttons */}
                {msg.action && msg.action.action !== "navigate" && msg.action.action !== "save" && msg.action.action !== "unsave" && (
                  <div className="mt-2 ml-2">
                    <button
                      onClick={() => executeAction(msg.action!)}
                      className="px-3 py-1.5 text-xs font-semibold bg-violet-600 text-white rounded-xl hover:bg-violet-700 transition"
                    >
                      {msg.action.action === "call" && `📞 Call ${msg.action.data.name}`}
                      {msg.action.action === "whatsapp" && `💬 WhatsApp ${msg.action.data.name || "Owner"}`}
                      {msg.action.action === "compare" && "📊 Open Comparison"}
                      {msg.action.action === "filter" && "🔍 Apply Filters"}
                    </button>
                  </div>
                )}

                {/* PG Listing Cards */}
                {msg.listings && msg.listings.length > 0 && (
                  <div className="mt-2 space-y-2">
                    {msg.listings.map((pg) => (
                      <div
                        key={pg.id}
                        className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden hover:border-violet-300 dark:hover:border-violet-600 transition-all hover:shadow-lg"
                      >
                        <Link href={`/listing/${pg.id}`} className="flex items-start gap-3 p-3">
                          <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-gray-200 dark:bg-gray-700">
                            <img
                              src={pg.images[0]}
                              alt={pg.name}
                              className="w-full h-full object-cover hover:scale-110 transition-transform"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-sm text-gray-900 dark:text-white truncate">
                              {pg.name}
                            </h4>
                            <p className="text-[11px] text-gray-400 mt-0.5">
                              📍 {pg.area} • {pg.type} • {pg.gender}
                            </p>
                            <div className="flex items-center justify-between mt-1">
                              <span className="text-sm font-bold text-violet-600">
                                ₹{pg.price.toLocaleString()}<span className="text-[10px] font-normal text-gray-400">/mo</span>
                              </span>
                              <span className="text-[11px] text-amber-500">⭐ {pg.rating}</span>
                            </div>
                          </div>
                        </Link>
                        {/* Action buttons row */}
                        <div className="flex border-t border-gray-100 dark:border-gray-700">
                          <button
                            onClick={() => {
                              const saved = JSON.parse(localStorage.getItem("savedPGs") || "[]");
                              if (!saved.includes(pg.id)) {
                                saved.push(pg.id);
                                localStorage.setItem("savedPGs", JSON.stringify(saved));
                              }
                              setMessages(prev => [...prev, { role: "assistant", content: `Saved ${pg.name} ❤️` }]);
                            }}
                            className="flex-1 py-2 text-[11px] font-medium text-pink-500 hover:bg-pink-50 dark:hover:bg-pink-900/20 transition"
                          >
                            ❤️ Save
                          </button>
                          <button
                            onClick={() => { router.push(`/booking/${pg.id}`); setOpen(false); }}
                            className="flex-1 py-2 text-[11px] font-medium text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-900/20 transition border-l border-gray-100 dark:border-gray-700"
                          >
                            🏠 Book
                          </button>
                          <button
                            onClick={() => {
                              const msg = encodeURIComponent(`Hi! I'm interested in ${pg.name}. Is it available?`);
                              window.open(`https://wa.me/91${pg.contactPhone}?text=${msg}`, "_blank");
                            }}
                            className="flex-1 py-2 text-[11px] font-medium text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition border-l border-gray-100 dark:border-gray-700"
                          >
                            💬 Chat
                          </button>
                          <button
                            onClick={() => window.open(`tel:${pg.contactPhone}`, "_self")}
                            className="flex-1 py-2 text-[11px] font-medium text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition border-l border-gray-100 dark:border-gray-700"
                          >
                            📞 Call
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
                <div className="bg-gray-100 dark:bg-gray-800 px-4 py-3 rounded-2xl rounded-bl-md">
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                    <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts */}
          {messages.length <= 1 && (
            <div className="px-3 pb-2 bg-white dark:bg-[#0f0a1e]">
              <div className="flex gap-1.5 overflow-x-auto pb-1.5 scrollbar-none">
                {QUICK_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => sendMessage(prompt)}
                    className="flex-shrink-0 px-2.5 py-1.5 text-[11px] font-medium bg-violet-50 dark:bg-violet-900/20 text-violet-600 rounded-full hover:bg-violet-100 dark:hover:bg-violet-900/40 transition whitespace-nowrap"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="px-3 py-2.5 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
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
                placeholder="Find PGs, book, save, compare..."
                className="flex-1 px-3.5 py-2.5 text-sm bg-gray-100 dark:bg-gray-800 rounded-xl outline-none focus:ring-2 focus:ring-violet-500/30 text-gray-900 dark:text-white placeholder-gray-400"
                disabled={loading}
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={loading || !input.trim()}
                className="w-10 h-10 bg-gradient-to-br from-violet-600 to-fuchsia-500 text-white rounded-xl flex items-center justify-center disabled:opacity-50 hover:shadow-lg hover:shadow-violet-500/30 transition-all flex-shrink-0"
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
