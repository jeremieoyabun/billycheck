/**
 * Bill validation after extraction.
 * Checks whether the extracted data contains enough information
 * for a reliable comparison, or if it's an estimated/schedule bill.
 */

export interface ExtractedFields {
  subscription_ht_monthly?: number | null;
  energy_amount_ht_total?: number | null;
  total_kwh?: number | null;
  energy_amount_ht_hp?: number | null;
  kwh_hp?: number | null;
  energy_amount_ht_hc?: number | null;
  kwh_hc?: number | null;
  raw_text?: string | null;
  [key: string]: unknown;
}

export interface ValidationResult {
  valid: boolean;
  code?: string;
  reason?: string;
}

const SCHEDULE_KEYWORDS = [
  "échéancier",
  "echeancier",
  "estimation",
  "estimée",
  "estimee",
  "acompte",
  "mensualité",
  "mensualite",
  "facture intermédiaire",
  "facture intermediaire",
  "avance sur consommation",
  "prélèvement mensuel",
  "prelevement mensuel",
];

export function validateBillForComparison(data: ExtractedFields): ValidationResult {
  // 1. Check for schedule/estimated keywords in raw text
  if (data.raw_text) {
    const lower = data.raw_text.toLowerCase();
    const found = SCHEDULE_KEYWORDS.some((kw) => lower.includes(kw));
    if (found) {
      return {
        valid: false,
        code: "BILL_NOT_COMPATIBLE",
        reason: "ESTIMATED_OR_SCHEDULE",
      };
    }
  }

  // 2. Check required fields for comparison
  const hasSubscription =
    data.subscription_ht_monthly != null && data.subscription_ht_monthly > 0;

  const hasMonoEnergy =
    data.energy_amount_ht_total != null &&
    data.energy_amount_ht_total > 0 &&
    data.total_kwh != null &&
    data.total_kwh > 0;

  const hasHpHcEnergy =
    data.energy_amount_ht_hp != null &&
    data.energy_amount_ht_hp > 0 &&
    data.kwh_hp != null &&
    data.kwh_hp > 0 &&
    data.energy_amount_ht_hc != null &&
    data.energy_amount_ht_hc > 0 &&
    data.kwh_hc != null &&
    data.kwh_hc > 0;

  const hasEnergyData = hasMonoEnergy || hasHpHcEnergy;

  if (!hasSubscription || !hasEnergyData) {
    return {
      valid: false,
      code: "BILL_NOT_COMPATIBLE",
      reason: "ESTIMATED_OR_SCHEDULE",
    };
  }

  return { valid: true };
}

/**
 * Compute the weighted average energy price HT/kWh for HP/HC meters.
 */
export function computeWeightedAverage(
  amountHtHp: number,
  kwhHp: number,
  amountHtHc: number,
  kwhHc: number
): number {
  const totalAmount = amountHtHp + amountHtHc;
  const totalKwh = kwhHp + kwhHc;
  if (totalKwh === 0) return 0;
  return totalAmount / totalKwh;
}
