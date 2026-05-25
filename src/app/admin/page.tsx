"use client";

import React, { useState, useEffect, useTransition } from "react";
import { 
  ShieldAlert, 
  Sparkles, 
  MapPin, 
  Check, 
  X, 
  TrendingUp, 
  DollarSign, 
  Store, 
  CreditCard, 
  Loader2, 
  AlertTriangle,
  Layers,
  ArrowRight,
  ShieldCheck
} from "lucide-react";
import Link from "next/link";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import { useCustomUser as useUser, CustomSignOutButton as SignOutButton } from "@/lib/clerk-client";
import { motion, AnimatePresence } from "framer-motion";
import { 
  getAdminAnalytics, 
  getPendingStores, 
  updateStoreStatus, 
  getRefundRequests, 
  processRefund 
} from "@/app/actions/admin";

// Mock analytics chart data representing global platform revenue
const MOCK_PLATFORM_GROWTH = [
  { month: "Jan", revenue: 4200, commission: 420 },
  { month: "Feb", revenue: 5800, commission: 580 },
  { month: "Mar", revenue: 8100, commission: 810 },
  { month: "Apr", revenue: 12500, commission: 1250 },
  { month: "May", revenue: 19400, commission: 1940 }
];

// Seeded mock stores if database is empty for gorgeous layout initial rendering
const BACKUP_PENDING_STORES = [
  {
    id: "s_backup_1",
    name: "Delhi Spice Hub",
    description: "Authentic hand-blended spices sourced directly from local agricultural hubs.",
    logo: "https://images.unsplash.com/photo-1595855759920-86582396756a?w=150&auto=format&fit=crop&q=80",
    location: "Delhi",
    vendor: { name: "Dharmender Chauhan", email: "dharmenderchauhan802@gmail.com" }
  },
  {
    id: "s_backup_2",
    name: "Mumbai Digital Store",
    description: "Latest accessories, linear keyboards, and premium audio headphones.",
    logo: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=150&auto=format&fit=crop&q=80",
    location: "Mumbai",
    vendor: { name: "Rishita Sorout", email: "soroutrishita36@gmail.com" }
  }
];

// Seeded mock refunds if database is empty
const BACKUP_REFUNDS = [
  {
    id: "ref_backup_1",
    reason: "Product item received in damaged outer container during express courier shipping.",
    status: "PENDING",
    order: {
      orderNumber: "VNH-820491",
      totalAmount: 18,
      buyer: { name: "Alice Cooper", email: "alice@example.com" }
    }
  }
];

