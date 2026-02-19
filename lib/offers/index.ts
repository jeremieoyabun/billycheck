// lib/offers/index.ts
//
// Unified typed API for all market offer data.
// Source files live in /data — updated via scripts/pricing/sync.ts.

import electricityBERaw from "@/data/offers-electricity-be.json";
import electricityFRRaw from "@/data/offers-electricity-fr.json";
import telecomBERaw from "@/data/offers-telecom-be.json";

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
  contract_type: string;
  valid_from: string | null;
  valid_to: string | null;
  source_url: string;
}

/* ──────────────────────────────────────────────
   Accessors
   ────────────────────────────────────────────── */

type ElectricityRow = Omit<ElectricityOffer, "country">;
type TelecomRow     = Omit<TelecomOffer, "country">;

const ELECTRICITY_BE = (electricityBERaw as ElectricityRow[]).map(
  (o): ElectricityOffer => ({ ...o, country: "BE" })
);

const ELECTRICITY_FR = (electricityFRRaw as ElectricityRow[]).map(
  (o): ElectricityOffer => ({ ...o, country: "FR" })
);

const TELECOM_BE = (telecomBERaw as TelecomRow[]).map(
  (o): TelecomOffer => ({ ...o, country: "BE" })
);

/**
 * Return electricity offers, optionally filtered by ISO country code ("BE", "FR").
 */
export function getElectricityOffers(country?: string): ElectricityOffer[] {
  const all = [...ELECTRICITY_BE, ...ELECTRICITY_FR];
  if (!country) return all;
  const upper = country.toUpperCase();
  return all.filter((o) => o.country === upper);
}

/**
 * Return telecom offers, optionally filtered by ISO country code.
 */
export function getTelecomOffers(country?: string): TelecomOffer[] {
  if (!country) return TELECOM_BE;
  const upper = country.toUpperCase();
  return TELECOM_BE.filter((o) => o.country === upper);
}
