import { Webhook } from "svix";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { inngest } from "@/lib/inngest/client";
import { checkRateLimit, WEBHOOK_RATE_LIMIT } from "@/lib/rate-limit";

type ClerkWebhookEvent = {
  type: string;
  data: {
    id: string;
    email_addresses?: Array<{ email_address: string }>;
    first_name?: string | null;
    last_name?: string | null;
    public_metadata?: Record<string, unknown>;
  };
};

export async function POST(req: Request) {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.warn("[VendorHub] CLERK_WEBHOOK_SECRET is not configured. Webhook ignored.");
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
  }

  // Rate limit by IP
  const headerPayload = await headers();
  const clientIp = headerPayload.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

  const rl = checkRateLimit(`webhook:${clientIp}`, WEBHOOK_RATE_LIMIT);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded" },
      { status: 429, headers: { "Retry-After": String(Math.ceil(rl.retryAfterMs / 1000)) } }
    );
  }

  const svixId = headerPayload.get("svix-id");
  const svixTimestamp = headerPayload.get("svix-timestamp");
  const svixSignature = headerPayload.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: "Missing svix headers" }, { status: 400 });
  }

  const payload = await req.text();
  const wh = new Webhook(webhookSecret);

  let event: ClerkWebhookEvent;

  try {
    event = wh.verify(payload, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as ClerkWebhookEvent;
  } catch {
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
  }

  const { type, data } = event;

  switch (type) {
    case "user.created":
      await inngest.send({
        name: "clerk/user.created",
        data: {
          id: data.id,
          email_addresses: data.email_addresses,
          first_name: data.first_name,
          last_name: data.last_name,
          public_metadata: data.public_metadata,
        },
      });
      break;
    case "user.updated":
      await inngest.send({
        name: "clerk/user.updated",
        data: {
          id: data.id,
          email_addresses: data.email_addresses,
          first_name: data.first_name,
          last_name: data.last_name,
        },
      });
      break;
    case "user.deleted":
      await inngest.send({
        name: "clerk/user.deleted",
        data: { id: data.id },
      });
      break;
    default:
      break;
  }

  return NextResponse.json({ received: true });
}
