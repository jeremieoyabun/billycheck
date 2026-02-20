// lib/analyze-telecom.ts
// Telecom bill extraction pipeline (GPT-4o) + offer comparison

import OpenAI from "openai";
import { getTelecomOffers } from "@/lib/offers/index";

/* ──────────────────────────────────────────────
   Types
   ────────────────────────────────────────────── */
export interface ExtractedTelecomBill {
  provider: string | null;
  plan_name: string | null;
  plan_type: "bundle" | "internet" | "mobile" | "tv" | null;

  monthly_price_ttc_eur: number | null;

  download_speed_mbps: number | null;
  mobile_data_gb: number | null;

  includes_tv: boolean;
  includes_internet: boolean;
  includes_mobile: boolean;

  billing_period_start: string | null;
  billing_period_end: string | null;
  country: string | null;

  confidence: "ok" | "partial" | "insufficient";
  missing_fields: string[];
}

export interface TelecomOffer {
  provider: string;
  plan: string;
  monthly_price_eur: number;
  plan_type: string;
  download_speed_mbps: number | null;
  data_gb: number | null;
  includes_tv: boolean;
  includes_internet: boolean;
  includes_mobile: boolean;
  promo_bonus_eur: number | null;
  estimated_annual_savings: number;
  url: string;
}

export interface TelecomAnalysisResult {
  telecom: ExtractedTelecomBill;
  offers: TelecomOffer[];
  vertical: "telecom";
}

/* ──────────────────────────────────────────────
   GPT extraction prompt
   ────────────────────────────────────────────── */
const TELECOM_EXTRACTION_PROMPT = `Tu es Billy, expert en factures telecom belges.
Analyse la facture et reponds UNIQUEMENT avec un objet JSON valide (sans backticks, sans texte).

Objectif: extraire les infos cles du contrat telecom actuel pour comparer avec des offres.

REGLES STRICTES:
- N'invente jamais. Si une valeur n'est pas clairement visible, mets null.
- Identifie le type de contrat: bundle (internet+tv+mobile), internet seul, mobile seul, tv seul.
- Fournisseurs belges courants: Proximus, Orange, VOO, Scarlet, Telenet, Base, Mobile Vikings, Yoin, hey!, MEGA.

CHAMPS A EXTRAIRE:
1. "provider": nom du fournisseur telecom
2. "plan_name": nom de l'offre ou du forfait
3. "plan_type": "bundle" | "internet" | "mobile" | "tv"
4. "monthly_price_ttc_eur": montant mensuel total TTC paye (€/mois). Cherche "Montant total", "Total TTC", "Votre facture", "Prix mensuel".
5. "download_speed_mbps": debit internet en Mbps si present (ex: 200, 500, 1000). Sinon null.
6. "mobile_data_gb": volume data mobile en GB si present. Sinon null.
7. "includes_tv": true si TV est incluse dans l'offre
8. "includes_internet": true si internet est inclus
9. "includes_mobile": true si telephonie mobile est incluse
10. "billing_period_start": date debut periode au format "YYYY-MM-DD". Sinon null.
11. "billing_period_end": date fin periode au format "YYYY-MM-DD". Sinon null.
12. "country": pays deduit du document ("BE" pour Belgique)

Schema EXACT a retourner:
{
  "provider": string|null,
  "plan_name": string|null,
  "plan_type": "bundle"|"internet"|"mobile"|"tv"|null,
  "monthly_price_ttc_eur": number|null,
  "download_speed_mbps": number|null,
  "mobile_data_gb": number|null,
  "includes_tv": boolean,
  "includes_internet": boolean,
  "includes_mobile": boolean,
  "billing_period_start": string|null,
  "billing_period_end": string|null,
  "country": string|null
}

Si ce n'est pas une facture telecom, retourne tous les champs a null/false.`;

/* ──────────────────────────────────────────────
   Helpers
   ────────────────────────────────────────────── */
function getOpenAI(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY_MISSING");
  return new OpenAI({ apiKey });
}

function numOrNull(v: unknown): number | null {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

/* ──────────────────────────────────────────────
   Parse GPT response
   ────────────────────────────────────────────── */
function parseGPTTelecomResponse(raw: string): ExtractedTelecomBill {
  const cleaned = (raw || "")
    .replace(/```json\s*/g, "")
    .replace(/```\s*/g, "")
    .trim();

  let data: Record<string, unknown>;
  try {
    data = JSON.parse(cleaned);
  } catch {
    throw new Error("GPT_INVALID_JSON");
  }

  const monthlyPrice = numOrNull(data.monthly_price_ttc_eur);

  const missing: string[] = [];
  if (monthlyPrice == null) missing.push("monthly_price_ttc_eur");
  if (!data.provider)       missing.push("provider");

  const confidence: "ok" | "partial" | "insufficient" =
    missing.includes("monthly_price_ttc_eur") ? "insufficient"
    : missing.length > 0 ? "partial"
    : "ok";

  const planType = data.plan_type as "bundle" | "internet" | "mobile" | "tv" | null;
  const validPlanTypes = ["bundle", "internet", "mobile", "tv"];

  return {
    provider:   (data.provider as string) ?? null,
    plan_name:  (data.plan_name as string) ?? null,
    plan_type:  validPlanTypes.includes(planType as string) ? planType : null,

    monthly_price_ttc_eur: monthlyPrice,

    download_speed_mbps: numOrNull(data.download_speed_mbps),
    mobile_data_gb:      numOrNull(data.mobile_data_gb),

    includes_tv:       Boolean(data.includes_tv),
    includes_internet: Boolean(data.includes_internet),
    includes_mobile:   Boolean(data.includes_mobile),

    billing_period_start: (data.billing_period_start as string) ?? null,
    billing_period_end:   (data.billing_period_end as string) ?? null,
    country: ((data.country as string) ?? "BE").toUpperCase(),

    confidence,
    missing_fields: missing,
  };
}

/* ──────────────────────────────────────────────
   Extraction from image (Vision)
   ────────────────────────────────────────────── */
async function extractTelecomFromImage(
  openai: OpenAI,
  fileBuffer: Buffer,
  mimeType: string
): Promise<string> {
  const base64 = fileBuffer.toString("base64");
  const res = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: TELECOM_EXTRACTION_PROMPT },
          {
            type: "image_url",
            image_url: { url: `data:${mimeType};base64,${base64}`, detail: "high" },
          },
        ],
      },
    ],
    max_tokens: 800,
    temperature: 0.1,
  });
  return res.choices[0]?.message?.content ?? "{}";
}

