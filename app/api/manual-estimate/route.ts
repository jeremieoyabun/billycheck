export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { compareOffers } from "@/lib/analyze-bill";
import type { ExtractedBill } from "@/lib/analyze-bill";

/* ──────────────────────────────────────────────
   Build a fake ExtractedBill from manual inputs
   so the same compareOffers() pipeline applies.
   ────────────────────────────────────────────── */
function buildManualExtractedBill(
  fixedMonthly: number,
  priceKwh: number,
  consumptionKwh: number
): ExtractedBill {
  const subscriptionAnnual = fixedMonthly * 12;
  const energyCost = priceKwh * consumptionKwh;
  const htva = subscriptionAnnual + energyCost;
  // Belgium: flat 6% TVA on electricity
  const ttc = Math.round(htva * 1.06 * 100) / 100;

  return {
    provider: null,
    plan_name: null,
    postal_code: null,
    meter_type: "Simple tarif",
    billing_period: "Saisie manuelle (12 mois)",
    billing_period_start: null,
    billing_period_end: null,
    billing_period_days: 365,
    country: "BE",

    energy_unit_price_eur_kwh: priceKwh,
    consumption_kwh_annual: consumptionKwh,
    subscription_annual_ht_eur: subscriptionAnnual,
    total_annual_htva_eur: htva,
    total_annual_ttc_eur: ttc,

    hp_unit_price_eur_kwh: null,
    hc_unit_price_eur_kwh: null,
    hp_consumption_kwh: null,
    hc_consumption_kwh: null,

    confidence: "ok",
    missing_fields: [],
    needs_full_annual_invoice: false,
    is_monthly_bill: false,

    extraction_mode: "image_vision", // reuse existing literal type
  };
}

/* ──────────────────────────────────────────────
   Validation
   ────────────────────────────────────────────── */
function validateManualInputs(body: unknown): {
  fixedMonthly: number;
  priceKwh: number;
  consumptionKwh: number;
} | { error: string } {
  if (!body || typeof body !== "object") return { error: "Corps de requete invalide" };
  const b = body as Record<string, unknown>;

  function parseNum(key: string): number | null {
    const v = b[key];
    if (typeof v !== "number" || !Number.isFinite(v)) return null;
    return v;
  }

  const fixedMonthly   = parseNum("fixedMonthly");
  const priceKwh       = parseNum("priceKwh");
  const consumptionKwh = parseNum("consumptionKwh");

  if (fixedMonthly   === null) return { error: "fixedMonthly invalide" };
  if (priceKwh       === null) return { error: "priceKwh invalide" };
  if (consumptionKwh === null) return { error: "consumptionKwh invalide" };

  if (fixedMonthly < 0 || fixedMonthly > 500)       return { error: "fixedMonthly hors limites (0-500)" };
  if (priceKwh < 0 || priceKwh > 5)                 return { error: "priceKwh hors limites (0-5)" };
  if (consumptionKwh < 1 || consumptionKwh > 50000) return { error: "consumptionKwh hors limites (1-50000)" };

  return { fixedMonthly, priceKwh, consumptionKwh };
}

/* ──────────────────────────────────────────────
   POST /api/manual-estimate
   ────────────────────────────────────────────── */
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "JSON invalide" }, { status: 400 });
  }

  const parsed = validateManualInputs(body);
  if ("error" in parsed) {
    return NextResponse.json({ ok: false, error: parsed.error }, { status: 400 });
  }

  const { fixedMonthly, priceKwh, consumptionKwh } = parsed;

  // Build bill + run comparison
  const bill = buildManualExtractedBill(fixedMonthly, priceKwh, consumptionKwh);
  const offers = compareOffers(bill, "unknown");

  const resultJson = {
    bill,
    offers,
    engagement: "unknown" as const,
    vertical: "electricity" as const,
    source: "manual",
  };

  // Attempt to read userIdentifier from cookie (best-effort)
  const cookieHeader = req.headers.get("cookie") ?? "";
  const match = cookieHeader.match(/billy_uid=([^;]+)/);
  const userIdentifier = match ? decodeURIComponent(match[1]) : null;

  // Create a scan record so /result/:id works unchanged
  const scan = await prisma.scan.create({
    data: {
      originalName: "Saisie manuelle",
      mimeType:     "manual/electricity",
      size:         0,
      status:       "DONE",
      engagement:   "unknown",
      userIdentifier,
      resultJson:   JSON.parse(JSON.stringify(resultJson)),
    },
  });

  return NextResponse.json({ ok: true, scanId: scan.id });
}
