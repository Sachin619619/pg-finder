"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import type { PGListing } from "@/data/listings";

type Message = {
  role: "user" | "assistant";
  content: string;
  listings?: PGListing[];
};

const QUICK_PROMPTS = [
  "🏠 Find PG under ₹8000",
  "📍 Best PGs in Koramangala",
  "🍽️ PGs with food included",
  "👩 Female-only PGs",
  "📶 PGs with WiFi & AC",
];

export default function AIAgent() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hey! 👋 I'm your PG Finder AI assistant. Tell me what you're looking for — area, budget, amenities — and I'll find the perfect PG for you! 🏠✨",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;

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
            .map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!res.ok) throw new Error("API error");

      const data = await res.json();
      const aiMsg: Message = {
        role: "assistant",
        content: data.reply,
        listings: data.listings?.length > 0 ? data.listings : undefined,
      };
      setMessages([...newMessages, aiMsg]);
    } catch {
      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content:
            "Oops! Something went wrong 😅 Please try again in a moment.",
        },
      ]);
    } finally {
      setLoading(false);
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
          <svg
            className="w-6 h-6 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        ) : (
          <span className="text-2xl">🤖</span>
        )}
      </button>

      {/* Pulse ring when closed */}
      {!open && (
        <div className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-2xl bg-violet-500/30 animate-ping pointer-events-none" />
      )}

      {/* Chat Panel */}
      {open && (
        <div className="fixed bottom-24 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[420px] h-[70vh] max-h-[600px] flex flex-col bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden animate-slide-up">
          {/* Header */}
          <div className="px-5 py-4 bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-500 flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
              <span className="text-xl">🤖</span>
            </div>
            <div className="flex-1">
              <h3 className="text-white font-bold text-sm">
                PG Finder AI Agent
              </h3>
              <p className="text-white/70 text-xs">
                Powered by MiniMax • Ask me anything
              </p>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-white/70 text-xs">Online</span>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-thin">
            {messages.map((msg, i) => (
              <div key={i}>
                <div
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-gradient-to-br from-violet-600 to-fuchsia-500 text-white rounded-br-md"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-bl-md"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>

                {/* PG Listing Cards */}
                {msg.listings && msg.listings.length > 0 && (
                  <div className="mt-3 space-y-2 ml-2">
                    {msg.listings.map((pg) => (
                      <Link
                        key={pg.id}
                        href={`/listing/${pg.id}`}
                        className="block p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl hover:border-violet-300 dark:hover:border-violet-600 transition-all hover:shadow-lg group"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-gray-200 dark:bg-gray-700">
                            <img
                              src={pg.images[0]}
                              alt={pg.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-sm text-gray-900 dark:text-white truncate group-hover:text-violet-600 transition-colors">
                              {pg.name}
                            </h4>
                            <p className="text-xs text-gray-400 mt-0.5">
                              📍 {pg.area} • {pg.type} room •{" "}
                              {pg.gender}
                            </p>
                            <div className="flex items-center justify-between mt-1.5">
                              <span className="text-sm font-bold text-violet-600">
                                ₹{pg.price.toLocaleString()}
                                <span className="text-xs font-normal text-gray-400">
                                  /mo
                                </span>
                              </span>
                              <span className="text-xs text-amber-500">
                                ⭐ {pg.rating} ({pg.reviews})
                              </span>
                            </div>
                            <div className="flex gap-1 mt-1.5 flex-wrap">
                              {pg.amenities.slice(0, 4).map((a) => (
                                <span
                                  key={a}
                                  className="text-[10px] px-1.5 py-0.5 bg-violet-50 dark:bg-violet-900/20 text-violet-600 rounded-md"
                                >
                                  {a}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Loading */}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 dark:bg-gray-800 px-4 py-3 rounded-2xl rounded-bl-md">
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" />
                    <div
                      className="w-2 h-2 bg-violet-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    />
                    <div
                      className="w-2 h-2 bg-violet-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts */}
          {messages.length <= 1 && (
            <div className="px-4 pb-2">
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                {QUICK_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => sendMessage(prompt)}
                    className="flex-shrink-0 px-3 py-1.5 text-xs font-medium bg-violet-50 dark:bg-violet-900/20 text-violet-600 rounded-full hover:bg-violet-100 dark:hover:bg-violet-900/40 transition whitespace-nowrap"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
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
                placeholder="Ask about PGs in Bangalore..."
                className="flex-1 px-4 py-2.5 text-sm bg-gray-100 dark:bg-gray-800 rounded-xl outline-none focus:ring-2 focus:ring-violet-500/30 text-gray-900 dark:text-white placeholder-gray-400"
                disabled={loading}
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={loading || !input.trim()}
                className="w-10 h-10 bg-gradient-to-br from-violet-600 to-fuchsia-500 text-white rounded-xl flex items-center justify-center disabled:opacity-50 hover:shadow-lg hover:shadow-violet-500/30 transition-all disabled:hover:shadow-none flex-shrink-0"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19V5m0 0l-7 7m7-7l7 7"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
