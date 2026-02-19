// components/WithoutWithBillySection.tsx
// "Sans Billy" vs "Avec Billy" comparison section.
// Copy/numbers are placeholders — update before launch.

const WITHOUT_ITEMS = [
  "Des heures à comparer des offres sur des dizaines de sites",
  "Des tableaux complexes difficiles à interpréter",
  "Risque de rater une offre plus avantageuse",
  "Aucun suivi, tout est à refaire chaque année",
];

const WITH_ITEMS = [
  "Résultat en 30 secondes, dès la 1re analyse",
  "Comparaison claire : économies estimées en €",
  "Billy surveille le marché et te prévient",
  "2 analyses offertes, sans inscription",
];

export function WithoutWithBillySection() {
  return (
    <section className="px-5 pb-14 max-w-xl mx-auto">
      <h2 className="font-display font-extrabold text-2xl text-center mb-2">
        Avant et après Billy
      </h2>
      <p className="text-center text-slate-500 text-[15px] mb-8">
        Ce que ca change concrètement.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Sans Billy */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">😓</span>
            <span className="font-display font-extrabold text-lg text-slate-700">Sans Billy</span>
          </div>
          <ul className="flex flex-col gap-3">
            {WITHOUT_ITEMS.map((item, i) => (
              <li key={i} className="flex items-start gap-2.5 text-[14px] text-slate-600">
                <span className="mt-0.5 text-rose-400 shrink-0">✕</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Avec Billy */}
        <div className="bg-blue-50 border border-billy-blue/20 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">😎</span>
            <span className="font-display font-extrabold text-lg text-billy-blue">Avec Billy</span>
          </div>
          <ul className="flex flex-col gap-3">
            {WITH_ITEMS.map((item, i) => (
              <li key={i} className="flex items-start gap-2.5 text-[14px] text-slate-700">
                <span className="mt-0.5 text-emerald-500 shrink-0">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          {/* Placeholder for real numbers */}
          <div className="mt-5 pt-4 border-t border-billy-blue/15 grid grid-cols-2 gap-3 text-center">
            <div>
              <div className="font-display font-black text-2xl text-billy-blue">
                {/* TODO: replace with real stat */}
                ~180 €
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">économies moyennes / an</div>
            </div>
            <div>
              <div className="font-display font-black text-2xl text-billy-blue">30 s</div>
              <div className="text-[11px] text-slate-500 mt-0.5">pour obtenir ton résultat</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
