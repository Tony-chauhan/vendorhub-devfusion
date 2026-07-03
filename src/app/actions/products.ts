"use server";

import { prisma } from "@/lib/prisma";
import { customCurrentUser as currentUser } from "@/lib/clerk-server";
import { isMockDb } from "@/lib/env";
import {
  addProductSchema,
  updateProductSchema,
  searchProductsSchema,
  formatZodError,
} from "@/lib/validations";
import { checkRateLimit, ACTION_RATE_LIMIT } from "@/lib/rate-limit";
import { productDummyData } from "@/assets/assets";

interface AddProductInput {
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  images: string[];
}

export interface CatalogProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  mrp: number;
  stock: number;
  images: string[];
  category: string;
  location: string | null;
  storeId: string;
  storeName?: string;
  avgRating: number;
  rating: Array<{ rating: number }>;
  inStock: boolean;
  createdAt: string;
  updatedAt: string;
}

export type SearchProductsInput = {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  sort?: "default" | "low-to-high" | "high-to-low" | "best" | "discount";
};

function computeMrp(price: number) {
  return Math.round(price * 1.25 * 100) / 100;
}

function mapDummyToCatalog(product: (typeof productDummyData)[number]): CatalogProduct {
  const ratings = product.rating ?? [];
  const avgRating =
    ratings.length > 0
      ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
      : 5;

  return {
    id: product.id,
    name: product.name,
    description: product.description,
    price: product.price,
    mrp: product.mrp ?? computeMrp(product.price),
    stock: product.inStock ? 10 : 0,
    images: product.images,
    category: product.category,
    location: product.store?.address ?? null,
    storeId: product.storeId,
    storeName: product.store?.name,
    avgRating,
    rating: ratings.map((r) => ({ rating: r.rating })),
    inStock: product.inStock ?? product.stock > 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

function mapDbToCatalog(
  product: {
    id: string;
    name: string;
    description: string;
    price: number;
    stock: number;
    images: string[];
    category: string;
    location: string | null;
    storeId: string;
    createdAt: Date;
    updatedAt: Date;
    store?: { name: string } | null;
    reviews?: Array<{ rating: number }>;
  }
): CatalogProduct {
  const reviews = product.reviews ?? [];
  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 5;

  return {
    id: product.id,
    name: product.name,
    description: product.description,
    price: product.price,
    mrp: computeMrp(product.price),
    stock: product.stock,
    images: product.images,
    category: product.category,
    location: product.location,
    storeId: product.storeId,
    storeName: product.store?.name,
    avgRating,
    rating: reviews.map((r) => ({ rating: r.rating })),
    inStock: product.stock > 0,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
  };
}

function applySearchFilters(products: CatalogProduct[], filters: SearchProductsInput) {
  const search = filters.search?.toLowerCase().trim();
  const category = filters.category?.toLowerCase().trim();

  return products.filter((product) => {
    if (category && product.category.toLowerCase() !== category) return false;
    if (filters.minPrice !== undefined && product.price < filters.minPrice) return false;
    if (filters.maxPrice !== undefined && product.price > filters.maxPrice) return false;
    if (filters.minRating !== undefined && product.avgRating < filters.minRating) return false;

    if (search) {
      const haystack = `${product.name} ${product.description} ${product.category}`.toLowerCase();
      if (!haystack.includes(search)) return false;
    }

    return true;
  });
}

function sortCatalogProducts(products: CatalogProduct[], sort: SearchProductsInput["sort"]) {
  const sorted = [...products];

  switch (sort) {
    case "low-to-high":
      return sorted.sort((a, b) => a.price - b.price);
    case "high-to-low":
      return sorted.sort((a, b) => b.price - a.price);
    case "best":
      return sorted.sort((a, b) => b.avgRating - a.avgRating);
    case "discount":
      return sorted.sort((a, b) => b.mrp - b.price - (a.mrp - a.price));
    default:
      return sorted;
  }
}

async function getVendorStoreForUser(clerkId: string) {
  const user = await prisma.user.findUnique({
    where: { clerkId },
    include: { store: true },
  });

  if (!user?.store) return null;
  return { user, store: user.store };
}

export async function searchProducts(rawFilters: SearchProductsInput = {}) {
  try {
    const parsed = searchProductsSchema.safeParse(rawFilters);
    if (!parsed.success) {
      return { success: false as const, error: formatZodError(parsed.error), products: [] as CatalogProduct[] };
    }

    const filters = parsed.data;

    if (isMockDb()) {
      const mockProducts = productDummyData.map(mapDummyToCatalog);
      const filtered = applySearchFilters(mockProducts, filters);
      return { success: true as const, products: sortCatalogProducts(filtered, filters.sort) };
    }

    const where: Record<string, unknown> = {
      store: { status: "APPROVED" },
    };

    if (filters.category) {
      where.category = { equals: filters.category, mode: "insensitive" };
    }

    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      where.price = {
        ...(filters.minPrice !== undefined ? { gte: filters.minPrice } : {}),
        ...(filters.maxPrice !== undefined ? { lte: filters.maxPrice } : {}),
      };
    }

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: "insensitive" } },
        { description: { contains: filters.search, mode: "insensitive" } },
        { category: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    const rows = await prisma.product.findMany({
      where,
      include: {
        reviews: { select: { rating: true } },
        store: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    let products = rows.map(mapDbToCatalog);

    if (filters.minRating !== undefined) {
      products = products.filter((p) => p.avgRating >= filters.minRating!);
    }

    return { success: true as const, products: sortCatalogProducts(products, filters.sort) };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to search products";
    return { success: false as const, error: message, products: [] as CatalogProduct[] };
  }
}

export async function getVendorProducts() {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return { success: false as const, error: "Authentication required", products: [] as CatalogProduct[] };
    }

    if (isMockDb()) {
      const mockProducts = productDummyData.slice(0, 6).map(mapDummyToCatalog);
      return { success: true as const, products: mockProducts };
    }

    const vendor = await getVendorStoreForUser(clerkUser.id);
    if (!vendor) {
      return { success: false as const, error: "Vendor store not found", products: [] as CatalogProduct[] };
    }

    const rows = await prisma.product.findMany({
      where: { storeId: vendor.store.id },
      include: {
        reviews: { select: { rating: true } },
        store: { select: { name: true } },
      },
      orderBy: { updatedAt: "desc" },
    });

    return { success: true as const, products: rows.map(mapDbToCatalog) };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to load inventory";
    return { success: false as const, error: message, products: [] as CatalogProduct[] };
  }
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

    const vendor = await getVendorStoreForUser(clerkUser.id);
    if (!vendor) {
      return { success: false, error: "Vendor store not found" };
    }

    const deleted = await prisma.product.deleteMany({
      where: { id: productId, storeId: vendor.store.id },
    });

    if (deleted.count === 0) {
      return { success: false, error: "Product not found or you do not have permission to delete it" };
    }

    return { success: true };

  } catch (error: any) {
    console.error("Server Action DeleteProduct Error:", error);
    return { success: false, error: error.message || "Failed to delete product listing" };
  }
}

