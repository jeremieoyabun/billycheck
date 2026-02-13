export interface ExtractedBill {
  provider: string | null;
  plan_name: string | null;
  total_amount_eur: number | null;
  consumption_kwh: number | null;
  unit_price_eur_kwh: number | null;
  fixed_fees_eur: number | null;
  fixed_fees_monthly_eur: number | null;
  billing_period: string | null;
  postal_code: string | null;
  meter_type: string | null;
}

import OpenAI from "openai";
import offers from "../data/offers.json";

/* ──────────────────────────────────────────────
   OpenAI lazy init (avoid build-time crash)
   ────────────────────────────────────────────── */
function getOpenAI() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;
  return new OpenAI({ apiKey });
}

/* ──────────────────────────────────────────────
   Types
   ────────────────────────────────────────────── */
export interface ExtractedBill {
  provider: string | null;
  plan_name: string | null;
  total_amount_eur: number | null;
  consumption_kwh: number | null;
  unit_price_eur_kwh: number | null;
  fixed_fees_eur: number | null;
  billing_period: string | null;
  postal_code: string | null;
  meter_type: string | null;
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
   GPT-4o Vision or Text — Extract bill data
   ────────────────────────────────────────────── */
const EXTRACTION_PROMPT = `Tu es Billy, un expert en factures d'énergie belges.
Analyse cette facture d'électricité et extrais les informations suivantes au format JSON strict.

Réponds UNIQUEMENT avec un objet JSON valide, sans backticks, sans explication :

{
  "provider": "nom du fournisseur (ex: ENGIE, Luminus, TotalEnergies...)",
  "plan_name": "nom de l'offre/tarif si visible, sinon null",
  "total_amount_eur": nombre ou null (montant total TTC en euros),
  "consumption_kwh": nombre ou null (consommation en kWh, annuelle de préférence, sinon celle indiquée),
  "unit_price_eur_kwh": nombre ou null (prix unitaire par kWh TTC),
  "fixed_fees_eur": nombre ou null (total redevances/abonnements fixes HT pour la période de facturation),
  "billing_period": "période de facturation (ex: 'Jan 2026' ou '01/2025 - 12/2025')",
  "postal_code": "code postal si visible, sinon null",
  "meter_type": "simple ou bi-horaire ou exclusif-nuit, sinon null",
  "is_electricity": true ou false (est-ce bien une facture d'électricité ?),
  "confidence": "high" ou "medium" ou "low" (confiance dans l'extraction)
  
}

Règles :
- fixed_fees_eur : additionne les lignes type "redevance fixe", "abonnement", "tarif prosumer", "forfait" si elles sont des frais fixes (pas l'énergie au kWh).
- Si une valeur n'est pas visible ou lisible, mets null
- Pour consumption_kwh, si tu vois une consommation mensuelle, multiplie par 12 pour estimer l'annuel
- Pour unit_price_eur_kwh, essaie d'extraire le prix tout compris (pas juste l'énergie)
- Les montants sont en euros (€)
- Si ce n'est pas une facture d'électricité, mets is_electricity à false`;

type ExtractedBillWithMeta = ExtractedBill & {
  is_electricity: boolean;
  confidence: "high" | "medium" | "low" | string;
};

function isImageMime(mimeType: string) {
  return typeof mimeType === "string" && mimeType.startsWith("image/");
}

function isPdfMime(mimeType: string) {
  return mimeType === "application/pdf";
}

async function extractPdfText(fileBuffer: Buffer): Promise<string> {
  // pdf-parse can be ESM/CJS depending on environment, so we resolve it dynamically
  const mod: any = await import("pdf-parse");
  const parser = mod?.default ?? mod;
  const parsed = await parser(fileBuffer);
  const text = (parsed?.text ?? "").toString();
  return text;
}

export async function extractBillData(
  fileBuffer: Buffer,
  mimeType: string
): Promise<ExtractedBillWithMeta> {
  const openai = getOpenAI();
  if (!openai) throw new Error("OPENAI_API_KEY_MISSING");

  const base64 = fileBuffer.toString("base64");

  // 1) Images: use vision
  if (isImageMime(mimeType)) {
    const content: OpenAI.Chat.ChatCompletionContentPart[] = [
      { type: "text", text: EXTRACTION_PROMPT },
      {
        type: "image_url",
        image_url: {
          url: `data:${mimeType};base64,${base64}`,
          detail: "high",
        },
      },
    ];

    const res = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content }],
      max_tokens: 1000,
      temperature: 0.1,
    });

    return parseGPTResponse(res.choices[0]?.message?.content ?? "{}");
  }

  // 2) PDFs: extract text then ask GPT as text
  if (isPdfMime(mimeType)) {
    const pdfText = (await extractPdfText(fileBuffer)).trim();

    // If PDF text is empty, it's probably a scanned PDF (image-only).
    // For now we fail explicitly instead of sending PDF as image (which OpenAI rejects).
    if (pdfText.length < 50) {
      throw new Error("PDF_NO_TEXT");
    }

    const content: OpenAI.Chat.ChatCompletionContentPart[] = [
      {
        type: "text",
        text: `${EXTRACTION_PROMPT}\n\n--- CONTENU DE LA FACTURE ---\n\n${pdfText.slice(
          0,
          12000
        )}`,
      },
    ];

    const res = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content }],
      max_tokens: 1000,
      temperature: 0.1,
    });

    return parseGPTResponse(res.choices[0]?.message?.content ?? "{}");
  }

  // 3) Other file types: reject
  throw new Error("UNSUPPORTED_MIME_TYPE");
}

