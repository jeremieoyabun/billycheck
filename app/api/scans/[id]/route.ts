import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/* ──────────────────────────────────────────────
   GET /api/scans/[id]
   Returns a single scan by ID.
   Next 16: params is a Promise.
   ────────────────────────────────────────────── */
export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;

  const scan = await prisma.scan.findUnique({ where: { id } });

  if (!scan) {
    return NextResponse.json({ error: "Scan not found" }, { status: 404 });
  }

  return NextResponse.json({
    id: scan.id,
    status: scan.status,
    originalName: scan.originalName,
    mimeType: scan.mimeType,
    size: scan.size,
    resultJson: scan.resultJson,
    createdAt: scan.createdAt,
   
  });
}

/* ──────────────────────────────────────────────
   DELETE /api/scans/[id]
   Soft-deletes or hard-deletes a scan (GDPR).
   ────────────────────────────────────────────── */
export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;

  const scan = await prisma.scan.findUnique({ where: { id } });

  if (!scan) {
    return NextResponse.json({ error: "Scan not found" }, { status: 404 });
  }

  /* Hard delete – full GDPR compliance */
  await prisma.scan.delete({ where: { id } });

  return NextResponse.json({ deleted: true });
}
