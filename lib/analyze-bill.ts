import OpenAI from "openai";
import offers from "@/data/offers.json";

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
   GPT-4o Vision — Extract bill data
   ────────────────────────────────────────────── */
const EXTRACTION_PROMPT = `Tu es Billy, un expert en factures d'énergie belges.
Analyse cette facture d'électricité et extrais les informations suivantes au format JSON strict.

Réponds UNIQUEMENT avec un objet JSON valide, sans backticks, sans explication :

{
  "provider": "nom du fournisseur (ex: ENGIE, Luminus, TotalEnergies...)",
  "plan_name": "nom de l'offre/tarif si visible, sinon null",
  "total_amount_eur": nombre ou null (montant total TTC en euros),
  "consumption_kwh": nombre ou null (consommation en kWh — annuelle de préférence, sinon celle indiquée),
  "unit_price_eur_kwh": nombre ou null (prix unitaire par kWh TTC),
  "fixed_fees_eur": nombre ou null (redevance/abonnement fixe mensuel),
  "billing_period": "période de facturation (ex: 'Jan 2026' ou '01/2025 - 12/2025')",
  "postal_code": "code postal si visible, sinon null",
  "meter_type": "simple ou bi-horaire ou exclusif-nuit, sinon null",
  "is_electricity": true ou false (est-ce bien une facture d'électricité ?),
  "confidence": "high" ou "medium" ou "low" (confiance dans l'extraction)
}

Règles :
- Si une valeur n'est pas visible ou lisible, mets null
- Pour consumption_kwh, si tu vois une consommation mensuelle, multiplie par 12 pour estimer l'annuel
- Pour unit_price_eur_kwh, essaie d'extraire le prix tout compris (pas juste l'énergie)
- Les montants sont en euros (€)
- Si ce n'est pas une facture d'électricité, mets is_electricity à false`;

export async function extractBillData(
  fileBuffer: Buffer,
  mimeType: string
): Promise<ExtractedBill & { is_electricity: boolean; confidence: string }> {
  const openai = getOpenAI();
  if (!openai) {
    throw new Error("OPENAI_API_KEY_MISSING");
  }

  const base64 = fileBuffer.toString("base64");
  const isImage = mimeType.startsWith("image/");

  let content: OpenAI.Chat.ChatCompletionContentPart[];

  if (isImage) {
    // Send image directly to GPT-4o Vision
    content = [
      { type: "text", text: EXTRACTION_PROMPT },
      {
        type: "image_url",
        image_url: {
          url: `data:${mimeType};base64,${base64}`,
          detail: "high",
        },
      },
    ];
  } else {
    // For PDFs: extract text first, then send to GPT-4o (text)
    let pdfText = "";

    try {
      // pdf-parse can be default export or module itself depending on build
      const mod = await import("pdf-parse");
      const pdfParse = (mod as any).default ?? (mod as any);
      const parsed = await pdfParse(fileBuffer);
      pdfText = parsed?.text ?? "";
    } catch {
      // Fallback: try sending the PDF as "image_url" payload (some pipelines handle it)
      content = [
        { type: "text", text: EXTRACTION_PROMPT },
        {
          type: "image_url",
          image_url: {
            url: `data:application/pdf;base64,${base64}`,
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

    if (pdfText.trim().length < 50) {
      throw new Error("PDF_TOO_SHORT");
    }

    content = [
      {
        type: "text",
        text: `${EXTRACTION_PROMPT}\n\n--- CONTENU DE LA FACTURE ---\n\n${pdfText.slice(
          0,
          8000
        )}`,
      },
    ];
  }

  const res = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content }],
    max_tokens: 1000,
    temperature: 0.1,
  });

  return parseGPTResponse(res.choices[0]?.message?.content ?? "{}");
}

function parseGPTResponse(
  raw: string
): ExtractedBill & { is_electricity: boolean; confidence: string } {
  const cleaned = raw
    .replace(/```json\s*/g, "")
    .replace(/```\s*/g, "")
    .trim();

  try {
    const data = JSON.parse(cleaned);

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
      billing_period: data.billing_period ?? null,
      postal_code: data.postal_code ?? null,
      meter_type: data.meter_type ?? null,
      is_electricity: data.is_electricity !== false,
      confidence: data.confidence ?? "medium",
    };
  } catch {
    throw new Error("GPT_INVALID_JSON");
  }
}

/* ──────────────────────────────────────────────
   Compare with market offers & calculate savings
   ────────────────────────────────────────────── */
export function compareOffers(bill: ExtractedBill, engagement: string): OfferResult[] {
  const annualKwh = bill.consumption_kwh;
  if (!annualKwh || annualKwh <= 0) return [];

  let currentAnnualCost: number;

  if (bill.total_amount_eur && bill.billing_period) {
    const months = guessMonths(bill.billing_period);
    currentAnnualCost = (bill.total_amount_eur / months) * 12;
  } else if (bill.unit_price_eur_kwh) {
    const fixedAnnual = (bill.fixed_fees_eur ?? 5) * 12;
    currentAnnualCost = bill.unit_price_eur_kwh * annualKwh + fixedAnnual;
  } else if (bill.total_amount_eur) {
    currentAnnualCost = bill.total_amount_eur * 12;
  } else {
    return [];
  }

  const currentProvider = (bill.provider ?? "").toLowerCase();

  const results: OfferResult[] = (offers as any[])
    .filter((o) => o.provider.toLowerCase() !== currentProvider)
    .map((offer) => {
      const annualCost = offer.price_kwh * annualKwh + offer.fixed_fee_month * 12;
      const savings = Math.round(currentAnnualCost - annualCost);
      const savingsPercent = Math.round((savings / currentAnnualCost) * 100);

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

  const bill: ExtractedBill = {
    provider: extracted.provider,
    plan_name: extracted.plan_name,
    total_amount_eur: extracted.total_amount_eur,
    consumption_kwh: extracted.consumption_kwh,
    unit_price_eur_kwh: extracted.unit_price_eur_kwh,
    fixed_fees_eur: extracted.fixed_fees_eur,
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
