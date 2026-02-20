#!/usr/bin/env tsx
// scripts/pricing/sync-partners.ts
//
// Fetches pricing data from partner websites (HTML + PDF),
// validates against Zod schemas, merges into offer JSON files.
//
// Usage:
//   npm run sync:partners            # fetch + merge + write
//   npm run sync:partners:dry        # dry-run: fetch + validate, no write
//   tsx scripts/pricing/sync-partners.ts --source=mega-telecom-be  # single adapter
//   tsx scripts/pricing/sync-partners.ts --no-cache --verbose

import fs from "fs";
import path from "path";
import { buildContext, sleep } from "./adapters/_types";
import { PARTNER_SOURCES, type SchemaType } from "./sources";
import {
  ElectricityRowSchema,
  TelecomRowSchema,
  type ElectricityRow,
  type TelecomRow,
} from "./schema";

/* ──────────────────────────────────────────────
   CLI flags
   ────────────────────────────────────────────── */

const args = process.argv.slice(2);
const CHECK_MODE = args.includes("--check") || args.includes("--dry-run");
const NO_CACHE = args.includes("--no-cache");
const VERBOSE = args.includes("--verbose");

const sourceFilter = args
  .find((a) => a.startsWith("--source="))
  ?.slice("--source=".length);

const ROOT = path.resolve(__dirname, "../..");
const DATA_DIR = path.join(ROOT, "data");

/* ──────────────────────────────────────────────
   Dedup keys (same as sync.ts)
   ────────────────────────────────────────────── */

function electricityKey(row: ElectricityRow): string {
  return `${row.provider_id}|${row.offer_id}|${row.region}|${row.meter_type}|${row.valid_from ?? ""}`;
}

function telecomKey(row: TelecomRow): string {
  return `${row.provider_id}|${row.offer_id}|${row.region}|${row.valid_from ?? ""}`;
}

/* ──────────────────────────────────────────────
   Stable sort (same as sync.ts)
   ────────────────────────────────────────────── */

function sortElectricity(rows: ElectricityRow[]): ElectricityRow[] {
  return [...rows].sort(
    (a, b) =>
      a.provider_id.localeCompare(b.provider_id) ||
      a.offer_id.localeCompare(b.offer_id) ||
      a.region.localeCompare(b.region),
  );
}

function sortTelecom(rows: TelecomRow[]): TelecomRow[] {
  return [...rows].sort(
    (a, b) =>
      a.provider_id.localeCompare(b.provider_id) ||
      a.offer_id.localeCompare(b.offer_id) ||
      a.region.localeCompare(b.region),
  );
}

/* ──────────────────────────────────────────────
   Validate rows via Zod
   ────────────────────────────────────────────── */

function validateRows(
  rows: unknown[],
  schemaType: SchemaType,
  adapterId: string,
): (ElectricityRow | TelecomRow)[] {
  const schema = schemaType === "electricity" ? ElectricityRowSchema : TelecomRowSchema;
  const valid: (ElectricityRow | TelecomRow)[] = [];
  let errorCount = 0;

  for (let i = 0; i < rows.length; i++) {
    const result = schema.safeParse(rows[i]);
    if (result.success) {
      valid.push(result.data as ElectricityRow | TelecomRow);
    } else {
      errorCount++;
      console.warn(
        `[sync-partners][${adapterId}] Row ${i + 1} invalid:`,
        JSON.stringify(rows[i]),
        "\n  Errors:",
        result.error.issues.map((e) => `${e.path.join(".")}: ${e.message}`).join(", "),
      );
    }
  }

  if (errorCount > 0) {
    console.warn(
      `[sync-partners][${adapterId}] ${errorCount}/${rows.length} rows failed validation`,
    );
  }

  return valid;
}

/* ──────────────────────────────────────────────
   Merge logic
   ────────────────────────────────────────────── */

interface MergeResult {
  rows: (ElectricityRow | TelecomRow)[];
  added: number;
  removed: number;
  unchanged: number;
}

function mergeRows(
  existing: (ElectricityRow | TelecomRow)[],
  fresh: (ElectricityRow | TelecomRow)[],
  providerIds: string[],
  schemaType: SchemaType,
): MergeResult {
  const providerSet = new Set(providerIds);

  // Partition existing: keep rows NOT from this adapter's providers
  const kept = existing.filter((r) => !providerSet.has(r.provider_id));
  const removedCount = existing.length - kept.length;

  // Combine kept + fresh
  const combined = [...kept, ...fresh];

  // Deduplicate
  if (schemaType === "electricity") {
    const seen = new Map<string, ElectricityRow>();
    for (const row of combined as ElectricityRow[]) {
      seen.set(electricityKey(row), row);
    }
    const deduped = sortElectricity(Array.from(seen.values()));
    return {
      rows: deduped,
      added: fresh.length,
      removed: removedCount,
      unchanged: kept.length,
    };
  } else {
    const seen = new Map<string, TelecomRow>();
    for (const row of combined as TelecomRow[]) {
      seen.set(telecomKey(row), row);
    }
    const deduped = sortTelecom(Array.from(seen.values()));
    return {
      rows: deduped,
      added: fresh.length,
      removed: removedCount,
      unchanged: kept.length,
    };
  }
}

