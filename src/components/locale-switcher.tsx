"use client";

import { useTransition } from "react";
import { Globe2 } from "lucide-react";
import { setSiteLocale } from "@/app/locale-actions";
import type { Locale } from "@/lib/types";
import { cn } from "@/lib/utils";

const LABELS: Array<{ value: Locale; label: string }> = [
  { value: "fr", label: "FR" },
  { value: "ar", label: "AR" },
  { value: "en", label: "EN" },
];

export function LocaleSwitcher({ locale, dark = false, compact = false }: { locale: Locale; dark?: boolean; compact?: boolean }) {
  const [pending, startTransition] = useTransition();

  function change(next: Locale) {
    if (next === locale) return;
    startTransition(async () => { await setSiteLocale(next); });
  }

  return (
    compact ? <label className="compact-locale">
      <Globe2 size={15} aria-hidden="true" />
      <span className="sr-only">{locale === "ar" ? "اللغة" : locale === "fr" ? "Langue" : "Language"}</span>
      <select value={locale} disabled={pending} onChange={event => change(event.target.value as Locale)} aria-busy={pending}>
        {LABELS.map(item => <option key={item.value} value={item.value} lang={item.value}>{item.label}</option>)}
      </select>
    </label> :
    <div
      className={cn(
        "inline-flex items-center gap-0.5 rounded-full border p-1",
        dark ? "border-white/20 bg-white/10 text-white" : "border-line bg-white text-muted",
        pending && "opacity-60",
      )}
      role="group"
      aria-label={locale === "ar" ? "اللغة" : locale === "fr" ? "Langue" : "Language"}
    >
      <Globe2 className="mx-1 h-3.5 w-3.5" />
      {LABELS.map((item) => (
        <button
          key={item.value}
          type="button"
          onClick={() => change(item.value)}
          disabled={pending}
          className={cn(
            "min-h-11 min-w-11 rounded-full px-2 py-1 text-xs font-extrabold tracking-wider transition",
            item.value === locale
              ? dark
                ? "bg-white text-primary-dark"
                : "bg-primary text-white"
              : dark
                ? "text-white/70 hover:text-white"
                : "text-muted hover:text-primary",
          )}
          aria-pressed={item.value === locale}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
