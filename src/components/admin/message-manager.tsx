import { updateContactStatus, deleteContactMessage } from "@/app/actions";
import { DeleteButton } from "@/components/delete-button";
import { SubmitButton } from "@/components/submit-button";
import { Badge } from "@/components/ui";
import type { ContactMessage } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";
import { AdminEmpty, AdminField, AdminHeader, AdminPanel, AdminSelect } from "./admin-ui";

const STATUS_LABELS: Record<ContactMessage["status"], string> = {
  new: "Nouveau",
  read: "Lu",
  replied: "Répondu",
  archived: "Archivé",
};

const STATUS_TONES: Record<ContactMessage["status"], "orange" | "primary" | "green" | "neutral"> = {
  new: "orange",
  read: "primary",
  replied: "green",
  archived: "neutral",
};

export function MessageManager({ messages }: { messages: ContactMessage[] }) {
  const unread = messages.filter((message) => message.status === "new").length;

  return (
    <div>
      <AdminHeader
        eyebrow="Support"
        title="Messages de contact"
        description="Traitez les messages envoyés depuis la page Contact. Les données personnelles sont protégées par RLS."
        action={<Badge tone={unread ? "orange" : "neutral"}>{unread} nouveau{unread > 1 ? "x" : ""}</Badge>}
      />
      <AdminPanel title={`${messages.length} message${messages.length > 1 ? "s" : ""}`}>
        {messages.length ? (
          <div className="grid gap-4">
            {messages.map((message) => (
              <article key={message.id} className="rounded-2xl border border-line bg-background p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-extrabold text-ink">{message.subject}</h3>
                      <Badge tone={STATUS_TONES[message.status]}>{STATUS_LABELS[message.status]}</Badge>
                    </div>
                    <p className="mt-1 text-[11px] text-muted">
                      {message.full_name} · {message.email}{message.phone ? ` · ${message.phone}` : ""} · {formatDateTime(message.created_at)}
                    </p>
                    <p className="mt-3 max-w-3xl whitespace-pre-line text-xs leading-6 text-ink">{message.message}</p>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap items-end gap-2 border-t border-line pt-4">
                  <form action={updateContactStatus} className="flex items-end gap-2">
                    <input type="hidden" name="id" value={message.id} />
                    <AdminField label="Statut">
                      <AdminSelect name="status" defaultValue={message.status} className="min-w-36">
                        {Object.entries(STATUS_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                      </AdminSelect>
                    </AdminField>
                    <SubmitButton pendingLabel="..." className="px-3 py-2 text-xs">Mettre à jour</SubmitButton>
                  </form>
                  <form action={deleteContactMessage}>
                    <input type="hidden" name="id" value={message.id} />
                    <DeleteButton label="Supprimer" message={`Supprimer le message de ${message.full_name} ?`} />
                  </form>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <AdminEmpty title="Aucun message" description="Les messages envoyés depuis la page Contact apparaîtront ici." />
        )}
      </AdminPanel>
    </div>
  );
}
