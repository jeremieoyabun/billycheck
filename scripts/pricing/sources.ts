// scripts/pricing/sources.ts
//
// Registry mapping each partner adapter to its target JSON file + schema type.

import type { PartnerAdapter } from "./adapters/_types";
import type { ElectricityRow, TelecomRow } from "./schema";

import { megaTelecomBeAdapter } from "./adapters/mega-telecom-be";
import { orangeTelecomBeAdapter } from "./adapters/orange-telecom-be";
import { totalenergiesElecFrAdapter } from "./adapters/totalenergies-elec-fr";
import { totalenergiesElecBeAdapter } from "./adapters/totalenergies-elec-be";
import { megaElecBeAdapter } from "./adapters/mega-elec-be";
import { boltElecBeAdapter } from "./adapters/bolt-elec-be";

export type SchemaType = "electricity" | "telecom";

export interface PartnerSource {
  adapter: PartnerAdapter<ElectricityRow | TelecomRow>;
  /** Target JSON file basename (under data/) */
  targetFile: string;
  schemaType: SchemaType;
  /** Provider IDs whose rows this adapter replaces */
  providerIds: string[];
  /** Whether this adapter is enabled */
  enabled: boolean;
  /** Crawl delay in ms before fetching (for robots.txt compliance) */
  crawlDelayMs?: number;
}

export const PARTNER_SOURCES: PartnerSource[] = [
  {
    adapter: megaTelecomBeAdapter,
    targetFile: "offers-telecom-be.json",
    schemaType: "telecom",
    providerIds: ["mega"],
    enabled: true,
  },
  {
    adapter: orangeTelecomBeAdapter,
    targetFile: "offers-telecom-be.json",
    schemaType: "telecom",
    providerIds: ["orange"],
    enabled: true,
    crawlDelayMs: 10_000,
  },
  {
    adapter: totalenergiesElecFrAdapter,
    targetFile: "offers-electricity-fr.json",
    schemaType: "electricity",
    providerIds: ["totalenergies_fr"],
    enabled: true,
  },
  {
    adapter: totalenergiesElecBeAdapter,
    targetFile: "offers-electricity-be.json",
    schemaType: "electricity",
    providerIds: ["totalenergies"],
    enabled: true,
  },
  {
    adapter: megaElecBeAdapter,
    targetFile: "offers-electricity-be.json",
    schemaType: "electricity",
    providerIds: ["mega"],
    enabled: true,
  },
  {
    adapter: boltElecBeAdapter,
    targetFile: "offers-electricity-be.json",
    schemaType: "electricity",
    providerIds: ["bolt"],
    enabled: true,
  },
];
