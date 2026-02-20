// lib/offers/index.ts
//
// Unified typed API for all market offer data.
// Source files live in /data — updated via scripts/pricing/sync.ts.
//
// IMPORTANT: Only partner offers are returned. Non-partner offers
// are filtered out by both the `active` flag and the allowlist
// in lib/offers/partners.ts.

import electricityBERaw from "@/data/offers-electricity-be.json";
import electricityFRRaw from "@/data/offers-electricity-fr.json";
import telecomBERaw from "@/data/offers-telecom-be.json";
import { isPartner, warnNonPartnerOffers } from "./partners";

/* ──────────────────────────────────────────────
   Types
   ────────────────────────────────────────────── */

export interface ElectricityOffer {
  provider_id: string;
  provider_name: string;
  offer_id: string;
  offer_name: string;
  country: string;         // injected: "BE" | "FR"
  region: string;          // "ALL" | "WAL" | "FLA" | "BRU"
  meter_type: string;      // "ALL" | "MONO" | "BI"
  energy_price_day: number;
  energy_price_night: number | null;
  supplier_fixed_fee_year: number;
  promo_bonus: number | null;
  contract_type: string;   // "FIXED" | "VARIABLE" | "REGULATED"
  valid_from: string | null;
  valid_to: string | null;
  source_url: string;
}

export interface TelecomOffer {
  provider_id: string;
  provider_name: string;
  offer_id: string;
  offer_name: string;
  country: string;         // injected: "BE"
  region: string;          // "ALL" | "WAL" | "FLA"
  monthly_price_eur: number;
  plan_type: string;       // "bundle" | "internet" | "mobile" | "tv"
  download_speed_mbps: number | null;
  data_gb: number | null;
  includes_tv: boolean;
  includes_internet: boolean;
  includes_mobile: boolean;
  promo_bonus: number | null;  // lump-sum first-year discount (negative = savings)
  contract_type: string;
  valid_from: string | null;
  valid_to: string | null;
  source_url: string;
}

/* ──────────────────────────────────────────────
   Raw row type (includes optional active flag)
   ────────────────────────────────────────────── */

type ElectricityRow = Omit<ElectricityOffer, "country"> & { active?: boolean };
type TelecomRow     = Omit<TelecomOffer, "country"> & { active?: boolean };

/* ──────────────────────────────────────────────
   Build filtered offer lists (runs once at import time)
   ────────────────────────────────────────────── */

function buildElectricity(raw: ElectricityRow[], country: string): ElectricityOffer[] {
  // Log non-partner regressions (active rows not in allowlist)
  warnNonPartnerOffers(raw, "electricity", country);

  return raw
    .filter((o) => o.active !== false)
    .filter((o) => isPartner("electricity", country, o.provider_id))
    .map(({ active: _active, ...o }): ElectricityOffer => ({ ...o, country }));
}

function buildTelecom(raw: TelecomRow[], country: string): TelecomOffer[] {
  warnNonPartnerOffers(raw, "telecom", country);

  return raw
    .filter((o) => o.active !== false)
    .filter((o) => isPartner("telecom", country, o.provider_id))
    .map(({ active: _active, ...o }): TelecomOffer => ({ ...o, country }));
}

const ELECTRICITY_BE = buildElectricity(electricityBERaw as ElectricityRow[], "BE");
const ELECTRICITY_FR = buildElectricity(electricityFRRaw as ElectricityRow[], "FR");
const TELECOM_BE     = buildTelecom(telecomBERaw as TelecomRow[], "BE");

/* ──────────────────────────────────────────────
   Public API
   ────────────────────────────────────────────── */

/**
 * Return electricity offers, optionally filtered by ISO country code ("BE", "FR").
 * Only active partner offers are returned.
 */
export function getElectricityOffers(country?: string): ElectricityOffer[] {
  const all = [...ELECTRICITY_BE, ...ELECTRICITY_FR];
  if (!country) return all;
  const upper = country.toUpperCase();
  return all.filter((o) => o.country === upper);
}

/**
 * Return telecom offers, optionally filtered by ISO country code.
 * Only active partner offers are returned.
 */
export function getTelecomOffers(country?: string): TelecomOffer[] {
  if (!country) return TELECOM_BE;
  const upper = country.toUpperCase();
  return TELECOM_BE.filter((o) => o.country === upper);
}
