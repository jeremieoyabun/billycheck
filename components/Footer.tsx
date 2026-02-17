"use client";

import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-slate-200/60 bg-background">
      <div className="mx-auto max-w-6xl px-4 sm:px-5 py-10 text-center">

        {/* Ligne 1 — Liens principaux */}
        <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 text-sm font-medium text-slate-700">
          <Link href="/qui-sommes-nous" className="hover:text-billy-blue transition">
            Qui sommes-nous
          </Link>
          <Link href="/faq" className="hover:text-billy-blue transition">
            FAQ
          </Link>
          <a href="mailto:contact@billycheck.com" className="hover:text-billy-blue transition">
            contact@billycheck.com
          </a>
        </div>

        {/* Séparateur */}
        <div className="my-4 mx-auto w-16 border-t border-slate-200" />

        {/* Ligne 2 — Liens légaux */}
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 text-xs text-slate-400">
          <Link href="/politique-de-confidentialite" className="hover:text-slate-600 transition">
            Politique de confidentialité
          </Link>
          <span className="hidden sm:inline">·</span>
          <Link href="/cgu" className="hover:text-slate-600 transition">
            CGU
          </Link>
          <span className="hidden sm:inline">·</span>
          <Link href="/mentions-legales" className="hover:text-slate-600 transition">
            Mentions légales
          </Link>
        </div>

        {/* Ligne 3 — Copyright */}
        <div className="mt-4 text-[11px] text-slate-300">
          BillyCheck © {new Date().getFullYear()} — Billy ne fournit pas de conseil financier ou juridique.
        </div>

      </div>
    </footer>
  );
}
