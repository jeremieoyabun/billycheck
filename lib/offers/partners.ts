// lib/offers/partners.ts
//
// Authoritative partner allowlists per vertical and country.
// ONLY offers from these providers may be recommended to users.
// Non-partner offers must NEVER appear in results.

export const PARTNER_PROVIDERS = {
  electricity: {
    BE: new Set([
      "bolt",
      "octa_plus",
      "zendure",
      "mega",
      "elegant",
      "frank_energie",
      "energie_be",
    ]),
    // FR: no partner filtering yet — all providers are shown
  },
  telecom: {
    BE: new Set([
      "orange",
      "yoin",
      "hey",
      "mega",
      "saily",
    ]),
  },
} as const;

/**
 * Check if a provider is an authorized partner for a given vertical + country.
 * Returns true if no allowlist exists for that combination (e.g. FR electricity).
 */
export function isPartner(
  vertical: "electricity" | "telecom",
  country: string,
  providerId: string,
): boolean {
  const byCountry = PARTNER_PROVIDERS[vertical] as Record<string, Set<string>> | undefined;
  if (!byCountry) return true;

  const allowlist = byCountry[country.toUpperCase()];
  if (!allowlist) return true; // No allowlist for this country → allow all

  return allowlist.has(providerId);
}

/**
 * Log warnings for any offers that would be filtered out by the allowlist.
 * Call at startup or in a check script to catch regressions.
 */
export function warnNonPartnerOffers(
  offers: { provider_id: string; offer_id: string; active?: boolean }[],
  vertical: "electricity" | "telecom",
  country: string,
): void {
  for (const o of offers) {
    if (o.active !== false && !isPartner(vertical, country, o.provider_id)) {
      console.warn(
        `[partners] NON-PARTNER offer active: ${vertical}/${country} provider="${o.provider_id}" offer="${o.offer_id}"`,
      );
    }
  }
}
