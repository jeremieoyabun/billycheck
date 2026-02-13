"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Billy } from "@/components/Billy";
import { ChatBubble } from "@/components/ChatBubble";
import { UploadDropzone } from "@/components/UploadDropzone";
import { ScanStatus } from "@/components/ScanStatus";
import { ScanCounter } from "@/components/ScanCounter";
import { BillNotCompatible } from "@/components/BillNotCompatible";
import { BillTypeModal } from "@/components/BillTypeModal";
import { getClientUserId } from "@/lib/user-id.client";

type Step = "upload" | "engagement" | "processing" | "failed" | "bill_not_compatible";

interface QuotaInfo {
  canScan: boolean;
  freeRemaining: number;
  paidCredits: number;
  requiresPayment: boolean;
  userIdentifier: string;
}

export default function ScanPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paymentSuccess = searchParams.get("payment") === "success";

  const [step, setStep] = useState<Step>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [scanId, setScanId] = useState<string | null>(null);
  const [quota, setQuota] = useState<QuotaInfo | null>(null);
  const [showBillModal, setShowBillModal] = useState(false);

  /* ── Fetch quota on mount ── */
  useEffect(() => {
    // Ensure client-side user ID is set
    getClientUserId();

    fetch("/api/quota")
      .then((r) => r.json())
      .then((data) => setQuota(data))
      .catch(() => {});
  }, []);

  /* ── Show success toast if returning from Stripe ── */
  useEffect(() => {
    if (paymentSuccess) {
      // Refresh quota after payment
      fetch("/api/quota")
        .then((r) => r.json())
        .then((data) => setQuota(data))
        .catch(() => {});
    }
  }, [paymentSuccess]);

  /* ── 1. File selected ── */
  const handleFileAccepted = useCallback(
    (f: File) => {
      // Check quota before proceeding
      if (quota && !quota.canScan) {
        router.push("/paywall");
        return;
      }
      setFile(f);
      setStep("engagement");
    },
    [quota, router]
  );

  /* ── 2. Engagement → create scan + process ── */
  const startProcessing = useCallback(
    async (engagement: "yes" | "no" | "unknown") => {
      if (!file) return;
      setStep("processing");

      try {
        const uid = getClientUserId();

        const createRes = await fetch("/api/scans", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            originalName: file.name,
            mimeType: file.type,
            size: file.size,
            engagement,
            userIdentifier: uid,
          }),
        });

        const data = await createRes.json();
        if (!createRes.ok || !data?.scan?.id) {
          throw new Error(data?.error ?? "Impossible de créer le scan");
        }

        const id = data.scan.id;
        setScanId(id);

        const form = new FormData();
        form.append("file", file);
        form.append("engagement", engagement);

        const processRes = await fetch(`/api/scans/${id}/process`, {
          method: "POST",
          body: form,
        });

        const result = await processRes.json();

        // Handle paywall redirect
        if (result?.code === "PAYWALL_REQUIRED") {
          router.push("/paywall");
          return;
        }

        // Handle bill not compatible
        if (result?.code === "BILL_NOT_COMPATIBLE") {
          setStep("bill_not_compatible");
          return;
        }

        if (result?.scan?.status === "DONE") {
          router.push(`/result/${id}`);
        } else if (result?.scan?.status === "FAILED") {
          setStep("failed");
        } else if (!processRes.ok) {
          throw new Error(result?.error ?? "Erreur serveur");
        } else {
          throw new Error("Statut inattendu: " + (result?.scan?.status ?? "inconnu"));
        }
      } catch (err) {
        console.error("Scan error:", err);
        setStep("failed");
      }
    },
    [file, router]
  );

  /* ── 3. Retry ── */
  const handleRetry = useCallback(() => {
    setFile(null);
    setScanId(null);
    setStep("upload");
  }, []);

  return (
    <div className="px-5 py-8 max-w-lg mx-auto min-h-[70vh]">
      {/* Bill Type Modal */}
      <BillTypeModal open={showBillModal} onClose={() => setShowBillModal(false)} />

      {/* ── UPLOAD ── */}
      {step === "upload" && (
        <div className="animate-fade-up">
          <div className="text-center mb-5">
            <div className="animate-billy-float inline-block">
              <Billy expression="normal" size={120} />
            </div>
          </div>

          {/* Payment success banner */}
          {paymentSuccess && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-[13px] text-emerald-800 mb-4">
              ✅ Paiement reçu ! Tu peux scanner ta facture.
            </div>
          )}

          {/* Scan counter */}
          {quota && (
            <div className="text-center mb-4">
              <ScanCounter freeRemaining={quota.freeRemaining} paidCredits={quota.paidCredits} />
            </div>
          )}

          <div className="flex flex-col gap-2.5 mb-6">
            <ChatBubble>
              <strong>Envoie-moi ta facture !</strong>
              <br />Photo, PDF, capture d'écran... tout fonctionne.
            </ChatBubble>
          </div>

          <UploadDropzone onFileAccepted={handleFileAccepted} />

{/* Bill type info */}
<div className="mt-6 bg-amber-50 border-2 border-amber-300 rounded-2xl px-5 py-5">
  <div className="flex items-start gap-3 mb-3">
    <div className="text-2xl">⚠️</div>
    <div>
      <div className="font-bold text-[15px] text-amber-900 mb-1">
        Important : utilisez une facture annuelle ou de régularisation
      </div>
      <div className="text-[14px] text-amber-800">
        Les échéanciers ou factures estimées ne permettent pas de comparer correctement les offres.
      </div>
    </div>
  </div>

  <div className="space-y-2 text-[14px] text-amber-900 mb-4">
    <div className="flex items-start gap-2">
      <span>✓</span>
      <span>Consommation réelle en kWh</span>
    </div>
    <div className="flex items-start gap-2">
      <span>✓</span>
      <span>Détail du prix de l’énergie (HT)</span>
    </div>
    <div className="flex items-start gap-2">
      <span>✓</span>
      <span>Abonnement (HT)</span>
    </div>
  </div>

  <button
    onClick={() => setShowBillModal(true)}
    className="w-full py-3 bg-amber-500 text-white rounded-xl text-sm font-bold shadow hover:bg-amber-600 transition-all"
  >
    📄 Voir un exemple de facture compatible
  </button>
</div>
    </div>
      )}

      {/* ── ENGAGEMENT ── */}
      {step === "engagement" && (
        <div className="animate-fade-up">
          <div className="text-center mb-5">
            <Billy expression="normal" size={110} />
          </div>
          <div className="flex flex-col gap-2.5 mb-7">
            <ChatBubble>
              <strong>Petite question avant de commencer</strong> 🤔
            </ChatBubble>
            <ChatBubble delay={400}>
              Es-tu actuellement engagé(e) avec ton fournisseur d'énergie ?
              Ça m'aide à te donner des infos plus adaptées.
            </ChatBubble>
          </div>

          <div className="flex flex-col gap-2.5 mb-5">
            {([
              { value: "no" as const, icon: "✅", title: "Non, je ne suis pas engagé(e)", sub: "Je peux changer de fournisseur quand je veux" },
              { value: "yes" as const, icon: "📋", title: "Oui, je suis engagé(e)", sub: "J'ai un contrat avec une durée minimale" },
              { value: "unknown" as const, icon: "🤷", title: "Je ne sais pas", sub: "Pas de souci, Billy t'expliquera comment vérifier" },
            ]).map((opt) => (
              <button
                key={opt.value}
                onClick={() => startProcessing(opt.value)}
                className="w-full flex items-center gap-3 p-3.5 border-2 border-slate-200 rounded-xl bg-white text-left hover:border-blue-600 hover:bg-blue-50 transition-colors"
              >
                <span className="text-xl">{opt.icon}</span>
                <div>
                  <div className="font-bold text-[15px] text-slate-800">{opt.title}</div>
                  <div className="text-[13px] text-slate-500">{opt.sub}</div>
                </div>
              </button>
            ))}
          </div>

          <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-[13px] text-emerald-800 leading-relaxed">
            <strong>💡 Comment vérifier ?</strong><br />
            Regarde sur ta facture ou dans ton espace client en ligne.
            La mention « contrat fixe » avec une date de fin indique un engagement.
          </div>

          {file && (
            <div className="mt-4 flex items-center gap-2.5 px-4 py-3 bg-white border border-slate-200 rounded-xl text-[13px] text-slate-500">
              <span>📎</span>
              <span className="flex-1 truncate">{file.name}</span>
              <span className="text-emerald-500">✓</span>
            </div>
          )}
        </div>
      )}

      {/* ── PROCESSING ── */}
      {step === "processing" && <ScanStatus status="PROCESSING" />}

      {/* ── FAILED ── */}
      {step === "failed" && <ScanStatus status="FAILED" onRetry={handleRetry} />}

      {/* ── BILL NOT COMPATIBLE ── */}
      {step === "bill_not_compatible" && (
        <BillNotCompatible
          onRetry={handleRetry}
          onShowExample={() => setShowBillModal(true)}
        />
      )}
    </div>
  );
}
