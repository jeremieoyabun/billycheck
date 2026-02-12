"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Billy } from "@/components/Billy";
import { ChatBubble } from "@/components/ChatBubble";
import { UploadDropzone } from "@/components/UploadDropzone";
import { ScanStatus } from "@/components/ScanStatus";

/* ── State machine ── */
type Step = "upload" | "engagement" | "processing" | "failed";

export default function ScanPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [scanId, setScanId] = useState<string | null>(null);

  /* ── 1. File selected → move to engagement ── */
  const handleFileAccepted = useCallback((f: File) => {
    setFile(f);
    setStep("engagement");
  }, []);

  /* ── 2. Engagement answered → create scan + process ── */
  const startProcessing = useCallback(
    async (engagement: "yes" | "no" | "unknown") => {
      if (!file) return;
      setStep("processing");

      try {
        /* ── Create scan record ── */
       const createRes = await fetch("/api/scans", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    originalName: file.name,
    mimeType: file.type,
    size: file.size,
    engagement,
  }),
});

const data = await createRes.json();
if (!createRes.ok || !data?.ok || !data?.scan?.id) {
  console.error("Create scan failed:", data);
  throw new Error(data?.error ?? "Failed to create scan");
}

const id = data.scan.id;
setScanId(id);


        /* ── Trigger processing (send the file as FormData) ── */
        const form = new FormData();
        form.append("file", file);
        form.append("engagement", engagement);

        const processRes = await fetch(`/api/scans/${id}/process`, {
          method: "POST",
          body: form,
        });

        if (!processRes.ok) {
          const err = await processRes.json().catch(() => null);
          throw new Error(err?.error ?? "Processing failed");
        }

        const result = await processRes.json();

        /* ── Success → redirect ── */
       if (result?.scan?.status === "DONE") {
  router.push(`/result/${id}`);
} else {
  throw new Error("Unexpected status: " + (result?.scan?.status ?? "null"));
}
      } catch (err) {
        console.error("Scan error:", err);
        setStep("failed");
      }
    },
    [file, router]
  );

  /* ── 3. Retry after failure ── */
  const handleRetry = useCallback(() => {
    if (!scanId) {
      /* No scan was created – go back to upload */
      setStep("upload");
      return;
    }

    /* Re-trigger processing on the same scan */
    setStep("processing");

    (async () => {
      try {
        const form = new FormData();
        if (file) form.append("file", file);

        const res = await fetch(`/api/scans/${scanId}/process`, {
          method: "POST",
          body: form,
        });

        if (!res.ok) throw new Error("Retry failed");
        const result = await res.json();

if (result?.scan?.status === "DONE") {
  router.push(`/result/${scanId}`);
} else {
  throw new Error("Unexpected status: " + (result?.scan?.status ?? "null"));
}
      } catch {
        setStep("failed");
      }
    })();
  }, [scanId, file, router]);

  return (
    <div className="px-5 py-8 max-w-lg mx-auto min-h-[70vh]">
      {/* ── UPLOAD ── */}
      {step === "upload" && (
        <div className="animate-fade-up">
          <div className="text-center mb-5">
            <div className="animate-billy-float inline-block">
              <Billy expression="normal" size={120} />
            </div>
          </div>

          <div className="flex flex-col gap-2.5 mb-6">
            <ChatBubble>
              <strong>Envoie-moi ta facture !</strong>
              <br />Photo, PDF, capture d'écran… tout fonctionne.
            </ChatBubble>
          </div>

          <UploadDropzone onFileAccepted={handleFileAccepted} />
        </div>
      )}

      {/* ── ENGAGEMENT QUESTION ── */}
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
              { value: "no"      as const, icon: "✅", title: "Non, je ne suis pas engagé(e)", sub: "Je peux changer de fournisseur quand je veux" },
              { value: "yes"     as const, icon: "📋", title: "Oui, je suis engagé(e)", sub: "J'ai un contrat avec une durée minimale" },
              { value: "unknown" as const, icon: "🤷", title: "Je ne sais pas", sub: "Pas de souci, Billy t'expliquera comment vérifier" },
            ]).map((opt) => (
              <button
                key={opt.value}
                onClick={() => startProcessing(opt.value)}
                className="w-full flex items-center gap-3 p-3.5 border-2 border-slate-200 rounded-xl bg-white text-left hover:border-billy-blue hover:bg-blue-50 transition-colors"
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

          {/* File indicator */}
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
      {step === "processing" && (
        <ScanStatus status="PROCESSING" />
      )}

      {/* ── FAILED ── */}
      {step === "failed" && (
        <ScanStatus status="FAILED" onRetry={handleRetry} />
      )}
    </div>
  );
}
