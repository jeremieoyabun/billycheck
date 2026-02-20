// scripts/pricing/adapters/mega-elec-be.ts
//
// Scrape MEGA Belgium electricity offers from monthly PDF price sheets.
// URL pattern: https://my.mega.be/resources/tarif/mega_{product}_electricity_{region}_fr_{YYYYMM}.pdf
//
// Products: Smart (VARIABLE), Zen (FIXED)
// Regions: WAL, FLA, BRU

import pdf from "pdf-parse";
import type { ElectricityRow } from "../schema";
import type { PartnerAdapter, AdapterContext } from "./_types";
import { parseEuroNum, assertElecPrice } from "./_types";

interface ProductDef {
  offerId: string;
  offerName: string;
  contractType: "FIXED" | "VARIABLE";
  urlPart: string;
}

const PRODUCTS: ProductDef[] = [
  { offerId: "smart", offerName: "MEGA Smart", contractType: "VARIABLE", urlPart: "smart" },
  { offerId: "zen", offerName: "MEGA Zen", contractType: "FIXED", urlPart: "zen" },
];

const REGIONS: { id: "WAL" | "FLA" | "BRU"; urlPart: string }[] = [
  { id: "WAL", urlPart: "wallonie" },
  { id: "FLA", urlPart: "flandre" },
  { id: "BRU", urlPart: "bruxelles" },
];

const BASE_URL = "https://my.mega.be/resources/tarif";

function buildUrls(product: ProductDef, region: { urlPart: string }, ctx: AdapterContext): string[] {
  // Try current month first, then previous month
  return [
    `${BASE_URL}/mega_${product.urlPart}_electricity_${region.urlPart}_fr_${ctx.currentMonth}.pdf`,
    `${BASE_URL}/mega_${product.urlPart}_electricity_${region.urlPart}_fr_${ctx.previousMonth}.pdf`,
    // Alternative patterns
    `${BASE_URL}/mega_${product.urlPart}_elec_${region.urlPart}_fr_${ctx.currentMonth}.pdf`,
    `${BASE_URL}/mega_${product.urlPart}_elec_${region.urlPart}_fr_${ctx.previousMonth}.pdf`,
  ];
}

/** Extract kWh price from MEGA PDF text */
function extractEnergyPrice(text: string): number | null {
  const patterns = [
    /prix\s+(?:de\s+l')?[ée]nergie[^€\d]*?([\d]+[.,][\d]{2,4})\s*€?\s*\/?\s*kWh/i,
    /composante\s+[ée]nergie[^€\d]*?([\d]+[.,][\d]{2,4})\s*€?\s*\/?\s*kWh/i,
    /(?:tarif|prix)\s+kWh[^€\d]*?([\d]+[.,][\d]{2,4})\s*€/i,
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

/** Extract annual fixed fee from MEGA PDF text */
function extractFixedFee(text: string): number | null {
  const yearPatterns = [
    /abonnement[^€\d]*?([\d]+[.,][\d]{2})\s*€?\s*\/?\s*an/i,
    /redevance[^€\d]*?([\d]+[.,][\d]{2})\s*€?\s*\/?\s*an/i,
    /cotisation[^€\d]*?([\d]+[.,][\d]{2})\s*€?\s*\/?\s*an/i,
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
    /redevance[^€\d]*?([\d]+[.,][\d]{2})\s*€?\s*\/?\s*mois/i,
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

export const megaElecBeAdapter: PartnerAdapter<ElectricityRow> = {
  id: "mega-elec-be",
  label: "MEGA Electricity BE (PDF)",

  async fetch(ctx: AdapterContext): Promise<ElectricityRow[]> {
    const rows: ElectricityRow[] = [];

    for (const product of PRODUCTS) {
      for (const region of REGIONS) {
        const urls = buildUrls(product, region, ctx);
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
          ctx.warn(`MEGA BE: no PDF found for ${product.offerId}/${region.id}`);
          continue;
        }

        const energyPrice = extractEnergyPrice(pdfText);
        const fixedFee = extractFixedFee(pdfText);

        if (energyPrice == null) {
          ctx.warn(`MEGA BE: could not extract energy price from ${usedUrl}`);
          continue;
        }

        try {
          assertElecPrice(energyPrice, `MEGA ${product.offerId} ${region.id}`);
        } catch (err) {
          ctx.warn(String(err));
          continue;
        }

        rows.push({
          provider_id: "mega",
          provider_name: "MEGA",
          offer_id: `${product.offerId}_${region.id.toLowerCase()}`,
          offer_name: `${product.offerName} (${region.id})`,
          region: region.id,
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
    }

    if (rows.length === 0) {
      ctx.warn("MEGA BE: 0 offers extracted from PDFs");
    } else {
      ctx.log(`MEGA BE: extracted ${rows.length} offers`);
    }

    return rows;
  },
};
