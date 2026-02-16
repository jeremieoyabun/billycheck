// src/env.d.ts (ou env.d.ts à la racine, mais idéalement dans src si ton projet est en src/)

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DATABASE_URL: string;
      OPENAI_API_KEY: string;

      NEXT_PUBLIC_APP_URL: string;

      STRIPE_SECRET_KEY?: string;
      STRIPE_WEBHOOK_SECRET?: string;
      STRIPE_PUBLISHABLE_KEY?: string;
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?: string;

      BREVO_API_KEY?: string;
      BREVO_LIST_ID?: string;

      PGHOST?: string;
      PGHOST_UNPOOLED?: string;
      POSTGRES_HOST?: string;
      POSTGRES_PRISMA_URL?: string;
    }
  }
}

export {};
