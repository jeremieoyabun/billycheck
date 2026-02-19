"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { Billy } from "@/components/Billy";
import { ChatBubble } from "@/components/ChatBubble";
import { UploadDropzone } from "@/components/UploadDropzone";
import { ScanStatus } from "@/components/ScanStatus";
import { ScanCounter } from "@/components/ScanCounter";
import { BillNotCompatible } from "@/components/BillNotCompatible";
import { BillTypeModal } from "@/components/BillTypeModal";
import { VerticalTabs } from "@/components/VerticalTabs";
import { ManualElectricityForm } from "@/components/ManualElectricityForm";
import { getClientUserId } from "@/lib/user-id.client";
import { track } from "@/lib/analytics";
import type { Vertical } from "@/lib/verticals";

type Step = "upload" | "processing" | "failed" | "bill_not_compatible";

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
  const rescanId = searchParams.get("rescan"); // ex: /scan?rescan=cmlm22...

  const initialVertical = (searchParams.get("v") as Vertical | null) ?? "electricity";
  const [vertical, setVertical] = useState<Vertical>(
    initialVertical === "telecom" ? "telecom" : "electricity"
  );

  const [step, setStep] = useState<Step>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [scanId, setScanId] = useState<string | null>(null);
  const [quota, setQuota] = useState<QuotaInfo | null>(null);
  const [showBillModal, setShowBillModal] = useState(false);

  const refreshQuota = useCallback(() => {
    fetch("/api/quota")
      .then((r) => r.json())
      .then((data) => setQuota(data))
      .catch(() => {});
  }, []);

  /* ── Fetch quota on mount ── */
  useEffect(() => {
    getClientUserId();
    refreshQuota();
  }, [refreshQuota]);

  /* ── Refresh quota after Stripe payment ── */
  useEffect(() => {
    if (paymentSuccess) refreshQuota();
  }, [paymentSuccess, refreshQuota]);

  /* ── Normal flow: create scan + process ── */
  const startProcessing = useCallback(
    async (f: File) => {
      setStep("processing");

      try {
        const uid = getClientUserId();

        // 1) Create scan record
        const createRes = await fetch("/api/scans", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            originalName: f.name,
            mimeType: f.type,
            size: f.size,
            userIdentifier: uid,
          }),
        });

        const data = await createRes.json();
        if (!createRes.ok || !data?.scan?.id) {
          throw new Error(data?.error ?? "Impossible de créer le scan");
        }

        const id = data.scan.id;
        setScanId(id);

        // 2) Process
        const form = new FormData();
        form.append("file", f);
        form.append("vertical", vertical);

        const processRes = await fetch(`/api/scans/${id}/process`, {
          method: "POST",
          body: form,
        });

        const result = await processRes.json();

        if (result?.code === "PAYWALL_REQUIRED") {
          track("paywall_redirected", { vertical });
          router.push("/paywall");
          return;
        }

        if (result?.code === "BILL_NOT_COMPATIBLE") {
          track("scan_failed", { vertical, reason: "not_compatible" });
          setStep("bill_not_compatible");
          return;
        }

        if (result?.scan?.status === "DONE") {
          track("scan_completed", { vertical });
          // Fire-and-forget referral claim (idempotent on server)
          fetch("/api/referrals/claim", { method: "POST" }).catch(() => {});
          router.push(`/result/${id}`);
          return;
        }

        track("scan_failed", { vertical, reason: "processing_error" });
        setStep("failed");
      } catch (err) {
        console.error("Scan error:", err);
        track("scan_failed", { vertical, reason: "exception" });
        setStep("failed");
      }
    },
    [router, vertical]
  );

  /* ── Rescan flow: process existing scan id ── */
  const processRescan = useCallback(
    async (existingId: string, f: File) => {
      setStep("processing");
      setScanId(existingId);

      try {
        const form = new FormData();
        form.append("file", f);
        form.append("vertical", vertical);

        const processRes = await fetch(`/api/scans/${existingId}/process`, {
          method: "POST",
          body: form,
        });

        const result = await processRes.json();

        if (result?.code === "PAYWALL_REQUIRED") {
          track("paywall_redirected", { vertical });
          router.push("/paywall");
          return;
        }

        if (result?.code === "BILL_NOT_COMPATIBLE") {
          track("scan_failed", { vertical, reason: "not_compatible" });
          setStep("bill_not_compatible");
          return;
        }

        if (result?.scan?.status === "DONE") {
          track("scan_completed", { vertical });
          fetch("/api/referrals/claim", { method: "POST" }).catch(() => {});
          router.push(`/result/${existingId}`);
          return;
        }

        track("scan_failed", { vertical, reason: "processing_error" });
        setStep("failed");
      } catch (err) {
        console.error("Rescan error:", err);
        track("scan_failed", { vertical, reason: "exception" });
        setStep("failed");
      }
    },
    [router, vertical]
  );

  /* ── File selected ── */
  const handleFileAccepted = useCallback(
    (f: File) => {
      setFile(f);
      track("scan_started", { vertical });

      // ✅ MODE RESCAN: relaunch processing on existing scan
      if (rescanId) {
        processRescan(rescanId, f);
        return;
      }

      // ✅ FLOW NORMAL
      if (quota && !quota.canScan) {
        track("paywall_redirected", { vertical, reason: "quota_exceeded" });
        router.push("/paywall");
        return;
      }

      startProcessing(f);
    },
    [processRescan, quota, rescanId, router, startProcessing, vertical]
  );

  /* ── Retry ── */
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

          {/* Vertical selector */}
          <div className="flex justify-center mb-5">
            <VerticalTabs value={vertical} onChange={setVertical} />
          </div>

          {/* Payment success banner */}
          {paymentSuccess && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-[13px] text-emerald-800 mb-4">
              ✅ Paiement recu ! Tu peux scanner ta facture.
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
              <strong>
                {vertical === "telecom"
                  ? "Envoie-moi ta facture télécom !"
                  : "Envoie-moi ta facture d'électricité !"}
              </strong>
              <br />
              {vertical === "telecom"
                ? "Pour les Télécom, le scan de ta facture est recommandé."
                : "Photo, PDF, capture d'écran - tout fonctionne."}
            </ChatBubble>
          </div>

          <UploadDropzone onFileAccepted={handleFileAccepted} />

          {/* Bill type info - electricity only */}
          {vertical === "electricity" && (
            <div className="mt-6 bg-amber-50 border-2 border-amber-300 rounded-2xl px-5 py-5">
              <div className="flex items-start gap-3 mb-3">
                <div className="text-2xl">⚠️</div>
                <div>
                  <div className="font-bold text-[15px] text-amber-900 mb-1">
                    Important : utilisez une facture annuelle ou de régularisation
                  </div>
                  <div className="text-[14px] text-amber-800">
                    Les écheanciers ou factures estimées ne permettent pas de comparer correctement les offres.
                  </div>
                </div>
              </div>

              <div className="space-y-2 text[14px] text-amber-900 mb-4">
                <div className="flex items-start gap-2">
                  <span>✓</span>
                  <span>Consommation réelle en kWh</span>
                </div>
                <div className="flex items-start gap-2">
                  <span>✓</span>
                  <span>Prix fixe mensuel (HT)</span>
                </div>
                <div className="flex items-start gap-2">
                  <span>✓</span>
                  <span>{"Prix de l'energie (€/kWh HT)"}</span>
                </div>
              </div>

              <button
                onClick={() => setShowBillModal(true)}
                className="w-full py-3 bg-amber-500 text-white rounded-xl text-sm font-bold shadow hover:bg-amber-600 transition-all"
              >
                📄 Voir un exemple de facture compatible
              </button>

              {file && (
                <div className="mt-4 flex items-center gap-2.5 px-4 py-3 bg-white border border-slate-200 rounded-xl text-[13px] text-slate-500">
                  <span>📎</span>
                  <span className="flex-1 truncate">{file.name}</span>
                  <span className="text-emerald-500">✓</span>
                </div>
              )}
            </div>
          )}


          {/* Telecom hint */}
          {vertical === "telecom" && (
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-2xl px-5 py-4">
              <div className="flex items-start gap-3">
                <div className="text-xl">📱</div>
                <div>
                  <div className="font-bold text-[14px] text-blue-900 mb-1">
                    Pour une analyse optimale
                  </div>
                  <div className="space-y-1 text-[13px] text-blue-800">
                    <div className="flex gap-2"><span>✓</span><span>Facture Proximus, Orange, VOO, Scarlet, Telenet...</span></div>
                    <div className="flex gap-2"><span>✓</span><span>Prix du forfait mensuel visible</span></div>
                    <div className="flex gap-2"><span>✓</span><span>Débit internet ou volume data mobile si bundle</span></div>
                  </div>
                </div>
              </div>
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
        <BillNotCompatible onRetry={handleRetry} onShowExample={() => setShowBillModal(true)} />
      )}
    </div>
  );
}
