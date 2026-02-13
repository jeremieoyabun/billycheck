export type BillValidationReason =
  | "KEYWORDS_ESTIMATED_OR_SCHEDULE"
  | "MISSING_CONSUMPTION_KWH"
  | "MISSING_SUBSCRIPTION_OR_ENERGY_INFO";

export type BillValidationResult = {
  isComparable: boolean;
  reasons: BillValidationReason[];
};

export type MinimalBill = {
  fixed_fees_eur: number | null;        // abonnement (idéalement HT)
  unit_price_eur_kwh: number | null;    // prix énergie HT/kWh (si dispo)
  consumption_kwh: number | null;       // conso réelle
  billing_period: string | null;        // période si extraite
  raw_text?: string | null;
};

/**
 * Rules:
 * - Block only when we are reasonably sure it's an estimated bill / schedule.
 * - Allow "régularisation / annuelle" even if some fields are imperfect.
 */
export function validateBillForComparison(bill: MinimalBill): BillValidationResult {
  const text = (bill.raw_text ?? "").toLowerCase();

  // Strong allow signals (regularization / annual / settlement)
  const allowKeywords = [
    "régularisation",
    "regularisation",
    "facture annuelle",
    "annuelle",
    "décompte",
    "decompte",
    "clôture",
    "cloture",
    "solde",
    "relevé",
    "releve",
  ];

  const hasAllowSignal = allowKeywords.some((k) => text.includes(k));

  // Strong block signals (schedule / advance payments / estimated)
  const blockKeywords = [
    "échéancier",
    "echeancier",
    "estimation",
    "estimée",
    "estimee",
    "acompte",
    "acomptes",
    "mensualité",
    "mensualite",
    "provision",
    "facture intermédiaire",
    "intermediaire",
  ];

  const hasBlockSignal = blockKeywords.some((k) => text.includes(k));

  // Basic data checks
  const hasKwh = typeof bill.consumption_kwh === "number" && bill.consumption_kwh > 0;

  const hasSubscription =
    typeof bill.fixed_fees_eur === "number" && bill.fixed_fees_eur >= 0;

  // unit price is the best energy signal. If missing, we can still allow if it's clearly a regularization + has kWh.
  const hasUnitPrice =
    typeof bill.unit_price_eur_kwh === "number" && bill.unit_price_eur_kwh > 0;

  // Decision logic:
  // 1) If explicit regularization/annual signals + has kWh => allow.
  if (hasAllowSignal && hasKwh) {
    return { isComparable: true, reasons: [] };
  }

  // 2) If explicit schedule/estimated signal AND missing kWh => block.
  if (hasBlockSignal && !hasKwh) {
    return { isComparable: false, reasons: ["KEYWORDS_ESTIMATED_OR_SCHEDULE", "MISSING_CONSUMPTION_KWH"] };
  }

  // 3) If no kWh at all => block (can't compare without real consumption).
  if (!hasKwh) {
    return { isComparable: false, reasons: ["MISSING_CONSUMPTION_KWH"] };
  }

  // 4) If we have kWh but we lack BOTH subscription and unit price,
  //    it's probably not usable for comparison (too many missing comparison fields).
  if (!hasSubscription && !hasUnitPrice) {
    return { isComparable: false, reasons: ["MISSING_SUBSCRIPTION_OR_ENERGY_INFO"] };
  }

  // Otherwise allow.
  return { isComparable: true, reasons: [] };
}