function parseGPTResponse(raw: string): ExtractedBillWithMeta {
  const cleaned = raw.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();

  let data: any;
  try {
    data = JSON.parse(cleaned);
  } catch {
    throw new Error("GPT_INVALID_JSON");
  }

  return {
    provider: data.provider ?? null,
    plan_name: data.plan_name ?? null,
    total_amount_eur:
      data.total_amount_eur != null ? Number(data.total_amount_eur) : null,
    consumption_kwh:
      data.consumption_kwh != null ? Number(data.consumption_kwh) : null,
    unit_price_eur_kwh:
      data.unit_price_eur_kwh != null ? Number(data.unit_price_eur_kwh) : null,
    fixed_fees_eur:
      data.fixed_fees_eur != null ? Number(data.fixed_fees_eur) : null,
    fixed_fees_monthly_eur: null,
    billing_period: data.billing_period ?? null,
    postal_code: data.postal_code ?? null,
    meter_type: data.meter_type ?? null,
    is_electricity: data.is_electricity !== false,
    confidence: data.confidence ?? "medium",
  };
}

/* ──────────────────────────────────────────────
   Compare with market offers & calculate savings
   ────────────────────────────────────────────── */
export function compareOffers(
  bill: ExtractedBill,
  engagement: string
): OfferResult[] {
  const annualKwh = bill.consumption_kwh;
  if (!annualKwh || annualKwh <= 0) return [];

  let currentAnnualCost: number;

  if (bill.total_amount_eur && bill.billing_period) {
    const months = guessMonths(bill.billing_period);
    currentAnnualCost = (bill.total_amount_eur / months) * 12;
  } else if (bill.unit_price_eur_kwh) {
    const monthlyFixed = bill.fixed_fees_monthly_eur ?? bill.fixed_fees_eur ?? 5;
    const fixedAnnual = monthlyFixed * 12;
    currentAnnualCost = bill.unit_price_eur_kwh * annualKwh + fixedAnnual;
  } else if (bill.total_amount_eur) {
    currentAnnualCost = bill.total_amount_eur * 12;
  } else {
    return [];
  }

  const currentProvider = (bill.provider ?? "").toLowerCase();

  const results: OfferResult[] = (offers as any[])
    .filter((o) => (o?.provider ?? "").toLowerCase() !== currentProvider)
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

  return results;
}

function guessMonths(period: string): number {
  const lower = period.toLowerCase();
  if (lower.includes("an") || lower.includes("year")) return 12;
  if (lower.includes("trim") || lower.includes("quarter")) return 3;
  if (lower.includes("bim") || lower.includes("2 mois")) return 2;

  const rangeMatch = period.match(
    /(\d{1,2})[/\-.](\d{4})\s*[-–]\s*(\d{1,2})[/\-.](\d{4})/
  );

  if (rangeMatch) {
    const startMonth = parseInt(rangeMatch[1], 10);
    const startYear = parseInt(rangeMatch[2], 10);
    const endMonth = parseInt(rangeMatch[3], 10);
    const endYear = parseInt(rangeMatch[4], 10);
    return (endYear - startYear) * 12 + (endMonth - startMonth) + 1;
  }

  return 1;
}

function parsePeriodToDays(period: string | null): number | null {
  if (!period) return null;

  // Formats supportés :
  // "10-12-2025 au 31-12-2025"
  // "10/12/2025 au 31/12/2025"
  const m = period.match(/(\d{2})[\/-](\d{2})[\/-](\d{4}).*?(\d{2})[\/-](\d{2})[\/-](\d{4})/);
  if (!m) return null;

  const [, d1, mo1, y1, d2, mo2, y2] = m;
  const start = new Date(Number(y1), Number(mo1) - 1, Number(d1));
  const end = new Date(Number(y2), Number(mo2) - 1, Number(d2));

  const ms = end.getTime() - start.getTime();
  const days = Math.round(ms / (1000 * 60 * 60 * 24)) + 1; // inclusif
  if (!Number.isFinite(days) || days <= 0 || days > 370) return null;

  return days;
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

function computeMonthlyFromPeriodFixed(fixedFeesPeriod: number | null, days: number | null): number | null {
  if (fixedFeesPeriod == null || days == null || days <= 0) return null;
  const monthly = (fixedFeesPeriod / days) * 30.44;
  return Number.isFinite(monthly) ? round2(monthly) : null;
}


/* ──────────────────────────────────────────────
   Full analysis pipeline
   ────────────────────────────────────────────── */
export async function analyzeBill(
  fileBuffer: Buffer,
  mimeType: string,
  engagement: string
): Promise<AnalysisResult> {
  const extracted = await extractBillData(fileBuffer, mimeType);

  if (!extracted.is_electricity) {
    throw new Error("NOT_ELECTRICITY");
  }

  const days = parsePeriodToDays(extracted.billing_period);
  const fixedMonthly = computeMonthlyFromPeriodFixed(extracted.fixed_fees_eur, days);

  const bill: ExtractedBill = {
    provider: extracted.provider,
    plan_name: extracted.plan_name,
    total_amount_eur: extracted.total_amount_eur,
    consumption_kwh: extracted.consumption_kwh,
    unit_price_eur_kwh: extracted.unit_price_eur_kwh,

    fixed_fees_eur: extracted.fixed_fees_eur,           // fixe sur la période
    fixed_fees_monthly_eur: fixedMonthly,               // ✅ €/mois calculé

    billing_period: extracted.billing_period,
    postal_code: extracted.postal_code,
    meter_type: extracted.meter_type,
  };




  const offerResults = compareOffers(bill, engagement);

  return {
    bill,
    offers: offerResults,
    engagement,
  };
}