/* ──────────────────────────────────────────────
   Extraction from PDF text
   ────────────────────────────────────────────── */
async function extractTelecomFromPdfText(
  openai: OpenAI,
  pdfText: string
): Promise<string> {
  const MAX = 16000;
  const payload = pdfText.length > MAX
    ? pdfText.slice(0, 10000) + "\n\n[...TRONQUE...]\n\n" + pdfText.slice(-4000)
    : pdfText;

  const res = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "user",
        content: TELECOM_EXTRACTION_PROMPT + "\n\n--- CONTENU FACTURE ---\n\n" + payload,
      },
    ],
    max_tokens: 800,
    temperature: 0.1,
  });
  return res.choices[0]?.message?.content ?? "{}";
}

/* ──────────────────────────────────────────────
   Offer comparison
   ────────────────────────────────────────────── */
export function compareTelecomOffers(bill: ExtractedTelecomBill): TelecomOffer[] {
  const currentMonthly = bill.monthly_price_ttc_eur;
  if (!currentMonthly || currentMonthly <= 0) return [];

  const currentProvider = (bill.provider ?? "").toLowerCase();
  const billCountry = (bill.country ?? "BE").toUpperCase();
  const billType = bill.plan_type ?? "bundle";

  // Compatible offer types: bundle is compatible with everything;
  // specific types only match themselves or bundle
  function isCompatible(offerType: string): boolean {
    if (billType === "bundle") return true;
    if (offerType === "bundle") return true;
    return offerType === billType;
  }

  const currentAnnual = currentMonthly * 12;

  return getTelecomOffers(billCountry)
    .filter((o) => o.provider_name.toLowerCase() !== currentProvider)
    .filter((o) => isCompatible(o.plan_type))
    .map((o) => {
      const promoBonus = o.promo_bonus ?? 0; // negative = discount
      const offerAnnualCost = o.monthly_price_eur * 12 + promoBonus;
      const savings = Math.round(currentAnnual - offerAnnualCost);

      return {
        provider:                 o.provider_name,
        plan:                     o.offer_name,
        monthly_price_eur:        o.monthly_price_eur,
        plan_type:                o.plan_type,
        download_speed_mbps:      o.download_speed_mbps,
        data_gb:                  o.data_gb,
        includes_tv:              o.includes_tv,
        includes_internet:        o.includes_internet,
        includes_mobile:          o.includes_mobile,
        promo_bonus_eur:          promoBonus !== 0 ? promoBonus : null,
        estimated_annual_savings: savings,
        url:                      o.source_url,
      };
    })
    .filter((o) => o.estimated_annual_savings > 10)
    .sort((a, b) => b.estimated_annual_savings - a.estimated_annual_savings)
    .slice(0, 3);
}

/* ──────────────────────────────────────────────
   Main entry point
   ────────────────────────────────────────────── */
export async function analyzeTelecomBill(
  fileBuffer: Buffer,
  mimeType: string
): Promise<TelecomAnalysisResult> {
  const openai = getOpenAI();

  const mime = mimeType.toLowerCase();
  let rawJson: string;

  if (mime.startsWith("image/")) {
    rawJson = await extractTelecomFromImage(openai, fileBuffer, mimeType);
  } else if (mime.includes("pdf")) {
    // Extract text first (reuse the same pdf-parse approach)
    const mod = await import("pdf-parse");
    const parser = mod?.default ?? mod;
    const parsed = await parser(fileBuffer);
    const pdfText = (parsed?.text ?? "").toString().trim();
    if (pdfText.length < 100) throw new Error("PDF_SCANNED_NEEDS_PHOTO");
    rawJson = await extractTelecomFromPdfText(openai, pdfText);
  } else {
    throw new Error("UNSUPPORTED_MIME_TYPE:" + mimeType);
  }

  const telecom = parseGPTTelecomResponse(rawJson);
  const offers  = telecom.confidence !== "insufficient"
    ? compareTelecomOffers(telecom)
    : [];

  return { telecom, offers, vertical: "telecom" };
}
