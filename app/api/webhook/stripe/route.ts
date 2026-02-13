export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { grantPaidCredit } from "@/lib/scan-gate";

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("[webhook] Signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const uid = session.metadata?.userIdentifier;

    if (!uid) {
      console.error("[webhook] No userIdentifier in session metadata");
      return NextResponse.json({ error: "Missing user ID" }, { status: 400 });
    }

    // Update payment status
    await prisma.stripePayment.updateMany({
      where: { sessionId: session.id },
      data: { status: "completed" },
    });

    // Grant 1 scan credit
    await grantPaidCredit(uid, 1);

    console.log(`[webhook] Granted 1 credit to ${uid} (session ${session.id})`);
  }

  return NextResponse.json({ received: true });
}
