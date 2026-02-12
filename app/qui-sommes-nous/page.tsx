export default function Page() {
  return (
    <main className="max-w-5xl mx-auto py-16 px-6">
      <h1 className="text-4xl font-bold mb-6">Qui sommes-nous</h1>

      <p className="text-lg text-gray-600 mb-10">
        BillyCheck vous aide à comprendre vos factures et à repérer rapidement si vous payez trop cher.
      </p>

      <div className="mt-10">
        <img
          src="/team.jpg"
          alt="Équipe BillyCheck"
          className="rounded-2xl shadow-lg w-full max-w-3xl"
        />
      </div>
    </main>
  );
}
