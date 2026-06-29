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

const safeUuid = z.string().uuid("Invalid ID format");

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
});

// ─── Product ────────────────────────────────────────────────────
export const addProductSchema = z.object({
  name: safeName,
  description: safeText.min(5, "Description must be at least 5 characters"),
  price: positiveFloat,
  stock: nonNegativeInt,
  category: z
    .string()
    .trim()
    .min(1, "Category is required")
    .max(80, "Category must be under 80 characters"),
  images: z.array(z.string().url("Each image must be a valid URL")).default([]),
});

// ─── Order ──────────────────────────────────────────────────────
export const createOrderSchema = z.object({
  totalAmount: positiveFloat,
  address: safeText.min(5, "Address must be at least 5 characters"),
  items: z
    .array(
      z.object({
        productId: safeUuid,
        quantity: z.number().int().positive("Quantity must be at least 1"),
        price: positiveFloat,
      })
    )
    .min(1, "Order must contain at least one item"),
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
