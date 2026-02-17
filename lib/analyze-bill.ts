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
import offers from "@/data/offers.json";

const ANALYZE_VERSION = "ANALYZE-V8-2026-02-17";

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

6) "country": Déduis le pays depuis l'adresse, le code postal ou le fournisseur: "BE", "FR", "LU", etc.
   Indices: code postal 4 chiffres = BE, 5 chiffres = FR. Fournisseurs BE: Mega, Luminus, Eneco, Octa+. Fournisseurs FR: EDF, Engie (FR), TotalEnergies (FR).

Schéma EXACT:
{
  "provider": string|null,
  "plan_name": string|null,
  "postal_code": string|null,
  "meter_type": string|null,
  "billing_period": string|null,
  "country": string|null,

  "energy_unit_price_eur_kwh": number|null,
  "consumption_kwh_annual": number|null,
  "subscription_annual_ht_eur": number|null,
  "total_annual_htva_eur": number|null,
  "total_annual_ttc_eur": number|null,

  "hp_unit_price_eur_kwh": number|null,
  "hc_unit_price_eur_kwh": number|null,
  "hp_consumption_kwh": number|null,
  "hc_consumption_kwh": number|null
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

  return {
    ...bill,
    missing_fields: missing,
    confidence,
    needs_full_annual_invoice: confidence === "insufficient",
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
  const hpKwh = numOrNull(data.hp_consumption_kwh);
  const hcKwh = numOrNull(data.hc_consumption_kwh);
  const weighted = computeWeightedPrice(hpPrice, hcPrice, hpKwh, hcKwh);

  // Auto-compute TTC from HTVA if TTC is missing
  const htva = numOrNull(data.total_annual_htva_eur);
  let ttc = numOrNull(data.total_annual_ttc_eur);
  const country = ((data.country as string) ?? null)?.toUpperCase() ?? null;

  if (ttc == null && htva != null) {
    const sub = numOrNull(data.subscription_annual_ht_eur) ?? 0;
    if (country === "FR") {
      // France: 5.5% TVA on subscription+CTA, 20% on the rest (energy, CSPE, TCFE, etc.)
      const subTTC = sub * 1.055;
      const restTTC = (htva - sub) * 1.20;
      ttc = Math.round((subTTC + restTTC) * 100) / 100;
      console.log(`[analyze] Auto TTC (FR): sub=${sub}×1.055 + rest=${htva - sub}×1.20 = ${ttc} TTC`);
    } else {
      // Belgium: flat 6% TVA on electricity
      ttc = Math.round(htva * 1.06 * 100) / 100;
      console.log(`[analyze] Auto TTC (BE): ${htva} HTVA × 1.06 = ${ttc} TTC`);
    }
  }

  const bill: ExtractedBill = {
    provider: (data.provider as string) ?? null,
    plan_name: (data.plan_name as string) ?? null,
    postal_code: (data.postal_code as string) ?? null,
    meter_type: (data.meter_type as string) ?? null,
    billing_period: (data.billing_period as string) ?? null,
    country,

    energy_unit_price_eur_kwh: weighted ?? numOrNull(data.energy_unit_price_eur_kwh),
    consumption_kwh_annual: numOrNull(data.consumption_kwh_annual),
    subscription_annual_ht_eur: numOrNull(data.subscription_annual_ht_eur),
    total_annual_htva_eur: htva,
    total_annual_ttc_eur: ttc,

    hp_unit_price_eur_kwh: hpPrice,
    hc_unit_price_eur_kwh: hcPrice,
    hp_consumption_kwh: hpKwh,
    hc_consumption_kwh: hcKwh,

    confidence: "insufficient",
    missing_fields: [],
    needs_full_annual_invoice: true,
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
  const mod: any = await import("pdf-parse");
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

  const currentProvider = (bill.provider ?? "").toLowerCase();
  const billCountry = (bill.country ?? "BE").toUpperCase();

  return (offers as Array<{
    country?: string;
    provider: string;
    plan: string;
    price_kwh: number;
    fixed_fee_month: number;
    type: string;
    green: boolean;
    url: string;
  }>)
    .filter((o) => !o.country || o.country.toUpperCase() === billCountry)
    .filter((o) => o.provider.toLowerCase() !== currentProvider)
    .map((offer) => {
      const annualCost = offer.price_kwh * annualKwh + offer.fixed_fee_month * 12;
      const savings = Math.round(currentAnnualCost - annualCost);
      const savingsPercent =
        currentAnnualCost > 0
          ? Math.round((savings / currentAnnualCost) * 100)
          : 0;

      return {
        provider: offer.provider,
        plan: offer.plan,
        estimated_savings: savings,
        savings_percent: savingsPercent,
        price_kwh: offer.price_kwh,
        type: offer.type,
        green: offer.green,
        url: offer.url,
      };
    })
    .filter((o) => o.estimated_savings > 10)
    .sort((a, b) => b.estimated_savings - a.estimated_savings)
    .slice(0, 3);
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
