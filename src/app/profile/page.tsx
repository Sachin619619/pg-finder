"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/Toast";
import { authFetch } from "@/lib/auth-fetch";
import AnimatedBanner from "@/components/AnimatedBanner";

export default function ProfilePage() {
  const router = useRouter();
  const { showToast } = useToast();
  const { user, profile, loading, updateProfile, signOut } = useAuth();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [username, setUsername] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => { document.title = "My Profile | Castle"; }, []);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (profile) {
      setName(profile.name || "");
      setPhone(profile.phone || "");
      setUsername(profile.username?.replace("@", "") || "");
    }
  }, [profile]);

  if (loading || !profile) {
    return (
      <>
        <Header />
        <main className="min-h-screen pt-28 pb-16 px-4 flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-3 border-[#1a1a1a] border-t-transparent rounded-full" />
        </main>
      </>
    );
  }

  const initial = profile.name?.charAt(0)?.toUpperCase() || "U";
  const memberSince = new Date(profile.createdAt).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const roleBadgeClass =
    profile.role === "admin"
      ? "bg-red-500/10 text-red-400 border-red-500/20"
      : profile.role === "owner"
      ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
      : profile.role === "agent"
      ? "bg-orange-500/10 text-orange-400 border-orange-500/20"
      : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";

  const handleSave = async () => {
    setError("");
    setSaved(false);
    setSaving(true);

    const cleanUsername = username.toLowerCase().trim().replace(/[^a-z0-9_]/g, "");

    // Check username uniqueness if changed
    if (cleanUsername && cleanUsername !== (profile.username || "")) {
      const { data: existing } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", cleanUsername)
        .neq("id", profile.id)
        .single();
      if (existing) {
        setError("This username is already taken.");
        setSaving(false);
        return;
      }
    }

    // Update profile (name, phone) via auth context
    const ok = await updateProfile({ name, phone, username: cleanUsername || null });

    if (!ok) {
      setError("Failed to save profile. Please try again.");
      setSaving(false);
      return;
    }

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    setDeleting(true);
    try {
      const res = await authFetch("/api/delete-account", {
        method: "POST",
        body: JSON.stringify({ userId: user.id }),
      });
      if (res.ok) {
        await signOut();
        setShowDeleteModal(false);
        router.push("/");
      } else {
        showToast("Failed to delete account. Please try again.", "error");
      }
    } catch {
      showToast("Failed to delete account. Please try again.", "error");
    }
    setDeleting(false);
  };

  return (
    <>
      <Header />
      <main className="min-h-screen pt-28 pb-16 px-4 animate-fade-in-up">
        <div className="max-w-xl mx-auto space-y-6">

          {/* Breadcrumb */}
          <nav className="mb-6 text-sm text-gray-500 flex items-center gap-2">
            <Link href="/" className="hover:text-[#1a1a1a] transition-colors">Home</Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">My Profile</span>
          </nav>

          {/* Avatar + Name Header */}
          <div className="premium-card p-8 text-center">
            {profile.avatar ? (
              <img
                src={profile.avatar}
                alt={profile.name}
                className="w-24 h-24 rounded-2xl mx-auto object-cover shadow-lg shadow-black/20 border-2 border-[#1a1a1a]/20"
              />
            ) : (
              <div className="w-24 h-24 rounded-2xl mx-auto bg-[#1a1a1a] flex items-center justify-center shadow-lg shadow-black/20">
                <span className="text-4xl font-bold text-white">{initial}</span>
              </div>
            )}
            <h1 className="text-2xl font-extrabold text-gray-900 mt-5">
              {profile.name}
            </h1>
            {profile.username && (
              <p className="text-sm text-[#1a1a1a] font-medium mt-1">@{profile.username}</p>
            )}
            <div className="flex items-center justify-center gap-2 mt-3">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${roleBadgeClass}`}>
                {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
              </span>
              <span className="text-xs text-gray-400">
                Member since {memberSince}
              </span>
            </div>
            {profile.currentPgId && profile.role === "tenant" && (
              <div className="mt-4 p-3 rounded-xl bg-[#1a1a1a]/10 border border-[#1a1a1a]/20">
                <p className="text-xs text-gray-400 mb-1">Current PG</p>
                <button
                  onClick={() => router.push(`/listing/${profile.currentPgId}`)}
                  className="text-sm font-semibold text-[#8a8070] hover:text-[#c5bda8] transition"
                >
                  View Your PG &rarr;
                </button>
              </div>
            )}
          </div>

          {/* Editable Fields */}
          <div className="premium-card p-6 space-y-5">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <svg className="w-5 h-5 text-[#1a1a1a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit Profile
            </h2>

            {/* Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-500 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="premium-input w-full"
              />
            </div>

            {/* Username */}
            <div>
              <label className="block text-sm font-semibold text-gray-500 mb-1.5">
                Username
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium text-sm">@</span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                  placeholder="username"
                  className="premium-input w-full !pl-9"
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">Lowercase letters, numbers, and underscores only</p>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-semibold text-gray-500 mb-1.5">
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="9876543210"
                className="premium-input w-full"
              />
            </div>

            {/* Non-editable: Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-500 mb-1.5">
                Email
              </label>
              <div className="premium-input w-full opacity-60 cursor-not-allowed flex items-center gap-2">
                <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span className="truncate">{profile.email}</span>
              </div>
            </div>

            {/* Non-editable: Role */}
            <div>
              <label className="block text-sm font-semibold text-gray-500 mb-1.5">
                Account Role
              </label>
              <div className="premium-input w-full opacity-60 cursor-not-allowed flex items-center gap-2">
                <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${roleBadgeClass}`}>
                  {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
                </span>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium">
                {error}
              </div>
            )}

            {/* Success */}
            {saved && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Profile saved successfully!
              </div>
            )}

            {/* Save Button */}
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn-premium w-full !py-3.5 relative overflow-hidden disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {saving ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Saving...
                </span>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>

          {/* Danger Zone */}
          <div className="premium-card p-6 space-y-4 border-red-500/10">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              Account Actions
            </h2>

            <button
              onClick={async () => {
                await signOut();
                router.push("/");
              }}
              className="w-full py-3.5 rounded-2xl text-sm font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign Out
            </button>

            <button
              onClick={() => setShowDeleteModal(true)}
              className="w-full py-3.5 rounded-2xl text-sm font-semibold bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 hover:text-red-300 transition-all flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete Account
            </button>
          </div>

        </div>
        <AnimatedBanner seed={60} />
      </main>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
            onClick={() => !deleting && setShowDeleteModal(false)}
          />
          <div className="relative w-full sm:max-w-[380px] bg-white sm:rounded-3xl rounded-t-3xl p-6 pb-8 sm:p-8 shadow-2xl shadow-red-500/10 border border-gray-200/10 animate-slide-up">
            {!deleting && (
              <button
                onClick={() => setShowDeleteModal(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}

            <div className="text-center">
              <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-red-500/25">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>

              <h3 className="text-xl font-extrabold text-gray-900 mb-1">
                Delete Your Account?
              </h3>
              <p className="text-sm text-gray-400 mb-5">
                This is permanent and cannot be undone
              </p>

              <div className="bg-red-50/50 rounded-2xl p-4 mb-6 text-left">
                <p className="text-xs font-semibold text-red-500 uppercase tracking-wider mb-2.5">
                  What will be deleted
                </p>
                <div className="space-y-2">
                  {[
                    { icon: "\u{1F464}", text: "Profile & saved data" },
                    { icon: "\u2B50", text: "Reviews you've written" },
                    { icon: "\u{1F4CB}", text: "Booking history" },
                    { icon: "\u{1F4AC}", text: "Chat messages" },
                  ].map((item) => (
                    <div key={item.text} className="flex items-center gap-2.5">
                      <span className="text-sm">{item.icon}</span>
                      <span className="text-sm text-gray-600">{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2.5">
                <button
                  onClick={handleDeleteAccount}
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
                  onClick={() => setShowDeleteModal(false)}
                  disabled={deleting}
                  className="w-full py-3.5 bg-gray-100 text-gray-700 rounded-2xl font-semibold text-sm hover:bg-gray-200 transition disabled:opacity-50"
                >
                  Keep My Account
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
