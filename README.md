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

## 📋 Implementation Phases

| Phase | Weeks | Focus | Status |
| :--- | :--- | :--- | :--- |
| Phase 1 | 1–2 | Core Stability & Security | ✅ Complete |
| Phase 2 | 3–4 | Marketplace Completion | ✅ Complete |
| Phase 3 | 5–6 | Vendor Trust & Communication | ✅ Complete |
| Phase 4 | 7–8 | Polishing & Final Readiness | ✅ Complete |

---

## 🚀 Key Feature Highlights & Capabilities

### 1. 🔮 Dual-Engine Google Gemini AI Integration
*   **AI-Enhanced Fuzzy Search & Synonym Extender:** Expanding buyer queries in real time using natural language reasoning (e.g., searching for "kesar" automatically returns Srinagar Saffron, organic teas, and mountain spices).
*   **AI Product Curation & 1-Click Confetti Bundling:** Asynchronously analyzes active product selections to suggest premium companion curations, giving buyers a **1-click bundle purchase option** that triggers visual checkout fireworks bursts!
*   **AI Pricing & Marketing Copy Advisor:** Empowers local sellers. In the Vendor Dashboard, sellers can input a product name and category, and the Gemini-powered advisor instantly recommends competitive prices, optimizes descriptive SEO-focused marketing copy, and delivers local market demand insights.
*   **Failsafe Dual-Architecture Fallback:** In the absence of live Gemini credentials, a highly advanced local NLP and semantic dictionary mock-engine activates instantly, guaranteeing 100% functionality and fast execution for judges.

### 2. 🔐 Multi-Tenant Identity & Security
*   Seamless role separation (**Buyer, Vendor, Admin**) mapped securely via custom route guards (`/admin`, `/vendor`, `/checkout`, `/cart`).
*   Auto-promotes the team leader's email to `ADMIN` upon database registration to ease evaluation.
*   **AES-256-GCM encryption** for sensitive bank details at rest (see `src/lib/crypto.ts`).
*   **Upstash Redis rate limiting** on all server actions with in-memory fallback for development.
*   **Zod validation** on every server action input (see `src/lib/validations.ts`).
*   **Immutable audit logging** for all admin-privileged mutations (see `AdminAuditLog` model).

### 3. ⚡ Asynchronous Background Processing (Inngest)
*   **Clerk Sync Webhook Broker:** Synchronizes user registrations, profile updates, and deletions from Clerk directly into Neon PostgreSQL asynchronously.
*   **Low-Stock Audit Scan:** Monitors vendor inventory levels in real-time when purchases are completed, warning vendors inside their dashboards of pending stock depletions.
*   **Weekly Automated Vendor Payouts:** Scheduled cron job calculates outstanding balances and creates payout records for approved stores.

### 4. 📂 Fast Media Delivery (ImageKit.io CDN)
*   Uses client-side secure signature tokens to upload multiple high-resolution product photos directly to ImageKit servers, ensuring immediate optimization and rapid global CDN distribution.

### 5. 💳 Live Payment Integration
*   **Razorpay** integration with full order lifecycle: creation → hosted checkout → HMAC signature verification → webhook confirmation.
*   **Cash on Delivery** fallback for buyers without digital payment methods.
*   **Sandbox simulation** mode with realistic payment gateway UI when Razorpay credentials are absent.

### 6. 📩 Transactional Notifications
*   **Email (Resend):** Order confirmations, vendor approvals, refund decisions, low-stock alerts, payout notifications.
*   **SMS (Twilio):** Order status updates (configurable).
*   Both gracefully degrade to console logging in development when API keys are absent.

### 7. 🏪 Vendor Trust & Verification
*   **GST/PAN verification** with format validation and provider-ready API integration (Surepass/Signzy/Cashfree compatible).
*   **Bank detail encryption** using AES-256-GCM with masked display in admin views.
*   **Multi-step onboarding** with admin approval workflow.

