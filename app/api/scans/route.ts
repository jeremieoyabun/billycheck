import { prisma } from "@/lib/prisma";

export async function GET() {
  const scans = await prisma.scan.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return Response.json({ ok: true, scans });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));

  const scan = await prisma.scan.create({
    data: {
      status: "UPLOADED",
      fileKey: body.fileKey ?? null,
      originalName: body.originalName ?? null,
      mimeType: body.mimeType ?? null,
      size: body.size ?? null,
      engagement: body.engagement ?? null, // ← FIX: was missing
    },
  });

  return Response.json({ ok: true, scan });
}