/* ──────────────────────────────────────────────
   Read/write JSON
   ────────────────────────────────────────────── */

function readJsonFile(filePath: string): unknown[] {
  if (!fs.existsSync(filePath)) return [];
  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function writeJsonFile(filePath: string, data: unknown[]): void {
  const json = JSON.stringify(data, null, 2) + "\n";
  fs.writeFileSync(filePath, json, "utf-8");
}

/* ──────────────────────────────────────────────
   Main
   ────────────────────────────────────────────── */

async function main(): Promise<void> {
  console.log(
    `[sync-partners] mode=${CHECK_MODE ? "dry-run" : "write"} cache=${NO_CACHE ? "disabled" : "enabled"}`,
  );

  const ctx = buildContext({ noCache: NO_CACHE, verbose: VERBOSE });

  // Filter sources
  const sources = PARTNER_SOURCES.filter((s) => {
    if (!s.enabled) return false;
    if (sourceFilter && s.adapter.id !== sourceFilter) return false;
    return true;
  });

  if (sources.length === 0) {
    console.warn("[sync-partners] No matching sources to sync.");
    process.exit(0);
  }

  console.log(
    `[sync-partners] Running ${sources.length} adapter(s): ${sources.map((s) => s.adapter.id).join(", ")}`,
  );

  // Collect fresh rows per target file
  const freshByFile = new Map<
    string,
    { rows: (ElectricityRow | TelecomRow)[]; providerIds: string[]; schemaType: SchemaType }
  >();

  // Run adapters sequentially (respect rate limits)
  for (const source of sources) {
    const { adapter, targetFile, schemaType, providerIds, crawlDelayMs } = source;

    console.log(`\n[sync-partners] ── ${adapter.label} ──`);

    if (crawlDelayMs) {
      console.log(`[sync-partners] Waiting ${crawlDelayMs}ms (crawl-delay)...`);
      await sleep(crawlDelayMs);
    }

    try {
      const rawRows = await adapter.fetch(ctx);
      console.log(`[sync-partners][${adapter.id}] Fetched ${rawRows.length} raw rows`);

      // Validate
      const validRows = validateRows(rawRows, schemaType, adapter.id);
      console.log(`[sync-partners][${adapter.id}] ${validRows.length}/${rawRows.length} rows valid`);

      // Accumulate by target file
      if (!freshByFile.has(targetFile)) {
        freshByFile.set(targetFile, { rows: [], providerIds: [], schemaType });
      }
      const bucket = freshByFile.get(targetFile)!;
      bucket.rows.push(...validRows);
      // Only mark providers for replacement if we got actual data
      if (validRows.length > 0) {
        bucket.providerIds.push(...providerIds);
      } else {
        console.log(
          `[sync-partners][${adapter.id}] 0 valid rows — existing rows for ${providerIds.join(", ")} preserved`,
        );
      }
    } catch (err) {
      console.error(`[sync-partners][${adapter.id}] FAILED:`, err);
      console.log(
        `[sync-partners][${adapter.id}] Existing rows for provider(s) ${providerIds.join(", ")} preserved`,
      );
      // Do NOT add these providerIds to the removal list
    }
  }

  // Merge per target file
  console.log("\n[sync-partners] ── Merge ──");

  for (const [targetFile, { rows: freshRows, providerIds, schemaType }] of freshByFile) {
    const filePath = path.join(DATA_DIR, targetFile);
    const existing = readJsonFile(filePath) as (ElectricityRow | TelecomRow)[];

    const result = mergeRows(existing, freshRows, providerIds, schemaType);

    console.log(
      `[sync-partners][${targetFile}] ${existing.length} existing → ` +
        `${result.removed} removed (${providerIds.join(",")}) + ${result.added} fresh = ` +
        `${result.rows.length} total`,
    );

    if (!CHECK_MODE) {
      writeJsonFile(filePath, result.rows);
      console.log(`[sync-partners] Wrote ${result.rows.length} rows → ${filePath}`);
    } else {
      console.log(`[sync-partners][dry-run] Would write ${result.rows.length} rows → ${filePath}`);
    }
  }

  console.log("\n[sync-partners] Done.");
}

main().catch((err) => {
  console.error("[sync-partners] Fatal error:", err);
  process.exit(1);
});
