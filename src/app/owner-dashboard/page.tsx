"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { amenities as amenityOptions } from "@/data/listings";
import type { RoomOption } from "@/data/listings";
import PhotoUpload from "@/components/PhotoUpload";
import Link from "next/link";
import { authFetch } from "@/lib/auth-fetch";

type RoomOptionEdit = {
  type: "single" | "double" | "triple";
  price: number;
  available: boolean;
};

type OwnerListing = {
  id: string;
  name: string;
  area: string;
  price: number;
  rating: number;
  reviews: number;
  gender: string;
  type: string;
  images: string[];
  room_options: RoomOption[] | null;
  status?: string;
};

type EditFormData = {
  name: string;
  description: string;
  contact_phone: string;
  amenities: string[];
  food_included: boolean;
  wifi_included: boolean;
  ac_available: boolean;
  furnished: boolean;
  available_from: string;
  room_options: RoomOptionEdit[];
  price: number;
};

type ClaimNotification = {
  id: string;
  listing_id: string;
  listing_name: string;
  listing_area: string;
  claim_code: string;
  agent_id: string;
  agent_name: string;
  owner_id: string;
  status: string;
  created_at: string;
};

type Callback = {
  id: number;
  pg_id: string;
  name: string;
  phone: string;
  created_at: string;
  pg_name?: string;
};

type ResidentRequest = {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  pg_id: string;
  pg_name: string;
  status: string;
  created_at: string;
};

type BookingRequest = {
  id: string;
  pg_id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  user_phone: string;
  move_in_date: string;
  room_type: string;
  duration_months: number;
  notes: string;
  total_amount: number;
  status: string;
  created_at: string;
  pg_name?: string;
};

