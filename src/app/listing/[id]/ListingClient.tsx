"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
import { fetchListingById, fetchReviews } from "@/lib/db";
import type { PGListing } from "@/data/listings";
import type { Review } from "@/lib/db";
import Header from "@/components/Header";
import ReviewSection from "@/components/ReviewSection";
import CallbackModal from "@/components/CallbackModal";
import ShareButtons from "@/components/ShareButtons";
import ShareToFriends from "@/components/ShareToFriends";
import WishlistButton from "@/components/WishlistButton";
import NearbyPlaces from "@/components/NearbyPlaces";
import PhotoGallery from "@/components/PhotoGallery";
import MapEmbed from "@/components/MapEmbed";
import AdBanner from "@/components/AdBanner";
import AnimatedBanner from "@/components/AnimatedBanner";
import CostCalculator from "@/components/CostCalculator";
import ScheduleVisit from "@/components/ScheduleVisit";
import SafetyScore from "@/components/SafetyScore";
import TransportProximity from "@/components/TransportProximity";
import NeighborhoodInfo from "@/components/NeighborhoodInfo";
import OwnerResponseBadge from "@/components/OwnerResponseBadge";
import SentimentAnalysis from "@/components/SentimentAnalysis";
import PricePrediction from "@/components/PricePrediction";
import ListingQualityScore from "@/components/ListingQualityScore";
import CastleScore from "@/components/CastleScore";
import CastleGuarantee from "@/components/CastleGuarantee";
import SimilarPGs from "@/components/SimilarPGs";
import VirtualTourBooking from "@/components/VirtualTourBooking";
import NotificationPreferences from "@/components/NotificationPreferences";
import EmergencyContacts from "@/components/EmergencyContacts";
import WalkthroughVideo from "@/components/WalkthroughVideo";
import AmenityBreakdown from "@/components/AmenityBreakdown";
import NearbyEssentials from "@/components/NearbyEssentials";
import VisitReminder from "@/components/VisitReminder";
import RentVsBuyCalculator from "@/components/RentVsBuyCalculator";
import ListingQuickActions from "@/components/ListingQuickActions";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import { authFetch } from "@/lib/auth-fetch";

type ReportEntry = { pgId: string; reason: string; description: string; date: string };

