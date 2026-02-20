// scripts/pricing/sources.ts
//
// Registry mapping each partner adapter to its target JSON file + schema type.
// Phase 1: MEGA + Octa+ electricity BE only.

import type { PartnerAdapter } from "./adapters/_types";
import type { ElectricityRow, TelecomRow } from "./schema";

import { megaElecBeAdapter } from "./adapters/mega-elec-be";
import { octaElecBeAdapter } from "./adapters/octa-elec-be";

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
  // ── Phase 1: Belgium electricity ──
  {
    adapter: megaElecBeAdapter,
    targetFile: "offers-electricity-be.json",
    schemaType: "electricity",
    providerIds: ["mega"],
    enabled: true,
  },
  {
    adapter: octaElecBeAdapter,
    targetFile: "offers-electricity-be.json",
    schemaType: "electricity",
    providerIds: ["octa_plus"],
    enabled: true,
  },
];
