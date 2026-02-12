import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;

  const form = await req.formData();
  const file = form.get("file") as File | null;
  const engagement = form.get("engagement") as string | null;

  if (!file) {
    return Response.json(
      { ok: false, error: "No file provided" },
      { status: 400 }
    );
  }

  await prisma.scan.update({
    where: { id },
    data: {
      status: "PROCESSING",
      engagement: engagement ?? "unknown",
    },
  });

  // ---- MOCK RESULT compatible avec INTEGRATION.md ----

  const resultJson = {
    bill: {
      provider: "Engie",
      plan_name: "Flexi Variable",
      total_amount_eur: 184.32,
      consumption_kwh: 640,
      unit_price_eur_kwh: 0.27,
      fixed_fees_eur: 18,
      billing_period: "Jan 2026",
      postal_code: "4000",
      meter_type: "Single",
    },
    offers: [
      {
        provider: "Luminus",
        plan: "Optifix",
        estimated_savings: 48,
        savings_percent: 12,
        price_kwh: 0.24,
        type: "Fixed",
        green: true,
        url: "https://example.com",
      },
    ],
    engagement: engagement ?? "unknown",
  };

  const scan = await prisma.scan.update({
    where: { id },
    data: {
      status: "DONE",
      resultJson,
    },
  });

  return Response.json({ ok: true, scan });
}
