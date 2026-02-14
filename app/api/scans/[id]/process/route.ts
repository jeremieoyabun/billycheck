export const runtime = "nodejs";
export const maxDuration = 60;

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { analyzeBill } from "@/lib/analyze-bill";
import { consumeScanCredit, getQuotaStatus } from "@/lib/scan-gate";

/* ──────────────────────────────────────────────
   Helpers
   ────────────────────────────────────────────── */
function toNumberFR(v: unknown): number | null {
  if (v === null || v === undefined) return null;
  if (typeof v === "number") return Number.isFinite(v) ? v : null;

  const s = String(v)
    .replace(/\u00A0/g, " ") // NBSP -> space
    .replace(/\s/g, "") // remove spaces
    .replace("€", "")
    .replace(",", "."); // FR comma -> dot

  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

function normalizeBillNumbers(bill: any) {
  if (!bill || typeof bill !== "object") return bill;

  return {
    ...bill,

    // Nouveau modèle
    energy_unit_price_eur_kwh: toNumberFR(bill.energy_unit_price_eur_kwh),
    consumption_kwh_annual: toNumberFR(bill.consumption_kwh_annual),
    subscription_annual_ht_eur: toNumberFR(bill.subscription_annual_ht_eur),
    total_annual_ttc_eur: toNumberFR(bill.total_annual_ttc_eur),

    hp_unit_price_eur_kwh: toNumberFR(bill.hp_unit_price_eur_kwh),
    hc_unit_price_eur_kwh: toNumberFR(bill.hc_unit_price_eur_kwh),
    hp_consumption_kwh: toNumberFR(bill.hp_consumption_kwh),
    hc_consumption_kwh: toNumberFR(bill.hc_consumption_kwh),

    // Legacy (si jamais encore présent)
    total_amount_eur: toNumberFR(bill.total_amount_eur),
    consumption_kwh: toNumberFR(bill.consumption_kwh),
    unit_price_eur_kwh: toNumberFR(bill.unit_price_eur_kwh),
    fixed_fees_eur: toNumberFR(bill.fixed_fees_eur),
  };
}

function hasUsefulData(bill: any) {
  return (
    bill?.energy_unit_price_eur_kwh != null ||
    bill?.consumption_kwh_annual != null ||
    bill?.subscription_annual_ht_eur != null ||
    bill?.total_annual_ttc_eur != null ||
    // legacy fallback
    bill?.total_amount_eur != null ||
    bill?.consumption_kwh != null ||
    bill?.unit_price_eur_kwh != null ||
    bill?.fixed_fees_eur != null
  );
}

function inferMimeType(file: File) {
  if (file.type) return file.type;
  const name = (file.name || "").toLowerCase();
  if (name.endsWith(".pdf")) return "application/pdf";
  if (name.endsWith(".png")) return "image/png";
  if (name.endsWith(".webp")) return "image/webp";
  return "image/jpeg";
}

/* ──────────────────────────────────────────────
   Route
   ────────────────────────────────────────────── */
export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;

  // 1) Validate scan exists
  const existing = await prisma.scan.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ ok: false, error: "Scan not found" }, { status: 404 });
  }

  // 2) Check quota BEFORE processing
  const uid = existing.userIdentifier ?? null;
  if (uid) {
    const quota = await getQuotaStatus(uid);
    if (!quota.canScan) {
      return NextResponse.json(
        { ok: false, error: "NO_CREDITS", code: "PAYWALL_REQUIRED" },
        { status: 402 }
      );
    }
  }

  // 3) Read file from FormData
  let file: File | null = null;
  let engagement = existing.engagement ?? "unknown";

  try {
    const form = await req.formData();
    const maybeFile = form.get("file");
    const engParam = form.get("engagement");

    if (typeof engParam === "string" && engParam) engagement = engParam;

    if (maybeFile instanceof File) {
      file = maybeFile;
      console.log("[process] file received", {
        id,
        name: file.name,
        type: file.type,
        size: file.size,
      });
    } else {
      console.log("[process] no file in formData", { id, got: typeof maybeFile });
    }
  } catch (e) {
    console.log("[process] formData parsing failed", { id, error: String(e) });
  }

  // 4) Mark as PROCESSING
  await prisma.scan.update({
    where: { id },
    data: { status: "PROCESSING", engagement },
  });

  try {
    if (!file) throw new Error("NO_FILE");

    const buffer = Buffer.from(await file.arrayBuffer());
    const mimeType = inferMimeType(file);

    // 5) Run analysis
    const result = await analyzeBill(buffer, mimeType, engagement);

    // Normalize numbers FR
    const normalizedBill = normalizeBillNumbers(result?.bill);
    const normalizedResult = { ...result, bill: normalizedBill };

    // If nothing usable extracted, return explicit error (and store it)
    if (!hasUsefulData(normalizedBill)) {
      const scan = await prisma.scan.update({
        where: { id },
        data: {
          status: "FAILED",
          resultJson: JSON.parse(
            JSON.stringify({
              error: "EMPTY_EXTRACTION",
              bill: normalizedBill,
            })
          ),
        },
      });

      return NextResponse.json({
        ok: false,
        scan,
        code: "EMPTY_EXTRACTION",
        error: "Aucune donnée exploitable extraite",
      });
    }

    // ✅ If annual invoice required: store DONE anyway (UI can show CTA), offers will be empty.
    if (normalizedResult?.bill?.needs_full_annual_invoice) {
      const scan = await prisma.scan.update({
        where: { id },
        data: {
          status: "DONE",
          resultJson: JSON.parse(JSON.stringify(normalizedResult)),
        },
      });

      if (uid) {
        try {
          await consumeScanCredit(uid);
        } catch (err) {
          console.error(`[process] Failed to consume credit for ${uid}:`, err);
        }
      }

      return NextResponse.json({ ok: true, scan, code: "NEEDS_ANNUAL_INVOICE" });
    }

    // 6) Save result & mark DONE
    const scan = await prisma.scan.update({
      where: { id },
      data: {
        status: "DONE",
        resultJson: JSON.parse(JSON.stringify(normalizedResult)),
      },
    });

    // 7) Consume credit AFTER successful scan
    if (uid) {
      try {
        await consumeScanCredit(uid);
      } catch (err) {
        console.error(`[process] Failed to consume credit for ${uid}:`, err);
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
        resultJson: JSON.parse(JSON.stringify({ error: message })),
      },
    });

    return NextResponse.json({ ok: false, scan, error: message });
  }
}
