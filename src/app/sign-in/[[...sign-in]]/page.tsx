"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import * as Clerk from "@clerk/nextjs";
import { IS_MOCK_AUTH } from "@/lib/clerk-client";

export default function SignInPage() {
  if (IS_MOCK_AUTH) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-xl p-8 text-center space-y-6">
          <h1 className="text-2xl font-extrabold text-slate-900">Sign In</h1>
          <p className="text-sm text-slate-500">
            Clerk is running in zero-config evaluation mode. You are already signed in as the mock admin user.
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center w-full px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-full transition-colors"
          >
            Continue to VendorHub
          </Link>
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
