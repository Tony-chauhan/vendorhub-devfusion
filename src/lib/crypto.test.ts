import { describe, it, expect, beforeAll } from "vitest";
import crypto from "crypto";

beforeAll(() => {
  process.env.BANK_DETAILS_ENCRYPTION_KEY = crypto.randomBytes(32).toString("base64");
});

describe("encryptSensitive / decryptSensitive", () => {
  it("round-trips a plaintext value", async () => {
    const { encryptSensitive, decryptSensitive } = await import("./crypto");
    const plaintext = "1234567890123456";
    const encrypted = encryptSensitive(plaintext);
    expect(encrypted).not.toContain(plaintext);
    expect(decryptSensitive(encrypted)).toBe(plaintext);
  });

  it("produces a different ciphertext each time (random IV)", async () => {
    const { encryptSensitive } = await import("./crypto");
    const a = encryptSensitive("98765432104820");
    const b = encryptSensitive("98765432104820");
    expect(a).not.toBe(b);
  });

  it("throws on a tampered ciphertext (auth tag mismatch)", async () => {
    const { encryptSensitive, decryptSensitive } = await import("./crypto");
    const encrypted = encryptSensitive("98765432104820");
    const [iv, tag, data] = encrypted.split(":");
    const tampered = [iv, tag, Buffer.from("tampered-data").toString("base64")].join(":");
    expect(() => decryptSensitive(tampered)).toThrow();
  });

  it("throws a clear error when BANK_DETAILS_ENCRYPTION_KEY is missing", async () => {
    const original = process.env.BANK_DETAILS_ENCRYPTION_KEY;
    delete process.env.BANK_DETAILS_ENCRYPTION_KEY;

    const { encryptSensitive } = await import("./crypto");
    expect(() => encryptSensitive("test")).toThrow(/BANK_DETAILS_ENCRYPTION_KEY/);

    process.env.BANK_DETAILS_ENCRYPTION_KEY = original;
  });
});

describe("maskAccountNumber", () => {
  it("shows only the last 4 digits", async () => {
    const { maskAccountNumber } = await import("./crypto");
    expect(maskAccountNumber("98765432104820")).toBe("••••4820");
  });
});
