export const runtime = "nodejs";

import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
ctx: { params: { id: string } }
) {
  const { id } = ctx.params;

  const form = await req.formData();
  const file = form.get("file") as File | null;
  const engagement = (form.get("engagement") as string | null) ?? "unknown";

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
      engagement,
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
    engagement,
    // debug utile pendant le dev, tu peux supprimer après
    debug: {
      receivedFile: true,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
    },
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