### 8. 🎨 Premium Futuristic Slate Glassmorphic UI/UX
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
| **Razorpay** | Live Payment Gateway (UPI, Card, Netbanking) |
| **Resend** | Transactional Email Delivery |
| **Twilio** | SMS Notifications |
| **Upstash Redis** | Distributed Rate Limiting |
| **Zod** | Runtime Input Validation |
| **Tailwind CSS v4 & PostCSS** | Modern High-Speed Styling & CSS Variables |
| **Framer Motion** | Physics-Based Client Micro-Animations |
| **Recharts** | Interactive Analytics Area & Line Plots |
| **Canvas Confetti** | Delightful Checkout Celebration |
| **Vitest** | Unit Testing Framework |

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
    AdminAuditLog }o--|| User : "tracked by"
```

*   **User:** Mapped to Clerk profiles; holds roles (`BUYER`, `VENDOR`, `ADMIN`). Cart persistence via JSON-serialized `cartData` field.
*   **Store:** Linked to a VENDOR; captures geographical location, GST/PAN verification status, bank details (encrypted), and commission rate.
*   **Product:** Holds price, stock, ImageKit CDN links, and category. Inherits store location tags for fast spatial queries. Indexed on `(category, price, createdAt, storeId, name)`.
*   **Order & OrderItem:** Captures buy totals, net payouts (after commission deductions), delivery address, payment gateway/status, and Razorpay transaction IDs.
*   **Refund & Payout:** Administrative desks for handling user complaints and payouts history.
*   **AdminAuditLog:** Immutable trail of every admin-privileged mutation with full metadata.

---

## 📂 Project Structure Map

```text
vendor-hub/
├── prisma/
│   └── schema.prisma         # Neon Postgres schema definitions (10 models, 20+ indexes)
├── src/
│   ├── app/
│   │   ├── actions/           # Type-Safe Server Actions
│   │   │   ├── admin.ts       # Store approval, refunds, payouts, role management, audit log
│   │   │   ├── ai.ts          # Gemini AI search expansion, pricing advisor, recommendations
│   │   │   ├── cart.ts        # Cart persistence (localStorage + DB sync)
│   │   │   ├── orders.ts      # Order creation, Razorpay verification, status updates, refunds
│   │   │   ├── products.ts    # CRUD, server-side search with pagination, vendor analytics
│   │   │   ├── reviews.ts     # Product review creation & retrieval
│   │   │   ├── users.ts       # User profile management
│   │   │   ├── vendors.ts     # Vendor store registration with GST/PAN verification
│   │   │   └── wishlist.ts    # Wishlist toggle
│   │   ├── admin/             # Administrative dashboards (approval queue, audit log, refunds, stores)
│   │   ├── api/               # API routes (ImageKit signature, Inngest endpoint, webhooks)
│   │   ├── checkout/          # Checkout wizard with Razorpay/COD + sandbox simulation
│   │   ├── orders/            # Visual order status tracking with steppers
│   │   ├── product/           # Product detail pages with reviews
│   │   ├── shop/              # Buyer product browsing with AI-powered search
│   │   ├── store/             # Vendor dashboard, inventory management, order fulfillment
│   │   ├── vendor/register/   # Multi-step vendor onboarding
│   │   ├── profile/           # User profile management
│   │   ├── globals.css        # Tailwind v4 globals & premium slate themes
│   │   ├── layout.tsx         # Root layout with SEO meta, Clerk & Redux providers
│   │   └── page.tsx           # Buyer landing interface
│   ├── components/
│   │   ├── admin/             # Admin layout, sidebar, dashboard, store info
│   │   ├── store/             # Vendor layout, sidebar, inventory dashboard
│   │   ├── profile/           # Profile components
│   │   ├── Navbar.tsx         # Main navigation with role-aware menus
│   │   ├── ProductCard.tsx    # Reusable product card component
│   │   ├── ProductDetails.tsx # Product detail with AI recommendations
│   │   ├── OrdersAreaChart.tsx # Recharts analytics visualization
│   │   └── ...                # Banner, Hero, Footer, Newsletter, etc.
│   ├── lib/
│   │   ├── prisma.ts          # Serverless database Pg connection pool
│   │   ├── env.ts             # Centralized mock-mode detection & admin identity
│   │   ├── validations.ts     # Zod schemas for all server action inputs
│   │   ├── rate-limit.ts      # Upstash Redis + in-memory sliding-window rate limiter
│   │   ├── crypto.ts          # AES-256-GCM encryption for bank details
│   │   ├── audit-log.ts       # Immutable admin audit trail helper
│   │   ├── commission.ts      # Multi-vendor per-line-item commission calculation
│   │   ├── order-status.ts    # Order status transition validation
│   │   ├── payouts.ts         # Vendor payout calculation & recording
│   │   ├── gst-verification.ts # GSTIN format + provider API verification
│   │   ├── razorpay.ts        # Razorpay client initialization
│   │   ├── imagekit.ts        # Secure ImageKit file upload configs
│   │   ├── clerk-server.ts    # Clerk server-side utilities & role sync
│   │   ├── clerk-client.tsx   # Clerk client provider wrapper
│   │   ├── store.ts           # Redux store configuration
│   │   ├── notifications/
│   │   │   ├── email.ts       # Resend transactional emails (5 templates)
│   │   │   └── sms.ts         # Twilio SMS notifications
│   │   ├── inngest/
│   │   │   ├── client.ts      # Inngest client initialization
│   │   │   └── functions.ts   # Background jobs (user sync, low-stock, payouts)
│   │   └── features/
│   │       └── cart/           # Redux cart slice with localStorage persistence
│   └── proxy.ts               # Next.js 16 authentication route guards
├── vitest.config.ts           # Test runner configuration
├── package.json
└── README.md
```

---

## 🔒 Security Architecture

| Layer | Implementation |
| :--- | :--- |
| **Authentication** | Clerk Auth with OAuth, session tokens, and webhook-synced DB profiles |
| **Authorization** | DB-role-based access control (`User.role` is sole source of truth) |
| **Input Validation** | Zod schemas on every server action — GSTIN, PAN, IFSC, UUID, amounts |
| **Rate Limiting** | Upstash Redis (distributed) with in-memory fallback; 20 req/min for actions |
| **Encryption** | AES-256-GCM at rest for bank account numbers |
| **Audit Trail** | Immutable `AdminAuditLog` for all admin mutations |
| **Payment Security** | HMAC-SHA256 signature verification for Razorpay; card data never touches servers |

---

## 🧪 Testing

VendorHub includes a comprehensive unit test suite covering core business logic:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Type-check without building
npm run typecheck
```

