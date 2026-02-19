"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { track } from "@/lib/analytics";

interface FormValues {
  fixedMonthly: string;
  priceKwh: string;
  consumptionKwh: string;
}

interface FormErrors {
  fixedMonthly?: string;
  priceKwh?: string;
  consumptionKwh?: string;
  global?: string;
}

function parseDecimalFR(raw: string): number | null {
  const s = raw.trim().replace(",", ".");
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

function validateField(
  key: keyof FormValues,
  val: string
): string | undefined {
  const n = parseDecimalFR(val);
  if (n === null) return "Valeur numerique requise (ex: 12,50)";
  if (n < 0)      return "La valeur ne peut pas etre negative";
  if (key === "fixedMonthly"  && n > 500)    return "Valeur trop elevee (max 500 €/mois)";
  if (key === "priceKwh"      && n > 5)      return "Valeur trop elevee (max 5 €/kWh)";
  if (key === "consumptionKwh"&& n < 1)      return "Consommation trop faible (min 1 kWh)";
  if (key === "consumptionKwh"&& n > 50000)  return "Consommation trop elevee (max 50 000 kWh)";
  return undefined;
}

export function ManualElectricityForm() {
  const router = useRouter();
  const [values, setValues] = useState<FormValues>({
    fixedMonthly:   "",
    priceKwh:       "",
    consumptionKwh: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  const handleChange = useCallback(
    (key: keyof FormValues) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setValues((prev) => ({ ...prev, [key]: val }));
      // clear error on change
      if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
    },
    [errors]
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      const newErrors: FormErrors = {};
      (Object.keys(values) as (keyof FormValues)[]).forEach((k) => {
        const err = validateField(k, values[k]);
        if (err) newErrors[k] = err;
      });

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }

      setLoading(true);
      setErrors({});

      try {
        const res = await fetch("/api/manual-estimate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fixedMonthly:   parseDecimalFR(values.fixedMonthly),
            priceKwh:       parseDecimalFR(values.priceKwh),
            consumptionKwh: parseDecimalFR(values.consumptionKwh),
          }),
        });

        const data = await res.json();
        if (!res.ok || !data?.scanId) {
          throw new Error(data?.error ?? "Erreur lors du calcul");
        }

        track("manual_estimate_submitted");
        router.push(`/result/${data.scanId}`);
      } catch (err) {
        setErrors({
          global: err instanceof Error ? err.message : "Une erreur est survenue. Reessaie.",
        });
        setLoading(false);
      }
    },
    [values, router]
  );

  return (
    <div className="mt-5 border-t border-slate-200 pt-5">
      <p className="text-[13px] text-slate-500 text-center mb-4 font-medium">
        Ou renseigne directement tes données
      </p>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <Field
          id="fixedMonthly"
          label="Prix fixe mensuel"
          unit="€/mois"
          placeholder="ex: 15,99"
          value={values.fixedMonthly}
          onChange={handleChange("fixedMonthly")}
          error={errors.fixedMonthly}
          inputMode="decimal"
        />
        <Field
          id="priceKwh"
          label="Prix de l'energie"
          unit="€/kWh"
          placeholder="ex: 0,32"
          value={values.priceKwh}
          onChange={handleChange("priceKwh")}
          error={errors.priceKwh}
          inputMode="decimal"
        />
        <Field
          id="consumptionKwh"
          label="Consommation annuelle"
          unit="kWh/an"
          placeholder="ex: 3500"
          value={values.consumptionKwh}
          onChange={handleChange("consumptionKwh")}
          error={errors.consumptionKwh}
          inputMode="numeric"
        />

        {errors.global && (
          <p className="text-xs text-rose-600 text-center">{errors.global}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 bg-slate-800 text-white rounded-2xl text-sm font-bold hover:bg-slate-900 disabled:opacity-60 transition-all"
        >
          {loading ? "Calcul en cours..." : "Calculer mon estimation"}
        </button>
      </form>
    </div>
  );
}

function Field({
  id,
  label,
  unit,
  placeholder,
  value,
  onChange,
  error,
  inputMode,
}: {
  id: string;
  label: string;
  unit: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  inputMode: "decimal" | "numeric";
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold text-slate-700 mb-1">
        {label}{" "}
        <span className="font-normal text-slate-400 text-xs">({unit})</span>
      </label>
      <div className="relative">
        <input
          id={id}
          type="text"
          inputMode={inputMode}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          aria-describedby={error ? `${id}-error` : undefined}
          aria-invalid={!!error}
          className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-billy-blue transition-colors ${
            error
              ? "border-rose-400 bg-rose-50 focus:ring-rose-400"
              : "border-slate-200 bg-white"
          }`}
        />
      </div>
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-1 text-xs text-rose-600">
          {error}
        </p>
      )}
    </div>
  );
}
