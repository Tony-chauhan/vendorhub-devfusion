import { describe, it, expect, beforeEach } from "vitest";
import { verifyGSTIN } from "./gst-verification";

describe("verifyGSTIN (no provider configured)", () => {
  beforeEach(() => {
    delete process.env.GST_VERIFICATION_API_URL;
    delete process.env.GST_VERIFICATION_API_KEY;
  });

  it("rejects a malformed GSTIN outright", async () => {
    const result = await verifyGSTIN("not-a-gstin");
    expect(result.status).toBe("REJECTED");
    expect(result.verified).toBe(false);
  });

  it("marks a well-formed GSTIN PENDING for manual review rather than auto-verifying", async () => {
    const result = await verifyGSTIN("22AAAAA0000A1Z5");
    expect(result.status).toBe("PENDING");
    expect(result.verified).toBe(false);
  });

  it("is case-insensitive on input", async () => {
    const result = await verifyGSTIN("22aaaaa0000a1z5");
    expect(result.status).toBe("PENDING");
  });
});
