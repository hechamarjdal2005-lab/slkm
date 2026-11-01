import { MessagerieNetworkManager } from "@/components/admin/messagerie-network-manager";
import { CMSWorkspace } from "@/components/admin/cms-workspace";
import Link from "next/link";
import { AlertCircle, ArrowRight, CheckCircle2, Database, MessageSquareQuote } from "lucide-react";
import { AgencyManager } from "@/components/admin/agency-manager";
import { SettingsManager } from "@/components/admin/settings-manager";
import { BlogManager } from "@/components/admin/blog-manager";
import { MessageManager } from "@/components/admin/message-manager";
import { QuoteManager } from "@/components/admin/quote-manager";
import { RateManager } from "@/components/admin/rate-manager";
import { RouteManager } from "@/components/admin/route-manager";
import { AdminEmpty, AdminHeader, AdminPanel, AdminStat } from "@/components/admin/admin-ui";
import { Badge, buttonClass } from "@/components/ui";
import { getAdminSnapshot } from "@/lib/queries";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { formatDateTime } from "@/lib/utils";

const TABS = ["overview", "agencies", "routes", "rates", "quotes", "messages", "blog", "settings", "messagerie", "cms", "design", "media"];

const QUOTE_STATUS: Record<string, string> = {
  pending: "En attente",
  contacted: "Contacté",
  quoted: "Devis envoyé",
  confirmed: "Confirmé",
  completed: "Terminé",
  cancelled: "Annulé",
};

