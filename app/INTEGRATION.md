# BillyCheck — Fichiers à intégrer

## Arborescence (13 fichiers)

```
src/
├── app/
│   ├── globals.css                   REMPLACER   Tailwind + animations Billy
│   ├── layout.tsx                    REMPLACER   Fonts, meta, navbar avec logo
│   ├── page.tsx                      REMPLACER   Landing page avec Billy
│   ├── scan/
│   │   └── page.tsx                  NOUVEAU     Flow : upload → engagement → processing
│   ├── result/
│   │   └── [id]/
│   │       └── page.tsx              NOUVEAU     Affichage résultats + polling
│   └── api/
│       └── scans/
│           └── [id]/
│               └── route.ts          NOUVEAU     GET + DELETE un scan
├── components/
│   ├── Billy.tsx                     NOUVEAU     Composant image Billy
│   ├── ChatBubble.tsx                NOUVEAU     Bulle de dialogue animée
│   ├── UploadDropzone.tsx            NOUVEAU     Drag & drop + validation fichier
│   ├── ScanStatus.tsx                NOUVEAU     États processing + failed
│   ├── ResultCards.tsx               NOUVEAU     Cartes résultats + disclaimers
│   └── FAQ.tsx                       NOUVEAU     Accordéon FAQ
└── lib/
    └── prisma.ts                     VÉRIFIER    Singleton Prisma (tu l'as peut-être déjà)
```

## Assets requis dans public/

```
public/
├── billy/
│   ├── normal.png       ← Billy neutre
│   ├── searching.png    ← Billy avec loupe
│   ├── success.png      ← Billy content
│   └── error.png        ← Billy triste/erreur
├── brand/
│   └── logo.png         ← Logo BillyCheck (ton fichier Logo_Billy.png)
├── og-image.png         ← Image Open Graph 1200×630
└── favicon.ico
```

## Points d'attention

### 1. Import Prisma
Le fichier `lib/prisma.ts` importe depuis `@/generated/prisma`.
Si ton projet utilise `@prisma/client`, change la première ligne :
```ts
import { PrismaClient } from "@prisma/client";
```

### 2. Tes endpoints existants restent inchangés
- `GET  /api/scans`              ← pas touché
- `POST /api/scans`              ← pas touché
- `POST /api/scans/[id]/process` ← pas touché

J'ai seulement AJOUTÉ :
- `GET    /api/scans/[id]`  — récupère un scan par ID
- `DELETE /api/scans/[id]`  — supprime un scan (RGPD)

Assure-toi que le `[id]` dans tes routes process utilise aussi `await ctx.params` :
```ts
export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  // ...
}
```

### 3. Format attendu pour resultJson
Le composant ResultCards attend ce format :
```ts
{
  bill: {
    provider: string | null,
    plan_name: string | null,
    total_amount_eur: number | null,
    consumption_kwh: number | null,
    unit_price_eur_kwh: number | null,
    fixed_fees_eur: number | null,
    billing_period: string | null,
    postal_code: string | null,
    meter_type: string | null,
  },
  offers: [
    {
      provider: string,
      plan: string,
      estimated_savings: number,
      savings_percent: number,
      price_kwh: number,
      type: string,
      green: boolean,
      url: string,
    }
  ],
  engagement: "yes" | "no" | "unknown"
}
```
Adapte ton endpoint `/api/scans/[id]/process` pour stocker ce format dans `resultJson`.

### 4. Le flow /scan envoie le fichier en FormData
Le scan/page.tsx envoie le fichier réel via FormData à POST `/api/scans/[id]/process`.
Ton endpoint process doit le lire :
```ts
export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const form = await req.formData();
  const file = form.get("file") as File | null;
  const engagement = form.get("engagement") as string | null;
  // ... upload to R2, call GPT-4o, store result
}
```

### 5. Champ engagement dans le schéma Prisma
Ajoute le champ si tu ne l'as pas :
```prisma
model Scan {
  // ... tes champs existants
  engagement String?   // "yes" | "no" | "unknown"
}
```
Puis `npx prisma db push` ou `npx prisma migrate dev`.
