import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const run = async () => {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("DATABASE_URL is not set.");
    return;
  }
  
  console.log("Connecting to database to seed...");
  const pool = new pg.Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    // 1. Create default vendor user
    const vendorUser = await prisma.user.upsert({
      where: { email: "vendor@vendorhub.com" },
      update: {},
      create: {
        clerkId: "default_vendor_clerk_id",
        email: "vendor@vendorhub.com",
        name: "Local Vendor Store",
        role: "VENDOR",
      },
    });
    console.log("Seeded Vendor User ID:", vendorUser.id);

    // 2. Create store for the vendor
    const store = await prisma.store.upsert({
      where: { vendorId: vendorUser.id },
      update: {
        status: "APPROVED", // Ensure approved so products are visible
      },
      create: {
        name: "Noida Digital Store",
        description: "Your trustable hyperlocal source for gadgets, accessories, and home decor.",
        location: "Sector 62, Noida, Uttar Pradesh, India",
        status: "APPROVED",
        commission: 10.0,
        vendorId: vendorUser.id,
      },
    });
    console.log("Seeded Store ID:", store.id);

    // 3. Create products
    const productsData = [
      {
        name: "Modern table lamp",
        description: "Modern table lamp with a warm-white dimmable LED bulb and a fabric-wrapped shade that softens the glow. A touch-sensitive base cycles through three brightness levels.",
        price: 29.0,
        stock: 15,
        category: "Decoration",
        images: ["https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=600&q=80", "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=600&q=80"],
      },
      {
        name: "Smart speaker gray",
        description: "Compact smart speaker with 360 room-filling sound, built-in voice assistant support, and Wi-Fi plus Bluetooth 5.0 connectivity.",
        price: 39.0,
        stock: 12,
        category: "Speakers",
        images: ["https://images.unsplash.com/photo-1589003077984-894e133dabab?auto=format&fit=crop&w=600&q=80", "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=600&q=80"],
      },
      {
        name: "Smart watch white",
        description: "Sleek smart watch with a 1.4-inch AMOLED touchscreen, continuous heart-rate and sleep tracking, and 7-day battery life.",
        price: 49.0,
        stock: 10,
        category: "Watch",
        images: ["https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=600&q=80", "https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?auto=format&fit=crop&w=600&q=80"],
      },
      {
        name: "Wireless headphones",
        description: "Over-ear wireless headphones with 30-hour battery life, plush cushioned earcups, and crisp 40mm drivers tuned for balanced bass.",
        price: 59.0,
        stock: 8,
        category: "Wireless headphones",
        images: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80", "https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=600&q=80"],
      },
      {
        name: "Premium wireless earbuds",
        description: "In-ear true wireless earbuds with Active Noise Cancelling (ANC), IPX5 water resistance, and crystal-clear call quality.",
        price: 69.0,
        stock: 20,
        category: "Earphones",
        images: ["https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=600&q=80", "https://images.unsplash.com/photo-1606220588913-b3aacb4d2f4f?auto=format&fit=crop&w=600&q=80"],
      },
      {
        name: "Gaming Laptop Pro",
        description: "High performance gaming laptop with 16GB RAM, 512GB SSD, RTX 4060 graphics, and 144Hz high refresh rate screen.",
        price: 899.0,
        stock: 5,
        category: "Laptop",
        images: ["https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=600&q=80", "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=600&q=80"],
      },
    ];

    console.log("Seeding products...");
    for (const prod of productsData) {
      await prisma.product.create({
        data: {
          name: prod.name,
          description: prod.description,
          price: prod.price,
          stock: prod.stock,
          category: prod.category,
          images: prod.images,
          location: store.location, // Location inherited from store
          storeId: store.id,
        },
      });
    }

    console.log("Successfully seeded all products!");
  } catch (error) {
    console.error("Seeding failed:", error);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
};

run();