export default function ListingClient() {
  const { id } = useParams();
  const { user, profile } = useAuth();
  const { addToRecent } = useRecentlyViewed();
  const [pg, setPg] = useState<PGListing | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCallback, setShowCallback] = useState(false);
  const [selectingPg, setSelectingPg] = useState(false);
  const [isCurrentPg, setIsCurrentPg] = useState(false);
  const [requestStatus, setRequestStatus] = useState<string | null>(null);
  const [selectMsg, setSelectMsg] = useState("");
  const [showRemoveWarning, setShowRemoveWarning] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [ownerId, setOwnerId] = useState<string | null>(null);
  // Report state
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  const [isReported, setIsReported] = useState(false);
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [showScheduleVisit, setShowScheduleVisit] = useState(false);
  const [showCostCalc, setShowCostCalc] = useState(false);
  const [showVirtualTour, setShowVirtualTour] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Check resident request status
  useEffect(() => {
    if (user && typeof id === "string") {
      // Check if already linked via profile
      if (profile?.currentPgId === id) {
        setIsCurrentPg(true);
        setRequestStatus("approved");
        return;
      }
      // Check request status from API
      fetch(`/api/select-pg?user_id=${user.id}&pg_id=${id}`)
        .then(r => r.json())
        .then(data => {
          if (data.isLinked) {
            setIsCurrentPg(true);
            setRequestStatus("approved");
          } else if (data.request) {
            setRequestStatus(data.request.status);
            setIsCurrentPg(data.request.status === "approved");
          }
        })
        .catch(() => {});
    }
  }, [user, profile, id]);

  const handleRequestStay = async () => {
    if (!user || !id) return;
    setSelectingPg(true);
    setSelectMsg("");
    try {
      const res = await authFetch("/api/select-pg", {
        method: "POST",
        body: JSON.stringify({
          user_id: user.id,
          user_name: profile?.name || "User",
          user_email: profile?.email || "",
          pg_id: id,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setRequestStatus("pending");
        setSelectMsg("Request sent! Owner will review it 📩");
      } else {
        setSelectMsg(data.error || "Failed to send request");
      }
    } catch {
      setSelectMsg("Something went wrong");
    }
    setSelectingPg(false);
    setTimeout(() => setSelectMsg(""), 4000);
  };

  const handleRemovePg = async () => {
    if (!user) return;
    setRemoving(true);
    try {
      const res = await authFetch("/api/select-pg", {
        method: "DELETE",
        body: JSON.stringify({ user_id: user.id, pg_id: id }),
      });
      const data = await res.json();
      if (data.success) {
        setIsCurrentPg(false);
        setRequestStatus(null);
        setShowRemoveWarning(false);
        setSelectMsg("Removed from your PG");
        if (profile) profile.currentPgId = null;
      } else {
        setSelectMsg(data.error || "Failed to remove");
      }
    } catch {
      setSelectMsg("Something went wrong");
    }
    setRemoving(false);
    setTimeout(() => setSelectMsg(""), 3000);
  };

  useEffect(() => {
    if (typeof id === "string") {
      Promise.all([fetchListingById(id), fetchReviews(id)])
        .then(([listing, revs]) => {
          setPg(listing);
          setReviews(revs);
          setLoading(false);
          if (listing) {
            document.title = `${listing.name} in ${listing.area} | Castle`;
            addToRecent({
              id: listing.id,
              name: listing.name,
              area: listing.area,
              price: listing.price,
              rating: listing.rating,
              image: listing.images?.[0] || "",
            });
          }
        })
        .catch(() => {
          setLoading(false);
        });
      // Fetch owner_id for the listing
      supabase.from("listings").select("owner_id").eq("id", id).single().then(({ data }) => {
        if (data?.owner_id) setOwnerId(data.owner_id);
      });
      // Check if already reported
      try {
        const reports: ReportEntry[] = JSON.parse(localStorage.getItem("reported_pgs") || "[]");
        if (reports.some((r) => r.pgId === id)) setIsReported(true);
      } catch { /* ignore */ }
    }
  }, [id]);

  const handleReport = () => {
    if (!reportReason || typeof id !== "string") return;
    setReportSubmitting(true);
    const reports: ReportEntry[] = JSON.parse(localStorage.getItem("reported_pgs") || "[]");
    reports.push({ pgId: id, reason: reportReason, description: reportDescription, date: new Date().toISOString() });
    localStorage.setItem("reported_pgs", JSON.stringify(reports));
    setIsReported(true);
    setShowReportModal(false);
    setReportReason("");
    setReportDescription("");
    setReportSubmitting(false);
  };

  if (loading) {
    return (
      <>
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-48 mb-6" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-80 bg-gray-200 rounded-2xl" />
                <div className="h-8 bg-gray-200 rounded w-2/3" />
                <div className="h-4 bg-gray-200 rounded w-1/3" />
                <div className="flex gap-3">
                  <div className="h-10 bg-gray-200 rounded-xl w-32" />
                  <div className="h-10 bg-gray-200 rounded-xl w-28" />
                  <div className="h-10 bg-gray-200 rounded-xl w-36" />
                </div>
              </div>
              <div className="space-y-4">
                <div className="h-96 bg-gray-200 rounded-2xl" />
              </div>
            </div>
          </div>
        </main>
      </>
    );
  }

  if (!pg) {
    return (
      <>
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <div className="text-6xl mb-6">🏠</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">PG Not Found</h1>
          <p className="text-gray-500 mb-6">This listing may have been removed or doesn&apos;t exist.</p>
          <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 bg-[#1B1C15] text-white rounded-xl font-medium hover:bg-[#2a2b22] transition">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Browse All PGs
          </Link>
        </div>
      </>
    );
  }
  const genderLabels = { male: "Male Only", female: "Female Only", coed: "Co-ed (Male & Female)" };
  const typeLabels = { single: "Single Occupancy", double: "Double Sharing", triple: "Triple Sharing", any: "Any" };

  // Build price range from room options or base price
  const priceRange = pg.roomOptions && pg.roomOptions.length > 0
    ? `₹${Math.min(...pg.roomOptions.map(r => r.price))}-₹${Math.max(...pg.roomOptions.map(r => r.price))}`
    : `₹${pg.price}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LodgingBusiness",
    "name": pg.name,
    "description": pg.description,
    "image": pg.images?.[0] || "",
    "url": `https://castleliving.in/listing/${pg.id}`,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": pg.locality,
      "addressLocality": pg.area,
      "addressRegion": "Bangalore, Karnataka",
      "addressCountry": "IN",
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": pg.lat,
      "longitude": pg.lng,
    },
    "priceRange": priceRange,
    "amenityFeature": pg.amenities.map((a) => ({
      "@type": "LocationFeatureSpecification",
      "name": a,
      "value": true,
    })),
    ...(pg.rating > 0 && pg.reviews > 0 ? {
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": pg.rating.toString(),
        "bestRating": "5",
        "reviewCount": pg.reviews.toString(),
      },
    } : {}),
  };

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24 animate-fade-in-up">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm text-gray-500 flex items-center gap-2">
          <Link href="/" className="hover:text-[#1B1C15]">Home</Link>
          <span>/</span>
          <Link href={`/area/${pg.area.toLowerCase().replace(/\s+/g, "-")}`} className="hover:text-[#1B1C15]">{pg.area}</Link>
          <span>/</span>
          <span className="text-gray-900">{pg.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Photo Gallery */}
            <div className="relative">
              <PhotoGallery pgName={pg.name} images={pg.images} />
              {/* Wishlist + Verified badges */}
              <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
                <WishlistButton pgId={pg.id} pgName={pg.name} size="lg" />
              </div>
              {pg.rating >= 4.5 && (
                <div className="absolute top-4 left-4 z-10">
                  <span className="pill bg-emerald-500 text-white shadow-lg !text-xs">
                    <svg className="w-3.5 h-3.5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Verified
                  </span>
                </div>
              )}
            </div>

            {/* Title & Rating & Share */}
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{pg.name}</h1>
                  <p className="text-gray-500 mt-1 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {pg.locality}, {pg.area}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <ShareButtons pgName={pg.name} pgArea={pg.area} pgPrice={pg.price} />
                  {/* Report Button */}
                  <button
                    onClick={() => !isReported && setShowReportModal(true)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                      isReported
                        ? "bg-red-50 text-red-500 cursor-default"
                        : "bg-gray-100 text-gray-500 hover:bg-red-50 hover:text-red-500"
                    }`}
                    aria-label={isReported ? "You have reported this listing" : "Report this listing"}
                    title={isReported ? "You have reported this listing" : "Report this listing"}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
                      <line x1="4" y1="22" x2="4" y2="15" />
                    </svg>
                    {isReported ? "Reported" : "Report"}
                  </button>
                  <div className="flex items-center gap-1 bg-yellow-50 px-3 py-2 rounded-xl">
                    <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="text-lg font-bold text-gray-900">{pg.rating}</span>
                    <span className="text-sm text-gray-500">({pg.reviews})</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Share to Friends */}
            <ShareToFriends pgName={pg.name} pgPrice={pg.price} pgArea={pg.area} pgId={pg.id} />

            {/* Room Options */}
            {pg.roomOptions && pg.roomOptions.length > 0 && (
              <div className="premium-card !rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">🛏️ Room Options</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {pg.roomOptions.map(r => (
                    <div key={r.type} className={`relative p-4 rounded-xl border-2 text-center transition-all ${r.available ? "border-[#1B1C15] bg-[#F4EDD9]" : "border-gray-200 opacity-60"}`}>
                      {/* Availability Badge */}
                      <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-3 py-1 rounded-full shadow-sm ${
                          r.available
                            ? "bg-emerald-500 text-white"
                            : "bg-red-500 text-white"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${r.available ? "bg-emerald-200 animate-pulse" : "bg-red-200"}`} />
                          {r.available ? "AVAILABLE" : "FULL"}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-gray-700 mb-1 mt-2">
                        {r.type === "single" ? "Single Room" : r.type === "double" ? "Double Sharing" : "Triple Sharing"}
                      </p>
                      <p className="text-2xl font-bold text-gray-900">₹{r.price.toLocaleString()}</p>
                      <p className="text-xs text-gray-400">/month</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Info Badges */}
            <div className="flex flex-wrap gap-3">
              <span className="px-4 py-2 bg-[#F4EDD9] text-[#1B1C15] rounded-xl font-medium">{typeLabels[pg.type]}</span>
              <span className={`px-4 py-2 rounded-xl font-medium ${pg.gender === "male" ? "bg-blue-50 text-blue-700" : pg.gender === "female" ? "bg-pink-50 text-pink-700" : "bg-[#F4EDD9] text-[#1B1C15]"}`}>
                {genderLabels[pg.gender]}
              </span>
              {pg.furnished && <span className="px-4 py-2 bg-green-50 text-green-700 rounded-xl font-medium">✨ Fully Furnished</span>}
              {pg.foodIncluded && <span className="px-4 py-2 bg-orange-50 text-orange-700 rounded-xl font-medium">🍽️ Food Included</span>}
              {pg.acAvailable && <span className="px-4 py-2 bg-blue-50 text-blue-700 rounded-xl font-medium">❄️ AC Available</span>}
            </div>

            {/* Description */}
            <div className="premium-card !rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">About this PG</h2>
              <p className="text-gray-600 leading-relaxed">{pg.description}</p>
            </div>

            {/* Amenities */}
            <div className="premium-card !rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Amenities</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {pg.amenities.map((a) => (
                  <div key={a} className="flex items-center gap-2 text-gray-700 bg-gray-50 px-4 py-3 rounded-xl">
                    <svg className="w-5 h-5 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm font-medium">{a}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Nearby Landmarks */}
            <div className="premium-card !rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Nearby Landmarks</h2>
              <div className="flex flex-wrap gap-2">
                {pg.nearbyLandmarks.map((l) => (
                  <span key={l} className="px-3 py-1.5 bg-gray-100 rounded-lg text-sm text-gray-700">{l}</span>
                ))}
              </div>
              {pg.distanceFromMetro && (
                <p className="mt-3 text-sm text-gray-500 flex items-center gap-1">
                  <svg className="w-4 h-4 text-[#1B1C15]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  Nearest Metro: {pg.distanceFromMetro}
                </p>
              )}
            </div>

            {/* Nearby Places */}
            <NearbyPlaces area={pg.area} />

            {/* Safety Score & Transport Proximity */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SafetyScore area={pg.area} />
              <TransportProximity area={pg.area} />
            </div>
            <NeighborhoodInfo area={pg.area} />

            {/* Walkthrough Video */}
            <WalkthroughVideo pgId={pg.id} pgName={pg.name} />

            {/* Real Map */}
            {pg.lat && pg.lng && (
              <div className="premium-card !rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">📍 Location</h2>
                <MapEmbed lat={pg.lat} lng={pg.lng} name={pg.name} area={pg.area} />
              </div>
            )}

            {/* Dynamic banner before reviews */}
            <AnimatedBanner seed={30} />

            {/* Ad before reviews */}
            <AdBanner size="rectangle" slot="1122334455" />

            {/* I Stay Here — Request to link to PG */}
            {user && (
              <div className={`premium-card !rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-all ${
                isCurrentPg ? "border-2 border-emerald-300 bg-emerald-50/50" :
                requestStatus === "pending" ? "border-2 border-amber-300 bg-amber-50/50" : ""
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                    isCurrentPg ? "bg-emerald-100" :
                    requestStatus === "pending" ? "bg-amber-100" :
                    "bg-[#F4EDD9]"
                  }`}>
                    <svg className={`w-5 h-5 ${
                      isCurrentPg ? "text-emerald-600" :
                      requestStatus === "pending" ? "text-amber-600" :
                      "text-[#1B1C15]"
                    }`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                      <polyline points="9 22 9 12 15 12 15 22" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">
                      {isCurrentPg ? "You are a verified resident 🏠" :
                       requestStatus === "pending" ? "Request pending ⏳" :
                       "Do you stay here?"}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {isCurrentPg ? "You can write reviews for this PG" :
                       requestStatus === "pending" ? "Waiting for owner to approve your request" :
                       "Request to link yourself — owner will approve"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {selectMsg && (
                    <span className={`text-xs font-medium ${selectMsg.includes("Failed") || selectMsg.includes("wrong") || selectMsg.includes("doesn") ? "text-red-500" : "text-emerald-500"}`}>
                      {selectMsg}
                    </span>
                  )}
                  {!requestStatus && (
                    <button
                      onClick={handleRequestStay}
                      disabled={selectingPg}
                      className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 bg-[#1B1C15] text-white hover:shadow-lg hover:shadow-black/20"
                    >
                      {selectingPg ? "Sending..." : "I Stay Here"}
                    </button>
                  )}
                  {requestStatus === "pending" && (
                    <span className="px-4 py-2 rounded-xl text-xs font-semibold bg-amber-100 text-amber-700">
                      ⏳ Awaiting Approval
                    </span>
                  )}
                  {isCurrentPg && (
                    <div className="flex items-center gap-2">
                      <span className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-100 text-emerald-700">
                        ✅ Approved
                      </span>
                      <button
                        onClick={() => setShowRemoveWarning(true)}
                        className="px-3 py-2 rounded-xl text-xs font-medium text-red-500 hover:bg-red-50 transition"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Reviews */}
            <ReviewSection
              reviews={reviews}
              pgId={pg.id}
              pgName={pg.name}
              isResident={isCurrentPg}
              userId={user?.id}
              userName={profile?.name}
              isLoggedIn={!!user}
              isOwner={!!user && !!ownerId && user.id === ownerId}
            />

            {/* Sentiment Analysis + Price Prediction + Quality Score */}
            {reviews.length > 0 && (
              <SentimentAnalysis reviews={reviews} />
            )}
            <PricePrediction
              area={pg.area}
              amenities={pg.amenities}
              furnished={pg.furnished}
              foodIncluded={pg.foodIncluded}
              acAvailable={pg.acAvailable}
              currentPrice={pg.price}
            />
            <CastleScore pg={pg} />
            <CastleGuarantee />
            <ListingQualityScore pg={pg} />
            <SimilarPGs currentPg={pg} />
            <RentVsBuyCalculator />
          </div>

          {/* Right Column — Contact & Price */}
          <div className="space-y-6">
            {/* Price Card */}
            <div className="premium-card !rounded-2xl p-6 sticky top-24">
              <div className="text-center mb-6">
                <p className="text-sm text-gray-500 mb-1">Monthly Rent</p>
                {pg.roomOptions && pg.roomOptions.length > 1 ? (
                  <>
                    <p className="text-3xl font-bold text-gray-900">
                      ₹{Math.min(...pg.roomOptions.map(r => r.price)).toLocaleString()} – ₹{Math.max(...pg.roomOptions.map(r => r.price)).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-400 mt-1">depending on room type</p>
                  </>
                ) : (
                  <>
                    <p className="text-4xl font-bold text-gray-900">₹{pg.price.toLocaleString()}</p>
                    <p className="text-sm text-gray-400 mt-1">per month / per person</p>
                  </>
                )}
              </div>

              {/* Calculate Cost Button */}
              <button
                onClick={() => setShowCostCalc(true)}
                className="w-full mb-5 py-3 rounded-2xl text-sm font-semibold transition-all hover:-translate-y-0.5 active:translate-y-0 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 text-amber-800 hover:border-amber-300 hover:shadow-lg hover:shadow-amber-100 flex items-center justify-center gap-2"
              >
                <span className="text-base">💰</span>
                Calculate Total Monthly Cost
              </button>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Available From</span>
                  <span className="font-medium text-gray-900">
                    {new Date(pg.availableFrom).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Room Type</span>
                  <span className="font-medium text-gray-900">{typeLabels[pg.type]}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Food</span>
                  <span className="font-medium text-gray-900">{pg.foodIncluded ? "✅ Included" : "❌ Not Included"}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-500">WiFi</span>
                  <span className="font-medium text-gray-900">{pg.wifiIncluded ? "✅ Included" : "❌ Not Included"}</span>
                </div>
              </div>

              {/* Contact Person */}
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl mb-5">
                <div className="w-10 h-10 rounded-full bg-[#F4EDD9] flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-[#1B1C15]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <div>
                  <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">Contact Person</p>
                  <p className="font-semibold text-gray-900 text-sm">{pg.contactName}</p>
                </div>
              </div>

              {/* Owner Response Badge */}
              <OwnerResponseBadge contactName={pg.contactName} avgResponseTime={pg.rating >= 4.5 ? 15 : pg.rating >= 4.0 ? 45 : 120} />

              {/* Primary CTA — Book Now */}
              <Link
                href={`/booking/${pg.id}`}
                className="w-full relative overflow-hidden bg-[#1B1C15] text-white py-3.5 rounded-2xl font-semibold text-center block transition-all hover:shadow-xl hover:shadow-black/20 hover:-translate-y-0.5 active:translate-y-0"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                  </svg>
                  Book Now
                </span>
              </Link>

              {/* Schedule Visit CTA */}
              <button
                onClick={() => setShowScheduleVisit(true)}
                className="w-full mt-3 relative overflow-hidden bg-[#F4EDD9] text-[#1B1C15] py-3.5 rounded-2xl font-semibold text-center transition-all hover:shadow-lg hover:shadow-amber-500/10 hover:-translate-y-0.5 active:translate-y-0 border-2 border-[#e8e0cc]"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  Schedule a Visit
                </span>
              </button>

              {/* Visit Reminder */}
              <VisitReminder pgName={pg.name} pgId={pg.id} />

              {/* Call & WhatsApp Row */}
              <div className="grid grid-cols-2 gap-3 mt-3">
                <a
                  href={`tel:${pg.contactPhone}`}
                  aria-label={`Call ${pg.contactName} about ${pg.name}`}
                  className="flex items-center justify-center gap-2 py-3 rounded-2xl font-semibold text-sm transition-all hover:-translate-y-0.5 active:translate-y-0 bg-gray-100 text-gray-900 hover:bg-gray-200"
                >
                  <svg className="w-4 h-4 text-[#1B1C15]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  Call
                </a>
                <a
                  href={`https://wa.me/91${pg.contactPhone}?text=Hi, I found your PG "${pg.name}" on Castle. I'm interested in a ${pg.type} room. Is it available?`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Message ${pg.name} on WhatsApp`}
                  className="flex items-center justify-center gap-2 py-3 rounded-2xl font-semibold text-sm transition-all hover:-translate-y-0.5 active:translate-y-0 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 00.612.638l4.67-1.228A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.239 0-4.308-.724-5.993-1.953l-.42-.306-2.767.728.74-2.706-.336-.433A9.965 9.965 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
                  </svg>
                  WhatsApp
                </a>
              </div>

              {/* Secondary Actions */}
              <div className="grid grid-cols-2 gap-3 mt-3">
                <button
                  onClick={() => setShowCallback(true)}
                  aria-label={`Request callback from ${pg.name}`}
                  className="flex items-center justify-center gap-2 py-3 rounded-2xl font-semibold text-sm transition-all hover:-translate-y-0.5 active:translate-y-0 bg-amber-50 text-amber-700 hover:bg-amber-100"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15.05 5A5 5 0 0 1 19 8.95M15.05 1A9 9 0 0 1 23 8.94m-1 7.98v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  Callback
                </button>
                <Link
                  href={`/chat/${pg.id}`}
                  aria-label={`Chat with ${pg.name}`}
                  className="flex items-center justify-center gap-2 py-3 rounded-2xl font-semibold text-sm transition-all hover:-translate-y-0.5 active:translate-y-0 bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                  Chat
                </Link>
              </div>

              {/* Virtual Tour & Notifications */}
              <div className="grid grid-cols-2 gap-3 mt-3">
                <button
                  onClick={() => setShowVirtualTour(true)}
                  aria-label={`Book virtual tour for ${pg.name}`}
                  className="flex items-center justify-center gap-2 py-3 rounded-2xl font-semibold text-sm transition-all hover:-translate-y-0.5 active:translate-y-0 bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-100"
                >
                  <span className="text-base">🎥</span>
                  Virtual Tour
                </button>
                <button
                  onClick={() => setShowNotifications(true)}
                  aria-label={`Set notification preferences for ${pg.name}`}
                  className="flex items-center justify-center gap-2 py-3 rounded-2xl font-semibold text-sm transition-all hover:-translate-y-0.5 active:translate-y-0 bg-cyan-50 text-cyan-700 hover:bg-cyan-100 border border-cyan-100"
                >
                  <span className="text-base">🔔</span>
                  Alerts
                </button>
              </div>

              {/* Emergency Contacts */}
              <EmergencyContacts />

              {/* Amenity Breakdown */}
              <AmenityBreakdown
                price={pg.price}
                amenities={pg.amenities}
                foodIncluded={pg.foodIncluded}
                furnished={pg.furnished}
                area={pg.area}
              />

              {/* Nearby Essentials */}
              <NearbyEssentials area={pg.area} />

              {/* View on Map — subtle link style */}
              <a
                href={pg.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full mt-3 py-2.5 text-sm text-gray-500 hover:text-[#1B1C15] transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                View on Google Maps
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
              </a>

              {/* Safety Badge */}
              <div className="mt-4 p-4 bg-emerald-50/80 rounded-2xl border border-emerald-100">
                <div className="flex items-center gap-2 mb-1.5">
                  <svg className="w-4.5 h-4.5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="font-semibold text-emerald-700 text-sm">Castle Verified</span>
                </div>
                <p className="text-xs text-emerald-600/80 leading-relaxed">Listing verified by our team — photos, amenities, and pricing are accurate.</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Callback Modal */}
      {showCallback && <CallbackModal pgId={pg.id} pgName={pg.name} onClose={() => setShowCallback(false)} />}

      {/* Schedule Visit Modal */}
      {showScheduleVisit && (
        <ScheduleVisit
          pgId={pg.id}
          pgName={pg.name}
          pgArea={pg.area}
          pgLocality={pg.locality}
          onClose={() => setShowScheduleVisit(false)}
        />
      )}

      {/* Virtual Tour Modal */}
      {showVirtualTour && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowVirtualTour(false)}>
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-white z-10 flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">🎥 Virtual Tour</h2>
              <button onClick={() => setShowVirtualTour(false)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition">
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-5">
              <VirtualTourBooking pgId={pg.id} pgName={pg.name} />
            </div>
          </div>
        </div>
      )}

      {/* Notification Preferences Modal */}
      {showNotifications && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowNotifications(false)}>
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-white z-10 flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">🔔 Notifications</h2>
              <button onClick={() => setShowNotifications(false)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition">
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-5">
              <NotificationPreferences pgId={pg.id} pgName={pg.name} onSave={() => setShowNotifications(false)} />
            </div>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowReportModal(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
                  <line x1="4" y1="22" x2="4" y2="15" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Report Listing</h3>
                <p className="text-xs text-gray-400 mt-0.5">Help us keep the platform safe</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Reason</label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="premium-input w-full text-sm"
                >
                  <option value="">Select a reason</option>
                  <option value="Fake listing">Fake listing</option>
                  <option value="Wrong information">Wrong information</option>
                  <option value="Photos don't match">Photos don&apos;t match</option>
                  <option value="Scam/Fraud">Scam/Fraud</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Description (optional)</label>
                <textarea
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                  rows={3}
                  placeholder="Provide more details about the issue..."
                  className="premium-input w-full text-sm resize-none"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setShowReportModal(false)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleReport}
                disabled={!reportReason || reportSubmitting}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-red-500 hover:bg-red-600 transition disabled:opacity-50"
              >
                {reportSubmitting ? "Submitting..." : "Submit Report"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cost Calculator Modal */}
      <CostCalculator
        isOpen={showCostCalc}
        onClose={() => setShowCostCalc(false)}
        prefillRent={pg.price}
        prefillArea={pg.area}
        prefillFoodIncluded={pg.foodIncluded}
        prefillWifiIncluded={pg.wifiIncluded}
      />

      {/* Remove PG Warning Modal */}
      {showRemoveWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowRemoveWarning(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Remove from this PG?</h3>
                <p className="text-xs text-gray-400 mt-0.5">This action cannot be undone easily</p>
              </div>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-5">
              <ul className="space-y-2 text-sm text-red-700">
                <li className="flex items-start gap-2">
                  <span className="mt-0.5">⚠️</span>
                  <span>You will <strong>lose access</strong> to write reviews for this PG</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5">🔄</span>
                  <span>To rejoin, you&apos;ll need to send a <strong>new request</strong> and wait for owner approval again</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5">📝</span>
                  <span>Your existing reviews will <strong>remain visible</strong></span>
                </li>
              </ul>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowRemoveWarning(false)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleRemovePg}
                disabled={removing}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-red-500 hover:bg-red-600 transition disabled:opacity-50"
              >
                {removing ? "Removing..." : "Yes, Remove"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions Floating Bar */}
      <ListingQuickActions pgId={pg.id} pgName={pg.name} contactPhone={pg.contactPhone} />
    </>
  );
}
