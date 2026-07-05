import {
  Document, Packer, Paragraph, Table, TableRow, TableCell,
  TextRun, HeadingLevel, AlignmentType, WidthType, BorderStyle,
  ShadingType, convertInchesToTwip, TableLayoutType, VerticalAlign,
} from "docx";
import { writeFileSync } from "fs";

// ── colour palette ──────────────────────────────────────────────────────────
const BLUE       = "2E4BC6";
const LIGHT_BLUE = "EEF1FB";
const GREEN      = "1A7A4A";
const LIGHT_GREEN= "E6F4EE";
const WHITE      = "FFFFFF";
const DARK       = "1A1A2E";
const GREY_BG    = "F5F7FF";

// ── helpers ─────────────────────────────────────────────────────────────────
const bold = (text, size = 22, color = DARK) =>
  new TextRun({ text, bold: true, size, color, font: "Calibri" });

const normal = (text, size = 20, color = DARK) =>
  new TextRun({ text, size, color, font: "Calibri" });

const para = (children, align = AlignmentType.LEFT, spacing = { after: 120 }) =>
  new Paragraph({ children: Array.isArray(children) ? children : [children], alignment: align, spacing });

const heading = (text, level = HeadingLevel.HEADING_2, color = BLUE) =>
  new Paragraph({
    children: [new TextRun({ text, bold: true, size: 26, color, font: "Calibri" })],
    heading: level,
    spacing: { before: 240, after: 120 },
    border: { bottom: { color: BLUE, size: 6, style: BorderStyle.SINGLE } },
  });

const subheading = (text) =>
  new Paragraph({
    children: [new TextRun({ text, bold: true, size: 22, color: BLUE, font: "Calibri" })],
    spacing: { before: 180, after: 80 },
  });

const bullet = (text, level = 0) =>
  new Paragraph({
    children: [normal(text)],
    bullet: { level },
    spacing: { after: 60 },
  });

const cell = (text, {
  bold: isBold = false, bg = WHITE, color = DARK,
  align = AlignmentType.LEFT, size = 18, width,
} = {}) =>
  new TableCell({
    children: [new Paragraph({
      children: [new TextRun({ text, bold: isBold, size, color, font: "Calibri" })],
      alignment: align,
      spacing: { before: 60, after: 60 },
    })],
    shading: bg !== WHITE ? { type: ShadingType.CLEAR, fill: bg } : undefined,
    margins: { top: 60, bottom: 60, left: 100, right: 100 },
    verticalAlign: VerticalAlign.CENTER,
    width: width ? { size: width, type: WidthType.PERCENTAGE } : undefined,
  });

const headerRow = (cols) =>
  new TableRow({
    children: cols.map(([text, width]) =>
      cell(text, { bold: true, bg: BLUE, color: WHITE, size: 18, width })),
    tableHeader: true,
  });

const dataRow = (cols, even = false) =>
  new TableRow({
    children: cols.map(([text, width, opts]) =>
      cell(text, { bg: even ? LIGHT_BLUE : WHITE, size: 18, width, ...opts })),
  });

const checkRow = (cols, even = false) =>
  new TableRow({
    children: cols.map(([text, width, opts]) =>
      cell(text, { bg: even ? LIGHT_BLUE : WHITE, size: 18, width, ...opts })),
  });

