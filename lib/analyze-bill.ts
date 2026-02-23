// lib/analyze-bill.ts
//
// v4-clean — 2026-02-16
//
// Pipeline:
//   Image  → GPT-4o Vision
//   PDF    → pdf-parse (text only) → GPT-4o (text only, NO Vision)
//   Scanned PDF (no text) → throws PDF_SCANNED_NEEDS_PHOTO
//
// CRITICAL: pdf-parse@1.1.1 falls back to reading a TEST FILE
// when called with undefined/null/empty buffer. We guard against
// this by validating the buffer BEFORE calling pdf-parse.

import OpenAI from "openai";
import { getElectricityOffers } from "@/lib/offers/index";
import { lookupGrdFromEAN, type BeRegion } from "@/lib/pricing/be/grd";
import { calcBelgiumAnnualTotalTVAC } from "@/lib/pricing/be/calc";
// NOTE: Prosumer is non-switchable — extracted from bill, not computed by calc

const ANALYZE_VERSION = "ANALYZE-V9-2026-02-17";

/* ──────────────────────────────────────────────
   OpenAI client
   ────────────────────────────────────────────── */
function getOpenAI(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY_MISSING");
  return new OpenAI({ apiKey });
}

/* ──────────────────────────────────────────────
   Types
   ────────────────────────────────────────────── */
export type ExtractionConfidence = "ok" | "partial" | "insufficient";

export interface ExtractedBill {
  provider: string | null;
  plan_name: string | null;
  postal_code: string | null;
  meter_type: string | null;
  billing_period: string | null;
  billing_period_start: string | null;
  billing_period_end: string | null;
  billing_period_days: number | null;
  country: string | null;

  energy_unit_price_eur_kwh: number | null;
  consumption_kwh_annual: number | null;
  subscription_annual_ht_eur: number | null;
  total_annual_htva_eur: number | null;
  total_annual_ttc_eur: number | null;

  hp_unit_price_eur_kwh: number | null;
  hc_unit_price_eur_kwh: number | null;
  hp_consumption_kwh: number | null;
  hc_consumption_kwh: number | null;

  confidence: ExtractionConfidence;
  missing_fields: string[];
  needs_full_annual_invoice: boolean;
  is_monthly_bill?: boolean;

  // Belgium-specific (optional — extracted when present on bill)
  ean?: string | null;
  prosumer_detected?: boolean | null;
  prosumer_amount_eur?: number | null;    // actual EUR from prosumer charge line
  prosumer_period_days?: number | null;   // days covered by prosumer charge
  prosumer_annual_eur?: number | null;    // = amount / days * 365 (non-switchable)
  inverter_kva?: number | null;           // informational only

  // Bill classification
  bill_type?: "regularisation" | "acompte" | "intermediaire" | "unknown" | null;

  extraction_mode?: "image_vision" | "pdf_text";
  pdf_text_length?: number;
}

export interface OfferResult {
  provider: string;
  plan: string;
  estimated_savings: number;
  savings_percent: number;
  price_kwh: number;
  type: string;
  green: boolean;
  url: string;
  // Promo bonus (negative = discount, HTVA). Null if none.
  promo_bonus_eur?: number | null;
  // Belgium-specific breakdown (present when country === "BE")
  total_tvac?: number;
  total_htva?: number;
  vat_amount?: number;
  assumptions?: string[];
}

export interface AnalysisResult {
  bill: ExtractedBill;
  offers: OfferResult[];
  engagement: string;
}

/* ──────────────────────────────────────────────
   Extraction prompt
   ────────────────────────────────────────────── */
