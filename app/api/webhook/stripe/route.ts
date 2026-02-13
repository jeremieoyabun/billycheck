export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { grantPaidCredit } from "@/lib/scan-gate";

export async function POST(req: Request) {
  // Stripe not configured → avoid build/runtime crash
  if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) {
    return new Response("Stripe not configured", { status: 503 });
  }

  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json(
      { error: "Missing signature" },
      { status: 400 }
    );
  }

  const body = await req.text();

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("[webhook] Signature verification failed:", err);
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }

  // ✅ Payment completed
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as any;
    const uid = session.metadata?.userIdentifier;

    if (!uid) {
      console.error("[webhook] No userIdentifier in session metadata");
      return NextResponse.json(
        { error: "Missing user ID" },
        { status: 400 }
      );
    }

    try {
      // Update payment status
      await prisma.stripePayment.updateMany({
        where: { sessionId: session.id },
        data: { status: "completed" },
      });

      // Grant 1 scan credit
      await grantPaidCredit(uid, 1);

      console.log(
        `[webhook] Granted 1 credit to ${uid} (session ${session.id})`
      );
    } catch (err) {
      console.error("[webhook] DB update failed:", err);
      return NextResponse.json(
        { error: "Database error" },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ received: true });
}
