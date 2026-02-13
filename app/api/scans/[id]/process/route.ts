export const runtime = "nodejs";
export const maxDuration = 60;

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { analyzeBill } from "@/lib/analyze-bill";
import { consumeScanCredit, getQuotaStatus } from "@/lib/scan-gate";
import { validateBillForComparison } from "@/lib/bill-validator";

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;

  /* 1. Validate scan exists */
  const existing = await prisma.scan.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ ok: false, error: "Scan not found" }, { status: 404 });
  }

  /* 2. Check quota BEFORE processing */
  const uid = existing.userIdentifier;
  if (uid) {
    const quota = await getQuotaStatus(uid);
    if (!quota.canScan) {
      return NextResponse.json(
        { ok: false, error: "NO_CREDITS", code: "PAYWALL_REQUIRED" },
        { status: 402 }
      );
    }
  }

  /* 3. Read file from FormData */
  let file: File | null = null;
  let engagement = existing.engagement ?? "unknown";

  try {
    const form = await req.formData();
    file = form.get("file") as File | null;
    const engParam = form.get("engagement") as string | null;
    if (engParam) engagement = engParam;
  } catch {
    // FormData parsing failed
  }

  /* 4. Mark as PROCESSING */
  await prisma.scan.update({
    where: { id },
    data: { status: "PROCESSING", engagement },
  });

  try {
    if (!file) throw new Error("NO_FILE");

    const buffer = Buffer.from(await file.arrayBuffer());
    const mimeType = file.type || "image/jpeg";

    /* 5. Run GPT-4o analysis */
    const result = await analyzeBill(buffer, mimeType, engagement);

    /* 6. Validate bill type (detect estimated/schedule bills) */
    const validation = validateBillForComparison({
      subscription_ht_monthly: result.bill.fixed_fees_eur,
      energy_amount_ht_total: result.bill.total_amount_eur,
      total_kwh: result.bill.consumption_kwh,
      raw_text: null, // We don't have raw text from GPT extraction
    });

    if (!validation.valid) {
      const scan = await prisma.scan.update({
        where: { id },
        data: {
          status: "FAILED",
resultJson: JSON.parse(
  JSON.stringify({
    error: validation.code,
    reason: validation.reason,
    bill: result.bill,
  })
),

        },
      });

      return NextResponse.json({
        ok: false,
        scan,
        code: validation.code,
        reason: validation.reason,
      });
    }

    /* 7. Save result & mark DONE */
    const scan = await prisma.scan.update({
      where: { id },
      data: {
        status: "DONE",
        resultJson: JSON.parse(JSON.stringify(result)),
      },
    });

    /* 8. Consume credit AFTER successful scan (prevents double-spend on failures) */
    if (uid) {
      try {
        await consumeScanCredit(uid);
      } catch (err) {
        console.error(`[process] Failed to consume credit for ${uid}:`, err);
        // Don't fail the scan if credit consumption fails
      }
    }

    return NextResponse.json({ ok: true, scan });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error(`[process] Scan ${id} failed:`, message);

    const scan = await prisma.scan.update({
      where: { id },
      data: {
        status: "FAILED",
        resultJson: { error: message },
      },
    });

    return NextResponse.json({ ok: false, scan, error: message });
  }
}