const EXTRACTION_PROMPT = `Tu es Billy, expert en factures d'électricité belges et françaises.
Analyse la facture et réponds UNIQUEMENT avec un objet JSON valide (sans backticks, sans texte).

Objectif: extraire les valeurs pour comparer des offres fournisseur.

RÈGLES STRICTES:
- N'invente jamais. Si une valeur n'est pas clairement visible, mets null.
- Ne fais PAS d'extrapolation (ne multiplie pas un mensuel par 12).

IMPORTANT — CHAMPS CRITIQUES:

1) "energy_unit_price_eur_kwh":
   Prix unitaire de L'ÉNERGIE SEULE facturée par le FOURNISSEUR (€/kWh HT).
   ⚠️ NE PAS utiliser le "Prix unitaire global" ou "prix tout compris" qui inclut distribution+transport+taxes.
   — Belgique: section "Coût énergie [fournisseur]" → lignes "Consommation jour/nuit" → colonne "Prix unitaire".
   — France: section "Fourniture" ou "Énergie" → "Prix du kWh" (pas le prix "acheminement" ni "TURPE").
   Si bi-horaire (HP/HC ou Jour/Nuit), remplis plutôt hp_unit_price et hc_unit_price, laisse ce champ null.

2) "subscription_annual_ht_eur":
   UNIQUEMENT l'abonnement/redevance fixe du FOURNISSEUR, en €/an HT.
   — Belgique: "Redevance fixe" dans "Coût énergie [fournisseur]". Additionne toutes les lignes de la période.
   — France: "Abonnement" dans la section "Fourniture". Si mensuel, multiplie par le nombre de mois de la période (PAS par 12 automatiquement).
   N'inclus JAMAIS: distribution, transport, TURPE, terme fixe réseau, prosumer, taxes, CTA, CSPE, TCFE.

3) "total_annual_htva_eur":
   Le montant TOTAL HT/HTVA de la facture (toutes composantes).
   — Belgique: "Total coût", "Montant HTVA"
   — France: "Total HT" ou "Montant HT" (souvent en bas de facture)

4) "total_annual_ttc_eur":
   Le montant TOTAL TTC/TVAC si clairement indiqué. Sinon null (sera auto-calculé).
   — France: "Total TTC", "Montant TTC", "Net à payer"
   — Belgique: rarement affiché directement, mettre null si absent.

5) "consumption_kwh_annual":
   Consommation totale (jour + nuit, HP + HC) en kWh sur la période de la facture.
   ⚠️ Retourne la consommation EXACTE de la période, ne l'annualise PAS.
   ⚠️ ATTENTION AUX SÉPARATEURS DE MILLIERS: "3 863 kWh" = 3863, "3.863 kWh" = 3863.
   ⚠️ ATTENTION AUX DÉCIMALES: "386,3 kWh" = 386.3 (virgule = décimale car suivi d'un seul chiffre).
   Un ménage belge moyen consomme 3000-5000 kWh/an. MAIS un prosumer (panneaux solaires)
   peut consommer seulement 100-500 kWh/an — c'est NORMAL, ne "corrige" PAS ce chiffre.
   Retourne un NUMBER (ex: 3863 ou 386.3), PAS un string.

6) "country": Déduis le pays depuis l'adresse, le code postal ou le fournisseur: "BE", "FR", "LU", etc.
   Indices: code postal 4 chiffres = BE, 5 chiffres = FR. Fournisseurs BE: Mega, Luminus, Eneco, Octa+. Fournisseurs FR: EDF, Engie (FR), TotalEnergies (FR).

7) "billing_period_start" et "billing_period_end":
   Dates de début et fin de la période de facturation, au format "YYYY-MM-DD".
   Exemples: "2024-12-21", "2025-12-09".
   Cherche "Période de facturation", "du ... au ...", "Période de consommation".

8) "ean": Code EAN-18 du point de livraison (18 chiffres, commence par 54141 en Belgique).
   Cherche "EAN", "Code EAN", "EAN-18", "Point d'accès", "Code du compteur".
   Retourne les 18 chiffres uniquement (sans espaces ni tirets). Sinon null.

9) "prosumer_detected": true si la facture mentionne panneaux solaires, injection réseau,
   "prosumer", onduleur, "nettometing", production propre, "tarif prosumer",
   "redevance prosumer", "capacité d'injection". false sinon.

10) "prosumer_amount_eur": Montant FINAL en EUR de la ligne "redevance prosumer" / "tarif prosumer" /
    "surcharge prosumer" / "forfait injection" / "tarif capacitif prosumer".
    C'est le montant EN EUROS facturé (ex: 234,56 €), PAS un coefficient (ex: 0,969863).
    Retourne un NUMBER en EUR. Sinon null.

11) "prosumer_period_days": Nombre de jours couverts par la redevance prosumer.
    Si une période spécifique est indiquée pour la ligne prosumer, utilise-la.
    Sinon, utilise la période de facturation principale (billing_period_start → billing_period_end).
    Retourne un NUMBER entier. Sinon null.

12) "inverter_kva": Puissance nominale de l'onduleur en kVA.
    Cherche "kVA", "puissance onduleur", "puissance nominale", "puissance injection",
    "capacité onduleur", "omvormer".
    Formats possibles: "3,54 kVA" → 3.54, "3540 VA" → 3.54 (diviser par 1000), "3.5kVA" → 3.5.
    Retourne un NUMBER en kVA. Sinon null.

13) "meter_type": Type de compteur électrique. Retourne "mono" pour un compteur mono-horaire
    (tarif unique), ou "bi" pour un compteur bi-horaire (HP/HC, jour/nuit). Sinon null.

14) "bill_type": Type de facture. IMPORTANT pour la fiabilité des résultats.
    "regularisation" : facture de régularisation / décompte annuel / afrekening / jaarafrekening.
      Indices : "régularisation", "afrekening", "décompte annuel", "facture de clôture",
      "relevé d'index", index compteur ancien/nouveau, ventilation énergie/réseau/taxes.
    "acompte" : facture d'acompte / avance / provision / voorschot / maandelijks voorschot.
      Indices : "acompte", "avance", "voorschot", "provision", "maandbedrag",
      montant fixe sans détail de consommation réelle, pas d'index compteur.
    "intermediaire" : facture intermédiaire / tussentijdse factuur.
    "unknown" : si tu ne peux pas déterminer le type.
    ⚠️ Si c'est un acompte, les champs de consommation et de détail seront probablement null — c'est normal.

Schéma EXACT:
{
  "provider": string|null,
  "plan_name": string|null,
  "postal_code": string|null,
  "meter_type": "mono"|"bi"|null,
  "billing_period": string|null,
  "billing_period_start": string|null,
  "billing_period_end": string|null,
  "country": string|null,

  "energy_unit_price_eur_kwh": number|null,
  "consumption_kwh_annual": number|null,
  "subscription_annual_ht_eur": number|null,
  "total_annual_htva_eur": number|null,
  "total_annual_ttc_eur": number|null,

  "hp_unit_price_eur_kwh": number|null,
  "hc_unit_price_eur_kwh": number|null,
  "hp_consumption_kwh": number|null,
  "hc_consumption_kwh": number|null,

  "ean": string|null,
  "prosumer_detected": boolean,
  "prosumer_amount_eur": number|null,
  "prosumer_period_days": number|null,
  "inverter_kva": number|null,
  "bill_type": "regularisation"|"acompte"|"intermediaire"|"unknown"
}

Si ce n'est pas une facture d'électricité, retourne tous les champs à null.`;

