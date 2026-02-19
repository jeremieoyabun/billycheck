# Belgium Electricity Pricing Model

> **Status document** — describes the full model, what is coded, what is stubbed, and what data is missing.
> Do not modify the formula sections without updating the corresponding code in `lib/pricing/be/`.

---

## 1. Formula: Annual TVAC breakdown

```
Total TVAC = (A + B + C) × (1 + TVA)
```

### Bloc A — Fourniture fournisseur (HTVA)

Seule partie dépendant du fournisseur choisi. Prix publié par le fournisseur, HTVA.

| Composante | Mono-horaire | Bi-horaire (HP/HC) |
|---|---|---|
| Énergie | `prix_jour × kWh_total` | `prix_jour × kWh_HP + prix_nuit × kWh_HC` |
| Redevance fixe annuelle | `fee_annuel` | `fee_annuel` |

```
A = énergie_fournisseur + redevance_fixe_annuelle
```

Inputs obligatoires :
- `energy_price_day` (€/kWh HTVA) — prix jour ou prix unique
- `energy_price_night` (€/kWh HTVA, null si mono) — prix nuit/HC
- `supplier_fixed_fee_year` (€/an HTVA)
- `annualKwhDay` — consommation HP ou totale (kWh)
- `annualKwhNight` — consommation HC (kWh, 0 si mono)
- `meterType` — `"mono"` | `"bi"`

---

### Bloc B — Réseau de distribution + transport (HTVA)

Deux acteurs distincts :