export async function updateProduct(data: {
  id: string;
  name?: string;
  description?: string;
  price?: number;
  stock?: number;
  category?: string;
  images?: string[];
}) {
  try {
    const parsed = updateProductSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: formatZodError(parsed.error) };
    }

    const clerkUser = await currentUser();
    if (!clerkUser) {
      return { success: false, error: "Authentication required" };
    }

    const rl = checkRateLimit(`upd-product:${clerkUser.id}`, ACTION_RATE_LIMIT);
    if (!rl.allowed) {
      return { success: false, error: "Too many requests. Please try again shortly." };
    }

    const { id, ...updates } = parsed.data;

    if (isMockDb()) {
      return {
        success: true,
        product: {
          id,
          ...updates,
          updatedAt: new Date().toISOString(),
        },
      };
    }

    const vendor = await getVendorStoreForUser(clerkUser.id);
    if (!vendor) {
      return { success: false, error: "Vendor store not found" };
    }

    const existing = await prisma.product.findFirst({
      where: { id, storeId: vendor.store.id },
    });

    if (!existing) {
      return { success: false, error: "Product not found or you do not have permission to edit it" };
    }

    const product = await prisma.product.update({
      where: { id },
      data: updates,
      include: {
        reviews: { select: { rating: true } },
        store: { select: { name: true } },
      },
    });

    return { success: true, product: mapDbToCatalog(product) };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update product";
    return { success: false, error: message };
  }
}

export async function toggleProductStock(productId: string) {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return { success: false, error: "Authentication required" };
    }

    if (isMockDb()) {
      return { success: true, inStock: true };
    }

    const vendor = await getVendorStoreForUser(clerkUser.id);
    if (!vendor) {
      return { success: false, error: "Vendor store not found" };
    }

    const product = await prisma.product.findFirst({
      where: { id: productId, storeId: vendor.store.id },
    });

    if (!product) {
      return { success: false, error: "Product not found" };
    }

    const nextStock = product.stock > 0 ? 0 : 10;
    const updated = await prisma.product.update({
      where: { id: productId },
      data: { stock: nextStock },
      include: {
        reviews: { select: { rating: true } },
        store: { select: { name: true } },
      },
    });

    return { success: true, product: mapDbToCatalog(updated), inStock: updated.stock > 0 };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to toggle stock";
    return { success: false, error: message };
  }
}
