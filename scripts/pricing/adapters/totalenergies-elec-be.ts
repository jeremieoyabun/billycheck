// scripts/pricing/adapters/totalenergies-elec-be.ts
//
// Scrape TotalEnergies Belgium electricity offers from PDF price lists.
// Stable URLs using /latest/ pattern: 3 products × 3 regions = 9 PDFs.
//
// Products:
//   - MyEssential (VARIABLE)
//   - MyComfort Fixed (FIXED)
//   - MyDynamic (VARIABLE)
//
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
  {
    offerId: "myessential",
    offerName: "MyEssential",
    contractType: "VARIABLE",
    urlPart: "myessential",
  },
  {
    offerId: "mycomfort_fixed",
    offerName: "MyComfort Fixed",
    contractType: "FIXED",
    urlPart: "mycomfort-fixed",
  },
  {
    offerId: "mydynamic",
    offerName: "MyDynamic",
    contractType: "VARIABLE",
    urlPart: "mydynamic",
  },
];

const REGIONS: { id: "WAL" | "FLA" | "BRU"; urlPart: string }[] = [
  { id: "WAL", urlPart: "wallonie" },
  { id: "FLA", urlPart: "flandre" },
  { id: "BRU", urlPart: "bruxelles" },
];

// TotalEnergies BE uses stable /latest/ URLs for current price sheets
const BASE_URL = "https://www.totalenergies.be/sites/default/files/atoms/files";

function buildUrl(product: ProductDef, region: { urlPart: string }): string {
  return `${BASE_URL}/${product.urlPart}-electricity-${region.urlPart}-latest.pdf`;
}

// Alternative URL patterns to try if /latest/ fails
function buildAltUrls(product: ProductDef, region: { urlPart: string }, ctx: AdapterContext): string[] {
  return [
    `${BASE_URL}/${product.urlPart}-elec-${region.urlPart}-latest.pdf`,
    `${BASE_URL}/te-${product.urlPart}-elec-${region.urlPart}-${ctx.currentMonth}.pdf`,
    `${BASE_URL}/te-${product.urlPart}-elec-${region.urlPart}-${ctx.previousMonth}.pdf`,
  ];
}

/** Extract kWh price from PDF text */
function extractEnergyPrice(text: string): number | null {
  // Patterns: "prix énergie ... 0,0829 €/kWh" or "energie prijs ... 0.0829 EUR/kWh"
  const patterns = [
    /prix\s+(?:de\s+l')?[ée]nergie[^€\d]*?([\d]+[.,][\d]{2,4})\s*€?\s*\/?\s*kWh/i,
    /energy?\s+pri[jx]s?[^€\d]*?([\d]+[.,][\d]{2,4})\s*€?\s*\/?\s*kWh/i,
    /kWh[^€\d]*?([\d]+[.,][\d]{2,4})\s*€/i,
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

/** Extract annual fixed fee from PDF text */
function extractFixedFee(text: string): number | null {
  // Patterns: "abonnement ... 48,00 €/an" or "redevance fixe ... 4,00 €/mois"
  const yearPatterns = [
    /abonnement[^€\d]*?([\d]+[.,][\d]{2})\s*€?\s*\/?\s*an/i,
    /redevance\s+fixe[^€\d]*?([\d]+[.,][\d]{2})\s*€?\s*\/?\s*an/i,
    /fixed?\s+fee[^€\d]*?([\d]+[.,][\d]{2})\s*€?\s*\/?\s*(?:year|an)/i,
    /vaste\s+vergoeding[^€\d]*?([\d]+[.,][\d]{2})\s*€?\s*\/?\s*jaar/i,
  ];

  for (const p of yearPatterns) {
    const m = text.match(p);
    if (m) {
      const fee = parseEuroNum(m[1]);
      if (fee != null && fee >= 0 && fee < 500) return fee;
    }
  }

  // Try monthly, then multiply by 12
  const monthPatterns = [
    /abonnement[^€\d]*?([\d]+[.,][\d]{2})\s*€?\s*\/?\s*mois/i,
    /redevance\s+fixe[^€\d]*?([\d]+[.,][\d]{2})\s*€?\s*\/?\s*mois/i,
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

export const totalenergiesElecBeAdapter: PartnerAdapter<ElectricityRow> = {
  id: "totalenergies-elec-be",
  label: "TotalEnergies Electricity BE (PDF)",

  async fetch(ctx: AdapterContext): Promise<ElectricityRow[]> {
    const rows: ElectricityRow[] = [];

    for (const product of PRODUCTS) {
      for (const region of REGIONS) {
        const primaryUrl = buildUrl(product, region);
        const altUrls = buildAltUrls(product, region, ctx);
        const allUrls = [primaryUrl, ...altUrls];

        let pdfText: string | null = null;
        let usedUrl = primaryUrl;

        for (const url of allUrls) {
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
          ctx.warn(`TotalEnergies BE: no PDF found for ${product.offerId}/${region.id}`);
          continue;
        }

        const energyPrice = extractEnergyPrice(pdfText);
        const fixedFee = extractFixedFee(pdfText);

        if (energyPrice == null) {
          ctx.warn(`TotalEnergies BE: could not extract energy price from ${usedUrl}`);
          continue;
        }

        try {
          assertElecPrice(energyPrice, `TE-BE ${product.offerId} ${region.id}`);
        } catch (err) {
          ctx.warn(String(err));
          continue;
        }

        rows.push({
          provider_id: "totalenergies",
          provider_name: "TotalEnergies",
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
      ctx.warn("TotalEnergies BE: 0 offers extracted from PDFs");
    } else {
      ctx.log(`TotalEnergies BE: extracted ${rows.length} offers`);
    }

    return rows;
  },
};