**GRD (Gestionnaire du Réseau de Distribution)** — réseau basse tension local.
Tarifs fixés par région (VREG pour la Flandre, CWaPE pour la Wallonie, Brugel pour Bruxelles).
Composantes :
- Terme variable : €/kWh (différent jour/nuit pour compteur bi-horaire)
- Terme fixe annuel : €/an (souvent lié à la puissance ou au type de raccordement)
- Surcharge prosumer : €/kVA/an (sur la puissance de l'onduleur, si panneaux solaires)

**Elia (TSO)** — réseau haute tension national. Tarifs CREG.
Composantes :
- Terme de transport : €/kWh (répercuté via GRD sur la facture résidentielle)
- En pratique sur la facture résidentielle BE : inclus dans le "tarif réseau" ou facturé séparément selon GRD

```
B = (GRD_var_kWh × totalKwh) + GRD_fixe_annuel + Elia_transport
  + prosumer_surcharge (si applicable)
```

GRDs actifs par région :
| Région | GRD principal | Source tarifs |
|---|---|---|
| Flandre | Fluvius | vreg.be |
| Wallonie | ORES Assets, REW, AIEG, AIESH, Gaselwest | cwape.be |
| Bruxelles | Sibelga | brugel.brussels |

---

### Bloc C — Taxes et prélèvements (HTVA)

Prélevés sur la facture, en sus du fournisseur et du réseau.

| Taxe | Scope | Base |
|---|---|---|
| Cotisation fédérale sur l'énergie | National | €/kWh |
| Contribution au Tarif Social (CTA) | National | % tarif transport |
| FSE (Fonds Sécurité Approvisionnement) | National | €/kWh |
| Contribution GRD régionale | Régional | €/kWh ou €/an |
| Redevance communale | Local (certaines communes) | €/an ou €/kWh |
| Cotisation Elia (répercutée) | National | inclus dans B en pratique |

```
C = (levies_per_kwh × totalKwh) + levies_fixed_annual
```

Source de référence : [CREG — Composantes du prix de l'électricité](https://www.creg.be)

---

### TVA

| Cas | Taux |
|---|---|
| Usage résidentiel (taux réduit, loi 2021) | **6 %** |
| Usage professionnel | 21 % |
| Surcharge prosumer (GRD Fluvius) | 21 % sur la surcharge uniquement |

```
TVA = Total_HTVA × vatRate
Total_TVAC = Total_HTVA + TVA
```

---

## 2. Inputs obligatoires et optionnels

### Obligatoires (sans eux le calcul est impossible)

| Input | Source dans l'app | Champ extrait |
|---|---|---|
| Consommation annuelle kWh (HP et HC) | GPT extraction | `consumption_kwh_annual`, `hp_consumption_kwh`, `hc_consumption_kwh` |
| Type de compteur | GPT extraction | `meter_type` |
| Prix énergie fournisseur (jour/nuit) | Offers JSON | `energy_price_day`, `energy_price_night` |
| Redevance fixe annuelle fournisseur | Offers JSON | `supplier_fixed_fee_year` |
| Région BE | EAN lookup ou code postal | `region` (`WAL`/`FLA`/`BRU`) |
| Taux TVA | Règle métier | 6 % résidentiel |

### Optionnels (affinent le calcul)

| Input | Usage |
|---|---|
| EAN-18 du point de livraison | Lookup GRD précis + région |
| GRD identifié | Tarifs réseau réels vs moyennes régionales |
| Puissance onduleur (kVA) | Calcul surcharge prosumer |
| Flag prosumer | Active le bloc surcharge |
| Période facture (dates) | Annualisation si facture partielle |

---

## 3. Datasets obligatoires et leur emplacement dans le repo

### ✅ Présents (partiels ou stubs)

| Dataset | Emplacement | État |
|---|---|---|
| Tarifs fournisseurs électricité BE | `data/offers-electricity-be.json` | ✅ 7 offres, schema v2, prix énergie + fee annuel |
| Tarifs fournisseurs électricité FR | `data/offers-electricity-fr.json` | ✅ 4 offres, schema v2 |
| Préfixes EAN → GRD | `lib/pricing/be/grd.ts` (inline) | ⚠️ PARTIEL — 12 préfixes seulement (voir §4) |
| Constantes réseau+taxes régionales | `lib/pricing/be/calc.ts` (inline) | ⚠️ STUB — moyennes indicatives CREG 2024, pas les vrais tarifs GRD |
| Taux TVA | `lib/pricing/be/calc.ts` (hardcodé) | ✅ 6 % résidentiel |

### ❌ Manquants (TODO)

| Dataset | Emplacement prévu | Source officielle |
|---|---|---|
| Tarifs GRD Fluvius (distribution, transport, prosumer) par année | `data/be/grd/fluvius.json` | [vreg.be](https://www.vreg.be/nl/tarieven) — fichiers Excel publiés annuellement |
| Tarifs GRD ORES par zone Wallonie par année | `data/be/grd/ores.json` | [ores.be](https://www.ores.be/tarifs) |
| Tarifs GRD Sibelga Bruxelles par année | `data/be/grd/sibelga.json` | [brugel.brussels](https://www.brugel.brussels/tarifs) |
| Tarifs GRD REW / AIEG / AIESH / Gaselwest | `data/be/grd/wal-others.json` | CWaPE décisions tarifaires |
| Tarifs transport Elia résidentiel par année | `data/be/elia-transport.json` | [elia.be](https://www.elia.be/fr/tarifs) |
| Détail taxes/prélèvements par région et année | `data/be/levies.json` | [CREG — Prix composantes](https://www.creg.be/fr/consommateurs/electricite/prix-de-lelectricite/composantes-du-prix) |
| Table EAN préfixes complète (>1000 ranges) | `data/be/ean-prefixes.json` ou `lib/pricing/be/grd.ts` | VREG open data / CREG |

---

## 4. État du code : codé vs stub vs non connecté

### `lib/pricing/be/grd.ts`

```
✅ CODÉ  : structure lookupGrdFromEAN(ean) → { grd, region } | null
✅ CODÉ  : validation format EAN-18 (54141…, 18 digits)
✅ CODÉ  : recherche par longueur de préfixe décroissante (9→7 digits)
⚠️ STUB  : table GRD_BY_EAN_PREFIX — seulement 12 préfixes
           Couverture réelle BE: ~200+ ranges
⚠️ STUB  : préfixes inventés/approximatifs (non validés vs datasets VREG)
❌ TODO  : charger depuis data/be/ean-prefixes.json (fichier inexistant)
❌ TODO  : GPT ne demande pas l'EAN — non extrait des factures actuellement
```

### `lib/pricing/be/calc.ts`

```
✅ CODÉ  : interface BelgiumCalcInput (tous les champs modélisés)
✅ CODÉ  : interface BelgiumCalcBreakdown (A, B, C, TVA, TVAC, assumptions[])
✅ CODÉ  : formule A — énergie fournisseur (mono et bi-horaire)
✅ CODÉ  : formule B+C — réseau+taxes (avec constantes régionales)
✅ CODÉ  : formule TVA 6 %
✅ CODÉ  : flag prosumer détecté dans assumptions[]
⚠️ STUB  : REGION_CONSTANTS — moyennes indicatives (WAL/FLA/BRU/DEFAULT)
           NE différencie PAS les GRDs au sein d'une région
           NE sépare PAS transport Elia de distribution GRD
           NE sépare PAS les taxes individuellement (FSE, CTA, fédérale…)
❌ TODO  : surcharge prosumer non calculée (flag seulement, valeur = 0)
❌ TODO  : TVA 21 % sur surcharge prosumer Fluvius non gérée
❌ TODO  : terme fixe GRD bi-horaire différent du mono non modélisé
```

### Intégration dans le pipeline principal

```
❌ NON CONNECTÉ : calcBelgiumAnnualTotalTVAC() n'est appelée nulle part
❌ NON CONNECTÉ : lookupGrdFromEAN() n'est appelée nulle part
❌ NON CONNECTÉ : compareOffers() (lib/analyze-bill.ts) utilise uniquement
                 le coût fournisseur (A), sans réseau ni taxes
❌ NON CONNECTÉ : l'EAN n'est pas extrait par le prompt GPT
⚠️ PARTIELLEMENT : result page affiche un bloc informatif "GRD non détecté"
                   quand country === "BE", mais sans données calculées
```

---

## 5. Précision actuelle vs modèle complet

| Composante | Précision actuelle | Modèle complet visé |
|---|---|---|
| A — Fournisseur | ✅ Exacte (prix offres réels) | ✅ Exacte |
| B — Réseau GRD | ⚠️ ±15-20 % (moyenne régionale) | Exacte par GRD et zone tarifaire |
| B — Transport Elia | ⚠️ Inclus dans moyenne B | Séparé, tarifs annuels CREG |
| C — Taxes | ⚠️ ±20 % (agrégat régional) | Détaillé par taxe et région |
| TVA | ✅ 6 % résidentiel | + 21 % sur prosumer surcharge |
| Prosumer surcharge | ❌ Non calculée | €/kVA/an selon GRD |
| Bi-horaire | ✅ Prix différenciés | + terme fixe réseau différencié |

**Erreur estimée sur le Total TVAC avec le modèle actuel (stubs) : ±5 à 15 %**
(variation principale : réseau+taxes ≈ 40–55 % de la facture totale)

---

## 6. Feuille de route pour atteindre la précision complète

1. **Court terme (données, ~1 semaine)**
   - Télécharger tarifs Fluvius 2024/2025 (VREG Excel) → `data/be/grd/fluvius.json`
   - Télécharger tarifs ORES 2024/2025 → `data/be/grd/ores.json`
   - Télécharger tarifs Sibelga 2024/2025 → `data/be/grd/sibelga.json`
   - Compiler taxes/prélèvements CREG 2024 → `data/be/levies.json`

2. **Court terme (code, ~2 jours)**
   - Mettre à jour `REGION_CONSTANTS` avec vraies valeurs par GRD (pas par région)
   - Ajouter extraction EAN dans le prompt GPT (`extract_bill.ts`)
   - Connecter `lookupGrdFromEAN` → `calcBelgiumAnnualTotalTVAC` dans `compareOffers`

3. **Moyen terme**
   - Implémenter surcharge prosumer par GRD (Fluvius : €/kVA/an)
   - Versionner les tarifs par année (structure `{ "2024": {...}, "2025": {...} }`)
   - Tarifs bi-horaire réseau différenciés jour/nuit

4. **Long terme**
   - Script `sync:grd` analogue à `sync:pricing` pour maintenir les tarifs GRD à jour
   - Gestion automatique de l'année tarifaire (facture de 2024 → tarifs 2024)
