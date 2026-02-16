// lib/analyze-bill.ts
//
// ✅ PDF multi-pages + OCR réel via GPT Vision
// - Si PDF contient du texte -> parsing texte (rapide)
// - Si PDF scanné / texte vide -> rendu pages en images -> GPT Vision (OCR)
// - Compatible Next.js runtime=nodejs
//
// Dépendances à installer:
//
// npm i pdfjs-dist
// npm i @napi-rs/canvas
//
// Notes:
// - @napi-rs/canvas est recommandé sur Vercel (binaire précompilé, moins de galères que node-canvas)
// - Si tu utilises déjà pdf-parse, tu peux le garder, mais ici on fait tout avec pdfjs pour être cohérent

import OpenAI from "openai";
import offers from "../data/offers.json";

/* ──────────────────────────────────────────────
   OpenAI lazy init
   ────────────────────────────────────────────── */
function getOpenAI() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;
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

  energy_unit_price_eur_kwh: number | null; // TTC
  consumption_kwh_annual: number | null; // kWh/an
  subscription_annual_ht_eur: number | null; // €/an HT (fournisseur uniquement)
  total_annual_ttc_eur: number | null; // €/an TTC

  hp_unit_price_eur_kwh: number | null;
  hc_unit_price_eur_kwh: number | null;
  hp_consumption_kwh: number | null;
  hc_consumption_kwh: number | null;

  confidence: ExtractionConfidence;
  missing_fields: string[];
  needs_full_annual_invoice: boolean;

  // Debug UX (optionnel)
  extraction_mode?: "pdf_text" | "pdf_vision" | "image_vision";
  pdf_pages_used?: number;
  pdf_text_length?: number;
  pdf_text_empty?: boolean;
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
   Prompt (STRICT)
   ────────────────────────────────────────────── */
