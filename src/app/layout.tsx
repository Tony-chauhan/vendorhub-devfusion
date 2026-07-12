import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";
import { CustomClerkProvider } from "@/lib/clerk-client";
import StoreProvider from "@/app/StoreProvider";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-outfit",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#4f46e5",
};

export const metadata: Metadata = {
  title: "VendorHub | Hyperlocal Multi-Vendor E-Commerce Platform",
  description: "A premium, hyperlocal multi-vendor e-commerce marketplace powered by Next.js, Neon PostgreSQL, Clerk Auth, Inngest background workflows, and Gemini AI. Connecting local vendors with nearby buyers.",
  keywords: ["VendorHub", "hyperlocal", "marketplace", "multi-vendor", "e-commerce", "India", "local sellers", "AI shopping"],
  authors: [{ name: "Team 8 - VH (Dharmender Chauhan & Rishita Sorout)" }],
  openGraph: {
    title: "VendorHub — Hyperlocal Multi-Vendor Marketplace",
    description: "AI-powered hyperlocal marketplace connecting local vendors with nearby buyers. Built with Next.js 16, Neon PostgreSQL, and Gemini AI.",
    url: "https://vendorhub-devfusion.vercel.app",
    siteName: "VendorHub",
    type: "website",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "VendorHub — Hyperlocal Multi-Vendor Marketplace",
    description: "AI-powered hyperlocal marketplace connecting local vendors with nearby buyers.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <CustomClerkProvider>
      <html
        lang="en"
        className={`${outfit.variable} h-full antialiased`}
      >
        <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 font-sans antialiased">
          <StoreProvider>
            <Toaster position="top-center" reverseOrder={false} />
            {children}
          </StoreProvider>
        </body>
      </html>
    </CustomClerkProvider>
  );
}
