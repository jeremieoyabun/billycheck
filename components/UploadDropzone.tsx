"use client";

import { useRef, useState, useCallback, type DragEvent } from "react";

const ACCEPTED_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
];
const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

interface UploadDropzoneProps {
  onFileAccepted: (file: File) => void;
  disabled?: boolean;
}

export function UploadDropzone({ onFileAccepted, disabled = false }: UploadDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validate = useCallback((file: File): string | null => {
    if (!ACCEPTED_TYPES.includes(file.type)) return "Format non supporté. Envoie un PDF, JPG ou PNG.";
    if (file.size > MAX_SIZE) return "Fichier trop lourd (max 10 MB).";
    return null;
  }, []);

  const handleFile = useCallback(
    (file: File | undefined) => {
      if (!file || disabled) return;
      const err = validate(file);
      if (err) {
        setError(err);
        return;
      }
      setError(null);
      onFileAccepted(file);
    },
    [disabled, onFileAccepted, validate]
  );

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      handleFile(e.dataTransfer.files[0]);
    },
    [handleFile]
  );

  return (
    <div className="space-y-3">
      <div
        onClick={() => !disabled && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`
          border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer
          transition-all duration-200 bg-white
          ${dragOver ? "border-blue-600 bg-blue-50 shadow-[0_0_0_4px_rgba(37,99,235,0.1)]" : "border-slate-300 hover:border-blue-600 hover:bg-blue-50"}
          ${disabled ? "opacity-50 pointer-events-none" : ""}
        `}
      >
        <div className="text-5xl mb-3">📄</div>
        <div className="font-bold text-base text-slate-700 mb-1">
          Glisse ta facture ici
        </div>
        <div className="text-sm text-slate-500 mb-4">
          ou clique pour choisir un fichier
        </div>
        <div className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold">
          📸 Choisir un fichier
        </div>
        <div className="text-xs text-slate-400 mt-3">
          PDF, JPG ou PNG · 10 MB max
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png,.webp"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      <div className="flex items-start gap-2">
        <span className="text-base">🔒</span>
        <p className="text-xs text-slate-400 leading-relaxed">
          Ta facture est supprimée immédiatement après analyse.
          Aucune donnée personnelle n'est conservée. Billy ne garde
          que les chiffres nécessaires à la comparaison.
        </p>
      </div>
    </div>
  );
}
