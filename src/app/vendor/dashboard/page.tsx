"use client";

import React, { useState, useTransition } from "react";
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
  ArrowRight
} from "lucide-react";
import Link from "next/link";
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
  const [activeTab, setActiveTab] = useState<"overview" | "products" | "orders">("overview");
  const [isPending, startTransition] = useTransition();

  // Core Data States
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [orders, setOrders] = useState(INITIAL_ORDERS);

  // Form Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newStock, setNewStock] = useState("");
  const [newCategory, setNewCategory] = useState("Electronics");
  const [newImage, setNewImage] = useState("https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=80");
  const [newDescription, setNewDescription] = useState("");
  const [submitError, setSubmitError] = useState("");

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

  return (
    <div className="w-full min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans relative">
      <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-purple-600/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Glassmorphic Navbar */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-slate-900/60 border-b border-slate-800/80 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-tr from-purple-500 to-indigo-600 p-2 rounded-xl">
            <Store className="h-5.5 w-5.5 text-white" />
          </div>
          <div>
            <span className="font-extrabold text-xl bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-indigo-300 to-indigo-500 tracking-tight">
              Vendor Dashboard
            </span>
            <span className="text-[10px] text-slate-500 ml-2">Store Panel</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400 font-semibold bg-slate-950/40 px-3 py-1.5 rounded-full border border-slate-800 flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-purple-400" /> Mumbai Hub
          </span>
          <Link
            href="/"
            className="text-xs font-bold text-slate-400 hover:text-slate-100 border border-slate-800 hover:border-slate-700 bg-slate-900/40 px-4 py-2 rounded-xl transition-all"
          >
            Visit Marketplace
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="w-full max-w-7xl mx-auto px-6 py-12 flex-1 flex flex-col gap-8">
        
        {/* Upper Segment: Welcome and Tab Selectors */}
        <section className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-850 pb-6">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
              Welcome back, <span className="text-purple-400">Dharmender</span> <Sparkles className="h-5 w-5 text-indigo-400 animate-pulse" />
            </h1>
            <p className="text-xs text-slate-500">Manage Delhi Spice Hub, track your local orders, and optimize your listings.</p>
          </div>

          {/* Glassmorphic Tab Selectors */}
          <div className="bg-slate-900/50 border border-slate-800/80 p-1 rounded-2xl flex gap-1 w-full sm:w-auto">
            {(["overview", "products", "orders"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 sm:flex-none text-xs font-bold px-5 py-2.5 rounded-xl transition-all uppercase tracking-wider ${
                  activeTab === tab
                    ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-indigo-500/10"
                    : "text-slate-500 hover:text-slate-300"
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
              <div className="p-4 bg-orange-500/10 border border-orange-500/20 text-orange-300 text-xs rounded-2xl font-bold flex items-center justify-between gap-4">
                <span className="flex items-center gap-2">
                  <AlertTriangle className="h-4.5 w-4.5 text-orange-400" />
                  Warning: You have {lowStockCount} product listings running low on stock. Increase inventory immediately to maintain high buyer ratings!
                </span>
                <button 
                  onClick={() => setActiveTab("products")}
                  className="bg-orange-500/20 hover:bg-orange-500/30 text-orange-200 px-3.5 py-1.5 rounded-lg border border-orange-500/30 transition-all font-extrabold text-[10px] uppercase tracking-wider"
                >
                  Manage Stock
                </button>
              </div>
            )}

            {/* Stat Cards Tiles Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Revenue */}
              <div className="bg-slate-900/30 border border-slate-850 p-6 rounded-3xl backdrop-blur-sm flex items-center justify-between">
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Gross Revenue</span>
                  <span className="text-3xl font-black text-white">${totalRevenue.toFixed(2)}</span>
                  <span className="text-[10px] text-slate-500 font-bold">10% Platform Commission Deducted</span>
                </div>
                <div className="bg-indigo-500/10 p-4 rounded-2xl text-indigo-400 border border-indigo-500/20">
                  <DollarSign className="h-6 w-6" />
                </div>
              </div>

              {/* Total Orders */}
              <div className="bg-slate-900/30 border border-slate-850 p-6 rounded-3xl backdrop-blur-sm flex items-center justify-between">
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Store Orders</span>
                  <span className="text-3xl font-black text-white">{orders.length}</span>
                  <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" /> +100% this week
                  </span>
                </div>
                <div className="bg-purple-500/10 p-4 rounded-2xl text-purple-400 border border-purple-500/20">
                  <ShoppingBag className="h-6 w-6" />
                </div>
              </div>

              {/* Active Products */}
              <div className="bg-slate-900/30 border border-slate-850 p-6 rounded-3xl backdrop-blur-sm flex items-center justify-between">
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Total Products</span>
                  <span className="text-3xl font-black text-white">{products.length}</span>
                  <span className="text-[10px] text-slate-500 font-bold">Low stock alerts active</span>
                </div>
                <div className="bg-amber-500/10 p-4 rounded-2xl text-amber-400 border border-amber-500/20">
                  <Package className="h-6 w-6" />
                </div>
              </div>
            </div>

            {/* Recharts Sales Chart Container */}
            <div className="bg-slate-900/30 border border-slate-850 p-6 sm:p-8 rounded-3xl backdrop-blur-sm flex flex-col gap-6">
              <h3 className="font-extrabold text-base text-white">Sales Performance (Weekly)</h3>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={MOCK_SALES_DATA}>
                    <defs>
                      <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="day" stroke="#64748b" fontSize={11} fontWeight="bold" />
                    <YAxis stroke="#64748b" fontSize={11} fontWeight="bold" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "12px", color: "#f8fafc" }}
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
              <span className="text-slate-400 text-sm">
                Managing <strong className="text-slate-200">{products.length}</strong> active storefront products
              </span>
              
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/30 transition-all flex items-center gap-1.5 hover:scale-[1.02] active:scale-[0.98]"
              >
                <PlusCircle className="h-4.5 w-4.5" /> Add Product
              </button>
            </div>

            {/* Products Table */}
            {products.length === 0 ? (
              <div className="w-full py-20 bg-slate-900/20 border border-dashed border-slate-800 rounded-3xl flex flex-col items-center justify-center gap-4 text-center">
                <Package className="h-10 w-10 text-purple-400/80" />
                <div>
                  <h3 className="font-bold text-lg text-white">No products listed yet</h3>
                  <p className="text-slate-500 text-sm mt-1">Click Add Product to list your first item on the hyperlocal index.</p>
                </div>
              </div>
            ) : (
              <div className="bg-slate-900/20 border border-slate-850 rounded-3xl overflow-hidden backdrop-blur-sm">
                <div className="overflow-x-auto w-full">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-slate-850 text-slate-500 text-[10px] uppercase font-bold tracking-wider">
                        <th className="py-4.5 px-6">Product details</th>
                        <th className="py-4.5 px-6">Category</th>
                        <th className="py-4.5 px-6">Price</th>
                        <th className="py-4.5 px-6">Stock Status</th>
                        <th className="py-4.5 px-6 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((p) => (
                        <tr key={p.id} className="border-b border-slate-850/60 hover:bg-slate-900/30 transition-colors">
                          <td className="py-4 px-6 flex items-center gap-4">
                            <div className="h-12 w-12 border border-slate-800 rounded-lg overflow-hidden shrink-0">
                              <img src={p.images[0]} alt={p.name} className="h-full w-full object-cover" />
                            </div>
                            <span className="font-bold text-white leading-tight">{p.name}</span>
                          </td>
                          <td className="py-4 px-6 text-slate-400 font-medium">{p.category}</td>
                          <td className="py-4 px-6 font-extrabold text-white">${p.price}</td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2">
                              <span className={`w-2.5 h-2.5 rounded-full ${p.stock > 3 ? "bg-emerald-500" : "bg-orange-500"}`} />
                              <span className={`font-bold ${p.stock > 3 ? "text-slate-300" : "text-orange-400"}`}>
                                {p.stock} in stock {p.stock <= 3 && "(Low)"}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-6 text-center">
                            <button
                              onClick={() => handleDelete(p.id)}
                              disabled={isPending}
                              className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg border border-transparent hover:border-rose-500/20 transition-all cursor-pointer"
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
            <span className="text-slate-400 text-sm">
              Fulfilling <strong className="text-slate-200">{orders.filter(o => o.status !== "DELIVERED").length}</strong> incoming hyperlocal orders
            </span>

            {/* Orders list */}
            {orders.length === 0 ? (
              <div className="w-full py-20 bg-slate-900/20 border border-dashed border-slate-800 rounded-3xl flex flex-col items-center justify-center gap-4 text-center">
                <ShoppingBag className="h-10 w-10 text-purple-400/80" />
                <div>
                  <h3 className="font-bold text-lg text-white">No incoming orders yet</h3>
                  <p className="text-slate-500 text-sm mt-1">Share your storefront link and check back once local buyers checkout.</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {orders.map((o) => (
                  <div 
                    key={o.id}
                    className="bg-slate-900/30 border border-slate-850 p-6 rounded-3xl backdrop-blur-sm flex flex-col gap-5 justify-between"
                  >
                    <div className="flex flex-col gap-3">
                      {/* Order number & Status badge */}
                      <div className="flex justify-between items-center pb-3 border-b border-slate-850/60">
                        <div className="flex flex-col">
                          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Order No.</span>
                          <span className="font-extrabold text-white font-mono tracking-wider">{o.orderNumber}</span>
                        </div>

                        <span className={`text-[9px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded border ${
                          o.status === "PLACED" 
                            ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-300"
                            : o.status === "CONFIRMED"
                            ? "bg-purple-500/10 border-purple-500/30 text-purple-300"
                            : "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                        }`}>
                          {o.status}
                        </span>
                      </div>

                      {/* Buyer Details */}
                      <div className="flex flex-col gap-2 text-xs">
                        <div className="flex justify-between text-slate-400">
                          <span>Buyer Name:</span>
                          <strong className="text-slate-200">{o.buyerName}</strong>
                        </div>
                        <div className="flex flex-col gap-1 text-slate-400">
                          <span>Address:</span>
                          <p className="bg-slate-950/40 p-2.5 rounded-lg border border-slate-850 text-[11px] text-slate-400 leading-relaxed mt-0.5">
                            {o.address}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Footer amount / Fulfill button */}
                    <div className="flex justify-between items-center pt-4 border-t border-slate-850/60">
                      <div className="flex flex-col">
                        <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Sale value</span>
                        <span className="font-extrabold text-white text-base">${o.totalAmount}</span>
                      </div>

                      {/* Transition button */}
                      {o.status !== "SHIPPED" ? (
                        <button
                          onClick={() => handleFulfillOrder(o.id)}
                          className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-1.5"
                        >
                          Mark as Shipped <ArrowRight className="h-4 w-4" />
                        </button>
                      ) : (
                        <span className="text-emerald-400 font-extrabold text-xs flex items-center gap-1 px-3 py-2 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
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
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md w-full bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl shadow-2xl relative flex flex-col gap-5"
          >
            {/* Close Button */}
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-all cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex flex-col gap-1">
              <h3 className="font-black text-xl text-white flex items-center gap-2">
                <PlusCircle className="h-5.5 w-5.5 text-purple-400" /> List New Product
              </h3>
              <p className="text-[11px] text-slate-500">Insert custom catalog fields into the Neon PostgreSQL index database.</p>
            </div>

            {submitError && (
              <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs rounded-xl font-bold flex items-center gap-2">
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
                  className="bg-slate-950 border border-slate-850 hover:border-slate-800 focus:border-indigo-500/70 rounded-xl py-3 px-4 text-slate-100 placeholder-slate-600 focus:outline-none transition-all"
                />
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
                    className="bg-slate-950 border border-slate-850 hover:border-slate-800 focus:border-indigo-500/70 rounded-xl py-3 px-4 text-slate-100 placeholder-slate-600 focus:outline-none transition-all"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-slate-400 uppercase tracking-wider">Stock Qty</label>
                  <input
                    type="number"
                    placeholder="15"
                    value={newStock}
                    onChange={(e) => setNewStock(e.target.value)}
                    className="bg-slate-950 border border-slate-850 hover:border-slate-800 focus:border-indigo-500/70 rounded-xl py-3 px-4 text-slate-100 placeholder-slate-600 focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* Category */}
              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-slate-400 uppercase tracking-wider">Select Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="bg-slate-950 border border-slate-850 hover:border-slate-800 focus:border-indigo-500/70 rounded-xl py-3 px-4 text-slate-100 focus:outline-none transition-all cursor-pointer"
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
                    { name: "Electronics", url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=80" },
                    { name: "Organic Farm", url: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=500&auto=format&fit=crop&q=80" },
                    { name: "Furniture Study", url: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=500&auto=format&fit=crop&q=80" }
                  ].map((img) => (
                    <button
                      key={img.name}
                      type="button"
                      onClick={() => setNewImage(img.url)}
                      className={`p-2 rounded-lg border text-[9px] font-bold text-slate-400 text-center uppercase tracking-wider transition-all ${
                        newImage === img.url
                          ? "bg-purple-600/10 border-purple-500/50 text-purple-300"
                          : "bg-slate-950 border-slate-850 hover:border-slate-800"
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
                  className="bg-slate-950 border border-slate-850 hover:border-slate-800 focus:border-indigo-500/70 rounded-xl py-3 px-4 text-slate-100 placeholder-slate-600 focus:outline-none transition-all resize-none leading-relaxed"
                />
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={isPending}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold py-3.5 rounded-xl shadow-lg shadow-indigo-600/10 transition-all flex items-center justify-center gap-1.5 mt-2"
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
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center gap-4">
          <div className="bg-slate-900/60 border border-slate-800 p-8 rounded-3xl flex flex-col items-center gap-4 text-center">
            <Loader2 className="h-10 w-10 text-purple-500 animate-spin" />
            <div>
              <h3 className="font-bold text-white text-base">Processing Database Query</h3>
              <p className="text-slate-500 text-xs mt-1">Executing Postgres transaction on Neon servers...</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
