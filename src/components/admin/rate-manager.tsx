import { Pencil, Plus } from "lucide-react";
import { upsertParcelRate, deleteParcelRate } from "@/app/actions";
import { DeleteButton } from "@/components/delete-button";
import { SubmitButton } from "@/components/submit-button";
import type { ParcelRate } from "@/lib/types";
import { formatMad, formatWeight } from "@/lib/utils";
import { AdminEmpty, AdminField, AdminHeader, AdminInput, AdminPanel, AdminTextarea } from "./admin-ui";

function RateForm({ rate }: { rate?: ParcelRate }) {
  return (
    <form action={upsertParcelRate} className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {rate ? <input type="hidden" name="id" value={rate.id} /> : null}
      <AdminField label="Catégorie (FR)"><AdminInput name="category_fr" required defaultValue={rate?.category_fr} /></AdminField>
      <AdminField label="Catégorie (AR)"><AdminInput name="category_ar" required defaultValue={rate?.category_ar} dir="rtl" /></AdminField>
      <AdminField label="Catégorie (EN)"><AdminInput name="category_en" required defaultValue={rate?.category_en} /></AdminField>
      <AdminField label="Poids maximum (kg)"><AdminInput name="max_weight_kg" type="number" step="0.01" min="0.01" required defaultValue={rate?.max_weight_kg ?? ""} /></AdminField>
      <AdminField label="Tarif de base (MAD)"><AdminInput name="base_price_mad" type="number" step="0.01" min="0" required defaultValue={rate?.base_price_mad ?? ""} /></AdminField>
      <div className="hidden xl:block" />
      <AdminField label="Description (FR)" className="sm:col-span-2 xl:col-span-3"><AdminTextarea name="description_fr" rows={2} defaultValue={rate?.description_fr ?? ""} /></AdminField>
      <AdminField label="Description (AR)" className="sm:col-span-2 xl:col-span-3"><AdminTextarea name="description_ar" rows={2} defaultValue={rate?.description_ar ?? ""} dir="rtl" /></AdminField>
      <AdminField label="Description (EN)" className="sm:col-span-2 xl:col-span-3"><AdminTextarea name="description_en" rows={2} defaultValue={rate?.description_en ?? ""} /></AdminField>
      <div className="flex items-end justify-end sm:col-span-2 xl:col-span-3">
        <SubmitButton pendingLabel="Enregistrement...">{rate ? "Mettre à jour" : "Créer le tarif"}</SubmitButton>
      </div>
    </form>
  );
}

export function RateManager({ rates }: { rates: ParcelRate[] }) {
  return (
    <div>
      <AdminHeader
        eyebrow="Irsaliyat"
        title="Tarifs colis"
        description="Définissez les paliers de poids et les tarifs de base affichés sur la page Irsaliyat."
      />
      <div className="mb-5">
        <details className="rounded-2xl border border-line bg-white shadow-soft">
          <summary className="flex items-center gap-2 px-5 py-4 text-sm font-extrabold text-primary">
            <Plus className="h-4 w-4" />
            Nouveau tarif
          </summary>
          <div className="border-t border-line p-5">
            <RateForm />
          </div>
        </details>
      </div>

      <AdminPanel title={`${rates.length} tarif${rates.length > 1 ? "s" : ""}`}>
        {rates.length ? (
          <div className="grid gap-3">
            {rates.map((rate) => (
              <article key={rate.id} className="rounded-2xl border border-line bg-background p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-extrabold text-ink">{rate.category_fr}</h3>
                    <p className="mt-1 text-[11px] text-muted">Jusqu'à {formatWeight(rate.max_weight_kg)} · {formatMad(rate.base_price_mad)}</p>
                    {rate.description_fr ? <p className="mt-2 max-w-2xl text-[11px] leading-5 text-muted">{rate.description_fr}</p> : null}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <details>
                      <summary className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-white px-3 py-2 text-xs font-bold text-ink transition hover:border-primary/40 hover:text-primary">
                        <Pencil className="h-3.5 w-3.5" />
                        Modifier
                      </summary>
                      <div className="mt-3 rounded-2xl border border-line bg-white p-4">
                        <RateForm rate={rate} />
                      </div>
                    </details>
                    <form action={deleteParcelRate}>
                      <input type="hidden" name="id" value={rate.id} />
                      <DeleteButton label="Supprimer" message={`Supprimer le tarif ${rate.category_fr} ?`} />
                    </form>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <AdminEmpty title="Aucun tarif" description="Ajoutez les paliers de poids pour afficher la grille Irsaliyat." />
        )}
      </AdminPanel>
    </div>
  );
}
