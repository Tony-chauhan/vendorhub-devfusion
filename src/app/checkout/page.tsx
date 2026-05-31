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
  Truck,
  AlertTriangle
} from "lucide-react";
import Link from "next/link";
import confetti from "canvas-confetti";
import { motion, AnimatePresence } from "framer-motion";
import { createOrder } from "@/app/actions/orders";

// Mock cart items for sandbox representation (aligned with actual DB prod IDs)
const MOCK_CART_ITEMS = [
  {
    id: "prod_1",
    name: "Modern table lamp",
    price: 29,
    quantity: 1,
    image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=600&q=80",
    vendorName: "S-mart"
  },
  {
    id: "prod_6",
    name: "Security Camera",
    price: 29,
    quantity: 2,
    image: "https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=600&q=80",
    vendorName: "S-mart"
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
  const [selectedGateway, setSelectedGateway] = useState<"stripe" | "razorpay" | "cod">("stripe");
  const [formError, setFormError] = useState("");

  // Card input states
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");

  // UPI input states
  const [upiId, setUpiId] = useState("");
  const [upiTab, setUpiTab] = useState<"id" | "qr">("id");
  const [isProcessingSim, setIsProcessingSim] = useState(false);

  // Card number input formatter (insert spaces every 4 digits)
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 16) value = value.slice(0, 16);
    const formatted = value.replace(/(\d{4})(?=\d)/g, "$1 ");
    setCardNumber(formatted);
  };

  // Expiry date input formatter (MM/YY)
  const handleCardExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 4) value = value.slice(0, 4);
    if (value.length > 2) {
      value = `${value.slice(0, 2)}/${value.slice(2)}`;
    }
    setCardExpiry(value);
  };

  // CVV code input formatter (3 digits)
  const handleCardCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 3) value = value.slice(0, 3);
    setCardCvv(value);
  };

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
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);
  };

  // Unified payment/order submission handler
  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    // 1. Shipping form validation
    if (!fullName || !phone || !street || !zipCode) {
      setFormError("Please fill out all shipping details before proceeding.");
      return;
    }

    // 2. Inline payment validation based on selected gateway
    if (selectedGateway === "stripe") {
      const rawCard = cardNumber.replace(/\s/g, "");
      if (rawCard.length < 16) {
        setFormError("Stripe payment simulated: Card number must be 16 digits.");
        return;
      }
      if (cardExpiry.length < 5) {
        setFormError("Stripe payment simulated: Card expiry must be in MM/YY format.");
        return;
      }
      if (cardCvv.length < 3) {
        setFormError("Stripe payment simulated: CVV code must be 3 digits.");
        return;
      }
    } else if (selectedGateway === "razorpay") {
      if (upiTab === "id" && (!upiId || !upiId.includes("@"))) {
        setFormError("Razorpay simulated: Please enter a valid mock UPI ID containing '@' (e.g. name@upi).");
        return;
      }
    }

    setIsProcessingSim(true);

    // Prepare full address string
    const fullAddress = `${street}, ${city}, PIN: ${zipCode}. Phone: ${phone}`;

    setTimeout(() => {
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

        setIsProcessingSim(false);

        if (result.success) {
          const orderNum = result.orderNumber || `VNH-${Math.floor(100000 + Math.random() * 900000)}`;
          setGeneratedOrderNum(orderNum);

          // Save custom checkout order in localStorage so it appears in My Orders
          const newOrder = {
            id: result.orderId || `order_${Math.floor(100000 + Math.random() * 900000)}`,
            total: totalAmount,
            status: selectedGateway === "cod" ? "PLACED" : "CONFIRMED", // Auto-confirmed if mock-paid online
            createdAt: new Date().toISOString(),
            address: {
              name: fullName,
              street: street,
              city: city,
              zip: zipCode,
              state: "KA",
              country: "India",
              phone: phone
            },
            orderItems: MOCK_CART_ITEMS.map((item) => ({
              price: item.price,
              quantity: item.quantity,
              product: {
                id: item.id,
                name: item.name,
                images: [item.image],
                category: "Electronics"
              }
            })),
            user: {
              name: fullName || "Dharmender Chauhan"
            }
          };

          if (typeof window !== 'undefined') {
            const savedOrdersStr = localStorage.getItem('vendorhub_sandbox_orders');
            let localOrders: any[] = [];
            if (savedOrdersStr) {
              try {
                localOrders = JSON.parse(savedOrdersStr);
              } catch (err) {}
            }
            localOrders.unshift(newOrder);
            localStorage.setItem('vendorhub_sandbox_orders', JSON.stringify(localOrders));
          }

          setIsSuccess(true);
          triggerConfetti();
        } else {
          setFormError(result.error || "Sandbox transaction rejected by server backend.");
        }
      });
    }, 1500); // 1.5s simulated gateway processing latency
  };

  // Success view
  if (isSuccess) {
    return (
      <div className="w-full min-h-screen bg-slate-50 text-slate-800 flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden font-sans">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-xl w-full bg-white border border-slate-200/85 p-8 sm:p-10 rounded-3xl shadow-2xl flex flex-col items-center text-center gap-6"
        >
          <div className="bg-emerald-500/10 p-4.5 rounded-full border border-emerald-500/20 shadow-lg shadow-emerald-500/10 animate-pulse">
            <CheckCircle className="h-12 w-12 text-emerald-600" />
          </div>

          <div className="flex flex-col gap-2">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
              {selectedGateway === "cod" ? "Order Placed Successfully!" : "Payment Successful!"}
            </h1>
            <p className="text-slate-500 text-sm">
              {selectedGateway === "cod" 
                ? "Your Cash on Delivery order is confirmed and hyperlocally scheduled." 
                : "Thank you for your purchase. Your payment was verified instantly inside the Stripe/Razorpay sandbox."}
            </p>
          </div>

          {/* Order Details Panel */}
          <div className="w-full bg-slate-50 border border-slate-200/80 p-5 rounded-2xl flex flex-col gap-3.5 text-left text-sm">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200">
              <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Order Number</span>
              <span className="font-extrabold text-emerald-600 font-mono tracking-wider">{generatedOrderNum}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Amount Charged</span>
              <span className="font-extrabold text-slate-800">${totalAmount}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Delivery Mode</span>
              <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                <Truck className="h-4 w-4 text-purple-600 animate-bounce" /> Hyperlocal Express
              </span>
            </div>
          </div>

          {/* Stepper tracking preview */}
          <div className="w-full py-4 flex flex-col gap-4">
            <div className="flex items-center justify-between text-[10px] uppercase font-bold tracking-wider text-slate-400">
              <span>Order Tracking Journey</span>
              <span className="text-purple-600 font-black">Status: {selectedGateway === "cod" ? "Placed" : "Confirmed"}</span>
            </div>
            <div className="flex items-center w-full justify-between relative px-2">
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-200 -translate-y-1/2 z-0" />
              <div className="absolute top-1/2 left-0 w-1/4 h-0.5 bg-gradient-to-r from-purple-500 to-indigo-500 -translate-y-1/2 z-0" />
              
              <div className="bg-gradient-to-tr from-purple-600 to-indigo-600 text-white p-2 rounded-full border border-purple-400 shadow-md shadow-purple-500/20 z-10">
                <div className="w-3.5 h-3.5 text-[9px] font-bold flex items-center justify-center">1</div>
              </div>
              <div className="bg-slate-100 border border-slate-200 text-slate-400 p-2 rounded-full z-10">
                <div className="w-3.5 h-3.5 text-[9px] font-bold flex items-center justify-center">2</div>
              </div>
              <div className="bg-slate-100 border border-slate-200 text-slate-400 p-2 rounded-full z-10">
                <div className="w-3.5 h-3.5 text-[9px] font-bold flex items-center justify-center">3</div>
              </div>
              <div className="bg-slate-100 border border-slate-200 text-slate-400 p-2 rounded-full z-10">
                <div className="w-3.5 h-3.5 text-[9px] font-bold flex items-center justify-center">4</div>
              </div>
            </div>
            <div className="grid grid-cols-4 text-center text-[9px] font-bold text-slate-400 leading-tight">
              <span className="text-purple-600 font-extrabold">{selectedGateway === "cod" ? "Placed" : "Confirmed"}</span>
              <span>Sorted</span>
              <span>Transit</span>
              <span>Delivered</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full mt-4">
            <Link 
              href="/"
              className="flex-1 bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-slate-700 text-sm font-bold py-3.5 rounded-xl transition-all text-center"
            >
              Continue Shopping
            </Link>
            <button
              onClick={() => {
                alert(`Hyperlocal real-time tracking dashboard is simulated. Order ID: ${generatedOrderNum}`);
              }}
              className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-sm font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-600/15 transition-all cursor-pointer"
            >
              Track Package
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      
      {/* Mini Glassmorphic Header */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/75 border-b border-slate-200/80 px-6 py-4 flex items-center justify-between shadow-sm">
        <Link href="/" className="flex items-center gap-2 text-slate-550 hover:text-slate-800 transition-colors">
          <ArrowLeft className="h-5 w-5" />
          <span className="text-sm font-semibold">Back to Marketplace</span>
        </Link>
        <span className="font-extrabold text-xl bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-indigo-500 to-indigo-750">
          Secure Sandbox Checkout
        </span>
        <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-white px-3.5 py-1.5 rounded-full border border-slate-200 shadow-sm">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          <span>AES-256 Mock Encrypted</span>
        </div>
      </header>

      {/* Main Container */}
      <main className="w-full max-w-7xl mx-auto px-6 py-12 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Form Details */}
        <form onSubmit={handlePayment} className="lg:col-span-7 flex flex-col gap-6">
          
          {/* Section 1: Shipping Details */}
          <div className="bg-white border border-slate-200/80 p-6 sm:p-8 rounded-3xl shadow-md shadow-slate-100 flex flex-col gap-5">
            <h2 className="font-black text-lg text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-200">
              <MapPin className="h-5 w-5 text-purple-600" /> 1. Shipping Destination
            </h2>

            {formError && (
              <div className="p-4 bg-rose-50 border border-rose-200 text-rose-600 text-xs rounded-xl font-bold flex items-center gap-2">
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
                  className="bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-indigo-500 rounded-xl py-3 px-4 text-sm text-slate-800 placeholder-slate-400 focus:outline-none transition-all font-semibold"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Mobile Number</label>
                <input
                  type="tel"
                  placeholder="+91 9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-indigo-500 rounded-xl py-3 px-4 text-sm text-slate-800 placeholder-slate-400 focus:outline-none transition-all font-semibold"
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
                className="bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-indigo-500 rounded-xl py-3 px-4 text-sm text-slate-800 placeholder-slate-400 focus:outline-none transition-all font-semibold"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Hyperlocal Hub City</label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-indigo-500 rounded-xl py-3.5 px-4 text-sm text-slate-800 focus:outline-none transition-all cursor-pointer font-semibold"
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
                  className="bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-indigo-500 rounded-xl py-3 px-4 text-sm text-slate-800 placeholder-slate-400 focus:outline-none transition-all font-semibold"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Inline Payment Gateway Sandbox Selection */}
          <div className="bg-white border border-slate-200/80 p-6 sm:p-8 rounded-3xl shadow-md shadow-slate-100 flex flex-col gap-5">
            <h2 className="font-black text-lg text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-200">
              <CreditCard className="h-5 w-5 text-purple-600" /> 2. Payment Gateway Sandbox
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Stripe */}
              <button
                type="button"
                onClick={() => setSelectedGateway("stripe")}
                className={`p-4.5 rounded-2xl border text-left transition-all flex flex-col gap-2 cursor-pointer ${
                  selectedGateway === "stripe"
                    ? "bg-indigo-50/50 border-indigo-500 text-indigo-950 font-bold shadow-sm shadow-indigo-100"
                    : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100 hover:border-slate-300"
                }`}
              >
                <span className="text-[9px] uppercase font-extrabold tracking-widest text-slate-400">Stripe Gateway</span>
                <span className="text-sm font-black text-slate-800">Credit Card</span>
                <span className="text-[10px] text-slate-450 leading-tight">Instant simulated credit card settlement.</span>
              </button>

              {/* Razorpay */}
              <button
                type="button"
                onClick={() => setSelectedGateway("razorpay")}
                className={`p-4.5 rounded-2xl border text-left transition-all flex flex-col gap-2 cursor-pointer ${
                  selectedGateway === "razorpay"
                    ? "bg-indigo-50/50 border-indigo-500 text-indigo-950 font-bold shadow-sm shadow-indigo-100"
                    : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100 hover:border-slate-300"
                }`}
              >
                <span className="text-[9px] uppercase font-extrabold tracking-widest text-slate-400">Razorpay UPI</span>
                <span className="text-sm font-black text-slate-800">UPI / QR Scan</span>
                <span className="text-[10px] text-slate-450 leading-tight">Unified domestic wallet settlement simulator.</span>
              </button>

              {/* Cash on Delivery */}
              <button
                type="button"
                onClick={() => setSelectedGateway("cod")}
                className={`p-4.5 rounded-2xl border text-left transition-all flex flex-col gap-2 cursor-pointer ${
                  selectedGateway === "cod"
                    ? "bg-indigo-50/50 border-indigo-500 text-indigo-950 font-bold shadow-sm shadow-indigo-100"
                    : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100 hover:border-slate-300"
                }`}
              >
                <span className="text-[9px] uppercase font-extrabold tracking-widest text-slate-400">COD Option</span>
                <span className="text-sm font-black text-slate-800">Cash on Delivery</span>
                <span className="text-[10px] text-slate-450 leading-tight">Safe local settlement at shipping arrival.</span>
              </button>
            </div>

            {/* Dynamic Inline Forms via AnimatePresence */}
            <div className="border border-slate-150 rounded-2xl p-5 bg-slate-50/60 shadow-inner">
              <AnimatePresence mode="wait">
                {selectedGateway === "stripe" && (
                  <motion.div
                    key="stripe"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                    className="flex flex-col gap-5 overflow-hidden"
                  >
                    {/* Visual Digital Credit Card Graphic */}
                    <div className="relative w-full max-w-[290px] h-40 rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border border-white/10 p-5 flex flex-col justify-between text-white shadow-lg shadow-indigo-950/20 overflow-hidden shrink-0 mx-auto transition-transform hover:scale-[1.01]">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-[40px] pointer-events-none" />
                      <div className="flex justify-between items-start">
                        <div className="flex flex-col gap-1">
                          <span className="text-[7.5px] uppercase tracking-widest text-slate-450 font-extrabold">Stripe Sandbox Card</span>
                          <div className="w-8 h-6 bg-amber-500/25 rounded border border-amber-500/35 flex items-center justify-center">
                            <div className="grid grid-cols-2 gap-0.5 w-4 h-3.5 opacity-80">
                              <div className="border border-amber-500/40 rounded-[1px]"></div>
                              <div className="border border-amber-500/40 rounded-[1px]"></div>
                              <div className="border border-amber-500/40 rounded-[1px]"></div>
                              <div className="border border-amber-500/40 rounded-[1px]"></div>
                            </div>
                          </div>
                        </div>
                        <span className="font-black italic text-sm tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-300">stripe</span>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        {/* Masked Card Number */}
                        <div className="font-mono text-xs sm:text-sm tracking-[0.25em] font-medium text-slate-100">
                          {cardNumber || "•••• •••• •••• ••••"}
                        </div>

                        <div className="flex justify-between items-end text-[9px]">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[6.5px] uppercase tracking-wider text-slate-450 font-bold">Cardholder</span>
                            <span className="font-bold tracking-wide truncate max-w-[130px]">{fullName || "Dharmender Chauhan"}</span>
                          </div>
                          <div className="flex gap-4 shrink-0">
                            <div className="flex flex-col gap-0.5 items-end">
                              <span className="text-[6.5px] uppercase tracking-wider text-slate-450 font-bold">Expires</span>
                              <span className="font-mono font-bold">{cardExpiry || "MM/YY"}</span>
                            </div>
                            <div className="flex flex-col gap-0.5 items-end">
                              <span className="text-[6.5px] uppercase tracking-wider text-slate-450 font-bold">CVV</span>
                              <span className="font-mono font-bold">{cardCvv ? "•••" : "•••"}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Interactive Stripe input fields */}
                    <div className="flex flex-col gap-3.5">
                      <div className="flex justify-between items-center bg-indigo-50/50 p-2.5 rounded-xl border border-indigo-100/80 shadow-sm">
                        <span className="text-[10px] text-indigo-900 font-extrabold uppercase tracking-wider pl-1.5 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-indigo-550 shrink-0" /> Sandbox Credentials
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setCardNumber("4242 4242 4242 4242");
                            setCardExpiry("12/28");
                            setCardCvv("123");
                            if (!fullName) setFullName("Dharmender Chauhan");
                          }}
                          className="text-[10px] text-indigo-700 hover:text-indigo-900 font-black bg-white border border-indigo-250 px-3 py-1.5 rounded-lg transition-all cursor-pointer shadow-sm active:scale-95 hover:shadow-indigo-200/40 flex items-center gap-1 animate-pulse"
                        >
                          ⚡ Autofill Mock Card
                        </button>
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Cardholder Name</label>
                        <input
                          type="text"
                          placeholder="Dharmender Chauhan"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="bg-white border border-slate-200 hover:border-slate-350 focus:border-indigo-550 rounded-xl py-2.5 px-3.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none transition-all font-semibold"
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Card Number</label>
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="4242 4242 4242 4242"
                            value={cardNumber}
                            onChange={handleCardNumberChange}
                            className="bg-white border border-slate-200 hover:border-slate-350 focus:border-indigo-550 rounded-xl py-2.5 pl-3.5 pr-10 text-xs text-slate-800 placeholder-slate-400 focus:outline-none transition-all font-mono tracking-widest"
                          />
                          <CreditCard className="w-4 h-4 absolute right-3.5 top-3 text-slate-400" />
                        </div>
                        <span className="text-[9px] text-slate-450 font-medium">Use '4242 4242 4242 4242' for simulated Stripe approvals.</span>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Expiry Date</label>
                          <input
                            type="text"
                            placeholder="12/28"
                            value={cardExpiry}
                            onChange={handleCardExpiryChange}
                            maxLength={5}
                            className="bg-white border border-slate-200 hover:border-slate-350 focus:border-indigo-550 rounded-xl py-2.5 px-3.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none transition-all font-mono"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">CVV Code</label>
                          <input
                            type="password"
                            placeholder="123"
                            maxLength={3}
                            value={cardCvv}
                            onChange={handleCardCvvChange}
                            className="bg-white border border-slate-200 hover:border-slate-350 focus:border-indigo-550 rounded-xl py-2.5 px-3.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none transition-all font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {selectedGateway === "razorpay" && (
                  <motion.div
                    key="razorpay"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                    className="flex flex-col gap-4 overflow-hidden"
                  >
                    {/* UPI tabs */}
                    <div className="grid grid-cols-2 bg-slate-100 p-1 rounded-xl border border-slate-200">
                      <button
                        type="button"
                        onClick={() => setUpiTab("id")}
                        className={`py-1.5 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                          upiTab === "id"
                            ? "bg-white text-indigo-950 shadow-sm"
                            : "text-slate-500 hover:text-slate-700"
                        }`}
                      >
                        UPI ID
                      </button>
                      <button
                        type="button"
                        onClick={() => setUpiTab("qr")}
                        className={`py-1.5 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                          upiTab === "qr"
                            ? "bg-white text-indigo-950 shadow-sm"
                            : "text-slate-500 hover:text-slate-700"
                        }`}
                      >
                        Simulate Scan QR
                      </button>
                    </div>

                    {upiTab === "id" ? (
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Enter UPI Address</label>
                        <input
                          type="text"
                          placeholder="dharmender@okaxis"
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                          className="bg-white border border-slate-200 hover:border-slate-350 focus:border-indigo-550 rounded-xl py-2.5 px-3.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none w-full font-mono transition-all"
                        />
                        <span className="text-[9px] text-slate-450 font-medium">Use any mock handles, e.g. pay@upi, phonepe@ybl.</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center p-3 bg-white border border-slate-200/80 rounded-xl gap-2.5">
                        <div className="w-28 h-28 bg-white border border-slate-200 p-2 rounded-xl shadow-md flex items-center justify-center relative overflow-hidden group">
                          <div className="grid grid-cols-4 gap-1 w-full h-full opacity-80">
                            {Array.from({ length: 16 }).map((_, i) => (
                              <div
                                key={i}
                                className={`rounded-sm ${(i === 0 || i === 3 || i === 12 || i === 15 || i === 5 || i === 10) ? 'bg-indigo-950' : 'bg-indigo-950/20'}`}
                              />
                            ))}
                          </div>
                          <div className="absolute left-0 right-0 h-0.5 bg-indigo-500 top-1/2 -translate-y-1/2 animate-bounce opacity-80 shadow-md shadow-indigo-500/50" />
                        </div>
                        <span className="text-[9px] text-center text-slate-440 leading-normal font-semibold max-w-xs">
                          Scan simulation active. QR scanner validates immediate wallet confirmations.
                        </span>
                      </div>
                    )}
                  </motion.div>
                )}

                {selectedGateway === "cod" && (
                  <motion.div
                    key="cod"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                    className="flex flex-col gap-2 overflow-hidden text-slate-600 text-xs leading-relaxed"
                  >
                    <div className="bg-emerald-50/50 border border-emerald-200 p-4 rounded-xl text-emerald-800 flex items-start gap-2.5">
                      <CheckCircle className="h-4.5 w-4.5 text-emerald-600 shrink-0 mt-0.5 animate-pulse" />
                      <div>
                        <strong className="font-bold text-slate-800">Cash on Delivery Active:</strong>
                        <p className="mt-1 text-[11px] text-emerald-700/90 font-semibold">
                          No pre-payment is required! Pay the delivery driver directly when your hyperlocal package arrives at your destination.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Simulated processing note */}
            <div className="p-4 bg-amber-50 border border-amber-200 text-amber-800 text-[11px] rounded-xl leading-relaxed flex items-start gap-2.5">
              <Sparkles className="h-4.5 w-4.5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong>DevFusion 2.0 Evaluation:</strong> This checkout processes orders inside a secure sandbox transaction, automatically decreasing product stock and verifying vendor payouts instantly without charging real cards.
              </div>
            </div>

            {/* Fulfill Action */}
            <button
              type="submit"
              disabled={isPending || isProcessingSim}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold py-4 rounded-xl shadow-lg shadow-indigo-600/15 hover:shadow-indigo-600/35 transition-all flex items-center justify-center gap-1.5 mt-2 cursor-pointer hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
            >
              {isPending || isProcessingSim ? (
                <>
                  <Loader2 className="h-4.5 w-4.5 animate-spin" /> Verifying Inline Gateway Sandbox...
                </>
              ) : (
                <>
                  {selectedGateway === "cod" ? "Place Order (COD)" : "Pay & Complete Sandbox Order"} <ChevronRight className="h-4.5 w-4.5" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Right Column: Order Summary */}
        <aside className="lg:col-span-5 bg-white border border-slate-200/80 p-6 sm:p-8 rounded-3xl shadow-md shadow-slate-100 flex flex-col gap-6 backdrop-blur-md">
          <h2 className="font-black text-lg text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-200">
            <ShoppingBag className="h-5 w-5 text-purple-600" /> Order Summary
          </h2>

          {/* Cart list representation */}
          <div className="flex flex-col gap-4">
            {MOCK_CART_ITEMS.map((item) => (
              <div key={item.id} className="flex gap-4 items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex gap-3 items-center">
                  <div className="h-14 w-14 border border-slate-200 rounded-xl overflow-hidden bg-slate-50 shrink-0">
                    <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                  </div>
                  <div className="flex flex-col text-xs gap-0.5">
                    <strong className="text-slate-800 font-extrabold text-sm">{item.name}</strong>
                    <span className="text-[10px] text-slate-400 font-medium">Store: {item.vendorName}</span>
                    <span className="text-[10px] text-indigo-600 font-bold bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded w-fit mt-1">Qty: {item.quantity}</span>
                  </div>
                </div>

                <span className="font-extrabold text-slate-800 text-sm shrink-0">${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          {/* Calculation Subtotals */}
          <div className="flex flex-col gap-3.5 text-xs text-slate-500 pb-6 border-b border-slate-100">
            <div className="flex justify-between">
              <span>Items Subtotal:</span>
              <strong className="text-slate-700 font-bold">${subtotal.toFixed(2)}</strong>
            </div>
            <div className="flex justify-between">
              <span>Local Tax GST (8%):</span>
              <strong className="text-slate-700 font-bold">${tax.toFixed(2)}</strong>
            </div>
            <div className="flex justify-between">
              <span>Hyperlocal Delivery Fee:</span>
              <strong className="text-emerald-600 font-extrabold uppercase tracking-wide">Free</strong>
            </div>
          </div>

          {/* Grand Total Box */}
          <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between shadow-inner">
            <div className="flex flex-col">
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Amount Due</span>
              <span className="text-base font-black text-slate-800">Grand Total</span>
            </div>
            <span className="text-2xl font-black text-purple-600">${totalAmount.toFixed(2)}</span>
          </div>
        </aside>

      </main>
    </div>
  );
}
