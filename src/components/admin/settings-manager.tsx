import { updateSiteSettings } from "@/app/actions";
import type { SiteSettings } from "@/lib/types";
import { AdminField, AdminInput, AdminPanel, AdminTextarea, AdminSelect } from "./admin-ui";
import { SocialLinksEditor, EmergencyLinesEditor } from "./global-list-editors";
import { SubmitButton } from "../submit-button";
import { ContentListEditor } from "./content-list-editor";
import { DEFAULT_SERVICES } from "@/lib/service-content";

export function SettingsManager({ settings }: { settings: SiteSettings | null }) {
  return <AdminPanel title="Identité, contacts & contenus" description="Les informations sont publiées dans les trois langues. Les images acceptent un chemin local ou une URL HTTPS.">
    <form action={updateSiteSettings} className="grid gap-5 sm:grid-cols-2">
      <div className="sm:col-span-2"><h3 className="mb-3 font-bold">Statistiques vérifiées</h3><p className="mb-3 text-sm text-muted">Publiez uniquement des valeurs documentées par l’entreprise.</p><ContentListEditor name="stats" items={settings?.analytics_config.stats ?? []} /></div>
      {(["fr", "ar", "en"] as const).map(locale => <div key={locale} className="grid gap-4 rounded-xl border border-line bg-background p-4 sm:col-span-2 sm:grid-cols-2" dir={locale === "ar" ? "rtl" : "ltr"}>
        <AdminField label={`Nom du site (${locale.toUpperCase()})`}><AdminInput name={`site_name_${locale}`} defaultValue={settings?.[`site_name_${locale}`] ?? ""} /></AdminField>
        <AdminField label={`Adresse (${locale.toUpperCase()})`}><AdminTextarea name={`address_${locale}`} defaultValue={settings?.[`address_${locale}`] ?? ""} rows={2} /></AdminField>
      </div>)}
      <AdminField label="Téléphone"><AdminInput name="support_phone" type="tel" defaultValue={settings?.support_phone ?? ""} /></AdminField>
      <AdminField label="WhatsApp (format international)"><AdminInput name="whatsapp_number" type="tel" defaultValue={settings?.whatsapp_number ?? ""} /></AdminField>
      <AdminField label="E-mail"><AdminInput name="contact_email" type="email" defaultValue={settings?.contact_email ?? ""} /></AdminField>
      <AdminField label="Téléphone d’assistance"><AdminInput name="emergency_phone" type="tel" defaultValue={settings?.emergency_phone ?? ""} /></AdminField>
      <AdminField label="Langue par défaut"><AdminSelect name="default_locale" defaultValue={settings?.default_locale ?? "fr"}><option value="fr">Français</option><option value="ar">العربية</option><option value="en">English</option></AdminSelect></AdminField>
      <AdminField label="Réseaux sociaux" className="sm:col-span-2" hint="Nom du réseau et URL HTTPS."><SocialLinksEditor value={settings?.social_links ?? {}} /></AdminField>
      <AdminField label="Lignes d’assistance" className="sm:col-span-2"><EmergencyLinesEditor value={settings?.emergency_lines ?? []} /></AdminField>
      <section className="sm:col-span-2"><h2 className="mb-4 text-lg font-extrabold text-primary-dark">Flotte & images</h2><ContentListEditor name="fleet" items={settings?.analytics_config?.fleet ?? []} /></section>
      <section className="sm:col-span-2"><h2 className="mb-4 text-lg font-extrabold text-primary-dark">Notre histoire — chronologie</h2><ContentListEditor name="timeline" items={settings?.analytics_config?.timeline ?? []} /></section>
      <section className="sm:col-span-2"><h2 className="mb-4 text-lg font-extrabold text-primary-dark">Services B2B</h2><ContentListEditor name="services" items={settings?.analytics_config?.services ?? DEFAULT_SERVICES} /></section>
      <div className="sm:col-span-2"><SubmitButton pendingLabel="Enregistrement…">Enregistrer les paramètres</SubmitButton></div>
    </form>
  </AdminPanel>;
}
