import { Pencil, Plus } from "lucide-react";
import { upsertRoute, deleteRoute } from "@/app/actions";
import { DeleteButton } from "@/components/delete-button";
import { SubmitButton } from "@/components/submit-button";
import { Badge } from "@/components/ui";
import type { Agency, Route } from "@/lib/types";
import { DAY_KEYS, daysLabel, formatMad, formatTime } from "@/lib/utils";
import { AdminCheckbox, AdminEmpty, AdminField, AdminHeader, AdminInput, AdminPanel, AdminSelect } from "./admin-ui";

const DAY_LABELS: Record<string, string> = { MON: "Lun", TUE: "Mar", WED: "Mer", THU: "Jeu", FRI: "Ven", SAT: "Sam", SUN: "Dim" };

function RouteForm({ route, agencies }: { route?: Route; agencies: Agency[] }) {
  return (
    <form action={upsertRoute} className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <AdminField label="Ordre d’affichage"><AdminInput name="sort_order" type="number" min="0" max="10000" step="1" required defaultValue={route?.sort_order ?? 0} /></AdminField>
      {route ? <input type="hidden" name="id" value={route.id} /> : null}
      <AdminField label="Agence de départ">
        <AdminSelect name="from_agency_id" required defaultValue={route?.from_agency_id ?? ""}>
          <option value="" disabled>Sélectionner</option>
          {agencies.map((agency) => <option key={agency.id} value={agency.id}>{agency.city_fr} — {agency.agency_name_fr}</option>)}
        </AdminSelect>
      </AdminField>
      <AdminField label="Agence d'arrivée">
        <AdminSelect name="to_agency_id" required defaultValue={route?.to_agency_id ?? ""}>
          <option value="" disabled>Sélectionner</option>
          {agencies.map((agency) => <option key={agency.id} value={agency.id}>{agency.city_fr} — {agency.agency_name_fr}</option>)}
        </AdminSelect>
      </AdminField>
      <AdminField label="Classe">
        <AdminSelect name="bus_type" defaultValue={route?.bus_type ?? "Comfort"}>
          <option value="Comfort">Comfort</option>
          <option value="Premium">Premium</option>
          <option value="VIP">VIP</option>
        </AdminSelect>
      </AdminField>
      <AdminField label="Départ"><AdminInput name="departure_time" type="time" required defaultValue={route ? formatTime(route.departure_time) : undefined} /></AdminField>
      <AdminField label="Arrivée"><AdminInput name="arrival_time" type="time" required defaultValue={route ? formatTime(route.arrival_time) : undefined} /></AdminField>
      <AdminField label="Prix (MAD)"><AdminInput name="price_mad" type="number" step="0.01" min="0" required defaultValue={route?.price_mad ?? ""} /></AdminField>
      <div className="sm:col-span-2 xl:col-span-3">
        <span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.12em] text-muted">Jours de circulation</span>
        <div className="flex flex-wrap gap-2">
          {DAY_KEYS.map((day) => (
            <AdminCheckbox key={day} name="days_of_week" value={day} label={DAY_LABELS[day]} defaultChecked={route?.days_of_week.includes(day) ?? false} />
          ))}
        </div>
      </div>
      <div className="flex flex-wrap items-end gap-2 sm:col-span-2 xl:col-span-3">
        <AdminCheckbox name="is_tourist_route" label="Ligne touristique" defaultChecked={route?.is_tourist_route ?? false} />
        <AdminCheckbox name="is_active" label="Ligne active" defaultChecked={route?.is_active ?? true} />
        <div className="ms-auto">
          <SubmitButton pendingLabel="Enregistrement...">{route ? "Mettre à jour" : "Créer la ligne"}</SubmitButton>
        </div>
      </div>
    </form>
  );
}

export function RouteManager({ routes, agencies }: { routes: Route[]; agencies: Agency[] }) {
  const byId = new Map(agencies.map((agency) => [agency.id, agency]));

  return (
    <div>
      <AdminHeader
        eyebrow="Exploitation"
        title="Lignes & horaires"
        description="Publiez les liaisons, les horaires, les tarifs et les jours de circulation. Une ligne inactive disparaît immédiatement du site."
      />
      {agencies.length >= 2 ? (
        <div className="mb-5">
          <details className="rounded-2xl border border-line bg-white shadow-soft">
            <summary className="flex items-center gap-2 px-5 py-4 text-sm font-extrabold text-primary">
              <Plus className="h-4 w-4" />
              Nouvelle ligne
            </summary>
            <div className="border-t border-line p-5">
              <RouteForm agencies={agencies} />
            </div>
          </details>
        </div>
      ) : (
        <div className="mb-5 rounded-2xl border border-dashed border-line bg-white p-5 text-sm text-muted">
          Créez au moins deux agences avant d'ajouter une ligne.
        </div>
      )}

      <AdminPanel title={`${routes.length} ligne${routes.length > 1 ? "s" : ""}`} description="Les horaires sont affichés en heure locale.">
        {routes.length ? (
          <div className="grid gap-3">
            {routes.map((route) => {
              const from = byId.get(route.from_agency_id);
              const to = byId.get(route.to_agency_id);
              return (
                <article key={route.id} className="rounded-2xl border border-line bg-background p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-extrabold text-ink">{from?.city_fr ?? "—"} → {to?.city_fr ?? "—"}</h3>
                        <Badge tone={route.is_active ? "green" : "neutral"}>{route.is_active ? "Active" : "Inactive"}</Badge>
                        <Badge tone={route.bus_type === "VIP" ? "orange" : "primary"}>{route.bus_type}</Badge>
                        {route.is_tourist_route ? <Badge tone="green">Touristique</Badge> : null}
                      </div>
                      <p className="mt-2 text-[11px] text-muted">
                        {formatTime(route.departure_time)} → {formatTime(route.arrival_time)} · {formatMad(route.price_mad)} · {daysLabel(route.days_of_week, "fr")}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <details>
                        <summary className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-white px-3 py-2 text-xs font-bold text-ink transition hover:border-primary/40 hover:text-primary">
                          <Pencil className="h-3.5 w-3.5" />
                          Modifier
                        </summary>
                        <div className="mt-3 rounded-2xl border border-line bg-white p-4">
                          <RouteForm route={route} agencies={agencies} />
                        </div>
                      </details>
                      <form action={deleteRoute}>
                        <input type="hidden" name="id" value={route.id} />
                        <DeleteButton label="Supprimer" message={`Supprimer la ligne ${from?.city_fr ?? ""} → ${to?.city_fr ?? ""} ?`} />
                      </form>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <AdminEmpty title="Aucune ligne" description="Créez votre première liaison pour alimenter la recherche et la page Lignes." />
        )}
      </AdminPanel>
    </div>
  );
}