/* ──────────────────────────────────────────────
   Helpers
   ────────────────────────────────────────────── */
function normalizeMime(mimeType: string): string {
  return (mimeType || "").toLowerCase().trim();
}

function isImageMime(mimeType: string): boolean {
  return normalizeMime(mimeType).startsWith("image/");
}

function isPdfMime(mimeType: string): boolean {
  return normalizeMime(mimeType).includes("pdf");
}

function numOrNull(v: unknown): number | null {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

/**
 * Robust number normalization handling European formats:
 *   "3 863"   → 3863   (space as thousand separator)
 *   "3.863"   → 3863   (dot as thousand separator, no decimals)
 *   "3,863"   → 3863   (comma as thousand separator, no decimals)
 *   "3863.5"  → 3863.5 (dot as decimal)
 *   "3863,5"  → 3863.5 (comma as decimal)
 *   "0,0829"  → 0.0829 (comma as decimal, small number)
 *
 * Heuristic: if the string contains exactly one comma or dot followed by
 * exactly 3 digits at the end AND the integer part >= 1, treat it as a
 * thousand separator (e.g., "3.863" = 3863, not 3.863).
 * Exception: if integer part is 0, it's always decimal ("0,0829").
 */
export function normalizeNumeric(v: unknown): number | null {
  if (v === null || v === undefined || v === "") return null;
  if (typeof v === "number") return Number.isFinite(v) ? v : null;

  let s = String(v).trim();
  // Strip currency symbols and units
  s = s.replace(/[€$kWh/an/mois]/gi, "").trim();
  // Strip spaces used as thousand separators
  s = s.replace(/\s/g, "");

  if (!s) return null;

  // Check for European thousand separator pattern: "3.863" or "3,863"
  // where there's exactly one separator followed by exactly 3 digits
  const thousandMatch = s.match(/^(\d+)[.,](\d{3})$/);
  if (thousandMatch) {
    const n = parseInt(thousandMatch[1] + thousandMatch[2], 10);
    return Number.isFinite(n) ? n : null;
  }

  // Handle comma as decimal separator: "0,0829" → "0.0829"
  // If there's exactly one comma not followed by exactly 3 digits, treat as decimal
  if (s.includes(",") && !s.includes(".")) {
    s = s.replace(",", ".");
  }

  // Handle multiple dots (e.g., "1.234.567") — strip all but last
  const dots = s.split(".");
  if (dots.length > 2) {
    const last = dots.pop()!;
    s = dots.join("") + "." + last;
  }

  const n = parseFloat(s);
  return Number.isFinite(n) ? n : null;
}

/** Sanity-check annual kWh: Belgian household 500-50000 range */
const KWH_MIN = 500;
const KWH_MIN_PROSUMER = 10; // Prosumers with solar can have very low net consumption
const KWH_MAX = 50000;

function sanitizeAnnualKwh(
  raw: number | null,
  opts?: { prosumer?: boolean },
): { value: number | null; warning: string | null } {
  if (raw == null) return { value: null, warning: null };

  const minKwh = opts?.prosumer ? KWH_MIN_PROSUMER : KWH_MIN;

  if (raw >= minKwh && raw <= KWH_MAX) return { value: raw, warning: null };

  // Try rescaling: if below min, maybe a zero was dropped (×10)
  // BUT skip this heuristic for prosumers — low consumption is expected
  if (!opts?.prosumer && raw > 0 && raw < KWH_MIN) {
    const scaled = raw * 10;
    if (scaled >= KWH_MIN && scaled <= KWH_MAX) {
      return {
        value: scaled,
        warning: `Consommation ${raw} kWh anormalement basse — corrigée à ${scaled} kWh (chiffre probablement tronqué)`,
      };
    }
  }

  // If > 50000, possibly a decimal was misread as thousand separator
  if (raw > KWH_MAX) {
    const scaled = Math.round(raw / 10);
    if (scaled >= minKwh && scaled <= KWH_MAX) {
      return {
        value: scaled,
        warning: `Consommation ${raw} kWh anormalement élevée — corrigée à ${scaled} kWh`,
      };
    }
  }

  // Return as-is with warning
  return {
    value: raw,
    warning: `Consommation ${raw} kWh hors plage attendue (${minKwh}-${KWH_MAX})`,
  };
}

function computePeriodDays(start: string | null, end: string | null): number | null {
  if (!start || !end) return null;
  const d0 = new Date(start);
  const d1 = new Date(end);
  if (isNaN(d0.getTime()) || isNaN(d1.getTime())) return null;
  const diffMs = d1.getTime() - d0.getTime();
  const days = Math.round(diffMs / (1000 * 60 * 60 * 24));
  return days > 0 ? days : null;
}

const MIN_ANNUAL_PERIOD_DAYS = 300;

type BillType = "regularisation" | "acompte" | "intermediaire" | "unknown";

const VALID_BILL_TYPES = new Set<BillType>(["regularisation", "acompte", "intermediaire", "unknown"]);

/**
 * Detect bill type from GPT output + heuristic fallback.
 *
 * Priority:
 * 1. GPT's explicit bill_type field (if valid)
 * 2. Heuristic: if GPT returned a total but no consumption/price breakdown,
 *    the bill is likely an acompte (fixed monthly advance, no real kWh data).
 */
function detectBillType(
  data: Record<string, unknown>,
  extracted: { rawKwh: number | null; hpKwh: number | null; hcKwh: number | null; htva: number | null },
): BillType | null {
  // 1. Trust GPT if it returned a valid value
  const gptType = (data.bill_type as string ?? "").toLowerCase().trim() as BillType;
  if (VALID_BILL_TYPES.has(gptType)) {
    console.log(`[analyze] GPT bill_type: "${gptType}"`);
    return gptType;
  }

  // 2. Heuristic fallback: acompte = total exists but no consumption detail
  const hasTotal = extracted.htva != null;
  const hasAnyKwh = extracted.rawKwh != null || extracted.hpKwh != null || extracted.hcKwh != null;

  if (hasTotal && !hasAnyKwh) {
    console.warn(`[analyze] HEURISTIC: total exists but no kWh → likely acompte`);
    return "acompte";
  }

  return null; // unknown — GPT didn't say, heuristic inconclusive
}

function round4(n: number): number {
  return Math.round(n * 10000) / 10000;
}

function computeWeightedPrice(
  hpPrice: number | null,
  hcPrice: number | null,
  hpKwh: number | null,
  hcKwh: number | null
): number | null {
  if (hpPrice == null || hcPrice == null || hpKwh == null || hcKwh == null) return null;
  const total = hpKwh + hcKwh;
  if (!Number.isFinite(total) || total <= 0) return null;
  const weighted = (hpPrice * hpKwh + hcPrice * hcKwh) / total;
  return Number.isFinite(weighted) ? round4(weighted) : null;
}

/* ──────────────────────────────────────────────
   Validation
   ────────────────────────────────────────────── */
function validateExtraction(bill: ExtractedBill): ExtractedBill {
  const missing: string[] = [];
  if (bill.energy_unit_price_eur_kwh == null) missing.push("energy_unit_price_eur_kwh");
  if (bill.consumption_kwh_annual == null) missing.push("consumption_kwh_annual");
  if (bill.subscription_annual_ht_eur == null) missing.push("subscription_annual_ht_eur");
  if (bill.total_annual_ttc_eur == null) missing.push("total_annual_ttc_eur");

  let confidence: ExtractionConfidence = "ok";
  if (missing.length > 0) {
    confidence = "insufficient";
  } else {
    const secondaryMissing =
      (bill.provider ? 0 : 1) + (bill.postal_code ? 0 : 1) + (bill.meter_type ? 0 : 1);
    if (secondaryMissing > 0) confidence = "partial";
  }

  // Monthly/short-period bills always need a full annual invoice
  const isMonthly = bill.is_monthly_bill === true;

  // Acompte = advance payment, no real consumption data → cannot compare offers
  const isAcompte = bill.bill_type === "acompte";
  if (isAcompte) {
    console.log(`[analyze] ACOMPTE detected → needs full annual invoice (régularisation)`);
  }

  const needsAnnual = isMonthly || isAcompte || confidence === "insufficient";

  const finalMissing = [...missing];
  if (isMonthly) finalMissing.push("facture_annuelle_requise");
  if (isAcompte) finalMissing.push("facture_acompte_detectee");

  return {
    ...bill,
    missing_fields: finalMissing,
    confidence: (isMonthly || isAcompte) ? "insufficient" : confidence,
    needs_full_annual_invoice: needsAnnual,
    is_monthly_bill: isMonthly,
  };
}

/* ──────────────────────────────────────────────
   Parse GPT JSON response
   ────────────────────────────────────────────── */
function parseGPTResponse(raw: string): ExtractedBill {
  const cleaned = (raw || "")
    .replace(/```json\s*/g, "")
    .replace(/```\s*/g, "")
    .trim();

  let data: Record<string, unknown>;
  try {
    data = JSON.parse(cleaned);
  } catch {
    console.error("[analyze] GPT returned invalid JSON:", cleaned.slice(0, 500));
    throw new Error("GPT_INVALID_JSON");
  }

  const hpPrice = numOrNull(data.hp_unit_price_eur_kwh);
  const hcPrice = numOrNull(data.hc_unit_price_eur_kwh);
  const hpKwh = normalizeNumeric(data.hp_consumption_kwh);
  const hcKwh = normalizeNumeric(data.hc_consumption_kwh);
  const weighted = computeWeightedPrice(hpPrice, hcPrice, hpKwh, hcKwh);

  // Auto-compute TTC from HTVA if TTC is missing
  const htva = normalizeNumeric(data.total_annual_htva_eur);
  let ttc = normalizeNumeric(data.total_annual_ttc_eur);
  const country = ((data.country as string) ?? null)?.toUpperCase() ?? null;

  if (ttc == null && htva != null) {
    const sub = normalizeNumeric(data.subscription_annual_ht_eur) ?? 0;
    if (country === "FR") {
      const subTTC = sub * 1.055;
      const restTTC = (htva - sub) * 1.20;
      ttc = Math.round((subTTC + restTTC) * 100) / 100;
      console.log(`[analyze] Auto TTC (FR): sub=${sub}×1.055 + rest=${htva - sub}×1.20 = ${ttc} TTC`);
    } else {
      ttc = Math.round(htva * 1.06 * 100) / 100;
      console.log(`[analyze] Auto TTC (BE): ${htva} HTVA × 1.06 = ${ttc} TTC`);
    }
  }

  // Period dates & duration
  const periodStart = (data.billing_period_start as string) ?? null;
  const periodEnd = (data.billing_period_end as string) ?? null;
  const periodDays = computePeriodDays(periodStart, periodEnd);
  const isMonthly = periodDays != null && periodDays < MIN_ANNUAL_PERIOD_DAYS;

  if (isMonthly) {
    console.log(`[analyze] MONTHLY BILL detected: ${periodDays} days (${periodStart} → ${periodEnd}). Need annual invoice.`);
  }

  // EAN: strip all non-digits, validate length=18
  const rawEan = (data.ean as string) ?? null;
  const eanDigits = rawEan ? rawEan.replace(/\D/g, "") : null;
  const ean = eanDigits && eanDigits.length === 18 ? eanDigits : null;

  // prosumer fields
  const prosumerDetected: boolean | null =
    typeof data.prosumer_detected === "boolean" ? data.prosumer_detected :
    typeof data.prosumer === "boolean" ? data.prosumer : null; // backward compat

  const prosumerAmountEur = normalizeNumeric(data.prosumer_amount_eur);
  let prosumerPeriodDays = numOrNull(data.prosumer_period_days);
  // Fall back to billing period days if prosumer period not specified
  if (prosumerDetected && prosumerAmountEur != null && prosumerPeriodDays == null) {
    prosumerPeriodDays = periodDays;
  }

  // Annualize: prosumer_annual_eur = amount / days * 365
  let prosumerAnnualEur: number | null = null;
  if (prosumerAmountEur != null && prosumerPeriodDays != null && prosumerPeriodDays > 0) {
    prosumerAnnualEur = Math.round((prosumerAmountEur / prosumerPeriodDays) * 365 * 100) / 100;
    console.log(`[analyze] Prosumer annual: ${prosumerAmountEur}€ / ${prosumerPeriodDays}d × 365 = ${prosumerAnnualEur}€/an`);
  } else if (prosumerDetected && prosumerAmountEur == null) {
    console.log(`[analyze] Prosumer detected but no EUR amount found on bill — prosumer_annual_eur = null`);
  }

  // inverter_kva: normalize VA → kVA if needed (informational only)
  let inverterKva = normalizeNumeric(data.inverter_kva);
  if (inverterKva != null && inverterKva > 100) {
    inverterKva = Math.round((inverterKva / 1000) * 100) / 100;
    console.log(`[analyze] inverter_kva converted from VA: ${data.inverter_kva} → ${inverterKva} kVA`);
  }

  // Consumption: use normalizeNumeric to handle thousand separators
  const rawKwh = normalizeNumeric(data.consumption_kwh_annual);
  const { value: sanitizedKwh, warning: kwhWarning } = sanitizeAnnualKwh(rawKwh, {
    prosumer: prosumerDetected === true,
  });
  if (kwhWarning) {
    console.warn(`[analyze] ${kwhWarning}`);
  }

  // Annualize: GPT returns period consumption/costs, not 365-day.
  // Scale to a full year when period is known (300-365 days).
  const annualFactor = (periodDays && periodDays >= MIN_ANNUAL_PERIOD_DAYS && periodDays < 365)
    ? 365 / periodDays
    : 1;
  if (annualFactor !== 1) {
    console.log(`[analyze] Annualizing: period ${periodDays}d → factor ${annualFactor.toFixed(4)}`);
  }

  const annualKwh = sanitizedKwh != null ? Math.round(sanitizedKwh * annualFactor) : null;
  const annualHtva = htva != null ? Math.round(htva * annualFactor * 100) / 100 : null;
  const annualTtc = ttc != null ? Math.round(ttc * annualFactor * 100) / 100 : null;
  const annualHpKwh = hpKwh != null ? Math.round(hpKwh * annualFactor) : null;
  const annualHcKwh = hcKwh != null ? Math.round(hcKwh * annualFactor) : null;

  const bill: ExtractedBill = {
    provider: (data.provider as string) ?? null,
    plan_name: (data.plan_name as string) ?? null,
    postal_code: (data.postal_code as string) ?? null,
    meter_type: (data.meter_type as string) ?? null,
    billing_period: (data.billing_period as string) ?? null,
    billing_period_start: periodStart,
    billing_period_end: periodEnd,
    billing_period_days: periodDays,
    country,

    energy_unit_price_eur_kwh: weighted ?? numOrNull(data.energy_unit_price_eur_kwh),
    consumption_kwh_annual: annualKwh,
    subscription_annual_ht_eur: normalizeNumeric(data.subscription_annual_ht_eur),
    total_annual_htva_eur: annualHtva,
    total_annual_ttc_eur: annualTtc,

    hp_unit_price_eur_kwh: hpPrice,
    hc_unit_price_eur_kwh: hcPrice,
    hp_consumption_kwh: annualHpKwh,
    hc_consumption_kwh: annualHcKwh,

    ean,
    prosumer_detected: prosumerDetected,
    prosumer_amount_eur: prosumerAmountEur,
    prosumer_period_days: prosumerPeriodDays,
    prosumer_annual_eur: prosumerAnnualEur,
    inverter_kva: inverterKva,

    // Bill type: GPT detection + heuristic fallback
    bill_type: detectBillType(data, { rawKwh, hpKwh, hcKwh, htva }),

    confidence: "insufficient",
    missing_fields: [],
    needs_full_annual_invoice: true,
    is_monthly_bill: isMonthly,
  };

  return validateExtraction(bill);
}

/* ──────────────────────────────────────────────
   PDF text extraction via pdf-parse
   ────────────────────────────────────────────── 
   CRITICAL: pdf-parse@1.1.1 falls back to reading
   ./test/data/05-versions-space.pdf when called
   with undefined/null/empty. We MUST guard here.
   ────────────────────────────────────────────── */
async function extractPdfText(fileBuffer: Buffer): Promise<string> {
  // ═══ GUARD: prevent pdf-parse test-file fallback ═══
  if (!fileBuffer) {
    throw new Error("PDF_BUFFER_EMPTY: fileBuffer is null/undefined");
  }
  if (!Buffer.isBuffer(fileBuffer)) {
    throw new Error("PDF_BUFFER_EMPTY: fileBuffer is not a Buffer, got " + typeof fileBuffer);
  }
  if (fileBuffer.length === 0) {
    throw new Error("PDF_BUFFER_EMPTY: fileBuffer has 0 bytes");
  }
  // ═══ Verify it looks like a PDF (starts with %PDF) ═══
  const header = fileBuffer.slice(0, 5).toString("ascii");
  if (!header.startsWith("%PDF")) {
    console.warn("[analyze] Buffer does not start with %PDF, header:", header);
    // Don't throw — some PDFs have BOM or whitespace before %PDF
  }

  console.log(`[analyze][${ANALYZE_VERSION}] extractPdfText: buffer OK, ${fileBuffer.length} bytes`);

  // pdf-parse is excluded from webpack via serverExternalPackages in next.config.ts
  // so it runs as a normal Node.js require (module.parent is defined → no debug mode)
  const mod = await import("pdf-parse");
  const parser = mod?.default ?? mod;
  const parsed = await parser(fileBuffer);
  return (parsed?.text ?? "").toString().trim();
}

/* ──────────────────────────────────────────────
   PATH A — Image → GPT-4o Vision
   ────────────────────────────────────────────── */
async function extractFromImage(
  openai: OpenAI,
  fileBuffer: Buffer,
  mimeType: string
): Promise<string> {
  if (!isImageMime(mimeType)) {
    throw new Error("VISION_EXPECTS_IMAGE_MIME:" + (mimeType || "empty"));
  }

  console.log(`[analyze][${ANALYZE_VERSION}] IMAGE path — GPT-4o Vision, mime: ${mimeType}`);

  const base64 = fileBuffer.toString("base64");
  const res = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: EXTRACTION_PROMPT },
          {
            type: "image_url",
            image_url: {
              url: `data:${mimeType};base64,${base64}`,
              detail: "high",
            },
          },
        ],
      },
    ],
    max_tokens: 1500,
    temperature: 0.1,
  });

  return res.choices[0]?.message?.content ?? "{}";
}

