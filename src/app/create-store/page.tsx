'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Store, Upload, CheckCircle2, ShieldAlert, ArrowLeft, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Banner from '@/components/Banner';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { assets } from '@/assets/assets';

export default function CreateStorePage() {
  const router = useRouter();

  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [storeLogo, setStoreLogo] = useState<File | null>(null);
  const [storeInfo, setStoreInfo] = useState({
    name: '',
    username: '',
    description: '',
    email: '',
    contact: '',
    address: '',
  });

  const onChangeHandler = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setStoreInfo({ ...storeInfo, [e.target.name]: e.target.value });
  };

  const onSubmitHandler = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!storeInfo.username || !storeInfo.name || !storeInfo.email) {
      toast.error('Please fill in all required primary fields.');
      return;
    }

    const submissionPromise = new Promise((resolve) => {
      setTimeout(() => {
        setAlreadySubmitted(true);
        resolve(true);
      }, 1500);
    });

    toast.promise(submissionPromise, {
      loading: 'Onboarding storefront into hyperlocal node...',
      success: () => {
        // Automatically redirect to vendor page after 3 seconds
        setTimeout(() => {
          router.push('/store');
        }, 3000);
        return 'Store registration submitted successfully for review!';
      },
      error: 'Onboarding failed.',
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900">
      <Banner />
      <Suspense fallback={<div className="h-20 bg-white border-b border-slate-200" />}>
        <Navbar />
      </Suspense>

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {!alreadySubmitted ? (
          <div className="max-w-xl mx-auto bg-white border border-slate-200/60 rounded-3xl p-6 sm:p-10 shadow-md space-y-8 animate-in fade-in duration-300">
            {/* Header info */}
            <div className="space-y-2 text-center">
              <div className="w-12 h-12 bg-indigo-50 border border-indigo-100 text-indigo-650 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                <Store className="w-6 h-6" />
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight pt-2">
                Onboard Your Local Store
              </h1>
              <p className="text-xs text-slate-400 font-semibold max-w-md mx-auto leading-relaxed">
                Submit your storefront details for verification. Once approved, you can list products, set dynamic coupons, and track earnings.
              </p>
            </div>

            <form onSubmit={onSubmitHandler} className="space-y-4 text-xs font-semibold text-slate-500">
              {/* Logo Upload Box */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Store Logo / Branding
                </span>
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-200 hover:border-indigo-500/50 bg-slate-50/50 hover:bg-slate-50 rounded-2xl cursor-pointer transition-all duration-300 relative overflow-hidden group">
                  {storeLogo ? (
                    <div className="relative w-full h-full p-4 flex items-center justify-center">
                      <Image
                        src={URL.createObjectURL(storeLogo)}
                        alt="Store Logo Preview"
                        fill
                        className="object-contain p-2"
                      />
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Upload className="w-6 h-6 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                      <span className="text-[11px] text-slate-450 font-bold group-hover:text-indigo-650 transition-colors">
                        Click to upload branding image
                      </span>
                      <span className="text-[9px] text-slate-400 font-medium">
                        Supports JPEG, PNG, or WEBP up to 2MB
                      </span>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setStoreLogo(e.target.files[0]);
                      }
                    }}
                    hidden
                  />
                </label>
              </div>

              {/* Username field */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Store Username handle
                </label>
                <input
                  name="username"
                  onChange={onChangeHandler}
                  value={storeInfo.username}
                  type="text"
                  placeholder="e.g. happyshop"
                  className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-850 transition-all font-semibold placeholder:text-slate-400"
                  required
                />
              </div>

              {/* Store Name field */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Store Business Name
                </label>
                <input
                  name="name"
                  onChange={onChangeHandler}
                  value={storeInfo.name}
                  type="text"
                  placeholder="e.g. Happy Shop Electronics"
                  className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-850 transition-all font-semibold placeholder:text-slate-400"
                  required
                />
              </div>

              {/* Description field */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Business Description
                </label>
                <textarea
                  name="description"
                  onChange={onChangeHandler}
                  value={storeInfo.description}
                  rows={4}
                  placeholder="Describe your inventory and delivery values..."
                  className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-850 transition-all font-semibold placeholder:text-slate-400 resize-none"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Email field */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Contact Email
                  </label>
                  <input
                    name="email"
                    onChange={onChangeHandler}
                    value={storeInfo.email}
                    type="email"
                    placeholder="merchant@example.com"
                    className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-850 transition-all font-semibold placeholder:text-slate-400"
                    required
                  />
                </div>

                {/* Contact phone field */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Phone Number
                  </label>
                  <input
                    name="contact"
                    onChange={onChangeHandler}
                    value={storeInfo.contact}
                    type="text"
                    placeholder="+1 234 567 890"
                    className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-850 transition-all font-semibold placeholder:text-slate-400"
                    required
                  />
                </div>
              </div>

              {/* Physical Address field */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Physical Storefront Address
                </label>
                <textarea
                  name="address"
                  onChange={onChangeHandler}
                  value={storeInfo.address}
                  rows={3}
                  placeholder="Include street, building number, and city..."
                  className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-850 transition-all font-semibold placeholder:text-slate-400 resize-none"
                  required
                />
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full py-3.5 bg-slate-900 hover:bg-slate-950 text-white font-bold text-xs rounded-full shadow-md hover:scale-[1.02] active:scale-95 transition-all cursor-pointer flex items-center justify-center space-x-2"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Onboard Physical Storefront</span>
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="max-w-md mx-auto bg-white border border-slate-200/60 rounded-3xl p-8 sm:p-12 text-center flex flex-col items-center justify-center space-y-5 shadow-md animate-in fade-in zoom-in-95 duration-300 my-12">
            <div className="w-14 h-14 bg-indigo-50 border border-indigo-100 text-indigo-650 rounded-2xl flex items-center justify-center shadow-sm">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
            </div>
            <h2 className="text-lg font-extrabold text-slate-850">Verification in Progress</h2>
            <p className="text-xs text-slate-500 leading-relaxed max-w-sm font-semibold">
              Your store is currently being initialized by our local hub node. You are being redirected to your Merchant Dashboard in 3 seconds...
            </p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
