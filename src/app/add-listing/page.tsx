"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { areas, amenities as amenityOptions } from "@/data/listings";

export default function AddListingPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => { document.title = "Add New PG | Castle"; }, []);

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [verifyIssues, setVerifyIssues] = useState<string[]>([]);
  const [riskScore, setRiskScore] = useState<number | null>(null);
  const [claimCode, setClaimCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [listingId, setListingId] = useState<string | null>(null);

  // Owner search state
  const [ownerSearch, setOwnerSearch] = useState("");
  const [ownerResults, setOwnerResults] = useState<{ id: string; name: string; username: string; avatar?: string }[]>([]);
  const [searchingOwner, setSearchingOwner] = useState(false);
  const [sendingClaim, setSendingClaim] = useState(false);
  const [claimSent, setClaimSent] = useState<string | null>(null); // owner name sent to

  // Form state
  const [name, setName] = useState("");
  const [area, setArea] = useState("");
  const [locality, setLocality] = useState("");
  const [roomOptions, setRoomOptions] = useState([
    { type: "single" as const, price: "", enabled: true },
    { type: "double" as const, price: "", enabled: false },
    { type: "triple" as const, price: "", enabled: false },
  ]);
  const [gender, setGender] = useState<"male" | "female" | "coed">("coed");
  const [description, setDescription] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactName, setContactName] = useState("");
  const [furnished, setFurnished] = useState(true);
  const [foodIncluded, setFoodIncluded] = useState(false);
  const [wifiIncluded, setWifiIncluded] = useState(true);
  const [acAvailable, setAcAvailable] = useState(false);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(["WiFi"]);
  const [availableFrom, setAvailableFrom] = useState(new Date().toISOString().split("T")[0]);

  // Photo state
  const [selectedPhotos, setSelectedPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoSelect = (files: FileList | null) => {
    if (!files) return;
    const newFiles = Array.from(files).slice(0, 10 - selectedPhotos.length);
    const newPreviews = newFiles.map(f => URL.createObjectURL(f));
    setSelectedPhotos(prev => [...prev, ...newFiles]);
    setPhotoPreviews(prev => [...prev, ...newPreviews]);
  };

  const removeSelectedPhoto = (index: number) => {
    URL.revokeObjectURL(photoPreviews[index]);
    setSelectedPhotos(prev => prev.filter((_, i) => i !== index));
    setPhotoPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const uploadPhotos = async (pgId: string): Promise<string[]> => {
    const urls: string[] = [];
    for (let i = 0; i < selectedPhotos.length; i++) {
      const file = selectedPhotos[i];
      const ext = file.name.split(".").pop();
      const path = `listings/${pgId}/${Date.now()}_${i}.${ext}`;
      const { error } = await supabase.storage
        .from("pg-photos")
        .upload(path, file, { upsert: true });
      if (!error) {
        const { data } = supabase.storage.from("pg-photos").getPublicUrl(path);
        if (data?.publicUrl) urls.push(data.publicUrl);
      }
    }
    return urls;
  };

  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [locationAddress, setLocationAddress] = useState("");

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser");
      return;
    }
    setLocationLoading(true);
    setLocationError("");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setLat(latitude);
        setLng(longitude);
        // Reverse geocode to get address
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
          const data = await res.json();
          if (data.display_name) {
            setLocationAddress(data.display_name.split(",").slice(0, 3).join(","));
          }
        } catch { /* ignore */ }
        setLocationLoading(false);
      },
      (err) => {
        setLocationError(err.code === 1 ? "Location permission denied. Please allow location access." : "Could not get your location. Try again.");
        setLocationLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const toggleAmenity = (a: string) => {
    setSelectedAmenities(prev =>
      prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setError("");
    setSubmitting(true);

    const id = `pg-${Date.now()}`;

    // Build room options data
    const enabledRooms = roomOptions.filter(r => r.enabled && r.price);
    if (enabledRooms.length === 0) {
      setError("Please select at least one room type with a price.");
      setSubmitting(false);
      return;
    }
    const lowestPrice = Math.min(...enabledRooms.map(r => Number(r.price)));
    const primaryType = enabledRooms.length > 1 ? "any" : enabledRooms[0].type;
    const roomOptionsData = enabledRooms.map(r => ({ type: r.type, price: Number(r.price), available: true }));

    // ── AI Verification for Agents ──
    if (profile?.role === "agent") {
      setVerifying(true);
      setVerifyIssues([]);
      try {
        const verifyRes = await fetch("/api/verify-listing", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            area,
            locality: locality || area,
            contact_phone: contactPhone,
            contact_name: contactName,
            description,
            price: lowestPrice,
            gender,
            agent_id: user.id,
          }),
        });
        const verification = await verifyRes.json();
        setRiskScore(verification.risk_score);

        if (!verification.approved) {
          setVerifyIssues(verification.issues);
          if (verification.permanently_banned) {
            setError("Your agent account has been permanently banned. Contact support.");
          } else if (verification.suspended) {
            setError(`Your account is suspended until ${new Date(verification.suspended_until).toLocaleDateString("en-IN")}. Warning count: ${verification.warning_count}`);
          } else {
            setError(`AI Verification Failed (Risk Score: ${verification.risk_score}/100). Warning ${verification.warning_count || 0}/3. Fix the issues below.`);
          }
          setVerifying(false);
          setSubmitting(false);
          return;
        }
        // If there are warnings but still approved, show them
        if (verification.issues.length > 0) {
          setVerifyIssues(verification.issues);
        }
      } catch {
        // If verification API fails, allow submission
      }
      setVerifying(false);
    }

    // Generate claim code for agent-added PGs
    const isAgent = profile?.role === "agent";
    const generatedClaimCode = isAgent
      ? `CS-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
      : null;

    // Build listing data — new listings default to 'pending' status for admin approval
    const listingData: Record<string, unknown> = {
      id,
      name,
      area,
      locality: locality || area,
      price: lowestPrice,
      type: primaryType,
      room_options: roomOptionsData,
      gender,
      amenities: selectedAmenities,
      rating: 0,
      reviews: 0,
      images: [],
      description,
      contact_phone: contactPhone,
      contact_name: contactName || profile?.name || "",
      map_url: lat && lng ? `https://www.google.com/maps?q=${lat},${lng}` : "",
      lat: lat || 12.9716,
      lng: lng || 77.5946,
      available_from: availableFrom,
      furnished,
      food_included: foodIncluded,
      wifi_included: wifiIncluded,
      ac_available: acAvailable,
      nearby_landmarks: [],
      owner_id: isAgent ? null : user.id,
      status: "pending",
    };

    // Insert listing — gracefully handle missing columns
    let dbError;
    const fullData = isAgent
      ? { ...listingData, added_by_agent: user.id, claim_code: generatedClaimCode }
      : listingData;

    const res = await supabase.from("listings").insert(fullData);
    if (res.error && res.error.message.includes("Could not find")) {
      // Some columns don't exist yet — strip unknown columns and retry
      const safeData = { ...listingData };
      delete safeData.room_options;
      delete safeData.added_by_agent;
      const res2 = await supabase.from("listings").insert(safeData);
      dbError = res2.error;
    } else {
      dbError = res.error;
    }

    // If agent added this PG, try to create an agent_request for payout
    if (!dbError && profile?.role === "agent") {
      await supabase.from("agent_requests").insert({
        agent_id: user.id,
        agent_name: profile.name,
        agent_email: profile.email,
        listing_id: id,
        pg_name: name,
        pg_area: area,
        owner_name: contactName,
        owner_phone: contactPhone,
        payout_amount: 100,
        status: isAgent ? "agent_draft" : "pending",
      }).then(() => {}); // Silently handle if table doesn't exist yet
    }

    if (dbError) {
      setSubmitting(false);
      setError(dbError.message);
      return;
    }

    // Upload photos if any were selected
    if (selectedPhotos.length > 0) {
      setUploadingPhotos(true);
      const photoUrls = await uploadPhotos(id);
      if (photoUrls.length > 0) {
        await supabase.from("listings").update({ images: photoUrls }).eq("id", id);
      }
      setUploadingPhotos(false);
    }

    setSubmitting(false);
    setSuccess(true);
    setListingId(id);
    if (generatedClaimCode) setClaimCode(generatedClaimCode);
    if (!isAgent) {
      setTimeout(() => router.push("/owner-dashboard"), 2000);
    }
  };

  if (authLoading) {
    return (
      <>
        <Header />
        <main className="max-w-3xl mx-auto px-4 pt-28 pb-16 flex items-center justify-center py-20">
          <div className="animate-spin w-8 h-8 border-4 border-[#1B1C15] border-t-transparent rounded-full" />
        </main>
      </>
    );
  }

  if (!user || (profile?.role !== "owner" && profile?.role !== "admin" && profile?.role !== "agent")) {
    return (
      <>
        <Header />
        <main className="max-w-3xl mx-auto px-4 pt-28 pb-16">
          <div className="text-center py-20">
            <span className="text-5xl block mb-4">🔒</span>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Required</h1>
            <p className="text-gray-400 mb-6">You need an owner or agent account to list a PG.</p>
            <button onClick={() => router.push("/signup")} className="btn-premium !py-3 !px-8">
              Sign Up
            </button>
          </div>
        </main>
      </>
    );
  }

  // Block unverified agents from adding listings
  if (profile?.role === "agent" && profile?.verified === false) {
    return (
      <>
        <Header />
        <main className="max-w-3xl mx-auto px-4 pt-28 pb-16">
          <div className="text-center py-20">
            <span className="text-5xl block mb-4">⏳</span>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Verification Pending</h1>
            <p className="text-gray-400 mb-6">Your agent account is pending verification by an admin. You cannot add listings until your account is approved.</p>
            <button onClick={() => router.push("/agent-dashboard")} className="btn-premium !py-3 !px-8">
              Back to Dashboard
            </button>
          </div>
        </main>
      </>
    );
  }

  if (success) {
    return (
      <>
        <Header />
        <main className="max-w-3xl mx-auto px-4 pt-28 pb-16">
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <h1 className="text-2xl font-extrabold text-gray-900 mb-2">PG Listed Successfully!</h1>
            {claimCode ? (
              <>
                <p className="text-gray-400 mb-6">Share this claim code with the PG owner so they can manage their listing.</p>
                <div className="max-w-sm mx-auto premium-card !rounded-2xl p-6 mb-6">
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Owner Claim Code</p>
                  <div className="flex items-center justify-center gap-3">
                    <span className="text-3xl font-mono font-extrabold text-[#1B1C15] tracking-[0.2em]">{claimCode}</span>
                    <button
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(claimCode);
                          setCopied(true);
                          setTimeout(() => setCopied(false), 2000);
                        } catch {
                          // Fallback for mobile browsers
                          const ta = document.createElement("textarea");
                          ta.value = claimCode;
                          ta.style.position = "fixed";
                          ta.style.opacity = "0";
                          document.body.appendChild(ta);
                          ta.select();
                          document.execCommand("copy");
                          document.body.removeChild(ta);
                          setCopied(true);
                          setTimeout(() => setCopied(false), 2000);
                        }
                      }}
                      className="p-2 rounded-xl bg-[#F4EDD9] text-[#1B1C15] hover:bg-[#F4EDD9] transition"
                      title="Copy"
                    >
                      {copied ? (
                        <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                        </svg>
                      )}
                    </button>
                  </div>
                  {copied && <p className="text-xs text-green-500 mt-1">Copied!</p>}
                  <p className="text-[11px] text-gray-400 mt-3">The owner needs to sign up on Castle as an &quot;Owner&quot; and enter this code to claim their PG.</p>
                </div>
                {/* Send to Owner In-App */}
                <div className="max-w-sm mx-auto mb-6">
                  <div className="premium-card !rounded-2xl p-5 border border-emerald-200 bg-emerald-50/30">
                    <div className="flex items-center gap-2 mb-3">
                      <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 2L11 13" /><path d="M22 2L15 22L11 13L2 9L22 2Z" />
                      </svg>
                      <h3 className="font-semibold text-gray-900 text-sm">Send to Owner</h3>
                    </div>
                    {claimSent ? (
                      <div className="flex items-center gap-2 p-3 bg-emerald-50 rounded-xl text-sm text-emerald-700">
                        <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                        Sent to <strong>@{claimSent}</strong>! They&apos;ll see it in their dashboard.
                      </div>
                    ) : (
                      <>
                        <p className="text-xs text-gray-400 mb-3">Search the owner&apos;s username to send the claim directly in-app</p>
                        <div className="relative">
                          <div className="flex gap-2">
                            <div className="relative flex-1">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">@</span>
                              <input
                                type="text"
                                placeholder="Search owner username..."
                                value={ownerSearch}
                                onChange={async (e) => {
                                  const val = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "");
                                  setOwnerSearch(val);
                                  if (val.length >= 2) {
                                    setSearchingOwner(true);
                                    try {
                                      const res = await fetch(`/api/search-owner?q=${val}`);
                                      const data = await res.json();
                                      setOwnerResults(data.owners || []);
                                    } catch { setOwnerResults([]); }
                                    setSearchingOwner(false);
                                  } else {
                                    setOwnerResults([]);
                                  }
                                }}
                                className="premium-input w-full !py-2.5 !text-sm !pl-8"
                                maxLength={20}
                              />
                            </div>
                          </div>
                          {/* Search results dropdown */}
                          {ownerSearch.length >= 2 && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-10 overflow-hidden">
                              {searchingOwner ? (
                                <div className="p-3 text-center text-xs text-gray-400">Searching...</div>
                              ) : ownerResults.length === 0 ? (
                                <div className="p-3 text-center text-xs text-gray-400">No owners found with that username</div>
                              ) : (
                                ownerResults.map((owner) => (
                                  <button
                                    key={owner.id}
                                    disabled={sendingClaim}
                                    onClick={async () => {
                                      setSendingClaim(true);
                                      try {
                                        const res = await fetch("/api/send-claim", {
                                          method: "POST",
                                          headers: { "Content-Type": "application/json" },
                                          body: JSON.stringify({
                                            listing_id: listingId,
                                            listing_name: name,
                                            listing_area: area,
                                            claim_code: claimCode,
                                            agent_id: user?.id,
                                            agent_name: profile?.name || "",
                                            owner_id: owner.id,
                                          }),
                                        });
                                        const data = await res.json();
                                        if (data.success) {
                                          setClaimSent(owner.username);
                                          setOwnerSearch("");
                                          setOwnerResults([]);
                                        } else {
                                          setError(data.error || "Failed to send");
                                        }
                                      } catch { setError("Failed to send claim"); }
                                      setSendingClaim(false);
                                    }}
                                    className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 transition text-left"
                                  >
                                    <div className="w-8 h-8 rounded-full bg-[#1B1C15] flex items-center justify-center text-white font-bold text-xs shrink-0">
                                      {owner.name.charAt(0)}
                                    </div>
                                    <div className="min-w-0">
                                      <p className="text-sm font-medium text-gray-900 truncate">{owner.name}</p>
                                      <p className="text-xs text-gray-400">@{owner.username}</p>
                                    </div>
                                    <div className="ml-auto shrink-0">
                                      {sendingClaim ? (
                                        <span className="text-xs text-gray-400">Sending...</span>
                                      ) : (
                                        <span className="px-3 py-1 bg-emerald-500 text-white text-xs font-medium rounded-lg">Send</span>
                                      )}
                                    </div>
                                  </button>
                                ))
                              )}
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* OR divider */}
                <div className="flex items-center gap-3 max-w-sm mx-auto mb-4">
                  <div className="flex-1 h-px bg-gray-200" />
                  <span className="text-xs text-gray-400 font-medium">OR SHARE MANUALLY</span>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>

                <div className="flex flex-col gap-3 items-center mb-4">
                  <button
                    onClick={async () => {
                      const shareText = `🏠 Your PG has been listed on Castle!\n\nClaim Code: ${claimCode}\n\n1. Sign up on Castle as "Owner"\n2. Go to Owner Dashboard\n3. Enter this code to claim your PG\n\nhttps://castleliving.in`;
                      if (navigator.share) {
                        try {
                          await navigator.share({ title: "Castle - PG Claim Code", text: shareText });
                        } catch { /* user cancelled */ }
                      } else {
                        try {
                          await navigator.clipboard.writeText(shareText);
                          setCopied(true);
                          setTimeout(() => setCopied(false), 2000);
                        } catch { /* ignore */ }
                      }
                    }}
                    className="w-full max-w-xs px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition hover:bg-gray-200"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                    </svg>
                    Share via WhatsApp / Message
                  </button>
                </div>
                <div className="flex gap-3 justify-center">
                  <button onClick={() => router.push("/agent-dashboard")} className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium">Go to Dashboard</button>
                  <button onClick={() => { setSuccess(false); setClaimCode(null); }} className="px-6 py-2.5 bg-[#F4EDD9] text-[#1B1C15] rounded-xl text-sm font-medium">Add Another PG</button>
                </div>
              </>
            ) : (
              <>
                <p className="text-gray-400 mb-2">Your listing is now live.</p>
                <p className="text-sm text-gray-400">Redirecting to dashboard...</p>
              </>
            )}
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-28 pb-16">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm text-gray-500 flex items-center gap-2">
          <Link href="/" className="hover:text-[#1B1C15] transition-colors">Home</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">Add New PG</span>
        </nav>

        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">Add Your PG</h1>
          <p className="text-gray-400 mt-1">List your paying guest accommodation on Castle</p>
        </div>

        {profile?.role === "agent" && (
          <div className="premium-card !rounded-2xl p-5 border-2 border-amber-400/40 bg-amber-50/50 mb-6">
            <div className="flex items-start gap-3">
              <span className="text-2xl mt-0.5">🛡️</span>
              <div>
                <h3 className="font-bold text-gray-900 text-sm mb-2">Agent Verification Process</h3>
                <p className="text-xs text-gray-500 mb-3">Every PG submitted by agents goes through a strict verification before going live:</p>
                <ul className="space-y-2 text-xs text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="text-amber-500 mt-0.5">🤖</span>
                    <span><strong>AI Duplicate & Fake Detection</strong> — Our AI automatically checks for duplicate listings, fake details, suspicious phone numbers, and spam content before submission.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-500 mt-0.5">🔍</span>
                    <span><strong>Manual Review</strong> — Your listing stays in &quot;Pending&quot; status until admin verifies and approves it. It won&apos;t be visible to tenants until approved.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-500 mt-0.5">💰</span>
                    <span><strong>Payout After Approval</strong> — Your ₹100 payout is processed only after the PG is verified and approved by admin.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-500 mt-0.5">⚠️</span>
                    <span><strong>Progressive Warning System</strong> — Fake/spam submissions earn warnings: <strong>3 warnings = 1 week ban</strong>, <strong>6 = 1 month ban</strong>, <strong>9+ = permanent ban</strong>.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-500 mt-0.5">✅</span>
                    <span><strong>Same Owner, Multiple PGs</strong> — One owner can have multiple PGs with the same phone number. Only exact duplicate names are flagged.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-sm text-red-600">
              {error}
            </div>
          )}

          {verifyIssues.length > 0 && (
            <div className={`p-4 rounded-2xl border text-sm ${riskScore !== null && riskScore >= 40 ? "bg-red-50 border-red-300" : "bg-amber-50 border-amber-300"}`}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{riskScore !== null && riskScore >= 40 ? "🚫" : "⚠️"}</span>
                <span className="font-bold text-gray-900">
                  AI Verification {riskScore !== null && riskScore >= 40 ? "Failed" : "Warnings"}
                  {riskScore !== null && <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${riskScore >= 40 ? "bg-red-200 text-red-700" : "bg-amber-200 text-amber-700"}`}>Risk: {riskScore}/100</span>}
                </span>
              </div>
              <ul className="space-y-1 ml-7">
                {verifyIssues.map((issue, i) => (
                  <li key={i} className={`${riskScore !== null && riskScore >= 40 ? "text-red-600" : "text-amber-600"}`}>• {issue}</li>
                ))}
              </ul>
            </div>
          )}

          {/* PG Name */}
          <div className="premium-card !rounded-2xl p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Basic Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">PG Name *</label>
                <input required value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Sunrise PG for Men" className="premium-input w-full" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Area *</label>
                  <select required value={area} onChange={e => setArea(e.target.value)} className="premium-input w-full">
                    <option value="">Select area</option>
                    {areas.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Locality</label>
                  <input value={locality} onChange={e => setLocality(e.target.value)} placeholder="e.g. Near Silk Board Junction" className="premium-input w-full" />
                </div>
              </div>

              {/* Room Types & Pricing */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Room Types & Pricing *</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {roomOptions.map((room, idx) => (
                    <div
                      key={room.type}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        room.enabled
                          ? "border-[#1B1C15] bg-[#F4EDD9]"
                          : "border-gray-200"
                      }`}
                    >
                      <label className="flex items-center gap-2 cursor-pointer mb-3">
                        <input
                          type="checkbox"
                          checked={room.enabled}
                          onChange={() => {
                            const updated = [...roomOptions];
                            updated[idx] = { ...updated[idx], enabled: !updated[idx].enabled };
                            setRoomOptions(updated);
                          }}
                          className="w-4 h-4 rounded text-[#1B1C15] focus:ring-[#1B1C15]/20"
                        />
                        <span className="text-sm font-semibold text-gray-700">
                          {room.type === "single" ? "🛏️ Single" : room.type === "double" ? "🛏️ Double Sharing" : "🛏️ Triple Sharing"}
                        </span>
                      </label>
                      {room.enabled && (
                        <div className="flex items-center gap-1">
                          <span className="text-sm text-gray-500">₹</span>
                          <input
                            type="number"
                            min="1000"
                            value={room.price}
                            onChange={e => {
                              const updated = [...roomOptions];
                              updated[idx] = { ...updated[idx], price: e.target.value };
                              setRoomOptions(updated);
                            }}
                            placeholder="8000"
                            className="premium-input w-full"
                          />
                          <span className="text-xs text-gray-400 whitespace-nowrap">/mo</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Gender</label>
                <select value={gender} onChange={e => setGender(e.target.value as typeof gender)} className="premium-input w-full">
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="coed">Co-ed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Available From</label>
                <input type="date" value={availableFrom} onChange={e => setAvailableFrom(e.target.value)} className="premium-input w-full" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description *</label>
                <textarea required rows={4} value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe your PG — rooms, facilities, neighborhood, rules..." className="premium-input w-full resize-none" />
              </div>
            </div>
          </div>

          {/* Amenities & Features */}
          <div className="premium-card !rounded-2xl p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Amenities & Features</h2>

            {/* Toggle features */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
              {[
                { label: "Furnished", value: furnished, set: setFurnished, icon: "🛋️" },
                { label: "Food Included", value: foodIncluded, set: setFoodIncluded, icon: "🍽️" },
                { label: "WiFi", value: wifiIncluded, set: setWifiIncluded, icon: "📶" },
                { label: "AC", value: acAvailable, set: setAcAvailable, icon: "❄️" },
              ].map(f => (
                <button
                  key={f.label}
                  type="button"
                  onClick={() => f.set(!f.value)}
                  className={`p-3 rounded-xl border-2 text-center transition-all ${
                    f.value
                      ? "border-[#1B1C15] bg-[#F4EDD9]"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <span className="text-lg block">{f.icon}</span>
                  <span className="text-xs font-medium text-gray-700 mt-1 block">{f.label}</span>
                </button>
              ))}
            </div>

            {/* Amenities chips */}
            <label className="block text-sm font-semibold text-gray-700 mb-2">Other Amenities</label>
            <div className="flex flex-wrap gap-2">
              {amenityOptions.filter(a => !["WiFi", "AC", "Food"].includes(a)).map(a => (
                <button
                  key={a}
                  type="button"
                  onClick={() => toggleAmenity(a)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    selectedAmenities.includes(a)
                      ? "bg-[#1B1C15] text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>

          {/* Photos */}
          <div className="premium-card !rounded-2xl p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-2">PG Photos</h2>
            <p className="text-xs text-gray-400 mb-4">Add photos of rooms, common areas, entrance, etc. (up to 10)</p>

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-3">
              {photoPreviews.map((url, i) => (
                <div key={i} className="relative group rounded-xl overflow-hidden aspect-square">
                  <img src={url} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeSelectedPhoto(i)}
                    className="absolute top-1.5 right-1.5 w-6 h-6 bg-red-500 text-white rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 sm:opacity-100 transition text-xs font-bold"
                  >
                    ✕
                  </button>
                </div>
              ))}

              {selectedPhotos.length < 10 && (
                <button
                  type="button"
                  onClick={() => photoInputRef.current?.click()}
                  className="aspect-square rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-1.5 hover:border-[#8a8070] hover:bg-[#F4EDD9] transition-all"
                >
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
                  </svg>
                  <span className="text-[10px] text-gray-400 font-medium">Add Photo</span>
                </button>
              )}
            </div>

            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => handlePhotoSelect(e.target.files)}
            />
            <p className="text-[11px] text-gray-400">JPG, PNG accepted. PGs with photos get 3x more inquiries!</p>
          </div>

          {/* Contact */}
          <div className="premium-card !rounded-2xl p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Contact Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="listing-contact-name" className="block text-sm font-semibold text-gray-700 mb-2">Contact Name *</label>
                <input id="listing-contact-name" required aria-required="true" autoComplete="name" value={contactName} onChange={e => setContactName(e.target.value)} placeholder={profile?.name || "Owner name"} className="premium-input w-full" />
              </div>
              <div>
                <label htmlFor="listing-contact-phone" className="block text-sm font-semibold text-gray-700 mb-2">Phone Number *</label>
                <input id="listing-contact-phone" required aria-required="true" type="tel" autoComplete="tel" value={contactPhone} onChange={e => setContactPhone(e.target.value)} placeholder="9876543210" className="premium-input w-full" />
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="premium-card !rounded-2xl p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-2">PG Location</h2>
            <p className="text-xs text-gray-400 mb-4">Add the exact location so tenants can find this PG on the map</p>

            {lat && lng ? (
              <div className="space-y-3">
                {/* Map preview */}
                <div className="relative rounded-xl overflow-hidden border border-gray-200">
                  <iframe
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.005},${lat - 0.003},${lng + 0.005},${lat + 0.003}&layer=mapnik&marker=${lat},${lng}`}
                    className="w-full h-48"
                    style={{ border: 0 }}
                  />
                </div>
                <div className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
                  </svg>
                  <div className="min-w-0">
                    {locationAddress && <p className="text-sm text-gray-700 truncate">{locationAddress}</p>}
                    <p className="text-xs text-gray-400">{lat.toFixed(6)}, {lng.toFixed(6)}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleGetLocation}
                  className="text-xs text-[#1B1C15] font-medium hover:underline"
                >
                  Update Location
                </button>
              </div>
            ) : (
              <div className="text-center py-4">
                <button
                  type="button"
                  onClick={handleGetLocation}
                  disabled={locationLoading}
                  className="inline-flex items-center gap-2 px-5 py-3 bg-[#F4EDD9] text-[#1B1C15] rounded-xl text-sm font-medium hover:bg-[#F4EDD9] transition disabled:opacity-50"
                >
                  {locationLoading ? (
                    <>
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Getting Location...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="3" /><path d="M12 2v4m0 12v4m10-10h-4M6 12H2" />
                      </svg>
                      Use Current Location
                    </>
                  )}
                </button>
                {locationError && (
                  <p className="text-xs text-red-500 mt-2">{locationError}</p>
                )}
                <p className="text-[11px] text-gray-400 mt-2">Stand near the PG and tap to pin the exact location</p>
              </div>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting || verifying}
            className="btn-premium w-full !py-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {verifying ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                AI Verifying...
              </span>
            ) : uploadingPhotos ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Uploading Photos...
              </span>
            ) : submitting ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Publishing...
              </span>
            ) : (
              profile?.role === "agent" ? "Verify & Publish PG" : "Publish PG Listing"
            )}
          </button>
        </form>
      </main>
    </>
  );
}
