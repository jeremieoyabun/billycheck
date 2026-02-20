// scripts/pricing/adapters/bolt-elec-be.ts
//
// Scrape Bolt Energy Belgium electricity offers from monthly PDF price sheets.
// URL pattern: https://files.boltenergie.be/pricelists/{var,fix}/bolt_res_el_fr_YYYYMM.pdf
//
// Products: Variable, Fixed
// Region: ALL (Bolt doesn't differentiate by region)

import pdf from "pdf-parse";
import type { ElectricityRow } from "../schema";
import type { PartnerAdapter, AdapterContext } from "./_types";
import { parseEuroNum, assertElecPrice } from "./_types";

interface ProductDef {
  offerId: string;
  offerName: string;
  contractType: "FIXED" | "VARIABLE";
  urlDir: string;
}

const PRODUCTS: ProductDef[] = [
  { offerId: "variable", offerName: "Bolt Variable", contractType: "VARIABLE", urlDir: "var" },
  { offerId: "fixed", offerName: "Bolt Fixe", contractType: "FIXED", urlDir: "fix" },
];

const BASE_URL = "https://files.boltenergie.be/pricelists";

function buildUrls(product: ProductDef, ctx: AdapterContext): string[] {
  return [
    `${BASE_URL}/${product.urlDir}/bolt_res_el_fr_${ctx.currentMonth}.pdf`,
    `${BASE_URL}/${product.urlDir}/bolt_res_el_fr_${ctx.previousMonth}.pdf`,
    // Try NL variant too
    `${BASE_URL}/${product.urlDir}/bolt_res_el_nl_${ctx.currentMonth}.pdf`,
    `${BASE_URL}/${product.urlDir}/bolt_res_el_nl_${ctx.previousMonth}.pdf`,
  ];
}

/** Extract kWh price from Bolt PDF text */
function extractEnergyPrice(text: string): number | null {
  const patterns = [
    /prix\s+(?:de\s+l')?[ée]nergie[^€\d]*?([\d]+[.,][\d]{2,4})\s*€?\s*\/?\s*kWh/i,
    /energy?\s*pri[jx]s?[^€\d]*?([\d]+[.,][\d]{2,4})\s*€?\s*\/?\s*kWh/i,
    /composante\s+[ée]nergie[^€\d]*?([\d]+[.,][\d]{2,4})/i,
    /(0[.,]\d{2,4})\s*€?\s*\/?\s*kWh/i,
  ];

  for (const p of patterns) {
    const m = text.match(p);
    if (m) {
      const price = parseEuroNum(m[1]);
      if (price != null && price > 0.01 && price < 1.0) return price;
    }
  }
  return null;
}

/** Extract annual fixed fee from Bolt PDF text */
function extractFixedFee(text: string): number | null {
  const yearPatterns = [
    /abonnement[^€\d]*?([\d]+[.,][\d]{2})\s*€?\s*\/?\s*an/i,
    /redevance[^€\d]*?([\d]+[.,][\d]{2})\s*€?\s*\/?\s*an/i,
    /vaste\s+vergoeding[^€\d]*?([\d]+[.,][\d]{2})\s*€?\s*\/?\s*jaar/i,
  ];

  for (const p of yearPatterns) {
    const m = text.match(p);
    if (m) {
      const fee = parseEuroNum(m[1]);
      if (fee != null && fee >= 0 && fee < 500) return fee;
    }
  }

  const monthPatterns = [
    /abonnement[^€\d]*?([\d]+[.,][\d]{2})\s*€?\s*\/?\s*mois/i,
    /vaste\s+vergoeding[^€\d]*?([\d]+[.,][\d]{2})\s*€?\s*\/?\s*maand/i,
  ];

  for (const p of monthPatterns) {
    const m = text.match(p);
    if (m) {
      const fee = parseEuroNum(m[1]);
      if (fee != null && fee >= 0 && fee < 50) {
        return Math.round(fee * 12 * 100) / 100;
      }
    }
  }

  return null;
}

export const boltElecBeAdapter: PartnerAdapter<ElectricityRow> = {
  id: "bolt-elec-be",
  label: "Bolt Energy BE (PDF)",

  async fetch(ctx: AdapterContext): Promise<ElectricityRow[]> {
    const rows: ElectricityRow[] = [];

    for (const product of PRODUCTS) {
      const urls = buildUrls(product, ctx);
      let pdfText: string | null = null;
      let usedUrl = urls[0];

      for (const url of urls) {
        try {
          ctx.log(`Trying PDF: ${url}`);
          const buf = await ctx.fetchBuffer(url);
          const parsed = await pdf(buf);
          if (parsed.text && parsed.text.length > 100) {
            pdfText = parsed.text;
            usedUrl = url;
            break;
          }
        } catch {
          // Try next URL
        }
      }

      if (!pdfText) {
        ctx.warn(`Bolt BE: no PDF found for ${product.offerId}`);
        continue;
      }

      const energyPrice = extractEnergyPrice(pdfText);
      const fixedFee = extractFixedFee(pdfText);

      if (energyPrice == null) {
        ctx.warn(`Bolt BE: could not extract energy price from ${usedUrl}`);
        continue;
      }

      try {
        assertElecPrice(energyPrice, `Bolt ${product.offerId}`);
      } catch (err) {
        ctx.warn(String(err));
        continue;
      }

      rows.push({
        provider_id: "bolt",
        provider_name: "Bolt Energy",
        offer_id: product.offerId,
        offer_name: product.offerName,
        region: "ALL",
        meter_type: "ALL",
        energy_price_day: energyPrice,
        energy_price_night: null,
        supplier_fixed_fee_year: fixedFee ?? 0,
        promo_bonus: null,
        contract_type: product.contractType,
        valid_from: ctx.today,
        valid_to: null,
        source_url: usedUrl,
      });
    }

    if (rows.length === 0) {
      ctx.warn("Bolt BE: 0 offers extracted from PDFs");
    } else {
      ctx.log(`Bolt BE: extracted ${rows.length} offers`);
    }

    return rows;
  },
};
