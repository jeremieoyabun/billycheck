import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function formatEur(n: number) {
  return new Intl.NumberFormat("fr-BE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 2,
  }).format(n);
}

export default async function ResultPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const scan = await prisma.scan.findUnique({ where: { id } });

  if (!scan) {
    return (
      <main className="max-w-4xl mx-auto py-14 px-6">
        <h1 className="text-2xl font-semibold">Scan introuvable</h1>
        <p className="mt-3 text-gray-600">
          On ne retrouve pas ce scan: <span className="font-mono">{id}</span>
        </p>
        <Link className="inline-block mt-6 underline" href="/scan">
          Relancer un scan
        </Link>
      </main>
    );
  }

  const status = scan.status;

  // Tant que ce n’est pas DONE, on affiche un état clair
  if (status !== "DONE") {
    return (
      <main className="max-w-4xl mx-auto py-14 px-6">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-2xl font-semibold">Analyse en cours</h1>
          <Link className="text-sm underline" href="/scan">
            Nouveau scan
          </Link>
        </div>

        <p className="mt-3 text-gray-600">
          Statut: <span className="font-semibold">{status}</span>
        </p>

        <div className="mt-8 rounded-2xl border p-5">
          <p className="font-semibold">Scan ID</p>
          <p className="mt-2 font-mono text-sm">{id}</p>
          <p className="mt-4 text-sm text-gray-600">
            Si ça reste bloqué, relance un scan ou réessaie dans quelques secondes.
          </p>
        </div>
      </main>
    );
  }

  const result: any = scan.resultJson ?? null;
  const bill = result?.bill ?? null;
  const offers = result?.offers ?? [];

  return (
    <main className="max-w-5xl mx-auto py-14 px-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Résultat</h1>
          <p className="mt-2 text-sm text-gray-600">
            Scan ID: <span className="font-mono">{id}</span>
          </p>
        </div>

        <Link className="text-sm underline" href="/scan">
          Scanner une autre facture
        </Link>
      </div>

      {/* Résumé facture */}
      <section className="mt-10 rounded-2xl border p-6">
        <h2 className="text-lg font-semibold">Facture détectée</h2>

        {!bill ? (
          <p className="mt-3 text-gray-600">Aucune donnée extraite.</p>
        ) : (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="rounded-xl bg-gray-50 p-4">
              <p className="text-gray-500">Fournisseur</p>
              <p className="mt-1 font-semibold">{bill.provider ?? "Non détecté"}</p>
            </div>

            <div className="rounded-xl bg-gray-50 p-4">
              <p className="text-gray-500">Offre</p>
              <p className="mt-1 font-semibold">{bill.plan_name ?? "Non détectée"}</p>
            </div>

            <div className="rounded-xl bg-gray-50 p-4">
              <p className="text-gray-500">Montant total</p>
              <p className="mt-1 font-semibold">
                {typeof bill.total_amount_eur === "number"
                  ? formatEur(bill.total_amount_eur)
                  : "Non détecté"}
              </p>
            </div>

            <div className="rounded-xl bg-gray-50 p-4">
              <p className="text-gray-500">Période</p>
              <p className="mt-1 font-semibold">{bill.billing_period ?? "Non détectée"}</p>
            </div>

            <div className="rounded-xl bg-gray-50 p-4">
              <p className="text-gray-500">Code postal</p>
              <p className="mt-1 font-semibold">{bill.postal_code ?? "Non détecté"}</p>
            </div>

            <div className="rounded-xl bg-gray-50 p-4">
              <p className="text-gray-500">Compteur</p>
              <p className="mt-1 font-semibold">{bill.meter_type ?? "Non détecté"}</p>
            </div>
          </div>
        )}
      </section>

      {/* Offres */}
      <section className="mt-8 rounded-2xl border p-6">
        <h2 className="text-lg font-semibold">Meilleures alternatives</h2>

        {offers.length === 0 ? (
          <p className="mt-3 text-gray-600">
            Pas d’offres affichées pour l’instant. Il manque souvent la consommation (kWh) pour estimer
            des économies fiables.
          </p>
        ) : (
          <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4">
            {offers.map((o: any) => (
              <a
                key={`${o.provider}-${o.plan}`}
                href={o.url}
                target="_blank"
                rel="noreferrer"
                className="rounded-2xl border p-5 hover:shadow-sm transition"
              >
                <p className="font-semibold">{o.provider}</p>
                <p className="mt-1 text-sm text-gray-600">{o.plan}</p>

                <div className="mt-4 text-sm">
                  <p>
                    Économies estimées:{" "}
                    <span className="font-semibold">
                      {typeof o.estimated_savings === "number"
                        ? formatEur(o.estimated_savings)
                        : "N/A"}
                    </span>
                  </p>
                  <p className="mt-1 text-gray-600">
                    Prix kWh: {typeof o.price_kwh === "number" ? `${o.price_kwh} €` : "N/A"}
                  </p>
                </div>
              </a>
            ))}
          </div>
        )}
      </section>

      {/* Debug léger (temporaire) */}
      <details className="mt-10">
        <summary className="cursor-pointer text-sm text-gray-600">
          Voir le JSON (debug)
        </summary>
        <pre className="mt-4 text-xs bg-gray-50 p-4 rounded-xl overflow-auto">
          {JSON.stringify(scan.resultJson, null, 2)}
        </pre>
      </details>
    </main>
  );
}
