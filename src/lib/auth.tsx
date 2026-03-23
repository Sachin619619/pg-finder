"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "./supabase";
import { sendWelcomeEmail } from "./email";
import type { User, Session } from "@supabase/supabase-js";

export type UserRole = "tenant" | "owner" | "agent" | "admin";

export type UserProfile = {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: UserRole;
  avatar?: string;
  username?: string | null;
  currentPgId?: string | null;
  verified?: boolean;
  createdAt: string;
};

type AuthContextType = {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string, role: UserRole, username?: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<boolean>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (u: User) => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", u.id)
      .single();
    if (data) {
      setProfile({
        id: data.id,
        email: data.email,
        name: data.name,
        phone: data.phone || "",
        role: data.role || "tenant",
        avatar: data.avatar,
        username: data.username || null,
        currentPgId: data.current_pg_id || null,
        verified: data.verified ?? (data.role !== "agent"),
        createdAt: data.created_at,
      });
    } else {
      // Fallback: build profile from auth user metadata
      const meta = u.user_metadata || {};
      setProfile({
        id: u.id,
        email: u.email || "",
        name: meta.name || u.email?.split("@")[0] || "User",
        phone: "",
        role: meta.role || "tenant",
        verified: (meta.role || "tenant") !== "agent",
        createdAt: u.created_at,
      });
    }
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) fetchProfile(s.user);
      setLoading(false);
    });

    // Listen to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        fetchProfile(s.user);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, name: string, role: UserRole, username?: string) => {
    // If username provided, check uniqueness first
    if (username) {
      const { data: existing } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", username.toLowerCase().trim())
        .single();
      if (existing) {
        return { error: "This username is already taken. Please choose another." };
      }
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, role },
        emailRedirectTo: "https://castleliving.in/login",
      },
    });

    if (error) return { error: error.message };

    // Supabase returns a user with empty identities when email already exists
    if (data.user && data.user.identities && data.user.identities.length === 0) {
      return { error: "An account with this email already exists. Please sign in instead." };
    }

    // Create profile row
    if (data.user) {
      await supabase.from("profiles").insert({
        id: data.user.id,
        email,
        name,
        role,
        phone: "",
        avatar: null,
        username: username ? username.toLowerCase().trim() : null,
        verified: role !== "agent",
      });

      // Send welcome email (non-blocking)
      sendWelcomeEmail(email, name).catch(() => {});
    }

    return { error: null };
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };

    // Block unverified users
    if (data.user && !data.user.email_confirmed_at) {
      await supabase.auth.signOut();
      return { error: "Please confirm your email before signing in. Check your inbox for the verification code." };
    }

    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setSession(null);
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return false;
    const updateData: Record<string, unknown> = {};
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.phone !== undefined) updateData.phone = updates.phone;
    if (updates.avatar !== undefined) updateData.avatar = updates.avatar;
    if (updates.username !== undefined) updateData.username = updates.username;
    const { error } = await supabase.from("profiles").update(updateData).eq("id", user.id);
    if (!error && profile) {
      setProfile({ ...profile, ...updates });
    }
    return !error;
  };

  return (
    <AuthContext.Provider value={{ user, profile, session, loading, signUp, signIn, signOut, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
