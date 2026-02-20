// scripts/pricing/adapters/mega-elec-be.ts
//
// MEGA Belgium electricity adapter — hardcoded verified PDF sources.
// Prices in PDFs are in c€/kWh (centimes). We convert to €/kWh.
//
// PDF text format (pdf-parse output):
//   Compteur mono-horaire15.61.28    → energy=15.6 c€/kWh, injection=1.28
//   Tarif jour16.631.28              → jour=16.63, injection=1.28
//   Tarif nuit14.531.28              → nuit=14.53, injection=1.28
//   Redevance fixe (€/an)111.30      → 111.30 €/year

import pdf from "pdf-parse";
import type { ElectricityRow } from "../schema";
import type { PartnerAdapter, AdapterContext } from "./_types";

/* ──────────────────────────────────────────────
   Hardcoded verified sources (February 2026)
   ────────────────────────────────────────────── */

interface MegaSource {
  offer_id: string;
  offer_name: string;
  contract_type: "FIXED" | "VARIABLE";
  region: "BRU" | "WAL";
  meter_type: "ALL" | "BI";
  url: string;
}

const SOURCES: MegaSource[] = [
  // Smart Fixed (2y)
  {
    offer_id: "smart_fixed_bx",
    offer_name: "Smart Fixed",
    contract_type: "FIXED",
    region: "BRU",
    meter_type: "ALL",
    url: "https://my.mega.be/resources/tarif/Mega-FR-EL-B2C-BX-022026-Smart1102-Fixed.pdf",
  },
  {
    offer_id: "smart_fixed_wl",
    offer_name: "Smart Fixed",
    contract_type: "FIXED",
    region: "WAL",
    meter_type: "ALL",
    url: "https://my.mega.be/resources/tarif/Mega-FR-EL-B2C-WL-022026-Smart1102-Fixed.pdf",
  },
  // Zen Fixed (3y)
  {
    offer_id: "zen_fixed_bx",
    offer_name: "Zen Fixed",
    contract_type: "FIXED",
    region: "BRU",
    meter_type: "ALL",
    url: "https://my.mega.be/resources/tarif/Mega-FR-EL-B2C-BX-022026-Zen-Fixed.pdf",
  },
  {
    offer_id: "zen_fixed_wl",
    offer_name: "Zen Fixed",
    contract_type: "FIXED",
    region: "WAL",
    meter_type: "ALL",
    url: "https://my.mega.be/resources/tarif/Mega-FR-EL-B2C-WL-022026-Zen-Fixed.pdf",
  },
  // Off-peak Flex (variable, bi-hourly)
  {
    offer_id: "offpeak_flex_bx",
    offer_name: "Off-peak Flex",
    contract_type: "VARIABLE",
    region: "BRU",
    meter_type: "BI",
    url: "https://my.mega.be/resources/tarif/Mega-FR-EL-B2C-BX-022026-Offpeak-Bi-Var.pdf",
  },
  {
    offer_id: "offpeak_flex_wl",
    offer_name: "Off-peak Flex",
    contract_type: "VARIABLE",
    region: "WAL",
    meter_type: "BI",
    url: "https://my.mega.be/resources/tarif/Mega-FR-EL-B2C-WL-022026-Offpeak-Bi-Var.pdf",
  },
];

/* ──────────────────────────────────────────────
   PDF text extraction helpers
   ────────────────────────────────────────────── */

/**
 * Split two concatenated prices from MEGA PDF text.
 * Example: "15.61.28" → { first: 15.6, second: 1.28 }
 *          "15.180.81" → { first: 15.18, second: 0.81 }
 *          "14.530" → { first: 14.53, second: 0 }
 *
 * The first price is always the energy price (10-20 c€/kWh range).
 * The second is the injection price (0-5 c€/kWh range).
 */
function splitConcatenatedPrices(raw: string): { first: number; second: number } | null {
  const s = raw.trim();

  // Pattern 1: two decimal numbers concatenated — energy(XX.X{1,2}) + injection(X.XX)
  // Use lazy match on first decimal to correctly split "15.61.28" → 15.6 + 1.28
  const m1 = s.match(/^(\d{1,2}\.\d{1,2}?)(\d\.\d{1,2})$/);
  if (m1) return { first: parseFloat(m1[1]), second: parseFloat(m1[2]) };

  // Pattern 2: energy + injection=0 (e.g., "14.530" for exclusif nuit)
  const m2 = s.match(/^(\d{1,2}\.\d{1,2})0$/);
  if (m2) return { first: parseFloat(m2[1]), second: 0 };

  // Pattern 3: single number (no injection suffix)
  const m3 = s.match(/^(\d{1,2}\.\d{1,4})$/);
  if (m3) return { first: parseFloat(m3[1]), second: 0 };

  return null;
}

/** Convert c€/kWh to €/kWh, rounded to 4 decimals */
function centsToEur(cents: number): number {
  return Math.round((cents / 100) * 10000) / 10000;
}

interface ExtractedPrices {
  mono: number | null;       // c€/kWh
  jour: number | null;       // c€/kWh
  nuit: number | null;       // c€/kWh
  fixedFeeYear: number | null; // €/year
}

