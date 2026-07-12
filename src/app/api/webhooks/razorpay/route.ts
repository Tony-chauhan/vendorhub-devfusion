import Razorpay from "razorpay";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isMockDb } from "@/lib/env";
import { checkRateLimit, WEBHOOK_RATE_LIMIT } from "@/lib/rate-limit";
import { sendEmail, orderConfirmationEmail } from "@/lib/notifications/email";

interface RazorpayWebhookPayload {
  event: string;
  payload: {
    payment?: {
      entity: {
        id: string;
        order_id: string;
        status: string;
      };
    };
  };
}

export async function POST(req: Request) {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.warn("[VendorHub] RAZORPAY_WEBHOOK_SECRET is not configured. Webhook ignored.");
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
  }

  // Rate limit by IP
  const headerPayload = await headers();
  const clientIp = headerPayload.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

  const rl = await checkRateLimit(`razorpay-webhook:${clientIp}`, WEBHOOK_RATE_LIMIT);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded" },
      { status: 429, headers: { "Retry-After": String(Math.ceil(rl.retryAfterMs / 1000)) } }
    );
  }

  const signature = headerPayload.get("x-razorpay-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing Razorpay signature header" }, { status: 400 });
  }

  const rawBody = await req.text();

  let isValid: boolean;
  try {
    isValid = Razorpay.validateWebhookSignature(rawBody, signature, webhookSecret);
  } catch {
    isValid = false;
  }

  if (!isValid) {
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
  }

  let event: RazorpayWebhookPayload;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  if (isMockDb()) {
    return NextResponse.json({ received: true });
  }

  const payment = event.payload?.payment?.entity;

  switch (event.event) {
    case "payment.captured": {
      if (payment?.order_id) {
        // Idempotent: only orders still PENDING get transitioned. A retried
        // delivery of an already-processed event is a safe no-op — the
        // updateMany's where clause won't match a second time, so the
        // notification below only fires on the transition that actually happened.
        const updated = await prisma.order.updateMany({
          where: { razorpayOrderId: payment.order_id, paymentStatus: "PENDING" },
          data: {
            paymentStatus: "PAID",
            razorpayPaymentId: payment.id,
            status: "CONFIRMED",
          },
        });

        if (updated.count > 0) {
          const order = await prisma.order.findFirst({
            where: { razorpayOrderId: payment.order_id },
            include: { buyer: { select: { email: true } }, orderItems: true },
          });

          if (order?.buyer?.email) {
            const { subject, html } = orderConfirmationEmail({
              orderNumber: order.orderNumber,
              totalAmount: order.totalAmount,
              itemCount: order.orderItems.length,
            });
            await sendEmail({ to: order.buyer.email, subject, html });
          }
        }
      }
      break;
    }
    case "payment.failed": {
      if (payment?.order_id) {
        const order = await prisma.order.findFirst({
          where: { razorpayOrderId: payment.order_id, paymentStatus: "PENDING" },
          include: { orderItems: true },
        });

        if (order) {
          // Release the stock reserved at order-creation time since the payment
          // never went through.
          await prisma.$transaction(async (tx) => {
            for (const item of order.orderItems) {
              await tx.product.update({
                where: { id: item.productId },
                data: { stock: { increment: item.quantity } },
              });
            }
            await tx.order.update({
              where: { id: order.id },
              data: { paymentStatus: "FAILED" },
            });
          });
        }
      }
      break;
    }
    default:
      break;
  }

  return NextResponse.json({ received: true });
}
