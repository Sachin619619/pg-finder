"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import NotificationBell from "@/components/NotificationBell";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/components/Toast";
import { authFetch } from "@/lib/auth-fetch";

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const isHome = pathname === "/";
  const { user, profile, signOut, loading } = useAuth();
  const { showToast } = useToast();

  // Close dropdowns on Escape key
  const handleEscape = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") {
      setMobileOpen(false);
      setUserMenuOpen(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [handleEscape]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="text-center py-2.5 px-4 bg-[#1B5E3B] text-white text-[13px] font-medium relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent shimmer" />
        <span className="relative">🏠 Castle is Bangalore&apos;s #1 PG finder — 20+ verified listings
        <a href="#listings" className="underline underline-offset-2 font-semibold ml-2 hover:opacity-80 transition-opacity">Browse PGs →</a></span>
      </div>
      <div className="mx-0 mt-0">
        <div className={`rounded-none px-4 sm:px-8 py-3 bg-[#FFFDF9]/95 backdrop-blur-lg border-b border-black/5 transition-shadow duration-300 ${scrolled ? 'shadow-md' : 'shadow-none'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* Back button — shown on all pages except home */}
              {!isHome && (
                <button
                  onClick={() => router.back()}
                  className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-black/5 transition-all text-[#222] hover:opacity-70 mr-1"
                  aria-label="Go back"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              )}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center transition-all group-hover:scale-105 border border-black/5">
                <svg className="w-6 h-6 text-[#1a1a1a]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 21h18" />
                  <path d="M5 21V7l3-3 4 3 4-3 3 3v14" />
                  <path d="M9 21v-4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v4" />
                  <path d="M7 9v2" />
                  <path d="M12 9v2" />
                  <path d="M17 9v2" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-serif font-bold text-[#1a1a1a] tracking-tight leading-none">Castle</span>
                <span className="text-[10px] font-medium text-[#666] uppercase tracking-[0.15em] leading-none mt-0.5">Find Your Home</span>
              </div>
            </Link>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {(profile?.role === "agent" ? [
                { label: "Dashboard", href: "/agent-dashboard" },
                { label: "Add PG", href: "/add-listing" },
              ] : profile?.role === "owner" ? [
                { label: "Dashboard", href: "/owner-dashboard" },
                { label: "Add PG", href: "/add-listing" },
              ] : profile?.role === "admin" ? [
                { label: "Admin", href: "/admin" },
                { label: "Dashboard", href: "/owner-dashboard" },
                { label: "Add PG", href: "/add-listing" },
              ] : [
                { label: "Home", href: "/" },
                { label: "Browse", href: "/#listings" },
                { label: "Areas", href: "/#areas" },
                { label: "Roommates", href: "/roommate-finder" },
                { label: "My Visits", href: "/my-visits" },
                { label: "Saved", href: "/saved" },
              ]).map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="px-4 py-2 text-[14px] font-medium text-[#333] hover:text-black rounded-xl transition-all"
                >
                  {item.label}
                </Link>
              ))}
              <div className="w-px h-6 bg-black/10 mx-2" />
              <NotificationBell />

              {/* Auth section */}
              {!loading && (
                <>
                  {user && profile ? (
                    <div className="relative ml-2">
                      <button
                        onClick={() => setUserMenuOpen(!userMenuOpen)}
                        aria-label="User menu"
                        aria-expanded={userMenuOpen}
                        aria-haspopup="true"
                        className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-gray-100:bg-gray-800 transition-all"
                      >
                        <div className="w-8 h-8 bg-[#1a1a1a] rounded-lg flex items-center justify-center text-white text-sm font-bold">
                          {profile.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm font-normal text-[#222] max-w-[100px] truncate">{profile.name}</span>
                        <svg className={`w-3.5 h-3.5 text-gray-400 transition-transform ${userMenuOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>

                      {userMenuOpen && (
                        <div role="menu" className="absolute right-0 top-12 w-60 bg-white rounded-2xl shadow-2xl shadow-black/10 border border-gray-200 py-1.5 z-50 animate-slide-up">
                          <div className="mx-2 mb-1.5 p-3 bg-[#1a1a1a] rounded-xl flex items-center gap-3">
                            <div className="w-9 h-9 bg-white/15 rounded-lg flex items-center justify-center text-white text-sm font-bold shrink-0">
                              {profile.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-white truncate">{profile.name}</p>
                              <p className="text-[11px] text-white/50 truncate">{profile.email}</p>
                            </div>
                          </div>

                          <div className="px-1.5 py-1">
                          {(profile.role === "owner" || profile.role === "admin") && (
                            <>
                              <Link href="/add-listing" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-[#333] rounded-xl hover:bg-gray-100 transition-all">
                                <svg className="w-4 h-4 text-[#888]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                                Add New PG
                              </Link>
                              <Link href="/owner-dashboard" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-[#333] rounded-xl hover:bg-gray-100 transition-all">
                                <svg className="w-4 h-4 text-[#888]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg>
                                Owner Dashboard
                              </Link>
                            </>
                          )}
                          {profile.role === "agent" && (
                            <>
                              <Link href="/add-listing" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-[#333] rounded-xl hover:bg-gray-100 transition-all">
                                <svg className="w-4 h-4 text-[#888]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                                Add New PG
                              </Link>
                              <Link href="/agent-dashboard" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-[#333] rounded-xl hover:bg-gray-100 transition-all">
                                <svg className="w-4 h-4 text-[#888]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>
                                Agent Dashboard
                              </Link>
                            </>
                          )}
                          {profile.role === "admin" && (
                            <Link href="/admin" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-[#333] rounded-xl hover:bg-gray-100 transition-all">
                              <svg className="w-4 h-4 text-[#888]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>
                              Admin Panel
                            </Link>
                          )}
                          </div>

                          <div className="mx-2 my-1 h-px bg-gray-200/60" />

                          <div className="px-1.5 py-1">
                          <Link href="/profile" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-[#333] rounded-xl hover:bg-gray-100 transition-all">
                            <svg className="w-4 h-4 text-[#888]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
                            My Profile
                          </Link>
                          <Link href="/saved" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-[#333] rounded-xl hover:bg-gray-100 transition-all">
                            <svg className="w-4 h-4 text-[#888]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" /></svg>
                            Saved PGs
                          </Link>
                          <Link href="/my-visits" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-[#333] rounded-xl hover:bg-gray-100 transition-all">
                            <svg className="w-4 h-4 text-[#888]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                            My Visits
                          </Link>
                          </div>

                          <div className="mx-2 my-1 h-px bg-gray-200/60" />

                          <div className="px-1.5 py-1">
                            <button
                              onClick={async () => { await signOut(); setUserMenuOpen(false); router.push("/"); }}
                              className="flex items-center gap-2.5 w-full px-3 py-2.5 text-sm text-red-500 rounded-xl hover:bg-red-50 transition-all"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" /></svg>
                              Sign Out
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <Link href="/login" className="ml-2 bg-[#1a1a1a] text-white px-5 py-2.5 rounded-full text-sm font-medium hover:opacity-90 transition">
                      Sign In
                    </Link>
                  )}
                </>
              )}
            </nav>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center gap-2">
              <NotificationBell />
              {!loading && user && profile && (
                <div className="w-8 h-8 bg-[#1a1a1a] rounded-lg flex items-center justify-center text-white text-xs font-bold">
                  {profile.name.charAt(0).toUpperCase()}
                </div>
              )}
              {!loading && !user && (
                <Link href="/login" className="px-3 py-1.5 text-xs font-medium bg-[#1a1a1a] text-white rounded-[10px] shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_2px_4px_rgba(0,0,0,0.15)] active:scale-95 transition-all z-10 relative whitespace-nowrap">
                  Sign In
                </Link>
              )}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
                aria-expanded={mobileOpen}
                className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-gray-100:bg-gray-800 transition"
              >
                <svg className="w-5 h-5 text-[#222]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {mobileOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileOpen && (
            <div role="menu" className="md:hidden pt-4 pb-3 border-t border-gray-200/50 mt-3 animate-slide-up">
              {/* User info card when logged in */}
              {user && profile && (
                <div className="mx-2 mb-3 p-3.5 bg-[#1a1a1a] rounded-2xl flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center text-white text-sm font-bold shrink-0">
                    {profile.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{profile.name}</p>
                    <p className="text-[11px] text-white/50 truncate">{profile.email}</p>
                  </div>
                  <span className="ml-auto px-2 py-0.5 bg-white/10 rounded-lg text-[10px] font-medium text-white/70 uppercase tracking-wider shrink-0">{profile.role}</span>
                </div>
              )}

              {/* Navigation section */}
              <div className="px-2 mb-2">
                <p className="px-3 py-1.5 text-[10px] font-semibold text-[#999] uppercase tracking-[0.15em]">Navigate</p>
                {(profile?.role === "agent" ? [
                  { label: "Agent Dashboard", href: "/agent-dashboard", icon: <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg> },
                  { label: "Add New PG", href: "/add-listing", icon: <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg> },
                ] : profile?.role === "owner" ? [
                  { label: "Owner Dashboard", href: "/owner-dashboard", icon: <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg> },
                  { label: "Add New PG", href: "/add-listing", icon: <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg> },
                ] : [
                  { label: "Home", href: "/", icon: <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" /></svg> },
                  { label: "Browse PGs", href: "/#listings", icon: <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg> },
                  { label: "Areas", href: "/#areas", icon: <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg> },
                  { label: "Find Roommates", href: "/roommate-finder", icon: <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" /></svg> },
                  { label: "My Visits", href: "/my-visits", icon: <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg> },
                  { label: "Saved PGs", href: "/saved", icon: <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" /></svg> },
                ]).concat(
                  profile?.role === "admin" ? [
                    { label: "Owner Dashboard", href: "/owner-dashboard", icon: <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg> },
                    { label: "Add New PG", href: "/add-listing", icon: <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg> },
                    { label: "Admin Panel", href: "/admin", icon: <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg> },
                  ] : []
                ).map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-3 py-3 text-[15px] rounded-xl transition-all active:scale-[0.98] ${pathname === item.href ? "bg-[#1a1a1a] text-white font-medium" : "text-[#333] hover:bg-gray-100 font-normal"}`}
                  >
                    <span className={`${pathname === item.href ? "text-white" : "text-[#888]"}`}>{item.icon}</span>
                    {item.label}
                  </Link>
                ))}
              </div>

              {/* Account section */}
              {user && (
                <div className="px-2 mt-1 pt-2 border-t border-gray-200/50">
                  <p className="px-3 py-1.5 text-[10px] font-semibold text-[#999] uppercase tracking-[0.15em]">Account</p>
                  <Link
                    href="/profile"
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-3 py-3 text-[15px] rounded-xl transition-all active:scale-[0.98] ${pathname === "/profile" ? "bg-[#1a1a1a] text-white font-medium" : "text-[#333] hover:bg-gray-100 font-normal"}`}
                  >
                    <span className={`${pathname === "/profile" ? "text-white" : "text-[#888]"}`}>
                      <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
                    </span>
                    My Profile
                  </Link>
                  <button
                    onClick={async () => { await signOut(); setMobileOpen(false); }}
                    className="flex items-center gap-3 w-full px-3 py-3 text-[15px] font-medium text-red-500 rounded-xl hover:bg-red-50 transition-all active:scale-[0.98]"
                  >
                    <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" /></svg>
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Delete Account Confirmation Modal */}
      {showDeleteConfirm && user && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => !deleting && setShowDeleteConfirm(false)} />
          <div className="relative w-full sm:max-w-[380px] bg-white sm:rounded-3xl rounded-t-3xl p-6 pb-8 sm:p-8 shadow-2xl shadow-red-500/10 border border-gray-200/10 animate-slide-up">
            {/* Close button */}
            {!deleting && (
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600:text-gray-200 transition"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}

            <div className="text-center">
              {/* Icon */}
              <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-red-500/25">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>

              <h3 className="text-xl font-extrabold text-gray-900 mb-1">Delete Your Account?</h3>
              <p className="text-sm text-gray-400 mb-5">This is permanent and cannot be undone</p>

              {/* What gets deleted */}
              <div className="bg-red-50/50 rounded-2xl p-4 mb-6 text-left">
                <p className="text-xs font-semibold text-red-500 uppercase tracking-wider mb-2.5">What will be deleted</p>
                <div className="space-y-2">
                  {[
                    { icon: "👤", text: "Profile & saved data" },
                    { icon: "⭐", text: "Reviews you've written" },
                    { icon: "📋", text: "Booking history" },
                    { icon: "💬", text: "Chat messages" },
                  ].map((item) => (
                    <div key={item.text} className="flex items-center gap-2.5">
                      <span className="text-sm">{item.icon}</span>
                      <span className="text-sm text-gray-600">{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Buttons */}
              <div className="space-y-2.5">
                <button
                  onClick={async () => {
                    setDeleting(true);
                    const res = await authFetch("/api/delete-account", {
                      method: "POST",
                      body: JSON.stringify({ userId: user.id }),
                    });
                    if (res.ok) {
                      await signOut();
                      setShowDeleteConfirm(false);
                      setDeleting(false);
                      router.push("/");
                    } else {
                      setDeleting(false);
                      showToast("Failed to delete account. Please try again.", "error");
                    }
                  }}
                  disabled={deleting}
                  className="w-full py-3.5 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-2xl font-semibold text-sm hover:from-red-600 hover:to-rose-700 transition-all shadow-lg shadow-red-500/20 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {deleting ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Deleting account...
                    </span>
                  ) : (
                    "Yes, Delete My Account"
                  )}
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={deleting}
                  className="w-full py-3.5 bg-gray-100 text-gray-700 rounded-2xl font-semibold text-sm hover:bg-gray-200:bg-gray-700 transition disabled:opacity-50"
                >
                  Keep My Account
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
