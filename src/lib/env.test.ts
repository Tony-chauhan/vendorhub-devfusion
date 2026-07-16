import { describe, it, expect, beforeEach, afterEach } from "vitest";

describe("isMockDb", () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("returns true when DATABASE_URL is empty", async () => {
    delete process.env.DATABASE_URL;
    // Re-import to pick up new env
    const { isMockDb } = await import("./env");
    expect(isMockDb()).toBe(true);
  });

  it("returns true when DATABASE_URL contains 'mock'", async () => {
    process.env.DATABASE_URL = "postgresql://mockuser:mockpassword@ep-mock-host.neon.tech/neondb";
    const { isMockDb } = await import("./env");
    expect(isMockDb()).toBe(true);
  });
});

describe("isMockAuth", () => {
  it("returns false as mock auth is permanently disabled", async () => {
    delete process.env.CLERK_SECRET_KEY;
    delete process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
    const { isMockAuth } = await import("./env");
    expect(isMockAuth()).toBe(false);
  });
});

describe("isMockPayments", () => {
  it("returns true when RAZORPAY keys are absent", async () => {
    delete process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    delete process.env.RAZORPAY_KEY_SECRET;
    const { isMockPayments } = await import("./env");
    expect(isMockPayments()).toBe(true);
  });
});

describe("resolveRole", () => {
  it("returns ADMIN for the configured admin email", async () => {
    const { resolveRole, ADMIN_EMAIL } = await import("./env");
    expect(resolveRole(ADMIN_EMAIL)).toBe("ADMIN");
  });

  it("returns BUYER for any other email", async () => {
    const { resolveRole } = await import("./env");
    expect(resolveRole("buyer@example.com")).toBe("BUYER");
  });
});
