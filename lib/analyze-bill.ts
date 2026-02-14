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

  // 4 valeurs indispensables (annuelles)
  energy_unit_price_eur_kwh: number | null;      // TTC (moyenne pondérée si HP/HC)
  consumption_kwh_annual: number | null;         // kWh/an
  subscription_annual_ht_eur: number | null;     // €/an HT
  total_annual_ttc_eur: number | null;           // €/an TTC

  // Détails HP/HC (si trouvés)
  hp_unit_price_eur_kwh: number | null;
  hc_unit_price_eur_kwh: number | null;
  hp_consumption_kwh: number | null;
  hc_consumption_kwh: number | null;

  // Qualité extraction
  confidence: ExtractionConfidence;
  missing_fields: string[];
  needs_full_annual_invoice: boolean;
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
   Extraction prompt (STRICT)
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
- Ne fais PAS d'extrapolation automatique (ne multiplie pas par 12 une conso mensuelle).
- Si une valeur n'est pas clairement visible, mets null.
- Si le contrat est bi-horaire HP/HC et que tu vois prix+conso HP/HC, retourne ces détails.
- Si tu ne peux pas obtenir les 4 valeurs, mets null sur ce qui manque.

Schéma EXACT:

{
  "provider": string|null,
  "plan_name": string|null,
  "postal_code": string|null,
  "meter_type": string|null,
  "billing_period": string|null,

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

async function extractPdfText(fileBuffer: Buffer): Promise<string> {
  const mod: any = await import("pdf-parse");
  const parser = mod?.default ?? mod;
  const parsed = await parser(fileBuffer);
  return (parsed?.text ?? "").toString();
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
function parseFRDate(d: string): Date | null {
  // "21-12-2024"
  const m = /^(\d{2})-(\d{2})-(\d{4})$/.exec(d.trim());
  if (!m) return null;
  const day = Number(m[1]);
  const month = Number(m[2]);
  const year = Number(m[3]);
  if (!day || !month || !year) return null;
  const dt = new Date(Date.UTC(year, month - 1, day));
  return Number.isFinite(dt.getTime()) ? dt : null;
}

function billingPeriodLooksAnnual(period: string | null): boolean {
  if (!period) return false;
  // attendu: "21-12-2024 au 09-12-2025"
  const parts = period.split("au").map((s) => s.trim());
  if (parts.length !== 2) return false;
  const a = parseFRDate(parts[0]);
  const b = parseFRDate(parts[1]);
  if (!a || !b) return false;
  const days = Math.abs((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
  return days >= 300; // ~10 mois -> on considère annuel
}

function maybeAnnualizeSubscription(bill: ExtractedBill): ExtractedBill {
  const sub = bill.subscription_annual_ht_eur;
  if (sub == null) return bill;

  // Si c'est déjà clairement annuel (>= 60€), on touche pas
  if (sub >= 60) return bill;

  // Heuristique "quasi certain que c'est mensuel"
  // 1) Période annuelle + 2) abonnement très bas (<= 35€)
  const looksAnnual = billingPeriodLooksAnnual(bill.billing_period);
  if (!looksAnnual || sub > 35) return bill;

  // Check de cohérence via le total annuel si dispo
  // total - (prix*kwh) doit être largement > sub si sub était mensuel
  const total = bill.total_annual_ttc_eur;
  const kwh = bill.consumption_kwh_annual;
  const p = bill.energy_unit_price_eur_kwh;

  if (total != null && kwh != null && p != null) {
    const energy = kwh * p;
    const remainder = total - energy;

    // si le "reste" dépasse déjà fortement le sub, c’est suspect
    // (on met un seuil conservateur)
    if (remainder > sub * 4) {
      return { ...bill, subscription_annual_ht_eur: sub * 12 };
    }

    // sinon on ne touche pas
    return bill;
  }

  // Sans total/kwh/prix, on reste conservateur: on annualise quand même,
  // car période annuelle + sub très bas est déjà très fort comme signal.
  return { ...bill, subscription_annual_ht_eur: sub * 12 };
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
   Extract bill data
   ────────────────────────────────────────────── */
export async function extractBillData(
  fileBuffer: Buffer,
  mimeType: string
): Promise<ExtractedBill> {
  const openai = getOpenAI();
  if (!openai) throw new Error("OPENAI_API_KEY_MISSING");

  const base64 = fileBuffer.toString("base64");

  if (isImageMime(mimeType)) {
    const content: OpenAI.Chat.ChatCompletionContentPart[] = [
      { type: "text", text: EXTRACTION_PROMPT },
      { type: "image_url", image_url: { url: `data:${mimeType};base64,${base64}`, detail: "high" } },
    ];

    const res = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content }],
      max_tokens: 1400,
      temperature: 0.1,
    });

    return parseGPTResponse(res.choices[0]?.message?.content ?? "{}");
  }

  if (isPdfMime(mimeType)) {
    const pdfText = (await extractPdfText(fileBuffer)).trim();
    if (pdfText.length < 50) throw new Error("PDF_NO_TEXT");

    const content: OpenAI.Chat.ChatCompletionContentPart[] = [
      { type: "text", text: `${EXTRACTION_PROMPT}\n\n--- CONTENU DE LA FACTURE ---\n\n${pdfText.slice(0, 12000)}` },
    ];

    const res = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content }],
      max_tokens: 1400,
      temperature: 0.1,
    });

    return parseGPTResponse(res.choices[0]?.message?.content ?? "{}");
  }

  throw new Error("UNSUPPORTED_MIME_TYPE");
}

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
  };

  return validateExtraction(bill);
}

/* ──────────────────────────────────────────────
   Compare with market offers & calculate savings
   ────────────────────────────────────────────── */
export function compareOffers(bill: ExtractedBill, engagement: string): OfferResult[] {
  const annualKwh = bill.consumption_kwh_annual;
  if (!annualKwh || annualKwh <= 0) return [];

  // On compare sur le total annuel TTC si dispo (meilleur signal)
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
   Full analysis pipeline
   ────────────────────────────────────────────── */
export async function analyzeBill(
  fileBuffer: Buffer,
  mimeType: string,
  engagement: string
): Promise<AnalysisResult> {
  let bill = await extractBillData(fileBuffer, mimeType);

  // ✅ Normalisation abonnement: si mensuel détecté, on le repasse en annuel
  bill = maybeAnnualizeSubscription(bill);

  // IMPORTANT: on recalcule missing/confidence/needs après mutation
  bill = validateExtraction(bill);

  const offerResults = bill.needs_full_annual_invoice ? [] : compareOffers(bill, engagement);

  const requiredOk =
    bill?.energy_unit_price_eur_kwh != null &&
    bill?.consumption_kwh_annual != null &&
    bill?.subscription_annual_ht_eur != null &&
    bill?.total_annual_ttc_eur != null;

  if (bill?.needs_full_annual_invoice) {
    bill.confidence = "insufficient";
  } else if (requiredOk) {
    bill.confidence = "ok";
  } else {
    bill.confidence = "partial";
  }

  return {
    bill,
    offers: offerResults,
    engagement,
  };
}

