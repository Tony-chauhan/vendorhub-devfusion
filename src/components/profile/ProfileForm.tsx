"use client";

import React, { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import {
  User,
  Mail,
  Shield,
  Store,
  Save,
  Loader2,
  ShoppingBag,
  ArrowRight,
  Calendar,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  getCurrentUserProfile,
  updateUserProfile,
  type UserProfile,
  type UserRole,
} from "@/app/actions/users";

const ROLE_LABELS: Record<UserRole, string> = {
  BUYER: "Buyer",
  VENDOR: "Vendor",
  ADMIN: "Administrator",
};

const ROLE_COLORS: Record<UserRole, string> = {
  BUYER: "bg-sky-100 text-sky-700 border-sky-200",
  VENDOR: "bg-emerald-100 text-emerald-700 border-emerald-200",
  ADMIN: "bg-violet-100 text-violet-700 border-violet-200",
};

export default function ProfileForm() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    getCurrentUserProfile().then((result) => {
      if (result.success) {
        setProfile(result.profile);
        setName(result.profile.name ?? "");
      } else {
        setError(result.error);
      }
      setLoading(false);
    });
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const result = await updateUserProfile({ name });
      if (result.success) {
        setProfile(result.profile);
        toast.success("Profile updated successfully");
      } else {
        toast.error(result.error);
      }
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-4" />
        <p className="text-xs font-semibold text-slate-400 tracking-wider uppercase">
          Loading profile...
        </p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="text-center py-20 space-y-4">
        <p className="text-sm text-rose-600 font-semibold">{error || "Profile not found"}</p>
        <Link
          href="/sign-in"
          className="inline-flex items-center px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-full transition-colors"
        >
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-8 py-10 text-white">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-2xl font-extrabold">
              {name ? name.charAt(0).toUpperCase() : profile.email.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-xl font-extrabold">{name || "Your Profile"}</h1>
              <p className="text-sm text-indigo-100 mt-0.5">{profile.email}</p>
              <span
                className={`inline-flex items-center mt-2 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full border ${ROLE_COLORS[profile.role]}`}
              >
                <Shield className="w-3 h-3 mr-1" />
                {ROLE_LABELS[profile.role]}
              </span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSave} className="p-8 space-y-6">
          <div>
            <label htmlFor="name" className="flex items-center space-x-2 text-xs font-bold text-slate-700 mb-2">
              <User className="w-4 h-4 text-slate-400" />
              <span>Display Name</span>
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
              className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>

          <div>
            <label className="flex items-center space-x-2 text-xs font-bold text-slate-700 mb-2">
              <Mail className="w-4 h-4 text-slate-400" />
              <span>Email Address</span>
            </label>
            <input
              type="email"
              value={profile.email}
              disabled
              className="w-full px-4 py-3 text-sm bg-slate-100 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed"
            />
            <p className="text-[10px] text-slate-400 mt-1.5">Email is managed through your authentication provider.</p>
          </div>

          <div>
            <label className="flex items-center space-x-2 text-xs font-bold text-slate-700 mb-2">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>Member Since</span>
            </label>
            <p className="text-sm text-slate-600 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl">
              {new Date(profile.createdAt).toLocaleDateString("en-IN", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center space-x-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-xs font-bold rounded-full transition-colors cursor-pointer"
          >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{isPending ? "Saving..." : "Save Changes"}</span>
          </button>
        </form>
      </div>

      {profile.role === "BUYER" && (
        <div className="bg-white border border-slate-200 rounded-3xl shadow-sm p-8">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-emerald-50 rounded-xl">
              <Store className="w-6 h-6 text-emerald-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-sm font-extrabold text-slate-900">Become a Vendor</h2>
              <p className="text-xs text-slate-500 mt-1">
                Register your hyperlocal storefront and start selling to neighborhood buyers.
              </p>
              <Link
                href="/vendor/register"
                className="inline-flex items-center space-x-1.5 mt-4 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-full transition-colors"
              >
                <span>Start Vendor Registration</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {profile.role === "VENDOR" && profile.store && (
        <div className="bg-white border border-slate-200 rounded-3xl shadow-sm p-8">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-indigo-50 rounded-xl">
              <ShoppingBag className="w-6 h-6 text-indigo-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-sm font-extrabold text-slate-900">Your Store</h2>
              <p className="text-xs text-slate-500 mt-1">
                {profile.store.name} &middot; {profile.store.location}
              </p>
              <span
                className={`inline-flex mt-2 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full ${
                  profile.store.status === "APPROVED"
                    ? "bg-emerald-100 text-emerald-700"
                    : profile.store.status === "PENDING"
                      ? "bg-amber-100 text-amber-700"
                      : "bg-rose-100 text-rose-700"
                }`}
              >
                {profile.store.status}
              </span>
              <div className="mt-4">
                <Link
                  href="/store"
                  className="inline-flex items-center space-x-1.5 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-full transition-colors"
                >
                  <span>Open Seller Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {profile.role === "ADMIN" && (
        <div className="bg-white border border-slate-200 rounded-3xl shadow-sm p-8">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-violet-50 rounded-xl">
              <Shield className="w-6 h-6 text-violet-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-sm font-extrabold text-slate-900">Admin Console</h2>
              <p className="text-xs text-slate-500 mt-1">
                Manage vendor approvals, platform analytics, and refund requests.
              </p>
              <Link
                href="/admin"
                className="inline-flex items-center space-x-1.5 mt-4 px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold rounded-full transition-colors"
              >
                <span>Open Admin Console</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