const MESSAGE_STATUS: Record<string, string> = {
  new: "Nouveau",
  read: "Lu",
  replied: "Répondu",
  archived: "Archivé",
};

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; error?: string; success?: string }>;
}) {
  const params = await searchParams;
  const tab = params.tab && TABS.includes(params.tab) ? params.tab : "overview";
  if (tab === "cms" || tab === "design" || tab === "media") return <CMSWorkspace mode={tab} />;
  const snapshot = await getAdminSnapshot();
  const configured = isSupabaseConfigured();
  const pendingQuotes = snapshot.quotes.filter((quote) => quote.status === "pending");
  const unreadMessages = snapshot.messages.filter((message) => message.status === "new");

  return (
    <div>
      {snapshot.error && <p role="alert" className="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">{snapshot.error}</p>}
      {tab === "messagerie" && <MessagerieNetworkManager />}
      {tab === "settings" && <SettingsManager settings={snapshot.settings} />}
      {!configured ? (
        <div className="mb-5 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <Database className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <p className="font-extrabold">Supabase n'est pas configuré</p>
            <p className="mt-1 text-xs leading-5">
              Renseignez <code className="rounded bg-white/70 px-1">NEXT_PUBLIC_SUPABASE_URL</code> et{" "}
              <code className="rounded bg-white/70 px-1">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> dans <code className="rounded bg-white/70 px-1">.env.local</code>, puis redémarrez le serveur.
            </p>
          </div>
        </div>
      ) : null}

      {params.error ? (
        <div className="mb-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-danger">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <p className="leading-6">{params.error}</p>
        </div>
      ) : null}

      {params.success ? (
        <div className="mb-5 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-success">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          <p className="leading-6">{params.success}</p>
        </div>
      ) : null}

      {tab === "agencies" ? <AgencyManager agencies={snapshot.agencies} /> : null}
      {tab === "routes" ? <RouteManager routes={snapshot.routes} agencies={snapshot.agencies} /> : null}
      {tab === "rates" ? <RateManager rates={snapshot.rates} /> : null}
      {tab === "quotes" ? <QuoteManager quotes={snapshot.quotes} /> : null}
      {tab === "messages" ? <MessageManager messages={snapshot.messages} /> : null}
      {tab === "blog" ? <BlogManager posts={snapshot.posts} /> : null}

      {tab === "overview" ? (
        <div>
          <AdminHeader
            eyebrow="Pilotage"
            title="Vue d'ensemble"
            description="Les données publiques du site sont alimentées directement par Supabase. Les actions d'écriture nécessitent un compte admin."
            action={
              <Link href="/" className={buttonClass("ghost", "sm")}>
                Voir le site
                <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
              </Link>
            }
          />

          <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
            <AdminStat label="Agences" value={snapshot.agencies.length} />
            <AdminStat label="Lignes" value={snapshot.routes.length} />
            <AdminStat label="Tarifs" value={snapshot.rates.length} />
            <AdminStat label="Articles" value={snapshot.posts.length} />
            <AdminStat label="Devis en attente" value={pendingQuotes.length} tone="orange" />
            <AdminStat label="Messages neufs" value={unreadMessages.length} tone={unreadMessages.length ? "red" : "green"} />
          </div>

          <div className="grid gap-5 xl:grid-cols-2">
            <AdminPanel
              title="Dernières demandes B2B"
              description="Les cinq demandes les plus récentes."
              action={<Link href="/admin?tab=quotes" className="text-xs font-extrabold text-primary">Tout voir</Link>}
            >
              {snapshot.quotes.length ? (
                <div className="grid gap-3">
                  {snapshot.quotes.slice(0, 5).map((quote) => (
                    <div key={quote.id} className="rounded-xl border border-line bg-background p-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-xs font-extrabold text-ink">{quote.company_name}</p>
                        <Badge tone={quote.status === "pending" ? "orange" : "primary"}>{QUOTE_STATUS[quote.status] ?? quote.status}</Badge>
                      </div>
                      <p className="mt-1 text-[11px] text-muted">
                        {quote.origin_city} → {quote.destination_city} · {quote.passenger_count} pax · {formatDateTime(quote.created_at)}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <AdminEmpty title="Aucune demande" description="Les demandes de devis envoyées depuis la page Services apparaîtront ici." />
              )}
            </AdminPanel>

            <AdminPanel
              title="Derniers messages"
              description="Les cinq messages de contact les plus récents."
              action={<Link href="/admin?tab=messages" className="text-xs font-extrabold text-primary">Tout voir</Link>}
            >
              {snapshot.messages.length ? (
                <div className="grid gap-3">
                  {snapshot.messages.slice(0, 5).map((message) => (
                    <div key={message.id} className="rounded-xl border border-line bg-background p-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-xs font-extrabold text-ink">{message.subject}</p>
                        <Badge tone={message.status === "new" ? "orange" : "neutral"}>{MESSAGE_STATUS[message.status] ?? message.status}</Badge>
                      </div>
                      <p className="mt-1 text-[11px] text-muted">{message.full_name} · {message.email} · {formatDateTime(message.created_at)}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <AdminEmpty title="Aucun message" description="Les messages envoyés depuis la page Contact apparaîtront ici." />
              )}
            </AdminPanel>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <Link href="/admin?tab=routes" className="rounded-2xl border border-line bg-white p-5 shadow-soft transition hover:border-primary/30 hover:shadow-lift">
              <MessageSquareQuote className="h-5 w-5 text-primary" />
              <p className="mt-3 text-sm font-extrabold text-ink">Publier une ligne</p>
              <p className="mt-1 text-xs leading-5 text-muted">Ajoutez un horaire, un tarif et les jours de circulation.</p>
            </Link>
            <Link href="/admin?tab=blog" className="rounded-2xl border border-line bg-white p-5 shadow-soft transition hover:border-primary/30 hover:shadow-lift">
              <MessageSquareQuote className="h-5 w-5 text-secondary" />
              <p className="mt-3 text-sm font-extrabold text-ink">Écrire un article</p>
              <p className="mt-1 text-xs leading-5 text-muted">Publiez une actualité trilingue sur le blog.</p>
            </Link>
            <Link href="/admin?tab=rates" className="rounded-2xl border border-line bg-white p-5 shadow-soft transition hover:border-primary/30 hover:shadow-lift">
              <MessageSquareQuote className="h-5 w-5 text-success" />
              <p className="mt-3 text-sm font-extrabold text-ink">Mettre à jour Irsaliyat</p>
              <p className="mt-1 text-xs leading-5 text-muted">Ajustez les paliers de poids et les tarifs colis.</p>
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
