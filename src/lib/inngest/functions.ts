import { inngest } from "./client";
import { prisma } from "../prisma";

// 1. Sync User Creation from Clerk Webhook
export const clerkUserCreated = inngest.createFunction(
  { 
    id: "sync-clerk-user-created",
    triggers: [{ event: "clerk/user.created" }]
  },
  async ({ event, step }) => {
    const { id, email_addresses, first_name, last_name } = event.data;
    const email = email_addresses?.[0]?.email_address;
    const name = `${first_name || ""} ${last_name || ""}`.trim();

    if (!email) return { status: "ignored", reason: "No email address found" };

    // Auto-promote the team leader's email to ADMIN role to ease setup/judging
    const role = email === "dharmenderchauhan802@gmail.com" ? "ADMIN" : "BUYER";

    const user = await step.run("create-user-in-db", async () => {
      return await prisma.user.upsert({
        where: { clerkId: id },
        update: {
          email,
          name,
        },
        create: {
          clerkId: id,
          email,
          name,
          role,
        },
      });
    });

    return { status: "success", userId: user.id, role: user.role };
  }
);

// 2. Sync User Updates from Clerk Webhook
export const clerkUserUpdated = inngest.createFunction(
  { 
    id: "sync-clerk-user-updated",
    triggers: [{ event: "clerk/user.updated" }]
  },
  async ({ event, step }) => {
    const { id, email_addresses, first_name, last_name } = event.data;
    const email = email_addresses?.[0]?.email_address;
    const name = `${first_name || ""} ${last_name || ""}`.trim();

    if (!email) return { status: "ignored", reason: "No email address found" };

    const user = await step.run("update-user-in-db", async () => {
      return await prisma.user.update({
        where: { clerkId: id },
        data: {
          email,
          name,
        },
      });
    });

    return { status: "success", userId: user.id };
  }
);

// 3. Sync User Deletions from Clerk Webhook
export const clerkUserDeleted = inngest.createFunction(
  { 
    id: "sync-clerk-user-deleted",
    triggers: [{ event: "clerk/user.deleted" }]
  },
  async ({ event, step }) => {
    const { id } = event.data;

    await step.run("delete-user-from-db", async () => {
      return await prisma.user.deleteMany({
        where: { clerkId: id },
      });
    });

    return { status: "success", deletedClerkId: id };
  }
);
