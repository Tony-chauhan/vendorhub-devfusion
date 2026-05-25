"use server";

import { prisma } from "@/lib/prisma";
import { customCurrentUser as currentUser } from "@/lib/clerk-server";

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
    // 1. Authenticate with Clerk
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return { success: false, error: "Authentication required to add products" };
    }

    const dbUrl = process.env.DATABASE_URL;
    const isMockDb = !dbUrl || dbUrl.includes("mock") || dbUrl.includes("mockpassword") || dbUrl.includes("ep-mock-host");

    if (isMockDb) {
      console.info("[VendorHub] Database is in zero-config Mock Mode. Simulating product insertion.");
      return { 
        success: true, 
        product: { 
          id: `mock_product_${Math.floor(100000 + Math.random() * 900000)}`, 
          name: data.name,
          description: data.description,
          price: data.price,
          stock: data.stock,
          category: data.category,
          images: data.images.length > 0 ? data.images : ["https://images.unsplash.com/photo-1542838132-92c53300491e?w=150&auto=format&fit=crop&q=80"],
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
        name: data.name,
        description: data.description,
        price: data.price,
        stock: data.stock,
        category: data.category,
        images: data.images.length > 0 ? data.images : [
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
    // 1. Authenticate
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return { success: false, error: "Unauthorized" };
    }

    const dbUrl = process.env.DATABASE_URL;
    const isMockDb = !dbUrl || dbUrl.includes("mock") || dbUrl.includes("mockpassword") || dbUrl.includes("ep-mock-host");

    if (isMockDb) {
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
