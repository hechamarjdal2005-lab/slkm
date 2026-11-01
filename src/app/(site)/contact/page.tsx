import { createTranslator, cmsImage, cmsLink } from "@/lib/cms";
import { getPageCMS, getCMSMetadata } from "@/lib/cms-store";
import { CmsPage, CmsBuiltin } from "@/components/cms-page";
import type { Metadata } from "next";
import { Clock3, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { AgencyMap } from "@/components/agency-map";
import { ContactForm } from "@/components/contact-form";
import { PageHero, SectionHeading } from "@/components/ui";
import { getLocale } from "@/lib/locale";
import { getAgencies, getSiteSettings } from "@/lib/queries";
import { normalizePhone, pick, whatsappUrl } from "@/lib/utils";
export async function generateMetadata(): Promise<Metadata> { return getCMSMetadata("contact", { "title": "Contact", "description": "Réservation, suivi de colis, devis entreprise ou assistance urgente : choisissez le canal qui vous convient." }); }
export default async function ContactPage() {
    const locale = await getLocale();
    const cms = await getPageCMS("contact");
    const ct = createTranslator(cms, locale);
    const [settings, agencies] = await Promise.all([getSiteSettings(), getAgencies()]);
    const address = pick(locale, settings?.address_fr, settings?.address_ar, settings?.address_en);
    const wa = whatsappUrl(settings?.whatsapp_number, ct("text_1a04b59df37a", "Bonjour, j'ai besoin d'aide.", "مرحباً، أحتاج مساعدة.", "Hello, I need help."));
    const channels = [
        {
            icon: Phone,
            label: ct("text_cc4c424b571f", "Téléphone", "الهاتف", "Phone"),
            value: settings?.support_phone,
            href: settings?.support_phone ? `tel:${normalizePhone(settings.support_phone)}` : null
        },
        {
            icon: MessageCircle,
            label: "WhatsApp",
            value: settings?.whatsapp_number,
            href: wa
        },
        {
            icon: Mail,
            label: ct("text_2550d962e536", "E-mail", "البريد الإلكتروني", "Email"),
            value: settings?.contact_email,
            href: settings?.contact_email ? `mailto:${settings.contact_email}` : null
        },
        {
            icon: MapPin,
            label: ct("text_79e5cf20de0b", "Adresse", "العنوان", "Address"),
            value: address,
            href: null
        },
    ].filter((channel) => channel.value);
    return <CmsPage cms={cms}><>
      <CmsBuiltin sectionKey="hero"><PageHero compact image={cmsImage(cms, "image_9fce0732de23", "/images/hero-about.jpg")} eyebrow={ct("text_2b5c3d26721a", "Contact", "اتصل بنا", "Contact")} title={ct("text_ed0d4f31b3c0", "Nous sommes là pour répondre à vos questions", "نحن هنا للإجابة على أسئلتكم", "We are here to answer your questions")} description={ct("text_99352e031027", "Réservation, suivi de colis, devis entreprise ou assistance urgente : choisissez le canal qui vous convient.", "حجز، تتبع أمانة، عرض أسعار للشركات أو مساعدة عاجلة: اختاروا القناة التي تناسبكم.", "Booking, parcel tracking, a corporate quote or urgent help: choose the channel that suits you.")}/></CmsBuiltin>

      <CmsBuiltin sectionKey="section-1"><section className="container-page py-16 sm:py-[4.5rem]">
        <div className="grid gap-7 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <ContactForm locale={locale}/>
          <aside className="grid gap-4">
            <div className="rounded-3xl border border-line bg-white p-[18px] shadow-soft">
              <h2 className="text-lg font-extrabold text-ink">{ct("text_a9b01b010447", "Canaux de contact", "قنوات الاتصال", "Contact channels")}</h2>
              <div className="mt-4 grid gap-3">
                {channels.map((channel) => {
            const content = (<div className="flex items-start gap-3 rounded-2xl border border-line bg-background p-4 transition hover:border-primary/30">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
                        <channel.icon className="h-4 w-4"/>
                      </span>
                      <span className="min-w-0">
                        <span className="block text-[10px] font-extrabold uppercase tracking-[0.14em] text-muted">{channel.label}</span>
                        <span className="mt-0.5 block break-all text-sm font-bold text-ink"><bdi dir={channel.href?.startsWith("tel:") || channel.href?.startsWith("mailto:") ? "ltr" : "auto"}>{channel.value}</bdi></span>
                      </span>
                    </div>);
            return channel.href ? (<a key={channel.label} href={channel.href} target={channel.href.startsWith("http") ? "_blank" : undefined} rel={channel.href.startsWith("http") ? "noopener noreferrer" : undefined}>
                      {content}
                    </a>) : (<div key={channel.label}>{content}</div>);
        })}
                {!channels.length ? (<p className="rounded-2xl border border-dashed border-line bg-background p-4 text-sm leading-6 text-muted">
                    {ct("text_2f4647667d91", "Les coordonnées sont momentanément indisponibles. Utilisez le formulaire pour nous écrire.", "بيانات الاتصال غير متاحة حالياً. يمكنكم استخدام النموذج لمراسلتنا.", "Contact details are currently unavailable. You can use the form to message us.")}
                  </p>) : null}
              </div>
            </div>

            <div className="rounded-3xl bg-ink p-[18px] text-white shadow-soft">
              <p className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.16em] text-white/70">
                <Clock3 className="h-3.5 w-3.5"/>
                {ct("text_cdcbda2a3dd2", "Lignes d'assistance", "خطوط المساعدة", "Support lines")}
              </p>
              <div className="mt-4 grid gap-3">
                {(settings?.emergency_lines ?? []).map((line) => (<a key={`${line.phone}-${line.label_fr}`} href={`tel:${normalizePhone(line.phone)}`} className="rounded-xl border border-white/10 bg-white/5 p-3 transition hover:border-white/25 hover:bg-white/10">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-white/70">{pick(locale, line.label_fr, line.label_ar, line.label_en)}</span>
                    <span className="mt-0.5 block text-sm font-bold text-white">{line.phone}</span>
                  </a>))}
                {!settings?.emergency_lines?.length ? (<p className="text-xs leading-6 text-white/70">
                    {ct("text_c474fa194117", "Écrivez-nous via le formulaire pour préparer votre voyage.", "تواصلوا معنا عبر النموذج لتحضير رحلتكم.", "Use the form to contact us about your journey.")}
                  </p>) : null}
              </div>
            </div>
          </aside>
        </div>
      </section></CmsBuiltin>

      <CmsBuiltin sectionKey="section-2"><section className="border-t border-line bg-white py-16 sm:py-[4.5rem]">
        <div className="container-page">
          <SectionHeading eyebrow={ct("text_f31f4fc85132", "Localisation", "الموقع", "Location")} title={ct("text_96ac3a928459", "Trouvez l'agence la plus proche", "اعثروا على أقرب وكالة", "Find your nearest agency")} description={ct("text_6aa115334159", "Cliquez sur une épingle pour l'adresse et le téléphone, ou utilisez la page des lignes pour filtrer les trajets.", "انقروا على أي نقطة للاطلاع على العنوان والهاتف، أو استعملوا صفحة الخطوط لتصفية الرحلات.", "Click a pin for the address and phone, or use the routes page to filter journeys.")}/>
          <AgencyMap agencies={agencies} locale={locale} height="480px"/>
        </div>
      </section></CmsBuiltin>
    </></CmsPage>;
}
