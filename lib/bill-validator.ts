export type BillForValidation = {
  subscription_ht_monthly: number | null | undefined;
  energy_amount_ht_total: number | null | undefined;
  total_kwh: number | null | undefined;
  raw_text: string | null | undefined;
};

export type BillValidationResult = {
  valid: boolean;
  code: string | null;
  reason: string | null;
  reasons: string[];
};

export function validateBillForComparison(bill: BillForValidation): BillValidationResult {
  const text = (bill.raw_text ?? "").toLowerCase();

  const keywordHits =
    /(échéancier|echeancier|estimation|estimée|estimee|acompte|mensualité|mensualite|facture intermédiaire|intermediaire)/i.test(
      text
    );

  const hasSubscription =
    typeof bill.subscription_ht_monthly === "number" && bill.subscription_ht_monthly > 0;

  const hasKwh = typeof bill.total_kwh === "number" && bill.total_kwh > 0;

  const hasEnergyAmount =
    typeof bill.energy_amount_ht_total === "number" && bill.energy_amount_ht_total > 0;

  if (keywordHits) {
    return {
      valid: false,
      code: "BILL_NOT_COMPATIBLE",
      reason: "KEYWORDS_ESTIMATED_OR_SCHEDULE",
      reasons: ["KEYWORDS_ESTIMATED_OR_SCHEDULE"],
    };
  }

  const reasons: string[] = [];
  if (!hasSubscription) reasons.push("MISSING_SUBSCRIPTION");
  if (!hasKwh) reasons.push("MISSING_KWH");
  if (!hasEnergyAmount) reasons.push("MISSING_ENERGY_AMOUNT");

  if (reasons.length > 0) {
    return {
      valid: false,
      code: "BILL_NOT_COMPATIBLE",
      reason: reasons[0],
      reasons,
    };
  }

  return { valid: true, code: null, reason: null, reasons: [] };
}
