export const runtime = "nodejs";
export const maxDuration = 60; // seconds — needs Vercel Pro for >10s

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { analyzeBill } from "@/lib/analyze-bill";

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;

  /* ── 1. Validate the scan exists ── */
  const existing = await prisma.scan.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json(
      { ok: false, error: "Scan not found" },
      { status: 404 }
    );
  }

  /* ── 2. Read file from FormData ── */
  let file: File | null = null;
  let engagement = existing.engagement ?? "unknown";

  try {
    const form = await req.formData();
    file = form.get("file") as File | null;
    const engParam = form.get("engagement") as string | null;
    if (engParam) engagement = engParam;
  } catch {
    // FormData parsing failed — might be a retry without file
  }

  /* ── 3. Mark as PROCESSING ── */
  await prisma.scan.update({
    where: { id },
    data: { status: "PROCESSING", engagement },
  });

  try {
    /* ── 4. Get the file buffer ── */
    if (!file) {
      throw new Error("NO_FILE");
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const mimeType = file.type || "image/jpeg";

    /* ── 5. Run the analysis (GPT-4o + comparison) ── */
    const result = await analyzeBill(buffer, mimeType, engagement);

    /* ── 6. Save result & mark DONE ── */
    const scan = await prisma.scan.update({
      where: { id },
      data: {
        status: "DONE",
        resultJson: result,
      },
    });

    return NextResponse.json({ ok: true, scan });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Unknown processing error";

    console.error(`[process] Scan ${id} failed:`, message);

    /* ── Mark as FAILED with the error reason ── */
    const scan = await prisma.scan.update({
      where: { id },
      data: {
        status: "FAILED",
        resultJson: { error: message },
      },
    });

    // Return 200 with FAILED status so the client can read the error
    // (a 500 would prevent the client from reading the response body in some cases)
    return NextResponse.json({ ok: false, scan, error: message });
  }
}
