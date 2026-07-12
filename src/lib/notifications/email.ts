/**
 * Transactional email via Resend. Falls back to logging the full payload to
 * the console when RESEND_API_KEY is unset, so notification call sites work
 * identically in local/mock development and production.
 */

import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;
const fromAddress = process.env.RESEND_FROM_EMAIL || "VendorHub <no-reply@vendorhub.example>";

const resend = apiKey ? new Resend(apiKey) : null;

if (!resend) {
  console.warn("[notifications:email] RESEND_API_KEY not set — emails will be logged, not sent.");
}

export interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailInput): Promise<{ sent: boolean }> {
  if (!resend) {
    console.info(`[notifications:email:sandbox] to=${to} subject="${subject}"\n${html}`);
    return { sent: false };
  }

  try {
    await resend.emails.send({ from: fromAddress, to, subject, html });
    return { sent: true };
  } catch (error) {
    console.error("[notifications:email] Resend send failed:", error);
    return { sent: false };
  }
}

// ─── Templates ────────────────────────────────────────────────────

export function orderConfirmationEmail(params: {
  orderNumber: string;
  totalAmount: number;
  itemCount: number;
}) {
  return {
    subject: `Order ${params.orderNumber} confirmed`,
    html: `<p>Thanks for your order! <strong>${params.orderNumber}</strong> (${params.itemCount} item(s), ₹${params.totalAmount.toFixed(2)}) has been placed and is being prepared.</p>`,
  };
}

export function vendorApprovalEmail(params: { storeName: string; approved: boolean; notes?: string }) {
  return {
    subject: params.approved
      ? `${params.storeName} is now live on VendorHub`
      : `Update on your VendorHub application`,
    html: params.approved
      ? `<p>Congratulations! Your store <strong>${params.storeName}</strong> has been approved and is now live on VendorHub.</p>`
      : `<p>Your store application for <strong>${params.storeName}</strong> was not approved at this time.${
          params.notes ? ` Reason: ${params.notes}` : ""
        }</p>`,
  };
}

export function refundDecisionEmail(params: { orderNumber: string; approved: boolean }) {
  return {
    subject: `Refund ${params.approved ? "approved" : "declined"} for order ${params.orderNumber}`,
    html: params.approved
      ? `<p>Your refund request for order <strong>${params.orderNumber}</strong> has been approved and will be processed shortly.</p>`
      : `<p>Your refund request for order <strong>${params.orderNumber}</strong> was declined.</p>`,
  };
}

export function lowStockAlertEmail(params: {
  storeName: string;
  alerts: Array<{ productName: string; currentStock: number }>;
}) {
  const rows = params.alerts
    .map((a) => `<li>${a.productName} — ${a.currentStock} left</li>`)
    .join("");
  return {
    subject: `Low stock alert for ${params.storeName}`,
    html: `<p>The following products are running low on stock:</p><ul>${rows}</ul>`,
  };
}

export function payoutProcessedEmail(params: { storeName: string; amount: number; pendingManualTransfer: boolean }) {
  return {
    subject: `Payout of ₹${params.amount.toFixed(2)} processed for ${params.storeName}`,
    html: params.pendingManualTransfer
      ? `<p>A payout of <strong>₹${params.amount.toFixed(2)}</strong> has been calculated and recorded for <strong>${params.storeName}</strong>. It is pending manual bank transfer.</p>`
      : `<p>A payout of <strong>₹${params.amount.toFixed(2)}</strong> has been sent to <strong>${params.storeName}</strong>'s registered bank account.</p>`,
  };
}
