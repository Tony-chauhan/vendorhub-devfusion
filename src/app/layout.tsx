import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: "VendorHub | Hyperlocal Multi-Vendor E-Commerce Platform",
  description: "A premium, hyperlocal multi-vendor e-commerce marketplace powered by Next.js, Neon PostgreSQL, Clerk Auth, Inngest background workflows, and Gemini AI.",
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
