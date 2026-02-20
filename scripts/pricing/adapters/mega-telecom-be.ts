// scripts/pricing/adapters/mega-telecom-be.ts
//
// Scrape MEGA Belgium telecom mobile plans from JSON-LD structured data.
// URL: https://www.mega.be/fr/telecom/abonnements

import * as cheerio from "cheerio";
import type { TelecomRow } from "../schema";
import type { PartnerAdapter, AdapterContext } from "./_types";
import { slugify, parseEuroNum, parseDataGb } from "./_types";

const URL = "https://www.mega.be/fr/telecom/abonnements";

interface JsonLdOffer {
  "@type"?: string;
  name?: string;
  price?: string | number;
  priceCurrency?: string;
  priceValidUntil?: string;
  description?: string;
}

export const megaTelecomBeAdapter: PartnerAdapter<TelecomRow> = {
  id: "mega-telecom-be",
  label: "MEGA Telecom BE (JSON-LD)",

  async fetch(ctx: AdapterContext): Promise<TelecomRow[]> {
    ctx.log(`Fetching ${URL}`);
    const html = await ctx.fetchText(URL);
    const $ = cheerio.load(html);

    const rows: TelecomRow[] = [];

    // Parse all JSON-LD blocks
    $('script[type="application/ld+json"]').each((_, el) => {
      try {
        const data = JSON.parse($(el).html() ?? "");
        const offers: JsonLdOffer[] = [];

        if (Array.isArray(data)) {
          offers.push(...data.filter((d: JsonLdOffer) => d["@type"] === "Offer" || d["@type"] === "Product"));
        } else if (data["@type"] === "Offer" || data["@type"] === "Product") {
          offers.push(data);
        } else if (data.offers) {
          const o = Array.isArray(data.offers) ? data.offers : [data.offers];
          offers.push(...o);
        }

        for (const offer of offers) {
          const name = offer.name ?? offer.description ?? "";
          if (!name) continue;

          const price = typeof offer.price === "number"
            ? offer.price
            : parseEuroNum(String(offer.price ?? ""));
          if (price == null || price <= 0) continue;

          const dataGb = parseDataGb(name);
          const offerId = slugify(name) || `mega_mobile_${price}`;

          rows.push({
            provider_id: "mega",
            provider_name: "MEGA",
            offer_id: offerId,
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
            valid_to: offer.priceValidUntil ?? null,
            source_url: URL,
          });
        }
      } catch {
        // Skip malformed JSON-LD blocks
      }
    });

    // Fallback: parse price cards from HTML if no JSON-LD found
    if (rows.length === 0) {
      ctx.warn("No JSON-LD offers found, trying HTML fallback");

      // Look for plan cards with prices
      $("[class*='plan'], [class*='offer'], [class*='tarif'], [class*='price']").each((_, el) => {
        const text = $(el).text();
        const priceMatch = text.match(/([\d]+[.,][\d]{2})\s*€/);
        if (!priceMatch) return;

        const price = parseEuroNum(priceMatch[1]);
        if (price == null || price <= 0 || price > 100) return;

        const nameEl = $(el).find("h2, h3, h4, [class*='title'], [class*='name']").first();
        const name = nameEl.text().trim() || `MEGA Mobile ${price}€`;
        const dataGb = parseDataGb(text);

        rows.push({
          provider_id: "mega",
          provider_name: "MEGA",
          offer_id: slugify(name) || `mega_mobile_${price}`,
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

    if (rows.length === 0) {
      ctx.warn("MEGA Telecom: 0 offers found — page structure may have changed");
    } else {
      ctx.log(`MEGA Telecom: found ${rows.length} offers`);
    }

    return rows;
  },
};
