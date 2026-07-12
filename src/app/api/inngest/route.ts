import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest/client";
import {
  clerkUserCreated,
  clerkUserUpdated,
  clerkUserDeleted,
  checkLowStock,
  scheduledPayouts,
} from "@/lib/inngest/functions";

// Create an API that serves zero-dependency HTTP endpoints to Inngest
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    clerkUserCreated,
    clerkUserUpdated,
    clerkUserDeleted,
    checkLowStock,
    scheduledPayouts,
  ],
});