// ── document ─────────────────────────────────────────────────────────────────
const doc = new Document({
  styles: {
    default: {
      document: {
        run: { font: "Calibri", size: 20, color: DARK },
        paragraph: { spacing: { after: 120 } },
      },
    },
  },
  sections: [{
    properties: {
      page: {
        margin: {
          top: convertInchesToTwip(1),
          bottom: convertInchesToTwip(1),
          left: convertInchesToTwip(1.1),
          right: convertInchesToTwip(1.1),
        },
      },
    },
    children: [

      // ── TITLE BLOCK ────────────────────────────────────────────────────────
      para(bold("WEEKLY PROJECT PROGRESS REPORT", 36, BLUE), AlignmentType.CENTER, { after: 60 }),
      para([
        bold("Team Name: ", 22), normal("Team 8 – VH (VendorHub)", 22),
      ], AlignmentType.CENTER, { after: 40 }),
      para([
        bold("Project: ", 22), normal("VendorHub — Hyperlocal Multi-Vendor E-Commerce Platform", 22),
      ], AlignmentType.CENTER, { after: 40 }),
      para([
        bold("Reporting Period: ", 22), normal("Week 1–2 | Phase 1: Core Stability & Security", 22),
      ], AlignmentType.CENTER, { after: 40 }),
      para([
        bold("Report Date: ", 22), normal("29 June 2026", 22),
      ], AlignmentType.CENTER, { after: 40 }),
      para([
        bold("Deadline: ", 22), normal("5:00 PM, 29 June 2026", 22),
      ], AlignmentType.CENTER, { after: 200 }),

      // ── INTRO NOTE ────────────────────────────────────────────────────────
      new Paragraph({
        children: [
          bold("Dear Team,", 20),
          new TextRun({ break: 1 }),
          normal(
            "Please find below the weekly progress report for Team 8 – VH covering Weeks 1–2 of the " +
            "Enginow internship, aligned with the official project roadmap (Phase 1: Core Stability & Security). " +
            "This report is submitted as part of the weekly audit and progress review requirement.",
            20,
          ),
        ],
        shading: { type: ShadingType.CLEAR, fill: GREY_BG },
        border: {
          left: { color: BLUE, size: 18, style: BorderStyle.SINGLE },
        },
        spacing: { before: 120, after: 240 },
        indent: { left: 200 },
      }),

      // ── TEAM MEMBERS ─────────────────────────────────────────────────────
      heading("Team Members"),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        layout: TableLayoutType.FIXED,
        rows: [
          headerRow([["Name", 20], ["Role", 25], ["Responsibilities", 55]]),
          dataRow([
            ["Dharmender Chauhan", 20, { bold: true }],
            ["Tech Stack & Backend Developer", 25],
            ["Architecture, Server Actions, API Routes, Database, Inngest Workers, Clerk Auth Backend, Middleware", 55],
          ]),
          dataRow([
            ["Rishita Sorout", 20, { bold: true }],
            ["UI/UX Specialist & Frontend Developer", 25],
            ["Sign-In/Sign-Up UI, Profile Page, Navbar Enhancements, Role-Based UI, Store Layout, Admin Approval UI", 55],
          ], true),
        ],
      }),

      // ── PHASE 1 ROADMAP ───────────────────────────────────────────────────
      heading("Phase 1 Roadmap (Weeks 1–2): Core Stability & Security"),
      para([
        normal("As per the official Enginow project roadmap, Phase 1 has been completed to "),
        bold("100%:"),
      ]),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        layout: TableLayoutType.FIXED,
        rows: [
          headerRow([["#", 5], ["Phase 1 Task", 35], ["Status", 15], ["Details", 45]]),
          ...[
            ["1", "Role-Based Access Control",          "✓ Completed", "Full RBAC with BUYER/VENDOR/ADMIN roles, middleware protection, database-backed authorisation"],
            ["2", "Input Validation",                   "✓ Completed", "Comprehensive input validation using Zod schemas added to all server actions"],
            ["3", "Rate Limiting",                      "✓ Completed", "Sliding-window in-memory rate limiter implemented for APIs, webhooks, and server actions"],
            ["4", "Removal of Mock Production Risks",   "✓ Completed", "Centralised environment module to manage mock modes/keys; removed hardcoded keys and admin emails"],
            ["5", "Cart Persistence Planning & Execution","✓ Completed","Client-side Redux cart states synced to PostgreSQL database via server actions"],
          ].map(([num, task, status, detail], i) =>
            new TableRow({
              children: [
                cell(num,    { bg: i % 2 ? LIGHT_BLUE : WHITE, size: 18, align: AlignmentType.CENTER }),
                cell(task,   { bg: i % 2 ? LIGHT_BLUE : WHITE, size: 18, bold: true }),
                cell(status, { bg: LIGHT_GREEN, size: 18, color: GREEN, bold: true, align: AlignmentType.CENTER }),
                cell(detail, { bg: i % 2 ? LIGHT_BLUE : WHITE, size: 18 }),
              ],
            })
          ),
        ],
      }),

      // ── WORK COMPLETED ───────────────────────────────────────────────────
      heading("Work Completed During Week 1–2"),

      // A. RBAC
      subheading("A. Role-Based Access Control (✓ Completed)"),
      para(bold("Backend (Dharmender Chauhan)", 20)),
      bullet("User Server Actions (src/app/actions/users.ts) — NEW"),
      bullet("getCurrentUserProfile() — Fetches authenticated user from Neon PostgreSQL via Prisma with store relation; auto-creates user on first login.", 1),
      bullet("updateUserProfile() — Name update with input validation (empty/whitespace rejection).", 1),
      bullet("completeRegistration() — Post-sign-up flow with role-based redirect (VENDOR → /vendor/register, BUYER → /).", 1),
      bullet("checkVendorAccess() — Verifies VENDOR role + active store for dashboard access.", 1),
      bullet("Vendor Server Actions (src/app/actions/vendors.ts) — NEW"),
      bullet("registerVendor() — Store registration with PENDING status, duplicate-store check, role promotion to VENDOR.", 1),
      bullet("getCurrentUserRoleAndStore() — Role + store retrieval with auto-sync for new Clerk users.", 1),
      bullet("Clerk Middleware (src/proxy.ts) — NEW"),
      bullet("Route protection via createRouteMatcher for: /admin, /vendor, /cart, /checkout, /profile.", 1),
      bullet("Next.js 16 build check: Reconciled middleware routes to use single proxy.ts build config.", 1),
      bullet("Admin Auth Enhancement (src/app/actions/admin.ts) — MODIFIED"),
      bullet("checkAdmin() now queries database role field instead of email-only matching — production-grade authorisation.", 1),

      para(bold("Frontend (Rishita Sorout)", 20), AlignmentType.LEFT, { before: 100, after: 60 }),
      bullet("Sign-Up Page (src/app/sign-up/page.tsx) — NEW"),
      bullet("2-step flow: Role selection (Buyer/Vendor) → Clerk SignUp component.", 1),
      bullet("Glassmorphic card design with icon indicators and role descriptions.", 1),
      bullet("Sign-In Page (src/app/sign-in/[[...sign-in]]/page.tsx) — NEW"),
      bullet("Clerk SignIn with catch-all routing; mock-mode informational panel.", 1),
      bullet("Profile Page (src/app/profile/page.tsx, src/components/profile/ProfileForm.tsx) — NEW"),
      bullet("Gradient header with avatar, email, and role badge (colour-coded per role).", 1),
      bullet("Editable name, read-only email, member-since date.", 1),
      bullet("Role-specific action cards (Buyer → 'Become a Vendor', Vendor → Store dashboard, Admin → Console).", 1),
      bullet("Navbar Enhancement (src/components/Navbar.tsx) — MODIFIED"),
      bullet("Added: Profile link, Sign Up button, role-aware dropdown menu items.", 1),
      bullet("Store Layout Enhancement (src/components/store/StoreLayout.tsx) — MODIFIED"),
      bullet("PENDING state: Glassmorphic 'Under Review' card with admin shortcut hint.", 1),
      bullet("REJECTED state: Error card with clear messaging.", 1),
      bullet("Admin Approval Enhancement (src/app/admin/approve/page.tsx) — MODIFIED"),
      bullet("3-tier store loading: Database → localStorage mock → dummy data fallback.", 1),

      // B. Validation
      subheading("B. Comprehensive Input Validation (✓ Completed)"),
      para(bold("Zod Validation Schemas (src/lib/validations.ts) — NEW", 20)),
      bullet("Created safe validation primitives: safeName, safeText, positiveFloat, safeUuid."),
      bullet("Created schemas for input validation:"),
      ...["updateProfileSchema","registerVendorSchema","addProductSchema","createOrderSchema",
          "storeStatusSchema","processRefundSchema","syncCartSchema"]
        .map(s => bullet(s, 1)),
      bullet("Integrated input validation into all server actions (users.ts, vendors.ts, admin.ts, orders.ts, products.ts)."),

      // C. Rate Limiting
      subheading("C. Rate Limiting (✓ Completed)"),
      para(bold("Sliding-Window Rate Limiter (src/lib/rate-limit.ts) — NEW", 20)),
      bullet("Light in-memory sliding-window request tracker with automatic stale entry sweeps."),
      bullet("Profiles configured:"),
      bullet("API_RATE_LIMIT (30 requests/60s)", 1),
      bullet("WEBHOOK_RATE_LIMIT (60 requests/60s)", 1),
      bullet("ACTION_RATE_LIMIT (20 requests/60s)", 1),
      bullet("Rate limiting integrated on server actions, webhooks, and ImageKit auth endpoints returning standard 429 headers."),

      // D. Cart Persistence
      subheading("D. Cart Persistence (✓ Completed)"),
      bullet("Cart Server Actions (src/app/actions/cart.ts) — NEW: Implemented saveCart(), loadCart(), and clearServerCart()."),
      bullet("Schema Integration (prisma/schema.prisma) — MODIFIED: Added cartData String? to user database model for session persistence."),

      // E. Mock Risk Removal
      subheading("E. Removal of Mock Production Risks (✓ Completed)"),
      bullet("Centralised Environment Module (src/lib/env.ts) — NEW: Consolidates admin email identity and separates mock checks."),
      bullet("ImageKit Build-Time Protection (src/lib/imagekit.ts) — MODIFIED: Prevents build-time crashes when credentials are not configured."),

      // F. Dependencies
      subheading("F. Dependency Updates"),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        layout: TableLayoutType.FIXED,
        rows: [
          headerRow([["Package", 20], ["Action", 20], ["Purpose", 60]]),
          dataRow([["svix", 20], ["✓ Added", 20, { color: GREEN, bold: true }], ["Clerk webhook signature verification (production security)", 60]]),
          dataRow([["zod",  20], ["✓ Added", 20, { color: GREEN, bold: true }], ["Type-safe schema validation", 60]], true),
        ],
      }),

      // ── KEY ACHIEVEMENTS ─────────────────────────────────────────────────
      heading("Key Achievements"),
      bullet("100% Phase 1 Completion — Meets the Enginow guidelines for Week 1–2 deliverables."),
      bullet("Build verified — Compiles, static page pre-renders, and bundles successfully under Next.js Turbopack."),
      bullet("Clean Deployment State — Removed duplicate middleware.ts configurations per Next.js 16.2.6 standards."),
      bullet("Git Sync & Clean Branch — Successfully staged, committed, and pushed clean code updates to the main remote branch."),

      // ── CHALLENGES ───────────────────────────────────────────────────────
      heading("Challenges Faced"),
      bullet("Next.js 16.2.6 Middleware/Proxy Constraint — Next.js 16 requires a single proxy.ts configuration rather than co-existing middleware.ts. Reconciled by keeping proxy.ts only."),
      bullet("ImageKit Build Pre-rendering Failure — Build step crashed due to missing API keys while pre-rendering route pages. Resolved by implementing safe mock-key fallbacks."),

      // ── PROGRESS STATUS ──────────────────────────────────────────────────
      heading("Progress Status"),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        layout: TableLayoutType.FIXED,
        rows: [
          headerRow([["Phase 1 Task", 55], ["Status", 25], ["Owner", 20]]),
          ...[
            ["Role-based access (RBAC)",          "✓ Completed", "Dharmender + Rishita"],
            ["Input validation (Zod)",            "✓ Completed", "Dharmender + Rishita"],
            ["Rate limiting (sliding window)",    "✓ Completed", "Dharmender"],
            ["Cart persistence (Redux & Neon DB)","✓ Completed", "Dharmender"],
            ["Mock production risk removal",      "✓ Completed", "Dharmender"],
            ["Webhook Security (svix)",           "✓ Completed", "Dharmender"],
            ["Next.js 16.2.6 Build compatibility","✓ Completed", "Dharmender"],
          ].map(([task, status, owner], i) =>
            new TableRow({
              children: [
                cell(task,   { bg: i % 2 ? LIGHT_BLUE : WHITE, size: 18 }),
                cell(status, { bg: LIGHT_GREEN, size: 18, color: GREEN, bold: true, align: AlignmentType.CENTER }),
                cell(owner,  { bg: i % 2 ? LIGHT_BLUE : WHITE, size: 18 }),
              ],
            })
          ),
        ],
      }),

      // ── UPCOMING TASKS ───────────────────────────────────────────────────
      heading("Upcoming Week Tasks — Phase 2 (Weeks 3–4): Marketplace Completion"),
      para([normal("As per the official Enginow roadmap:")]),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        layout: TableLayoutType.FIXED,
        rows: [
          headerRow([["#", 5], ["Task", 50], ["Owner", 28], ["Priority", 17]]),
          ...[
            ["1", "Live payment setup (Stripe/Razorpay production keys)",         "Dharmender",                          "High"],
            ["2", "Vendor order updates (status management flow)",                "Dharmender + Rishita",                "High"],
            ["3", "Product edit/update flow (CRUD for vendor products)",          "Rishita (UI) + Dharmender (Backend)", "High"],
            ["4", "Wishlist completion (database persistence)",                   "Dharmender",                          "Medium"],
            ["5", "Review system completion (verified purchase reviews)",         "Dharmender + Rishita",                "Medium"],
          ].map(([num, task, owner, priority], i) =>
            new TableRow({
              children: [
                cell(num,      { bg: i % 2 ? LIGHT_BLUE : WHITE, size: 18, align: AlignmentType.CENTER }),
                cell(task,     { bg: i % 2 ? LIGHT_BLUE : WHITE, size: 18 }),
                cell(owner,    { bg: i % 2 ? LIGHT_BLUE : WHITE, size: 18 }),
                cell(priority, {
                  bg: priority === "High" ? "FFF3E0" : LIGHT_GREEN,
                  size: 18,
                  color: priority === "High" ? "B45309" : GREEN,
                  bold: true,
                  align: AlignmentType.CENTER,
                }),
              ],
            })
          ),
        ],
      }),

      // ── SIGN-OFF ─────────────────────────────────────────────────────────
      new Paragraph({ spacing: { before: 400 }, children: [] }),
      new Paragraph({
        children: [
          bold("Submitted by: ", 20), normal("Team 8 – VH", 20),
          new TextRun({ break: 1 }),
          bold("Dharmender Chauhan ", 20), normal("(Tech Stack & Backend)  |  ", 20),
          bold("Rishita Sorout ", 20), normal("(UI/UX & Frontend)", 20),
          new TextRun({ break: 1 }),
          bold("Organisation: ", 20), normal("Enginow", 20),
        ],
        spacing: { before: 80 },
        border: { top: { color: BLUE, size: 6, style: BorderStyle.SINGLE } },
      }),
    ],
  }],
});

Packer.toBuffer(doc).then((buf) => {
  const outPath = "Team8_VH_Weekly_Report_Week1_2.docx";
  writeFileSync(outPath, buf);
  console.log(`✓ Report written → ${outPath}`);
});