/* ──────────────────────────────────────────────
   PATH B — PDF text → GPT (text only, NO Vision)
   ────────────────────────────────────────────── */
async function extractFromPdfTextWithGpt(
  openai: OpenAI,
  pdfText: string
): Promise<string> {
  console.log(`[analyze][${ANALYZE_VERSION}] PDF TEXT path — GPT-4o text-only, ${pdfText.length} chars`);

  const MAX = 24000;
  let payload = pdfText;
  if (payload.length > MAX) {
    payload = payload.slice(0, 14000) + "\n\n[...] (TRONQUÉ)\n\n" + payload.slice(-8000);
  }

  const res = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "user",
        content: EXTRACTION_PROMPT + "\n\n--- CONTENU FACTURE (TEXTE EXTRAIT) ---\n\n" + payload,
      },
    ],
    max_tokens: 1500,
    temperature: 0.1,
  });

  return res.choices[0]?.message?.content ?? "{}";
}

/* ──────────────────────────────────────────────
   Main extraction router
   ────────────────────────────────────────────── */
export async function extractBillData(
  fileBuffer: Buffer,
  mimeType: string
): Promise<ExtractedBill> {
  console.log(`████ ${ANALYZE_VERSION} ████ mime: ${mimeType}, size: ${fileBuffer?.length ?? "NULL"}`);

  // ═══ Top-level guard ═══
  if (!fileBuffer || !Buffer.isBuffer(fileBuffer) || fileBuffer.length === 0) {
    throw new Error("PDF_BUFFER_EMPTY: extractBillData received invalid buffer");
  }

  const openai = getOpenAI();

  // ── IMAGE → Vision ──
  if (isImageMime(mimeType)) {
    const raw = await extractFromImage(openai, fileBuffer, mimeType);
    const bill = parseGPTResponse(raw);
    bill.extraction_mode = "image_vision";
    return bill;
  }

  // ── PDF → Text only (NO Vision, ever) ──
  if (isPdfMime(mimeType)) {
    const pdfText = await extractPdfText(fileBuffer);

    if (pdfText.length < 200) {
      throw new Error("PDF_SCANNED_NEEDS_PHOTO");
    }

    const raw = await extractFromPdfTextWithGpt(openai, pdfText);
    const bill = parseGPTResponse(raw);
    bill.extraction_mode = "pdf_text";
    bill.pdf_text_length = pdfText.length;
    return bill;
  }

  // ── Unknown MIME ──
  throw new Error("UNSUPPORTED_MIME_TYPE:" + (mimeType || "empty"));
}

