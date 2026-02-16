// lib/analyze-bill.ts
//
// Stable extraction pipeline (Next.js 16, runtime=nodejs)
// - Images  → GPT-4o Vision
// - PDFs    → pdf-parse (text) → GPT-4o (text only, NO Vision)
// - Scanned PDFs (no text) → throws PDF_SCANNED_NEEDS_PHOTO
//
// v3-clean — 2025-02

import OpenAI from "openai";
import offers from "@/data/offers.json";

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

  energy_unit_price_eur_kwh: number | null;
  consumption_kwh_annual: number | null;
  subscription_annual_ht_eur: number | null;
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
const EXTRACTION_PROMPT = `Tu es Billy, expert en factures d'électricité.
Analyse la facture et réponds UNIQUEMENT avec un objet JSON valide (sans backticks, sans texte).

Objectif: extraire 4 valeurs indispensables pour comparer des offres:
1) prix du kWh réellement payé (€/kWh, TTC)
2) consommation totale annuelle réelle (kWh/an)
3) abonnement annuel HT (€/an HT)
4) total annuel TTC réellement payé (€/an TTC)

Règles STRICTES:
- N'invente jamais.
- IMPORTANT "subscription_annual_ht_eur":
  Ce champ correspond UNIQUEMENT à la redevance fixe du FOURNISSEUR.
  N'inclus JAMAIS : distribution, transport, terme fixe réseau, redevances de raccordement, taxes, prosumer,
  énergie renouvelable, contributions, ou tout autre poste non-fournisseur.
  Si la facture ne donne pas clairement un TOTAL ANNUEL de cette redevance fournisseur, mets null.
  Ne transforme jamais un montant mensuel en annuel.
- Ne fais PAS d'extrapolation automatique.
- Si une valeur n'est pas clairement visible, mets null.
- Si bi-horaire HP/HC et que tu vois prix+conso HP/HC, retourne ces détails.

Schéma EXACT:

{
  "provider": string|null,
  "plan_name": string|null,
  "postal_code": string|null,
  "meter_type": string|null,
  "billing_period": string|null,
  "subscription_source_label": string|null,

  "energy_unit_price_eur_kwh": number|null,
  "consumption_kwh_annual": number|null,
  "subscription_annual_ht_eur": number|null,
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

  const bill: ExtractedBill = {
    provider: (data.provider as string) ?? null,
    plan_name: (data.plan_name as string) ?? null,
    postal_code: (data.postal_code as string) ?? null,
    meter_type: (data.meter_type as string) ?? null,
    billing_period: (data.billing_period as string) ?? null,

    energy_unit_price_eur_kwh: weighted ?? numOrNull(data.energy_unit_price_eur_kwh),
    consumption_kwh_annual: numOrNull(data.consumption_kwh_annual),
    subscription_annual_ht_eur: numOrNull(data.subscription_annual_ht_eur),
    total_annual_ttc_eur: numOrNull(data.total_annual_ttc_eur),

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
   PDF → TEXT via pdf-parse (Buffer -> string)
   ────────────────────────────────────────────── */
async function extractPdfTextFromBuffer(pdfBuffer: Buffer): Promise<string> {
  if (!pdfBuffer || !Buffer.isBuffer(pdfBuffer) || pdfBuffer.length === 0) {
    throw new Error("Missing PDF buffer (empty/undefined).");
  }

const mod: any = await import("pdf-parse");
const pdfParse: any = mod?.default ?? mod;

console.log("██ PDF-PARSE BUFFER LENGTH =", (pdfBuffer as any)?.length, "isBuffer=", Buffer.isBuffer(pdfBuffer));

if (!pdfBuffer || !Buffer.isBuffer(pdfBuffer) || pdfBuffer.length === 0) {
  throw new Error("MISSING_PDF_BUFFER_BEFORE_PDFPARSE");
}

const parsed = await pdfParse(pdfBuffer);
return (parsed?.text ?? "").trim();

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

  console.log("[analyze] IMAGE path — GPT-4o Vision, mime:", mimeType);

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
   PATH B — PDF → text → GPT (NO Vision)
   ────────────────────────────────────────────── */
async function extractFromPdfTextWithGpt(
  openai: OpenAI,
  pdfText: string
): Promise<string> {
  console.log("[analyze] PDF TEXT path — GPT-4o text-only, length:", pdfText.length);

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
  console.log("████ ANALYZE-BILL-V3 ████ mime:", mimeType, "size:", fileBuffer.length);

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
    const pdfText = await extractPdfTextFromBuffer(fileBuffer);

    if (pdfText.length < 200) {
      throw new Error("PDF_SCANNED_NEEDS_PHOTO");
    }

    const raw = await extractFromPdfTextWithGpt(openai, pdfText);
    const bill = parseGPTResponse(raw);
    bill.extraction_mode = "pdf_text";
    bill.pdf_text_length = pdfText.length;
    return bill;
  }

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

  return (offers as Array<{
    provider: string;
    plan: string;
    price_kwh: number;
    fixed_fee_month: number;
    type: string;
    green: boolean;
    url: string;
  }>)
    .filter((o) => o.provider.toLowerCase() !== currentProvider)
    .map((offer) => {
      const annualCost = offer.price_kwh * annualKwh + offer.fixed_fee_month * 12;
      const savings = Math.round(currentAnnualCost - annualCost);
      const savingsPercent =
        currentAnnualCost > 0 ? Math.round((savings / currentAnnualCost) * 100) : 0;

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
  const offersResult = bill.needs_full_annual_invoice ? [] : compareOffers(bill, engagement);
  return { bill, offers: offersResult, engagement };
}
