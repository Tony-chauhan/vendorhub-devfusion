/**
 * Transactional SMS via Twilio. Falls back to logging the message to the
 * console when Twilio credentials are unset, matching the same
 * sandbox-fallback pattern used by email and Razorpay.
 */

import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_FROM_NUMBER;

const client = accountSid && authToken ? twilio(accountSid, authToken) : null;

if (!client || !fromNumber) {
  console.warn(
    "[notifications:sms] TWILIO_ACCOUNT_SID/TWILIO_AUTH_TOKEN/TWILIO_FROM_NUMBER not fully set — " +
      "SMS will be logged, not sent."
  );
}

export async function sendSms(to: string, body: string): Promise<{ sent: boolean }> {
  if (!client || !fromNumber) {
    console.info(`[notifications:sms:sandbox] to=${to} body="${body}"`);
    return { sent: false };
  }

  try {
    await client.messages.create({ to, from: fromNumber, body });
    return { sent: true };
  } catch (error) {
    console.error("[notifications:sms] Twilio send failed:", error);
    return { sent: false };
  }
}
