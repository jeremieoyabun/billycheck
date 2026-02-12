export const runtime = "nodejs";
export const maxDuration = 60; // requires Vercel Pro for >10s

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { analyzeBill } from "@/lib/analyze-bill";
import { Prisma } from "@prisma/client";

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;

  /* ────────────────────────────────
     1. Validate scan exists
  ───────────────────────────────── */
  const existing = await prisma.scan.findUnique({ where: { id } });

  if (!existing) {
    return NextResponse.json(
      { ok: false, error: "Scan not found" },
      { status: 404 }
    );
  }

  /* ────────────────────────────────
     2. Read FormData
  ───────────────────────────────── */
  let file: File | null = null;
  let engagement = existing.engagement ?? "unknown";

  try {
    const form = await req.formData();
    file = form.get("file") as File | null;

    const engParam = form.get("engagement") as string | null;
    if (engParam) engagement = engParam;
  } catch {
    // form parsing failed (retry without file for example)
  }

  /* ────────────────────────────────
     3. Mark as PROCESSING
  ───────────────────────────────── */
  await prisma.scan.update({
    where: { id },
    data: {
      status: "PROCESSING",
      engagement,
    },
  });

  try {
    /* ────────────────────────────────
       4. Validate file
    ───────────────────────────────── */
    if (!file) {
      throw new Error("NO_FILE");
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const mimeType = file.type || "image/jpeg";

    /* ────────────────────────────────
       5. Run analysis
    ───────────────────────────────── */
    const result = await analyzeBill(buffer, mimeType, engagement);

    /* ────────────────────────────────
       6. Save result as JSON safely
    ───────────────────────────────── */
    const scan = await prisma.scan.update({
      where: { id },
      data: {
        status: "DONE",
        resultJson: result as unknown as Prisma.InputJsonValue,
      },
    });

    return NextResponse.json({ ok: true, scan });

  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Unknown processing error";

    console.error(`[process] Scan ${id} failed:`, message);

    const scan = await prisma.scan.update({
      where: { id },
      data: {
        status: "FAILED",
        resultJson: { error: message } as Prisma.InputJsonValue,
      },
    });

    return NextResponse.json({
      ok: false,
      scan,
      error: message,
    });
  }
}
