import { z } from "zod";

// ─── Reusable primitives ────────────────────────────────────────
const safeName = z
  .string()
  .trim()
  .min(1, "Name is required")
  .max(120, "Name must be under 120 characters")
  .regex(
    /^[a-zA-Z0-9\s\-'.,&()]+$/,
    "Name contains disallowed special characters"
  );

const safeText = z
  .string()
  .trim()
  .min(1, "This field is required")
  .max(2000, "Text must be under 2000 characters");

const positiveFloat = z
  .number()
  .positive("Value must be greater than zero")
  .finite("Value must be a finite number");

const nonNegativeInt = z
  .number()
  .int("Must be a whole number")
  .nonnegative("Value cannot be negative");

const safeUuid = z.string().refine(
  (val) => {
    const isUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(val);
    const isMockId = val.startsWith("mock_") || val.startsWith("prod_") || val.startsWith("store_") || val.startsWith("refund_");
    return isUuid || isMockId;
  },
  { message: "Invalid ID format" }
);

const phoneNumber = z
  .string()
  .trim()
  .regex(/^\d{10}$/, "Phone number must be exactly 10 digits");

// GSTIN: 2-digit state code + 10-char PAN + 1 entity code + 'Z' + 1 checksum
const gstin = z
  .string()
  .trim()
  .toUpperCase()
  .regex(
    /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
    "Invalid GSTIN format"
  );

const pan = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Invalid PAN format");

const bankAccountNumber = z
  .string()
  .trim()
  .regex(/^\d{9,18}$/, "Bank account number must be 9-18 digits");

const bankIfsc = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Invalid IFSC code");

// ─── User Profile ───────────────────────────────────────────────
export const updateProfileSchema = z.object({
  name: safeName,
});

// ─── Vendor Registration ────────────────────────────────────────
export const registerVendorSchema = z.object({
  name: safeName,
  description: safeText.min(10, "Description must be at least 10 characters"),
  logo: z.string().url("Logo must be a valid URL").or(z.literal("")),
  location: z
    .string()
    .trim()
    .min(1, "Location is required")
    .max(100, "Location must be under 100 characters"),
  // GST is optional (small-seller exemption in India); PAN and bank payout
  // details are required so vendors can actually be paid out.
  gstNumber: gstin.optional().or(z.literal("")),
  panNumber: pan,
  bankAccountNumber: bankAccountNumber,
  bankIfsc: bankIfsc,
});

// ─── Product ────────────────────────────────────────────────────
export const addProductSchema = z.object({
  name: safeName,
  description: safeText.min(40, "Description must be at least 40 characters — give buyers real detail"),
  price: positiveFloat,
  stock: nonNegativeInt,
  category: z
    .string()
    .trim()
    .min(1, "Category is required")
    .max(80, "Category must be under 80 characters"),
  images: z.array(z.string().url("Each image must be a valid URL")).default([]),
});

export const updateProductSchema = addProductSchema.partial().extend({
  id: safeUuid,
});

export const productIdSchema = z.object({
  id: safeUuid,
});

export const searchProductsSchema = z.object({
  search: z.string().trim().max(120).optional(),
  category: z.string().trim().max(80).optional(),
  minPrice: z.number().nonnegative().optional(),
  maxPrice: z.number().positive().optional(),
  minRating: z.number().min(0).max(5).optional(),
  sort: z
    .enum(["default", "low-to-high", "high-to-low", "best", "discount"])
    .optional()
    .default("default"),
  page: z.number().int().positive().optional().default(1),
  limit: z.number().int().positive().max(100).optional().default(20),
});

// ─── Order ──────────────────────────────────────────────────────
export const createOrderSchema = z.object({
  totalAmount: positiveFloat,
  address: safeText.min(5, "Address must be at least 5 characters"),
  phone: phoneNumber,
  paymentMethod: z.enum(["razorpay", "cod"]).default("cod"),
  items: z
    .array(
      z.object({
        // Not a strict UUID: mock-mode product IDs (e.g. "prod_1") aren't
        // UUIDs, and real-mode IDs are verified against Prisma anyway.
        productId: z.string().min(1, "Product ID is required"),
        quantity: z.number().int().positive("Quantity must be at least 1"),
        price: positiveFloat,
      })
    )
    .min(1, "Order must contain at least one item"),
});

export const verifyRazorpayPaymentSchema = z.object({
  orderId: safeUuid,
  razorpayOrderId: z.string().min(1, "Missing Razorpay order ID"),
  razorpayPaymentId: z.string().min(1, "Missing Razorpay payment ID"),
  razorpaySignature: z.string().min(1, "Missing Razorpay signature"),
});

export const requestRefundSchema = z.object({
  orderId: safeUuid,
  reason: safeText.min(10, "Please describe the issue in at least 10 characters"),
});

// ─── Wishlist ───────────────────────────────────────────────────
export const toggleWishlistSchema = z.object({
  productId: safeUuid,
});

// ─── Reviews ────────────────────────────────────────────────────
export const createReviewSchema = z.object({
  productId: safeUuid,
  rating: z.number().int().min(1, "Rating must be at least 1").max(5, "Rating must be at most 5"),
  comment: safeText.min(5, "Review must be at least 5 characters").max(1000, "Review must be under 1000 characters"),
});

// ─── Vendor Order Status ─────────────────────────────────────────
export const updateOrderStatusSchema = z.object({
  orderId: safeUuid,
  status: z.enum(["CONFIRMED", "SHIPPED", "DELIVERED"]),
});

// ─── Admin Actions ──────────────────────────────────────────────
export const storeStatusSchema = z.object({
  storeId: safeUuid,
  status: z.enum(["APPROVED", "REJECTED"]),
});

export const processRefundSchema = z.object({
  refundId: safeUuid,
  status: z.enum(["APPROVED", "REJECTED"]),
});

export const setUserRoleSchema = z.object({
  userId: safeUuid,
  role: z.enum(["BUYER", "VENDOR", "ADMIN"]),
});

export const verifyStoreSchema = z.object({
  storeId: safeUuid,
  verificationStatus: z.enum(["VERIFIED", "REJECTED"]),
  notes: safeText.max(500).optional().or(z.literal("")),
});

export const processPayoutSchema = z.object({
  storeId: safeUuid,
});

// ─── Cart Persistence ───────────────────────────────────────────
export const syncCartSchema = z.object({
  items: z.record(
    safeUuid, // productId
    z.number().int().positive()
  ),
});

// ─── Helper: format Zod errors into a single string ─────────────
export function formatZodError(error: z.ZodError): string {
  return error.issues.map((i) => i.message).join("; ");
}
