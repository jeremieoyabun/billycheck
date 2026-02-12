import { prisma } from "@/lib/prisma";
import { ResultCards } from "@/components/ResultCards";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function ResultPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const scan = await prisma.scan.findUnique({
    where: { id },
  });

  if (!scan) {
    return (
      <main className="max-w-4xl mx-auto py-16 px-6">
        <h1 className="text-2xl font-semibold">Scan introuvable</h1>
      </main>
    );
  }

  if (scan.status !== "DONE") {
    return (
      <main className="max-w-4xl mx-auto py-16 px-6">
        <h1 className="text-2xl font-semibold">Analyse en cours...</h1>
      </main>
    );
  }

  const data = JSON.parse(JSON.stringify(scan.resultJson));

  return (
    <main className="min-h-screen bg-slate-50 py-12 px-6">
      <div className="max-w-3xl mx-auto">
        <ResultCards data={data} />
      </div>
    </main>
  );
}
