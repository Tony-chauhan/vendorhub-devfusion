"use client";

import React, { useState, useTransition, useEffect } from "react";
import { 
  Store, 
  ShoppingBag, 
  DollarSign, 
  TrendingUp, 
  PlusCircle, 
  Trash2, 
  Package, 
  AlertTriangle, 
  Check, 
  Loader2, 
  Sparkles, 
  MapPin, 
  X,
  Clock,
  ArrowRight,
  RefreshCw
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import { addProduct, deleteProduct } from "@/app/actions/products";
import { getAIPriceSuggestions } from "@/app/actions/ai";
import { getCurrentUserRoleAndStore } from "@/app/actions/vendors";


// Mock sales data for the chart representation
const MOCK_SALES_DATA = [
  { day: "Mon", sales: 120 },
  { day: "Tue", sales: 340 },
  { day: "Wed", sales: 190 },
  { day: "Thu", sales: 480 },
  { day: "Fri", sales: 270 },
  { day: "Sat", sales: 590 },
  { day: "Sun", sales: 840 }
];

// Mock products database initial seed
const INITIAL_PRODUCTS = [
  {
    id: "p3",
    name: "Wireless ANC Headphones",
    price: 199,
    stock: 2,
    category: "Electronics",
    images: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&auto=format&fit=crop&q=80"]
  },
  {
    id: "p7",
    name: "Mechanical Gaming Keyboard",
    price: 79,
    stock: 1,
    category: "Electronics",
    images: ["https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=100&auto=format&fit=crop&q=80"]
  }
];

// Mock Incoming Orders for Vendor Store
const INITIAL_ORDERS = [
  {
    id: "o1",
    orderNumber: "VNH-820491",
    buyerName: "Rishita Sorout",
    address: "Flat 101, Royal Residency, Srinagar. PIN: 190001",
    totalAmount: 18,
    status: "CONFIRMED",
    date: "2026-05-24"
  },
  {
    id: "o2",
    orderNumber: "VNH-104820",
    buyerName: "Dharmender Chauhan",
    address: "Sector 15, Huda, Gurgaon, Delhi. PIN: 122001",
    totalAmount: 1411,
    status: "PLACED",
    date: "2026-05-24"
  }
];

export default function VendorDashboard() {
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<"overview" | "products" | "orders">("overview");
  const [isPending, startTransition] = useTransition();

  // Core Data States
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [orders, setOrders] = useState(INITIAL_ORDERS);

  useEffect(() => {
    const checkRole = async () => {
      try {
        const res = await getCurrentUserRoleAndStore();
        if (res.success) {
          let role = res.role;
          let status = res.store?.status || null;

          const mockStoreStr = localStorage.getItem("vendorhub_mock_store");
          if (mockStoreStr) {
            const mockStore = JSON.parse(mockStoreStr);
            role = "VENDOR";
            status = mockStore.status;
          }

          if (role === "ADMIN" || (role === "VENDOR" && status === "APPROVED")) {
            setIsAuthorized(true);
          } else if (role === "VENDOR" && status === "PENDING") {
            router.push("/store");
          } else {
            router.push("/vendor/register");
          }
        } else {
          router.push("/");
        }
      } catch (err) {
        console.error("Error in VendorDashboard role check:", err);
        router.push("/");
      } finally {
        setLoading(false);
      }
    };
    checkRole();
  }, [router]);


  // Form Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newStock, setNewStock] = useState("");
  const [newCategory, setNewCategory] = useState("Electronics");
  const [newImage, setNewImage] = useState("/pic/xingye-jiang-aGZYFSKv8cI-unsplash.jpg");
  const [newDescription, setNewDescription] = useState("");
  const [submitError, setSubmitError] = useState("");

  // Dynamic Image Auto-Selection based on Product Name keywords
  React.useEffect(() => {
    const nameLower = newName.toLowerCase();
    if (nameLower.includes("phone") || nameLower.includes("oneplus") || nameLower.includes("mobile") || nameLower.includes("samsung") || nameLower.includes("iphone") || nameLower.includes("nord")) {
      setNewImage("/pic/xingye-jiang-aGZYFSKv8cI-unsplash.jpg");
    } else if (nameLower.includes("keyboard") || nameLower.includes("keycap")) {
      setNewImage("https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&auto=format&fit=crop&q=80");
    } else if (nameLower.includes("headphone") || nameLower.includes("earphone") || nameLower.includes("audio") || nameLower.includes("anc")) {
      setNewImage("https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=80");
    } else if (nameLower.includes("furniture") || nameLower.includes("chair") || nameLower.includes("table") || nameLower.includes("desk")) {
      setNewImage("https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=500&auto=format&fit=crop&q=80");
    } else if (nameLower.includes("organic") || nameLower.includes("farm") || nameLower.includes("grocery") || nameLower.includes("fruit") || nameLower.includes("honey") || nameLower.includes("saffron") || nameLower.includes("spice")) {
      setNewImage("https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=500&auto=format&fit=crop&q=80");
    }
  }, [newName]);

  // AI Pricing & Copy Optimization states
  const [isAiPriceLoading, setIsAiPriceLoading] = useState(false);
  const [aiPriceInsight, setAiPriceInsight] = useState<{
    seoTags: string[];
    localMarketInsights: string;
  } | null>(null);

  // Trigger Gemini AI Price & Copy Consult
  const handleAIPriceConsult = () => {
    if (!newName) {
      setSubmitError("Please enter a Product Name first so the Gemini AI can assess it.");
      return;
    }
    setSubmitError("");
    setIsAiPriceLoading(true);
    setAiPriceInsight(null);

    startTransition(async () => {
      const res = await getAIPriceSuggestions(newName, newCategory, newDescription);
      if (res.success && res.data) {
        setNewPrice(res.data.recommendedPrice.toString());
        setNewDescription(res.data.marketingCopy);
        setAiPriceInsight({
          seoTags: res.data.seoTags,
          localMarketInsights: res.data.localMarketInsights,
        });
      } else {
        setSubmitError("Gemini Pricing Advisor sandbox query failed.");
      }
      setIsAiPriceLoading(false);
    });
  };

  // Stats Calculations
  const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const lowStockCount = products.filter((p) => p.stock <= 3).length;

  // Add Product Submit
  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");

    if (!newName || !newPrice || !newStock || !newDescription) {
      setSubmitError("Please fill out all fields to add a product.");
      return;
    }

    startTransition(async () => {
      // Call Server Action
      const result = await addProduct({
        name: newName,
        description: newDescription,
        price: parseFloat(newPrice),
        stock: parseInt(newStock),
        category: newCategory,
        images: [newImage]
      });

      if (result.success && result.product) {
        // Update local UI state
        const added = {
          id: result.product.id,
          name: result.product.name,
          price: result.product.price,
          stock: result.product.stock,
          category: result.product.category,
          images: result.product.images
        };
        setProducts((prev) => [added, ...prev]);

        // Reset and close
        setIsModalOpen(false);
        setNewName("");
        setNewPrice("");
        setNewStock("");
        setNewDescription("");
      } else {
        setSubmitError(result.error || "Application sandbox failed database insertion.");
      }
    });
  };

  // Delete Product Action
  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this product listing?")) {
      startTransition(async () => {
        const result = await deleteProduct(id);
        if (result.success) {
          setProducts((prev) => prev.filter((p) => p.id !== id));
        } else {
          alert(`Error deleting product: ${result.error}`);
        }
      });
    }
  };

  // Transition Order status
  const handleFulfillOrder = (id: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: "SHIPPED" } : o))
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-slate-50 justify-center items-center font-sans">
        <RefreshCw className="w-8 h-8 text-indigo-650 animate-spin mb-4" />
        <p className="text-xs font-semibold text-slate-400 tracking-wider uppercase">
          Verifying security credentials...
        </p>
      </div>
    );
  }

  if (!isAuthorized) return null;

  return (
    <div className="w-full min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans relative">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Glassmorphic Navbar */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/75 border-b border-slate-200/80 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-tr from-purple-500 to-indigo-600 p-2 rounded-xl">
            <Store className="h-5.5 w-5.5 text-white" />
          </div>
          <div>
            <span className="font-extrabold text-xl bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-indigo-500 to-indigo-700 tracking-tight">
              Vendor Dashboard
            </span>
            <span className="text-[10px] text-slate-400 ml-2 uppercase font-bold tracking-wider">Store Panel</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500 font-semibold bg-white/80 px-3 py-1.5 rounded-full border border-slate-200 flex items-center gap-1.5 shadow-sm">
            <MapPin className="h-3.5 w-3.5 text-purple-600" /> Mumbai Hub
          </span>
          <Link
            href="/"
            className="text-xs font-bold text-slate-500 hover:text-slate-800 border border-slate-200 hover:border-slate-300 bg-slate-100 px-4 py-2 rounded-xl transition-all"
          >
            Visit Marketplace
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="w-full max-w-7xl mx-auto px-6 py-12 flex-1 flex flex-col gap-8">
        
        {/* Upper Segment: Welcome and Tab Selectors */}
        <section className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-6">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 flex items-center gap-2">
              Welcome back, <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600 font-black">Dharmender</span> <Sparkles className="h-5 w-5 text-indigo-600 animate-pulse" />
            </h1>
            <p className="text-xs text-slate-500">Manage Delhi Spice Hub, track your local orders, and optimize your listings.</p>
          </div>

          {/* Glassmorphic Tab Selectors */}
          <div className="bg-white border border-slate-200/80 p-1 rounded-2xl flex gap-1 w-full sm:w-auto shadow-sm">
            {(["overview", "products", "orders"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 sm:flex-none text-xs font-bold px-5 py-2.5 rounded-xl transition-all uppercase tracking-wider cursor-pointer ${
                  activeTab === tab
                    ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-indigo-500/10"
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </section>

        {/* 📊 TAB 1: OVERVIEW ANALYTICS */}
        {activeTab === "overview" && (
          <div className="flex flex-col gap-8">
            
            {/* Low stock notice banner */}
            {lowStockCount > 0 && (
              <div className="p-4 bg-orange-50 border border-orange-200 text-orange-700 text-xs rounded-2xl font-bold flex items-center justify-between gap-4 shadow-sm">
                <span className="flex items-center gap-2">
                  <AlertTriangle className="h-4.5 w-4.5 text-orange-600 animate-pulse" />
                  Warning: You have {lowStockCount} product listings running low on stock. Increase inventory immediately to maintain high buyer ratings!
                </span>
                <button 
                  onClick={() => setActiveTab("products")}
                  className="bg-orange-100 hover:bg-orange-200 text-orange-800 px-3.5 py-1.5 rounded-lg border border-orange-200 transition-all font-extrabold text-[10px] uppercase tracking-wider cursor-pointer"
                >
                  Manage Stock
                </button>
              </div>
            )}

            {/* Stat Cards Tiles Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Revenue */}
              <div className="bg-white border border-slate-200/80 p-6 rounded-3xl backdrop-blur-sm flex items-center justify-between shadow-sm">
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Gross Revenue</span>
                  <span className="text-3xl font-black text-slate-900">${totalRevenue.toFixed(2)}</span>
                  <span className="text-[10px] text-slate-500 font-bold">10% Platform Commission Deducted</span>
                </div>
                <div className="bg-indigo-50 p-4 rounded-2xl text-indigo-600 border border-indigo-100">
                  <DollarSign className="h-6 w-6" />
                </div>
              </div>

              {/* Total Orders */}
              <div className="bg-white border border-slate-200/80 p-6 rounded-3xl backdrop-blur-sm flex items-center justify-between shadow-sm">
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Store Orders</span>
                  <span className="text-3xl font-black text-slate-900">{orders.length}</span>
                  <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" /> +100% this week
                  </span>
                </div>
                <div className="bg-purple-50 p-4 rounded-2xl text-purple-600 border border-purple-100">
                  <ShoppingBag className="h-6 w-6" />
                </div>
              </div>

              {/* Active Products */}
              <div className="bg-white border border-slate-200/80 p-6 rounded-3xl backdrop-blur-sm flex items-center justify-between shadow-sm">
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Products</span>
                  <span className="text-3xl font-black text-slate-900">{products.length}</span>
                  <span className="text-[10px] text-slate-500 font-bold">Low stock alerts active</span>
                </div>
                <div className="bg-amber-50 p-4 rounded-2xl text-amber-600 border border-amber-100">
                  <Package className="h-6 w-6" />
                </div>
              </div>
            </div>

            {/* Recharts Sales Chart Container */}
            <div className="bg-white border border-slate-200/80 p-6 sm:p-8 rounded-3xl backdrop-blur-sm flex flex-col gap-6 shadow-sm">
              <h3 className="font-extrabold text-base text-slate-900">Sales Performance (Weekly)</h3>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={MOCK_SALES_DATA}>
                    <defs>
                      <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="day" stroke="#64748b" fontSize={11} fontWeight="bold" />
                    <YAxis stroke="#64748b" fontSize={11} fontWeight="bold" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: "#ffffff", borderColor: "#e2e8f0", borderRadius: "12px", color: "#0f172a" }}
                      labelClassName="font-bold text-slate-400"
                    />
                    <Area type="monotone" dataKey="sales" stroke="#a78bfa" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* 📦 TAB 2: PRODUCTS MANAGER */}
        {activeTab === "products" && (
          <div className="flex flex-col gap-6">
            
            {/* Header control */}
            <div className="flex items-center justify-between">
              <span className="text-slate-500 text-sm">
                Managing <strong className="text-slate-800">{products.length}</strong> active storefront products
              </span>
              
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/30 transition-all flex items-center gap-1.5 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                <PlusCircle className="h-4.5 w-4.5" /> Add Product
              </button>
            </div>

            {/* Products Table */}
            {products.length === 0 ? (
              <div className="w-full py-20 bg-white border border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center gap-4 text-center shadow-inner">
                <Package className="h-10 w-10 text-purple-600/80 animate-pulse" />
                <div>
                  <h3 className="font-bold text-lg text-slate-900">No products listed yet</h3>
                  <p className="text-slate-500 text-sm mt-1">Click Add Product to list your first item on the hyperlocal index.</p>
                </div>
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-md shadow-slate-100">
                <div className="overflow-x-auto w-full">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50/50 text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                        <th className="py-4.5 px-6">Product details</th>
                        <th className="py-4.5 px-6">Category</th>
                        <th className="py-4.5 px-6">Price</th>
                        <th className="py-4.5 px-6">Stock Status</th>
                        <th className="py-4.5 px-6 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((p) => (
                        <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50/30 transition-colors">
                          <td className="py-4 px-6 flex items-center gap-4">
                            <div className="h-12 w-12 border border-slate-200 rounded-lg overflow-hidden shrink-0">
                              <img src={p.images[0]} alt={p.name} className="h-full w-full object-cover" />
                            </div>
                            <span className="font-bold text-slate-800 leading-tight">{p.name}</span>
                          </td>
                          <td className="py-4 px-6 text-slate-500 font-medium">{p.category}</td>
                          <td className="py-4 px-6 font-extrabold text-slate-900">${p.price}</td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2">
                              <span className={`w-2.5 h-2.5 rounded-full ${p.stock > 3 ? "bg-emerald-500" : "bg-orange-500"}`} />
                              <span className={`font-bold ${p.stock > 3 ? "text-slate-600" : "text-orange-600"}`}>
                                {p.stock} in stock {p.stock <= 3 && "(Low)"}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-6 text-center">
                            <button
                              onClick={() => handleDelete(p.id)}
                              disabled={isPending}
                              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg border border-transparent hover:border-rose-200 transition-all cursor-pointer bg-white"
                            >
                              <Trash2 className="h-4.5 w-4.5" />
                            </button>
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

        {/* 📋 TAB 3: INCOMING ORDERS */}
        {activeTab === "orders" && (
          <div className="flex flex-col gap-6">
            <span className="text-slate-500 text-sm">
              Fulfilling <strong className="text-slate-800">{orders.filter(o => o.status !== "DELIVERED").length}</strong> incoming hyperlocal orders
            </span>

            {/* Orders list */}
            {orders.length === 0 ? (
              <div className="w-full py-20 bg-white border border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center gap-4 text-center shadow-inner">
                <ShoppingBag className="h-10 w-10 text-purple-600/80 animate-pulse" />
                <div>
                  <h3 className="font-bold text-lg text-slate-900">No incoming orders yet</h3>
                  <p className="text-slate-500 text-sm mt-1">Share your storefront link and check back once local buyers checkout.</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {orders.map((o) => (
                  <div 
                    key={o.id}
                    className="bg-white border border-slate-200/85 p-6 rounded-3xl backdrop-blur-sm flex flex-col gap-5 justify-between shadow-md shadow-slate-100 hover:border-slate-300 transition-all"
                  >
                    <div className="flex flex-col gap-3">
                      {/* Order number & Status badge */}
                      <div className="flex justify-between items-center pb-3 border-b border-slate-200/80">
                        <div className="flex flex-col">
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Order No.</span>
                          <span className="font-extrabold text-slate-900 font-mono tracking-wider">{o.orderNumber}</span>
                        </div>

                        <span className={`text-[9px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded border ${
                          o.status === "PLACED" 
                            ? "bg-indigo-50 border-indigo-200 text-indigo-600 font-bold"
                            : o.status === "CONFIRMED"
                            ? "bg-purple-50 border-purple-200 text-purple-600 font-bold"
                            : "bg-emerald-50 border-emerald-200 text-emerald-600 font-bold"
                        }`}>
                          {o.status}
                        </span>
                      </div>

                      {/* Buyer Details */}
                      <div className="flex flex-col gap-2 text-xs">
                        <div className="flex justify-between text-slate-500">
                          <span>Buyer Name:</span>
                          <strong className="text-slate-800">{o.buyerName}</strong>
                        </div>
                        <div className="flex flex-col gap-1 text-slate-500">
                          <span>Address:</span>
                          <p className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-[11px] text-slate-500 leading-relaxed mt-0.5">
                            {o.address}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Footer amount / Fulfill button */}
                    <div className="flex justify-between items-center pt-4 border-t border-slate-200/80">
                      <div className="flex flex-col">
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Sale value</span>
                        <span className="font-extrabold text-slate-900 text-base">${o.totalAmount}</span>
                      </div>

                      {/* Transition button */}
                      {o.status !== "SHIPPED" ? (
                        <button
                          onClick={() => handleFulfillOrder(o.id)}
                          className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                        >
                          Mark as Shipped <ArrowRight className="h-4 w-4" />
                        </button>
                      ) : (
                        <span className="text-emerald-600 font-extrabold text-xs flex items-center gap-1 px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-100">
                          <Check className="h-4 w-4" /> Handed to Courier
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* 🔮 MODAL FORM: ADD PRODUCT */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-white/70 backdrop-blur-md flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md w-full bg-white border border-slate-200 p-6 sm:p-8 rounded-3xl shadow-2xl relative flex flex-col gap-5 max-h-[90vh] overflow-y-auto scrollbar-thin"
          >
            {/* Close Button */}
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex flex-col gap-1">
              <h3 className="font-black text-xl text-slate-900 flex items-center gap-2">
                <PlusCircle className="h-5.5 w-5.5 text-purple-600" /> List New Product
              </h3>
              <p className="text-[11px] text-slate-400">Insert custom catalog fields into the Neon PostgreSQL index database.</p>
            </div>

            {submitError && (
              <div className="p-4 bg-rose-50 border border-rose-200 text-rose-600 text-xs rounded-xl font-bold flex items-center gap-2">
                <AlertTriangle className="h-4.5 w-4.5" />
                <span>{submitError}</span>
              </div>
            )}

            <form onSubmit={handleAddProduct} className="flex flex-col gap-4 text-xs">
              {/* Product name */}
              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-slate-400 uppercase tracking-wider">Product Name</label>
                <input
                  type="text"
                  placeholder="E.g. Organic Kashmiri Saffron (1g)"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="bg-white border border-slate-200 hover:border-slate-300 focus:border-indigo-500 rounded-xl py-3 px-4 text-slate-800 placeholder-slate-400 focus:outline-none transition-all shadow-inner"
                />
              </div>

              {/* Gemini AI Optimization Consultant */}
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={handleAIPriceConsult}
                  disabled={isAiPriceLoading || !newName}
                  className="w-full bg-purple-50 border border-purple-200 hover:bg-purple-100 text-purple-600 font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:cursor-not-allowed disabled:bg-slate-50 disabled:border-slate-200 disabled:text-slate-400 hover:scale-[1.01] active:scale-[0.99]"
                >
                  {isAiPriceLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin text-purple-600" /> Consulting Gemini Advisor...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 text-purple-600 animate-pulse" /> Optimize Price & Copy with Gemini AI
                    </>
                  )}
                </button>

                {aiPriceInsight && (
                  <div className="p-4 bg-purple-50/50 border border-purple-100 rounded-xl flex flex-col gap-2 shadow-inner">
                    <span className="text-[10px] text-purple-600 font-extrabold uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-purple-600" /> Gemini Local Insights
                    </span>
                    <p className="text-[11px] text-slate-500 font-medium italic">
                      "{aiPriceInsight.localMarketInsights}"
                    </p>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {aiPriceInsight.seoTags.map((tag) => (
                        <span key={tag} className="text-[9px] bg-white px-2 py-0.5 rounded text-indigo-600 border border-indigo-100 font-extrabold uppercase tracking-wide">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Price & Stock */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-slate-400 uppercase tracking-wider">Price ($ USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="18.50"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="bg-white border border-slate-200 hover:border-slate-300 focus:border-indigo-500 rounded-xl py-3 px-4 text-slate-800 placeholder-slate-400 focus:outline-none transition-all shadow-inner"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-slate-400 uppercase tracking-wider">Stock Qty</label>
                  <input
                    type="number"
                    placeholder="15"
                    value={newStock}
                    onChange={(e) => setNewStock(e.target.value)}
                    className="bg-white border border-slate-200 hover:border-slate-300 focus:border-indigo-500 rounded-xl py-3 px-4 text-slate-800 placeholder-slate-400 focus:outline-none transition-all shadow-inner"
                  />
                </div>
              </div>

              {/* Category */}
              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-slate-400 uppercase tracking-wider">Select Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="bg-white border border-slate-200 hover:border-slate-300 focus:border-indigo-500 rounded-xl py-3 px-4 text-slate-800 focus:outline-none transition-all cursor-pointer shadow-inner"
                >
                  <option value="Electronics">Electronics</option>
                  <option value="Groceries">Groceries</option>
                  <option value="Furniture">Furniture</option>
                  <option value="Clothing">Clothing</option>
                </select>
              </div>

              {/* Image URL selection */}
              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-slate-400 uppercase tracking-wider">Choose Image Template Preset</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { name: "Smartphone", url: "/pic/xingye-jiang-aGZYFSKv8cI-unsplash.jpg" },
                    { name: "Headphones", url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=80" },
                    { name: "Keyboard", url: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&auto=format&fit=crop&q=80" },
                    { name: "Organic Farm", url: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=500&auto=format&fit=crop&q=80" },
                    { name: "Furniture Study", url: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=500&auto=format&fit=crop&q=80" }
                  ].map((img) => (
                    <button
                      key={img.name}
                      type="button"
                      onClick={() => setNewImage(img.url)}
                      className={`p-2 rounded-lg border text-[9px] font-bold text-center uppercase tracking-wider transition-all cursor-pointer ${
                        newImage === img.url
                          ? "bg-purple-50 border-purple-300 text-purple-600 font-bold"
                          : "bg-white border-slate-200 text-slate-400 hover:border-slate-300 hover:text-slate-600"
                      }`}
                    >
                      {img.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-slate-400 uppercase tracking-wider">Product Description</label>
                <textarea
                  rows={3}
                  placeholder="Detail specifications, warranty, or organic sourcing details..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="bg-white border border-slate-200 hover:border-slate-300 focus:border-indigo-500 rounded-xl py-3 px-4 text-slate-800 placeholder-slate-400 focus:outline-none transition-all resize-none leading-relaxed shadow-inner"
                />
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={isPending}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold py-3.5 rounded-xl shadow-lg shadow-indigo-600/10 transition-all flex items-center justify-center gap-1.5 mt-2 cursor-pointer"
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-4.5 w-4.5 animate-spin" /> Adding Product...
                  </>
                ) : (
                  <>
                    Add Product Listing <Check className="h-4.5 w-4.5" />
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </div>
      )}

      {/* Dynamic backdrop loader during transition */}
      {isPending && (
        <div className="fixed inset-0 z-50 bg-white/80 backdrop-blur-md flex flex-col items-center justify-center gap-4">
          <div className="bg-white border border-slate-200 p-8 rounded-3xl flex flex-col items-center gap-4 text-center shadow-2xl">
            <Loader2 className="h-10 w-10 text-purple-600 animate-spin" />
            <div>
              <h3 className="font-bold text-slate-900 text-base">Processing Database Query</h3>
              <p className="text-slate-400 text-xs mt-1">Executing Postgres transaction on Neon servers...</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
