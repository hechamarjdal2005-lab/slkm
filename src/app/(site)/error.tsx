"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { RefreshCw, Route } from "lucide-react";
import { buttonClass } from "@/components/ui";
import type { Locale } from "@/lib/types";
import { pick } from "@/lib/utils";

export default function SiteError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const [locale, setLocale] = useState<Locale>("fr");
  useEffect(() => { const lang = document.documentElement.lang; if (lang === "ar" || lang === "en") setLocale(lang); }, []);
  const t = (fr: string, ar: string, en: string) => pick(locale, fr, ar, en);
  return <section className="container-page py-16"><div role="alert" className="mx-auto max-w-lg rounded-3xl border border-line bg-white p-7 text-center shadow-soft">
    <span className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-primary-soft text-primary"><Route size={26} /></span>
    <h1 className="text-2xl font-extrabold text-ink">{t("Un instant, on reprend la route.", "لحظة، سنواصل الرحلة.", "One moment. Let’s get back on the road.")}</h1>
    <p className="mt-3 text-sm leading-7 text-muted">{t("Cette page est momentanément indisponible. Réessayez ou contactez notre équipe pour préparer votre voyage.", "هذه الصفحة غير متاحة حالياً. حاولوا مجدداً أو تواصلوا مع فريقنا لتحضير رحلتكم.", "This page is temporarily unavailable. Try again or contact our team to plan your journey.")}</p>
    <div className="mt-6 flex flex-wrap justify-center gap-3"><button onClick={reset} className={buttonClass("primary")}><RefreshCw size={16} />{t("Réessayer", "حاولوا مجدداً", "Try again")}</button><Link href="/contact" className={buttonClass("ghost")}>{t("Nous contacter", "اتصلوا بنا", "Contact us")}</Link></div>
  </div></section>;
}
