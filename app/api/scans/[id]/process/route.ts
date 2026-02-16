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

    // Normalize numbers FR
    const normalizedBill = normalizeBillNumbers(result?.bill);

    inferAnnualTTC(normalizedBill);
        function clampVatRate(v: number) {
  if (!Number.isFinite(v)) return 0;
  if (v < 0) return 0;
  if (v > 30) return 30; // garde-fou
  return v;
}

function pickFirstNumber(...vals: any[]): number | null {
  for (const v of vals) {
    if (typeof v === "number" && Number.isFinite(v)) return v;
  }
  return null;
}

function inferVatRate(bill: any): number | null {
  // si l'IA te renvoie déjà un taux
  const direct = pickFirstNumber(bill?.vat_rate, bill?.tva_rate, bill?.vat_percent);
  if (direct != null) return clampVatRate(direct);

  // fallback BE: beaucoup de factures résidentielles affichent 6%
  // (on ne l'impose pas si on n'a aucun indice annuel HTVA)
  return 6;
}

function inferAnnualTTC(bill: any) {
  if (!bill) return bill;

  // si déjà TTC, rien à faire
  if (typeof bill.total_annual_ttc_eur === "number") return bill;

  // on essaye de récupérer un total annuel "HT/HTVA" depuis différents champs possibles
  const annualHT = pickFirstNumber(
    bill.total_annual_htva_eur,
    bill.total_annual_ht_eur,
    bill.total_amount_eur, // ⚠️ legacy: parfois TTC, parfois HTVA selon extraction -> on garde garde-fous plus bas
    bill.total_htva_eur,
    bill.total_ht_eur
  );

  if (annualHT == null) return bill;

  const vatRate = inferVatRate(bill);
  if (vatRate == null) return bill;

  const ttc = Math.round(annualHT * (1 + vatRate / 100) * 100) / 100;

  // garde-fou: si on a déjà un TTC "legacy" et que ça diverge fortement, on n'écrase pas
  if (typeof bill.total_amount_eur === "number") {
    const legacy = bill.total_amount_eur;
    const diff = Math.abs(legacy - ttc);
    const rel = legacy > 0 ? diff / legacy : 0;
    // si legacy est probablement déjà TTC (écart < 2%), on préfère legacy
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


    // Heuristique: si subscription_annual_ht_eur ressemble à un montant mensuel (5–20€),
// on le convertit en annuel (x12).
if (
  normalizedBill &&
  typeof normalizedBill.subscription_annual_ht_eur === "number" &&
  normalizedBill.subscription_annual_ht_eur >= 5 &&
  normalizedBill.subscription_annual_ht_eur <= 20
) {
  normalizedBill.subscription_annual_ht_eur = Number(
    (normalizedBill.subscription_annual_ht_eur * 12).toFixed(2)
  );

  // Optionnel (debug / UI): indique qu'on a corrigé
  normalizedBill.subscription_inferred_monthly = true;
}

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


// ✅ Si l'IA dit qu'il faut une facture annuelle complète,
// on sauvegarde le résultat (pour afficher le CTA) 
const needsAnnual = normalizedResult?.bill?.needs_full_annual_invoice === true;

if (needsAnnual) {
  const scan = await prisma.scan.update({
    where: { id },
    data: {
      status: "DONE",
      resultJson: JSON.parse(JSON.stringify(normalizedResult)),
    },
  });

  return NextResponse.json({
    ok: true,
    scan,
    code: "NEEDS_ANNUAL_INVOICE",
  });
}

    // 6) Save result & mark DONE
    const scan = await prisma.scan.update({
      where: { id },
      data: {
        status: "DONE",
        resultJson: JSON.parse(JSON.stringify(normalizedResult)),
      },
    });

   
    return NextResponse.json({ ok: true, scan });
  } catch (err: unknown) {
  const message = err instanceof Error ? err.message : "Unknown error";
  console.error(`[process] Scan ${id} failed:`, message);

  // ✅ Cas spécial : PDF scanné sans texte exploitable
  if (message === "PDF_TEXT_EMPTY") {
    const scan = await prisma.scan.update({
      where: { id },
      data: {
        status: "DONE", // important : pas FAILED
        resultJson: JSON.parse(
          JSON.stringify({
            error: "PDF_TEXT_EMPTY",
            reason: "Ce PDF semble être une image scannée sans texte exploitable.",
          })
        ),
      },
    });

    return NextResponse.json({
      ok: true,
      scan,
      code: "PDF_TEXT_EMPTY",
    });
  }

  // ❌ Autres erreurs classiques
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
