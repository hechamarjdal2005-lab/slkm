"use client";
import { createTranslator, cmsImage } from "@/lib/cms";
import { usePageCMS } from "@/components/cms-provider";
import { useState } from "react";
import { MessageCircle, PackageSearch } from "lucide-react";
import type { Locale } from "@/lib/types";
import { whatsappUrl } from "@/lib/utils";
import { buttonClass, fieldClass, labelClass } from "./ui";
export function TrackingForm({ locale, whatsapp }: {
    locale: Locale;
    whatsapp: string | null;
}) {
    const cms = usePageCMS("irsaliyat");
    const ct = createTranslator(cms, locale);
    const [tracking, setTracking] = useState("");
    const [error, setError] = useState(false);
    const text = locale === "ar"
        ? `مرحباً، أريد تتبع الأمانة رقم ${tracking || "..."}.`
        : locale === "en"
            ? `Hello, I would like to track parcel ${tracking || "..."}.`
            : `Bonjour, je souhaite suivre le colis ${tracking || "..."}.`;
    const href = whatsappUrl(whatsapp, text);
    return (<form id="tracking" onSubmit={event => { event.preventDefault(); if (href && tracking.trim())
        window.open(href, "_blank", "noopener,noreferrer");
    else
        setError(true); }} className="scroll-mt-32 rounded-2xl border border-line bg-white p-[18px] text-ink shadow-soft sm:p-[21px]">
      <p className="inline-flex items-center gap-2 text-base font-extrabold text-primary-dark">
        <PackageSearch className="h-5 w-5 text-primary"/>
        {ct("text_15936a24b63a", "Suivre votre colis", "تتبع أمانتكم", "Track your parcel")}
      </p>
      <div className="mt-4">
        <label htmlFor="tracking-number" className={labelClass}>
          {ct("text_2b27304a563b", "Numéro de suivi", "رقم التتبع", "Tracking number")}
        </label>
        <input id="tracking-number" dir="ltr" required minLength={3} maxLength={80} aria-describedby="tracking-help" value={tracking} onChange={(event) => { setTracking(event.target.value); setError(false); }} className={fieldClass} placeholder="IRS-2026-000000"/>
      </div>
      {href ? (<button type="submit" className={`${buttonClass("secondary", "md")} mt-3 w-full`}>
          <MessageCircle className="h-4 w-4"/>
          {ct("text_8555a9966ded", "Suivre sur WhatsApp", "تتبع عبر واتساب", "Track on WhatsApp")}
        </button>) : (<p className="mt-3 text-sm leading-5 text-muted">
          {ct("text_f8970bd401c6", "Le suivi est momentanément indisponible. Contactez une agence.", "خدمة التتبع غير متاحة حالياً. تواصلوا مع الوكالة.", "Tracking is currently unavailable. Please contact an agency.")}
        </p>)}
      {error && <p role="alert" className="mt-3 text-sm text-danger">{ct("text_c120f11bb031", "Veuillez saisir votre numéro de suivi.", "يرجى إدخال رقم التتبع.", "Please enter your tracking number.")}</p>}
      <p id="tracking-help" className="mt-3 text-xs leading-5 text-muted">
        {ct("text_4218a4cc0da9", "Saisissez le numéro remis au dépôt. L'équipe Irsaliyat vous répond directement.", "أدخل الرقم الذي تلقيتموه عند الإيداع. فريق إرساليات يجيبكم مباشرة.", "Enter the number issued at drop-off. Our Irsaliyat team replies directly.")}
      </p>
    </form>);
}
