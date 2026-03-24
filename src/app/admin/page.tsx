"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { authFetch } from "@/lib/auth-fetch";

const adminAction = async (action: string, params: Record<string, unknown>) => {
  const res = await authFetch("/api/admin", {
    method: "POST",
    body: JSON.stringify({ action, ...params }),
  });
  return res.json();
};

type AdminListing = {
  id: string;
  name: string;
  area: string;
  price: number;
  gender: string;
  type: string;
  rating: number;
  reviews: number;
  contact_phone: string;
  contact_name: string;
  status?: string;
};

type AdminReview = {
  id: string;
  pg_id: string;
  name: string;
  rating: number;
  comment: string;
  date: string;
  verified: boolean;
  pg_name?: string;
};

type AdminCallback = {
  id: number;
  pg_id: string;
  name: string;
  phone: string;
  created_at: string;
  pg_name?: string;
  status?: string;
};

type AdminAlert = {
  id: number;
  email: string;
  area: string;
  max_price: number;
  created_at: string;
};

type AgentRequest = {
  id: number;
  agent_id: string;
  agent_name: string;
  agent_email: string;
  listing_id: string;
  pg_name: string;
  pg_area: string;
  owner_name: string;
  owner_phone: string;
  payout_amount: number;
  status: "pending" | "approved" | "rejected" | "paid";
  admin_note: string | null;
  created_at: string;
};

