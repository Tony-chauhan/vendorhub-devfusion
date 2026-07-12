/**
 * GSTIN verification.
 *
 * When GST_VERIFICATION_API_URL / GST_VERIFICATION_API_KEY are configured,
 * calls out to that endpoint. Verification providers (Surepass, Signzy,
 * Cashfree Verification Suite, and similar) expose broadly similar "verify
 * GSTIN" REST endpoints — this is built against a generic request/response
 * contract since it can't be verified against any one provider's live API
 * without an account; adjust the request shape and the response field names
 * below to match whichever provider you choose.
 *
 * Without configuration, falls back to format validation only and marks the
 * vendor PENDING for manual admin review. It never auto-verifies without a
 * real provider response.
 */

export interface GstVerificationResult {
  verified: boolean;
  status: "VERIFIED" | "PENDING" | "REJECTED";
  legalName?: string;
  message: string;
}

const GSTIN_FORMAT = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

export async function verifyGSTIN(gstin: string): Promise<GstVerificationResult> {
  const normalized = gstin.trim().toUpperCase();

  if (!GSTIN_FORMAT.test(normalized)) {
    return { verified: false, status: "REJECTED", message: "GSTIN failed format validation" };
  }

  const apiUrl = process.env.GST_VERIFICATION_API_URL;
  const apiKey = process.env.GST_VERIFICATION_API_KEY;

  if (!apiUrl || !apiKey) {
    console.warn(
      `[gst-verification] GST_VERIFICATION_API_URL/_API_KEY not set — "${normalized}" passed format ` +
        "validation only and is queued for manual admin review, not auto-verified."
    );
    return {
      verified: false,
      status: "PENDING",
      message: "Format valid. Awaiting manual verification (no verification API configured).",
    };
  }

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ gstin: normalized }),
      signal: AbortSignal.timeout(10_000),
    });

    if (!response.ok) {
      throw new Error(`GST verification API returned HTTP ${response.status}`);
    }

    const data = await response.json();
    // Generic response contract — adjust these field names to match your
    // chosen provider's actual schema.
    const isActive = data?.status === "ACTIVE" || data?.valid === true;

    return {
      verified: isActive,
      status: isActive ? "VERIFIED" : "PENDING",
      legalName: data?.legalName ?? data?.tradeName ?? undefined,
      message: isActive
        ? "GSTIN verified as active by provider."
        : "Provider could not confirm active status — queued for manual review.",
    };
  } catch (error) {
    console.error("[gst-verification] Provider call failed:", error);
    return {
      verified: false,
      status: "PENDING",
      message: "Verification provider unreachable — queued for manual review.",
    };
  }
}
