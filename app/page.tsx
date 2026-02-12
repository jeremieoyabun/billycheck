
import Link from "next/link";
import { Billy } from "@/components/Billy";
import { FAQ } from "@/components/FAQ";

export default function Home() {
  return (
    <>
      {/* ── Hero ── */}
      <section className="px-5 pt-12 pb-10 text-center bg-gradient-to-b from-blue-50 to-background">
        <div className="animate-billy-float inline-block mb-4">
          <Billy expression="normal" size={140} />
        </div>
        <h1 className="font-display font-black text-[clamp(28px,6vw,42px)] leading-tight mb-3">
          Hé 👋 Moi c'est <span className="text-billy-blue">Billy</span>.
        </h1>
        <p className="text-lg text-slate-600 max-w-md mx-auto leading-relaxed mb-7">
          Envoie-moi ta facture d'électricité, je te dis en 30&nbsp;secondes
          si tu pourrais payer moins cher.
        </p>
        <Link
          href="/scan"
          className="inline-flex items-center gap-2 px-9 py-4 bg-billy-blue text-white rounded-2xl text-lg font-display font-bold shadow-[0_4px_14px_rgba(37,99,235,0.25)] hover:bg-billy-blue-dark hover:-translate-y-0.5 transition-all"
        >
          🔍 Checker ma facture
        </Link>
        <p className="text-[13px] text-slate-400 mt-3.5">
          Gratuit · Sans inscription · Facture supprimée après analyse
        </p>
      </section>

      {/* ── How it works ── */}
      <section className="px-5 py-12 max-w-xl mx-auto">
        <h2 className="font-display font-extrabold text-2xl text-center mb-1">Comment ça marche ?</h2>
        <p className="text-center text-slate-500 text-[15px] mb-8">
          Trois étapes. 30 secondes. C'est tout.
        </p>
        <div className="flex flex-col gap-4">
          {([
            ["📸", "Envoie ta facture", "Photo, PDF ou capture d'écran — tout marche."],
            ["🔍", "Billy analyse", "Je lis ta facture et je compare avec les offres du marché."],
            ["💡", "Tu découvres le résultat", "Je te montre les offres qui pourraient te convenir, avec une estimation des économies possibles."],
          ] as const).map(([icon, title, desc], i) => (
            <div key={i} className="flex gap-4 items-start bg-white p-5 rounded-2xl border border-slate-200">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-2xl shrink-0">
                {icon}
              </div>
              <div>
                <div className="font-bold text-base mb-0.5">{title}</div>
                <div className="text-sm text-slate-500 leading-relaxed">{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Trust ── */}
      <section className="px-5 pb-12 max-w-xl mx-auto">
        <div className="grid grid-cols-3 gap-3">
          {([
            ["🔒", "Confidentiel", "Facture supprimée immédiatement après analyse"],
            ["🎁", "1er check gratuit", "Puis 0,99\u00a0€ — moins qu'un café"],
            ["⚡", "30 secondes", "Billy va vite. Très vite."],
          ] as const).map(([icon, title, desc], i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-2xl p-4 text-center">
              <div className="text-3xl mb-2">{icon}</div>
              <div className="font-bold text-sm mb-1">{title}</div>
              <div className="text-xs text-slate-500 leading-snug">{desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="px-5 pb-12 max-w-xl mx-auto">
        <h2 className="font-display font-extrabold text-2xl text-center mb-6">Questions fréquentes</h2>
        <FAQ />
      </section>

      {/* ── Final CTA ── */}
      <section className="px-5 py-12 text-center bg-gradient-to-b from-background to-blue-50">
        <Billy expression="success" size={100} />
        <h2 className="font-display font-extrabold text-2xl mt-3 mb-2">
          Allez, montre-moi cette facture.
        </h2>
        <p className="text-slate-500 text-[15px] mb-6">
          En 30&nbsp;secondes, tu sauras si tu pourrais payer moins.
        </p>
        <Link
          href="/scan"
          className="inline-flex items-center gap-2 px-8 py-4 bg-billy-blue text-white rounded-2xl text-base font-display font-bold shadow-[0_4px_14px_rgba(37,99,235,0.25)] hover:bg-billy-blue-dark hover:-translate-y-0.5 transition-all"
        >
          🔍 Checker ma facture gratuitement
        </Link>
      </section>

      {/* ── Footer ── */}
      <footer className="px-5 py-6 border-t border-slate-200 text-center text-xs text-slate-400 space-y-1.5">
        <div className="flex justify-center gap-4 flex-wrap">
          <span className="cursor-pointer hover:text-slate-600">Politique de confidentialité</span>
          <span>·</span>
          <span className="cursor-pointer hover:text-slate-600">CGU</span>
          <span>·</span>
          <span className="cursor-pointer hover:text-slate-600">Mentions légales</span>
          <span>·</span>
          <span>contact@billycheck.com</span>
        </div>
        <div>BillyCheck © 2026 — Billy ne fournit pas de conseil financier ou juridique.</div>
      </footer>
    </>
  );
}
