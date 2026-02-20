// scripts/pricing/adapters/orange-telecom-be.ts
//
// Scrape Orange Belgium mobile plans from their abonnements page.
// URL: https://www.orange.be/fr/abonnements-orange-mobile
// Note: robots.txt specifies 10s crawl-delay — handled by sources.ts crawlDelayMs.

import * as cheerio from "cheerio";
import type { TelecomRow } from "../schema";
import type { PartnerAdapter, AdapterContext } from "./_types";
import { slugify, parseEuroNum, parseDataGb } from "./_types";

const URL = "https://www.orange.be/fr/abonnements-orange-mobile";

export const orangeTelecomBeAdapter: PartnerAdapter<TelecomRow> = {
  id: "orange-telecom-be",
  label: "Orange Telecom BE (HTML)",

  async fetch(ctx: AdapterContext): Promise<TelecomRow[]> {
    ctx.log(`Fetching ${URL}`);
    const html = await ctx.fetchText(URL);
    const $ = cheerio.load(html);

    const rows: TelecomRow[] = [];

    // Orange uses product cards with price and plan name.
    // Try multiple possible selectors for their card structure.
    const cardSelectors = [
      "[class*='product-card']",
      "[class*='plan-card']",
      "[class*='offer-card']",
      "[class*='subscription']",
      ".card",
      "[data-plan]",
    ];

    let matchedSelector: string | null = null;
    for (const sel of cardSelectors) {
      if ($(sel).length >= 2) {
        matchedSelector = sel;
        break;
      }
    }

    if (matchedSelector) {
      $(matchedSelector).each((_, el) => {
        const cardText = $(el).text();
        const priceMatch = cardText.match(/([\d]+[.,]?\d*)\s*€/);
        if (!priceMatch) return;

        const price = parseEuroNum(priceMatch[1]);
        if (price == null || price <= 0 || price > 150) return;

        const nameEl = $(el).find("h2, h3, h4, [class*='title'], [class*='name']").first();
        const name = nameEl.text().trim() || `Orange Mobile ${price}€`;
        const dataGb = parseDataGb(cardText);

        rows.push({
          provider_id: "orange",
          provider_name: "Orange",
          offer_id: slugify(name) || `orange_mobile_${price}`,
          offer_name: name,
          region: "ALL",
          monthly_price_eur: price,
          plan_type: "mobile",
          download_speed_mbps: null,
          data_gb: dataGb,
          includes_tv: false,
          includes_internet: false,
          includes_mobile: true,
          promo_bonus: null,
          contract_type: "VARIABLE",
          valid_from: ctx.today,
          valid_to: null,
          source_url: URL,
        });
      });
    }

    // Broader fallback: scan the full page for price patterns
    if (rows.length === 0) {
      ctx.warn("Orange: card selectors found nothing, trying full-page scan");

      const allText = $.text();
      // Look for patterns like "Go Small 14€", "Go Medium 21€", "Go Large 39€"
      const planRegex = /(Go\s+\w+|Orange\s+\w+|Small|Medium|Large|Essential)\b[^€]*?([\d]+[.,]?\d*)\s*€/gi;
      let match;
      while ((match = planRegex.exec(allText)) !== null) {
        const name = match[1].trim();
        const price = parseEuroNum(match[2]);
        if (price == null || price <= 0 || price > 150) continue;

        const offerId = slugify(name) || `orange_mobile_${price}`;
        // Avoid duplicates
        if (rows.find((r) => r.offer_id === offerId)) continue;

        rows.push({
          provider_id: "orange",
          provider_name: "Orange",
          offer_id: offerId,
          offer_name: `Orange ${name}`,
          region: "ALL",
          monthly_price_eur: price,
          plan_type: "mobile",
          download_speed_mbps: null,
          data_gb: null,
          includes_tv: false,
          includes_internet: false,
          includes_mobile: true,
          promo_bonus: null,
          contract_type: "VARIABLE",
          valid_from: ctx.today,
          valid_to: null,
          source_url: URL,
        });
      }
    }

    if (rows.length === 0) {
      ctx.warn("Orange Telecom: 0 offers found — page structure may have changed");
    } else {
      ctx.log(`Orange Telecom: found ${rows.length} mobile offers`);
    }

    return rows;
  },
};
