export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { getUserIdentifier, setUserIdCookie } from "@/lib/user-id.server";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    let uid = body.userIdentifier as string | undefined;

    // Fallback to server-side identification
    if (!uid) {
      uid = await getUserIdentifier(req);
    }

    await setUserIdCookie(uid);

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card", "bancontact"],
      // Apple Pay & Google Pay are auto-enabled with card when configured in Stripe Dashboard
      line_items: [
        {
          price_data: {
            currency: "eur",
            unit_amount: 99, // 0,99 €
            product_data: {
              name: "BillyCheck - Analyse de facture",
              description: "1 analyse de facture d'électricité",
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        userIdentifier: uid,
      },
      success_url: `${appUrl}/scan?payment=success`,
      cancel_url: `${appUrl}/paywall?payment=cancelled`,
    });

    // Track the payment
    await prisma.stripePayment.create({
      data: {
        sessionId: session.id,
        userIdentifier: uid,
        amountCents: 99,
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
