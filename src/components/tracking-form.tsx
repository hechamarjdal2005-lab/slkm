"use client";

import { useState } from "react";
import { MessageCircle, PackageSearch } from "lucide-react";
import type { Locale } from "@/lib/types";
import { whatsappUrl } from "@/lib/utils";
import { buttonClass, fieldClass, labelClass } from "./ui";

export function TrackingForm({ locale, whatsapp }: { locale: Locale; whatsapp: string | null }) {
  const [tracking, setTracking] = useState("");
  const text =
    locale === "ar"
      ? `مرحباً، أريد تتبع الأمانة رقم ${tracking || "..."}.`
      : locale === "en"
        ? `Hello, I would like to track parcel ${tracking || "..."}.`
        : `Bonjour, je souhaite suivre le colis ${tracking || "..."}.`;
  const href = whatsappUrl(whatsapp, text);

  return (
    <div className="rounded-3xl border border-white/15 bg-white/10 p-5 backdrop-blur sm:p-6">
      <p className="inline-flex items-center gap-2 text-sm font-extrabold text-white">
        <PackageSearch className="h-4 w-4 text-secondary-soft" />
        {locale === "ar" ? "تتبع أمانتكم" : locale === "en" ? "Track your parcel" : "Suivre votre colis"}
      </p>
      <div className="mt-4">
        <label htmlFor="tracking" className={`${labelClass} text-white/60`}>
          {locale === "ar" ? "رقم التتبع" : locale === "en" ? "Tracking number" : "Numéro de suivi"}
        </label>
        <input
          id="tracking"
          value={tracking}
          onChange={(event) => setTracking(event.target.value)}
          className={fieldClass}
          placeholder="IRS-2026-000000"
        />
      </div>
      {href ? (
        <a href={href} target="_blank" rel="noopener noreferrer" className={`${buttonClass("white", "md")} mt-3 w-full`}>
          <MessageCircle className="h-4 w-4" />
          {locale === "ar" ? "تتبع عبر واتساب" : locale === "en" ? "Track on WhatsApp" : "Suivre sur WhatsApp"}
        </a>
      ) : (
        <p className="mt-3 text-xs leading-5 text-white/60">
          {locale === "ar" ? "خدمة التتبع تتطلب رقم واتساب في إعدادات الموقع." : locale === "en" ? "Tracking requires a WhatsApp number in site settings." : "Le suivi nécessite un numéro WhatsApp dans les paramètres du site."}
        </p>
      )}
      <p className="mt-3 text-[11px] leading-5 text-white/50">
        {locale === "ar" ? "أدخل الرقم الذي تلقيتموه عند الإيداع. فريق إرساليات يجيبكم مباشرة." : locale === "en" ? "Enter the number issued at drop-off. Our Irsaliyat team replies directly." : "Saisissez le numéro remis au dépôt. L'équipe Irsaliyat vous répond directement."}
      </p>
    </div>
  );
}
