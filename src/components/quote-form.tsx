"use client";

import { useActionState, useEffect, useRef } from "react";
import { AlertCircle, CheckCircle2, Send } from "lucide-react";
import { submitCorporateQuote } from "@/app/actions";
import { initialActionState } from "@/lib/action-state";
import type { Locale } from "@/lib/types";
import { fieldClass, labelClass } from "./ui";
import { SubmitButton } from "./submit-button";

export function QuoteForm({ locale }: { locale: Locale }) {
  const [state, action] = useActionState(submitCorporateQuote, initialActionState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status === "success") formRef.current?.reset();
  }, [state.status]);

  return (
    <form ref={formRef} action={action} className="rounded-3xl border border-line bg-white p-5 shadow-soft sm:p-7">
      <input type="hidden" name="locale" value={locale} />
      <div className="mb-5">
        <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-primary">
          {locale === "ar" ? "طلب عرض أسعار" : locale === "en" ? "Request a quote" : "Demander un devis"}
        </p>
        <h2 className="mt-1 text-2xl font-extrabold tracking-[-0.03em] text-ink">
          {locale === "ar" ? "حلول تنقل مصممة لشركتكم" : locale === "en" ? "Mobility built around your team" : "Une mobilité adaptée à vos équipes"}
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
          <label htmlFor="quote-company" className={labelClass}>{locale === "ar" ? "اسم الشركة" : locale === "en" ? "Company" : "Entreprise"} *</label>
          <input id="quote-company" name="company_name" required className={fieldClass} placeholder="SLKM Partner" />
        </div>
        <div>
          <label htmlFor="quote-contact" className={labelClass}>{locale === "ar" ? "الشخص المسؤول" : locale === "en" ? "Contact person" : "Contact"} *</label>
          <input id="quote-contact" name="contact_person" required className={fieldClass} />
        </div>
        <div>
          <label htmlFor="quote-phone" className={labelClass}>{locale === "ar" ? "الهاتف" : locale === "en" ? "Phone" : "Téléphone"} *</label>
          <input id="quote-phone" name="phone" required type="tel" className={fieldClass} placeholder="+212 6..." />
        </div>
        <div>
          <label htmlFor="quote-email" className={labelClass}>{locale === "ar" ? "البريد الإلكتروني" : locale === "en" ? "Email" : "E-mail"} *</label>
          <input id="quote-email" name="email" required type="email" className={fieldClass} />
        </div>
        <div>
          <label htmlFor="quote-passengers" className={labelClass}>{locale === "ar" ? "عدد المسافرين" : locale === "en" ? "Passengers" : "Passagers"} *</label>
          <input id="quote-passengers" name="passenger_count" required type="number" min="1" className={fieldClass} placeholder="40" />
        </div>
        <div>
          <label htmlFor="quote-from" className={labelClass}>{locale === "ar" ? "مدينة الانطلاق" : locale === "en" ? "Origin city" : "Ville de départ"} *</label>
          <input id="quote-from" name="origin_city" required className={fieldClass} />
        </div>
        <div>
          <label htmlFor="quote-to" className={labelClass}>{locale === "ar" ? "مدينة الوصول" : locale === "en" ? "Destination" : "Ville d'arrivée"} *</label>
          <input id="quote-to" name="destination_city" required className={fieldClass} />
        </div>
        <div className="sm:col-span-2">
          <span className={labelClass}>{locale === "ar" ? "نوع الخدمة" : locale === "en" ? "Service type" : "Type de service"} *</span>
          <div className="grid gap-2 sm:grid-cols-2">
            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-line bg-white px-4 py-3 text-sm font-semibold text-ink transition has-[:checked]:border-primary has-[:checked]:bg-primary-soft">
              <input type="radio" name="service_type" value="personnel" defaultChecked className="h-4 w-4 text-primary" />
              {locale === "ar" ? "نقل الموظفين" : locale === "en" ? "Staff transport" : "Transport du personnel"}
            </label>
            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-line bg-white px-4 py-3 text-sm font-semibold text-ink transition has-[:checked]:border-primary has-[:checked]:bg-primary-soft">
              <input type="radio" name="service_type" value="tourisme" className="h-4 w-4 text-primary" />
              {locale === "ar" ? "رحلات سياحية" : locale === "en" ? "Tourism trips" : "Voyages touristiques"}
            </label>
          </div>
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="quote-details" className={labelClass}>{locale === "ar" ? "تفاصيل إضافية" : locale === "en" ? "Additional details" : "Détails complémentaires"}</label>
          <textarea id="quote-details" name="details" rows={4} className={fieldClass} placeholder={locale === "ar" ? "التواريخ، التردد، نقطة الانطلاق..." : locale === "en" ? "Dates, frequency, pickup point..." : "Dates, fréquence, point de prise en charge..."} />
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-3 border-t border-line pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-sm text-[11px] leading-5 text-muted">
          {locale === "ar" ? "بياناتكم محمية ولا تُستخدم إلا لمعالجة الطلب." : locale === "en" ? "Your details are protected and only used to process this request." : "Vos données sont protégées et utilisées uniquement pour traiter cette demande."}
        </p>
        <SubmitButton pendingLabel={locale === "ar" ? "جارٍ الإرسال..." : locale === "en" ? "Sending..." : "Envoi..."}>
          <Send className="h-4 w-4" />
          {locale === "ar" ? "إرسال الطلب" : locale === "en" ? "Send request" : "Envoyer la demande"}
        </SubmitButton>
      </div>
    </form>
  );
}
