"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Globe2 } from "lucide-react";
import type { Locale } from "@/lib/types";
import { cn } from "@/lib/utils";

const LABELS: Array<{ value: Locale; label: string }> = [
  { value: "fr", label: "FR" },
  { value: "ar", label: "AR" },
  { value: "en", label: "EN" },
];

export function LocaleSwitcher({ locale, dark = false }: { locale: Locale; dark?: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function change(next: Locale) {
    if (next === locale) return;
    const secure = window.location.protocol === "https:" ? ";secure" : "";
    document.cookie = `slkm_locale=${next};path=/;max-age=31536000;samesite=lax${secure}`;
    document.documentElement.lang = next;
    document.documentElement.dir = next === "ar" ? "rtl" : "ltr";
    startTransition(() => router.refresh());
  }

  return (
    <div
      className={cn(
        "inline-flex items-center gap-0.5 rounded-full border p-1",
        dark ? "border-white/20 bg-white/10 text-white" : "border-line bg-white text-muted",
        pending && "opacity-60",
      )}
      aria-label="Language"
    >
      <Globe2 className="mx-1 h-3.5 w-3.5" />
      {LABELS.map((item) => (
        <button
          key={item.value}
          type="button"
          onClick={() => change(item.value)}
          className={cn(
            "rounded-full px-2 py-1 text-[10px] font-extrabold tracking-wider transition",
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
