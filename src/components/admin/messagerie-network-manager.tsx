import { ImageAssetInput } from "./image-asset-input";
import { ContentListEditor } from "./content-list-editor";
import { getMessagerieNetwork, type MessagerieAgency } from "@/lib/messagerie";
import { getAdminSnapshot } from "@/lib/queries";
import { saveMessagerieAgency, saveMessagerieSettings, deleteMessagerieAgency } from "@/app/messagerie-actions";
import { AdminField, AdminInput, AdminTextarea, AdminSelect, AdminCheckbox, AdminPanel } from "./admin-ui";
import { SubmitButton } from "../submit-button";
import { DeleteButton } from "../delete-button";
import { MessagerieNetworkSection } from "../messagerie-network-section";
import type { Agency } from "@/lib/types";

function AgencyForm({ row, sources }: { row?: MessagerieAgency; sources: Agency[] }) {
  return <form action={saveMessagerieAgency} className="grid gap-4 sm:grid-cols-2">
    <AdminField label="Photo (agence indépendante)"><ImageAssetInput name="image_url" defaultValue={row?.image_url ?? ""} /></AdminField>
    <AdminField label="Latitude (agence indépendante)"><AdminInput name="lat" type="number" step="0.0000001" min="-90" max="90" defaultValue={row?.lat ?? ""} /></AdminField>
    <AdminField label="Longitude (agence indépendante)"><AdminInput name="lng" type="number" step="0.0000001" min="-180" max="180" defaultValue={row?.lng ?? ""} /></AdminField>
    <div className="sm:col-span-2"><h3 className="mb-3 font-bold">Agents de service — coordonnées publiques</h3><ContentListEditor name="agents" items={row?.agents ?? []} /></div>
    {row && <input type="hidden" name="id" value={row.id} />}
    <AdminField label="Réutiliser une agence existante" className="sm:col-span-2" hint="En liant une agence, son nom, sa ville, son adresse et ses contacts restent ceux de l’agence source. Les champs indépendants ci-dessous sont ignorés."><AdminSelect name="agency_id" defaultValue={row?.agency_id ?? ""}><option value="">Agence Messagerie indépendante</option>{sources.map(a => <option value={a.id} key={a.id}>{a.city_fr} — {a.agency_name_fr}{!a.is_active ? " (inactive)" : ""}</option>)}</AdminSelect></AdminField>
    {(["fr", "ar", "en"] as const).map(lang => <fieldset key={lang} dir={lang === "ar" ? "rtl" : "ltr"} className="grid gap-3 rounded-xl border border-line p-4 sm:col-span-2 sm:grid-cols-2"><legend className="px-2 text-sm font-bold">{lang.toUpperCase()}</legend>{(["name", "city", "address", "opening_hours"] as const).map(field => { const key = `${field}_${lang}` as keyof MessagerieAgency; return <AdminField key={field} label={`${{ name: "Nom", city: "Ville desservie", address: "Adresse", opening_hours: "Horaires d’ouverture" }[field]}`}><AdminInput name={key} defaultValue={String(row?.[key] ?? "")} /></AdminField>; })}</fieldset>)}
    <AdminField label="Téléphone (agence indépendante)"><AdminInput name="phone" type="tel" defaultValue={row?.phone ?? ""} /></AdminField><AdminField label="WhatsApp international (agence indépendante)"><AdminInput name="whatsapp" type="tel" defaultValue={row?.whatsapp ?? ""} /></AdminField>
    <AdminField label="Ordre d’affichage"><AdminInput name="display_order" type="number" min="0" step="1" required defaultValue={row?.display_order ?? 0} /></AdminField><AdminCheckbox name="is_active" label="Agence Messagerie active" defaultChecked={row?.is_active ?? true} />
    <SubmitButton pendingLabel="Enregistrement…">Enregistrer l’agence</SubmitButton>
  </form>;
}
export async function MessagerieNetworkManager() {
  const [network, snapshot] = await Promise.all([getMessagerieNetwork(true), getAdminSnapshot()]);
  const settings = network.settings;
  return <div className="grid gap-6"><h1 className="text-2xl font-extrabold text-primary-dark">Messagerie → Réseau & Agences</h1>
    {network.error && <p role="alert" className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">Données indisponibles. Appliquez la migration Messagerie dans Supabase SQL Editor, puis vérifiez la session administrateur.</p>}
    <AdminPanel title="Carte et présentation"><form action={saveMessagerieSettings} className="grid gap-4">
      {(["fr", "ar", "en"] as const).map(lang => <fieldset key={lang} dir={lang === "ar" ? "rtl" : "ltr"} className="grid gap-3 rounded-xl border border-line p-4"><legend className="px-2 text-sm font-bold">{lang.toUpperCase()}</legend><AdminField label="Titre"><AdminInput name={`title_${lang}`} defaultValue={settings?.[`title_${lang}`] ?? ""} /></AdminField><AdminField label="Description"><AdminTextarea name={`description_${lang}`} rows={2} defaultValue={settings?.[`description_${lang}`] ?? ""} /></AdminField></fieldset>)}
      <AdminField label="Image de la carte" hint="Choisissez une image publiée dans la médiathèque ou une URL HTTPS."><ImageAssetInput name="map_image_url" defaultValue={settings?.map_image_url ?? ""} placeholder="https://…" /></AdminField><AdminCheckbox name="is_active" label="Section visible" defaultChecked={settings?.is_active ?? true} /><SubmitButton pendingLabel="Enregistrement…">Enregistrer le réseau</SubmitButton>
    </form></AdminPanel>
    <AdminPanel title="Ajouter une agence Messagerie" description="Aucune agence voyageurs n’est ajoutée automatiquement. Les villes desservies sont celles des agences Messagerie actives."><AgencyForm sources={snapshot.agencies} /></AdminPanel>
    {network.agencies.map(row => <AdminPanel key={row.id} title={`${row.agency?.city_fr || row.city_fr || "Agence"} — ${row.is_active ? "Active" : "Inactive"}`}><details><summary className="min-h-11 text-sm font-bold text-primary">Modifier l’agence</summary><div className="pt-4"><AgencyForm row={row} sources={snapshot.agencies} /></div></details><form action={deleteMessagerieAgency} className="mt-4"><input type="hidden" name="id" value={row.id} /><DeleteButton label="Retirer du réseau" message="Retirer cette agence du réseau Messagerie ? L’agence source ne sera pas supprimée." /></form></AdminPanel>)}
    <AdminPanel title="Aperçu enregistré" description="L’aperçu reflète les données enregistrées. Une agence liée inactive n’est jamais publiée."><MessagerieNetworkSection settings={settings} agencies={network.agencies} locale="fr" error={network.error} /></AdminPanel>
  </div>;
}
