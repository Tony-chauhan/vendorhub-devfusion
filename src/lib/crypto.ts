/**
 * AES-256-GCM field-level encryption for sensitive vendor data (bank account
 * numbers). Never store these fields in plaintext.
 *
 * BANK_DETAILS_ENCRYPTION_KEY must be a 32-byte key, base64-encoded (e.g.
 * `openssl rand -base64 32`). There is deliberately no fallback: if vendor
 * bank details are ever touched without this key configured, encrypting or
 * decrypting throws immediately rather than silently storing plaintext.
 */

import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12; // recommended nonce size for GCM

function getKey(): Buffer {
  const encoded = process.env.BANK_DETAILS_ENCRYPTION_KEY;
  if (!encoded) {
    throw new Error(
      "BANK_DETAILS_ENCRYPTION_KEY is not set. Generate one with `openssl rand -base64 32` " +
        "and set it before storing or reading vendor bank details."
    );
  }

  const key = Buffer.from(encoded, "base64");
  if (key.length !== 32) {
    throw new Error(
      `BANK_DETAILS_ENCRYPTION_KEY must decode to 32 bytes, got ${key.length}. ` +
        "Generate one with `openssl rand -base64 32`."
    );
  }

  return key;
}

/** Encrypts a plaintext string, returning `iv:authTag:ciphertext` (all base64). */
export function encryptSensitive(plaintext: string): string {
  const key = getKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return [iv.toString("base64"), authTag.toString("base64"), encrypted.toString("base64")].join(":");
}

/** Decrypts a string produced by {@link encryptSensitive}. */
export function decryptSensitive(payload: string): string {
  const key = getKey();
  const [ivB64, authTagB64, dataB64] = payload.split(":");
  if (!ivB64 || !authTagB64 || !dataB64) {
    throw new Error("Malformed encrypted payload");
  }

  const decipher = crypto.createDecipheriv(ALGORITHM, key, Buffer.from(ivB64, "base64"));
  decipher.setAuthTag(Buffer.from(authTagB64, "base64"));

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(dataB64, "base64")),
    decipher.final(),
  ]);

  return decrypted.toString("utf8");
}

/** Masks a bank account number for display, e.g. "••••1234". */
export function maskAccountNumber(accountNumber: string): string {
  const last4 = accountNumber.slice(-4);
  return `••••${last4}`;
}
