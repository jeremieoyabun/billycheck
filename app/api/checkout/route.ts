export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { getUserIdentifier, setUserIdCookie } from "@/lib/user-id.server";

const SCAN_PRICE_CENTS = 499; // 4,99 €

export async function POST(req: Request) {
  try {
    if (!stripe) {
      return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
    }

    const body = await req.json().catch(() => ({} as any));
    let uid: string | undefined = body?.userIdentifier;

    if (!uid) {
      uid = await getUserIdentifier(req);
    }

    await setUserIdCookie(uid);

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      // card => Apple Pay + Google Pay si activés côté Stripe
      payment_method_types: ["card", "bancontact"],
      line_items: [
        {
          price_data: {
            currency: "eur",
            unit_amount: SCAN_PRICE_CENTS, // 4,99 €
            product_data: {
              name: "BillyCheck - Scan supplémentaire",
              description: "1 scan supplémentaire (après 2 scans gratuits)",
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        userIdentifier: uid,
        product: "extra_scan",
        unitAmountCents: String(SCAN_PRICE_CENTS),
      },
      success_url: `${appUrl}/scan?payment=success`,
      cancel_url: `${appUrl}/paywall?payment=cancelled`,
    });

    await prisma.stripePayment.create({
      data: {
        sessionId: session.id,
        userIdentifier: uid,
        amountCents: SCAN_PRICE_CENTS,
        status: "pending",
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[checkout] Error:", err);
    return NextResponse.json(
      { error: "Impossible de créer la session de paiement" },
      { status: 500 }
    );
  }
}
