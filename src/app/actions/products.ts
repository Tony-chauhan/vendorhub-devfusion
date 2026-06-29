"use server";

import { prisma } from "@/lib/prisma";
import { customCurrentUser as currentUser } from "@/lib/clerk-server";
import { isMockDb } from "@/lib/env";
import { addProductSchema, formatZodError } from "@/lib/validations";
import { checkRateLimit, ACTION_RATE_LIMIT } from "@/lib/rate-limit";

interface AddProductInput {
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  images: string[];
}

export async function addProduct(data: AddProductInput) {
  try {
    // Validate with Zod
    const parsed = addProductSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: formatZodError(parsed.error) };
    }

    // 1. Authenticate with Clerk
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return { success: false, error: "Authentication required to add products" };
    }

    // Rate limit
    const rl = checkRateLimit(`product:${clerkUser.id}`, ACTION_RATE_LIMIT);
    if (!rl.allowed) {
      return { success: false, error: "Too many requests. Please try again shortly." };
    }

    const validData = parsed.data;

    if (isMockDb()) {
      console.info("[VendorHub] Database is in zero-config Mock Mode. Simulating product insertion.");
      return { 
        success: true, 
        product: { 
          id: `mock_product_${Math.floor(100000 + Math.random() * 900000)}`, 
          name: validData.name,
          description: validData.description,
          price: validData.price,
          stock: validData.stock,
          category: validData.category,
          images: validData.images.length > 0 ? validData.images : ["https://images.unsplash.com/photo-1542838132-92c53300491e?w=150&auto=format&fit=crop&q=80"],
          storeId: "mock_store_id",
          location: "Mumbai",
          createdAt: new Date(),
          updatedAt: new Date()
        } 
      };
    }

    // 2. Fetch vendor database profile and store
    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUser.id },
      include: { store: true },
    });

    if (!user || !user.store) {
      return { success: false, error: "Vendor store not registered. Please register first." };
    }

    // 3. Create product and inherit location from store for quick hyperlocal geographic index searching
    const product = await prisma.product.create({
      data: {
        name: validData.name,
        description: validData.description,
        price: validData.price,
        stock: validData.stock,
        category: validData.category,
        images: validData.images.length > 0 ? validData.images : [
          "https://images.unsplash.com/photo-1542838132-92c53300491e?w=150&auto=format&fit=crop&q=80"
        ],
        storeId: user.store.id,
        location: user.store.location,
      },
    });

    return { success: true, product };

  } catch (error: any) {
    console.error("Server Action AddProduct Error:", error);
    return { success: false, error: error.message || "Failed to create product listing on server" };
  }
}

export async function deleteProduct(productId: string) {
  try {
    // Basic validation
    if (!productId || typeof productId !== "string" || productId.trim().length === 0) {
      return { success: false, error: "Invalid product ID" };
    }

    // 1. Authenticate
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return { success: false, error: "Unauthorized" };
    }

    // Rate limit
    const rl = checkRateLimit(`del-product:${clerkUser.id}`, ACTION_RATE_LIMIT);
    if (!rl.allowed) {
      return { success: false, error: "Too many requests. Please try again shortly." };
    }

    if (isMockDb()) {
      console.info("[VendorHub] Database is in zero-config Mock Mode. Simulating product deletion.");
      return { success: true };
    }

    // 2. Perform delete
    await prisma.product.delete({
      where: { id: productId },
    });

    return { success: true };

  } catch (error: any) {
    console.error("Server Action DeleteProduct Error:", error);
    return { success: false, error: error.message || "Failed to delete product listing" };
  }
}
