"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Lock, User, ShieldAlert } from "lucide-react";
import * as Clerk from "@clerk/nextjs";
import { IS_MOCK_AUTH } from "@/lib/clerk-client";

export default function SignInPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleMockSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (username === "admin@123" && password === "123") {
      // Set cookie for admin
      document.cookie = "mock_user_role=admin; path=/; max-age=86400;";
      window.location.href = "/";
    } else if (username === "buyer@123" && password === "123") {
      // Set cookie for buyer
      document.cookie = "mock_user_role=buyer; path=/; max-age=86400;";
      window.location.href = "/";
    } else {
      setError("Invalid credentials. Use 'admin@123' / '123' for Admin, or 'buyer@123' / '123' for Buyer.");
      setLoading(false);
    }
  };

  if (IS_MOCK_AUTH) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center px-4 relative overflow-hidden">
        {/* Futuristic glowing backgrounds */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />

        <Link
          href="/"
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-400 hover:text-indigo-400 mb-8 transition-colors z-10"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to home</span>
        </Link>

        <div className="w-full max-w-md bg-slate-950/40 backdrop-blur-xl border border-slate-800/80 rounded-3xl shadow-2xl p-8 z-10 space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-extrabold text-white tracking-tight bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Mock Secure Portal
            </h1>
            <p className="text-xs font-semibold text-slate-400">
              Evaluation mode active. Enter mock credentials below.
            </p>
          </div>

          <form onSubmit={handleMockSignIn} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold rounded-2xl flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1">
                Username / Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="admin@123 or buyer@123"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white text-xs rounded-2xl outline-none transition-all placeholder:text-slate-600"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white text-xs rounded-2xl outline-none transition-all placeholder:text-slate-600"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white text-xs font-bold rounded-2xl shadow-lg shadow-indigo-500/20 transition-all outline-none duration-250 cursor-pointer flex items-center justify-center"
            >
              {loading ? "Verifying..." : "Access Dashboard"}
            </button>
          </form>

          <div className="border-t border-slate-850 pt-4 text-center space-y-2">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Quick Reference Credentials
            </p>
            <div className="grid grid-cols-2 gap-2 text-[11px] font-semibold text-slate-400">
              <div className="p-2 bg-slate-900/30 border border-slate-800 rounded-xl">
                <span className="block text-slate-500 text-[9px] uppercase font-bold tracking-wider">Admin</span>
                admin@123 / 123
              </div>
              <div className="p-2 bg-slate-900/30 border border-slate-800 rounded-xl">
                <span className="block text-slate-500 text-[9px] uppercase font-bold tracking-wider">Buyer</span>
                buyer@123 / 123
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4 py-12">
      <Link
        href="/"
        className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 mb-8 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to home</span>
      </Link>
      <Clerk.SignIn
        routing="path"
        path="/sign-in"
        signUpUrl="/sign-up"
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "shadow-xl border border-slate-200 rounded-3xl",
          },
        }}
      />
    </div>
  );
}
