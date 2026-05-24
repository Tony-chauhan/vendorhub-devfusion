"use client";

import React, { useState, useTransition } from "react";
import { 
  CreditCard, 
  MapPin, 
  ShoppingBag, 
  ArrowLeft, 
  Sparkles, 
  ShieldCheck, 
  ChevronRight, 
  Loader2, 
  CheckCircle,
  Truck
} from "lucide-react";
import Link from "next/link";
import confetti from "canvas-confetti";
import { createOrder } from "@/app/actions/orders";

// Mock cart items for sandbox representation
const MOCK_CART_ITEMS = [
  {
    id: "p1",
    name: "iPhone 15 Pro Max",
    price: 1399,
    quantity: 1,
    image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=100&auto=format&fit=crop&q=80",
    vendorName: "Alpha Retailers"
  },
  {
    id: "p6",
    name: "Organic Forest Honey",
    price: 12,
    quantity: 2,
    image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=100&auto=format&fit=crop&q=80",
    vendorName: "Western Ghats Eco Shop"
  }
];

export default function CheckoutPage() {
  // Navigation / Success states
  const [isSuccess, setIsSuccess] = useState(false);
  const [generatedOrderNum, setGeneratedOrderNum] = useState("");
  const [isPending, startTransition] = useTransition();

  // Form input states
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("Bangalore");
  const [zipCode, setZipCode] = useState("");
  const [selectedGateway, setSelectedGateway] = useState<"stripe" | "razorpay">("stripe");
  const [formError, setFormError] = useState("");

  // Summary Calculations
  const subtotal = MOCK_CART_ITEMS.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = subtotal > 100 ? 0 : 15;
  const tax = parseFloat((subtotal * 0.08).toFixed(2)); // 8% local tax
  const totalAmount = parseFloat((subtotal + shipping + tax).toFixed(2));

  // Trigger celebration fireworks
  const triggerConfetti = () => {
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 99 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      // since particles fall down, animate a bit higher than they would
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);
  };

  // Submit Handler
  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!fullName || !phone || !street || !zipCode) {
      setFormError("Please fill out all shipping details before proceeding.");
      return;
    }

    // Prepare full address string
    const fullAddress = `${street}, ${city}, PIN: ${zipCode}. Phone: ${phone}`;

    startTransition(async () => {
      // Create order using Server Action
      const result = await createOrder({
        totalAmount,
        address: fullAddress,
        items: MOCK_CART_ITEMS.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price
        }))
      });

      if (result.success) {
        setGeneratedOrderNum(result.orderNumber || "VNH-104820");
        setIsSuccess(true);
        triggerConfetti();
      } else {
        setFormError(result.error || "Payment transaction rejected by sandbox.");
      }
    });
  };

  // Success view
  if (isSuccess) {
    return (
      <div className="w-full min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden font-sans">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-emerald-600/10 rounded-full blur-[100px] pointer-events-none" />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-xl w-full bg-slate-900/40 border border-slate-800/80 p-8 sm:p-10 rounded-3xl backdrop-blur-md shadow-2xl shadow-emerald-950/10 flex flex-col items-center text-center gap-6"
        >
          <div className="bg-emerald-500/10 p-4.5 rounded-full border border-emerald-500/20 shadow-lg shadow-emerald-500/10">
            <CheckCircle className="h-12 w-12 text-emerald-400" />
          </div>

          <div className="flex flex-col gap-2">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">Payment Successful!</h1>
            <p className="text-slate-400 text-sm">Thank you for your purchase. Your order has been registered in the system sandbox.</p>
          </div>

          {/* Order Details Panel */}
          <div className="w-full bg-slate-950/50 border border-slate-800/60 p-5 rounded-2xl flex flex-col gap-3.5 text-left text-sm">
            <div className="flex justify-between items-center pb-3 border-b border-slate-850">
              <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Order Number</span>
              <span className="font-extrabold text-emerald-400 font-mono tracking-wider">{generatedOrderNum}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Amount Charged</span>
              <span className="font-extrabold text-white">${totalAmount}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Delivery Mode</span>
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Truck className="h-4 w-4 text-purple-400" /> Hyperlocal Express
              </span>
            </div>
          </div>

          {/* Stepper tracking preview */}
          <div className="w-full py-4 flex flex-col gap-4">
            <div className="flex items-center justify-between text-[10px] uppercase font-bold tracking-wider text-slate-500">
              <span>Order Tracking Journey</span>
              <span className="text-purple-400">Status: Placed</span>
            </div>
            <div className="flex items-center w-full justify-between relative px-2">
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-800 -translate-y-1/2 z-0" />
              <div className="absolute top-1/2 left-0 w-1/4 h-0.5 bg-gradient-to-r from-purple-500 to-indigo-500 -translate-y-1/2 z-0" />
              
              <div className="bg-gradient-to-tr from-purple-500 to-indigo-500 text-white p-2 rounded-full border border-purple-400 shadow-md shadow-purple-500/20 z-10">
                <div className="w-3.5 h-3.5 text-[9px] font-bold flex items-center justify-center">1</div>
              </div>
              <div className="bg-slate-900 border border-slate-800 text-slate-500 p-2 rounded-full z-10">
                <div className="w-3.5 h-3.5 text-[9px] font-bold flex items-center justify-center">2</div>
              </div>
              <div className="bg-slate-900 border border-slate-800 text-slate-500 p-2 rounded-full z-10">
                <div className="w-3.5 h-3.5 text-[9px] font-bold flex items-center justify-center">3</div>
              </div>
              <div className="bg-slate-900 border border-slate-800 text-slate-500 p-2 rounded-full z-10">
                <div className="w-3.5 h-3.5 text-[9px] font-bold flex items-center justify-center">4</div>
              </div>
            </div>
            <div className="grid grid-cols-4 text-center text-[9px] font-bold text-slate-500 leading-tight">
              <span className="text-purple-400">Placed</span>
              <span>Confirmed</span>
              <span>Shipped</span>
              <span>Delivered</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full mt-4">
            <Link 
              href="/"
              className="flex-1 bg-slate-800 hover:bg-slate-700/80 border border-slate-700/50 text-slate-200 text-sm font-bold py-3.5 rounded-xl transition-all"
            >
              Continue Shopping
            </Link>
            <button
              onClick={() => {
                alert(`Order tracking page integration will be loaded in Phase 3. Order ID: ${generatedOrderNum}`);
              }}
              className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-sm font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-600/10 transition-all"
            >
              Track Package
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* Mini Glassmorphic Header */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-slate-900/60 border-b border-slate-800/80 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-slate-100 transition-colors">
          <ArrowLeft className="h-5 w-5" />
          <span className="text-sm font-semibold">Back to Marketplace</span>
        </Link>
        <span className="font-extrabold text-xl bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-indigo-300 to-indigo-500">
          Secure Sandbox Checkout
        </span>
        <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-slate-950/40 px-3.5 py-1.5 rounded-full border border-slate-800">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          <span>AES-256 Mock Encrypted</span>
        </div>
      </header>

      {/* Main Container */}
      <main className="w-full max-w-7xl mx-auto px-6 py-12 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Form Details */}
        <form onSubmit={handlePayment} className="lg:col-span-7 flex flex-col gap-6">
          
          {/* Section 1: Shipping Details */}
          <div className="bg-slate-900/40 border border-slate-800/80 p-6 sm:p-8 rounded-3xl backdrop-blur-md flex flex-col gap-5">
            <h2 className="font-black text-lg text-white flex items-center gap-2 pb-3 border-b border-slate-800">
              <MapPin className="h-5 w-5 text-purple-400" /> 1. Shipping Destination
            </h2>

            {formError && (
              <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs rounded-xl font-bold flex items-center gap-2">
                <AlertTriangle className="h-4.5 w-4.5" />
                <span>{formError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Receiver Name</label>
                <input
                  type="text"
                  placeholder="Dharmender Chauhan"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="bg-slate-950/40 border border-slate-850 hover:border-slate-750 focus:border-indigo-500/70 rounded-xl py-3 px-4 text-sm text-slate-100 placeholder-slate-600 focus:outline-none transition-all"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Mobile Number</label>
                <input
                  type="tel"
                  placeholder="+91 9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="bg-slate-950/40 border border-slate-850 hover:border-slate-750 focus:border-indigo-500/70 rounded-xl py-3 px-4 text-sm text-slate-100 placeholder-slate-600 focus:outline-none transition-all"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Street Address</label>
              <input
                type="text"
                placeholder="Flat No. 402, Royal Residency, Indiranagar"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                className="bg-slate-950/40 border border-slate-850 hover:border-slate-750 focus:border-indigo-500/70 rounded-xl py-3 px-4 text-sm text-slate-100 placeholder-slate-600 focus:outline-none transition-all"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Hyperlocal Hub Hub City</label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="bg-slate-950/40 border border-slate-850 hover:border-slate-750 focus:border-indigo-500/70 rounded-xl py-3.5 px-4 text-sm text-slate-100 focus:outline-none transition-all cursor-pointer"
                >
                  <option value="Bangalore">Bangalore Hub</option>
                  <option value="Srinagar">Srinagar Hub</option>
                  <option value="Mumbai">Mumbai Hub</option>
                  <option value="Delhi">Delhi Hub</option>
                  <option value="Pune">Pune Hub</option>
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">ZIP Code / PIN</label>
                <input
                  type="text"
                  placeholder="560038"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  className="bg-slate-950/40 border border-slate-850 hover:border-slate-750 focus:border-indigo-500/70 rounded-xl py-3 px-4 text-sm text-slate-100 placeholder-slate-600 focus:outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Payment Gateway Selection */}
          <div className="bg-slate-900/40 border border-slate-800/80 p-6 sm:p-8 rounded-3xl backdrop-blur-md flex flex-col gap-5">
            <h2 className="font-black text-lg text-white flex items-center gap-2 pb-3 border-b border-slate-800">
              <CreditCard className="h-5 w-5 text-purple-400" /> 2. Payment Gateway Sandbox
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Stripe */}
              <button
                type="button"
                onClick={() => setSelectedGateway("stripe")}
                className={`p-5 rounded-2xl border text-left flex items-start gap-4 transition-all relative ${
                  selectedGateway === "stripe"
                    ? "bg-indigo-600/10 border-indigo-500/50 shadow-md shadow-indigo-500/5"
                    : "bg-slate-950/20 border-slate-850 hover:border-slate-800 text-slate-400 hover:text-slate-200"
                }`}
              >
                <div className="bg-indigo-500/10 p-2 rounded-lg text-indigo-400">
                  <Sparkles className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-white">Stripe Sandbox</h3>
                  <p className="text-slate-500 text-[10px] mt-1 leading-relaxed">International checkout flow, cards, and wallets simulation.</p>
                </div>
                {selectedGateway === "stripe" && (
                  <div className="absolute top-4 right-4 w-4 h-4 bg-indigo-500 border border-indigo-400 rounded-full flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-white rounded-full" />
                  </div>
                )}
              </button>

              {/* Razorpay */}
              <button
                type="button"
                onClick={() => setSelectedGateway("razorpay")}
                className={`p-5 rounded-2xl border text-left flex items-start gap-4 transition-all relative ${
                  selectedGateway === "razorpay"
                    ? "bg-purple-600/10 border-purple-500/50 shadow-md shadow-purple-500/5"
                    : "bg-slate-950/20 border-slate-850 hover:border-slate-800 text-slate-400 hover:text-slate-200"
                }`}
              >
                <div className="bg-purple-500/10 p-2 rounded-lg text-purple-400">
                  <CreditCard className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-white">Razorpay Sandbox</h3>
                  <p className="text-slate-500 text-[10px] mt-1 leading-relaxed">Indian payment integration, UPI, Netbanking, Cards simulation.</p>
                </div>
                {selectedGateway === "razorpay" && (
                  <div className="absolute top-4 right-4 w-4 h-4 bg-purple-500 border border-purple-400 rounded-full flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-white rounded-full" />
                  </div>
                )}
              </button>
            </div>

            <div className="text-[11px] text-slate-500 leading-relaxed bg-slate-950/40 p-4 rounded-xl border border-slate-850/60 mt-1">
              Note: This is a secure checkout sandbox environment. Absolutely no real financial details are processed. Clicking pay initiates database creations and decreases stock levels.
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:from-slate-800 disabled:to-slate-800 disabled:cursor-not-allowed text-white text-base font-extrabold py-4.5 rounded-2xl shadow-xl shadow-indigo-600/10 hover:shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99]"
          >
            {isPending ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" /> Authorization Pending...
              </>
            ) : (
              <>
                Complete Payment (${totalAmount}) <ChevronRight className="h-5 w-5" />
              </>
            )}
          </button>
        </form>

        {/* Right Column: Order Summary */}
        <aside className="lg:col-span-5 bg-slate-900/40 border border-slate-800/80 p-6 sm:p-8 rounded-3xl backdrop-blur-md flex flex-col gap-6 h-fit">
          <h2 className="font-black text-lg text-white flex items-center gap-2 pb-3 border-b border-slate-800">
            <ShoppingBag className="h-5 w-5 text-purple-400" /> Order Summary
          </h2>

          {/* Cart list items */}
          <div className="flex flex-col gap-4">
            {MOCK_CART_ITEMS.map((item) => (
              <div key={item.id} className="flex gap-4 items-center">
                <div className="h-16 w-16 rounded-xl border border-slate-850 overflow-hidden shrink-0">
                  <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                </div>
                <div className="flex-1 flex flex-col gap-0.5 justify-center text-sm">
                  <h4 className="font-extrabold text-white leading-tight">{item.name}</h4>
                  <span className="text-[10px] text-slate-500">Store: {item.vendorName}</span>
                  <span className="text-xs text-slate-400 font-medium">Qty: {item.quantity}</span>
                </div>
                <span className="text-white font-extrabold text-sm shrink-0">
                  ${(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          {/* Price calculations */}
          <div className="flex flex-col gap-3 pt-6 border-t border-slate-800 text-xs">
            <div className="flex justify-between items-center text-slate-400">
              <span>Subtotal</span>
              <span className="font-bold text-slate-200">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-slate-400">
              <span>Local Tax (8%)</span>
              <span className="font-bold text-slate-200">${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-slate-400">
              <span>Hyperlocal Delivery Fee</span>
              <span className="font-bold text-slate-200">
                {shipping === 0 ? <strong className="text-emerald-400">FREE</strong> : `$${shipping.toFixed(2)}`}
              </span>
            </div>

            <div className="flex justify-between items-center text-sm font-black text-white pt-4 border-t border-slate-850">
              <span>Grand Total</span>
              <span className="text-lg text-purple-400">${totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </aside>
      </main>

      {/* Dynamic backdrop loader during transition */}
      {isPending && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center gap-4">
          <div className="bg-slate-900/60 border border-slate-800 p-8 rounded-3xl flex flex-col items-center gap-4 text-center">
            <Loader2 className="h-10 w-10 text-purple-500 animate-spin" />
            <div>
              <h3 className="font-bold text-white text-base">Contacting Sandbox Server</h3>
              <p className="text-slate-500 text-xs mt-1">Simulating webhook handshake and database locking...</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
