import { describe, it, expect } from "vitest";
import {
  registerVendorSchema,
  searchProductsSchema,
  requestRefundSchema,
  setUserRoleSchema,
  verifyStoreSchema,
  createOrderSchema,
} from "./validations";

const validVendor = {
  name: "Delhi Spice Hub",
  description: "Traditional hand-blended organic Indian spices.",
  logo: "https://example.com/logo.png",
  location: "Delhi",
  panNumber: "abcde1234f", // lowercase on purpose — schema should uppercase it
  bankAccountNumber: "98765432104820",
  bankIfsc: "sbin0001234",
};

describe("registerVendorSchema", () => {
  it("accepts a valid submission without a GSTIN (small-seller exemption)", () => {
    const result = registerVendorSchema.safeParse(validVendor);
    expect(result.success).toBe(true);
  });

  it("uppercases PAN and IFSC", () => {
    const result = registerVendorSchema.safeParse(validVendor);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.panNumber).toBe("ABCDE1234F");
      expect(result.data.bankIfsc).toBe("SBIN0001234");
    }
  });

  it("accepts a valid GSTIN", () => {
    const result = registerVendorSchema.safeParse({ ...validVendor, gstNumber: "22aaaaa0000a1z5" });
    expect(result.success).toBe(true);
  });

  it("rejects a malformed GSTIN when provided", () => {
    const result = registerVendorSchema.safeParse({ ...validVendor, gstNumber: "not-valid" });
    expect(result.success).toBe(false);
  });

  it("rejects a malformed PAN", () => {
    const result = registerVendorSchema.safeParse({ ...validVendor, panNumber: "12345" });
    expect(result.success).toBe(false);
  });

  it("rejects a bank account number outside 9-18 digits", () => {
    const result = registerVendorSchema.safeParse({ ...validVendor, bankAccountNumber: "123" });
    expect(result.success).toBe(false);
  });

  it("rejects a malformed IFSC", () => {
    const result = registerVendorSchema.safeParse({ ...validVendor, bankIfsc: "NOTIFSC" });
    expect(result.success).toBe(false);
  });
});

describe("searchProductsSchema", () => {
  it("defaults page to 1 and limit to 20", () => {
    const result = searchProductsSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
    }
  });

  it("rejects a limit above 100", () => {
    const result = searchProductsSchema.safeParse({ limit: 500 });
    expect(result.success).toBe(false);
  });

  it("rejects a non-positive page", () => {
    const result = searchProductsSchema.safeParse({ page: 0 });
    expect(result.success).toBe(false);
  });
});

describe("requestRefundSchema", () => {
  it("requires a reason of at least 10 characters", () => {
    expect(
      requestRefundSchema.safeParse({ orderId: "550e8400-e29b-41d4-a716-446655440000", reason: "too short" }).success
    ).toBe(false);
    expect(
      requestRefundSchema.safeParse({
        orderId: "550e8400-e29b-41d4-a716-446655440000",
        reason: "The item arrived damaged in transit.",
      }).success
    ).toBe(true);
  });
});

describe("setUserRoleSchema / verifyStoreSchema", () => {
  it("only accepts known roles", () => {
    expect(
      setUserRoleSchema.safeParse({ userId: "550e8400-e29b-41d4-a716-446655440000", role: "SUPERUSER" }).success
    ).toBe(false);
    expect(
      setUserRoleSchema.safeParse({ userId: "550e8400-e29b-41d4-a716-446655440000", role: "ADMIN" }).success
    ).toBe(true);
  });

  it("only accepts VERIFIED/REJECTED as a verification decision", () => {
    expect(
      verifyStoreSchema.safeParse({ storeId: "550e8400-e29b-41d4-a716-446655440000", verificationStatus: "PENDING" })
        .success
    ).toBe(false);
  });
});

describe("createOrderSchema", () => {
  it("defaults paymentMethod to cod and requires at least one item", () => {
    const result = createOrderSchema.safeParse({
      totalAmount: 100,
      address: "221B Baker Street",
      phone: "9876543210",
      items: [{ productId: "prod_1", quantity: 1, price: 100 }],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.paymentMethod).toBe("cod");
    }
  });

  it("rejects an empty items array", () => {
    const result = createOrderSchema.safeParse({
      totalAmount: 100,
      address: "221B Baker Street",
      phone: "9876543210",
      items: [],
    });
    expect(result.success).toBe(false);
  });
});