export default function OwnerDashboard() {
  const { user, profile, loading: authLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"overview" | "listings" | "residents" | "bookings" | "inquiries" | "analytics">("overview");
  const [listings, setListings] = useState<OwnerListing[]>([]);
  const [callbacks, setCallbacks] = useState<Callback[]>([]);
  const [residentRequests, setResidentRequests] = useState<ResidentRequest[]>([]);
  const [bookingRequests, setBookingRequests] = useState<BookingRequest[]>([]);
  const [claimNotifications, setClaimNotifications] = useState<ClaimNotification[]>([]);
  const [acceptingClaim, setAcceptingClaim] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [photoListingId, setPhotoListingId] = useState<string | null>(null);
  const [updatingAvailability, setUpdatingAvailability] = useState<string | null>(null);

  // Edit modal state
  const [editingListingId, setEditingListingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EditFormData | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editFetching, setEditFetching] = useState(false);
  const [editError, setEditError] = useState("");
  const [editSuccess, setEditSuccess] = useState(false);

  useEffect(() => { document.title = "Owner Dashboard | Castle"; }, []);

  useEffect(() => {
    if (!authLoading && (!profile || (profile.role !== "owner" && profile.role !== "admin"))) {
      router.push("/login");
      return;
    }
    if (!authLoading && user && profile) {
      loadData();
    }
  }, [authLoading, user, profile, router]);

  const loadData = async () => {
    setLoading(true);
    // Fetch only this owner's listings
    const { data: listingsData } = await supabase
      .from("listings")
      .select("id, name, area, price, rating, reviews, gender, type, images, room_options, status")
      .eq("owner_id", user?.id)
      .order("name");
    setListings((listingsData || []) as OwnerListing[]);

    // Fetch callbacks
    const { data: callbacksData } = await supabase
      .from("callbacks")
      .select("*")
      .order("created_at", { ascending: false });

    const nameMap: Record<string, string> = {};
    (listingsData || []).forEach((l: { id: string; name: string }) => { nameMap[l.id] = l.name; });

    setCallbacks((callbacksData || []).map((c: Record<string, unknown>) => ({
      ...c,
      pg_name: nameMap[c.pg_id as string] || "Unknown",
    })) as Callback[]);

    // Fetch resident requests for this owner
    const { data: resData } = await supabase
      .from("resident_requests")
      .select("*")
      .eq("owner_id", user?.id)
      .order("created_at", { ascending: false });
    setResidentRequests((resData || []) as ResidentRequest[]);

    // Fetch booking requests for owner's PGs
    const ownerListingIds = (listingsData || []).map((l: { id: string }) => l.id);
    if (ownerListingIds.length > 0) {
      const { data: bookingsData } = await supabase
        .from("bookings")
        .select("*")
        .in("pg_id", ownerListingIds)
        .order("created_at", { ascending: false });
      setBookingRequests((bookingsData || []).map((b: Record<string, unknown>) => ({
        ...b,
        pg_name: nameMap[b.pg_id as string] || "Unknown",
      })) as BookingRequest[]);
    }

    // Fetch claim notifications for this owner
    const { data: claimData } = await supabase
      .from("claim_notifications")
      .select("*")
      .eq("owner_id", user?.id)
      .order("created_at", { ascending: false });
    setClaimNotifications((claimData || []) as ClaimNotification[]);

    setLoading(false);
  };

  const handleAcceptClaim = async (notificationId: string) => {
    if (!user) return;
    setAcceptingClaim(notificationId);
    try {
      const res = await fetch("/api/accept-claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notification_id: notificationId, owner_id: user.id }),
      });
      const data = await res.json();
      if (data.success) {
        setClaimNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, status: "accepted" } : n));
        loadData(); // Refresh listings
      }
    } catch { /* silently fail */ }
    setAcceptingClaim(null);
  };

  const handleDismissClaim = async (notificationId: string) => {
    await supabase
      .from("claim_notifications")
      .update({ status: "dismissed" })
      .eq("id", notificationId);
    setClaimNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, status: "dismissed" } : n));
  };

  const handleResidentAction = async (requestId: string, action: "approved" | "rejected") => {
    try {
      const res = await fetch("/api/resident-action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ request_id: requestId, action, owner_id: user?.id }),
      });
      const data = await res.json();
      if (data.success) {
        setResidentRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: action } : r));
      }
    } catch {
      // silently fail
    }
  };

  const handleBookingAction = async (bookingId: string, action: "confirmed" | "cancelled") => {
    try {
      const res = await fetch("/api/booking-action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ booking_id: bookingId, action, owner_id: user?.id }),
      });
      const data = await res.json();
      if (data.success) {
        setBookingRequests(prev => prev.map(b => b.id === bookingId ? { ...b, status: action } : b));
      }
    } catch {
      // silently fail
    }
  };

  const [claimInput, setClaimInput] = useState("");
  const [claiming, setClaiming] = useState(false);
  const [claimResult, setClaimResult] = useState<{ success?: boolean; name?: string; error?: string } | null>(null);

  const handleClaim = async () => {
    if (!claimInput.trim() || !user) return;
    setClaiming(true);
    setClaimResult(null);
    try {
      const res = await fetch("/api/claim-pg", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ claim_code: claimInput.trim(), owner_id: user.id }),
      });
      const data = await res.json();
      if (data.success) {
        setClaimResult({ success: true, name: data.listing.name });
        setClaimInput("");
        loadData(); // Refresh listings
      } else {
        setClaimResult({ error: data.error });
      }
    } catch {
      setClaimResult({ error: "Failed to claim. Try again." });
    }
    setClaiming(false);
  };

  const handleAvailabilityToggle = async (listingId: string, roomType: string, currentAvailable: boolean) => {
    if (!user) return;
    setUpdatingAvailability(`${listingId}-${roomType}`);
    try {
      const res = await fetch("/api/room-availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listing_id: listingId,
          owner_id: user.id,
          room_type: roomType,
          available: !currentAvailable,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setListings(prev => prev.map(l => {
          if (l.id !== listingId || !l.room_options) return l;
          return {
            ...l,
            room_options: l.room_options.map(r =>
              r.type === roomType ? { ...r, available: !currentAvailable } : r
            ),
          };
        }));
      }
    } catch { /* silently fail */ }
    setUpdatingAvailability(null);
  };

  const handlePhotoUpdate = (listingId: string, photos: string[]) => {
    setListings(prev => prev.map(l =>
      l.id === listingId ? { ...l, images: photos } : l
    ));
  };

  const openEditModal = async (listingId: string) => {
    setEditingListingId(listingId);
    setEditError("");
    setEditSuccess(false);
    setEditFetching(true);

    const { data, error } = await supabase
      .from("listings")
      .select("name, description, contact_phone, amenities, food_included, wifi_included, ac_available, furnished, available_from, room_options, price")
      .eq("id", listingId)
      .single();

    if (error || !data) {
      setEditError("Failed to load listing details");
      setEditFetching(false);
      return;
    }

    setEditForm({
      name: data.name || "",
      description: data.description || "",
      contact_phone: data.contact_phone || "",
      amenities: data.amenities || [],
      food_included: !!data.food_included,
      wifi_included: !!data.wifi_included,
      ac_available: !!data.ac_available,
      furnished: !!data.furnished,
      available_from: data.available_from || new Date().toISOString().split("T")[0],
      room_options: data.room_options || [{ type: "single" as const, price: data.price || 0, available: true }],
      price: data.price || 0,
    });
    setEditFetching(false);
  };

  const closeEditModal = () => {
    setEditingListingId(null);
    setEditForm(null);
    setEditError("");
    setEditSuccess(false);
  };

  const handleEditSave = async () => {
    if (!editForm || !editingListingId || !user) return;
    setEditLoading(true);
    setEditError("");
    setEditSuccess(false);

    try {
      const res = await authFetch("/api/edit-listing", {
        method: "POST",
        body: JSON.stringify({
          listing_id: editingListingId,
          owner_id: user.id,
          updates: {
            name: editForm.name,
            description: editForm.description,
            contact_phone: editForm.contact_phone,
            amenities: editForm.amenities,
            food_included: editForm.food_included,
            wifi_included: editForm.wifi_included,
            ac_available: editForm.ac_available,
            furnished: editForm.furnished,
            available_from: editForm.available_from,
            room_options: editForm.room_options,
          },
        }),
      });
      const result = await res.json();
      if (result.success) {
        setEditSuccess(true);
        loadData();
        setTimeout(() => closeEditModal(), 1200);
      } else {
        setEditError(result.error || "Failed to update listing");
      }
    } catch {
      setEditError("Network error. Please try again.");
    }
    setEditLoading(false);
  };

  const toggleEditAmenity = (a: string) => {
    if (!editForm) return;
    setEditForm({
      ...editForm,
      amenities: editForm.amenities.includes(a)
        ? editForm.amenities.filter(x => x !== a)
        : [...editForm.amenities, a],
    });
  };

  const updateRoomOption = (index: number, field: "price" | "available", value: number | boolean) => {
    if (!editForm) return;
    const updated = [...editForm.room_options];
    if (field === "price") updated[index] = { ...updated[index], price: value as number };
    else updated[index] = { ...updated[index], available: value as boolean };
    setEditForm({ ...editForm, room_options: updated });
  };

  const totalViews = listings.length * 200 + Math.floor(Math.random() * 500);
  const avgOccupancy = listings.length ? Math.round(75 + Math.random() * 20) : 0;
  const totalRevenue = listings.reduce((acc, l) => acc + l.price, 0);

  if (authLoading || loading) {
    return (
      <>
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
          {/* Header skeleton */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 animate-pulse">
            <div className="space-y-2">
              <div className="h-8 bg-gray-200 rounded-xl w-56" />
              <div className="h-4 bg-gray-200 rounded w-36" />
            </div>
            <div className="h-10 bg-gray-200 rounded-2xl w-32" />
          </div>

          {/* Tabs skeleton */}
          <div className="grid grid-cols-5 gap-1 bg-gray-100 rounded-2xl p-1 mb-8 animate-pulse">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-10 bg-gray-200 rounded-xl" />
            ))}
          </div>

          {/* Stats skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="premium-card !rounded-2xl p-5 space-y-3">
                <div className="h-4 bg-gray-200 rounded w-24" />
                <div className="h-8 bg-gray-200 rounded-xl w-32" />
              </div>
            ))}
          </div>

          {/* Listing cards skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="premium-card !rounded-2xl overflow-hidden">
                <div className="h-40 bg-gray-200 rounded-t-2xl" />
                <div className="p-5 space-y-3">
                  <div className="h-5 bg-gray-200 rounded-xl w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                  <div className="flex gap-2 pt-1">
                    <div className="h-2.5 w-2.5 bg-gray-200 rounded-full" />
                    <div className="h-2.5 w-2.5 bg-gray-200 rounded-full" />
                    <div className="h-2.5 w-2.5 bg-gray-200 rounded-full" />
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <div className="h-5 bg-gray-200 rounded-lg w-20" />
                    <div className="h-8 bg-gray-200 rounded-xl w-16" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16 overflow-x-hidden">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm text-gray-500 flex items-center gap-2">
          <Link href="/" className="hover:text-[#1B1C15] transition-colors">Home</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">Owner Dashboard</span>
        </nav>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 truncate">Owner Dashboard 📊</h1>
            <p className="text-gray-400 mt-1 text-sm">Welcome back, {profile?.name || "Owner"}!</p>
          </div>
          <Link href="/add-listing" className="btn-premium !py-2.5 !px-5 !text-sm flex items-center gap-2 shrink-0 w-fit">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add New PG
          </Link>
        </div>

        {/* Tabs */}
        <div className="grid grid-cols-6 gap-1 bg-gray-100 rounded-2xl p-1 mb-8">
          {(["overview", "listings", "bookings", "residents", "inquiries", "analytics"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-2 sm:px-5 py-2.5 rounded-xl text-[11px] sm:text-sm font-medium transition-all capitalize text-center ${
                activeTab === tab ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Incoming Claim Notifications */}
        {claimNotifications.filter(n => n.status === "pending").length > 0 && (
          <div className="space-y-3 mb-6">
            {claimNotifications.filter(n => n.status === "pending").map((notif) => (
              <div key={notif.id} className="premium-card !rounded-2xl p-5 border-2 border-emerald-300 bg-emerald-50/50 animate-pulse-once">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 2L11 13" /><path d="M22 2L15 22L11 13L2 9L22 2Z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 text-sm">New PG Claim Request</h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Agent <strong className="text-[#1B1C15]">{notif.agent_name}</strong> has listed <strong className="text-gray-900">&quot;{notif.listing_name}&quot;</strong> in {notif.listing_area} and wants you to claim it.
                    </p>
                    <div className="flex items-center gap-2 mt-3">
                      <button
                        onClick={() => handleAcceptClaim(notif.id)}
                        disabled={acceptingClaim === notif.id}
                        className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-500 text-white hover:bg-emerald-600 transition disabled:opacity-50"
                      >
                        {acceptingClaim === notif.id ? "Accepting..." : "✅ Accept & Claim"}
                      </button>
                      <button
                        onClick={() => handleDismissClaim(notif.id)}
                        className="px-4 py-2 rounded-xl text-xs font-semibold bg-gray-100 text-gray-500 hover:bg-gray-200 transition"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Claim PG Banner */}
        <div className="premium-card !rounded-2xl p-5 mb-6 border border-dashed border-[#e8e0cc] bg-[#F4EDD9]/50">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl bg-[#F4EDD9] flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-[#1B1C15]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 7h3a5 5 0 0 1 5 5 5 5 0 0 1-5 5h-3m-6 0H6a5 5 0 0 1-5-5 5 5 0 0 1 5-5h3" /><line x1="8" y1="12" x2="16" y2="12" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-sm">Claim Your PG</h3>
              <p className="text-xs text-gray-400 mt-0.5">Got a claim code from an agent? Enter it below to link the PG to your account.</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              placeholder="Enter code (e.g. CS-A1B2C3)"
              value={claimInput}
              onChange={(e) => setClaimInput(e.target.value.toUpperCase())}
              className="premium-input w-full sm:flex-1 !py-2.5 !text-sm font-mono tracking-wider"
              maxLength={10}
            />
            <button
              onClick={handleClaim}
              disabled={claiming || !claimInput.trim()}
              className="px-5 py-2.5 bg-[#1B1C15] text-white rounded-xl text-sm font-semibold hover:bg-[#2a2b22] transition disabled:opacity-50 shrink-0"
            >
              {claiming ? "Claiming..." : "Claim"}
            </button>
          </div>
          {claimResult?.success && (
            <div className="mt-3 p-3 bg-emerald-50 rounded-xl text-sm text-emerald-700 flex items-center gap-2">
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              &quot;{claimResult.name}&quot; has been linked to your account!
            </div>
          )}
          {claimResult?.error && (
            <div className="mt-3 p-3 bg-red-50 rounded-xl text-sm text-red-600 flex items-center gap-2">
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              {claimResult.error}
            </div>
          )}
        </div>

        {/* Overview */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-5">
              {[
                { label: "Total Views", value: totalViews.toLocaleString(), change: "+12%", icon: "M15 12a3 3 0 11-6 0 3 3 0 016 0z", bgClass: "bg-[#F4EDD9]", textClass: "text-[#1B1C15]" },
                { label: "Inquiries", value: String(callbacks.length), change: `+${callbacks.length}`, icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z", bgClass: "bg-blue-50", textClass: "text-blue-500" },
                { label: "Occupancy", value: `${avgOccupancy}%`, change: "+5%", icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4", bgClass: "bg-emerald-50", textClass: "text-emerald-500" },
                { label: "Revenue", value: `₹${(totalRevenue / 1000).toFixed(0)}K`, change: "+15%", icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z", bgClass: "bg-amber-50", textClass: "text-amber-500" },
              ].map((stat) => (
                <div key={stat.label} className="premium-card !rounded-2xl p-5">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${stat.bgClass}`}>
                    <svg className={`w-5 h-5 ${stat.textClass}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={stat.icon} />
                    </svg>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-gray-400">{stat.label}</p>
                    <span className="text-xs font-medium text-emerald-500">{stat.change}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Recent Inquiries */}
            <div className="premium-card !rounded-2xl p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Inquiries 📩</h2>
              {callbacks.length === 0 ? (
                <p className="text-gray-400 text-center py-6">No inquiries yet. Share your PG listings to get started!</p>
              ) : (
                <div className="space-y-3">
                  {callbacks.slice(0, 5).map((inq) => (
                    <div key={inq.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#1B1C15] rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {inq.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">{inq.name}</p>
                          <p className="text-xs text-gray-400">{inq.pg_name} · {new Date(inq.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <a href={`tel:${inq.phone}`} className="pill bg-emerald-50 text-emerald-600 !text-xs">
                        📞 {inq.phone}
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Pending Bookings in Overview */}
            {bookingRequests.filter(b => b.status === "pending").length > 0 && (
              <div className="premium-card !rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-gray-900">Pending Bookings 📩</h2>
                  <button onClick={() => setActiveTab("bookings")} className="text-xs font-medium text-[#1B1C15] hover:underline">View All →</button>
                </div>
                <div className="space-y-3">
                  {bookingRequests.filter(b => b.status === "pending").slice(0, 3).map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between p-4 bg-amber-50 rounded-xl border border-amber-100">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">
                          {booking.user_name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900 text-sm truncate">{booking.user_name}</p>
                          <p className="text-xs text-gray-500">{booking.pg_name} · Move-in: {booking.move_in_date} · {booking.room_type}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleBookingAction(booking.id, "confirmed")}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500 text-white hover:bg-emerald-600 transition"
                        >
                          ✅ Accept
                        </button>
                        <button
                          onClick={() => handleBookingAction(booking.id, "cancelled")}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-50 text-red-600 hover:bg-red-100 transition"
                        >
                          ❌
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Listings Tab */}
        {activeTab === "listings" && (
          <div className="space-y-5">
            {listings.map((listing) => (
              <div key={listing.id} className="premium-card !rounded-2xl p-5 sm:p-6">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="font-bold text-gray-900 text-base sm:text-lg truncate">{listing.name}</h3>
                    <p className="text-sm text-gray-400 truncate">{listing.area} · ₹{listing.price.toLocaleString()}/mo</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`pill !text-[10px] ${
                      listing.status === "active" ? "bg-emerald-50 text-emerald-600" :
                      listing.status === "rejected" ? "bg-red-50 text-red-600" :
                      listing.status === "pending" ? "bg-amber-50 text-amber-600" :
                      "bg-gray-100 text-gray-500"
                    }`}>
                      {listing.status === "active" ? "✅ Active" :
                       listing.status === "rejected" ? "❌ Rejected" :
                       listing.status === "pending" ? "⏳ Pending" :
                       listing.status || "Active"}
                    </span>
                    <span className="pill bg-emerald-50 text-emerald-600 !text-xs">⭐ {listing.rating}</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 mt-5">
                  <div className="text-center p-3 bg-gray-50 rounded-xl">
                    <p className="text-xl font-bold text-gray-900">₹{listing.price.toLocaleString()}</p>
                    <p className="text-xs text-gray-400">Rent/mo</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-xl">
                    <p className="text-xl font-bold text-gray-900">{listing.reviews}</p>
                    <p className="text-xs text-gray-400">Reviews</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-xl">
                    <p className="text-xl font-bold text-gray-900 capitalize">{listing.gender}</p>
                    <p className="text-xs text-gray-400">Type</p>
                  </div>
                </div>
                {/* Room Availability Toggles */}
                {listing.room_options && listing.room_options.length > 0 && (
                  <div className="mt-5 p-4 bg-gray-50 rounded-xl">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">🛏️ Room Availability</h4>
                    <div className="flex flex-wrap gap-3">
                      {listing.room_options.map(room => (
                        <button
                          key={room.type}
                          onClick={() => handleAvailabilityToggle(listing.id, room.type, room.available)}
                          disabled={updatingAvailability === `${listing.id}-${room.type}`}
                          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all border-2 ${
                            room.available
                              ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                              : "border-red-300 bg-red-50 text-red-600"
                          } hover:opacity-80 disabled:opacity-50`}
                        >
                          {updatingAvailability === `${listing.id}-${room.type}` ? (
                            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                          ) : (
                            <span className={`w-3 h-3 rounded-full ${room.available ? "bg-emerald-500" : "bg-red-500"}`} />
                          )}
                          {room.type === "single" ? "Single" : room.type === "double" ? "Double" : "Triple"}
                          <span className="text-xs opacity-70">({room.available ? "Available" : "Full"})</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap gap-3 mt-5">
                  <Link href={`/listing/${listing.id}`} className="btn-premium !py-2 !px-5 !text-sm">View</Link>
                  <button
                    onClick={() => openEditModal(listing.id)}
                    className="px-5 py-2 text-sm font-semibold text-[#1B1C15] hover:text-[#1B1C15] border border-[#e8e0cc] rounded-xl hover:bg-[#F4EDD9] transition"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => setPhotoListingId(photoListingId === listing.id ? null : listing.id)}
                    className={`px-5 py-2 text-sm font-semibold rounded-xl transition ${
                      photoListingId === listing.id
                        ? "bg-[#F4EDD9] text-[#1B1C15] border border-[#e8e0cc]"
                        : "text-gray-500 hover:text-gray-700 border border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    📸 {photoListingId === listing.id ? "Hide Photos" : "Manage Photos"}
                  </button>
                  <Link href={`/chat/${listing.id}`} className="px-5 py-2 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 rounded-xl">💬 Messages</Link>
                </div>

                {/* Collapsible Photo Upload Section */}
                {photoListingId === listing.id && (
                  <div className="mt-5 p-5 bg-gray-50 rounded-xl border border-gray-200 animate-in fade-in slide-in-from-top-2 duration-200">
                    <PhotoUpload
                      pgId={listing.id}
                      existingPhotos={listing.images || []}
                      onUpdate={(photos) => handlePhotoUpdate(listing.id, photos)}
                    />
                  </div>
                )}
              </div>
            ))}
            {listings.length === 0 && (
              <div className="text-center py-16">
                <span className="text-5xl block mb-4">🏠</span>
                <p className="text-gray-400 mb-4">No listings found. Add your first PG!</p>
                <Link href="/add-listing" className="btn-premium !py-3 !px-8">
                  ➕ Add Your First PG
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Bookings Tab */}
        {activeTab === "bookings" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-bold text-gray-900">
                Booking Requests ({bookingRequests.filter(b => b.status === "pending").length} pending)
              </h2>
            </div>

            {bookingRequests.length === 0 ? (
              <div className="premium-card !rounded-2xl p-10 text-center">
                <span className="text-5xl block mb-4">📩</span>
                <p className="text-gray-400 mb-2">No booking requests yet</p>
                <p className="text-xs text-gray-400">When tenants click &quot;Book Now&quot; on your PG, their requests will appear here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {[...bookingRequests].sort((a, b) => {
                  const order: Record<string, number> = { pending: 0, confirmed: 1, cancelled: 2, completed: 3 };
                  return (order[a.status] ?? 4) - (order[b.status] ?? 4);
                }).map((booking) => (
                  <div key={booking.id} className={`premium-card !rounded-2xl p-5 transition-all ${
                    booking.status === "pending" ? "border-2 border-amber-200" :
                    booking.status === "confirmed" ? "border border-emerald-200 opacity-80" :
                    "opacity-50"
                  }`}>
                    <div className="flex flex-col gap-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 ${
                            booking.status === "pending" ? "bg-gradient-to-br from-amber-400 to-orange-500" :
                            booking.status === "confirmed" ? "bg-gradient-to-br from-emerald-400 to-teal-500" :
                            "bg-gradient-to-br from-gray-400 to-gray-500"
                          }`}>
                            {booking.user_name.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-900 text-sm truncate">{booking.user_name}</p>
                            <p className="text-xs text-gray-400 truncate">{booking.user_email} {booking.user_phone && `• ${booking.user_phone}`}</p>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              <span className="text-xs text-[#1B1C15] font-medium truncate">🏠 {booking.pg_name}</span>
                              <span className="text-[10px] text-gray-400">
                                {new Date(booking.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {booking.status === "pending" && (
                            <>
                              <button
                                onClick={() => handleBookingAction(booking.id, "confirmed")}
                                className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-500 text-white hover:bg-emerald-600 transition-all hover:-translate-y-0.5 active:translate-y-0"
                              >
                                ✅ Accept
                              </button>
                              <button
                                onClick={() => handleBookingAction(booking.id, "cancelled")}
                                className="px-4 py-2 rounded-xl text-xs font-semibold bg-red-50 text-red-600 hover:bg-red-100 transition-all hover:-translate-y-0.5 active:translate-y-0"
                              >
                                ❌ Reject
                              </button>
                            </>
                          )}
                          {booking.status === "confirmed" && (
                            <span className="px-3 py-1.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-600">
                              ✅ Accepted
                            </span>
                          )}
                          {booking.status === "cancelled" && (
                            <span className="px-3 py-1.5 rounded-full text-[10px] font-semibold bg-red-50 text-red-500">
                              Rejected
                            </span>
                          )}
                          {booking.status === "completed" && (
                            <span className="px-3 py-1.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-600">
                              Moved In
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Booking details */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-[#F4EDD9] rounded-xl p-3 text-xs">
                        <div>
                          <span className="text-gray-500">Move-in</span>
                          <p className="font-semibold text-gray-900">{booking.move_in_date || "Flexible"}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Room</span>
                          <p className="font-semibold text-gray-900 capitalize">{booking.room_type}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Duration</span>
                          <p className="font-semibold text-gray-900">{booking.duration_months} month{booking.duration_months > 1 ? "s" : ""}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Rent</span>
                          <p className="font-semibold text-gray-900">₹{(booking.total_amount || 0).toLocaleString()}/mo</p>
                        </div>
                      </div>

                      {booking.notes && (
                        <div className="text-xs text-gray-500 bg-gray-50 rounded-xl p-3">
                          💬 <span className="text-gray-700">{booking.notes}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Residents Tab */}
        {activeTab === "residents" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-bold text-gray-900">
                Resident Requests ({residentRequests.filter(r => r.status === "pending").length} pending)
              </h2>
            </div>

            {residentRequests.length === 0 ? (
              <div className="premium-card !rounded-2xl p-10 text-center">
                <span className="text-5xl block mb-4">🏠</span>
                <p className="text-gray-400 mb-2">No resident requests yet</p>
                <p className="text-xs text-gray-400">When tenants click &quot;I Stay Here&quot; on your PG, their requests will appear here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Pending first, then approved, then rejected */}
                {[...residentRequests].sort((a, b) => {
                  const order: Record<string, number> = { pending: 0, approved: 1, rejected: 2 };
                  return (order[a.status] ?? 3) - (order[b.status] ?? 3);
                }).map((req) => (
                  <div key={req.id} className={`premium-card !rounded-2xl p-5 transition-all ${
                    req.status === "pending" ? "border-2 border-amber-200" :
                    req.status === "approved" ? "border border-emerald-200 opacity-80" :
                    "opacity-50"
                  }`}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 ${
                          req.status === "pending" ? "bg-gradient-to-br from-amber-400 to-orange-500" :
                          req.status === "approved" ? "bg-gradient-to-br from-emerald-400 to-teal-500" :
                          "bg-gradient-to-br from-gray-400 to-gray-500"
                        }`}>
                          {req.user_name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900 text-sm truncate">{req.user_name}</p>
                          <p className="text-xs text-gray-400 truncate">{req.user_email}</p>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span className="text-xs text-[#1B1C15] font-medium truncate">🏠 {req.pg_name}</span>
                            <span className="text-[10px] text-gray-400">
                              {new Date(req.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {req.status === "pending" && (
                          <>
                            <button
                              onClick={() => handleResidentAction(req.id, "approved")}
                              className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-500 text-white hover:bg-emerald-600 transition-all hover:-translate-y-0.5 active:translate-y-0"
                            >
                              ✅ Approve
                            </button>
                            <button
                              onClick={() => handleResidentAction(req.id, "rejected")}
                              className="px-4 py-2 rounded-xl text-xs font-semibold bg-red-50 text-red-600 hover:bg-red-100 transition-all hover:-translate-y-0.5 active:translate-y-0"
                            >
                              ❌ Reject
                            </button>
                          </>
                        )}
                        {req.status === "approved" && (
                          <span className="px-3 py-1.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-600">
                            ✅ Approved
                          </span>
                        )}
                        {req.status === "rejected" && (
                          <span className="px-3 py-1.5 rounded-full text-[10px] font-semibold bg-red-50 text-red-500">
                            Rejected
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Inquiries Tab */}
        {activeTab === "inquiries" && (
          <div className="premium-card !rounded-2xl overflow-hidden">
            <div className="p-5 border-b border-gray-100">
              <h2 className="font-bold text-gray-900">All Inquiries ({callbacks.length})</h2>
            </div>
            {callbacks.length === 0 ? (
              <p className="text-gray-400 text-center py-10">No inquiries yet</p>
            ) : (
              <div className="divide-y divide-gray-100">
                {callbacks.map((inq) => (
                  <div key={inq.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-gray-50 transition">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 bg-[#1B1C15] rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">
                        {inq.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 text-sm truncate">{inq.name}</p>
                        <p className="text-xs text-gray-400 truncate">{inq.phone} · {inq.pg_name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 ml-[52px] sm:ml-0">
                      <span className="text-xs text-gray-400">{new Date(inq.created_at).toLocaleDateString()}</span>
                      <a href={`tel:${inq.phone}`} className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-100">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      </a>
                      <a href={`https://wa.me/91${inq.phone}`} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-lg bg-green-50 text-green-600 flex items-center justify-center hover:bg-green-100">
                        💬
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === "analytics" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="premium-card !rounded-2xl p-6">
              <h3 className="font-bold text-gray-900 mb-4">Listings by Area 📍</h3>
              <div className="space-y-4">
                {Object.entries(
                  listings.reduce((acc: Record<string, number>, l) => {
                    acc[l.area] = (acc[l.area] || 0) + 1;
                    return acc;
                  }, {})
                ).map(([area, count]) => (
                  <div key={area}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">{area}</span>
                      <span className="font-medium text-gray-900">{count} PGs</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full">
                      <div className="h-full rounded-full bg-[#1B1C15]" style={{ width: `${(count / listings.length) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="premium-card !rounded-2xl p-6">
              <h3 className="font-bold text-gray-900 mb-4">Price Distribution 💰</h3>
              <div className="space-y-4">
                {[
                  { range: "Under ₹8K", min: 0, max: 8000 },
                  { range: "₹8K - ₹12K", min: 8000, max: 12000 },
                  { range: "₹12K - ₹18K", min: 12000, max: 18000 },
                  { range: "Above ₹18K", min: 18000, max: 999999 },
                ].map((bucket) => {
                  const count = listings.filter((l) => l.price >= bucket.min && l.price < bucket.max).length;
                  return (
                    <div key={bucket.range}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">{bucket.range}</span>
                        <span className="font-medium text-gray-900">{count}</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full">
                        <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400" style={{ width: `${listings.length ? (count / listings.length) * 100 : 0}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="premium-card !rounded-2xl p-6 lg:col-span-2">
              <h3 className="font-bold text-gray-900 mb-4">Inquiry Trend 📈</h3>
              {callbacks.length === 0 ? (
                <p className="text-gray-400 text-center py-6">No data yet</p>
              ) : (
                <div className="flex items-end gap-4 h-48">
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, i) => {
                    const pct = 30 + Math.random() * 60;
                    return (
                      <div key={day} className="flex-1 flex flex-col items-center gap-2">
                        <div
                          className="w-full bg-[#1B1C15] rounded-t-lg transition-all hover:opacity-80"
                          style={{ height: `${pct}%` }}
                        />
                        <span className="text-[10px] text-gray-400">{day}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Edit Listing Modal */}
        {editingListingId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeEditModal} />
            <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-3xl shadow-2xl">
              <div className="sticky top-0 bg-white z-10 p-6 pb-4 border-b border-gray-100 rounded-t-3xl">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">Edit Listing</h2>
                  <button onClick={closeEditModal} className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-700 transition">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              </div>

              {editFetching ? (
                <div className="flex items-center justify-center py-20">
                  <div className="animate-spin w-8 h-8 border-4 border-[#1B1C15] border-t-transparent rounded-full" />
                </div>
              ) : editForm ? (
                <div className="p-6 space-y-5">
                  {/* PG Name */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">PG Name</label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="premium-input w-full"
                      placeholder="PG Name"
                    />
                  </div>

                  {/* Room Prices */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Room Pricing</label>
                    <div className="space-y-3">
                      {editForm.room_options.map((room, idx) => (
                        <div key={room.type} className="flex items-center gap-3">
                          <label className="flex items-center gap-2 min-w-[100px]">
                            <input
                              type="checkbox"
                              checked={room.available}
                              onChange={(e) => updateRoomOption(idx, "available", e.target.checked)}
                              className="w-4 h-4 rounded border-gray-300 text-[#1B1C15] focus:ring-[#1B1C15]/20"
                            />
                            <span className="text-sm font-medium text-gray-700 capitalize">{room.type}</span>
                          </label>
                          <div className="relative flex-1">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₹</span>
                            <input
                              type="number"
                              value={room.price || ""}
                              onChange={(e) => updateRoomOption(idx, "price", Number(e.target.value))}
                              disabled={!room.available}
                              className="premium-input w-full !pl-7 disabled:opacity-40"
                              placeholder="Price/mo"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description</label>
                    <textarea
                      value={editForm.description}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      rows={3}
                      className="premium-input w-full resize-none"
                      placeholder="Describe your PG..."
                    />
                  </div>

                  {/* Contact Phone */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Contact Phone</label>
                    <input
                      type="tel"
                      value={editForm.contact_phone}
                      onChange={(e) => setEditForm({ ...editForm, contact_phone: e.target.value })}
                      className="premium-input w-full"
                      placeholder="Phone number"
                    />
                  </div>

                  {/* Toggles */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Facilities</label>
                    <div className="grid grid-cols-2 gap-3">
                      {([
                        { key: "food_included", label: "Food Included", icon: "🍽️" },
                        { key: "wifi_included", label: "WiFi", icon: "📶" },
                        { key: "ac_available", label: "AC", icon: "❄️" },
                        { key: "furnished", label: "Furnished", icon: "🛋️" },
                      ] as const).map(({ key, label, icon }) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setEditForm({ ...editForm, [key]: !editForm[key] })}
                          className={`flex items-center gap-2.5 p-3 rounded-xl border-2 transition-all text-left ${
                            editForm[key]
                              ? "border-[#8a8070] bg-[#F4EDD9]"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <span className="text-lg">{icon}</span>
                          <span className={`text-sm font-medium ${editForm[key] ? "text-[#1B1C15]" : "text-gray-500"}`}>{label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Amenities */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Amenities</label>
                    <div className="flex flex-wrap gap-2">
                      {amenityOptions.map((a) => (
                        <button
                          key={a}
                          type="button"
                          onClick={() => toggleEditAmenity(a)}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                            editForm.amenities.includes(a)
                              ? "bg-[#F4EDD9] border-[#e8e0cc] text-[#1B1C15]"
                              : "bg-gray-50 border-gray-200 text-gray-500 hover:border-gray-300"
                          }`}
                        >
                          {a}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Available From */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Available From</label>
                    <input
                      type="date"
                      value={editForm.available_from}
                      onChange={(e) => setEditForm({ ...editForm, available_from: e.target.value })}
                      className="premium-input w-full"
                    />
                  </div>

                  {/* Error / Success */}
                  {editError && (
                    <div className="p-3 bg-red-50 rounded-xl text-sm text-red-600 flex items-center gap-2">
                      <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                      {editError}
                    </div>
                  )}
                  {editSuccess && (
                    <div className="p-3 bg-emerald-50 rounded-xl text-sm text-emerald-700 flex items-center gap-2">
                      <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                      Listing updated successfully!
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={handleEditSave}
                      disabled={editLoading}
                      className="btn-premium !py-2.5 !px-8 !text-sm flex items-center gap-2"
                    >
                      {editLoading ? (
                        <>
                          <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                          Saving...
                        </>
                      ) : (
                        "Save Changes"
                      )}
                    </button>
                    <button
                      onClick={closeEditModal}
                      className="px-6 py-2.5 text-sm font-medium text-gray-500 hover:text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center text-gray-400">
                  {editError || "Something went wrong"}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </>
  );
}
