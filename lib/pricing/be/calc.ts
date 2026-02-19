// lib/pricing/be/calc.ts
//
// MVP Belgium TVAC annual cost calculator.
//
// Formula:
//   A = Energy cost HTVA   (supplier: kWh price × consumption + fixed fee)
//   B = Network cost HTVA  (GRD: distribution + transport — estimated constants)
//   C = Taxes/levies HTVA  (estimated constants per region)
//   Total HTVA = A + B + C
//   TVA = Total HTVA × vatRate (default 6% for residential electricity in BE)
//   Total TVAC = Total HTVA + TVA
//
// All network/tax values are stubs — replace with official GRD tariff tables.
// A disclaimer flag is set whenever stubs are used.

import type { BeRegion } from "./grd";

export interface BelgiumCalcInput {
  // Consumption
  annualKwhDay: number;           // kWh (day/single or HP)
  annualKwhNight: number;         // kWh (night/HC) — 0 for mono-hourly
  meterType: "mono" | "bi";

  // Supplier offer
  supplierEnergyPriceDay: number;     // €/kWh HTVA (day or single)
  supplierEnergyPriceNight: number;   // €/kWh HTVA (night) — ignored for mono
  supplierFixedFeeAnnual: number;     // € HTVA/year

  // Context
  region: BeRegion | null;
  vatRate?: number;               // default 0.06 (6%)

  // Optional prosumer
  prosumer?: boolean;
  inverterKva?: number;
}

export interface BelgiumCalcBreakdown {
  energyHtva: number;       // A: supplier energy
  networkHtva: number;      // B: GRD distribution+transport (estimated)
  taxesHtva: number;        // C: levies (estimated)
  totalHtva: number;
  vat: number;
  totalTvac: number;
  vatRate: number;
  assumptions: string[];    // human-readable notes about what was estimated
}

// ── Stub network+tax constants per region ──────────────────────────────────
// Source: indicative values from CREG annual report 2024.
// Replace with real GRD tariff schedules when available.

type NetworkTaxConstants = {
  networkPerKwh: number;     // €/kWh distribution+transport HTVA (estimated)
  networkFixed: number;      // €/year fixed GRD charge HTVA (estimated)
  taxesPerKwh: number;       // €/kWh levies (FSE, cotisations fédérales, etc.)
  taxesFixed: number;        // €/year fixed levies
};

const REGION_CONSTANTS: Record<string, NetworkTaxConstants> = {
  WAL: { networkPerKwh: 0.0820, networkFixed: 48.00, taxesPerKwh: 0.0210, taxesFixed: 12.00 },
  FLA: { networkPerKwh: 0.0760, networkFixed: 52.00, taxesPerKwh: 0.0195, taxesFixed: 10.00 },
  BRU: { networkPerKwh: 0.0890, networkFixed: 55.00, taxesPerKwh: 0.0230, taxesFixed: 14.00 },
  // Fallback (national average)
  DEFAULT: { networkPerKwh: 0.0820, networkFixed: 50.00, taxesPerKwh: 0.0210, taxesFixed: 12.00 },
};

export function calcBelgiumAnnualTotalTVAC(
  input: BelgiumCalcInput,
): BelgiumCalcBreakdown {
  const vatRate = input.vatRate ?? 0.06;
  const assumptions: string[] = [];

  const totalKwh = input.annualKwhDay + input.annualKwhNight;

  // A — Energy HTVA
  const energyHtva =
    input.meterType === "bi"
      ? input.supplierEnergyPriceDay * input.annualKwhDay +
        input.supplierEnergyPriceNight * input.annualKwhNight +
        input.supplierFixedFeeAnnual
      : input.supplierEnergyPriceDay * totalKwh + input.supplierFixedFeeAnnual;

  // B+C — Network + taxes (stub constants)
  const regionKey = input.region ?? "DEFAULT";
  const constants = REGION_CONSTANTS[regionKey] ?? REGION_CONSTANTS.DEFAULT;

  if (!input.region) {
    assumptions.push("Région non détectée — coûts réseau estimés (moyenne nationale)");
  } else {
    assumptions.push(`Coûts réseau estimés pour ${input.region} (tarifs GRD indicatifs 2024)`);
  }

  const networkHtva = constants.networkPerKwh * totalKwh + constants.networkFixed;
  const taxesHtva   = constants.taxesPerKwh   * totalKwh + constants.taxesFixed;

  assumptions.push("Taxes et prélèvements estimés — valeurs indicatives CREG 2024");

  // Prosumer surcharge stub
  if (input.prosumer && input.inverterKva && input.inverterKva > 0) {
    assumptions.push(`Prosumer (${input.inverterKva} kVA) détecté — surcharge réseau non calculée dans cette version`);
  }

  const totalHtva = energyHtva + networkHtva + taxesHtva;
  const vat = Math.round(totalHtva * vatRate * 100) / 100;
  const totalTvac = Math.round((totalHtva + vat) * 100) / 100;

  return {
    energyHtva: Math.round(energyHtva * 100) / 100,
    networkHtva: Math.round(networkHtva * 100) / 100,
    taxesHtva: Math.round(taxesHtva * 100) / 100,
    totalHtva: Math.round(totalHtva * 100) / 100,
    vat,
    totalTvac,
    vatRate,
    assumptions,
  };
}
