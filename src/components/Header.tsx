"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import DarkModeToggle from "@/components/DarkModeToggle";
import NotificationBell from "@/components/NotificationBell";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/components/Toast";
import { authFetch } from "@/lib/auth-fetch";

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
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

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="mx-4 mt-3">
        <div className="glass-card rounded-2xl px-6 py-3 max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* Back button — shown on all pages except home */}
              {!isHome && (
                <button
                  onClick={() => router.back()}
                  className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-all text-gray-600 dark:text-gray-300 hover:text-violet-600 dark:hover:text-violet-400 mr-1"
                  aria-label="Go back"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              )}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-500 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/20 group-hover:shadow-violet-500/40 transition-all group-hover:scale-105">
                <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 21h18" />
                  <path d="M5 21V7l3-3 4 3 4-3 3 3v14" />
                  <path d="M9 21v-4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v4" />
                  <path d="M7 9v2" />
                  <path d="M12 9v2" />
                  <path d="M17 9v2" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold text-gray-900 dark:text-white tracking-tight leading-none">Castle</span>
                <span className="text-[10px] font-semibold text-violet-600 uppercase tracking-[0.15em] leading-none mt-0.5">Find Your Home</span>
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
                { label: "Saved", href: "/saved" },
              ]).map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white rounded-xl hover:bg-gray-100/80 dark:hover:bg-gray-800 transition-all"
                >
                  {item.label}
                </Link>
              ))}
              <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-2" />
              <DarkModeToggle />
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
                        className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                      >
                        <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                          {profile.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 max-w-[100px] truncate">{profile.name}</span>
                        <svg className={`w-3.5 h-3.5 text-gray-400 transition-transform ${userMenuOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>

                      {userMenuOpen && (
                        <div role="menu" className="absolute right-0 top-12 w-56 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 py-2 z-50 animate-slide-up">
                          <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">{profile.name}</p>
                            <p className="text-xs text-gray-400">{profile.email}</p>
                            <span className={`inline-block mt-1 pill !text-[10px] !py-0.5 ${
                              profile.role === "admin" ? "bg-red-50 dark:bg-red-900/30 text-red-600" :
                              profile.role === "owner" ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600" :
                              profile.role === "agent" ? "bg-orange-50 dark:bg-orange-900/30 text-orange-600" :
                              "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600"
                            }`}>{profile.role}</span>
                          </div>

                          {(profile.role === "owner" || profile.role === "admin") && (
                            <>
                              <Link href="/add-listing" onClick={() => setUserMenuOpen(false)} className="block px-4 py-2.5 text-sm text-violet-600 dark:text-violet-400 font-semibold hover:bg-violet-50 dark:hover:bg-violet-900/20">
                                ➕ Add New PG
                              </Link>
                              <Link href="/owner-dashboard" onClick={() => setUserMenuOpen(false)} className="block px-4 py-2.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                                📊 Owner Dashboard
                              </Link>
                            </>
                          )}
                          {profile.role === "agent" && (
                            <>
                              <Link href="/add-listing" onClick={() => setUserMenuOpen(false)} className="block px-4 py-2.5 text-sm text-violet-600 dark:text-violet-400 font-semibold hover:bg-violet-50 dark:hover:bg-violet-900/20">
                                ➕ Add New PG
                              </Link>
                              <Link href="/agent-dashboard" onClick={() => setUserMenuOpen(false)} className="block px-4 py-2.5 text-sm text-orange-600 dark:text-orange-400 font-semibold hover:bg-orange-50 dark:hover:bg-orange-900/20">
                                🤝 Agent Dashboard
                              </Link>
                            </>
                          )}
                          {profile.role === "admin" && (
                            <Link href="/admin" onClick={() => setUserMenuOpen(false)} className="block px-4 py-2.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                              🛡️ Admin Panel
                            </Link>
                          )}
                          <Link href="/profile" onClick={() => setUserMenuOpen(false)} className="block px-4 py-2.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                            👤 My Profile
                          </Link>
                          <Link href="/saved" onClick={() => setUserMenuOpen(false)} className="block px-4 py-2.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                            ❤️ Saved PGs
                          </Link>

                          <div className="border-t border-gray-100 dark:border-gray-700 mt-1 pt-1">
                            <button
                              onClick={async () => { await signOut(); setUserMenuOpen(false); router.push("/"); }}
                              className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                              🚪 Sign Out
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <Link href="/login" className="ml-2 px-5 py-2 text-sm font-medium bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white rounded-xl hover:opacity-90 transition shadow-sm">
                      Sign In
                    </Link>
                  )}
                </>
              )}
            </nav>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center gap-2">
              <DarkModeToggle />
              <NotificationBell />
              {!loading && user && profile && (
                <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-lg flex items-center justify-center text-white text-xs font-bold">
                  {profile.name.charAt(0).toUpperCase()}
                </div>
              )}
              {!loading && !user && (
                <Link href="/login" className="px-3 py-1.5 text-xs font-medium bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white rounded-lg shadow-sm active:scale-95 transition-all z-10 relative whitespace-nowrap">
                  Sign In
                </Link>
              )}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
                aria-expanded={mobileOpen}
                className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              >
                <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            <div role="menu" className="md:hidden pt-4 pb-2 border-t border-gray-200/50 dark:border-gray-700 mt-3 space-y-1 animate-slide-up">
              {(profile?.role === "agent" ? [
                { label: "🤝 Agent Dashboard", href: "/agent-dashboard" },
                { label: "➕ Add New PG", href: "/add-listing" },
              ] : profile?.role === "owner" ? [
                { label: "📊 Owner Dashboard", href: "/owner-dashboard" },
                { label: "➕ Add New PG", href: "/add-listing" },
              ] : [
                { label: "Home", href: "/" },
                { label: "Browse PGs", href: "/#listings" },
                { label: "Areas", href: "/#areas" },
                { label: "Find Roommates", href: "/roommate-finder" },
                { label: "Saved PGs", href: "/saved" },
              ]).concat(
                profile?.role === "admin" ? [
                  { label: "📊 Owner Dashboard", href: "/owner-dashboard" },
                  { label: "➕ Add New PG", href: "/add-listing" },
                  { label: "🛡️ Admin Panel", href: "/admin" },
                ] : []
              ).map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="block px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                >
                  {item.label}
                </Link>
              ))}
              {user && (
                <>
                  <Link
                    href="/profile"
                    onClick={() => setMobileOpen(false)}
                    className="block px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                  >
                    👤 My Profile
                  </Link>
                  <button
                    onClick={async () => { await signOut(); setMobileOpen(false); }}
                    className="block w-full text-left px-4 py-2.5 text-sm font-medium text-red-500 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    🚪 Sign Out
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Delete Account Confirmation Modal */}
      {showDeleteConfirm && user && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => !deleting && setShowDeleteConfirm(false)} />
          <div className="relative w-full sm:max-w-[380px] bg-white dark:bg-[#1a1228] sm:rounded-3xl rounded-t-3xl p-6 pb-8 sm:p-8 shadow-2xl shadow-red-500/10 border border-gray-200/10 dark:border-gray-700/30 animate-slide-up">
            {/* Close button */}
            {!deleting && (
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition"
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

              <h3 className="text-xl font-extrabold text-gray-900 dark:text-white mb-1">Delete Your Account?</h3>
              <p className="text-sm text-gray-400 mb-5">This is permanent and cannot be undone</p>

              {/* What gets deleted */}
              <div className="bg-red-50/50 dark:bg-red-900/10 rounded-2xl p-4 mb-6 text-left">
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
                      <span className="text-sm text-gray-600 dark:text-gray-400">{item.text}</span>
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
                  className="w-full py-3.5 bg-gray-100 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 rounded-2xl font-semibold text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition disabled:opacity-50"
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
