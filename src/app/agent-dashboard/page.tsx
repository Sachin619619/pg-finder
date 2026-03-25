"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

type AgentRequest = {
  id: number;
  listing_id: string;
  pg_name: string;
  pg_area: string;
  owner_name: string;
  owner_phone: string;
  payout_amount: number;
  status: "pending" | "approved" | "rejected" | "paid";
  created_at: string;
  admin_note?: string;
};

type AgentListing = {
  id: string;
  name: string;
  area: string;
  price: number;
  gender: string;
  type: string;
  images: string[];
  claim_code: string | null;
  owner_id: string | null;
};

export default function AgentDashboardPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<"overview" | "my-pgs" | "payouts">("overview");
  const [requests, setRequests] = useState<AgentRequest[]>([]);
  const [listings, setListings] = useState<AgentListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { document.title = "Agent Dashboard | Castle"; }, []);

  useEffect(() => {
    if (!authLoading && (!profile || profile.role !== "agent")) {
      router.push("/login");
    }
  }, [profile, authLoading, router]);

  useEffect(() => {
    if (user && profile?.role === "agent") loadData();
  }, [user, profile, tab]);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);

    // Load agent requests (payouts)
    const { data: reqData } = await supabase
      .from("agent_requests")
      .select("*")
      .eq("agent_id", user.id)
      .order("created_at", { ascending: false });
    setRequests((reqData || []) as AgentRequest[]);

    // Load PGs added by this agent
    const { data: listData } = await supabase
      .from("listings")
      .select("id, name, area, price, gender, type, images, claim_code, owner_id")
      .eq("added_by_agent", user.id)
      .order("name");
    setListings((listData || []) as AgentListing[]);

    setLoading(false);
  };

  if (authLoading || !profile) {
    return (
      <>
        <Header />
        <main className="min-h-screen flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full" />
        </main>
      </>
    );
  }

  const totalPGs = listings.length;
  const totalEarned = requests.filter(r => r.status === "paid").reduce((s, r) => s + r.payout_amount, 0);
  const pendingPayout = requests.filter(r => r.status === "pending" || r.status === "approved").reduce((s, r) => s + r.payout_amount, 0);
  const rejectedCount = requests.filter(r => r.status === "rejected").length;

  return (
    <>
      <Header />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
        {/* Pending Verification Banner */}
        {profile.verified === false && (
          <div className="mb-6 p-4 rounded-2xl border-2 border-amber-300 bg-amber-50 flex items-start gap-3">
            <span className="text-2xl mt-0.5">⏳</span>
            <div>
              <h3 className="font-bold text-amber-800 text-sm">Account Pending Verification</h3>
              <p className="text-xs text-amber-600 mt-1">
                Your agent account is under review by the admin team. You will not be able to add listings until your account is verified. This usually takes 24-48 hours.
              </p>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">🤝 Agent Dashboard</h1>
            <p className="text-gray-400 mt-1">Welcome back, {profile.name}! Onboard PGs and earn ₹100 per PG.</p>
          </div>
          {profile.verified !== false ? (
            <Link href="/add-listing" className="btn-premium !py-3 !px-6 !text-sm flex items-center gap-2 whitespace-nowrap">
              ➕ Add New PG
            </Link>
          ) : (
            <span className="py-3 px-6 text-sm flex items-center gap-2 whitespace-nowrap bg-gray-200 text-gray-400 rounded-xl cursor-not-allowed" title="Account verification pending">
              🔒 Add New PG
            </span>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: "PGs Onboarded", value: totalPGs, icon: "🏠", color: "cream" },
            { label: "Total Earned", value: `₹${totalEarned}`, icon: "💰", color: "emerald" },
            { label: "Pending Payout", value: `₹${pendingPayout}`, icon: "⏳", color: "amber" },
            { label: "Rejected", value: rejectedCount, icon: "❌", color: "red" },
          ].map((s) => (
            <div key={s.label} className="premium-card !rounded-2xl p-5">
              <span className="text-2xl">{s.icon}</span>
              <p className={`text-2xl font-extrabold mt-2 ${
                s.color === "emerald" ? "text-emerald-600" :
                s.color === "amber" ? "text-amber-600" :
                s.color === "red" ? "text-red-500" :
                "text-[#1a1a1a]"
              }`}>{s.value}</p>
              <p className="text-xs text-gray-400 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* How it works — for new agents */}
        {totalPGs === 0 && (
          <div className="premium-card !rounded-2xl p-6 mb-8 border-2 border-orange-200 bg-orange-50/50">
            <h2 className="text-lg font-bold text-gray-900 mb-4">🚀 How Agent Onboarding Works</h2>
            <div className="grid sm:grid-cols-4 gap-4">
              {[
                { step: "1", title: "Visit a PG", desc: "Go to a PG physically and talk to the owner about Castle" },
                { step: "2", title: "Convince & Configure", desc: "Explain Castle's benefits and collect PG details from the owner" },
                { step: "3", title: "Add PG on Castle", desc: "Fill in all PG details using the 'Add New PG' form" },
                { step: "4", title: "Earn ₹100", desc: "Payout request is auto-raised. Admin approves and you get paid!" },
              ].map((s) => (
                <div key={s.step} className="text-center">
                  <div className="w-10 h-10 bg-orange-500 text-white rounded-full flex items-center justify-center mx-auto mb-2 font-bold text-lg">{s.step}</div>
                  <p className="font-semibold text-gray-900 text-sm">{s.title}</p>
                  <p className="text-xs text-gray-400 mt-1">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-2xl p-1 mb-8 overflow-x-auto">
          {(["overview", "my-pgs", "payouts"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                tab === t ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {t === "overview" && "📊 "}
              {t === "my-pgs" && "🏠 "}
              {t === "payouts" && "💰 "}
              {t === "overview" ? "Overview" : t === "my-pgs" ? `My PGs (${listings.length})` : `Payouts (${requests.length})`}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full" />
          </div>
        ) : (
          <>
            {/* OVERVIEW TAB */}
            {tab === "overview" && (
              <div className="space-y-6">
                {/* Recent activity */}
                <div className="premium-card !rounded-2xl p-6">
                  <h3 className="font-bold text-gray-900 mb-4">📋 Recent Activity</h3>
                  {requests.length === 0 ? (
                    <div className="text-center py-10">
                      <span className="text-4xl block mb-3">🏠</span>
                      <p className="text-gray-400 mb-4">No PGs onboarded yet. Start by visiting a PG!</p>
                      <Link href="/add-listing" className="btn-premium !py-2.5 !px-6 !text-sm">
                        ➕ Add Your First PG
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {requests.slice(0, 5).map((r) => (
                        <div key={r.id} className="flex items-center justify-between p-4 rounded-xl bg-gray-50">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-lg">🏠</div>
                            <div>
                              <p className="font-semibold text-gray-900 text-sm">{r.pg_name}</p>
                              <p className="text-xs text-gray-400">{r.pg_area} · {new Date(r.created_at).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-emerald-600 text-sm">₹{r.payout_amount}</span>
                            <span className={`pill !text-[10px] ${
                              r.status === "paid" ? "bg-emerald-50 text-emerald-600" :
                              r.status === "approved" ? "bg-blue-50 text-blue-600" :
                              r.status === "rejected" ? "bg-red-50 text-red-600" :
                              "bg-amber-50 text-amber-600"
                            }`}>
                              {r.status === "paid" ? "✅ Paid" :
                               r.status === "approved" ? "👍 Approved" :
                               r.status === "rejected" ? "❌ Rejected" :
                               "⏳ Pending"}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Tips card */}
                <div className="premium-card !rounded-2xl p-6">
                  <h3 className="font-bold text-gray-900 mb-3">💡 Tips for Agents</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start gap-2"><span>✅</span> Always get the owner&apos;s consent before adding their PG</li>
                    <li className="flex items-start gap-2"><span>✅</span> Fill in all details accurately — incorrect info may get rejected</li>
                    <li className="flex items-start gap-2"><span>✅</span> Take clear photos of the PG rooms and common areas</li>
                    <li className="flex items-start gap-2"><span>✅</span> Provide the owner&apos;s real phone number for verification</li>
                    <li className="flex items-start gap-2"><span>⚠️</span> Duplicate PGs or fake listings will be rejected and may lead to account ban</li>
                  </ul>
                </div>
              </div>
            )}

            {/* MY PGs TAB */}
            {tab === "my-pgs" && (
              <div>
                {listings.length === 0 ? (
                  <div className="premium-card !rounded-2xl p-6 text-center py-16">
                    <span className="text-5xl block mb-4">🏠</span>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No PGs Added Yet</h3>
                    <p className="text-gray-400 mb-6">Visit PGs in your area and onboard them to Castle!</p>
                    <Link href="/add-listing" className="btn-premium !py-3 !px-8">
                      ➕ Add Your First PG
                    </Link>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {listings.map((pg) => {
                      const req = requests.find(r => r.listing_id === pg.id);
                      return (
                        <div key={pg.id} className="premium-card !rounded-2xl p-5">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="font-bold text-gray-900">{pg.name}</h4>
                              <p className="text-xs text-gray-400 mt-0.5">📍 {pg.area}</p>
                            </div>
                            {req && (
                              <span className={`pill !text-[10px] ${
                                req.status === "paid" ? "bg-emerald-50 text-emerald-600" :
                                req.status === "approved" ? "bg-blue-50 text-blue-600" :
                                req.status === "rejected" ? "bg-red-50 text-red-600" :
                                "bg-amber-50 text-amber-600"
                              }`}>
                                {req.status}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            <span>💰 ₹{pg.price.toLocaleString()}/mo</span>
                            <span>🏷️ {pg.type}</span>
                            <span>{pg.gender === "male" ? "👦" : pg.gender === "female" ? "👩" : "👥"} {pg.gender}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-3">
                            <span className={`text-xs ${pg.images && pg.images.length > 0 ? "text-emerald-500" : "text-amber-500"}`}>
                              {pg.images && pg.images.length > 0 ? `📸 ${pg.images.length} photos` : "📷 No photos yet"}
                            </span>
                          </div>
                          {/* Claim Code / Owner Status */}
                          {pg.claim_code && !pg.owner_id ? (
                            <div className="mt-3 p-3 bg-gray-100 rounded-xl border border-gray-200">
                              <p className="text-[10px] text-[#8a8070] font-medium mb-1">🔑 Claim Code (share with owner)</p>
                              <div className="flex items-center gap-2">
                                <code className="text-sm font-bold text-[#1a1a1a] tracking-widest">{pg.claim_code}</code>
                                <button
                                  onClick={() => {
                                    navigator.clipboard.writeText(pg.claim_code!);
                                  }}
                                  className="text-[10px] text-[#1a1a1a] hover:text-[#1a1a1a] font-medium underline"
                                >
                                  Copy
                                </button>
                              </div>
                            </div>
                          ) : pg.owner_id ? (
                            <div className="mt-3 flex items-center gap-1.5">
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                                ✅ Owner Linked
                              </span>
                            </div>
                          ) : null}
                          {req?.status === "rejected" && req.admin_note && (
                            <div className="mt-3 p-3 bg-red-50 rounded-xl">
                              <p className="text-xs text-red-500 font-medium">Rejection reason:</p>
                              <p className="text-xs text-red-400 mt-0.5">{req.admin_note}</p>
                            </div>
                          )}
                          <Link href={`/listing/${pg.id}`} className="block mt-3 text-center text-xs text-[#1a1a1a] font-semibold hover:underline">
                            View Listing →
                          </Link>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* PAYOUTS TAB */}
            {tab === "payouts" && (
              <div>
                {/* Payout summary */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="premium-card !rounded-2xl p-4 text-center">
                    <p className="text-xs text-gray-400">Total Earned</p>
                    <p className="text-xl font-extrabold text-emerald-600 mt-1">₹{totalEarned}</p>
                  </div>
                  <div className="premium-card !rounded-2xl p-4 text-center">
                    <p className="text-xs text-gray-400">Pending</p>
                    <p className="text-xl font-extrabold text-amber-600 mt-1">₹{pendingPayout}</p>
                  </div>
                  <div className="premium-card !rounded-2xl p-4 text-center">
                    <p className="text-xs text-gray-400">Per PG Rate</p>
                    <p className="text-xl font-extrabold text-[#1a1a1a] mt-1">₹100</p>
                  </div>
                </div>

                {requests.length === 0 ? (
                  <div className="premium-card !rounded-2xl p-6 text-center py-16">
                    <span className="text-5xl block mb-4">💰</span>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No Payout Requests</h3>
                    <p className="text-gray-400">Add PGs to earn ₹100 per onboarding!</p>
                  </div>
                ) : (
                  <div className="premium-card !rounded-2xl overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left p-4 font-semibold text-gray-500">PG Name</th>
                          <th className="text-left p-4 font-semibold text-gray-500 hidden sm:table-cell">Area</th>
                          <th className="text-left p-4 font-semibold text-gray-500">Amount</th>
                          <th className="text-left p-4 font-semibold text-gray-500">Status</th>
                          <th className="text-left p-4 font-semibold text-gray-500 hidden sm:table-cell">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {requests.map((r) => (
                          <tr key={r.id} className="hover:bg-gray-50">
                            <td className="p-4">
                              <p className="font-medium text-gray-900">{r.pg_name}</p>
                              <p className="text-xs text-gray-400 sm:hidden">{r.pg_area}</p>
                            </td>
                            <td className="p-4 text-gray-500 hidden sm:table-cell">{r.pg_area}</td>
                            <td className="p-4 font-bold text-emerald-600">₹{r.payout_amount}</td>
                            <td className="p-4">
                              <span className={`pill !text-[10px] ${
                                r.status === "paid" ? "bg-emerald-50 text-emerald-600" :
                                r.status === "approved" ? "bg-blue-50 text-blue-600" :
                                r.status === "rejected" ? "bg-red-50 text-red-600" :
                                "bg-amber-50 text-amber-600"
                              }`}>
                                {r.status === "paid" ? "✅ Paid" :
                                 r.status === "approved" ? "👍 Approved" :
                                 r.status === "rejected" ? "❌ Rejected" :
                                 "⏳ Pending"}
                              </span>
                              {r.status === "rejected" && r.admin_note && (
                                <p className="text-[10px] text-red-400 mt-1">{r.admin_note}</p>
                              )}
                            </td>
                            <td className="p-4 text-xs text-gray-400 hidden sm:table-cell">
                              {new Date(r.created_at).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>
    </>
  );
}
