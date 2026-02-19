import Stripe from "stripe";
import { NextResponse } from "next/server";
import { grantPaidCredit } from "@/lib/scan-gate";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2026-01-28.clover",
});

export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature");
  if (!sig) return NextResponse.json({ error: "Missing stripe-signature" }, { status: 400 });

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret)
    return NextResponse.json({ error: "Missing STRIPE_WEBHOOK_SECRET" }, { status: 500 });

  let event: Stripe.Event;
  try {
    const body = await req.text();
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err: unknown) {
    return NextResponse.json(
      { error: `Webhook signature verification failed: ${err instanceof Error ? err.message : "unknown"}` },
      { status: 400 }
    );
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      const uid = session.metadata?.userIdentifier || session.client_reference_id;
      if (!uid) {
        console.error("[stripe-webhook] Missing userIdentifier", { sessionId: session.id });
        return NextResponse.json({ received: true, warning: "missing_userIdentifier" });
      }

      const credits = Number(session.metadata?.credits ?? "1") || 1;

      await grantPaidCredit(uid, credits);

      console.log("[stripe-webhook] credits added", { uid, credits, sessionId: session.id });
    }
  } catch (err: unknown) {
    console.error("[stripe-webhook] Handler error", err);
    return NextResponse.json(
      { error: `Webhook handler error: ${err instanceof Error ? err.message : "unknown"}` },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true });
}
