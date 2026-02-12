import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  try {
    const scans = await prisma.scan.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return Response.json({ ok: true, scans });
  } catch (e) {
    console.error("SCAN_LIST_ERROR", e);
    return Response.json({ error: "Failed to list scans" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));

  console.log("SCAN_CREATE", {
    mimeType: body.mimeType ?? null,
    size: body.size ?? null,
    hasDatabaseUrl: !!process.env.DATABASE_URL,
    host:
      process.env.PGHOST ||
      process.env.POSTGRES_HOST ||
      process.env.PGHOST_UNPOOLED ||
      "unknown",
  });

  try {
    const scan = await prisma.scan.create({
      data: {
        status: "UPLOADED",
        fileKey: body.fileKey ?? null,
        originalName: body.originalName ?? null,
        mimeType: body.mimeType ?? null,
        size: body.size ?? null,
        engagement: body.engagement ?? null,
      },
    });

    console.log("SCAN_CREATED", { id: scan.id });

    return Response.json({ ok: true, scan });
  } catch (e) {
    console.error("SCAN_CREATE_ERROR", e);
    return Response.json({ error: "Failed to create scan" }, { status: 500 });
  }
}
