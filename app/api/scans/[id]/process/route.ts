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

    // Nouveau modèle
    energy_unit_price_eur_kwh: toNumberFR(bill.energy_unit_price_eur_kwh),
    consumption_kwh_annual: toNumberFR(bill.consumption_kwh_annual),
    subscription_annual_ht_eur: toNumberFR(bill.subscription_annual_ht_eur),
    total_annual_ttc_eur: toNumberFR(bill.total_annual_ttc_eur),

    hp_unit_price_eur_kwh: toNumberFR(bill.hp_unit_price_eur_kwh),
    hc_unit_price_eur_kwh: toNumberFR(bill.hc_unit_price_eur_kwh),
    hp_consumption_kwh: toNumberFR(bill.hp_consumption_kwh),
    hc_consumption_kwh: toNumberFR(bill.hc_consumption_kwh),

    // Legacy (au cas où)
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
    // legacy
    bill?.total_amount_eur != null ||
    bill?.consumption_kwh != null ||
    bill?.unit_price_eur_kwh != null ||
    bill?.fixed_fees_eur != null
  );
}

/**
 * MIME inference robuste:
 * - priorité à l'extension du nom (plus fiable que file.type)
 * - fallback file.type si dispo
 */
function inferMimeType(file: File) {
  const name = (file.name || "").toLowerCase().trim();
  if (name.endsWith(".pdf")) return "application/pdf";
  if (name.endsWith(".png")) return "image/png";
  if (name.endsWith(".webp")) return "image/webp";
  if (name.endsWith(".jpg") || name.endsWith(".jpeg")) return "image/jpeg";

  const t = (file.type || "").toLowerCase().trim();
  if (t) return t;

  return "application/octet-stream";
}

/* ──────────────────────────────────────────────
   TTC inference helpers
────────────────────────────────────────────── */
function clampVatRate(v: number) {
  if (!Number.isFinite(v)) return 0;
  if (v < 0) return 0;
  if (v > 30) return 30;
  return v;
}

function pickFirstNumber(...vals: any[]): number | null {
  for (const v of vals) {
    if (typeof v === "number" && Number.isFinite(v)) return v;
  }
  return null;
}

function inferVatRate(bill: any): number | null {
  const direct = pickFirstNumber(bill?.vat_rate, bill?.tva_rate, bill?.vat_percent);
  if (direct != null) return clampVatRate(direct);
  return 6; // fallback BE fréquent
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

  const vatRate = inferVatRate(bill);
  if (vatRate == null) return bill;

  const ttc = Math.round(annualHT * (1 + vatRate / 100) * 100) / 100;

  if (typeof bill.total_amount_eur === "number") {
    const legacy = bill.total_amount_eur;
    const diff = Math.abs(legacy - ttc);
    const rel = legacy > 0 ? diff / legacy : 0;
    if (rel < 0.02) {
      bill.total_annual_ttc_eur = legacy;
      bill.total_annual_ttc_inferred = true;
      bill.total_annual_ttc_source = "legacy_total_amount_eur";
      return bill;
    }
  }

  bill.total_annual_ttc_eur = ttc;
  bill.total_annual_ttc_inferred = true;
  bill.total_annual_ttc_source = "inferred_from_ht_plus_vat";
  bill.vat_rate_inferred = vatRate;

  return bill;
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

  // 3) Read file from FormData + engagement
  let file: File | null = null;
  let engagement: "yes" | "no" | "unknown" = (existing.engagement as any) ?? "unknown";

  try {
    const form = await req.formData();
    const maybeFile = form.get("file");
    const engParam = form.get("engagement");

    if (typeof engParam === "string" && (engParam === "yes" || engParam === "no" || engParam === "unknown")) {
      engagement = engParam;
    }

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

    // Debug ultra utile
    console.log("[process] inferred mime", {
      id,
      fileName: file.name,
      fileType: file.type,
      inferred: mimeType,
    });

    // 4.1) Consume credit NOW (one attempt = one scan)
    if (uid) {
      try {
        await consumeScanCredit(uid);
      } catch (err) {
        console.error(`[process] Failed to consume credit for ${uid}:`, err);
        return NextResponse.json(
          { ok: false, error: "NO_CREDITS", code: "PAYWALL_REQUIRED" },
          { status: 402 }
        );
      }
    }

    // 5) Run analysis
    const result = await analyzeBill(buffer, mimeType, engagement);

    // 6) Normalize & enrich bill
    const normalizedBill = normalizeBillNumbers(result?.bill);
    inferAnnualTTC(normalizedBill);

    // Heuristique: abonnement mensuel détecté -> annualise
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

    // 7) Extraction vide -> DONE (cas métier)
    if (!hasUsefulData(normalizedBill)) {
      const scan = await prisma.scan.update({
        where: { id },
        data: {
          status: "DONE",
          resultJson: JSON.parse(
            JSON.stringify({
              ...normalizedResult,
              error: "EMPTY_EXTRACTION",
              reason: "Aucune donnée exploitable extraite.",
            })
          ),
        },
      });

      return NextResponse.json({ ok: true, scan, code: "EMPTY_EXTRACTION" });
    }

    // 8) Besoin facture annuelle -> DONE (cas métier)
    const needsAnnual = normalizedResult?.bill?.needs_full_annual_invoice === true;
    if (needsAnnual) {
      const scan = await prisma.scan.update({
        where: { id },
        data: { status: "DONE", resultJson: JSON.parse(JSON.stringify(normalizedResult)) },
      });

      return NextResponse.json({ ok: true, scan, code: "NEEDS_ANNUAL_INVOICE" });
    }

    // 9) Save DONE
    const scan = await prisma.scan.update({
      where: { id },
      data: { status: "DONE", resultJson: JSON.parse(JSON.stringify(normalizedResult)) },
    });
    console.log("██ PROCESS ROUTE MARKER 2026-02-16-1939 ██");

if (!scan) {
  throw new Error("SCAN_NOT_FOUND");
}

if (!scan.fileKey) {
  throw new Error("UPLOAD_MISSING_FILEKEY");
}
  

    return NextResponse.json({ ok: true, scan });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error(`[process] Scan ${id} failed:`, message);

    // ✅ Cas métier: PDF scanné sans texte (pdf-parse renvoie vide)
    if (message === "PDF_SCANNED_NEEDS_PHOTO") {
      const scan = await prisma.scan.update({
        where: { id },
        data: {
          status: "DONE",
          resultJson: JSON.parse(
            JSON.stringify({
              error: "PDF_SCANNED_NEEDS_PHOTO",
              reason:
                "Ce PDF semble être un scan (image) sans texte extractible. Envoie une photo nette ou une capture d’écran de la page avec les montants.",
            })
          ),
        },
      });

      return NextResponse.json({ ok: true, scan, code: "PDF_SCANNED_NEEDS_PHOTO" });
    }

    // ✅ Cas métier legacy: certains vieux codes peuvent encore lancer PDF_TEXT_EMPTY
    if (message === "PDF_TEXT_EMPTY" || message === "PDF_NO_TEXT") {
      const scan = await prisma.scan.update({
        where: { id },
        data: {
          status: "DONE",
          resultJson: JSON.parse(
            JSON.stringify({
              error: "PDF_TEXT_EMPTY",
              reason: "PDF scanné ou texte non extractible.",
            })
          ),
        },
      });

      return NextResponse.json({ ok: true, scan, code: "PDF_TEXT_EMPTY" });
    }

    // ❌ Autres erreurs
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
