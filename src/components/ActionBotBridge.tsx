"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

export default function ActionBotBridge() {
  const router = useRouter();
  const { user, profile } = useAuth();

  useEffect(() => {
    // Set actionbot config with user data
    if (user && profile) {
      (window as any).actionbotConfig = {
        externalUserId: user.id,
        metadata: {
          name: profile.name || user.email || "",
          email: profile.email || user.email || "",
          phone: profile.phone || "",
        },
      };
    }

    // Listen for custom events from the ActionBot widget
    const handler = (e: CustomEvent) => {
      const detail = e.detail;

      if (detail.event === "save_pg") {
        // Toggle save in localStorage
        const saved: string[] = JSON.parse(localStorage.getItem("savedPGs") || "[]");
        const idx = saved.indexOf(detail.pgId);
        if (idx === -1) {
          saved.push(detail.pgId);
        } else {
          saved.splice(idx, 1);
        }
        localStorage.setItem("savedPGs", JSON.stringify(saved));
      } else if (detail.event === "navigate" && detail.url) {
        router.push(detail.url);
      }
    };

    document.addEventListener("actionbot:custom_event", handler as EventListener);
    return () => document.removeEventListener("actionbot:custom_event", handler as EventListener);
  }, [user, profile, router]);

  return null; // No UI, just event bridge
}
