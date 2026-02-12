import { prisma } from "@/lib/prisma";
import type { NextRequest } from "next/server";

export const runtime = "nodejs";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  console.log("SCAN_GET", {
    id,
    hasDatabaseUrl: !!process.env.DATABASE_URL,
    host:
      process.env.PGHOST ||
      process.env.POSTGRES_HOST ||
      process.env.PGHOST_UNPOOLED ||
      "unknown",
  });

  try {
    const scan = await prisma.scan.findUnique({
      where: { id },
    });

    if (!scan) {
      return Response.json({ error: "Scan not found", id }, { status: 404 });
    }

    return Response.json({ ok: true, scan });
  } catch (e) {
    console.error("SCAN_GET_ERROR", e);
    return Response.json(
      { error: "Failed to fetch scan", id },
      { status: 500 }
    );
  }
}
