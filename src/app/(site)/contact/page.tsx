import type { Metadata } from "next";
import { Clock3, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { AgencyMap } from "@/components/agency-map";
import { ContactForm } from "@/components/contact-form";
import { PageHero, SectionHeading } from "@/components/ui";
import { getLocale } from "@/lib/locale";
import { getAgencies, getSiteSettings } from "@/lib/queries";
import { normalizePhone, pick, whatsappUrl } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contactez SLKM : réservations, Irsaliyat, support B2B et assistance 24/7.",
};

export default async function ContactPage() {
  const locale = await getLocale();
  const [settings, agencies] = await Promise.all([getSiteSettings(), getAgencies()]);
  const address = pick(locale, settings?.address_fr, settings?.address_ar, settings?.address_en);
  const wa = whatsappUrl(settings?.whatsapp_number, locale === "ar" ? "مرحباً، أحتاج مساعدة." : locale === "en" ? "Hello, I need help." : "Bonjour, j'ai besoin d'aide.");

  const channels = [
    {
      icon: Phone,
      label: locale === "ar" ? "الهاتف" : locale === "en" ? "Phone" : "Téléphone",
      value: settings?.support_phone,
      href: settings?.support_phone ? `tel:${normalizePhone(settings.support_phone)}` : null,
    },
    {
      icon: MessageCircle,
      label: "WhatsApp",
      value: settings?.whatsapp_number,
      href: wa,
    },
    {
      icon: Mail,
      label: locale === "ar" ? "البريد الإلكتروني" : locale === "en" ? "Email" : "E-mail",
      value: settings?.contact_email,
      href: settings?.contact_email ? `mailto:${settings.contact_email}` : null,
    },
    {
      icon: MapPin,
      label: locale === "ar" ? "العنوان" : locale === "en" ? "Address" : "Adresse",
      value: address,
      href: null,
    },
  ].filter((channel) => channel.value);

  return (
    <>
      <PageHero
        image="/images/hero-about.jpg"
        eyebrow={locale === "ar" ? "اتصل بنا" : locale === "en" ? "Contact" : "Contact"}
        title={locale === "ar" ? "نحن هنا للإجابة على أسئلتكم" : locale === "en" ? "We are here to answer your questions" : "Nous sommes là pour répondre à vos questions"}
        description={
          locale === "ar"
            ? "حجز، تتبع أمانة، عرض أسعار للشركات أو مساعدة عاجلة: اختاروا القناة التي تناسبكم."
            : locale === "en"
              ? "Booking, parcel tracking, a corporate quote or urgent help: choose the channel that suits you."
              : "Réservation, suivi de colis, devis entreprise ou assistance urgente : choisissez le canal qui vous convient."
        }
      />

      <section className="container-page py-16 sm:py-20">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <ContactForm locale={locale} />
          <aside className="grid gap-4">
            <div className="rounded-3xl border border-line bg-white p-5 shadow-soft">
              <h2 className="text-lg font-extrabold text-ink">{locale === "ar" ? "قنوات الاتصال" : locale === "en" ? "Contact channels" : "Canaux de contact"}</h2>
              <div className="mt-4 grid gap-3">
                {channels.map((channel) => {
                  const content = (
                    <div className="flex items-start gap-3 rounded-2xl border border-line bg-background p-4 transition hover:border-primary/30">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
                        <channel.icon className="h-4 w-4" />
                      </span>
                      <span>
                        <span className="block text-[10px] font-extrabold uppercase tracking-[0.14em] text-muted">{channel.label}</span>
                        <span className="mt-0.5 block break-all text-sm font-bold text-ink">{channel.value}</span>
                      </span>
                    </div>
                  );
                  return channel.href ? (
                    <a key={channel.label} href={channel.href} target={channel.href.startsWith("http") ? "_blank" : undefined} rel={channel.href.startsWith("http") ? "noopener noreferrer" : undefined}>
                      {content}
                    </a>
                  ) : (
                    <div key={channel.label}>{content}</div>
                  );
                })}
                {!channels.length ? (
                  <p className="rounded-2xl border border-dashed border-line bg-background p-4 text-sm leading-6 text-muted">
                    {locale === "ar" ? "أضف بيانات الاتصال من إعدادات الموقع." : locale === "en" ? "Add contact details in site settings." : "Ajoutez les coordonnées dans les paramètres du site."}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="rounded-3xl bg-primary-dark p-5 text-white shadow-soft">
              <p className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.16em] text-white/50">
                <Clock3 className="h-3.5 w-3.5" />
                {locale === "ar" ? "خطوط المساعدة" : locale === "en" ? "Support lines" : "Lignes d'assistance"}
              </p>
              <div className="mt-4 grid gap-3">
                {(settings?.emergency_lines ?? []).map((line) => (
                  <a key={`${line.phone}-${line.label_fr}`} href={`tel:${normalizePhone(line.phone)}`} className="rounded-xl border border-white/10 bg-white/5 p-3 transition hover:border-white/25 hover:bg-white/10">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-white/45">{pick(locale, line.label_fr, line.label_ar, line.label_en)}</span>
                    <span className="mt-0.5 block text-sm font-bold text-white">{line.phone}</span>
                  </a>
                ))}
                {!settings?.emergency_lines?.length ? (
                  <p className="text-xs leading-6 text-white/45">
                    {locale === "ar" ? "أضف خطوط المساعدة من إعدادات الموقع." : locale === "en" ? "Add support lines in site settings." : "Ajoutez les lignes d'assistance dans les paramètres du site."}
                  </p>
                ) : null}
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section className="border-t border-line bg-white py-16 sm:py-20">
        <div className="container-page">
          <SectionHeading
            eyebrow={locale === "ar" ? "الموقع" : locale === "en" ? "Location" : "Localisation"}
            title={locale === "ar" ? "اعثروا على أقرب وكالة" : locale === "en" ? "Find your nearest agency" : "Trouvez l'agence la plus proche"}
            description={
              locale === "ar"
                ? "انقروا على أي نقطة للاطلاع على العنوان والهاتف، أو استعملوا صفحة الخطوط لتصفية الرحلات."
                : locale === "en"
                  ? "Click a pin for the address and phone, or use the routes page to filter journeys."
                  : "Cliquez sur une épingle pour l'adresse et le téléphone, ou utilisez la page des lignes pour filtrer les trajets."
            }
          />
          <AgencyMap agencies={agencies} locale={locale} height="480px" />
        </div>
      </section>
    </>
  );
}
