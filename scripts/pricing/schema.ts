// scripts/pricing/schema.ts
//
// Zod schemas for validating CSV rows downloaded from Google Sheets.
// Run via: npm run sync:pricing

import { z } from "zod";

/* ──────────────────────────────────────────────
   Shared coercions
   ────────────────────────────────────────────── */

const coerceNum = z.preprocess(
  (v) => (v === "" || v == null ? undefined : Number(v)),
  z.number()
);

const coerceOptNum = z.preprocess(
  (v) => (v === "" || v == null ? null : Number(v)),
  z.number().nullable()
);

const coerceBool = z.preprocess(
  (v) => {
    if (typeof v === "boolean") return v;
    if (v === "" || v == null) return false;
    return String(v).toLowerCase() === "true" || v === "1";
  },
  z.boolean()
);

const coerceOptDate = z.preprocess(
  (v) => (v === "" || v == null ? null : String(v)),
  z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Expected YYYY-MM-DD").nullable()
);

const contractTypeEnum = z.enum(["FIXED", "VARIABLE", "REGULATED"]);
const meterTypeEnum    = z.enum(["ALL", "MONO", "BI"]);
const regionEnum       = z.enum(["ALL", "WAL", "FLA", "BRU"]);
const planTypeEnum     = z.enum(["bundle", "internet", "mobile", "tv"]);

/* ──────────────────────────────────────────────
   Electricity BE/FR row schema
   ────────────────────────────────────────────── */

export const ElectricityRowSchema = z
  .object({
    provider_id:             z.string().min(1),
    provider_name:           z.string().min(1),
    offer_id:                z.string().min(1),
    offer_name:              z.string().min(1),
    region:                  regionEnum,
    meter_type:              meterTypeEnum,
    energy_price_day:        coerceNum,
    energy_price_night:      coerceOptNum,
    supplier_fixed_fee_year: coerceNum,
    promo_bonus:             coerceOptNum,
    contract_type:           contractTypeEnum,
    valid_from:              coerceOptDate,
    valid_to:                coerceOptDate,
    source_url:              z.string().url(),
  })
  .superRefine((row, ctx) => {
    if (row.meter_type === "MONO" && row.energy_price_night !== null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["energy_price_night"],
        message: "MONO meter_type must have energy_price_night = null",
      });
    }
  });

export type ElectricityRow = z.infer<typeof ElectricityRowSchema>;

/* ──────────────────────────────────────────────
   Telecom BE row schema
   ────────────────────────────────────────────── */

const telecomRegionEnum = z.enum(["ALL", "WAL", "FLA"]);

export const TelecomRowSchema = z
  .object({
    provider_id:        z.string().min(1),
    provider_name:      z.string().min(1),
    offer_id:           z.string().min(1),
    offer_name:         z.string().min(1),
    region:             telecomRegionEnum,
    monthly_price_eur:  coerceNum,
    plan_type:          planTypeEnum,
    download_speed_mbps: coerceOptNum,
    data_gb:            coerceOptNum,
    includes_tv:        coerceBool,
    includes_internet:  coerceBool,
    includes_mobile:    coerceBool,
    contract_type:      contractTypeEnum,
    valid_from:         coerceOptDate,
    valid_to:           coerceOptDate,
    source_url:         z.string().url(),
  })
  .superRefine((row, ctx) => {
    if (row.plan_type !== "mobile" && row.data_gb !== null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["data_gb"],
        message: "data_gb must be null for non-mobile plan_types",
      });
    }
  });

export type TelecomRow = z.infer<typeof TelecomRowSchema>;
