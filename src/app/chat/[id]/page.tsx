"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import Header from "@/components/Header";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

type Message = {
  id: string;
  sender_id: string;
  sender_name: string;
  content: string;
  created_at: string;
};

export default function ChatPage() {
  const { id: pgId } = useParams();
  const { user, profile } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMsg, setNewMsg] = useState("");
  const [pgName, setPgName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!pgId) return;

    // Fetch PG info
    supabase.from("listings").select("name, contact_name").eq("id", pgId).single()
      .then(({ data }) => {
        if (data) {
          setPgName(data.name);
          setOwnerName(data.contact_name);
        }
      });

    // Fetch existing messages
    supabase.from("messages")
      .select("*")
      .eq("pg_id", pgId)
      .order("created_at", { ascending: true })
      .then(({ data }) => {
        if (data) setMessages(data as Message[]);
      });

    // Subscribe to realtime messages
    const channel = supabase
      .channel(`chat-${pgId}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `pg_id=eq.${pgId}`,
      }, (payload) => {
        setMessages((prev) => [...prev, payload.new as Message]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [pgId]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!newMsg.trim() || !user || !profile) return;
    const msg = {
      pg_id: pgId as string,
      sender_id: user.id,
      sender_name: profile.name,
      content: newMsg.trim(),
    };
    setNewMsg("");
    await supabase.from("messages").insert(msg);
  };

  if (!user) {
    return (
      <>
        <Header />
        <main className="min-h-screen flex items-center justify-center px-4 pt-20">
          <div className="text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <span className="text-5xl">💬</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">Sign in to Chat</h1>
            <p className="text-gray-400 mb-6">You need an account to message PG owners</p>
            <Link href="/login" className="btn-premium">Sign In</Link>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="max-w-3xl mx-auto px-4 pt-24 pb-4 flex flex-col" style={{ height: "100vh" }}>
        {/* Chat header */}
        <div className="premium-card !rounded-2xl p-4 mb-4 flex items-center gap-4">
          <div className="w-12 h-12 bg-[#1a1a1a] rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-lg">🏠</span>
          </div>
          <div className="flex-1">
            <h2 className="font-bold text-gray-900">{pgName || "Loading..."}</h2>
            <p className="text-xs text-gray-400">Chat with {ownerName || "PG Owner"}</p>
          </div>
          <Link href={`/listing/${pgId}`} className="px-4 py-2 text-sm bg-gray-100 rounded-xl text-gray-600 hover:bg-gray-200">
            View PG
          </Link>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-2">
          {messages.length === 0 && (
            <div className="text-center py-20">
              <span className="text-5xl block mb-4">👋</span>
              <p className="text-gray-400">Start the conversation! Ask about rooms, pricing, or schedule a visit.</p>
            </div>
          )}
          {messages.map((msg) => {
            const isMine = msg.sender_id === user.id;
            return (
              <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[75%] p-4 rounded-2xl ${
                  isMine
                    ? "bg-[#1a1a1a] text-white rounded-br-md"
                    : "bg-white text-gray-900 shadow-sm border border-gray-100 rounded-bl-md"
                }`}>
                  {!isMine && <p className="text-xs font-semibold text-[#1a1a1a] mb-1">{msg.sender_name}</p>}
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                  <p className={`text-[10px] mt-1 ${isMine ? "text-white/60" : "text-gray-400"}`}>
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={scrollRef} />
        </div>

        {/* Input */}
        <div className="premium-card !rounded-2xl p-3 flex gap-3">
          <input
            type="text"
            value={newMsg}
            onChange={(e) => setNewMsg(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Type a message..."
            className="flex-1 bg-gray-50 border-0 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#1a1a1a]/20 outline-none"
          />
          <button
            onClick={sendMessage}
            disabled={!newMsg.trim()}
            className="btn-premium !py-3 !px-6 disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </main>
    </>
  );
}
