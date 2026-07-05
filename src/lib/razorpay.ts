import Razorpay from "razorpay";

// Initialize server-side Razorpay client singleton
// Provide fallback mock keys during build/evaluation time to prevent crash
export const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "mock_key_id",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "mock_key_secret",
});
