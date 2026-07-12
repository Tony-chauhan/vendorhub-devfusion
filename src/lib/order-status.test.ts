import { describe, it, expect } from "vitest";
import { checkStatusTransition } from "./order-status";

describe("checkStatusTransition", () => {
  it("allows the standard forward sequence", () => {
    expect(checkStatusTransition("PLACED", "CONFIRMED").allowed).toBe(true);
    expect(checkStatusTransition("CONFIRMED", "SHIPPED").allowed).toBe(true);
    expect(checkStatusTransition("SHIPPED", "DELIVERED").allowed).toBe(true);
  });

  it("allows skipping ahead (e.g. PLACED straight to DELIVERED)", () => {
    expect(checkStatusTransition("PLACED", "DELIVERED").allowed).toBe(true);
  });

  it("rejects moving backward", () => {
    const result = checkStatusTransition("DELIVERED", "PLACED" as any);
    expect(result.allowed).toBe(false);
    expect(result.error).toMatch(/backward/i);
  });

  it("rejects re-setting the same status", () => {
    const result = checkStatusTransition("SHIPPED", "SHIPPED");
    expect(result.allowed).toBe(false);
  });

  it("documents that an unrecognized current status (indexOf -1) is treated as before every real step", () => {
    // This can't happen in production (Order.status is a Prisma enum), but
    // pins down the behavior: unknown statuses don't accidentally block valid transitions.
    const result = checkStatusTransition("SOMETHING_UNKNOWN", "CONFIRMED");
    expect(result.allowed).toBe(true);
  });
});
