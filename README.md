# 🔮 VendorHub — Hyperlocal Multi-Vendor E-Commerce Platform

[![Vercel Deployment](https://img.shields.io/badge/Vercel-Live-green?style=for-the-badge&logo=vercel&logoColor=white&color=000000)](https://vendorhub-devfusion.vercel.app)
[![GitHub Repository](https://img.shields.io/badge/GitHub-Repository-blue?style=for-the-badge&logo=github&logoColor=white&color=181717)](https://github.com/Tony-chauhan/vendorhub-devfusion)
[![Next.js](https://img.shields.io/badge/Next.js-16.2.6-black?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org)

Welcome to **VendorHub**, a premium, AI-powered hyperlocal multi-vendor e-commerce marketplace built for the **DevFusion 2.0 Hackathon**. Engineered with serverless relational architecture, asynchronous event-driven worker queues, optimized media delivery CDNs, and state-of-the-art Generative AI integrations, VendorHub connects local storefronts with neighborhood buyers seamlessly.

Developed with 💜 by **TeamXdesign**:
*   **Dharmender Chauhan** — Team Leader & Lead Full-Stack Architect
*   **Rishita Sorout** — Team Member & UI/UX Design Specialist

---

## 🌐 Live Production Cloud Link
🔗 **Official Live Platform:** **[https://vendorhub-devfusion.vercel.app](https://vendorhub-devfusion.vercel.app)**  
*Deployed natively on the Next.js serverless environment with secure CDN asset delivery.*

---

## 🚀 Key Feature Highlights & Capabilities

### 1. 🔮 Dual-Engine Google Gemini AI Integration
*   **AI-Enhanced Fuzzy Search & Synonym Extender:** Expanding buyer queries in real time using natural language reasoning (e.g., searching for "kesar" automatically returns Srinagar Saffron, organic teas, and mountain spices).
*   **AI Product Curation & 1-Click Confetti Bundling:** Asynchronously analyzes active product selections to suggest premium companion curations, giving buyers a **1-click bundle purchase option** that triggers visual checkout fireworks bursts!
*   **AI Pricing & Marketing Copy Advisor:** Empowers local sellers. In the Vendor Dashboard, sellers can input a product name and category, and the Gemini-powered advisor instantly recommends competitive prices, optimizes descriptive SEO-focused marketing copy, and delivers local market demand insights.
*   **Failsafe Dual-Architecture Fallback:** In the absence of live Gemini credentials, a highly advanced local NLP and semantic dictionary mock-engine activates instantly, guaranteeing 100% functionality and fast execution for judges.

### 2. 🔐 Multi-Tenant Identity & Clerk Auth
*   Seamless role separation (**Buyer, Vendor, Admin**) mapped securely via custom route guards (`/admin`, `/vendor`, `/checkout`, `/cart`).
*   Auto-promotes the team leader's email to `ADMIN` upon database registration to ease evaluation, granting administrative desks full oversight.

### 3. ⚡ Asynchronous Background Processing (Inngest)
*   **Clerk Sync Webhook Broker:** Synchronizes user registrations, profile updates, and deletions from Clerk directly into Neon PostgreSQL asynchronously.
*   **Low-Stock Audit Scan:** Monitors vendor inventory levels in real-time when purchases are completed, warning vendors inside their dashboards of pending stock depletions.

### 4. 📂 Fast Media Delivery (ImageKit.io CDN)
*   Uses client-side secure signature tokens to upload multiple high-resolution product photos directly to ImageKit servers, ensuring immediate optimization and rapid global CDN distribution.

### 5. 🎨 Premium Futuristic Slate Glassmorphic UI/UX
*   Stunning light-mode accents with elegant violet and indigo glows, smooth hover scaling, micro-animations, Recharts analytics, step-by-step parcel tracking steppers, and interactive confetti upon checkouts.

---

## 🛠️ Technology Stack

| Technology | Role |
| :--- | :--- |
| **Next.js 16 (App Router)** | Core React Server/Client Framework & Router |
| **Neon PostgreSQL** | Serverless Relational Database Hub |
| **Prisma ORM & pg Adapter** | Strict Type-Safe Relational Queries & Pooling |
| **Clerk Auth** | Multi-tenant Identity Management |
| **Inngest Engine v4** | Event-Driven Background Worker Queue |
| **Google Gemini AI SDK** | Advanced Natural Language Query & Curation |
| **ImageKit.io Node SDK** | Fast Media Optimization & CDN Delivery |
| **Tailwind CSS v4 & PostCSS** | Modern High-Speed Styling & CSS Variables |
| **Framer Motion** | Physics-Based Client Micro-Animations |
| **Recharts** | Interactive Analytics Area & Line Plots |
| **Canvas Confetti** | Delightful Checkout Celebration |

---

## 📐 Relational Database Schema Architecture

The database is built on **Neon serverless Postgres** using **Prisma ORM**. It features highly integrated relational models that manage hyperlocal geographical operations:

```mermaid
erDiagram
    User ||--o| Store : "owns (1:1)"
    User ||--o{ Order : "buys (1:N)"
    User ||--o{ Review : "writes"
    Store ||--o{ Product : "catalog (1:N)"
    Store ||--o{ Payout : "claims"
    Product ||--o{ OrderItem : "contains"
    Product ||--o{ Review : "receives"
    Order ||--o{ OrderItem : "comprises"
    Order ||--o| Refund : "requests"
```

*   **User:** Mapped to Clerk profiles; holds roles (`BUYER`, `VENDOR`, `ADMIN`).
*   **Store:** Linked to a VENDOR; captures geographical location coordinates for hyperlocal proximity indexing.
*   **Product:** Holds price, stock, ImageKit CDN links, and category. Inherits store location tags for fast spatial queries.
*   **Order & OrderItem:** Captures buy totals, net payouts (after admin commission deductions), delivery address, and transaction states.
*   **Refund & Payout:** Administrative desks for handling user complaints and payouts history.

---

## 📂 Project Structure Map

```text
vendor-hub/
├── prisma/
│   ├── schema.prisma         # Neon Postgres schema definitions
│   └── migrations/           # Historical migration directories
├── src/
│   ├── app/
│   │   ├── actions/          # Type-Safe Server Actions (Products, Orders, AI, Admin)
│   │   ├── admin/            # Administrative verification dashboards
│   │   ├── api/              # API router gateways (ImageKit signature, Inngest endpoints)
│   │   ├── checkout/         # Checkout wizards and confetti checkouts
│   │   ├── orders/           # visual order status package steppers
│   │   ├── vendor/           # Store onboard registrations and analytics
│   │   ├── globals.css       # Tailwind v4 globals & premium slate themes
│   │   ├── layout.tsx        # HTML root shell and Clerk Provider
│   │   └── page.tsx          # Buyer landing interface entry point
│   ├── components/
│   │   └── ProductBrowse.tsx # Glassmorphic search browsing & AI rec modal
│   ├── lib/
│   │   ├── prisma.ts         # Serverless database Pg connection pool
│   │   ├── imagekit.ts       # Secure ImageKit file upload configs
│   │   └── inngest/          # Background worker client and triggers
│   └── proxy.ts              # Next.js 16 authentication route guards (renamed from middleware.ts)
```

---

## 🚀 Quick Start Guide (Local Development Setup)

Follow these steps to run the VendorHub platform locally:

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/Tony-chauhan/vendorhub-devfusion.git
cd vendorhub-devfusion
npm install
```

### 2. Configure Environment Variables (`.env`)
Create a `.env` file in the root workspace and add the following config (the platform includes intelligent sandbox mocks for Clerk, Inngest, ImageKit, and Gemini so it runs perfectly even with test variables):

```env
# Database Connection (Neon serverless PostgreSQL URL)
DATABASE_URL="postgresql://neondb_owner:YOUR_KEY@ep-host.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"

# Clerk Authentication Keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_yourkey"
CLERK_SECRET_KEY="sk_test_yourkey"
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"

# Inngest Background Queue Configuration
INNGEST_EVENT_KEY="your_inngest_event_key"
INNGEST_SIGNING_KEY="your_inngest_signing_key"

# ImageKit.io CDN Configurations
NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY="public_yourkey"
IMAGEKIT_PRIVATE_KEY="private_yourkey"
NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT="https://ik.imagekit.io/your_endpoint/"

# Google Gemini AI API Configuration
GEMINI_API_KEY="your_gemini_api_key"

# Razorpay Payment Gateway (Test/Sandbox keys from dashboard.razorpay.com)
# Without these, Razorpay/UPI checkout falls back to a simulated instant
# success and no real payment gateway is contacted.
NEXT_PUBLIC_RAZORPAY_KEY_ID="rzp_test_yourkey"
RAZORPAY_KEY_SECRET="your_razorpay_key_secret"
RAZORPAY_WEBHOOK_SECRET="your_razorpay_webhook_secret"
```

### 3. Deploy Database Schema
Push our models directly to the Neon Serverless Postgres instance:
```bash
npx prisma db push
```

### 4. Boot Dev Servers
Run the development environment locally:
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser to interact with the platform!

---

*Developed with 💜 by TeamXdesign for DevFusion 2.0 Hackathon.*