export default function AdminPage() {
  const { profile, loading: authLoading } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<"dashboard" | "listings" | "reviews" | "callbacks" | "alerts" | "users" | "agents">("dashboard");
  const [listings, setListings] = useState<AdminListing[]>([]);
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [callbacks, setCallbacks] = useState<AdminCallback[]>([]);
  const [alerts, setAlerts] = useState<AdminAlert[]>([]);
  const [users, setUsers] = useState<{ id: string; email: string; name: string; role: string; created_at: string; verified?: boolean }[]>([]);
  const [agentRequests, setAgentRequests] = useState<AgentRequest[]>([]);
  const [agentUsers, setAgentUsers] = useState<{ id: string; email: string; name: string; role: string; created_at: string; verified?: boolean }[]>([]);
  const [pendingListings, setPendingListings] = useState<AdminListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingListing, setEditingListing] = useState<AdminListing | null>(null);
  const [rejectNote, setRejectNote] = useState("");
  const [rejectingId, setRejectingId] = useState<number | null>(null);
  const [dashboardStats, setDashboardStats] = useState({
    totalListings: 0,
    totalUsers: 0,
    tenants: 0,
    owners: 0,
    agents: 0,
    admins: 0,
    totalReviews: 0,
    totalCallbacks: 0,
    totalAlerts: 0,
    totalAgentRequests: 0,
    pendingRequests: 0,
    paidRequests: 0,
    totalPayout: 0,
    topAreas: [] as { area: string; count: number }[],
    avgPrice: 0,
    recentUsers: [] as { name: string; email: string; role: string; created_at: string }[],
    agentWarnings: 0,
    suspendedAgents: 0,
  });

  useEffect(() => { document.title = "Admin Panel | Castle"; }, []);

  useEffect(() => {
    if (!authLoading && (!profile || profile.role !== "admin")) {
      router.push("/login");
    }
  }, [profile, authLoading, router]);

  useEffect(() => {
    if (!authLoading && profile?.role === "admin") {
      loadData();
    }
  }, [tab, authLoading, profile]);

  const loadData = async () => {
    setLoading(true);
    if (tab === "dashboard") {
      // Fetch all stats in parallel
      const [
        { data: allListings },
        { data: allUsers },
        { data: allReviews },
        { data: allCallbacks },
        { data: allAlerts },
        { data: allAgentReqs },
        { data: allWarnings },
        { data: allSuspensions },
      ] = await Promise.all([
        supabase.from("listings").select("id, area, price"),
        supabase.from("profiles").select("name, email, role, created_at").order("created_at", { ascending: false }),
        supabase.from("reviews").select("id"),
        supabase.from("callbacks").select("id"),
        supabase.from("price_alerts").select("id"),
        supabase.from("agent_requests").select("id, status, payout_amount"),
        supabase.from("agent_warnings").select("id"),
        supabase.from("agent_suspensions").select("id, permanently_banned, suspended_until"),
      ]);

      const listingsArr = allListings || [];
      const usersArr = allUsers || [];
      const agentReqsArr = (allAgentReqs || []) as { id: number; status: string; payout_amount: number }[];

      // Area distribution
      const areaCounts: Record<string, number> = {};
      listingsArr.forEach((l: { area: string }) => {
        areaCounts[l.area] = (areaCounts[l.area] || 0) + 1;
      });
      const topAreas = Object.entries(areaCounts)
        .map(([area, count]) => ({ area, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 6);

      // Average price
      const prices = listingsArr.map((l: { price: number }) => l.price).filter(Boolean);
      const avgPrice = prices.length ? Math.round(prices.reduce((a: number, b: number) => a + b, 0) / prices.length) : 0;

      // Suspended agents count
      const suspArr = (allSuspensions || []) as { id: number; permanently_banned: boolean; suspended_until: string }[];
      const suspendedAgents = suspArr.filter(
        (s) => s.permanently_banned || (s.suspended_until && new Date(s.suspended_until) > new Date())
      ).length;

      setDashboardStats({
        totalListings: listingsArr.length,
        totalUsers: usersArr.length,
        tenants: usersArr.filter((u: { role: string }) => u.role === "tenant").length,
        owners: usersArr.filter((u: { role: string }) => u.role === "owner").length,
        agents: usersArr.filter((u: { role: string }) => u.role === "agent").length,
        admins: usersArr.filter((u: { role: string }) => u.role === "admin").length,
        totalReviews: (allReviews || []).length,
        totalCallbacks: (allCallbacks || []).length,
        totalAlerts: (allAlerts || []).length,
        totalAgentRequests: agentReqsArr.length,
        pendingRequests: agentReqsArr.filter((r) => r.status === "pending").length,
        paidRequests: agentReqsArr.filter((r) => r.status === "paid").length,
        totalPayout: agentReqsArr.filter((r) => r.status === "paid").reduce((s, r) => s + r.payout_amount, 0),
        topAreas,
        avgPrice,
        recentUsers: usersArr.slice(0, 5) as { name: string; email: string; role: string; created_at: string }[],
        agentWarnings: (allWarnings || []).length,
        suspendedAgents,
      });
    } else if (tab === "listings") {
      const [{ data }, { data: pendingData }] = await Promise.all([
        supabase.from("listings").select("id, name, area, price, gender, type, rating, reviews, contact_phone, contact_name, status").order("name"),
        supabase.from("listings").select("id, name, area, price, gender, type, rating, reviews, contact_phone, contact_name, status").eq("status", "pending").order("name"),
      ]);
      setListings((data || []) as AdminListing[]);
      setPendingListings((pendingData || []) as AdminListing[]);
    } else if (tab === "reviews") {
      const { data } = await supabase.from("reviews").select("*").order("date", { ascending: false });
      const { data: listingsData } = await supabase.from("listings").select("id, name");
      const nameMap: Record<string, string> = {};
      (listingsData || []).forEach((l: { id: string; name: string }) => { nameMap[l.id] = l.name; });
      setReviews((data || []).map((r: Record<string, unknown>) => ({ ...r, pg_name: nameMap[r.pg_id as string] || "Unknown" })) as AdminReview[]);
    } else if (tab === "callbacks") {
      const { data } = await supabase.from("callbacks").select("*").order("created_at", { ascending: false });
      const { data: listingsData } = await supabase.from("listings").select("id, name");
      const nameMap: Record<string, string> = {};
      (listingsData || []).forEach((l: { id: string; name: string }) => { nameMap[l.id] = l.name; });
      setCallbacks((data || []).map((c: Record<string, unknown>) => ({ ...c, pg_name: nameMap[c.pg_id as string] || "Unknown" })) as AdminCallback[]);
    } else if (tab === "alerts") {
      const { data } = await supabase.from("price_alerts").select("*").order("created_at", { ascending: false });
      setAlerts((data || []) as AdminAlert[]);
    } else if (tab === "users") {
      const { data } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
      setUsers((data || []) as { id: string; email: string; name: string; role: string; created_at: string; verified?: boolean }[]);
    } else if (tab === "agents") {
      const [{ data: reqData }, { data: agentData }] = await Promise.all([
        supabase.from("agent_requests").select("*").order("created_at", { ascending: false }),
        supabase.from("profiles").select("id, email, name, role, created_at, verified").eq("role", "agent").order("created_at", { ascending: false }),
      ]);
      setAgentRequests((reqData || []) as AgentRequest[]);
      setAgentUsers((agentData || []) as { id: string; email: string; name: string; role: string; created_at: string; verified?: boolean }[]);
    }
    setLoading(false);
  };

  const updateAgentRequestStatus = async (id: number, status: "approved" | "rejected" | "paid", note?: string) => {
    const result = await adminAction("update-agent-request", { id, status, admin_note: note || undefined });
    if (result.success) {
      setAgentRequests(agentRequests.map(r => r.id === id ? { ...r, status, admin_note: note || r.admin_note } : r));
    }
    setRejectingId(null);
    setRejectNote("");
  };

  const handleVerifyAgent = async (agentId: string, action: "approve" | "reject") => {
    try {
      const res = await authFetch("/api/verify-agent", {
        method: "POST",
        body: JSON.stringify({ agentId, action }),
      });
      const data = await res.json();
      if (data.success) {
        setAgentUsers(agentUsers.map(a => a.id === agentId ? { ...a, verified: action === "approve" } : a));
      }
    } catch { /* silently handle */ }
  };

  const handleApproveListing = async (listingId: string, action: "approve" | "reject") => {
    try {
      const res = await authFetch("/api/approve-listing", {
        method: "POST",
        body: JSON.stringify({ listingId, action }),
      });
      const data = await res.json();
      if (data.success) {
        const newStatus = action === "approve" ? "active" : "rejected";
        setPendingListings(pendingListings.filter(l => l.id !== listingId));
        setListings(listings.map(l => l.id === listingId ? { ...l, status: newStatus } : l));
      }
    } catch { /* silently handle */ }
  };

  const toggleVerify = async (reviewId: string, current: boolean) => {
    const result = await adminAction("toggle-verify-review", { id: reviewId, verified: !current });
    if (result.success) {
      setReviews(reviews.map((r) => r.id === reviewId ? { ...r, verified: !current } : r));
    }
  };

  const deleteReview = async (reviewId: string) => {
    const result = await adminAction("delete-review", { id: reviewId });
    if (result.success) {
      setReviews(reviews.filter((r) => r.id !== reviewId));
    }
  };

  const deleteListing = async (id: string) => {
    if (!confirm("Delete this listing?")) return;
    const result = await adminAction("delete-listing", { id });
    if (result.success) {
      setListings(listings.filter((l) => l.id !== id));
    }
  };

  const updateListing = async () => {
    if (!editingListing) return;
    const result = await adminAction("update-listing", {
      id: editingListing.id,
      name: editingListing.name,
      area: editingListing.area,
      price: editingListing.price,
      contact_phone: editingListing.contact_phone,
    });
    if (result.success) {
      setListings(listings.map((l) => l.id === editingListing.id ? editingListing : l));
      setEditingListing(null);
    }
  };

  if (authLoading || (!profile)) {
    return (
      <>
        <Header />
        <main className="min-h-screen flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-4 border-[#1B1C15] border-t-transparent rounded-full" />
        </main>
      </>
    );
  }

  const tabs = [
    { key: "dashboard" as const, icon: "📊", count: 0 },
    { key: "listings" as const, icon: "📋", count: listings.length },
    { key: "reviews" as const, icon: "⭐", count: reviews.length },
    { key: "callbacks" as const, icon: "📞", count: callbacks.length },
    { key: "alerts" as const, icon: "🔔", count: alerts.length },
    { key: "users" as const, icon: "👥", count: users.length },
    { key: "agents" as const, icon: "🤝", count: agentRequests.length },
  ];

  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16 w-full overflow-x-hidden">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-[#1B1C15] rounded-2xl flex items-center justify-center shadow-lg shadow-black/10">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-[#1B1C15] tracking-tight">Admin Panel</h1>
              <p className="text-[#999] text-xs mt-0.5">Manage listings, reviews, callbacks & users</p>
            </div>
          </div>
          <span className="px-3 py-1.5 bg-[#1B1C15] text-white text-[10px] font-bold uppercase tracking-wider rounded-xl">Admin</span>
        </div>

        {/* Tabs — wraps naturally on mobile, no horizontal scroll */}
        <div className="flex flex-wrap gap-1.5 mb-6">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all capitalize shrink-0 ${
                tab === t.key ? "bg-[#1B1C15] text-white shadow-lg shadow-black/15" : "bg-[#F4EDD9] text-[#666] hover:bg-[#ebe4d0] border border-[#e8e0cc]/60"
              }`}
            >
              <span className="text-sm">{t.icon}</span>
              <span>{t.key}</span>
              {t.key !== "dashboard" && <span className={`ml-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-bold ${tab === t.key ? "bg-white/20 text-white" : "bg-black/5 text-[#888]"}`}>{t.count}</span>}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin w-8 h-8 border-4 border-[#1B1C15] border-t-transparent rounded-full" />
          </div>
        ) : (
          <>
            {/* DASHBOARD TAB */}
            {tab === "dashboard" && (
              <div className="space-y-5">
                {/* Key Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: "Total Listings", value: dashboardStats.totalListings, color: "from-[#1B1C15] to-[#333]", icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" /></svg> },
                    { label: "Total Users", value: dashboardStats.totalUsers, color: "from-blue-500 to-blue-600", icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg> },
                    { label: "Reviews", value: dashboardStats.totalReviews, color: "from-amber-500 to-orange-500", icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" /></svg> },
                    { label: "Callbacks", value: dashboardStats.totalCallbacks, color: "from-emerald-500 to-green-600", icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" /></svg> },
                  ].map((stat) => (
                    <div key={stat.label} className={`bg-gradient-to-br ${stat.color} rounded-2xl p-4 text-white relative overflow-hidden`}>
                      <div className="absolute top-3 right-3 opacity-20">{stat.icon}</div>
                      <p className="text-[11px] text-white/70 font-medium mb-1">{stat.label}</p>
                      <p className="text-3xl font-extrabold">{stat.value}</p>
                    </div>
                  ))}
                </div>

                {/* User Breakdown */}
                <div className="bg-[#FFFAEB] border border-[#e8e0cc] rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 bg-[#1B1C15] rounded-xl flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>
                    </div>
                    <h3 className="font-bold text-[#1B1C15] text-sm">User Breakdown</h3>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {[
                      { label: "Tenants", value: dashboardStats.tenants, bg: "bg-emerald-500/10", text: "text-emerald-600", ring: "ring-emerald-500/20" },
                      { label: "Owners", value: dashboardStats.owners, bg: "bg-blue-500/10", text: "text-blue-600", ring: "ring-blue-500/20" },
                      { label: "Agents", value: dashboardStats.agents, bg: "bg-orange-500/10", text: "text-orange-600", ring: "ring-orange-500/20" },
                      { label: "Admins", value: dashboardStats.admins, bg: "bg-red-500/10", text: "text-red-600", ring: "ring-red-500/20" },
                    ].map((item) => (
                      <div key={item.label} className={`${item.bg} ring-1 ${item.ring} rounded-xl p-3.5 text-center`}>
                        <p className={`text-2xl font-extrabold ${item.text}`}>{item.value}</p>
                        <p className={`text-[11px] ${item.text} font-semibold mt-0.5 opacity-70`}>{item.label}</p>
                      </div>
                    ))}
                  </div>
                  {dashboardStats.totalUsers > 0 && (
                    <div className="mt-4">
                      <div className="flex rounded-full overflow-hidden h-2.5 ring-1 ring-black/5">
                        {dashboardStats.tenants > 0 && <div className="bg-emerald-500" style={{ width: `${(dashboardStats.tenants / dashboardStats.totalUsers) * 100}%` }} />}
                        {dashboardStats.owners > 0 && <div className="bg-blue-500" style={{ width: `${(dashboardStats.owners / dashboardStats.totalUsers) * 100}%` }} />}
                        {dashboardStats.agents > 0 && <div className="bg-orange-500" style={{ width: `${(dashboardStats.agents / dashboardStats.totalUsers) * 100}%` }} />}
                        {dashboardStats.admins > 0 && <div className="bg-red-500" style={{ width: `${(dashboardStats.admins / dashboardStats.totalUsers) * 100}%` }} />}
                      </div>
                    </div>
                  )}
                </div>

                {/* Agent & Payout Stats */}
                <div className="bg-[#FFFAEB] border border-[#e8e0cc] rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 bg-[#1B1C15] rounded-xl flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>
                    </div>
                    <h3 className="font-bold text-[#1B1C15] text-sm">Agent Activity</h3>
                  </div>
                  <div className="grid grid-cols-3 gap-2.5">
                    <div className="bg-[#F4EDD9] ring-1 ring-[#e8e0cc] rounded-xl p-3.5 text-center">
                      <p className="text-2xl font-extrabold text-[#1B1C15]">{dashboardStats.totalAgentRequests}</p>
                      <p className="text-[11px] text-[#888] font-semibold mt-0.5">Requests</p>
                    </div>
                    <div className="bg-amber-500/10 ring-1 ring-amber-500/20 rounded-xl p-3.5 text-center">
                      <p className="text-2xl font-extrabold text-amber-600">{dashboardStats.pendingRequests}</p>
                      <p className="text-[11px] text-amber-600/70 font-semibold mt-0.5">Pending</p>
                    </div>
                    <div className="bg-emerald-500/10 ring-1 ring-emerald-500/20 rounded-xl p-3.5 text-center">
                      <p className="text-xl font-extrabold text-emerald-600">₹{dashboardStats.totalPayout.toLocaleString()}</p>
                      <p className="text-[11px] text-emerald-600/70 font-semibold mt-0.5">Paid Out</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2.5 mt-2.5">
                    <div className="bg-red-500/10 ring-1 ring-red-500/20 rounded-xl p-3.5 text-center">
                      <p className="text-2xl font-extrabold text-red-600">{dashboardStats.agentWarnings}</p>
                      <p className="text-[11px] text-red-600/70 font-semibold mt-0.5">Warnings</p>
                    </div>
                    <div className="bg-red-500/10 ring-1 ring-red-500/20 rounded-xl p-3.5 text-center">
                      <p className="text-2xl font-extrabold text-red-600">{dashboardStats.suspendedAgents}</p>
                      <p className="text-[11px] text-red-600/70 font-semibold mt-0.5">Suspended</p>
                    </div>
                  </div>
                </div>

                {/* Listings Stats */}
                <div className="bg-[#FFFAEB] border border-[#e8e0cc] rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 bg-[#1B1C15] rounded-xl flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" /></svg>
                    </div>
                    <h3 className="font-bold text-[#1B1C15] text-sm">Listing Insights</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-[#F4EDD9] rounded-xl p-3 text-center">
                      <p className="text-2xl font-extrabold text-[#1B1C15]">₹{dashboardStats.avgPrice.toLocaleString()}</p>
                      <p className="text-xs text-[#1B1C15] font-medium mt-1">Avg Price/mo</p>
                    </div>
                    <div className="bg-blue-50 rounded-xl p-3 text-center">
                      <p className="text-2xl font-extrabold text-blue-600">{dashboardStats.totalAlerts}</p>
                      <p className="text-xs text-blue-600 font-medium mt-1">Price Alerts</p>
                    </div>
                  </div>
                  {dashboardStats.topAreas.length > 0 && (
                    <>
                      <p className="text-xs text-gray-400 font-medium mb-2">Top Areas</p>
                      <div className="space-y-2">
                        {dashboardStats.topAreas.map((a) => (
                          <div key={a.area} className="flex items-center gap-3">
                            <span className="text-xs text-gray-600 w-28 truncate">{a.area}</span>
                            <div className="flex-1 bg-gray-100 rounded-full h-2.5 overflow-hidden">
                              <div
                                className="bg-[#1B1C15] h-full rounded-full"
                                style={{ width: `${(a.count / dashboardStats.totalListings) * 100}%` }}
                              />
                            </div>
                            <span className="text-xs font-bold text-gray-700 w-6 text-right">{a.count}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* Recent Users */}
                <div className="bg-[#FFFAEB] border border-[#e8e0cc] rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 bg-[#1B1C15] rounded-xl flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <h3 className="font-bold text-[#1B1C15] text-sm">Recent Users</h3>
                  </div>
                  <div className="space-y-3">
                    {dashboardStats.recentUsers.map((u, i) => (
                      <div key={i} className="flex items-center justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900 truncate">{u.name}</p>
                          <p className="text-[10px] text-gray-400 truncate">{u.email}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`pill !text-[10px] ${
                            u.role === "admin" ? "bg-red-50 text-red-600" :
                            u.role === "owner" ? "bg-blue-50 text-blue-600" :
                            u.role === "agent" ? "bg-orange-50 text-orange-600" :
                            "bg-emerald-50 text-emerald-600"
                          }`}>{u.role}</span>
                          <span className="text-[10px] text-gray-400">{new Date(u.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
                        </div>
                      </div>
                    ))}
                    {dashboardStats.recentUsers.length === 0 && <p className="text-center text-gray-400 text-sm">No users yet</p>}
                  </div>
                </div>
              </div>
            )}

            {/* LISTINGS TAB */}
            {tab === "listings" && (
              <div className="space-y-4">
                {editingListing && (
                  <div className="premium-card !rounded-2xl p-5 border-2 border-[#1B1C15] mb-6">
                    <h3 className="font-bold text-gray-900 mb-4">✏️ Edit Listing</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-gray-500 block mb-1">Name</label>
                        <input className="premium-input w-full" value={editingListing.name} onChange={(e) => setEditingListing({ ...editingListing, name: e.target.value })} />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-500 block mb-1">Area</label>
                        <input className="premium-input w-full" value={editingListing.area} onChange={(e) => setEditingListing({ ...editingListing, area: e.target.value })} />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-500 block mb-1">Price (₹/month)</label>
                        <input type="number" className="premium-input w-full" value={editingListing.price} onChange={(e) => setEditingListing({ ...editingListing, price: Number(e.target.value) })} />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-500 block mb-1">Contact Phone</label>
                        <input className="premium-input w-full" value={editingListing.contact_phone} onChange={(e) => setEditingListing({ ...editingListing, contact_phone: e.target.value })} />
                      </div>
                    </div>
                    <div className="flex gap-3 mt-4">
                      <button onClick={updateListing} className="btn-premium !py-2 !px-5 !text-sm">Save Changes</button>
                      <button onClick={() => setEditingListing(null)} className="px-5 py-2 text-sm text-gray-500 border border-gray-200 rounded-xl">Cancel</button>
                    </div>
                  </div>
                )}
                {/* Pending Listings — Approval Section */}
                {pendingListings.length > 0 && (
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-lg">⏳</span>
                      <h3 className="font-bold text-gray-900 text-sm">Pending Approval ({pendingListings.length})</h3>
                    </div>
                    <div className="space-y-3">
                      {pendingListings.map((l) => (
                        <div key={l.id} className="premium-card !rounded-2xl p-4 border-2 border-amber-200 bg-amber-50/30">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              <h3 className="font-semibold text-gray-900 text-sm truncate">{l.name}</h3>
                              <p className="text-xs text-gray-400 mt-0.5">📍 {l.area}</p>
                            </div>
                            <span className="pill bg-amber-50 text-amber-600 !text-[10px] shrink-0">⏳ Pending</span>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 mt-3">
                            <span className="text-sm font-bold text-gray-900">₹{l.price?.toLocaleString()}/mo</span>
                            <span className="pill bg-[#F4EDD9] text-[#1B1C15] !text-[10px]">{l.gender}</span>
                            <span className="text-xs text-gray-400 truncate">{l.contact_phone}</span>
                          </div>
                          <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-amber-100">
                            <button onClick={() => handleApproveListing(l.id, "approve")} className="py-2 text-xs bg-emerald-50 text-emerald-600 rounded-xl font-medium">✅ Approve</button>
                            <button onClick={() => handleApproveListing(l.id, "reject")} className="py-2 text-xs bg-red-50 text-red-600 rounded-xl font-medium">❌ Reject</button>
                            <button onClick={() => setEditingListing(l)} className="py-2 text-xs bg-[#F4EDD9] text-[#1B1C15] rounded-xl font-medium">✏️ Edit</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* All Listings */}
                {listings.map((l) => (
                  <div key={l.id} className="premium-card !rounded-2xl p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-gray-900 text-sm truncate">{l.name}</h3>
                        <p className="text-xs text-gray-400 mt-0.5">📍 {l.area}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`pill !text-[10px] ${
                          l.status === "active" ? "bg-emerald-50 text-emerald-600" :
                          l.status === "rejected" ? "bg-red-50 text-red-600" :
                          l.status === "pending" ? "bg-amber-50 text-amber-600" :
                          "bg-gray-100 text-gray-500"
                        }`}>
                          {l.status === "active" ? "✅ Active" :
                           l.status === "rejected" ? "❌ Rejected" :
                           l.status === "pending" ? "⏳ Pending" :
                           l.status || "No Status"}
                        </span>
                        <span className="pill bg-amber-50 text-amber-600 !text-[10px]">⭐ {l.rating}</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mt-3">
                      <span className="text-sm font-bold text-gray-900">₹{l.price?.toLocaleString()}/mo</span>
                      <span className="pill bg-[#F4EDD9] text-[#1B1C15] !text-[10px]">{l.gender}</span>
                      <span className="text-xs text-gray-400 truncate">{l.contact_phone}</span>
                    </div>
                    <div className={`grid gap-2 mt-3 pt-3 border-t border-gray-100 ${l.status === "pending" ? "grid-cols-2" : "grid-cols-2"}`}>
                      <button onClick={() => setEditingListing(l)} className="py-2 text-xs bg-[#F4EDD9] text-[#1B1C15] rounded-xl font-medium">✏️ Edit</button>
                      <button onClick={() => deleteListing(l.id)} className="py-2 text-xs bg-red-50 text-red-600 rounded-xl font-medium">🗑️ Delete</button>
                      {l.status === "pending" && (
                        <>
                          <button onClick={() => handleApproveListing(l.id, "approve")} className="py-2 text-xs bg-emerald-50 text-emerald-600 rounded-xl font-medium">✅ Approve</button>
                          <button onClick={() => handleApproveListing(l.id, "reject")} className="py-2 text-xs bg-red-50 text-red-500 rounded-xl font-medium">❌ Reject</button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
                {listings.length === 0 && <p className="text-center text-gray-400 py-10">No listings yet</p>}
              </div>
            )}

            {/* REVIEWS TAB */}
            {tab === "reviews" && (
              <div className="space-y-4">
                {reviews.map((r) => (
                  <div key={r.id} className="premium-card !rounded-2xl p-4">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <span className="font-semibold text-gray-900 text-sm">{r.name}</span>
                      <span className="pill bg-amber-50 text-amber-600 !text-[10px]">{"⭐".repeat(r.rating)}</span>
                      {r.verified ? (
                        <span className="pill bg-emerald-50 text-emerald-600 !text-[10px]">✅ Verified</span>
                      ) : (
                        <span className="pill bg-gray-100 text-gray-500 !text-[10px]">Unverified</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{r.comment}</p>
                    <p className="text-xs text-gray-400 mb-3">For: {r.pg_name} · {r.date}</p>
                    <div className="flex gap-2 pt-3 border-t border-gray-100">
                      <button
                        onClick={() => toggleVerify(r.id, r.verified)}
                        className={`flex-1 py-2 text-xs rounded-xl font-medium ${
                          r.verified ? "bg-gray-100 text-gray-500" : "bg-emerald-50 text-emerald-600"
                        }`}
                      >
                        {r.verified ? "Unverify" : "Verify ✅"}
                      </button>
                      <button onClick={() => deleteReview(r.id)} className="flex-1 py-2 text-xs bg-red-50 text-red-600 rounded-xl font-medium">Delete</button>
                    </div>
                  </div>
                ))}
                {reviews.length === 0 && <p className="text-center text-gray-400 py-10">No reviews yet</p>}
              </div>
            )}

            {/* CALLBACKS TAB */}
            {tab === "callbacks" && (
              <div className="space-y-3">
                {callbacks.map((c) => (
                  <div key={c.id} className="premium-card !rounded-2xl p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-gray-900 text-sm">{c.name}</h3>
                        <p className="text-xs text-gray-400 mt-0.5">{c.pg_name} · {new Date(c.created_at).toLocaleDateString()}</p>
                      </div>
                      <a href={`tel:${c.phone}`} className="px-3 py-1.5 text-xs bg-emerald-50 text-emerald-600 rounded-xl font-medium shrink-0">📞 {c.phone}</a>
                    </div>
                  </div>
                ))}
                {callbacks.length === 0 && <p className="text-center text-gray-400 py-10">No callback requests</p>}
              </div>
            )}

            {/* ALERTS TAB */}
            {tab === "alerts" && (
              <div className="space-y-3">
                {alerts.map((a) => (
                  <div key={a.id} className="premium-card !rounded-2xl p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-900 text-sm truncate">{a.email}</p>
                        <p className="text-xs text-gray-400 mt-0.5">📍 {a.area || "All Areas"} · Max ₹{a.max_price?.toLocaleString() || "Any"}</p>
                      </div>
                      <span className="text-[10px] text-gray-400 shrink-0">{new Date(a.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
                {alerts.length === 0 && <p className="text-center text-gray-400 py-10">No price alert subscriptions</p>}
              </div>
            )}

            {/* USERS TAB */}
            {tab === "users" && (
              <div className="space-y-3">
                {users.map((u) => (
                  <div key={u.id} className="premium-card !rounded-2xl p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-gray-900 text-sm">{u.name}</h3>
                        <p className="text-xs text-gray-400 mt-0.5 truncate">{u.email}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`pill !text-[10px] ${
                          u.role === "admin" ? "bg-red-50 text-red-600" :
                          u.role === "owner" ? "bg-blue-50 text-blue-600" :
                          u.role === "agent" ? "bg-orange-50 text-orange-600" :
                          "bg-emerald-50 text-emerald-600"
                        }`}>{u.role}</span>
                        <span className="text-[10px] text-gray-400">{new Date(u.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
                {users.length === 0 && <p className="text-center text-gray-400 py-10">No users yet</p>}
              </div>
            )}

            {/* AGENTS TAB */}
            {tab === "agents" && (
              <div className="space-y-6">
                {/* Agent Verification Section */}
                {agentUsers.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-lg">🛡️</span>
                      <h3 className="font-bold text-gray-900 text-sm">Agent Verification ({agentUsers.filter(a => a.verified === false).length} pending)</h3>
                    </div>
                    <div className="space-y-3 mb-6">
                      {agentUsers.map((agent) => (
                        <div key={agent.id} className={`premium-card !rounded-2xl p-4 ${agent.verified === false ? "border-2 border-amber-200 bg-amber-50/30" : ""}`}>
                          <div className="flex items-center justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              <h4 className="font-semibold text-gray-900 text-sm">{agent.name}</h4>
                              <p className="text-xs text-gray-400 mt-0.5 truncate">{agent.email}</p>
                              <p className="text-[10px] text-gray-400 mt-0.5">Joined: {new Date(agent.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              {agent.verified === false ? (
                                <>
                                  <span className="pill bg-amber-50 text-amber-600 !text-[10px]">⏳ Pending</span>
                                  <button
                                    onClick={() => handleVerifyAgent(agent.id, "approve")}
                                    className="px-3 py-1.5 text-xs bg-emerald-50 text-emerald-600 rounded-lg font-medium"
                                  >
                                    ✅ Approve
                                  </button>
                                  <button
                                    onClick={() => handleVerifyAgent(agent.id, "reject")}
                                    className="px-3 py-1.5 text-xs bg-red-50 text-red-600 rounded-lg font-medium"
                                  >
                                    ❌ Reject
                                  </button>
                                </>
                              ) : (
                                <span className="pill bg-emerald-50 text-emerald-600 !text-[10px]">✅ Verified</span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Agent stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="premium-card !rounded-2xl p-4 text-center">
                    <p className="text-xs text-gray-400">Total Requests</p>
                    <p className="text-2xl font-extrabold text-[#1B1C15] mt-1">{agentRequests.length}</p>
                  </div>
                  <div className="premium-card !rounded-2xl p-4 text-center">
                    <p className="text-xs text-gray-400">Pending</p>
                    <p className="text-2xl font-extrabold text-amber-600 mt-1">{agentRequests.filter(r => r.status === "pending").length}</p>
                  </div>
                  <div className="premium-card !rounded-2xl p-4 text-center">
                    <p className="text-xs text-gray-400">Approved/Paid</p>
                    <p className="text-2xl font-extrabold text-emerald-600 mt-1">{agentRequests.filter(r => r.status === "approved" || r.status === "paid").length}</p>
                  </div>
                  <div className="premium-card !rounded-2xl p-4 text-center">
                    <p className="text-xs text-gray-400">Total Payout</p>
                    <p className="text-2xl font-extrabold text-emerald-600 mt-1">₹{agentRequests.filter(r => r.status === "paid").reduce((s, r) => s + r.payout_amount, 0)}</p>
                  </div>
                </div>

                {agentRequests.length === 0 ? (
                  <div className="premium-card !rounded-2xl p-6 text-center py-16">
                    <span className="text-5xl block mb-4">🤝</span>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No Agent Requests</h3>
                    <p className="text-gray-400">No agents have onboarded PGs yet.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {agentRequests.map((r) => (
                      <div key={r.id} className="premium-card !rounded-2xl p-4">
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="min-w-0 flex-1">
                            <h3 className="font-semibold text-gray-900 text-sm">{r.pg_name}</h3>
                            <p className="text-xs text-gray-400">📍 {r.pg_area}</p>
                          </div>
                          <span className={`pill !text-[10px] shrink-0 ${
                            r.status === "paid" ? "bg-emerald-50 text-emerald-600" :
                            r.status === "approved" ? "bg-blue-50 text-blue-600" :
                            r.status === "rejected" ? "bg-red-50 text-red-600" :
                            "bg-amber-50 text-amber-600"
                          }`}>
                            {r.status}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                          <div>
                            <span className="text-gray-400">Agent:</span>
                            <p className="text-gray-700 font-medium">{r.agent_name}</p>
                            <p className="text-[10px] text-gray-400 truncate">{r.agent_email}</p>
                          </div>
                          <div>
                            <span className="text-gray-400">Owner:</span>
                            <p className="text-gray-700 font-medium">{r.owner_name}</p>
                            <a href={`tel:${r.owner_phone}`} className="text-[10px] text-[#1B1C15]">📞 {r.owner_phone}</a>
                          </div>
                        </div>
                        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                          <span className="font-bold text-emerald-600 text-sm">₹{r.payout_amount}</span>
                          {r.status === "pending" && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => updateAgentRequestStatus(r.id, "approved")}
                                className="px-3 py-1.5 text-xs bg-emerald-50 text-emerald-600 rounded-lg font-medium"
                              >
                                ✅ Approve
                              </button>
                              <button
                                onClick={() => setRejectingId(r.id)}
                                className="px-3 py-1.5 text-xs bg-red-50 text-red-600 rounded-lg"
                              >
                                ❌ Reject
                              </button>
                            </div>
                          )}
                          {r.status === "approved" && (
                            <button
                              onClick={() => updateAgentRequestStatus(r.id, "paid")}
                              className="px-3 py-1.5 text-xs bg-emerald-50 text-emerald-600 rounded-lg font-medium"
                            >
                              💸 Mark Paid
                            </button>
                          )}
                          {(r.status === "rejected" || r.status === "paid") && (
                            <span className="text-[10px] text-gray-400">{r.admin_note || "No action needed"}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Reject modal */}
                {rejectingId && (
                  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setRejectingId(null)} />
                    <div className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl">
                      <h3 className="text-lg font-bold text-gray-900 mb-4">❌ Reject Agent Request</h3>
                      <p className="text-sm text-gray-400 mb-4">Provide a reason so the agent knows why it was rejected.</p>
                      <textarea
                        value={rejectNote}
                        onChange={(e) => setRejectNote(e.target.value)}
                        placeholder="e.g. Duplicate listing, invalid phone number, PG doesn't exist..."
                        className="premium-input w-full resize-none"
                        rows={3}
                      />
                      <div className="flex gap-3 mt-4">
                        <button
                          onClick={() => updateAgentRequestStatus(rejectingId, "rejected", rejectNote || "Rejected by admin")}
                          className="px-5 py-2.5 bg-red-500 text-white rounded-xl text-sm font-semibold hover:bg-red-600"
                        >
                          Reject Request
                        </button>
                        <button onClick={() => { setRejectingId(null); setRejectNote(""); }} className="px-5 py-2.5 text-sm text-gray-500 border border-gray-200 rounded-xl">
                          Cancel
                        </button>
                      </div>
                    </div>
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
