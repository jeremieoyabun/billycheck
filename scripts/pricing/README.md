# Pricing sync pipeline

Keeps `/data/offers-*.json` up to date from a Google Sheet published as CSV.

## How it works

```
Google Sheet → Publish as CSV → env var URL → sync.ts → data/*.json → app
```

`sync.ts` downloads each CSV, validates every row with Zod, deduplicates on
`(provider_id, offer_id, region, meter_type, valid_from)`, sorts stably and
writes the JSON files consumed by `lib/offers/index.ts`.

## Expected CSV columns

### Electricity (`ELECTRICITY_BE_CSV_URL`, `ELECTRICITY_FR_CSV_URL`)

| Column | Type | Example |
|---|---|---|
| `provider_id` | string | `totalenergies` |
| `provider_name` | string | `TotalEnergies` |
| `offer_id` | string | `pixie_energie` |
| `offer_name` | string | `Pixie Energie` |
| `region` | `ALL \| WAL \| FLA \| BRU` | `ALL` |
| `meter_type` | `ALL \| MONO \| BI` | `ALL` |
| `energy_price_day` | number (€/kWh) | `0.265` |
| `energy_price_night` | number \| empty | `` |
| `supplier_fixed_fee_year` | number (€/year) | `66` |
| `promo_bonus` | number \| empty | `` |
| `contract_type` | `FIXED \| VARIABLE \| REGULATED` | `FIXED` |
| `valid_from` | `YYYY-MM-DD` \| empty | `2024-01-01` |
| `valid_to` | `YYYY-MM-DD` \| empty | `` |
| `source_url` | URL | `https://www.totalenergies.be` |

**Note:** `supplier_fixed_fee_year` is the annual fee in euros (not monthly).

### Telecom (`TELECOM_BE_CSV_URL`)

| Column | Type | Example |
|---|---|---|
| `provider_id` | string | `proximus` |
| `provider_name` | string | `Proximus` |
| `offer_id` | string | `flex_s` |
| `offer_name` | string | `Flex S` |
| `region` | `ALL \| WAL \| FLA` | `ALL` |
| `monthly_price_eur` | number | `44.99` |
| `plan_type` | `bundle \| internet \| mobile \| tv` | `bundle` |
| `download_speed_mbps` | number \| empty | `200` |
| `data_gb` | number \| empty | `` |
| `includes_tv` | `true \| false` | `true` |
| `includes_internet` | `true \| false` | `true` |
| `includes_mobile` | `true \| false` | `true` |
| `contract_type` | `FIXED \| VARIABLE` | `FIXED` |
| `valid_from` | `YYYY-MM-DD` \| empty | `` |
| `valid_to` | `YYYY-MM-DD` \| empty | `` |
| `source_url` | URL | `https://www.proximus.be` |

## Publishing a Google Sheet as CSV

1. Open the Google Sheet
2. **File → Share → Publish to web**
3. Select the tab containing offers → **Comma-separated values (.csv)**
4. Click **Publish** → copy the URL

The URL looks like:
```
https://docs.google.com/spreadsheets/d/SHEET_ID/export?format=csv&gid=TAB_GID
```

## Environment variables

Set these in `.env.local` (local dev) or in your hosting provider's env config:

```
ELECTRICITY_BE_CSV_URL=https://docs.google.com/spreadsheets/d/.../export?format=csv&gid=0
ELECTRICITY_FR_CSV_URL=https://docs.google.com/spreadsheets/d/.../export?format=csv&gid=1
TELECOM_BE_CSV_URL=https://docs.google.com/spreadsheets/d/.../export?format=csv&gid=2
```

If a URL is not set, that source is skipped (the existing JSON file is kept).

## Running

```bash
# Dry-run: validate rows, print what would be written — no file changes
npm run sync:pricing:check

# Write: validate + overwrite JSON files
npm run sync:pricing
```

## CI / automation

Add a GitHub Actions workflow to run `npm run sync:pricing` on a schedule:

```yaml
on:
  schedule:
    - cron: '0 6 * * 1'   # every Monday at 06:00 UTC
  workflow_dispatch:

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci
      - run: npm run sync:pricing
        env:
          ELECTRICITY_BE_CSV_URL: ${{ secrets.ELECTRICITY_BE_CSV_URL }}
          ELECTRICITY_FR_CSV_URL: ${{ secrets.ELECTRICITY_FR_CSV_URL }}
          TELECOM_BE_CSV_URL: ${{ secrets.TELECOM_BE_CSV_URL }}
      - uses: stefanzweifel/git-auto-commit-action@v5
        with:
          commit_message: 'chore: sync pricing data'
          file_pattern: 'data/offers-*.json'
```
