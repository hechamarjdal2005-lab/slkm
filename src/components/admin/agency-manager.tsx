import { ImageAssetInput } from "./image-asset-input";
import { Pencil, Plus } from "lucide-react";
import { upsertAgency, deleteAgency } from "@/app/actions";
import { DeleteButton } from "@/components/delete-button";
import { SubmitButton } from "@/components/submit-button";
import { Badge } from "@/components/ui";
import type { Agency } from "@/lib/types";
import { AdminCheckbox, AdminEmpty, AdminField, AdminHeader, AdminInput, AdminPanel } from "./admin-ui";

function AgencyForm({ agency }: { agency?: Agency }) {
  return (
    <form action={upsertAgency} className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <AdminField label="Ordre d’affichage"><AdminInput name="sort_order" type="number" min="0" max="10000" step="1" required defaultValue={agency?.sort_order ?? 0} /></AdminField>
      {agency ? <input type="hidden" name="id" value={agency.id} /> : null}
      <AdminField label="Ville (FR)"><AdminInput name="city_fr" required defaultValue={agency?.city_fr} /></AdminField>
      <AdminField label="Ville (AR)"><AdminInput name="city_ar" required defaultValue={agency?.city_ar} dir="rtl" /></AdminField>
      <AdminField label="Ville (EN)"><AdminInput name="city_en" required defaultValue={agency?.city_en} /></AdminField>
      <AdminField label="Nom d'agence (FR)"><AdminInput name="agency_name_fr" required defaultValue={agency?.agency_name_fr} /></AdminField>
      <AdminField label="Nom d'agence (AR)"><AdminInput name="agency_name_ar" required defaultValue={agency?.agency_name_ar} dir="rtl" /></AdminField>
      <AdminField label="Nom d'agence (EN)"><AdminInput name="agency_name_en" required defaultValue={agency?.agency_name_en} /></AdminField>
      <AdminField label="Adresse (FR)" className="sm:col-span-2 xl:col-span-3"><AdminInput name="address_fr" required defaultValue={agency?.address_fr} /></AdminField>
      <AdminField label="Adresse (AR)" className="sm:col-span-2 xl:col-span-3"><AdminInput name="address_ar" required defaultValue={agency?.address_ar} dir="rtl" /></AdminField>
      <AdminField label="Adresse (EN)" className="sm:col-span-2 xl:col-span-3"><AdminInput name="address_en" required defaultValue={agency?.address_en} /></AdminField>
      <AdminField label="Téléphone"><AdminInput name="phone_number" defaultValue={agency?.phone_number ?? ""} /></AdminField>
      <AdminField label="WhatsApp"><AdminInput name="whatsapp_number" defaultValue={agency?.whatsapp_number ?? ""} /></AdminField>
      <AdminField label="Image (URL)"><ImageAssetInput name="image_url" defaultValue={agency?.image_url ?? ""} placeholder="/images/agencies/..." /></AdminField>
      <AdminField label="Latitude"><AdminInput name="lat" type="number" step="0.0000001" defaultValue={agency?.lat ?? ""} /></AdminField>
      <AdminField label="Longitude"><AdminInput name="lng" type="number" step="0.0000001" defaultValue={agency?.lng ?? ""} /></AdminField>
      <div className="flex items-end gap-2">
        <AdminCheckbox name="is_active" label="Agence active" defaultChecked={agency?.is_active ?? true} />
      </div>
      <div className="flex items-end justify-end sm:col-span-2 xl:col-span-3">
        <SubmitButton pendingLabel="Enregistrement...">{agency ? "Mettre à jour" : "Créer l'agence"}</SubmitButton>
      </div>
    </form>
  );
}

export function AgencyManager({ agencies }: { agencies: Agency[] }) {
  return (
    <div>
      <AdminHeader
        eyebrow="Réseau"
        title="Agences"
        description="Gérez les comptoirs, leurs coordonnées bilingues, leurs numéros et leur position sur la carte."
      />
      <div className="mb-5">
        <details className="rounded-2xl border border-line bg-white shadow-soft">
          <summary className="flex items-center gap-2 px-5 py-4 text-sm font-extrabold text-primary">
            <Plus className="h-4 w-4" />
            Nouvelle agence
          </summary>
          <div className="border-t border-line p-5">
            <AgencyForm />
          </div>
        </details>
      </div>

      <AdminPanel title={`${agencies.length} agence${agencies.length > 1 ? "s" : ""}`} description="Les agences inactives restent visibles ici mais disparaissent du site public.">
        {agencies.length ? (
          <div className="grid gap-3">
            {agencies.map((agency) => (
              <article key={agency.id} className="rounded-2xl border border-line bg-background p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-extrabold text-ink">{agency.city_fr}</h3>
                      <Badge tone={agency.is_active ? "green" : "neutral"}>{agency.is_active ? "Active" : "Inactive"}</Badge>
                    </div>
                    <p className="mt-1 truncate text-xs text-muted">{agency.agency_name_fr}</p>
                    <p className="mt-0.5 truncate text-[11px] text-muted">{agency.address_fr}</p>
                    <p className="mt-2 text-[11px] text-muted">
                      {agency.phone_number ?? "—"} · {agency.whatsapp_number ?? "—"} · {agency.lat !== null && agency.lng !== null ? `${agency.lat}, ${agency.lng}` : "Coordonnées manquantes"}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <details>
                      <summary className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-white px-3 py-2 text-xs font-bold text-ink transition hover:border-primary/40 hover:text-primary">
                        <Pencil className="h-3.5 w-3.5" />
                        Modifier
                      </summary>
                      <div className="mt-3 rounded-2xl border border-line bg-white p-4">
                        <AgencyForm agency={agency} />
                      </div>
                    </details>
                    <form action={deleteAgency}>
                      <input type="hidden" name="id" value={agency.id} />
                      <DeleteButton label="Supprimer" message={`Supprimer l'agence ${agency.city_fr} ?`} />
                    </form>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <AdminEmpty title="Aucune agence" description="Créez la première agence pour alimenter les pages publiques et la carte." />
        )}
      </AdminPanel>
    </div>
  );
}
