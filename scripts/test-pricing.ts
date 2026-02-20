#!/usr/bin/env tsx
// scripts/test-pricing.ts
//
// Lightweight unit tests for number normalization and prosumer fee calculation.
// Run: npx tsx scripts/test-pricing.ts

import { normalizeNumeric } from "../lib/analyze-bill";
import { calcBelgiumAnnualTotalTVAC } from "../lib/pricing/be/calc";

let passed = 0;
let failed = 0;

function assert(label: string, actual: unknown, expected: unknown): void {
  const ok = actual === expected || (actual == null && expected == null);
  if (ok) {
    passed++;
  } else {
    failed++;
    console.error(`  [FAIL] ${label}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}

function assertClose(label: string, actual: number, expected: number, tolerance = 0.01): void {
  if (Math.abs(actual - expected) <= tolerance) {
    passed++;
  } else {
    failed++;
    console.error(`  [FAIL] ${label}: expected ~${expected}, got ${actual} (diff ${Math.abs(actual - expected)})`);
  }
}

/* ──────────────────────────────────────────────
   1) normalizeNumeric — thousand separator handling
   ────────────────────────────────────────────── */
console.log("\n=== normalizeNumeric ===");

// Space as thousand separator
assert("'3 863' → 3863", normalizeNumeric("3 863"), 3863);
assert("'12 345' → 12345", normalizeNumeric("12 345"), 12345);

// Dot as thousand separator (exactly 3 digits after)
assert("'3.863' → 3863", normalizeNumeric("3.863"), 3863);
assert("'12.345' → 12345", normalizeNumeric("12.345"), 12345);

// Comma as thousand separator (exactly 3 digits after)
assert("'3,863' → 3863", normalizeNumeric("3,863"), 3863);

// Comma as decimal separator (NOT 3 digits after)
assert("'0,0829' → 0.0829", normalizeNumeric("0,0829"), 0.0829);
assert("'3,54' → 3.54", normalizeNumeric("3,54"), 3.54);
assert("'14,99' → 14.99", normalizeNumeric("14,99"), 14.99);

// Plain numbers
assert("3863 → 3863", normalizeNumeric(3863), 3863);
assert("'3863' → 3863", normalizeNumeric("3863"), 3863);
assert("0.265 → 0.265", normalizeNumeric(0.265), 0.265);

// Null/empty
assert("null → null", normalizeNumeric(null), null);
assert("'' → null", normalizeNumeric(""), null);
assert("undefined → null", normalizeNumeric(undefined), null);

// Edge cases
assert("'386' → 386", normalizeNumeric("386"), 386);
assert("'3863.5' → 3863.5", normalizeNumeric("3863.5"), 3863.5);

/* ──────────────────────────────────────────────
   2) Prosumer annualization (non-switchable)
   ────────────────────────────────────────────── */
console.log("\n=== Prosumer annualization ===");

// Basic annualization: 234.56€ over 365 days = 234.56€/an
{
  const amount = 234.56;
  const days = 365;
  const annual = Math.round((amount / days) * 365 * 100) / 100;
  assertClose("365d → same amount", annual, 234.56, 0.01);
}

// Partial period: 150€ over 183 days ≈ 299.18€/an
{
  const amount = 150;
  const days = 183;
  const annual = Math.round((amount / days) * 365 * 100) / 100;
  assertClose("183d → annualized", annual, 299.18, 0.01);
}

// Zero amount → 0
{
  const amount = 0;
  const days = 365;
  const annual = Math.round((amount / days) * 365 * 100) / 100;
  assert("0€ → 0", annual, 0);
}

// Missing days → null (no annualization possible)
{
  const prosumerAmountEur: number | null = 234.56;
  const prosumerPeriodDays: number | null = null;
  let prosumerAnnualEur: number | null = null;
  if (prosumerAmountEur != null && prosumerPeriodDays != null && prosumerPeriodDays > 0) {
    prosumerAnnualEur = Math.round((prosumerAmountEur / prosumerPeriodDays) * 365 * 100) / 100;
  }
  assert("missing days → null", prosumerAnnualEur, null);
}

/* ──────────────────────────────────────────────
   3) calcBelgiumAnnualTotalTVAC — switchable costs only (no prosumer)
   ────────────────────────────────────────────── */
console.log("\n=== calcBelgiumAnnualTotalTVAC ===");

{
  const result = calcBelgiumAnnualTotalTVAC({
    annualKwhDay: 3863,
    annualKwhNight: 0,
    meterType: "mono",
    supplierEnergyPriceDay: 0.268,
    supplierEnergyPriceNight: 0.268,
    supplierFixedFeeAnnual: 42.0,
    region: "WAL",
  });

  // Prosumer is NOT computed here (it's non-switchable, handled in compareOffers)
  assert("prosumerHtva = 0", result.prosumerHtva, 0);

  // Verify switchable components: A + B + C
  const expectedEnergy = 0.268 * 3863 + 42.0;
  const expectedNetwork = 0.0820 * 3863 + 48.0;
  const expectedTaxes = 0.0210 * 3863 + 12.0;
  const expectedHtva = expectedEnergy + expectedNetwork + expectedTaxes;
  assertClose("totalHtva", result.totalHtva, expectedHtva, 1);

  const expectedVat = expectedHtva * 0.06;
  assertClose("vat", result.vat, expectedVat, 1);
  assertClose("totalTvac", result.totalTvac, expectedHtva + expectedVat, 2);
}

// Non-switchable prosumer is added externally in compareOffers:
// offerTotalTvac = breakdown.totalTvac + prosumer_annual_eur
{
  const result = calcBelgiumAnnualTotalTVAC({
    annualKwhDay: 3863,
    annualKwhNight: 0,
    meterType: "mono",
    supplierEnergyPriceDay: 0.268,
    supplierEnergyPriceNight: 0.268,
    supplierFixedFeeAnnual: 42.0,
    region: "WAL",
  });

  const prosumerAnnual = 300.90; // example: extracted from bill
  const offerTotalTvac = Math.round((result.totalTvac + prosumerAnnual) * 100) / 100;
  assert("prosumer added on top", offerTotalTvac > result.totalTvac, true);
  assertClose("prosumer delta", offerTotalTvac - result.totalTvac, prosumerAnnual, 0.01);
}

/* ──────────────────────────────────────────────
   4) Sample bill sanity: 3863 kWh, WAL (switchable only)
   ────────────────────────────────────────────── */
console.log("\n=== Sample bill sanity check ===");

{
  const result = calcBelgiumAnnualTotalTVAC({
    annualKwhDay: 3863,
    annualKwhNight: 0,
    meterType: "mono",
    supplierEnergyPriceDay: 0.268,
    supplierEnergyPriceNight: 0.268,
    supplierFixedFeeAnnual: 42.0,
    region: "WAL",
  });

  // Total TVAC (switchable only) should be plausible (€1300-€2200 for Belgian household)
  assert("totalTvac > 1300", result.totalTvac > 1300, true);
  assert("totalTvac < 2200", result.totalTvac < 2200, true);
  console.log(`  Sample bill: ${result.totalTvac}€ TVAC (energy=${result.energyHtva}, network=${result.networkHtva}, taxes=${result.taxesHtva})`);

  // With prosumer added (non-switchable): 300.90€/an from bill
  const withProsumer = Math.round((result.totalTvac + 300.90) * 100) / 100;
  assert("withProsumer > totalTvac", withProsumer > result.totalTvac, true);
  console.log(`  With prosumer: ${withProsumer}€ TVAC (includes 300.90€ prosumer from bill)`);
}

/* ──────────────────────────────────────────────
   Results
   ────────────────────────────────────────────── */
console.log(`\n=== Results: ${passed} passed, ${failed} failed ===`);
if (failed > 0) process.exit(1);
