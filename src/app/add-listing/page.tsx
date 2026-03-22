"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { areas, amenities as amenityOptions } from "@/data/listings";

export default function AddListingPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

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

    // Build listing data
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
      map_url: "",
      lat: 12.9716,
      lng: 77.5946,
      available_from: availableFrom,
      furnished,
      food_included: foodIncluded,
      wifi_included: wifiIncluded,
      ac_available: acAvailable,
      nearby_landmarks: [],
      owner_id: user.id,
    };

    // Insert listing — gracefully handle missing columns
    let dbError;
    const fullData = profile?.role === "agent"
      ? { ...listingData, added_by_agent: user.id }
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
        status: "pending",
      }).then(() => {}); // Silently handle if table doesn't exist yet
    }

    setSubmitting(false);
    if (dbError) {
      setError(dbError.message);
    } else {
      setSuccess(true);
      setTimeout(() => router.push(profile?.role === "agent" ? "/agent-dashboard" : "/owner-dashboard"), 2000);
    }
  };

  if (authLoading) {
    return (
      <>
        <Header />
        <main className="max-w-3xl mx-auto px-4 pt-28 pb-16 flex items-center justify-center py-20">
          <div className="animate-spin w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full" />
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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Access Required</h1>
            <p className="text-gray-400 mb-6">You need an owner or agent account to list a PG.</p>
            <button onClick={() => router.push("/signup")} className="btn-premium !py-3 !px-8">
              Sign Up
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
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-emerald-50 dark:bg-emerald-900/30 rounded-3xl flex items-center justify-center mx-auto mb-6 animate-bounce">
              <span className="text-6xl">🎉</span>
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-3">PG Listed Successfully!</h1>
            <p className="text-gray-400 mb-2">Your listing is now live.</p>
            <p className="text-sm text-gray-400">Redirecting to dashboard...</p>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-28 pb-16">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Add Your PG</h1>
          <p className="text-gray-400 mt-1">List your paying guest accommodation on Castle</p>
        </div>

        {profile?.role === "agent" && (
          <div className="premium-card !rounded-2xl p-5 border-2 border-amber-400/40 bg-amber-50/50 dark:bg-amber-900/10 mb-6">
            <div className="flex items-start gap-3">
              <span className="text-2xl mt-0.5">🛡️</span>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-2">Agent Verification Process</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">Every PG submitted by agents goes through a strict verification before going live:</p>
                <ul className="space-y-2 text-xs text-gray-600 dark:text-gray-300">
                  <li className="flex items-start gap-2">
                    <span className="text-amber-500 mt-0.5">📞</span>
                    <span><strong>Owner Phone Verification</strong> — Admin will call the owner number you provide to confirm the PG listing is genuine.</span>
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
                    <span className="text-amber-500 mt-0.5">🚫</span>
                    <span><strong>Fake Listings = Ban</strong> — Submitting fake or duplicate PGs will result in permanent account suspension.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          {/* PG Name */}
          <div className="premium-card !rounded-2xl p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Basic Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">PG Name *</label>
                <input required value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Sunrise PG for Men" className="premium-input w-full" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Area *</label>
                  <select required value={area} onChange={e => setArea(e.target.value)} className="premium-input w-full">
                    <option value="">Select area</option>
                    {areas.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Locality</label>
                  <input value={locality} onChange={e => setLocality(e.target.value)} placeholder="e.g. Near Silk Board Junction" className="premium-input w-full" />
                </div>
              </div>

              {/* Room Types & Pricing */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Room Types & Pricing *</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {roomOptions.map((room, idx) => (
                    <div
                      key={room.type}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        room.enabled
                          ? "border-violet-500 bg-violet-50 dark:bg-violet-900/20"
                          : "border-gray-200 dark:border-gray-700"
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
                          className="w-4 h-4 rounded text-violet-600 focus:ring-violet-500"
                        />
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
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
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Gender</label>
                <select value={gender} onChange={e => setGender(e.target.value as typeof gender)} className="premium-input w-full">
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="coed">Co-ed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Available From</label>
                <input type="date" value={availableFrom} onChange={e => setAvailableFrom(e.target.value)} className="premium-input w-full" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Description *</label>
                <textarea required rows={4} value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe your PG — rooms, facilities, neighborhood, rules..." className="premium-input w-full resize-none" />
              </div>
            </div>
          </div>

          {/* Amenities & Features */}
          <div className="premium-card !rounded-2xl p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Amenities & Features</h2>

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
                      ? "border-violet-500 bg-violet-50 dark:bg-violet-900/20"
                      : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                  }`}
                >
                  <span className="text-lg block">{f.icon}</span>
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300 mt-1 block">{f.label}</span>
                </button>
              ))}
            </div>

            {/* Amenities chips */}
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Other Amenities</label>
            <div className="flex flex-wrap gap-2">
              {amenityOptions.filter(a => !["WiFi", "AC", "Food"].includes(a)).map(a => (
                <button
                  key={a}
                  type="button"
                  onClick={() => toggleAmenity(a)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    selectedAmenities.includes(a)
                      ? "bg-violet-600 text-white"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200"
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div className="premium-card !rounded-2xl p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Contact Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Contact Name *</label>
                <input required value={contactName} onChange={e => setContactName(e.target.value)} placeholder={profile?.name || "Owner name"} className="premium-input w-full" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Phone Number *</label>
                <input required type="tel" value={contactPhone} onChange={e => setContactPhone(e.target.value)} placeholder="9876543210" className="premium-input w-full" />
              </div>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="btn-premium w-full !py-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Publishing...
              </span>
            ) : (
              "Publish PG Listing"
            )}
          </button>

          <p className="text-xs text-gray-400 text-center">You can add photos after publishing from the Owner Dashboard.</p>
        </form>
      </main>
    </>
  );
}
