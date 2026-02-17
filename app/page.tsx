
import Link from "next/link";
import Image from "next/image";
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
<p className="font-display font-semibold text-[clamp(20px,3.5vw,28px)] tracking-[-0.01em] text-slate-600 mb-4">
  Hé 👋 Moi c’est <span className="text-billy-blue font-bold">Billy</span>.
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

      {/* ── Social proof & trust badges ── */}
      <section className="px-5 pb-12 max-w-xl mx-auto">
        {/* 5-star rating */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 text-center mb-4">
          <div className="flex justify-center gap-0.5 text-2xl mb-1.5">
            <span>⭐</span><span>⭐</span><span>⭐</span><span>⭐</span><span>⭐</span>
          </div>
          <div className="font-bold text-sm text-slate-900">Clients satisfaits</div>
          <div className="text-xs text-slate-500 mt-0.5">
            Des centaines de factures déjà analysées en Belgique et en France
          </div>
        </div>

        {/* Trust badges row */}
        <div className="grid grid-cols-2 gap-3">
          {/* Vu dans Paris Match */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
            <Image
              src="/paris-match-logo.png"
              alt="Paris Match"
              width={80}
              height={28}
              className="object-contain mb-2 opacity-80"
            />
            <div className="text-xs font-semibold text-slate-600">Vu dans Paris Match</div>
          </div>

          {/* Paiement sécurisé Stripe */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
            <svg className="h-7 mb-2 opacity-80" viewBox="0 0 60 25" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5.4 8.5c0-.7.6-1 1.5-1 1.4 0 3.1.4 4.5 1.2V4.9C9.8 4.2 8.3 3.9 6.9 3.9 3 3.9.5 5.9.5 9.1c0 5 6.8 4.2 6.8 6.3 0 .8-.7 1.1-1.7 1.1-1.5 0-3.4-.6-4.9-1.5v3.9c1.7.7 3.3 1 4.9 1 4 0 6.7-2 6.7-5.1C12.3 9.5 5.4 10.4 5.4 8.5ZM16.8 1.3l-4.8 1V5l4.8-1V1.3ZM12 7.2h4.8v11.6H12V7.2ZM23.8 7.2l-.3-1h-4.3v15.5h4.8v-10.5c1.1-1.5 3-1.2 3.6-1V7.2c-.6-.2-2.9-.6-3.8 1V7.2ZM29.2 7.2h4.8v11.6h-4.8V7.2ZM29.2 1.3l4.8-1V5l-4.8 1V1.3ZM41.2 3.9c-1.6 0-2.6.8-3.2 1.3l-.2-1H33v18.5h4.8l.1-4.5c.6.4 1.5 1 2.9 1 2.9 0 5.6-2.4 5.6-7.5-.1-4.8-2.8-7.8-5.2-7.8Zm-.9 11.9c-1 0-1.5-.3-1.9-.8l-.1-6.3c.4-.5 1-.9 2-.9 1.5 0 2.5 1.7 2.5 4s-1 4-2.5 4ZM53.7 3.9c-4.5 0-7.3 3.4-7.3 7.8 0 5.2 3.2 7.8 7.9 7.8 2.3 0 4-.5 5.3-1.2v-3.6c-1.3.6-2.7 1-4.6 1-1.8 0-3.4-.6-3.6-2.8h9.1c0-.3.1-1.1.1-1.5 0-4.7-2.3-7.5-6.9-7.5Zm-2.5 6.3c0-2 1.3-2.9 2.4-2.9 1.2 0 2.3.9 2.3 2.9h-4.7Z" fill="#635BFF"/>
            </svg>
            <div className="text-xs font-semibold text-slate-600">Paiement sécurisé via Stripe</div>
          </div>
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
