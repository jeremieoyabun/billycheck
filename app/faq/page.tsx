export default function Page() {
  return (
    <main className="max-w-4xl mx-auto py-16 px-6">
      <h1 className="text-4xl font-bold mb-10">FAQ</h1>

      <div className="space-y-8">
        <div>
          <h2 className="text-xl font-semibold">Mes données sont-elles sécurisées ?</h2>
          <p className="text-gray-600 mt-2">
            Oui. Les documents sont utilisés uniquement pour l’analyse et l’affichage du résultat.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold">Combien ça coûte ?</h2>
          <p className="text-gray-600 mt-2">
            Le premier scan est gratuit, puis vous pouvez continuer à scanner selon le modèle du service.
          </p>
        </div>
      </div>
    </main>
  );
}