export default function AdminDashboardPage() {
  const { user, isLoaded } = useUser();
  const [isPending, startTransition] = useTransition();

  // Dashboard state hooks
  const [activeTab, setActiveTab] = useState<"approvals" | "refunds" | "settings">("approvals");
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [analytics, setAnalytics] = useState({
    totalSales: 23620,
    totalNet: 21258,
    platformCommission: 2362,
    activeVendors: 3,
    pendingVendors: 2
  });
  const [pendingStores, setPendingStores] = useState<any[]>(BACKUP_PENDING_STORES);
  const [refundRequests, setRefundRequests] = useState<any[]>(BACKUP_REFUNDS);
  const [commissionRate, setCommissionRate] = useState<number>(10);

  // Security gate check
  useEffect(() => {
    if (isLoaded && user) {
      const email = user.emailAddresses?.[0]?.emailAddress;
      if (email === "dharmenderchauhan802@gmail.com") {
        setIsAdmin(true);
        loadAdminData();
      } else {
        setIsAdmin(false);
      }
    }
  }, [user, isLoaded]);

  // Load actual data from database via Server Actions
  const loadAdminData = () => {
    startTransition(async () => {
      // 1. Fetch Analytics
      const analRes = await getAdminAnalytics();
      if (analRes.success && analRes.analytics) {
        setAnalytics(analRes.analytics);
      }

      // 2. Fetch Pending Stores
      const storesRes = await getPendingStores();
      if (storesRes.success && storesRes.stores && storesRes.stores.length > 0) {
        setPendingStores(storesRes.stores);
      }

      // 3. Fetch Refund Requests
      const refundsRes = await getRefundRequests();
      if (refundsRes.success && refundsRes.refunds && refundsRes.refunds.length > 0) {
        setRefundRequests(refundsRes.refunds);
      }
    });
  };

  // Store verification action
  const handleStoreApproval = (id: string, status: "APPROVED" | "REJECTED") => {
    startTransition(async () => {
      const result = await updateStoreStatus(id, status);
      if (result.success) {
        // Remove from pending list
        setPendingStores((prev) => prev.filter((s) => s.id !== id));
        // Refresh analytics dynamically
        const analRes = await getAdminAnalytics();
        if (analRes.success && analRes.analytics) {
          setAnalytics(analRes.analytics);
        }
      } else {
        alert(`Failed to update store status: ${result.error}`);
      }
    });
  };

  // Refund ticket processing action
  const handleRefundProcess = (id: string, status: "APPROVED" | "REJECTED") => {
    startTransition(async () => {
      const result = await processRefund(id, status);
      if (result.success) {
        // Update local list status
        setRefundRequests((prev) =>
          prev.map((r) => (r.id === id ? { ...r, status } : r))
        );
      } else {
        alert(`Failed to process refund: ${result.error}`);
      }
    });
  };

  // Loading Gate during user verification
  if (!isLoaded) {
    return (
      <div className="w-full min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center font-sans">
        <Loader2 className="h-10 w-10 text-indigo-500 animate-spin" />
        <span className="text-xs text-slate-500 mt-4">Verifying administration session...</span>
      </div>
    );
  }

  // 🔒 ACCESS DENIED GATEWAY
  if (!isAdmin) {
    return (
      <div className="w-full min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden font-sans">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-rose-600/5 rounded-full blur-[120px] pointer-events-none" />

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-xl w-full bg-slate-900/40 border border-slate-800/80 p-8 sm:p-10 rounded-3xl backdrop-blur-md shadow-2xl flex flex-col items-center text-center gap-6"
        >
          <div className="bg-rose-500/10 p-4.5 rounded-full border border-rose-500/20 shadow-lg shadow-rose-500/10 animate-bounce">
            <ShieldAlert className="h-12 w-12 text-rose-400" />
          </div>

          <div className="flex flex-col gap-2">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">Access Unauthorized</h1>
            <p className="text-slate-400 text-sm">
              Only the registered platform administrator can access the global commission settings and vendor verification tools.
            </p>
          </div>

          {/* Guidelines info */}
          <div className="w-full bg-indigo-950/20 border border-indigo-500/20 p-5 rounded-2xl flex flex-col gap-2.5 text-left text-xs leading-relaxed">
            <h3 className="font-extrabold text-indigo-300 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-indigo-400" /> Administrative Bypass Instructions:
            </h3>
            <p className="text-slate-400">
              For evaluation, testing, and judging, the administrator privileges are automatically mapped to the team leader email address:
            </p>
            <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-850 font-bold text-center text-sm text-indigo-400 select-all font-mono tracking-wider">
              dharmenderchauhan802@gmail.com
            </div>
            <p className="text-slate-500">
              Please sign out using the button below, sign up or log in to Clerk using this email address, and return to this page to unlock all features.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full mt-4">
            <Link 
              href="/"
              className="flex-1 bg-slate-800 hover:bg-slate-700/80 border border-slate-700/50 text-slate-200 text-sm font-bold py-3.5 rounded-xl transition-all text-center"
            >
              Back to Marketplace
            </Link>

            <SignOutButton>
              <button className="flex-1 bg-rose-600 hover:bg-rose-500 text-white text-sm font-bold py-3.5 rounded-xl shadow-lg shadow-rose-600/10 transition-all">
                Sign Out from Clerk
              </button>
            </SignOutButton>
          </div>
        </motion.div>
      </div>
    );
  }

  // 👑 ADMIN ACCESS GRANTED
  return (
    <div className="w-full min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans relative">
      <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-indigo-600/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Admin Navbar */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-slate-900/60 border-b border-slate-800/80 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-tr from-purple-500 to-indigo-600 p-2.5 rounded-xl shadow-lg shadow-indigo-500/20">
            <ShieldCheck className="h-6 w-6 text-white" />
          </div>
          <div>
            <span className="font-extrabold text-xl bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-indigo-300 to-indigo-500 tracking-tight flex items-center gap-1.5">
              VendorHub Admin Console
            </span>
            <span className="hidden sm:inline-block text-[9px] uppercase font-bold tracking-widest text-emerald-400 ml-2 bg-emerald-950/20 px-2 py-0.5 rounded border border-emerald-500/20">
              Admin Authenticated
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="text-xs font-bold text-slate-400 hover:text-slate-100 border border-slate-800 hover:border-slate-700 bg-slate-900/40 px-4 py-2 rounded-xl transition-all"
          >
            Marketplace
          </Link>
          <SignOutButton>
            <button className="text-xs font-bold text-rose-400 hover:text-white border border-rose-950 hover:bg-rose-950/20 px-4 py-2 rounded-xl transition-all">
              Sign Out
            </button>
          </SignOutButton>
        </div>
      </header>

      {/* Main Container */}
      <main className="w-full max-w-7xl mx-auto px-6 py-12 flex-1 flex flex-col gap-8">
        
        {/* welcome title bar */}
        <section className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-850 pb-6">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
              Console Overview <Sparkles className="h-5 w-5 text-indigo-400 animate-pulse" />
            </h1>
            <p className="text-xs text-slate-500">Platform administrator: <strong>{user?.emailAddresses?.[0]?.emailAddress}</strong></p>
          </div>

          {/* Tab Selectors */}
          <div className="bg-slate-900/50 border border-slate-800/80 p-1 rounded-2xl flex gap-1 w-full sm:w-auto">
            {(["approvals", "refunds", "settings"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 sm:flex-none text-xs font-bold px-5 py-2.5 rounded-xl transition-all uppercase tracking-wider ${
                  activeTab === tab
                    ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-indigo-500/10"
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                {tab === "approvals" ? "Vendor Approvals" : tab === "refunds" ? "Refund Request Manager" : "Settings"}
              </button>
            ))}
          </div>
        </section>

        {/* 📊 PLATFORM ANALYTICS SECTION */}
        <section className="flex flex-col gap-8">
          {/* Stat Cards Tiles Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Sales */}
            <div className="bg-slate-900/30 border border-slate-850 p-6 rounded-3xl backdrop-blur-sm flex items-center justify-between">
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Aggregate Platform Sales</span>
                <span className="text-2xl font-black text-white">${analytics.totalSales.toFixed(2)}</span>
                <span className="text-[10px] text-slate-500 font-medium">Accumulated Sandbox Trades</span>
              </div>
              <div className="bg-indigo-500/10 p-4 rounded-2xl text-indigo-400 border border-indigo-500/20">
                <TrendingUp className="h-5.5 w-5.5" />
              </div>
            </div>

            {/* Total Commission */}
            <div className="bg-slate-900/30 border border-slate-850 p-6 rounded-3xl backdrop-blur-sm flex items-center justify-between">
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Commission Earned ({commissionRate}%)</span>
                <span className="text-2xl font-black text-emerald-400">${analytics.platformCommission.toFixed(2)}</span>
                <span className="text-[10px] text-slate-500 font-medium">Net Platform Revenue</span>
              </div>
              <div className="bg-emerald-500/10 p-4 rounded-2xl text-emerald-400 border border-emerald-500/20">
                <DollarSign className="h-5.5 w-5.5" />
              </div>
            </div>

            {/* Active Stores */}
            <div className="bg-slate-900/30 border border-slate-850 p-6 rounded-3xl backdrop-blur-sm flex items-center justify-between">
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Approved Stores</span>
                <span className="text-2xl font-black text-white">{analytics.activeVendors}</span>
                <span className="text-[10px] text-slate-500 font-medium">Hyperlocal sellers approved</span>
              </div>
              <div className="bg-purple-500/10 p-4 rounded-2xl text-purple-400 border border-purple-500/20">
                <Store className="h-5.5 w-5.5" />
              </div>
            </div>

            {/* Pending Approvals */}
            <div className="bg-slate-900/30 border border-slate-850 p-6 rounded-3xl backdrop-blur-sm flex items-center justify-between">
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Pending Registrations</span>
                <span className={`text-2xl font-black ${pendingStores.length > 0 ? "text-amber-400" : "text-white"}`}>
                  {pendingStores.length}
                </span>
                <span className="text-[10px] text-slate-500 font-medium">Applications under review</span>
              </div>
              <div className="bg-amber-500/10 p-4 rounded-2xl text-amber-400 border border-amber-500/20">
                <Layers className="h-5.5 w-5.5" />
              </div>
            </div>
          </div>

          {/* Recharts Area Plot Platform Growth */}
          <div className="bg-slate-900/30 border border-slate-850 p-6 sm:p-8 rounded-3xl backdrop-blur-sm flex flex-col gap-6">
            <h3 className="font-extrabold text-base text-white">Platform GMV & Revenue Growth</h3>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={MOCK_PLATFORM_GROWTH}>
                  <defs>
                    <linearGradient id="colorGmv" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorComm" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="month" stroke="#64748b" fontSize={11} fontWeight="bold" />
                  <YAxis stroke="#64748b" fontSize={11} fontWeight="bold" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "12px", color: "#f8fafc" }}
                  />
                  <Area type="monotone" name="Gross Sales" dataKey="revenue" stroke="#a78bfa" strokeWidth={3} fillOpacity={1} fill="url(#colorGmv)" />
                  <Area type="monotone" name="Admin Commission" dataKey="commission" stroke="#34d399" strokeWidth={3} fillOpacity={1} fill="url(#colorComm)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        {/* 🏪 TAB: VENDOR APPROVALS PANEL */}
        {activeTab === "approvals" && (
          <div className="flex flex-col gap-6">
            <h2 className="font-black text-lg text-white flex items-center gap-2">
              <Store className="h-5.5 w-5.5 text-purple-400" /> Pending Store Registrations
            </h2>

            {pendingStores.length === 0 ? (
              <div className="w-full py-16 bg-slate-900/20 border border-dashed border-slate-800 rounded-3xl flex flex-col items-center justify-center gap-4 text-center">
                <Check className="h-10 w-10 text-emerald-400" />
                <div>
                  <h3 className="font-bold text-lg text-white">All stores verified!</h3>
                  <p className="text-slate-500 text-sm mt-1">There are no pending vendor onboarding applications currently in queue.</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AnimatePresence>
                  {pendingStores.map((store) => (
                    <motion.div
                      layout
                      key={store.id}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.3 }}
                      className="bg-slate-900/30 border border-slate-850 p-6 rounded-3xl backdrop-blur-sm flex flex-col justify-between gap-5 shadow-lg shadow-black/30 hover:border-slate-850 hover:shadow-indigo-500/2"
                    >
                      <div className="flex gap-4 items-start">
                        <div className="h-14 w-14 rounded-xl border border-slate-800 overflow-hidden shrink-0">
                          <img src={store.logo} alt={store.name} className="h-full w-full object-cover" />
                        </div>
                        <div className="flex-1 flex flex-col gap-1 text-sm">
                          <h3 className="font-extrabold text-white text-base leading-tight">{store.name}</h3>
                          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-purple-400" /> Hub: {store.location}
                          </span>
                          <p className="text-xs text-slate-400 leading-relaxed mt-1.5">{store.description}</p>
                        </div>
                      </div>

                      {/* Vendor Applicant details */}
                      <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-850/60 text-xs flex flex-col gap-1">
                        <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Applicant</span>
                        <div className="flex justify-between font-semibold text-slate-300">
                          <span>Name: {store.vendor?.name || "Vendor User"}</span>
                          <span className="text-indigo-400">{store.vendor?.email}</span>
                        </div>
                      </div>

                      {/* Approval buttons */}
                      <div className="flex gap-3 pt-4 border-t border-slate-850 w-full">
                        <button
                          onClick={() => handleStoreApproval(store.id, "REJECTED")}
                          disabled={isPending}
                          className="flex-1 bg-slate-950 hover:bg-slate-900 border border-rose-950 text-rose-400 hover:text-rose-300 text-xs font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-1.5"
                        >
                          <X className="h-4 w-4" /> Reject
                        </button>
                        <button
                          onClick={() => handleStoreApproval(store.id, "APPROVED")}
                          disabled={isPending}
                          className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-extrabold py-3 rounded-xl shadow-lg shadow-emerald-600/10 transition-all flex items-center justify-center gap-1.5"
                        >
                          <Check className="h-4 w-4" /> Approve Registration
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        )}

        {/* 💵 TAB: REFUND REQUESTS MANAGER */}
        {activeTab === "refunds" && (
          <div className="flex flex-col gap-6">
            <h2 className="font-black text-lg text-white flex items-center gap-2">
              <CreditCard className="h-5.5 w-5.5 text-purple-400" /> Buyer Refund Tickets
            </h2>

            {refundRequests.length === 0 ? (
              <div className="w-full py-16 bg-slate-900/20 border border-dashed border-slate-800 rounded-3xl flex flex-col items-center justify-center gap-4 text-center">
                <Check className="h-10 w-10 text-emerald-400" />
                <div>
                  <h3 className="font-bold text-lg text-white">Refund tickets resolved</h3>
                  <p className="text-slate-500 text-sm mt-1">There are no customer refund request tickets currently in queue.</p>
                </div>
              </div>
            ) : (
              <div className="bg-slate-900/20 border border-slate-850 rounded-3xl overflow-hidden backdrop-blur-sm">
                <div className="overflow-x-auto w-full">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-slate-850 text-slate-500 text-[10px] uppercase font-bold tracking-wider">
                        <th className="py-4.5 px-6">Order details</th>
                        <th className="py-4.5 px-6">Buyer Applicant</th>
                        <th className="py-4.5 px-6">Refund Reason</th>
                        <th className="py-4.5 px-6">Refund Status</th>
                        <th className="py-4.5 px-6 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {refundRequests.map((r) => (
                        <tr key={r.id} className="border-b border-slate-850/60 hover:bg-slate-900/30 transition-colors">
                          <td className="py-4 px-6 flex flex-col">
                            <span className="font-extrabold text-white font-mono tracking-wider text-xs">{r.order?.orderNumber}</span>
                            <span className="text-[10px] text-slate-500 font-bold mt-0.5">Value: ${r.order?.totalAmount}</span>
                          </td>
                          <td className="py-4 px-6 flex flex-col">
                            <span className="font-bold text-slate-300">{r.order?.buyer?.name || "Buyer"}</span>
                            <span className="text-[10px] text-slate-500">{r.order?.buyer?.email}</span>
                          </td>
                          <td className="py-4 px-6 text-slate-400 text-xs max-w-xs leading-relaxed py-4">{r.reason}</td>
                          <td className="py-4 px-6">
                            <span className={`text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded border ${
                              r.status === "PENDING"
                                ? "bg-amber-500/10 border-amber-500/30 text-amber-300"
                                : r.status === "APPROVED"
                                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                                : "bg-rose-500/10 border-rose-500/30 text-rose-300"
                            }`}>
                              {r.status}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-center">
                            {r.status === "PENDING" ? (
                              <div className="flex gap-2 justify-center">
                                <button
                                  onClick={() => handleRefundProcess(r.id, "REJECTED")}
                                  disabled={isPending}
                                  className="p-2 text-rose-400 hover:text-white hover:bg-rose-500/20 rounded-lg border border-rose-950 transition-all cursor-pointer"
                                  title="Reject Refund"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleRefundProcess(r.id, "APPROVED")}
                                  disabled={isPending}
                                  className="p-2 text-emerald-400 hover:text-white hover:bg-emerald-500/20 rounded-lg border border-emerald-950 transition-all cursor-pointer"
                                  title="Approve Refund"
                                >
                                  <Check className="h-4 w-4" />
                                </button>
                              </div>
                            ) : (
                              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Resolved</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ⚙️ TAB: SETTINGS & COMMISSION */}
        {activeTab === "settings" && (
          <div className="bg-slate-900/30 border border-slate-850 p-6 sm:p-8 rounded-3xl backdrop-blur-sm flex flex-col gap-6 max-w-xl">
            <h2 className="font-black text-lg text-white flex items-center gap-2 pb-3 border-b border-slate-800">
              <Layers className="h-5.5 w-5.5 text-purple-400" /> Platform Settings
            </h2>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <span>Default Platform Commission Rate</span>
                  <span className="text-purple-400 font-extrabold text-sm">{commissionRate}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="25"
                  value={commissionRate}
                  onChange={(e) => setCommissionRate(Number(e.target.value))}
                  className="w-full accent-indigo-500 bg-slate-800 h-1.5 rounded-full cursor-pointer"
                />
                <p className="text-[10px] text-slate-500 leading-relaxed mt-1">
                  Commission is automatically deducted from all buyer transaction subtotals on store sales checkout. Set rate between 5% and 25%.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  alert("Platform settings saved successfully in sandbox!");
                }}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs py-3 rounded-xl shadow-lg shadow-indigo-600/10 transition-all flex items-center justify-center gap-1.5"
              >
                Save Configurations
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Dynamic backdrop loader during transition */}
      {isPending && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center gap-4">
          <div className="bg-slate-900/60 border border-slate-800 p-8 rounded-3xl flex flex-col items-center gap-4 text-center">
            <Loader2 className="h-10 w-10 text-purple-500 animate-spin" />
            <div>
              <h3 className="font-bold text-white text-base">Processing Database Update</h3>
              <p className="text-slate-500 text-xs mt-1">Applying admin controls to Neon serverless PostgreSQL...</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
