"use client";

import { useActionState, useEffect, useRef } from "react";
import { AlertCircle, CheckCircle2, Send } from "lucide-react";
import { submitContactMessage } from "@/app/actions";
import { initialActionState } from "@/lib/action-state";
import type { Locale } from "@/lib/types";
import { fieldClass, labelClass } from "./ui";
import { SubmitButton } from "./submit-button";

export function ContactForm({ locale }: { locale: Locale }) {
  const [state, action] = useActionState(submitContactMessage, initialActionState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status === "success") formRef.current?.reset();
  }, [state.status]);

  return (
    <form ref={formRef} action={action} className="rounded-3xl border border-line bg-white p-5 shadow-soft sm:p-7">
      <input type="hidden" name="locale" value={locale} />
      <h2 className="text-2xl font-extrabold tracking-[-0.03em] text-ink">
        {locale === "ar" ? "أرسل لنا رسالة" : locale === "en" ? "Send us a message" : "Écrivez-nous"}
      </h2>
      <p className="mt-2 text-sm leading-6 text-muted">
        {locale === "ar" ? "سنعود إليكم خلال يوم عمل واحد." : locale === "en" ? "We reply within one business day." : "Nous répondons sous un jour ouvré."}
      </p>

      {state.status !== "idle" ? (
        <div className={`mt-5 flex items-start gap-3 rounded-2xl border p-3.5 text-sm ${state.status === "success" ? "border-emerald-200 bg-emerald-50 text-success" : "border-red-200 bg-red-50 text-danger"}`} role="status">
          {state.status === "success" ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> : <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />}
          <p className="leading-6">{state.message}</p>
        </div>
      ) : null}

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="contact-name" className={labelClass}>{locale === "ar" ? "الاسم الكامل" : locale === "en" ? "Full name" : "Nom complet"} *</label>
          <input id="contact-name" name="full_name" required className={fieldClass} />
        </div>
        <div>
          <label htmlFor="contact-email" className={labelClass}>{locale === "ar" ? "البريد الإلكتروني" : locale === "en" ? "Email" : "E-mail"} *</label>
          <input id="contact-email" name="email" type="email" required className={fieldClass} />
        </div>
        <div>
          <label htmlFor="contact-phone" className={labelClass}>{locale === "ar" ? "الهاتف" : locale === "en" ? "Phone" : "Téléphone"}</label>
          <input id="contact-phone" name="phone" type="tel" className={fieldClass} />
        </div>
        <div>
          <label htmlFor="contact-subject" className={labelClass}>{locale === "ar" ? "الموضوع" : locale === "en" ? "Subject" : "Sujet"} *</label>
          <input id="contact-subject" name="subject" required className={fieldClass} />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="contact-message" className={labelClass}>{locale === "ar" ? "الرسالة" : locale === "en" ? "Message" : "Message"} *</label>
          <textarea id="contact-message" name="message" rows={6} required className={fieldClass} />
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between gap-3 border-t border-line pt-5">
        <p className="text-[11px] leading-5 text-muted">
          {locale === "ar" ? "لن نشارك بياناتكم مع أي طرف ثالث." : locale === "en" ? "We never share your details with third parties." : "Vos données ne sont jamais revendues."}
        </p>
        <SubmitButton pendingLabel={locale === "ar" ? "جارٍ الإرسال..." : locale === "en" ? "Sending..." : "Envoi..."}>
          <Send className="h-4 w-4" />
          {locale === "ar" ? "إرسال" : locale === "en" ? "Send" : "Envoyer"}
        </SubmitButton>
      </div>
    </form>
  );
}
