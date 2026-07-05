/**
 * Centralized environment configuration for VendorHub.
 *
 * Single source of truth for mock-mode detection, admin identity,
 * and environment flags. Every server action should import from
 * here instead of inlining its own checks.
 */

// ─── Admin Identity ──────────────────────────────────────────────
// Falls back to team leader email for backward compatibility, but
// production deployments MUST set ADMIN_EMAIL in their .env file.
export const ADMIN_EMAIL =
  process.env.ADMIN_EMAIL || "dharmenderchauhan802@gmail.com";

// ─── Mock Mode Detection ────────────────────────────────────────
const dbUrl = process.env.DATABASE_URL ?? "";
const clerkSecret = process.env.CLERK_SECRET_KEY ?? "";
const clerkPub = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";
const razorpayKeyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? "";
const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET ?? "";

/** True when the database URL is absent or points to a placeholder. */
export function isMockDb(): boolean {
  return (
    !dbUrl ||
    dbUrl.includes("mock") ||
    dbUrl.includes("mockpassword") ||
    dbUrl.includes("ep-mock-host")
  );
}

/** True when Clerk credentials are absent or placeholders. */
export function isMockAuth(): boolean {
  return (
    !clerkSecret ||
    clerkSecret.includes("mock") ||
    !clerkPub ||
    clerkPub.includes("mock") ||
    clerkPub.startsWith("pk_test_dGVhbXhkZXNpZ24")
  );
}

/** True when Razorpay credentials are absent or placeholders. */
export function isMockPayments(): boolean {
  return (
    !razorpayKeyId ||
    razorpayKeyId.includes("mock") ||
    !razorpayKeySecret ||
    razorpayKeySecret.includes("mock")
  );
}

/** Resolves the role for a given email address. */
export function resolveRole(email: string): "ADMIN" | "BUYER" {
  return email === ADMIN_EMAIL ? "ADMIN" : "BUYER";
}
