// scripts/pricing/adapters/octa-elec-be.ts
//
// Octa+ Belgium electricity adapter — hardcoded verified PDF sources.
// Prices in PDFs are in c€/kWh (centimes). We convert to €/kWh.
//
// Octa+ PDFs use comma-decimal format (Belgian): "15,05" = 15.05 c€/kWh.
//
// The PDF table structure is destroyed by pdf-parse — columns get interleaved
// and numbers appear without clear row labels. We use multiple regex patterns
// per product type to reliably extract the mono consumption price.
//
// Products included: Eco Fixed, Fixed, Smart Variable, Flux, Eco Flux
// Products excluded: Dynamic & Eco Dynamic (require SMR3 smart meter,
//   hourly pricing that doesn't fit our fixed/variable schema)

import pdf from "pdf-parse";
import type { ElectricityRow } from "../schema";
import type { PartnerAdapter, AdapterContext } from "./_types";

/* ──────────────────────────────────────────────
   Hardcoded verified sources (February 2026)
   ────────────────────────────────────────────── */

interface OctaSource {
  offer_id: string;
  offer_name: string;
  contract_type: "FIXED" | "VARIABLE";
  url: string;
}

const SOURCES: OctaSource[] = [
  // Eco Fixed (100% green, 1yr guaranteed fixed price)
  {
    offer_id: "octa_ecofixed_wl",
    offer_name: "Eco Fixed",
    contract_type: "FIXED",
    url: "https://files.octaplus.be/tariffs/E_OCTA_ECOFIXED_RE_WL_FR.pdf",
  },
  // Fixed (1yr guaranteed fixed price)
  {
    offer_id: "octa_fixed_wl",
    offer_name: "Fixed",
    contract_type: "FIXED",
    url: "https://files.octaplus.be/tariffs/E_OCTA_FIXED_RE_WL_FR.pdf",
  },
  // Smart Variable (monthly indexed)
  {
    offer_id: "octa_smartvariable_wl",
    offer_name: "Smart Variable",
    contract_type: "VARIABLE",
    url: "https://files.octaplus.be/tariffs/E_OCTA_SMARTVARIABLE_RE_WL_FR.pdf",
  },
  // Flux (monthly indexed)
  {
    offer_id: "octa_flux_wl",
    offer_name: "Flux",
    contract_type: "VARIABLE",
    url: "https://files.octaplus.be/tariffs/E_OCTA_FLUX_RE_WL_FR.pdf",
  },
  // Eco Flux (100% green, monthly indexed)
  {
    offer_id: "octa_ecoflux_wl",
    offer_name: "Eco Flux",
    contract_type: "VARIABLE",
    url: "https://files.octaplus.be/tariffs/E_OCTA_ECOFLUX_RE_WL_FR.pdf",
  },
];

/* ──────────────────────────────────────────────
   PDF text extraction helpers
   ────────────────────────────────────────────── */

/** Parse Belgian comma-decimal format: "15,05" → 15.05 */
function parseCommaNum(s: string): number {
  return parseFloat(s.replace(",", "."));
}

/** Convert c€/kWh to €/kWh, rounded to 4 decimals */
function centsToEur(cents: number): number {
  return Math.round((cents / 100) * 10000) / 10000;
}

function assertRange(value: number, min: number, max: number, label: string): void {
  if (value < min || value > max) {
    throw new Error(`${label}: ${value} outside expected range [${min}, ${max}]`);
  }
}

interface ExtractedOctaPrices {
  mono: number | null;   // c€/kWh
  fee: number | null;    // €/year
  promo: number | null;  // € (negative)
}

/**
 * Extract energy section text (before network tariffs table).
 * This avoids matching numbers in the network/tax sections.
 */
function getEnergySection(text: string): string {
  const endIdx = text.indexOf("Les tarifs des réseaux");
  return endIdx > 0 ? text.substring(0, endIdx) : text;
}

/**
 * Extract the annual fixed fee (redevance fixe).
 * Octa+ fees are typically 65€ or 130€/year.
 *
 * The fee appears near "Redevance fixe (€/an)" but pdf-parse sometimes
 * places it after "Gratuit" (the injection cost label) instead.
 */
