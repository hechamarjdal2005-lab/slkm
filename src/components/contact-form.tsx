"use client";
import { createTranslator } from "@/lib/cms";
import { usePageCMS } from "@/components/cms-provider";

import { useActionState, useEffect, useRef } from "react";
import { AlertCircle, CheckCircle2, Send } from "lucide-react";
import { submitContactMessage } from "@/app/actions";
import { initialActionState } from "@/lib/action-state";
import type { Locale } from "@/lib/types";
import { fieldClass, labelClass } from "./ui";
import { SubmitButton } from "./submit-button";

export function ContactForm({ locale }: { locale: Locale }) {
  const cms = usePageCMS("contact");
  const ct = createTranslator(cms, locale);
  const [state, action] = useActionState(submitContactMessage, initialActionState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status === "success") formRef.current?.reset();
  }, [state.status]);

  return (
    <form ref={formRef} action={action} className="slkm-form rounded-3xl border border-line bg-white p-5 shadow-soft sm:p-7">
      <input type="hidden" name="locale" value={locale} />
      <h2 className="text-[1.375rem] font-extrabold tracking-[-0.03em] text-ink">
        {ct("text_a44e9e92caa9", "Écrivez-nous", "أرسل لنا رسالة", "Send us a message")}
      </h2>
      <p className="mt-2 text-sm leading-6 text-muted">
        {ct("text_c0ab5dbad189", "Nous répondons sous un jour ouvré.", "سنعود إليكم خلال يوم عمل واحد.", "We reply within one business day.")}
      </p>

      {state.status !== "idle" ? (
        <div className={`mt-5 flex items-start gap-3 rounded-2xl border p-3.5 text-sm ${state.status === "success" ? "border-emerald-200 bg-emerald-50 text-success" : "border-red-200 bg-red-50 text-danger"}`} role="status">
          {state.status === "success" ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> : <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />}
          <p className="leading-6">{state.message}</p>
        </div>
      ) : null}

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="contact-name" className={labelClass}>{ct("text_c8af6e29fba8", "Nom complet", "الاسم الكامل", "Full name")} *</label>
          <input id="contact-name" name="full_name" autoComplete="name" required className={fieldClass} />
        </div>
        <div>
          <label htmlFor="contact-email" className={labelClass}>{ct("text_2550d962e536", "E-mail", "البريد الإلكتروني", "Email")} *</label>
          <input id="contact-email" name="email" autoComplete="email" type="email" dir="ltr" required className={fieldClass} />
        </div>
        <div>
          <label htmlFor="contact-phone" className={labelClass}>{ct("text_cc4c424b571f", "Téléphone", "الهاتف", "Phone")}</label>
          <input id="contact-phone" name="phone" autoComplete="tel" type="tel" dir="ltr" className={fieldClass} />
        </div>
        <div>
          <label htmlFor="contact-subject" className={labelClass}>{ct("text_db59ebb27218", "Sujet", "الموضوع", "Subject")} *</label>
          <input id="contact-subject" name="subject" required className={fieldClass} />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="contact-message" className={labelClass}>{ct("text_2f77668a9dfb", "Message", "الرسالة", "Message")} *</label>
          <textarea id="contact-message" name="message" rows={6} required className={fieldClass} />
        </div>
      </div>

      <div className="mt-5 flex flex-col items-stretch justify-between gap-3 border-t sm:flex-row sm:items-center border-line pt-5">
        <p className="text-[11px] leading-5 text-muted">
          {ct("text_b5875ab3a419", "Vos données ne sont jamais revendues.", "لن نشارك بياناتكم مع أي طرف ثالث.", "We never share your details with third parties.")}
        </p>
        <SubmitButton pendingLabel={ct("text_bf2f14e82f15", "Envoi...", "جارٍ الإرسال...", "Sending...")}>
          <Send className="h-4 w-4" />
          {ct("text_79075209f2bb", "Envoyer", "إرسال", "Send")}
        </SubmitButton>
      </div>
    </form>
  );
}