**Test coverage includes:**
- Zod validation schemas (vendor registration, search, orders, refunds, admin actions)
- Commission calculation (multi-vendor carts, custom rates, edge cases)
- Cryptographic operations (AES-256-GCM encrypt/decrypt, masking, tamper detection)
- Rate limiting (in-memory sliding window, independent tracking)
- Order status transitions (forward-only state machine)
- GST verification (format validation, provider fallback)
- Environment configuration (mock detection, role resolution)
- Email templates (all 5 transactional email templates)

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

# Admin Identity (auto-promoted to ADMIN role on registration)
ADMIN_EMAIL="your_admin_email@example.com"

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
NEXT_PUBLIC_RAZORPAY_KEY_ID="rzp_test_yourkey"
RAZORPAY_KEY_SECRET="your_razorpay_key_secret"
RAZORPAY_WEBHOOK_SECRET="your_razorpay_webhook_secret"

# Upstash Redis (distributed rate limiting)
UPSTASH_REDIS_REST_URL="your_upstash_url"
UPSTASH_REDIS_REST_TOKEN="your_upstash_token"

# Transactional Email (Resend)
RESEND_API_KEY="your_resend_api_key"
RESEND_FROM_EMAIL="VendorHub <no-reply@yourdomain.com>"

# SMS Notifications (Twilio)
TWILIO_ACCOUNT_SID="your_twilio_sid"
TWILIO_AUTH_TOKEN="your_twilio_token"
TWILIO_FROM_NUMBER="+1234567890"

# Bank Detail Encryption (generate with: node -e "console.log(require('crypto').randomBytes(32).toString('base64'))")
BANK_DETAILS_ENCRYPTION_KEY="your_base64_encoded_32_byte_key"

# GST Verification API (Surepass/Signzy/Cashfree — optional, falls back to manual review)
GST_VERIFICATION_API_URL=""
GST_VERIFICATION_API_KEY=""

# Currency Symbol
NEXT_PUBLIC_CURRENCY_SYMBOL="₹"
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
