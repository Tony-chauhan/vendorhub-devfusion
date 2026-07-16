import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const run = async () => {
  const connectionString = process.env.DATABASE_URL;
  console.log("Connecting to:", connectionString?.split("@")[1]); // print host without password
  const pool = new pg.Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    const userCount = await prisma.user.count();
    const orderCount = await prisma.order.count();
    const productCount = await prisma.product.count();
    const storeCount = await prisma.store.count();
    console.log(`User count: ${userCount}`);
    console.log(`Order count: ${orderCount}`);
    console.log(`Product count: ${productCount}`);
    console.log(`Store count: ${storeCount}`);
    if (userCount > 0) {
      const users = await prisma.user.findMany({ take: 5 });
      console.log("Users:", users.map(u => ({ id: u.id, email: u.email, clerkId: u.clerkId })));
    }
  } catch (e) {
    console.error("DB Query error:", e);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
};

run();
