export const runtime = "nodejs";

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
    return Response.json({ ok: false, error: "No file provided" }, { status: 400 });
  }

  await prisma.scan.update({
    where: { id },
    data: {
      status: "PROCESSING",
      engagement: engagement ?? "unknown",
    },
  });

  const resultJson = {
    vendor: "Engie",
    category: "Electricity",
    total: 184.32,
    currency: "EUR",
    period: "Jan 2026",
    verdict: "Potentially overpriced",
    alternatives: [
      {
        provider: "Luminus",
        price: 136.32,
        estimatedSaving: 48,
        url: "https://example.com",
        type: "Fixed",
        green: true,
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
