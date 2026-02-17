export const runtime = "nodejs";
export const maxDuration = 60;

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { analyzeBill } from "@/lib/analyze-bill";
import { consumeScanCredit, getQuotaStatus } from "@/lib/scan-gate";

/* ──────────────────────────────────────────────
   Version tag — change this on every deploy
   to prove Vercel is running YOUR code
   ────────────────────────────────────────────── */
const ROUTE_VERSION = "PROCESS-V9-2026-02-17";

/* ──────────────────────────────────────────────
   Helpers
   ────────────────────────────────────────────── */
function toNumberFR(v: unknown): number | null {
  if (v === null || v === undefined) return null;
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  const s = String(v)
    .replace(/\u00A0/g, " ")
    .replace(/\s/g, "")
    .replace("€", "")
    .replace(",", ".");
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

function normalizeBillNumbers(bill: any) {
  if (!bill || typeof bill !== "object") return bill;
  return {
    ...bill,
    energy_unit_price_eur_kwh: toNumberFR(bill.energy_unit_price_eur_kwh),
    consumption_kwh_annual: toNumberFR(bill.consumption_kwh_annual),
    subscription_annual_ht_eur: toNumberFR(bill.subscription_annual_ht_eur),
    total_annual_htva_eur: toNumberFR(bill.total_annual_htva_eur),
    total_annual_ttc_eur: toNumberFR(bill.total_annual_ttc_eur),
    hp_unit_price_eur_kwh: toNumberFR(bill.hp_unit_price_eur_kwh),
    hc_unit_price_eur_kwh: toNumberFR(bill.hc_unit_price_eur_kwh),
    hp_consumption_kwh: toNumberFR(bill.hp_consumption_kwh),
    hc_consumption_kwh: toNumberFR(bill.hc_consumption_kwh),
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
    bill?.total_amount_eur != null ||
    bill?.consumption_kwh != null ||
    bill?.unit_price_eur_kwh != null ||
    bill?.fixed_fees_eur != null
  );
}

function inferMimeType(file: File): string {
  const name = (file.name || "").toLowerCase().trim();
  if (name.endsWith(".pdf")) return "application/pdf";
  if (name.endsWith(".png")) return "image/png";
  if (name.endsWith(".webp")) return "image/webp";
  if (name.endsWith(".jpg") || name.endsWith(".jpeg")) return "image/jpeg";
  const t = (file.type || "").toLowerCase().trim();
  if (t) return t;
  return "application/octet-stream";
}

function clampVatRate(v: number) {
  if (!Number.isFinite(v)) return 0;
  return Math.max(0, Math.min(30, v));
}

function pickFirstNumber(...vals: any[]): number | null {
  for (const v of vals) {
    if (typeof v === "number" && Number.isFinite(v)) return v;
  }
  return null;
}

function inferAnnualTTC(bill: any) {
  if (!bill) return bill;
  if (typeof bill.total_annual_ttc_eur === "number") return bill;

  const annualHT = pickFirstNumber(
    bill.total_annual_htva_eur,
    bill.total_annual_ht_eur,
    bill.total_amount_eur,
    bill.total_htva_eur,
    bill.total_ht_eur
  );
  if (annualHT == null) return bill;

  const country = ((bill.country as string) ?? "").toUpperCase();
  let ttc: number;

  if (country === "FR") {
    // France: 5.5% on subscription, 20% on the rest
    const sub = pickFirstNumber(bill.subscription_annual_ht_eur) ?? 0;
    ttc = Math.round((sub * 1.055 + (annualHT - sub) * 1.20) * 100) / 100;
  } else {
    // Belgium (default): flat 6%
    ttc = Math.round(annualHT * 1.06 * 100) / 100;
  }

  bill.total_annual_ttc_eur = ttc;
  bill.total_annual_ttc_inferred = true;
  return bill;
}

/* ──────────────────────────────────────────────
   POST handler
   ────────────────────────────────────────────── */
export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;

  // ╔══════════════════════════════════════════╗
  // ║  HARD MARKER — if you see this in the   ║
  // ║  response, the deploy is up to date     ║
  // ╚══════════════════════════════════════════╝
  console.log(`████ ${ROUTE_VERSION} ████ scan=${id} ████`);

  // 1) Validate scan exists
  const existing = await prisma.scan.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json(
      { ok: false, error: "Scan not found", _v: ROUTE_VERSION },
      { status: 404 }
    );
  }

  // 2) Check quota
  const uid = existing.userIdentifier ?? null;
  if (uid) {
    const quota = await getQuotaStatus(uid);
    if (!quota.canScan) {
      return NextResponse.json(
        { ok: false, error: "NO_CREDITS", code: "PAYWALL_REQUIRED", _v: ROUTE_VERSION },
        { status: 402 }
      );
    }
  }

  // 3) Read file from FormData
  let file: File | null = null;
  let engagement: "yes" | "no" | "unknown" = (existing.engagement as any) ?? "unknown";

  try {
    const form = await req.formData();
    const maybeFile = form.get("file");
    const engParam = form.get("engagement");

    if (typeof engParam === "string" && ["yes", "no", "unknown"].includes(engParam)) {
      engagement = engParam as "yes" | "no" | "unknown";
    }

    if (maybeFile instanceof File) {
      file = maybeFile;
      console.log(`[process][${ROUTE_VERSION}] file OK`, {
        id,
        name: file.name,
        type: file.type,
        size: file.size,
      });
    } else {
      console.log(`[process][${ROUTE_VERSION}] NO FILE in formData`, {
        id,
        gotType: typeof maybeFile,
        gotValue: String(maybeFile)?.slice(0, 100),
      });
    }
  } catch (e) {
    console.log(`[process][${ROUTE_VERSION}] formData parsing FAILED`, {
      id,
      error: String(e),
    });
  }

  // ══════════════════════════════════════════
  //  GUARD: if no file, fail immediately
  //  (don't even try to analyze)
  // ══════════════════════════════════════════
  if (!file) {
    const scan = await prisma.scan.update({
      where: { id },
      data: {
        status: "FAILED",
        engagement,
        resultJson: JSON.parse(JSON.stringify({
          error: "NO_FILE_IN_FORMDATA",
          reason: "Le fichier n'a pas été reçu dans la requête. Réessayez.",
          _v: ROUTE_VERSION,
        })),
      },
    });
    return NextResponse.json({
      ok: false,
      scan,
      error: "NO_FILE_IN_FORMDATA",
      _v: ROUTE_VERSION,
    });
  }

  // 4) Convert file to Buffer + infer MIME
  const buffer = Buffer.from(await file.arrayBuffer());
  const mimeType = inferMimeType(file);

  console.log(`[process][${ROUTE_VERSION}] buffer ready`, {
    id,
    mimeType,
    bufferLength: buffer.length,
    firstBytes: buffer.slice(0, 8).toString("hex"),
  });

  // ══════════════════════════════════════════
  //  GUARD: buffer must be non-empty
  // ══════════════════════════════════════════
  if (!buffer || buffer.length === 0) {
    const scan = await prisma.scan.update({
      where: { id },
      data: {
        status: "FAILED",
        engagement,
        resultJson: JSON.parse(JSON.stringify({
          error: "EMPTY_FILE_BUFFER",
          reason: "Le fichier reçu est vide (0 bytes).",
          _v: ROUTE_VERSION,
        })),
      },
    });
    return NextResponse.json({
      ok: false,
      scan,
      error: "EMPTY_FILE_BUFFER",
      _v: ROUTE_VERSION,
    });
  }

  // 5) Mark PROCESSING
  await prisma.scan.update({
    where: { id },
    data: { status: "PROCESSING", engagement },
  });

  try {
    // 5.1) Consume credit
    if (uid) {
      try {
        await consumeScanCredit(uid);
      } catch (err) {
        console.error(`[process] Failed to consume credit for ${uid}:`, err);
        return NextResponse.json(
          { ok: false, error: "NO_CREDITS", code: "PAYWALL_REQUIRED", _v: ROUTE_VERSION },
          { status: 402 }
        );
      }
    }

    // 6) Run analysis (this is where GPT is called)
    console.log(`[process][${ROUTE_VERSION}] calling analyzeBill`, {
      id,
      mimeType,
      bufferLength: buffer.length,
    });

    const result = await analyzeBill(buffer, mimeType, engagement);

    // 7) Normalize & enrich
    const normalizedBill = normalizeBillNumbers(result?.bill);
    inferAnnualTTC(normalizedBill);

    // Heuristique: abonnement mensuel -> annualise
    if (
      normalizedBill &&
      typeof normalizedBill.subscription_annual_ht_eur === "number" &&
      normalizedBill.subscription_annual_ht_eur >= 5 &&
      normalizedBill.subscription_annual_ht_eur <= 20
    ) {
      normalizedBill.subscription_annual_ht_eur = Number(
        (normalizedBill.subscription_annual_ht_eur * 12).toFixed(2)
      );
      normalizedBill.subscription_inferred_monthly = true;
    }

    const normalizedResult = { ...result, bill: normalizedBill };

    // 8) Empty extraction
    if (!hasUsefulData(normalizedBill)) {
      const scan = await prisma.scan.update({
        where: { id },
        data: {
          status: "DONE",
          resultJson: JSON.parse(JSON.stringify({
            ...normalizedResult,
            error: "EMPTY_EXTRACTION",
            reason: "Aucune donnée exploitable extraite.",
            _v: ROUTE_VERSION,
          })),
        },
      });
      return NextResponse.json({ ok: true, scan, code: "EMPTY_EXTRACTION", _v: ROUTE_VERSION });
    }

    // 9) Needs annual invoice
    if (normalizedResult?.bill?.needs_full_annual_invoice === true) {
      const scan = await prisma.scan.update({
        where: { id },
        data: {
          status: "DONE",
          resultJson: JSON.parse(JSON.stringify({ ...normalizedResult, _v: ROUTE_VERSION })),
        },
      });
      return NextResponse.json({ ok: true, scan, code: "NEEDS_ANNUAL_INVOICE", _v: ROUTE_VERSION });
    }

    // 10) Success
    const scan = await prisma.scan.update({
      where: { id },
      data: {
        status: "DONE",
        resultJson: JSON.parse(JSON.stringify({ ...normalizedResult, _v: ROUTE_VERSION })),
      },
    });
    return NextResponse.json({ ok: true, scan, _v: ROUTE_VERSION });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error(`[process][${ROUTE_VERSION}] Scan ${id} FAILED:`, message);

    // PDF scanné (pas de texte)
    if (message === "PDF_SCANNED_NEEDS_PHOTO") {
      const scan = await prisma.scan.update({
        where: { id },
        data: {
          status: "DONE",
          resultJson: JSON.parse(JSON.stringify({
            error: "PDF_SCANNED_NEEDS_PHOTO",
            reason: "Ce PDF semble être un scan (image) sans texte extractible. Envoie une photo nette de ta facture.",
            _v: ROUTE_VERSION,
          })),
        },
      });
      return NextResponse.json({ ok: true, scan, code: "PDF_SCANNED_NEEDS_PHOTO", _v: ROUTE_VERSION });
    }

    // PDF vide / pas de texte
    if (message === "PDF_TEXT_EMPTY" || message === "PDF_NO_TEXT" || message === "PDF_BUFFER_EMPTY") {
      const scan = await prisma.scan.update({
        where: { id },
        data: {
          status: "DONE",
          resultJson: JSON.parse(JSON.stringify({
            error: message,
            reason: "PDF scanné ou texte non extractible.",
            _v: ROUTE_VERSION,
          })),
        },
      });
      return NextResponse.json({ ok: true, scan, code: message, _v: ROUTE_VERSION });
    }

    // Toute autre erreur
    const scan = await prisma.scan.update({
      where: { id },
      data: {
        status: "FAILED",
        resultJson: JSON.parse(JSON.stringify({ error: message, _v: ROUTE_VERSION })),
      },
    });
    return NextResponse.json({ ok: false, scan, error: message, _v: ROUTE_VERSION });
  }
}
