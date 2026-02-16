
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
<p className="font-display font-semibold text-[clamp(16px,3vw,20px)] text-slate-500 mb-2">
  Hé 👋 Moi c’est <span className="text-billy-blue">Billy</span>.
</p>

        <p className="text-[clamp(17px,2.6vw,20px)] text-slate-700 max-w-md mx-auto leading-relaxed mb-6">
  <span className="font-semibold text-slate-900">
    Envoie-moi ta facture d’électricité
  </span>
  , et je te dis en{" "}
  <span className="font-semibold text-billy-blue">30&nbsp;secondes</span>{" "}
  si tu pourrais payer moins cher.
</p>

<Link
  href="/scan"
  className="inline-flex items-center justify-center gap-2 px-9 py-4 bg-billy-blue text-white rounded-2xl text-lg font-display font-bold shadow-[0_6px_18px_rgba(37,99,235,0.22)] hover:bg-billy-blue-dark hover:-translate-y-0.5 transition-all"
>
  🔍 Checker ma facture
</Link>

<p className="text-[13px] text-slate-500 font-medium mt-3.5">
  🎁 2 scans gratuits · 🔒 Sans inscription · 🗑️ Facture supprimée après analyse
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
           ["🎁", "2 analyses offertes", "Puis 4,99\u00a0€ par scan supplémentaire"],
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
<div className="flex justify-center mb-3">
  <div className="animate-billy-float">
    <Billy expression="success" size={170} />
  </div>
</div>

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
    </>
  );
}