function extractFee(text: string): number | null {
  // Pattern 1: "Redevance fixe (€/an)\n130,00" (with small gap)
  const m1 = text.match(/Redevance\s+fixe\s*\(€\/an\)[\s\S]{0,30}?(\d{2,3})[,.]00/i);
  if (m1) return parseInt(m1[1]);

  // Pattern 2: "Gratuit\n65,00" or "Gratuit65,00"
  const m2 = text.match(/Gratuit\s*\n?\s*(\d{2,3})[,.]00/);
  if (m2) return parseInt(m2[1]);

  // Pattern 3: "130,00Gratuit" (concatenated)
  const m3 = text.match(/(\d{2,3})[,.]00\s*Gratuit/);
  if (m3) return parseInt(m3[1]);

  return null;
}

/**
 * Extract promotional discount (e.g., "réduction (*) de 60 € TVA incluse").
 * Returns a negative number or null.
 */
function extractPromo(text: string): number | null {
  const m = text.match(/réduction\s*\(\*\)\s*de\s+(\d+)\s*€/i);
  return m ? -parseInt(m[1]) : null;
}

/**
 * Extract mono consumption price for FIXED products.
 * Fixed prices appear near the "Fixe" keyword in the tariff table.
 *
 * Eco Fixed layout: "Fixe\n15,05\n17,26\nVariable"
 * Fixed layout:     "12,62\nTarifs\nFixe\nVariable"
 */
function extractFixedMono(text: string): number | null {
  // Pattern A: price right after "Fixe" label (Eco Fixed)
  const mA = text.match(/Fixe\s*\n(\d{1,2}[,.]\d{2,4})/);
  if (mA) {
    const v = parseCommaNum(mA[1]);
    if (v >= 8 && v <= 25) return v;
  }

  // Pattern B: price right before "Tarifs\nFixe" (Fixed)
  const mB = text.match(/(\d{1,2}[,.]\d{2,4})\s*\nTarifs\s*\nFixe/);
  if (mB) {
    const v = parseCommaNum(mB[1]);
    if (v >= 8 && v <= 25) return v;
  }

  // Pattern C: price after "1 an garanti"
  const mC = text.match(/1 an garanti\s*\n(\d{1,2}[,.]\d{2,4})/);
  if (mC) {
    const v = parseCommaNum(mC[1]);
    if (v >= 8 && v <= 25) return v;
  }

  return null;
}

/**
 * Extract mono consumption price for VARIABLE products (estimated prices).
 * Variable pricing uses "Prix estimés" (12-month forward estimate from VREG).
 *
 * Smart Variable: "Compteur monohoraire\n-\n12,22"
 * Eco Flux:       "Prix estimés\n13,75\n15,88\n..."
 * Flux:           "10,62\n12,75\n...\nPrix estimés"
 */
function extractVariableMono(text: string): number | null {
  // Pattern A: "Compteur monohoraire\n-\n12,22" (Smart Variable)
  const mA = text.match(/Compteur\s+monohoraire\s*\n-\s*\n(\d{1,2}[,.]\d{2,4})/i);
  if (mA) {
    const v = parseCommaNum(mA[1]);
    if (v >= 7.5 && v <= 25) return v;
  }

  // Pattern B: prices after last "Prix estimés" (Eco Flux)
  // Split by "Prix estimés" and check each segment after the label
  const parts = text.split(/Prix\s+estimés/i);
  if (parts.length > 1) {
    for (let i = parts.length - 1; i >= 1; i--) {
      const mB = parts[i].match(/^\s*\n(\d{1,2}[,.]\d{2,4})/);
      if (mB) {
        const v = parseCommaNum(mB[1]);
        if (v >= 7.5 && v <= 25) return v;
      }
    }
  }

  // Pattern C: contiguous number block before "Prix estimés" (Flux)
  // pdf-parse sometimes puts numbers BEFORE the column header.
  // Use lastIndexOf to skip descriptive mentions of "Prix estimés" in intro text.
  const prixIdx = text.lastIndexOf("Prix estimés");
  if (prixIdx > 0) {
    const before = text.substring(Math.max(0, prixIdx - 800), prixIdx);
    const lines = before.split("\n");

    // Build contiguous blocks of energy-range numbers (standalone on a line)
    const blocks: number[][] = [];
    let current: number[] = [];

    for (const line of lines) {
      const m = line.trim().match(/^(\d{1,2}[,.]\d{2,4})$/);
      if (m) {
        const n = parseCommaNum(m[1]);
        if (n >= 7.5 && n <= 25) {
          current.push(n);
          continue;
        }
      }
      if (current.length > 0) {
        blocks.push(current);
        current = [];
      }
    }
    if (current.length > 0) blocks.push(current);

    // Take the last block with ≥3 numbers (the estimated prices block)
    // First number in the block = mono
    for (let i = blocks.length - 1; i >= 0; i--) {
      if (blocks[i].length >= 3) {
        return blocks[i][0];
      }
    }
  }

  return null;
}

