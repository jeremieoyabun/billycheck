// scripts/pricing/adapters/totalenergies-elec-fr.ts
//
// Scrape TotalEnergies France electricity offers from their pricing page.
// Extracts kWh prices and subscription fees from HTML.

import * as cheerio from "cheerio";
import type { ElectricityRow } from "../schema";
import type { PartnerAdapter, AdapterContext } from "./_types";
import { parseEuroNum, assertElecPrice } from "./_types";

// TotalEnergies FR pricing pages
const URLS = [
  "https://www.totalenergies.fr/particuliers/electricite/offres-electricite",
  "https://www.totalenergies.fr/particuliers/electricite",
];

interface RawOffer {
  name: string;
  offerId: string;
  priceKwh: number;
  fixedFeeYear: number;
  contractType: "FIXED" | "VARIABLE" | "REGULATED";
  sourceUrl: string;
}

export const totalenergiesElecFrAdapter: PartnerAdapter<ElectricityRow> = {
  id: "totalenergies-elec-fr",
  label: "TotalEnergies Electricity FR (HTML)",

  async fetch(ctx: AdapterContext): Promise<ElectricityRow[]> {
    let html = "";
    let sourceUrl = URLS[0];

    for (const url of URLS) {
      try {
        ctx.log(`Fetching ${url}`);
        html = await ctx.fetchText(url);
        sourceUrl = url;
        if (html.length > 1000) break;
      } catch (err) {
        ctx.warn(`Failed to fetch ${url}:`, err);
      }
    }

    if (!html || html.length < 1000) {
      ctx.warn("TotalEnergies FR: could not fetch pricing page");
      return [];
    }

    const $ = cheerio.load(html);
    const offers: RawOffer[] = [];

    // Strategy 1: Look for offer cards/sections with structured price data
    $("[class*='offer'], [class*='tarif'], [class*='plan'], [class*='price-card']").each((_, el) => {
      const text = $(el).text();
      const titleEl = $(el).find("h2, h3, h4, [class*='title'], [class*='name']").first();
      const title = titleEl.text().trim();

      if (!title) return;

      // Extract kWh price: "0,2516 €/kWh" or "0.2516€/kWh"
      const kwhMatch = text.match(/(0[.,]\d{2,4})\s*€\s*\/?\s*kWh/i);
      // Extract subscription: "8,50 €/mois" or "102€/an"
      const subMonthMatch = text.match(/([\d]+[.,]\d{2})\s*€\s*\/?\s*mois/i);
      const subYearMatch = text.match(/([\d]+[.,]\d{2})\s*€\s*\/?\s*an/i);

      if (!kwhMatch) return;

      const priceKwh = parseEuroNum(kwhMatch[1]);
      if (priceKwh == null) return;

      let fixedFeeYear: number;
      if (subYearMatch) {
        fixedFeeYear = parseEuroNum(subYearMatch[1]) ?? 0;
      } else if (subMonthMatch) {
        fixedFeeYear = (parseEuroNum(subMonthMatch[1]) ?? 0) * 12;
      } else {
        fixedFeeYear = 0;
      }

      // Detect contract type from text
      let contractType: "FIXED" | "VARIABLE" | "REGULATED" = "VARIABLE";
      if (/fix[eé]/i.test(text)) contractType = "FIXED";
      if (/réglem|tarif\s+bleu/i.test(text)) contractType = "REGULATED";

      // Detect offer name → id
      let offerId = "standard";
      const lowerTitle = title.toLowerCase();
      if (/zen/i.test(lowerTitle)) offerId = "zen_fixe";
      if (/online/i.test(lowerTitle)) offerId = "online";
      if (/essentiel/i.test(lowerTitle)) offerId = "essentielle";
      if (/vert/i.test(lowerTitle)) offerId = "verte";

      offers.push({
        name: title,
        offerId,
        priceKwh,
        fixedFeeYear: Math.round(fixedFeeYear * 100) / 100,
        contractType,
        sourceUrl,
      });
    });

    // Strategy 2: Full-text regex scan if strategy 1 yielded nothing
    if (offers.length === 0) {
      ctx.warn("TotalEnergies FR: card selectors found nothing, trying text scan");

      const pageText = $.text();
      // Find blocks mentioning €/kWh
      const kwhMatches = [...pageText.matchAll(/(0[.,]\d{2,4})\s*€\s*\/?\s*kWh/gi)];

      for (const m of kwhMatches) {
        const priceKwh = parseEuroNum(m[1]);
        if (priceKwh == null) continue;

        // Get surrounding context (200 chars before)
        const idx = m.index ?? 0;
        const context = pageText.slice(Math.max(0, idx - 200), idx + 50);

        let name = "TotalEnergies Offre";
        if (/zen/i.test(context)) name = "Zen Fixe";
        else if (/online/i.test(context)) name = "Online";
        else if (/essentiel/i.test(context)) name = "Essentielle";
        else if (/vert/i.test(context)) name = "Verte";

        const offerId = name.toLowerCase().replace(/\s+/g, "_");
        if (offers.find((o) => o.offerId === offerId)) continue;

        offers.push({
          name,
          offerId,
          priceKwh,
          fixedFeeYear: 0,
          contractType: /fix/i.test(context) ? "FIXED" : "VARIABLE",
          sourceUrl,
        });
      }
    }

    // Convert to ElectricityRow
    const rows: ElectricityRow[] = [];
    for (const o of offers) {
      try {
        assertElecPrice(o.priceKwh, `TotalEnergies FR ${o.name}`);
      } catch (err) {
        ctx.warn(String(err));
        continue;
      }

      rows.push({
        provider_id: "totalenergies_fr",
        provider_name: "TotalEnergies",
        offer_id: o.offerId,
        offer_name: o.name,
        region: "ALL",
        meter_type: "ALL",
        energy_price_day: o.priceKwh,
        energy_price_night: null,
        supplier_fixed_fee_year: o.fixedFeeYear,
        promo_bonus: null,
        contract_type: o.contractType,
        valid_from: ctx.today,
        valid_to: null,
        source_url: o.sourceUrl,
      });
    }

    if (rows.length === 0) {
      ctx.warn("TotalEnergies FR: 0 offers found — page structure may have changed");
    } else {
      ctx.log(`TotalEnergies FR: found ${rows.length} offers`);
    }

    return rows;
  },
};
