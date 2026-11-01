"use client";
import { createTranslator } from "@/lib/cms";
import { usePageCMS } from "@/components/cms-provider";

import { useActionState, useEffect, useRef } from "react";
import { AlertCircle, CheckCircle2, Send } from "lucide-react";
import { submitCorporateQuote } from "@/app/actions";
import { initialActionState } from "@/lib/action-state";
import type { Locale } from "@/lib/types";
import { fieldClass, labelClass } from "./ui";
import { SubmitButton } from "./submit-button";

export function QuoteForm({ locale }: { locale: Locale }) {
  const cms = usePageCMS("services");
  const ct = createTranslator(cms, locale);
  const [state, action] = useActionState(submitCorporateQuote, initialActionState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status === "success") formRef.current?.reset();
  }, [state.status]);

  return (
    <form ref={formRef} action={action} className="slkm-form rounded-3xl border border-line bg-white p-5 shadow-soft sm:p-7">
      <input type="hidden" name="locale" value={locale} />
      <div className="mb-5">
        <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-primary">
          {ct("text_3767bd206863", "Demander un devis", "طلب عرض أسعار", "Request a quote")}
        </p>
        <h2 className="mt-1 text-[1.375rem] font-extrabold tracking-[-0.03em] text-ink">
          {ct("text_2456f711edaf", "Une mobilité adaptée à vos équipes", "حلول تنقل مصممة لشركتكم", "Mobility built around your team")}
        </h2>
      </div>

      {state.status !== "idle" ? (
        <div
          className={`mb-5 flex items-start gap-3 rounded-2xl border p-3.5 text-sm ${
            state.status === "success" ? "border-emerald-200 bg-emerald-50 text-success" : "border-red-200 bg-red-50 text-danger"
          }`}
          role="status"
        >
          {state.status === "success" ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> : <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />}
          <p className="leading-6">{state.message}</p>
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="quote-company" className={labelClass}>{ct("text_4b000c1c5bff", "Entreprise", "اسم الشركة", "Company")} *</label>
          <input id="quote-company" name="company_name" autoComplete="organization" required className={fieldClass} placeholder="SLKM Partner" />
        </div>
        <div>
          <label htmlFor="quote-contact" className={labelClass}>{ct("text_2b5c3d26721a", "Contact", "الشخص المسؤول", "Contact person")} *</label>
          <input id="quote-contact" name="contact_person" autoComplete="name" required className={fieldClass} />
        </div>
        <div>
          <label htmlFor="quote-phone" className={labelClass}>{ct("text_cc4c424b571f", "Téléphone", "الهاتف", "Phone")} *</label>
          <input id="quote-phone" name="phone" autoComplete="tel" required type="tel" dir="ltr" className={fieldClass} placeholder="+212 6..." />
        </div>
        <div>
          <label htmlFor="quote-email" className={labelClass}>{ct("text_2550d962e536", "E-mail", "البريد الإلكتروني", "Email")} *</label>
          <input id="quote-email" name="email" autoComplete="email" required type="email" dir="ltr" className={fieldClass} />
        </div>
        <div>
          <label htmlFor="quote-passengers" className={labelClass}>{ct("text_da26234dc917", "Passagers", "عدد المسافرين", "Passengers")} *</label>
          <input id="quote-passengers" name="passenger_count" required type="number" min="1" className={fieldClass} placeholder="40" />
        </div>
        <div>
          <label htmlFor="quote-from" className={labelClass}>{ct("text_0bc226ec29cd", "Ville de départ", "مدينة الانطلاق", "Origin city")} *</label>
          <input id="quote-from" name="origin_city" required className={fieldClass} />
        </div>
        <div>
          <label htmlFor="quote-to" className={labelClass}>{ct("text_88aaac5494d3", "Ville d'arrivée", "مدينة الوصول", "Destination")} *</label>
          <input id="quote-to" name="destination_city" required className={fieldClass} />
        </div>
        <div className="sm:col-span-2">
          <span className={labelClass}>{ct("text_13f85bc0d96a", "Type de service", "نوع الخدمة", "Service type")} *</span>
          <div className="grid gap-2 sm:grid-cols-2">
            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-line bg-white px-4 py-3 text-sm font-semibold text-ink transition has-[:checked]:border-primary has-[:checked]:bg-primary-soft">
              <input type="radio" name="service_type" value="personnel" defaultChecked className="h-4 w-4 text-primary" />
              {ct("text_e6d84389cc74", "Transport du personnel", "نقل الموظفين", "Staff transport")}
            </label>
            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-line bg-white px-4 py-3 text-sm font-semibold text-ink transition has-[:checked]:border-primary has-[:checked]:bg-primary-soft">
              <input type="radio" name="service_type" value="tourisme" className="h-4 w-4 text-primary" />
              {ct("text_9b0c6974de4d", "Voyages touristiques", "رحلات سياحية", "Tourism trips")}
            </label>
          </div>
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="quote-details" className={labelClass}>{ct("text_0aa120a657ef", "Détails complémentaires", "تفاصيل إضافية", "Additional details")}</label>
          <textarea id="quote-details" name="details" rows={4} className={fieldClass} placeholder={ct("text_b8675b04f918", "Dates, fréquence, point de prise en charge...", "التواريخ، التردد، نقطة الانطلاق...", "Dates, frequency, pickup point...")} />
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-3 border-t border-line pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-sm text-[11px] leading-5 text-muted">
          {ct("text_d3440d913b14", "Vos données sont protégées et utilisées uniquement pour traiter cette demande.", "بياناتكم محمية ولا تُستخدم إلا لمعالجة الطلب.", "Your details are protected and only used to process this request.")}
        </p>
        <SubmitButton pendingLabel={ct("text_bf2f14e82f15", "Envoi...", "جارٍ الإرسال...", "Sending...")}>
          <Send className="h-4 w-4" />
          {ct("text_642583f3af3a", "Envoyer la demande", "إرسال الطلب", "Send request")}
        </SubmitButton>
      </div>
    </form>
  );
}