/* ──────────────────────────────────────────────
   Compare with market offers
   ────────────────────────────────────────────── */
export function compareOffers(bill: ExtractedBill, _engagement: string): OfferResult[] {
  const annualKwh = bill.consumption_kwh_annual;
  if (!annualKwh || annualKwh <= 0) return [];

  const currentAnnualCost = bill.total_annual_ttc_eur;
  if (currentAnnualCost == null || currentAnnualCost <= 0) return [];

  const billCountry = (bill.country ?? "BE").toUpperCase();
  const isBE = billCountry === "BE";

  // BE: look up region from EAN — null if not found (uses stub averages)
  let beRegion: BeRegion | null = null;
  if (isBE && bill.ean) {
    const grdInfo = lookupGrdFromEAN(bill.ean);
    if (grdInfo) beRegion = grdInfo.region;
  }

  // BE: resolve meter type ("mono" | "bi")
  const beMeterType: "mono" | "bi" =
    /bi|dual|hp|hc|nuit/i.test(bill.meter_type ?? "") ? "bi" : "mono";

  // BE: day/night split
  let beDay = annualKwh;
  let beNight = 0;
  if (isBE && beMeterType === "bi") {
    if (bill.hp_consumption_kwh != null && bill.hc_consumption_kwh != null) {
      beDay = bill.hp_consumption_kwh;
      beNight = bill.hc_consumption_kwh;
    } else {
      // Bi-meter, only total known: rough 60/40 split
      beDay = Math.round(annualKwh * 0.6);
      beNight = annualKwh - Math.round(annualKwh * 0.6);
    }
  }

  // Prosumer charge is NON-SWITCHABLE: same regardless of supplier.
  // Add it equally to every offer's total TVAC.
  const prosumerAnnual = bill.prosumer_annual_eur ?? 0;
  const prosumerAssumptions: string[] = [];
  if (bill.prosumer_detected && prosumerAnnual > 0) {
    prosumerAssumptions.push(
      `Redevance prosumer: ${prosumerAnnual.toFixed(2)} €/an (non-switchable, identique pour toutes les offres)`
    );
  } else if (bill.prosumer_detected && prosumerAnnual === 0) {
    prosumerAssumptions.push(
      "Prosumer détecté mais montant/période non trouvé sur la facture — redevance prosumer non incluse dans l'estimation"
    );
  }

  return getElectricityOffers(billCountry)
    // Note: we do NOT exclude the current provider — users may benefit from
    // switching to a different plan with the same provider. The savings threshold
    // (>€10) naturally prevents recommending their own equivalent offer.
    // Region filter: WAL-only offers shown only to WAL users, etc.
    .filter((o) => {
      if (!beRegion || o.region === "ALL") return true;
      return o.region === beRegion;
    })
    // Meter type filter: BI-only offers for bi-hourly meters, MONO-only for mono
    .filter((o) => {
      if (o.meter_type === "ALL") return true;
      if (o.meter_type === "BI") return beMeterType === "bi";
      if (o.meter_type === "MONO") return beMeterType === "mono";
      return true;
    })
    .map((offer): OfferResult => {
      if (isBE) {
        // Belgium: full TVAC comparison (energy + network + taxes)
        const input_vatRate = 0.06; // 6% residential; TODO: detect 21% for pro
        const breakdown = calcBelgiumAnnualTotalTVAC({
          annualKwhDay: beDay,
          annualKwhNight: beNight,
          meterType: beMeterType,
          supplierEnergyPriceDay: offer.energy_price_day,
          supplierEnergyPriceNight: offer.energy_price_night ?? offer.energy_price_day,
          supplierFixedFeeAnnual: offer.supplier_fixed_fee_year,
          region: beRegion,
          vatRate: input_vatRate,
        });
        // promo_bonus is HTVA (from tariff sheets) — apply TVA to get TVAC impact
        const promoHtva = offer.promo_bonus ?? 0; // negative = discount
        const promoTvac = Math.round(promoHtva * (1 + (input_vatRate)) * 100) / 100;

        // Add non-switchable prosumer + promo on top
        const offerTotalTvac = Math.round((breakdown.totalTvac + prosumerAnnual + promoTvac) * 100) / 100;
        const savings = Math.round(currentAnnualCost - offerTotalTvac);
        const savingsPercent =
          currentAnnualCost > 0
            ? Math.round((savings / currentAnnualCost) * 100)
            : 0;

        const promoAssumptions: string[] = [];
        if (promoHtva < 0) {
          promoAssumptions.push(
            `Promo 1ère année incluse : ${Math.abs(promoHtva).toFixed(0)}€ HTVA de réduction (${Math.abs(promoTvac).toFixed(0)}€ TVAC)`
          );
        }

        return {
          provider: offer.provider_name,
          plan: offer.offer_name,
          estimated_savings: savings,
          savings_percent: savingsPercent,
          price_kwh: offer.energy_price_day,
          type: offer.contract_type,
          green: false,
          url: offer.source_url,
          promo_bonus_eur: promoHtva !== 0 ? promoHtva : null,
          total_tvac: offerTotalTvac,
          total_htva: breakdown.totalHtva,
          vat_amount: breakdown.vat,
          assumptions: [...breakdown.assumptions, ...prosumerAssumptions, ...promoAssumptions],
        };
      }

      // Non-BE: supplier cost only (TODO: fix FR full TVAC in Phase 2)
      const promoBonus = offer.promo_bonus ?? 0;
      const supplierCost = offer.energy_price_day * annualKwh + offer.supplier_fixed_fee_year + promoBonus;
      const savings = Math.round(currentAnnualCost - supplierCost);
      const savingsPercent =
        currentAnnualCost > 0
          ? Math.round((savings / currentAnnualCost) * 100)
          : 0;
      return {
        provider: offer.provider_name,
        plan: offer.offer_name,
        estimated_savings: savings,
        savings_percent: savingsPercent,
        price_kwh: offer.energy_price_day,
        type: offer.contract_type,
        green: false,
        url: offer.source_url,
        promo_bonus_eur: promoBonus !== 0 ? promoBonus : null,
      };
    })
    .filter((o) => o.estimated_savings > 10)
    .sort((a, b) => b.estimated_savings - a.estimated_savings)
    .slice(0, 5);
}

/* ──────────────────────────────────────────────
   Main pipeline (entry point)
   ────────────────────────────────────────────── */
export async function analyzeBill(
  fileBuffer: Buffer,
  mimeType: string,
  engagement: string
): Promise<AnalysisResult> {
  const bill = await extractBillData(fileBuffer, mimeType);
  const offersResult = bill.needs_full_annual_invoice
    ? []
    : compareOffers(bill, engagement);
  return { bill, offers: offersResult, engagement };
}
