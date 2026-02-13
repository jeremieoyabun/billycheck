"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Billy } from "@/components/Billy";
import { ChatBubble } from "@/components/ChatBubble";
import { ScanStatus } from "@/components/ScanStatus";
import { ResultCards, type ResultJson } from "@/components/ResultCards";
import { ExtractedDataCard } from "@/components/ExtractedDataCard";

type ScanRecord = {
  id: string;
  status: "UPLOADED" | "PROCESSING" | "DONE" | "FAILED";
  resultJson: ResultJson | null;
  originalName?: string;
  createdAt?: string;
};

type ScanApiResponse =
  | ScanRecord
  | { ok: boolean; scan?: ScanRecord; error?: string };

function unwrapScan(payload: ScanApiResponse): ScanRecord | null {
  // Case 1: API returns { ok: true, scan: {...} }
  if (payload && typeof payload === "object" && "ok" in payload) {
    const p = payload as { ok: boolean; scan?: ScanRecord; error?: string };
    return p.scan ?? null;
  }
  // Case 2: API returns the scan object directly
  return payload as ScanRecord;
}

export default function ResultPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [scan, setScan] = useState<ScanRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchScan = useCallback(async () => {
    try {
      const res = await fetch(`/api/scans/${id}`);
      if (!res.ok) throw new Error("Scan non trouvé");

      const payload: ScanApiResponse = await res.json();
      const s = unwrapScan(payload);

      if (!s) {
        // API wrapper without scan or unexpected payload
        throw new Error(
          typeof payload === "object" && payload && "error" in payload
            ? String((payload as any).error)
            : "Réponse API invalide"
        );
      }

      setScan(s);
      return s.status;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
      return null;
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    (async () => {
      const status = await fetchScan();
      if (status === "PROCESSING" || status === "UPLOADED") {
        interval = setInterval(async () => {
          const s = await fetchScan();
          if (s === "DONE" || s === "FAILED") {
            if (interval) clearInterval(interval);
          }
        }, 2000);
      }
    })();

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [fetchScan]);

  const handleRetry = useCallback(async () => {
    setScan((prev) => (prev ? { ...prev, status: "PROCESSING" } : prev));
    setError(null);
    try {
      const res = await fetch(`/api/scans/${id}/process`, { method: "POST" });
      if (!res.ok) throw new Error("Retry failed");
      await fetchScan();
    } catch {
      setScan((prev) => (prev ? { ...prev, status: "FAILED" } : prev));
    }
  }, [id, fetchScan]);

  /* Loading */
  if (loading) {
    return (
      <div className="px-5 py-16 max-w-lg mx-auto text-center">
        <div className="animate-billy-bounce inline-block">
          <Billy expression="searching" size={100} />
        </div>
        <p className="mt-4 text-slate-500 text-sm">Chargement...</p>
      </div>
    );
  }

  /* Fetch error */
  if (error || !scan) {
    return (
      <div className="px-5 py-16 max-w-lg mx-auto text-center">
        <Billy expression="error" size={100} />
        <div className="mt-4 flex flex-col gap-2.5 items-center">
          <ChatBubble>
            <strong>Oups 😅</strong>
            <br />
            {error ?? "Je n'ai pas trouvé cette analyse."}
          </ChatBubble>
        </div>
        <Link
          href="/scan"
          className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-[0_4px_14px_rgba(37,99,235,0.25)] hover:bg-blue-700 transition-all"
        >
          📸 Nouveau check
        </Link>
      </div>
    );
  }

  /* Still processing */
  if (scan.status === "PROCESSING" || scan.status === "UPLOADED") {
    return (
      <div className="px-5 py-8 max-w-lg mx-auto">
        <ScanStatus status="PROCESSING" />
      </div>
    );
  }

  /* Failed */
  if (scan.status === "FAILED") {
    return (
      <div className="px-5 py-8 max-w-lg mx-auto">
        <ScanStatus status="FAILED" onRetry={handleRetry} />
      </div>
    );
  }

  /* DONE → show results */
  return (
    <div className="px-5 py-6 pb-16 max-w-xl mx-auto">
      {scan.resultJson ? (
        <>
          <ResultCards data={scan.resultJson} />

          {/* Extracted data card */}
          {scan.resultJson.bill && (
            <div className="mt-5">
              <ExtractedDataCard bill={scan.resultJson.bill} />
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <Billy expression="error" size={100} />
          <ChatBubble>
            L'analyse est terminée mais je n'ai pas pu extraire de données.
            Essaie avec une facture plus lisible.
          </ChatBubble>
        </div>
      )}

      {/* Bottom actions */}
      <div className="mt-8 flex gap-3">
        <Link
          href="/scan"
          className="flex-1 text-center py-3 bg-slate-100 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-200 transition-colors"
        >
          🔄 Nouveau check
        </Link>
        <button
          onClick={() => {
            if (confirm("Supprimer toutes les données de cette analyse ?")) {
              fetch(`/api/scans/${id}`, { method: "DELETE" }).then(() =>
                router.push("/")
              );
            }
          }}
          className="flex-1 text-center py-3 bg-white border border-red-200 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors"
        >
          🗑️ Supprimer mes données
        </button>
      </div>
    </div>
  );
}
