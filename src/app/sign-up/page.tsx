"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ShoppingBag, Store, Check } from "lucide-react";
import * as Clerk from "@clerk/nextjs";
import { IS_MOCK_AUTH } from "@/lib/clerk-client";
import { completeRegistration, type RegistrationIntent } from "@/app/actions/users";

export const REGISTRATION_INTENT_KEY = "vendorhub_registration_intent";

const ROLE_OPTIONS: Array<{
  id: RegistrationIntent;
  title: string;
  description: string;
  icon: React.ReactNode;
}> = [
  {
    id: "BUYER",
    title: "Shop as Buyer",
    description: "Browse hyperlocal stores, add items to cart, and track your orders.",
    icon: <ShoppingBag className="w-6 h-6" />,
  },
  {
    id: "VENDOR",
    title: "Sell as Vendor",
    description: "Register your storefront, list products, and reach neighborhood buyers.",
    icon: <Store className="w-6 h-6" />,
  },
];

export default function SignUpPage() {
  const router = useRouter();
  const [step, setStep] = useState<"role" | "signup">("role");
  const [selectedRole, setSelectedRole] = useState<RegistrationIntent>("BUYER");

  const handleRoleContinue = () => {
    sessionStorage.setItem(REGISTRATION_INTENT_KEY, selectedRole);
    setStep("signup");
  };

  const handleMockSignUp = async () => {
    sessionStorage.setItem(REGISTRATION_INTENT_KEY, selectedRole);
    const result = await completeRegistration(selectedRole);
    if (result.success) {
      router.push(result.redirectTo);
    }
  };

  if (step === "role") {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4 py-12">
        <Link
          href="/"
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to home</span>
        </Link>

        <div className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl shadow-xl p-8 space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-extrabold text-slate-900">Create your account</h1>
            <p className="text-sm text-slate-500">Choose how you want to use VendorHub</p>
          </div>

          <div className="space-y-3">
            {ROLE_OPTIONS.map((option) => {
              const isSelected = selectedRole === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setSelectedRole(option.id)}
                  className={`w-full flex items-start space-x-4 p-4 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                    isSelected
                      ? "border-indigo-600 bg-indigo-50/50 shadow-sm"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <div
                    className={`p-2.5 rounded-xl ${
                      isSelected ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {option.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-slate-900">{option.title}</h3>
                      {isSelected && <Check className="w-4 h-4 text-indigo-600 shrink-0" />}
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{option.description}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {IS_MOCK_AUTH ? (
            <button
              onClick={handleMockSignUp}
              className="w-full px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-full transition-colors cursor-pointer"
            >
              Continue in Evaluation Mode
            </button>
          ) : (
            <button
              onClick={handleRoleContinue}
              className="w-full px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-full transition-colors cursor-pointer"
            >
              Continue to Sign Up
            </button>
          )}

          <p className="text-center text-xs text-slate-500">
            Already have an account?{" "}
            <Link href="/sign-in" className="text-indigo-600 font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    );
  }

  if (IS_MOCK_AUTH) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4 py-12">
      <button
        onClick={() => setStep("role")}
        className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 mb-8 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Change account type</span>
      </button>

      <Clerk.SignUp
        routing="hash"
        signInUrl="/sign-in"
        forceRedirectUrl="/sign-up/complete"
        unsafeMetadata={{ registrationIntent: selectedRole }}
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
