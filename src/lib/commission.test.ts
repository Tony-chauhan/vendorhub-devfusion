import { describe, it, expect } from "vitest";
import { calculateNetAmount, DEFAULT_COMMISSION_PERCENT } from "./commission";

describe("calculateNetAmount", () => {
  it("deducts the default 10% commission for a single-vendor cart", () => {
    const net = calculateNetAmount([{ price: 100, quantity: 2, commissionPercent: DEFAULT_COMMISSION_PERCENT }]);
    expect(net).toBeCloseTo(180, 2); // 200 - 10%
  });

  it("applies each line's own commission rate independently in a multi-vendor cart", () => {
    const net = calculateNetAmount([
      { price: 100, quantity: 1, commissionPercent: 10 }, // -> 90
      { price: 50, quantity: 2, commissionPercent: 20 }, // 100 -> 80
    ]);
    expect(net).toBeCloseTo(170, 2);
  });

  it("returns 0 for an empty cart", () => {
    expect(calculateNetAmount([])).toBe(0);
  });

  it("handles a 0% commission rate (no platform cut)", () => {
    const net = calculateNetAmount([{ price: 50, quantity: 1, commissionPercent: 0 }]);
    expect(net).toBe(50);
  });

  it("rounds to 2 decimal places", () => {
    const net = calculateNetAmount([{ price: 10, quantity: 3, commissionPercent: 7.5 }]);
    // 30 * 0.925 = 27.75
    expect(net).toBe(27.75);
  });
});
