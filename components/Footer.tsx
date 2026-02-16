"use client";

import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-slate-200/60 bg-background">
      <div className="mx-auto max-w-6xl px-4 sm:px-5 py-8 text-center">

        {/* Ligne 1 — Liens */}
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-slate-600">
          <Link href="/qui-sommes-nous" className="hover:text-slate-900 transition">
            Qui sommes-nous
          </Link>
          <Link href="/politique-de-confidentialite" className="hover:text-slate-900 transition">
            Politique de confidentialité
          </Link>
          <Link href="/cgu" className="hover:text-slate-900 transition">
            CGU
          </Link>
          <Link href="/mentions-legales" className="hover:text-slate-900 transition">
            Mentions légales
          </Link>
          <a href="mailto:contact@billycheck.com" className="hover:text-slate-900 transition">
            contact@billycheck.com
          </a>
        </div>

        {/* Ligne 2 — Texte légal */}
        <div className="mt-4 text-xs text-slate-400">
          BillyCheck © {new Date().getFullYear()} — Billy ne fournit pas de conseil financier ou juridique.
        </div>

      </div>
    </footer>
  );
}
