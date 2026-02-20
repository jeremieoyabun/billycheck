#!/usr/bin/env tsx
// scripts/check-partners.ts
//
// Validates that all active offers in data JSON files belong to authorized partners.
// Run: npx tsx scripts/check-partners.ts
//
// Exits 1 if any non-partner offer is active (catches regressions).

import fs from "fs";
import path from "path";
import { isPartner, PARTNER_PROVIDERS } from "../lib/offers/partners";

const ROOT = path.resolve(__dirname, "..");
const DATA_DIR = path.join(ROOT, "data");

interface OfferRow {
  provider_id: string;
  offer_id: string;
  active?: boolean;
}

const FILES: { file: string; vertical: "electricity" | "telecom"; country: string }[] = [
  { file: "offers-electricity-be.json", vertical: "electricity", country: "BE" },
  { file: "offers-telecom-be.json", vertical: "telecom", country: "BE" },
  // FR has no partner filtering — skip
];

let violations = 0;
let totalChecked = 0;

for (const { file, vertical, country } of FILES) {
  const filePath = path.join(DATA_DIR, file);
  if (!fs.existsSync(filePath)) {
    console.warn(`[check] SKIP: ${file} not found`);
    continue;
  }

  const rows: OfferRow[] = JSON.parse(fs.readFileSync(filePath, "utf-8"));

  for (const row of rows) {
    totalChecked++;
    const active = row.active !== false;
    const partner = isPartner(vertical, country, row.provider_id);

    if (active && !partner) {
      violations++;
      console.error(
        `[FAIL] ${file}: provider="${row.provider_id}" offer="${row.offer_id}" is active but NOT a partner`,
      );
    }

    if (!active && partner) {
      console.warn(
        `[WARN] ${file}: provider="${row.provider_id}" offer="${row.offer_id}" is a partner but marked inactive`,
      );
    }
  }
}

console.log(`\n[check-partners] Checked ${totalChecked} offers across ${FILES.length} files`);

// Print allowlists for reference
console.log("\nAuthorized partners:");
for (const [vertical, countries] of Object.entries(PARTNER_PROVIDERS)) {
  for (const [country, providers] of Object.entries(countries)) {
    console.log(`  ${vertical}/${country}: ${[...providers].join(", ")}`);
  }
}

if (violations > 0) {
  console.error(`\n[FAIL] ${violations} non-partner offer(s) are active. Fix before deploying.`);
  process.exit(1);
} else {
  console.log("\n[OK] All active offers belong to authorized partners.");
}
