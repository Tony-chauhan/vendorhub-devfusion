import { describe, it, expect } from "vitest";
import {
  orderConfirmationEmail,
  vendorApprovalEmail,
  refundDecisionEmail,
  lowStockAlertEmail,
  payoutProcessedEmail,
} from "./email";

describe("orderConfirmationEmail", () => {
  it("includes the order number in subject and body", () => {
    const result = orderConfirmationEmail({ orderNumber: "VNH-123456", totalAmount: 499.99, itemCount: 3 });
    expect(result.subject).toContain("VNH-123456");
    expect(result.html).toContain("VNH-123456");
    expect(result.html).toContain("3 item(s)");
    expect(result.html).toContain("499.99");
  });
});

describe("vendorApprovalEmail", () => {
  it("returns approval message when approved", () => {
    const result = vendorApprovalEmail({ storeName: "Delhi Spice Hub", approved: true });
    expect(result.subject).toContain("live on VendorHub");
    expect(result.html).toContain("approved");
    expect(result.html).toContain("Delhi Spice Hub");
  });

  it("returns rejection message when not approved", () => {
    const result = vendorApprovalEmail({ storeName: "Delhi Spice Hub", approved: false, notes: "Incomplete docs" });
    expect(result.subject).toContain("Update on your VendorHub application");
    expect(result.html).toContain("not approved");
    expect(result.html).toContain("Incomplete docs");
  });
});

describe("refundDecisionEmail", () => {
  it("returns approved subject for approved refunds", () => {
    const result = refundDecisionEmail({ orderNumber: "VNH-111111", approved: true });
    expect(result.subject).toContain("approved");
    expect(result.html).toContain("approved");
  });

  it("returns declined subject for declined refunds", () => {
    const result = refundDecisionEmail({ orderNumber: "VNH-222222", approved: false });
    expect(result.subject).toContain("declined");
    expect(result.html).toContain("declined");
  });
});

describe("lowStockAlertEmail", () => {
  it("lists all low-stock products", () => {
    const result = lowStockAlertEmail({
      storeName: "Mountain Goods",
      alerts: [
        { productName: "Saffron Pack", currentStock: 2 },
        { productName: "Green Tea", currentStock: 1 },
      ],
    });
    expect(result.subject).toContain("Mountain Goods");
    expect(result.html).toContain("Saffron Pack");
    expect(result.html).toContain("Green Tea");
    expect(result.html).toContain("2 left");
  });
});

describe("payoutProcessedEmail", () => {
  it("mentions manual transfer when pending", () => {
    const result = payoutProcessedEmail({ storeName: "Test Store", amount: 1500, pendingManualTransfer: true });
    expect(result.subject).toContain("1500.00");
    expect(result.html).toContain("manual bank transfer");
  });

  it("mentions bank account when auto-transferred", () => {
    const result = payoutProcessedEmail({ storeName: "Test Store", amount: 2500, pendingManualTransfer: false });
    expect(result.html).toContain("registered bank account");
  });
});