function extractPrices(text: string): ExtractedPrices {
  const result: ExtractedPrices = { mono: null, jour: null, nuit: null, fixedFeeYear: null };

  // Mono-horaire: "Compteur mono-horaire15.61.28"
  const monoMatch = text.match(/Compteur\s*mono[- ]?horaire\s*([\d.]+)/i);
  if (monoMatch) {
    const split = splitConcatenatedPrices(monoMatch[1]);
    if (split) result.mono = split.first;
  }

  // Tarif jour: "Tarif jour16.631.28"
  const jourMatch = text.match(/Tarif\s+jour\s*([\d.]+)/i);
  if (jourMatch) {
    const split = splitConcatenatedPrices(jourMatch[1]);
    if (split) result.jour = split.first;
  }

  // Tarif nuit: "Tarif nuit14.531.28"
  const nuitMatch = text.match(/Tarif\s+nuit\s*([\d.]+)/i);
  if (nuitMatch) {
    const split = splitConcatenatedPrices(nuitMatch[1]);
    if (split) result.nuit = split.first;
  }

  // Redevance fixe: "Redevance fixe (€/an)111.30"
  const feeMatch = text.match(/Redevance\s+fixe\s*\(€\/an\)\s*([\d]+[.,]?\d*)/i);
  if (feeMatch) {
    result.fixedFeeYear = parseFloat(feeMatch[1].replace(",", "."));
  }

  return result;
}

/* ──────────────────────────────────────────────
   Sanity checks
   ────────────────────────────────────────────── */

function assertRange(value: number, min: number, max: number, label: string): void {
  if (value < min || value > max) {
    throw new Error(`${label}: ${value} outside expected range [${min}, ${max}]`);
  }
}

/* ──────────────────────────────────────────────
   Adapter
   ────────────────────────────────────────────── */

export const megaElecBeAdapter: PartnerAdapter<ElectricityRow> = {
  id: "mega-elec-be",
  label: "MEGA Electricity BE (PDF)",

  async fetch(ctx: AdapterContext): Promise<ElectricityRow[]> {
    const rows: ElectricityRow[] = [];

    for (const src of SOURCES) {
      try {
        ctx.log(`Fetching ${src.offer_name} ${src.region}: ${src.url}`);
        const buf = await ctx.fetchBuffer(src.url);
        const parsed = await pdf(buf);

        if (!parsed.text || parsed.text.length < 100) {
          ctx.warn(`MEGA ${src.offer_id}: PDF text too short (${parsed.text?.length ?? 0} chars)`);
          continue;
        }

        const prices = extractPrices(parsed.text);
        ctx.log(`  Extracted: mono=${prices.mono}, jour=${prices.jour}, nuit=${prices.nuit}, fee=${prices.fixedFeeYear}`);

        // Determine energy_price_day and energy_price_night based on meter_type
        let energyPriceDay: number | null;
        let energyPriceNight: number | null;

        if (src.meter_type === "BI") {
          // Bi-hourly: use jour/nuit prices
          energyPriceDay = prices.jour;
          energyPriceNight = prices.nuit;
        } else {
          // ALL: mono price as day, nuit as night (for bi-hourly fallback)
          energyPriceDay = prices.mono;
          energyPriceNight = prices.nuit;
        }

        if (energyPriceDay == null) {
          ctx.warn(`MEGA ${src.offer_id}: could not extract energy_price_day`);
          continue;
        }

        // Sanity checks (values are in c€/kWh)
        assertRange(energyPriceDay, 1, 100, `${src.offer_id} energy_price_day (c€/kWh)`);
        if (energyPriceNight != null) {
          assertRange(energyPriceNight, 1, 100, `${src.offer_id} energy_price_night (c€/kWh)`);
        }

        // Convert c€/kWh → €/kWh
        const dayEur = centsToEur(energyPriceDay);
        const nightEur = energyPriceNight != null ? centsToEur(energyPriceNight) : null;
        const feeYear = prices.fixedFeeYear ?? 0;

        // Sanity check in €/kWh
        assertRange(dayEur, 0.01, 1.0, `${src.offer_id} energy_price_day (€/kWh)`);
        if (nightEur != null) {
          assertRange(nightEur, 0.01, 1.0, `${src.offer_id} energy_price_night (€/kWh)`);
        }
        assertRange(feeYear, 0, 600, `${src.offer_id} supplier_fixed_fee_year`);

        rows.push({
          provider_id: "mega",
          provider_name: "MEGA",
          offer_id: src.offer_id,
          offer_name: `${src.offer_name} (${src.region})`,
          region: src.region,
          meter_type: src.meter_type,
          energy_price_day: dayEur,
          energy_price_night: nightEur,
          supplier_fixed_fee_year: feeYear,
          promo_bonus: null,
          contract_type: src.contract_type,
          valid_from: ctx.today,
          valid_to: null,
          source_url: src.url,
        });
      } catch (err) {
        ctx.warn(`MEGA ${src.offer_id}: extraction failed — ${err}`);
        // Continue to next source; don't pollute with garbage
      }
    }

    if (rows.length === 0) {
      ctx.warn("MEGA BE: 0 offers extracted from PDFs");
    } else {
      ctx.log(`MEGA BE: extracted ${rows.length} offers from ${SOURCES.length} PDFs`);
    }

    return rows;
  },
};
