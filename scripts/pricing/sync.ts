#!/usr/bin/env tsx
// scripts/pricing/sync.ts
//
// Downloads pricing CSVs from Google Sheets (or any public URL),
// validates rows via Zod, deduplicates, sorts stably, and writes
// JSON data files used by the app.
//
// Usage:
//   npm run sync:pricing          # download + write
//   npm run sync:pricing:check    # dry-run: validate only, no write
//
// Required env vars (optional — script exits 0 with warning if unset):
//   ELECTRICITY_BE_CSV_URL
//   ELECTRICITY_FR_CSV_URL
//   TELECOM_BE_CSV_URL

import fs from "fs";
import path from "path";
import https from "https";
import http from "http";
import Papa from "papaparse";
import {
  ElectricityRowSchema,
  TelecomRowSchema,
  type ElectricityRow,
  type TelecomRow,
} from "./schema";

const CHECK_MODE = process.argv.includes("--check");
const ROOT = path.resolve(__dirname, "../..");

/* ──────────────────────────────────────────────
   Fetch CSV from URL
   ────────────────────────────────────────────── */
function fetchText(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const client = url.startsWith("https://") ? https : http;
    client
      .get(url, (res) => {
        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode} for ${url}`));
          return;
        }
        const chunks: Buffer[] = [];
        res.on("data", (chunk: Buffer) => chunks.push(chunk));
        res.on("end", () => resolve(Buffer.concat(chunks).toString("utf-8")));
        res.on("error", reject);
      })
      .on("error", reject);
  });
}

/* ──────────────────────────────────────────────
   Parse and validate CSV
   ────────────────────────────────────────────── */
function parseCsvRows(csvText: string): Record<string, unknown>[] {
  const result = Papa.parse<Record<string, unknown>>(csvText, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim(),
    transform: (v) => v.trim(),
  });
  if (result.errors.length > 0) {
    console.error("[sync] CSV parse errors:", result.errors);
    throw new Error("CSV_PARSE_FAILED");
  }
  return result.data;
}

/* ──────────────────────────────────────────────
   Deduplication key
   ────────────────────────────────────────────── */
function electricityKey(row: ElectricityRow): string {
  return `${row.provider_id}|${row.offer_id}|${row.region}|${row.meter_type}|${row.valid_from ?? ""}`;
}

function telecomKey(row: TelecomRow): string {
  return `${row.provider_id}|${row.offer_id}|${row.region}|${row.valid_from ?? ""}`;
}

/* ──────────────────────────────────────────────
   Stable sort for JSON stability
   ────────────────────────────────────────────── */
function sortElectricity(rows: ElectricityRow[]): ElectricityRow[] {
  return [...rows].sort((a, b) =>
    a.provider_id.localeCompare(b.provider_id) ||
    a.offer_id.localeCompare(b.offer_id) ||
    a.region.localeCompare(b.region)
  );
}

function sortTelecom(rows: TelecomRow[]): TelecomRow[] {
  return [...rows].sort((a, b) =>
    a.provider_id.localeCompare(b.provider_id) ||
    a.offer_id.localeCompare(b.offer_id) ||
    a.region.localeCompare(b.region)
  );
}

/* ──────────────────────────────────────────────
   Process one CSV source
   ────────────────────────────────────────────── */
type SchemaType = "electricity" | "telecom";

function validateRows(
  rawRows: Record<string, unknown>[],
  type: SchemaType,
  sourceName: string
): ElectricityRow[] | TelecomRow[] {
  const schema = type === "electricity" ? ElectricityRowSchema : TelecomRowSchema;
  const valid: (ElectricityRow | TelecomRow)[] = [];
  let errorCount = 0;

  for (let i = 0; i < rawRows.length; i++) {
    const result = schema.safeParse(rawRows[i]);
    if (result.success) {
      valid.push(result.data as ElectricityRow | TelecomRow);
    } else {
      errorCount++;
      console.warn(
        `[sync][${sourceName}] Row ${i + 2} invalid:`,
        JSON.stringify(rawRows[i]),
        "\n  Errors:",
        result.error.issues.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ")
      );
    }
  }

  if (errorCount > 0) {
    console.warn(`[sync][${sourceName}] ${errorCount}/${rawRows.length} rows had validation errors.`);
  }

  return valid as ElectricityRow[] | TelecomRow[];
}

/* ──────────────────────────────────────────────
   Write JSON (or dry-run)
   ────────────────────────────────────────────── */
function writeJson(filePath: string, data: unknown): void {
  const json = JSON.stringify(data, null, 2) + "\n";
  if (CHECK_MODE) {
    console.log(`[sync][dry-run] Would write ${Array.isArray(data) ? (data as unknown[]).length : 0} rows → ${filePath}`);
    return;
  }
  fs.writeFileSync(filePath, json, "utf-8");
  console.log(`[sync] Wrote ${Array.isArray(data) ? (data as unknown[]).length : 0} rows → ${filePath}`);
}

/* ──────────────────────────────────────────────
   Sync one electricity source
   ────────────────────────────────────────────── */
async function syncElectricity(url: string, outFile: string, sourceName: string): Promise<void> {
  console.log(`[sync] Fetching ${sourceName} from ${url}`);
  const csvText = await fetchText(url);
  const rawRows = parseCsvRows(csvText);

  const rows = validateRows(rawRows, "electricity", sourceName) as ElectricityRow[];

  // Deduplicate (keep last occurrence — CSV is assumed to be sorted newest first)
  const seen = new Map<string, ElectricityRow>();
  for (const row of rows) {
    seen.set(electricityKey(row), row);
  }

  const deduped = sortElectricity(Array.from(seen.values()));
  writeJson(outFile, deduped);
  console.log(`[sync][${sourceName}] ${rawRows.length} input → ${rows.length} valid → ${deduped.length} after dedup`);
}

/* ──────────────────────────────────────────────
   Sync one telecom source
   ────────────────────────────────────────────── */
async function syncTelecom(url: string, outFile: string, sourceName: string): Promise<void> {
  console.log(`[sync] Fetching ${sourceName} from ${url}`);
  const csvText = await fetchText(url);
  const rawRows = parseCsvRows(csvText);

  const rows = validateRows(rawRows, "telecom", sourceName) as TelecomRow[];

  const seen = new Map<string, TelecomRow>();
  for (const row of rows) {
    seen.set(telecomKey(row), row);
  }

  const deduped = sortTelecom(Array.from(seen.values()));
  writeJson(outFile, deduped);
  console.log(`[sync][${sourceName}] ${rawRows.length} input → ${rows.length} valid → ${deduped.length} after dedup`);
}

/* ──────────────────────────────────────────────
   Main
   ────────────────────────────────────────────── */
async function main(): Promise<void> {
  console.log(`[sync] mode=${CHECK_MODE ? "dry-run" : "write"}`);

  const tasks: Promise<void>[] = [];

  const elecBEUrl = process.env.ELECTRICITY_BE_CSV_URL;
  if (elecBEUrl) {
    tasks.push(
      syncElectricity(
        elecBEUrl,
        path.join(ROOT, "data/offers-electricity-be.json"),
        "electricity-BE"
      )
    );
  } else {
    console.warn("[sync] ELECTRICITY_BE_CSV_URL not set — skipping electricity-BE sync");
  }

  const elecFRUrl = process.env.ELECTRICITY_FR_CSV_URL;
  if (elecFRUrl) {
    tasks.push(
      syncElectricity(
        elecFRUrl,
        path.join(ROOT, "data/offers-electricity-fr.json"),
        "electricity-FR"
      )
    );
  } else {
    console.warn("[sync] ELECTRICITY_FR_CSV_URL not set — skipping electricity-FR sync");
  }

  const telecomBEUrl = process.env.TELECOM_BE_CSV_URL;
  if (telecomBEUrl) {
    tasks.push(
      syncTelecom(
        telecomBEUrl,
        path.join(ROOT, "data/offers-telecom-be.json"),
        "telecom-BE"
      )
    );
  } else {
    console.warn("[sync] TELECOM_BE_CSV_URL not set — skipping telecom-BE sync");
  }

  if (tasks.length === 0) {
    console.warn("[sync] No CSV URLs configured — nothing to sync. Set env vars and re-run.");
    process.exit(0);
  }

  await Promise.all(tasks);
  console.log("[sync] Done.");
}

main().catch((err) => {
  console.error("[sync] Fatal error:", err);
  process.exit(1);
});