function extractPrices(text: string, contractType: "FIXED" | "VARIABLE"): ExtractedOctaPrices {
  const energy = getEnergySection(text);

  return {
    mono: contractType === "FIXED" ? extractFixedMono(energy) : extractVariableMono(energy),
    fee: extractFee(energy),
    promo: extractPromo(energy),
  };
}

/* ──────────────────────────────────────────────
   Adapter
   ────────────────────────────────────────────── */

export const octaElecBeAdapter: PartnerAdapter<ElectricityRow> = {
  id: "octa-elec-be",
  label: "Octa+ Electricity BE (PDF)",

  async fetch(ctx: AdapterContext): Promise<ElectricityRow[]> {
    const rows: ElectricityRow[] = [];

    for (const src of SOURCES) {
      try {
        ctx.log(`Fetching ${src.offer_name}: ${src.url}`);
        const buf = await ctx.fetchBuffer(src.url);
        const parsed = await pdf(buf);

        if (!parsed.text || parsed.text.length < 100) {
          ctx.warn(`OCTA+ ${src.offer_id}: PDF text too short (${parsed.text?.length ?? 0} chars)`);
          continue;
        }

        const prices = extractPrices(parsed.text, src.contract_type);
        ctx.log(`  Extracted: mono=${prices.mono}, fee=${prices.fee}, promo=${prices.promo}`);

        if (prices.mono == null) {
          ctx.warn(`OCTA+ ${src.offer_id}: could not extract mono price`);
          continue;
        }
        if (prices.fee == null) {
          ctx.warn(`OCTA+ ${src.offer_id}: could not extract fee`);
          continue;
        }

        // Sanity checks (values in c€/kWh for mono, €/year for fee)
        assertRange(prices.mono, 5, 30, `${src.offer_id} mono (c€/kWh)`);
        assertRange(prices.fee, 10, 300, `${src.offer_id} fee (€/year)`);

        // Convert c€/kWh → €/kWh
        const dayEur = centsToEur(prices.mono);
        assertRange(dayEur, 0.01, 1.0, `${src.offer_id} energy_price_day (€/kWh)`);

        rows.push({
          provider_id: "octa_plus",
          provider_name: "Octa+",
          offer_id: src.offer_id,
          offer_name: `${src.offer_name} (WAL)`,
          region: "WAL",
          meter_type: "ALL",
          energy_price_day: dayEur,
          energy_price_night: null,
          supplier_fixed_fee_year: prices.fee,
          promo_bonus: prices.promo,
          contract_type: src.contract_type,
          valid_from: ctx.today,
          valid_to: null,
          source_url: src.url,
        });
      } catch (err) {
        ctx.warn(`OCTA+ ${src.offer_id}: extraction failed — ${err}`);
      }
    }

    if (rows.length === 0) {
      ctx.warn("OCTA+ BE: 0 offers extracted from PDFs");
    } else {
      ctx.log(`OCTA+ BE: extracted ${rows.length} offers from ${SOURCES.length} PDFs`);
    }

    return rows;
  },
};
