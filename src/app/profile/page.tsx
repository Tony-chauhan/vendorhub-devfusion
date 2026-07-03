"use client";

import React, { Suspense } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProfileForm from "@/components/profile/ProfileForm";
import PageTitle from "@/components/PageTitle";

export default function ProfilePage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900">
      <Suspense fallback={<div className="h-20 bg-white border-b border-slate-200" />}>
        <Navbar />
      </Suspense>
      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-10">
        <PageTitle heading="My Profile" text="Manage your account details and preferences" />
        <ProfileForm />
      </main>
      <Footer />
    </div>
  );
}
