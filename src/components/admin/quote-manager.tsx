import { updateQuoteStatus, deleteQuote } from "@/app/actions";
import { DeleteButton } from "@/components/delete-button";
import { SubmitButton } from "@/components/submit-button";
import { Badge } from "@/components/ui";
import type { CorporateQuote } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";
import { AdminEmpty, AdminField, AdminHeader, AdminPanel, AdminSelect } from "./admin-ui";

const STATUS_LABELS: Record<CorporateQuote["status"], string> = {
  pending: "En attente",
  contacted: "Contacté",
  quoted: "Devis envoyé",
  confirmed: "Confirmé",
  completed: "Terminé",
  cancelled: "Annulé",
};

const STATUS_TONES: Record<CorporateQuote["status"], "neutral" | "primary" | "orange" | "green" | "red"> = {
  pending: "orange",
  contacted: "primary",
  quoted: "primary",
  confirmed: "green",
  completed: "green",
  cancelled: "red",
};

export function QuoteManager({ quotes }: { quotes: CorporateQuote[] }) {
  const pending = quotes.filter((quote) => quote.status === "pending").length;

  return (
    <div>
      <AdminHeader
        eyebrow="B2B"
        title="Demandes de devis"
        description="Suivez les demandes de transport du personnel et de tourisme. Ces données contiennent des informations personnelles et ne sont visibles que par les admins."
        action={<Badge tone={pending ? "orange" : "neutral"}>{pending} en attente</Badge>}
      />
      <AdminPanel title={`${quotes.length} demande${quotes.length > 1 ? "s" : ""}`} description="Mettez à jour le statut après chaque échange avec le client.">
        {quotes.length ? (
          <div className="grid gap-4">
            {quotes.map((quote) => (
              <article key={quote.id} className="rounded-2xl border border-line bg-background p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-extrabold text-ink">{quote.company_name}</h3>
                      <Badge tone={STATUS_TONES[quote.status]}>{STATUS_LABELS[quote.status]}</Badge>
                      <Badge tone="neutral">{quote.service_type === "personnel" ? "Personnel" : "Tourisme"}</Badge>
                    </div>
                    <p className="mt-1 text-[11px] text-muted">
                      {quote.contact_person} · {quote.phone} · {quote.email}
                    </p>
                    <p className="mt-1 text-[11px] text-muted">
                      {quote.origin_city} → {quote.destination_city} · {quote.passenger_count} passagers · {formatDateTime(quote.created_at)}
                    </p>
                    {quote.details ? <p className="mt-2 max-w-3xl text-xs leading-6 text-muted">{quote.details}</p> : null}
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap items-end gap-2 border-t border-line pt-4">
                  <form action={updateQuoteStatus} className="flex items-end gap-2">
                    <input type="hidden" name="id" value={quote.id} />
                    <AdminField label="Statut">
                      <AdminSelect name="status" defaultValue={quote.status} className="min-w-40">
                        {Object.entries(STATUS_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                      </AdminSelect>
                    </AdminField>
                    <SubmitButton pendingLabel="..." className="px-3 py-2 text-xs">Mettre à jour</SubmitButton>
                  </form>
                  <form action={deleteQuote}>
                    <input type="hidden" name="id" value={quote.id} />
                    <DeleteButton label="Supprimer" message={`Supprimer la demande de ${quote.company_name} ?`} />
                  </form>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <AdminEmpty title="Aucune demande" description="Les demandes envoyées depuis la page Services apparaîtront ici." />
        )}
      </AdminPanel>
    </div>
  );
}