const EXTRACTION_PROMPT = `Tu es Billy, expert en factures d'électricité belges.
Analyse la facture et réponds UNIQUEMENT avec un objet JSON valide (sans backticks, sans texte).

Objectif: extraire 4 valeurs indispensables pour comparer des offres:
1) prix du kWh réellement payé (€/kWh, TTC)
2) consommation totale annuelle réelle (kWh/an)
3) abonnement annuel HT (€/an HT)
4) total annuel TTC réellement payé (€/an TTC)

Règles STRICTES:
- N'invente jamais.
- IMPORTANT "subscription_annual_ht_eur":
  Ce champ correspond UNIQUEMENT à la redevance fixe du FOURNISSEUR (abonnement/fee fournisseur).
  N’inclus JAMAIS : distribution, transport, terme fixe réseau, redevances de raccordement, taxes, prosumer, énergie renouvelable, contributions, ou tout autre poste non-fournisseur.
  Si la facture ne donne pas clairement un TOTAL ANNUEL de cette redevance fournisseur, mets null.
  Si tu vois une redevance fixe sur plusieurs périodes, additionne seulement si ce sont clairement des redevances fournisseur.
  Ne transforme jamais un montant mensuel en annuel.
  Indices autorisés: "redevance fixe", "abonnement", "fee", "frais fixe fournisseur"
  Indices interdits: "distribution", "transport", "terme fixe", "prosumer", "raccordement", "taxe", "accise", "TVA", "énergie renouvelable", "contribution"
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
function isImageMime(mimeType: string) {
  return typeof mimeType === "string" && mimeType.startsWith("image/");
}
function isPdfMime(mimeType: string) {
  return mimeType === "application/pdf";
}

function numOrNull(v: any): number | null {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}
function round4(n: number) {
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

function validateExtraction(bill: ExtractedBill): ExtractedBill {
  const missing: string[] = [];
  if (bill.energy_unit_price_eur_kwh == null) missing.push("energy_unit_price_eur_kwh");
  if (bill.consumption_kwh_annual == null) missing.push("consumption_kwh_annual");
  if (bill.subscription_annual_ht_eur == null) missing.push("subscription_annual_ht_eur");
  if (bill.total_annual_ttc_eur == null) missing.push("total_annual_ttc_eur");

  let confidence: ExtractionConfidence = "ok";
  if (missing.length > 0) confidence = "insufficient";
  else {
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
   PDF: extract text via pdfjs
   ────────────────────────────────────────────── */
async function extractPdfTextPdfjs(fileBuffer: Buffer): Promise<{ text: string; numPages: number }> {
  const pdfjs: any = await import("pdfjs-dist/legacy/build/pdf.mjs");

  const loadingTask = pdfjs.getDocument({ data: new Uint8Array(fileBuffer) });
  const pdf = await loadingTask.promise;

  const pages: string[] = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = (content.items || [])
      .map((it: any) => (typeof it.str === "string" ? it.str : ""))
      .filter(Boolean)
      .join(" ");
    pages.push(`[PAGE ${i}]\n${pageText}`);
  }

  return { text: pages.join("\n\n").trim(), numPages: pdf.numPages };
}

/* ──────────────────────────────────────────────
   PDF: render pages to PNG (for GPT Vision OCR)
   ────────────────────────────────────────────── */
async function renderPdfPagesToPngDataUrls(
  fileBuffer: Buffer,
  opts?: { maxPages?: number; scale?: number }
): Promise<{ dataUrls: string[]; numPages: number; pagesUsed: number[] }> {
  const maxPages = opts?.maxPages ?? 6;
  const scale = opts?.scale ?? 2.0;

  const pdfjs: any = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const canvasMod: any = await import("@napi-rs/canvas");
  const { createCanvas } = canvasMod;

  const loadingTask = pdfjs.getDocument({ data: new Uint8Array(fileBuffer) });
  const pdf = await loadingTask.promise;

  // Si gros PDF: on prend un subset (début + fin) pour limiter coûts
  const total = pdf.numPages;
  const pagesToUse: number[] = (() => {
    if (total <= maxPages) return Array.from({ length: total }, (_, i) => i + 1);

    // Exemple: maxPages=6 -> 1,2,3 + last-2,last-1,last
    const headCount = Math.ceil(maxPages / 2);
    const tailCount = maxPages - headCount;

    const head = Array.from({ length: headCount }, (_, i) => i + 1);
    const tail = Array.from({ length: tailCount }, (_, i) => total - tailCount + 1 + i);
    const merged = [...head, ...tail].filter((v, idx, arr) => arr.indexOf(v) === idx);
    return merged.slice(0, maxPages);
  })();

  const dataUrls: string[] = [];
  for (const pageNo of pagesToUse) {
    const page = await pdf.getPage(pageNo);
    const viewport = page.getViewport({ scale });

    const canvas = createCanvas(Math.ceil(viewport.width), Math.ceil(viewport.height));
    const ctx = canvas.getContext("2d");

    await page.render({ canvasContext: ctx as any, viewport }).promise;

    const png = canvas.toBuffer("image/png");
    const base64 = png.toString("base64");
    dataUrls.push(`data:image/png;base64,${base64}`);
  }

  return { dataUrls, numPages: total, pagesUsed: pagesToUse };
}

/* ──────────────────────────────────────────────
   GPT parsing
   ────────────────────────────────────────────── */
function parseGPTResponse(raw: string): ExtractedBill {
  const cleaned = raw.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();

  let data: any;
  try {
    data = JSON.parse(cleaned);
  } catch {
    throw new Error("GPT_INVALID_JSON");
  }

  const hpPrice = numOrNull(data.hp_unit_price_eur_kwh);
  const hcPrice = numOrNull(data.hc_unit_price_eur_kwh);
  const hpKwh = numOrNull(data.hp_consumption_kwh);
  const hcKwh = numOrNull(data.hc_consumption_kwh);

  const weighted = computeWeightedPrice(hpPrice, hcPrice, hpKwh, hcKwh);

  const bill: ExtractedBill = {
    provider: data.provider ?? null,
    plan_name: data.plan_name ?? null,
    postal_code: data.postal_code ?? null,
    meter_type: data.meter_type ?? null,
    billing_period: data.billing_period ?? null,

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
    extraction_mode: undefined,
  };

  return validateExtraction(bill);
}

/* ──────────────────────────────────────────────
   Core: extract bill data (image + pdf)
   ────────────────────────────────────────────── */
export async function extractBillData(fileBuffer: Buffer, mimeType: string): Promise<ExtractedBill> {
  const openai = getOpenAI();
  if (!openai) throw new Error("OPENAI_API_KEY_MISSING");

  // 1) Image -> direct Vision
  if (isImageMime(mimeType)) {
    const base64 = fileBuffer.toString("base64");

const content = [
  { type: "text" as const, text: EXTRACTION_PROMPT },
  {
    type: "image_url" as const,
    image_url: {
      url: `data:${mimeType};base64,${base64}`,
      detail: "high" as const,
    },
  },
];


const res = await openai.chat.completions.create({
  model: "gpt-4o",
  messages: [{ role: "user", content }],
  max_tokens: 1400,
  temperature: 0.1,
});

    const bill = parseGPTResponse(res.choices[0]?.message?.content ?? "{}");
    bill.extraction_mode = "image_vision";
    return bill;
  }

  // 2) PDF -> try text first, fallback Vision OCR
  if (isPdfMime(mimeType)) {
    const { text, numPages } = await extractPdfTextPdfjs(fileBuffer);
    const pdfText = (text || "").trim();
    const textLen = pdfText.length;

    // Si texte exploitable -> parsing texte
    if (textLen >= 200) {
      const MAX = 24000;
      let payloadText = pdfText;
      if (payloadText.length > MAX) {
        const head = payloadText.slice(0, 14000);
        const tail = payloadText.slice(-8000);
        payloadText = `${head}\n\n[...] (TRONQUE)\n\n${tail}`;
      }

      const content: OpenAI.Chat.ChatCompletionContentPart[] = [
        {
          type: "text",
          text:
            `${EXTRACTION_PROMPT}\n\n` +
            `META: PDF ${numPages} pages.\n\n` +
            `--- CONTENU FACTURE (TEXTE) ---\n\n` +
            payloadText,
        },
      ];

      const res = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content }],
        max_tokens: 1400,
        temperature: 0.1,
      });

      const bill = parseGPTResponse(res.choices[0]?.message?.content ?? "{}");
      bill.extraction_mode = "pdf_text";
      bill.pdf_text_length = textLen;
      return bill;
    }

    // Sinon -> PDF scanne -> Vision OCR multi-pages
    const { dataUrls, pagesUsed } = await renderPdfPagesToPngDataUrls(fileBuffer, {
      maxPages: 6,
      scale: 2.0,
    });

    if (!dataUrls.length) {
      throw new Error("PDF_TEXT_EMPTY");
    }

const visionParts = [
  {
    type: "text" as const,
    text: `${EXTRACTION_PROMPT}\n\nMETA: ...`,
  },
  ...dataUrls.map((url) => ({
    type: "image_url" as const,
    image_url: { url, detail: "high" as const },
  })),
];


    const res = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: visionParts }],
      max_tokens: 1400,
      temperature: 0.1,
    });

    const bill = parseGPTResponse(res.choices[0]?.message?.content ?? "{}");
    bill.extraction_mode = "pdf_vision";
    bill.pdf_pages_used = pagesUsed.length;
    bill.pdf_text_length = textLen;
    bill.pdf_text_empty = true;
    return bill;
  }

  throw new Error("UNSUPPORTED_MIME_TYPE");
}

/* ──────────────────────────────────────────────
   Compare offers
   ────────────────────────────────────────────── */
export function compareOffers(bill: ExtractedBill, engagement: string): OfferResult[] {
  const annualKwh = bill.consumption_kwh_annual;
  if (!annualKwh || annualKwh <= 0) return [];

  const currentAnnualCost = bill.total_annual_ttc_eur;
  if (currentAnnualCost == null || currentAnnualCost <= 0) return [];

  const currentProvider = (bill.provider ?? "").toLowerCase();

  const results: OfferResult[] = (offers as any[])
    .filter((o) => (o?.provider ?? "").toLowerCase() !== currentProvider)
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

  return results;
}

/* ──────────────────────────────────────────────
   Pipeline
   ────────────────────────────────────────────── */
export async function analyzeBill(
  fileBuffer: Buffer,
  mimeType: string,
  engagement: string
): Promise<AnalysisResult> {
  const bill = await extractBillData(fileBuffer, mimeType);

  const offerResults = bill.needs_full_annual_invoice ? [] : compareOffers(bill, engagement);

  return {
    bill,
    offers: offerResults,
    engagement,
  };
}
