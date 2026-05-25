"use client";

import React, { useState, useTransition } from "react";
import { 
  Store, 
  MapPin, 
  CreditCard, 
  Sparkles, 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  AlertTriangle, 
  Loader2, 
  Hourglass,
  LayoutDashboard
} from "lucide-react";
import Link from "next/link";
import { registerVendor } from "@/app/actions/vendors";

// Standard preset logo choices to make onboarding beautiful instantly
const LOGO_PRESETS = [
  { name: "Superstore", url: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=150&auto=format&fit=crop&q=80" },
  { name: "Tech Hub", url: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=150&auto=format&fit=crop&q=80" },
  { name: "Organic Farm", url: "https://images.unsplash.com/photo-1595855759920-86582396756a?w=150&auto=format&fit=crop&q=80" },
  { name: "Boutique", url: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=150&auto=format&fit=crop&q=80" }
];

export default function VendorRegisterPage() {
  const [isPending, startTransition] = useTransition();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [storeName, setStoreName] = useState<string>("");
  const [storeNameDisplay, setStoreNameDisplay] = useState<string>("");

  // Form states
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [logo, setLogo] = useState(LOGO_PRESETS[0].url);
  const [location, setLocation] = useState("Bangalore");
  const [bankName, setBankName] = useState("");
  const [accountNum, setAccountNum] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleNextStep = () => {
    setErrorMsg("");
    if (currentStep === 1) {
      if (!name.trim() || !description.trim()) {
        setErrorMsg("Please fill out your store name and description.");
        return;
      }
    }
    if (currentStep === 2) {
      if (!location) {
        setErrorMsg("Please select a hyperlocal hub location.");
        return;
      }
    }
    setCurrentStep((prev) => prev + 1);
  };

  const handlePrevStep = () => {
    setErrorMsg("");
    setCurrentStep((prev) => prev - 1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!bankName || !accountNum) {
      setErrorMsg("Please configure bank details to receive simulated payouts.");
      return;
    }

    startTransition(async () => {
      const result = await registerVendor({
        name,
        description,
        logo,
        location
      });

      if (result.success) {
        setStoreNameDisplay(result.storeName || name);
        setIsSubmitted(true);
      } else {
        setErrorMsg(result.error || "Failed to submit vendor application.");
      }
    });
  };

  // Success Application Pending Panel
  if (isSubmitted) {
    return (
      <div className="w-full min-h-screen bg-slate-50 text-slate-900 flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden font-sans">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-indigo-200/30 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="max-w-xl w-full bg-white/80 border border-slate-200/80 p-8 sm:p-10 rounded-3xl backdrop-blur-md shadow-xl flex flex-col items-center text-center gap-6">
          <div className="bg-indigo-50 p-4.5 rounded-full border border-indigo-100 shadow-lg shadow-indigo-500/5 animate-pulse">
            <Hourglass className="h-12 w-12 text-indigo-500" />
          </div>

          <div className="flex flex-col gap-2">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">Application Received!</h1>
            <p className="text-slate-500 text-sm">
              Your store <strong className="text-indigo-600">"{storeNameDisplay}"</strong> has been registered in the database with status: <strong className="text-amber-600">PENDING</strong>.
            </p>
          </div>

          {/* Admin bypass hint alert */}
          <div className="w-full bg-indigo-50/80 border border-indigo-200/60 p-5 rounded-2xl flex flex-col gap-2.5 text-left text-xs">
            <h3 className="font-extrabold text-indigo-700 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-indigo-500" /> Hackathon Judge Shortcut:
            </h3>
            <p className="text-slate-500 leading-relaxed">
              To approve this store instantly and unlock your Vendor Dashboard, sign in as the Platform Administrator using the admin email address (<strong className="text-indigo-600 font-bold">dharmenderchauhan802@gmail.com</strong>) to approve registrations in one click!
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full mt-4">
            <Link 
              href="/"
              className="flex-1 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-sm font-bold py-3.5 rounded-xl transition-all text-center"
            >
              Back to Marketplace
            </Link>
            
            <Link 
              href="/vendor/dashboard"
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-600/10 transition-all flex items-center justify-center gap-2"
            >
              <LayoutDashboard className="h-4.5 w-4.5" /> Open Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      
      {/* Header */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/75 border-b border-slate-200/80 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors">
          <ArrowLeft className="h-5 w-5" />
          <span className="text-sm font-semibold">Back to Hub</span>
        </Link>
        <span className="font-extrabold text-xl text-slate-900">
          Vendor Onboarding Portal
        </span>
        <div className="w-[100px] hidden sm:block text-right text-xs font-bold text-slate-400 uppercase tracking-widest">
          Step {currentStep} of 3
        </div>
      </header>

      {/* Main Wizard Card */}
      <main className="flex-1 w-full max-w-2xl mx-auto px-6 py-16 flex flex-col items-center justify-center">
        <div className="w-full bg-white/80 border border-slate-200/80 p-6 sm:p-8 rounded-3xl backdrop-blur-md shadow-xl flex flex-col gap-6">
          
          {/* Stepper Header */}
          <div className="flex items-center justify-between w-full relative px-10 pb-4 border-b border-slate-100">
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-200 -translate-y-1/2 z-0" />
            <div 
              className="absolute top-1/2 left-0 h-0.5 bg-indigo-500 -translate-y-1/2 z-0 transition-all duration-300"
              style={{ width: `${(currentStep - 1) * 50}%` }}
            />

            {/* Stepper circles */}
            {[1, 2, 3].map((stepNum) => (
              <div 
                key={stepNum}
                className={`relative z-10 p-2.5 rounded-full border transition-all duration-300 ${
                  currentStep >= stepNum
                    ? "bg-indigo-600 border-indigo-400 text-white shadow-md shadow-indigo-500/10"
                    : "bg-white border-slate-200 text-slate-400"
                }`}
              >
                <div className="w-4 h-4 text-xs font-bold flex items-center justify-center">
                  {currentStep > stepNum ? <Check className="h-3 w-3" /> : stepNum}
                </div>
              </div>
            ))}
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-bold flex items-center gap-2">
              <AlertTriangle className="h-4.5 w-4.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* WIZARD FORMS */}

          {/* STEP 1: Store Setup */}
          {currentStep === 1 && (
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <Store className="h-5.5 w-5.5 text-indigo-500" /> Store Profile Setup
                </h2>
                <p className="text-xs text-slate-400 leading-relaxed">Name your store and describe what amazing products you list for nearby buyers.</p>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Store Name</label>
                <input
                  type="text"
                  placeholder="E.g. Delhi Spice Hub"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-white border border-slate-200 hover:border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-xl py-3 px-4 text-sm text-slate-800 placeholder-slate-400 focus:outline-none transition-all shadow-inner"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Store Description</label>
                <textarea
                  rows={4}
                  placeholder="E.g. Traditional hand-blended organic Indian spices sourced from local organic cultivators. Fastest delivery in New Delhi."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="bg-white border border-slate-200 hover:border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-xl py-3 px-4 text-sm text-slate-800 placeholder-slate-400 focus:outline-none transition-all resize-none leading-relaxed shadow-inner"
                />
              </div>
            </div>
          )}

          {/* STEP 2: Location Hub & Branding Presets */}
          {currentStep === 2 && (
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <MapPin className="h-5.5 w-5.5 text-indigo-500" /> Hyperlocal Hub & Branding
                </h2>
                <p className="text-xs text-slate-400 leading-relaxed">Select your operational base city hub and pick a professional logo theme preset.</p>
              </div>

              {/* Hub city selection */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Select Hub Location</label>
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="bg-white border border-slate-200 hover:border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-xl py-3.5 px-4 text-sm text-slate-800 focus:outline-none transition-all cursor-pointer shadow-inner"
                >
                  <option value="Bangalore">Bangalore Tech Hub</option>
                  <option value="Srinagar">Srinagar Spices Hub</option>
                  <option value="Mumbai">Mumbai Gadgets Hub</option>
                  <option value="Delhi">Delhi Decor Hub</option>
                  <option value="Pune">Pune Fresh Hub</option>
                </select>
              </div>

              {/* Logo preset picker */}
              <div className="flex flex-col gap-2.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Choose Store Theme Logo</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {LOGO_PRESETS.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => setLogo(preset.url)}
                      className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all cursor-pointer ${
                        logo === preset.url
                          ? "bg-indigo-50 border-indigo-300 shadow-sm"
                          : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm"
                      }`}
                    >
                      <div className="w-12 h-12 rounded-lg overflow-hidden border border-slate-200">
                        <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" />
                      </div>
                      <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider text-center">{preset.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Payout Details Configuration */}
          {currentStep === 3 && (
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <CreditCard className="h-5.5 w-5.5 text-indigo-500" /> Bank Payout Account
                </h2>
                <p className="text-xs text-slate-400 leading-relaxed">Enter mock bank details to configure automated earnings transfer systems.</p>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Bank Name</label>
                <input
                  type="text"
                  placeholder="E.g. State Bank of India"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="bg-white border border-slate-200 hover:border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-xl py-3 px-4 text-sm text-slate-800 placeholder-slate-400 focus:outline-none transition-all shadow-inner"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Account Number</label>
                <input
                  type="text"
                  placeholder="E.g. 98765432104820"
                  value={accountNum}
                  onChange={(e) => setAccountNum(e.target.value)}
                  className="bg-white border border-slate-200 hover:border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-xl py-3 px-4 text-sm text-slate-800 placeholder-slate-400 focus:outline-none transition-all shadow-inner"
                />
              </div>
            </div>
          )}

          {/* Wizard Action Buttons */}
          <div className="flex items-center gap-3 pt-6 border-t border-slate-100 w-full mt-2">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={handlePrevStep}
                className="flex-1 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-600 text-xs font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
            )}

            {currentStep < 3 ? (
              <button
                type="button"
                onClick={handleNextStep}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-600/10 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                Continue <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isPending}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-extrabold py-3.5 rounded-xl shadow-lg shadow-indigo-600/10 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Submitting...
                  </>
                ) : (
                  <>
                    Submit Application <Sparkles className="h-4 w-4" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
