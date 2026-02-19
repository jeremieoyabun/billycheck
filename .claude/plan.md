# BillyCheck Multi-Vertical Plan — Final

## Scope
Full telecom pipeline + manual electricity entry + vertical selector + copy sweep + SEO.

## Files to CREATE (8)
1. `lib/verticals.ts` — Vertical type + per-vertical copy strings
2. `components/VerticalTabs.tsx` — accessible segmented control
3. `components/ManualElectricityForm.tsx` — 3-field form with validation
4. `components/HeroModule.tsx` — "use client" island: tabs + scan CTA + manual form
5. `app/api/manual-estimate/route.ts` — builds ResultJson from manual input, stores as scan
6. `lib/analyze-telecom.ts` — GPT prompt + ExtractedTelecomBill type + parseGPTTelecomResponse
7. `data/offers-telecom.json` — Belgian telecom offers (Proximus, Orange, VOO, Scarlet, Telenet...)
8. `components/TelecomResultCards.tsx` — result display for telecom + cross-sell electricity block

## Files to MODIFY (10)
9. `app/page.tsx` — replace hero with <HeroModule />, update how-it-works copy, trust section, "3000 data points" claim
10. `app/scan/ScanClient.tsx` — add vertical tabs, pass vertical in FormData, update chat bubble copy
11. `app/api/scans/[id]/process/route.ts` — read vertical from FormData, route to correct analyzer, embed vertical in resultJson
12. `components/ResultCards.tsx` — check `data.vertical`, render TelecomResultCards for telecom; add cross-sell block; update label "Abonnement annuel HT" -> "Prix fixe mensuel"
13. `components/ScanStatus.tsx` — remove electricity-specific wording from FAILED message
14. `components/FAQ.tsx` — add 2 telecom Q&As (stays on home)
15. `app/faq/page.tsx` — add Telecom FAQ category
16. `app/layout.tsx` — update SEO metadata (Telecom + Electricite, Belgique, FR-BE)
17. `app/qui-sommes-nous/page.tsx` — update description (mention Telecom)
18. `app/cgu/page.tsx` — update "facture d'energie" -> "facture (electricite ou telecom)"

## Architecture

### Manual entry flow
```
HeroModule (client) → POST /api/manual-estimate → creates Scan(status:DONE, resultJson)
→ returns scanId → router.push(`/result/${scanId}`) → same ResultCards render
```
Zero code duplication. Uses same compareOffers() from analyze-bill.ts.

### Telecom scan flow
```
ScanClient sends FormData with vertical:"telecom"
→ process route reads vertical, calls analyzeTelecomBill()
→ resultJson.vertical = "telecom", resultJson.telecom = ExtractedTelecomBill
→ ResultCards checks data.vertical → renders TelecomResultCards
→ Cross-sell block at bottom: "Verifiez aussi votre electricite"
```

### Cross-sell
- After electricity result: compact banner "Verifiez aussi votre forfait telecom - Jusqu'a 30% d'economies potentielles" with top-2 telecom offers (static, no personalization needed)
- After telecom result: same logic reversed with top-2 electricity offers

## Vertical type
```typescript
export type Vertical = "electricity" | "telecom"
```

## HeroModule (client island)
- Static H1: "Telecom & Electricite" (SEO anchor, always visible)
- Dynamic subtitle per vertical:
  - electricity: "Envoie ta facture d'electricite ou saisis tes données pour estimer tes economies."
  - telecom: "Envoie ta facture telecom pour reperer une offre plus avantageuse."
- VerticalTabs above the CTA
- Electricity: scan button + "Ou rentrez directement vos données" + ManualElectricityForm
- Telecom: scan button + hint "Pour les Telecom, le scan est recommandé."

## ManualElectricityForm validation
- 3 fields: fixedMonthly (€/mois), priceKwh (€/kWh), consumptionKwh (kWh/an)
- Normalize comma->dot
- Bounds: fixedMonthly 0-500, priceKwh 0-5, consumptionKwh 1-50000
- All required, reject negative, reject non-numeric
- inputMode="decimal" for price fields, inputMode="numeric" for consumption
- Inline errors in FR

## Telecom extraction fields
```json
{
  "provider": "Proximus",
  "plan_name": "Flex L",
  "plan_type": "bundle|internet|mobile|tv",
  "monthly_price_ttc_eur": 79.99,
  "download_speed_mbps": 500,
  "mobile_data_gb": null,
  "includes_tv": true,
  "includes_internet": true,
  "includes_mobile": false,
  "billing_period_start": "2025-12-01",
  "billing_period_end": "2025-12-31",
  "country": "BE",
  "confidence": "ok|partial|insufficient"
}
```

## Telecom offers (offers-telecom.json)
Belgian market - ~8 entries covering internet/bundle plans:
- Proximus Flex M/L, Telenet Wigo M/L, VOO Happy Trio, Orange Together M/L, Scarlet Internet
Each: { provider, plan, monthly_price_eur, plan_type, download_speed_mbps, includes_tv, includes_mobile, url, country: "BE" }

## Telecom comparison logic (compareOffersForTelecom)
- Filter by: plan_type match OR plan_type compatible (bundle covers all)
- Filter out current provider
- Sort by monthly_price ascending (cheapest first)
- Compute estimated_savings = currentMonthlyPrice - offer.monthly_price_eur (annualized * 12)
- Show top 3

## Copy changes
- "2 scans gratuits" -> "2 analyses offertes"
- "Facture supprimee immediatement" -> "Facture supprimee des que possible apres traitement" (truthful, matches privacy policy)
- No em dashes anywhere
- "Billy analyse plus de 3 000 points de données en temps reel" added in how-it-works step 2
- SEO title: "BillyCheck - Telecom et Electricite : payez-vous trop cher ?"
- SEO desc: "Analysez votre facture de telephonie ou d'electricite en 30 secondes. Billy compare les meilleures offres disponibles en Belgique francophone."
- ScanStatus FAILED: remove "facture d'electricite", say "document" instead
