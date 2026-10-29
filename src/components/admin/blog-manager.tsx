import { Pencil, Plus } from "lucide-react";
import { upsertBlogPost, deleteBlogPost } from "@/app/actions";
import { DeleteButton } from "@/components/delete-button";
import { SubmitButton } from "@/components/submit-button";
import { Badge } from "@/components/ui";
import type { BlogPost } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { AdminCheckbox, AdminEmpty, AdminField, AdminHeader, AdminInput, AdminPanel, AdminTextarea } from "./admin-ui";

function dateInput(value: string | null) {
  return value ? value.slice(0, 16) : "";
}

function BlogForm({ post }: { post?: BlogPost }) {
  return (
    <form action={upsertBlogPost} className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {post ? <input type="hidden" name="id" value={post.id} /> : null}
      <AdminField label="Slug" hint="minuscules, chiffres et tirets" className="sm:col-span-2 xl:col-span-2"><AdminInput name="slug" required defaultValue={post?.slug} placeholder="mon-article-2026" /></AdminField>
      <AdminField label="Image de couverture"><AdminInput name="cover_image_url" defaultValue={post?.cover_image_url ?? ""} placeholder="/images/blog/..." /></AdminField>
      <AdminField label="Titre (FR)"><AdminInput name="title_fr" required defaultValue={post?.title_fr} /></AdminField>
      <AdminField label="Titre (AR)"><AdminInput name="title_ar" required defaultValue={post?.title_ar} dir="rtl" /></AdminField>
      <AdminField label="Titre (EN)"><AdminInput name="title_en" required defaultValue={post?.title_en} /></AdminField>
      <AdminField label="Chapeau (FR)"><AdminTextarea name="excerpt_fr" rows={2} defaultValue={post?.excerpt_fr ?? ""} /></AdminField>
      <AdminField label="Chapeau (AR)"><AdminTextarea name="excerpt_ar" rows={2} defaultValue={post?.excerpt_ar ?? ""} dir="rtl" /></AdminField>
      <AdminField label="Chapeau (EN)"><AdminTextarea name="excerpt_en" rows={2} defaultValue={post?.excerpt_en ?? ""} /></AdminField>
      <AdminField label="Contenu (FR)" className="sm:col-span-2 xl:col-span-3"><AdminTextarea name="content_fr" rows={6} required defaultValue={post?.content_fr} /></AdminField>
      <AdminField label="Contenu (AR)" className="sm:col-span-2 xl:col-span-3"><AdminTextarea name="content_ar" rows={6} required defaultValue={post?.content_ar} dir="rtl" /></AdminField>
      <AdminField label="Contenu (EN)" className="sm:col-span-2 xl:col-span-3"><AdminTextarea name="content_en" rows={6} required defaultValue={post?.content_en} /></AdminField>
      <AdminField label="Publication"><AdminInput name="published_at" type="datetime-local" defaultValue={dateInput(post?.published_at ?? null)} /></AdminField>
      <div className="flex items-end">
        <AdminCheckbox name="is_published" label="Publier l'article" defaultChecked={post?.is_published ?? false} />
      </div>
      <div className="flex items-end justify-end">
        <SubmitButton pendingLabel="Enregistrement...">{post ? "Mettre à jour" : "Créer l'article"}</SubmitButton>
      </div>
    </form>
  );
}

export function BlogManager({ posts }: { posts: BlogPost[] }) {
  const published = posts.filter((post) => post.is_published).length;

  return (
    <div>
      <AdminHeader
        eyebrow="Contenu"
        title="Articles du blog"
        description="Rédigez les actualités en trois langues, choisissez une image et publiez quand vous êtes prêt."
        action={<Badge tone={published ? "green" : "neutral"}>{published} publié{published > 1 ? "s" : ""}</Badge>}
      />
      <div className="mb-5">
        <details className="rounded-2xl border border-line bg-white shadow-soft">
          <summary className="flex items-center gap-2 px-5 py-4 text-sm font-extrabold text-primary">
            <Plus className="h-4 w-4" />
            Nouvel article
          </summary>
          <div className="border-t border-line p-5">
            <BlogForm />
          </div>
        </details>
      </div>

      <AdminPanel title={`${posts.length} article${posts.length > 1 ? "s" : ""}`}>
        {posts.length ? (
          <div className="grid gap-3">
            {posts.map((post) => (
              <article key={post.id} className="rounded-2xl border border-line bg-background p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-extrabold text-ink">{post.title_fr}</h3>
                      <Badge tone={post.is_published ? "green" : "neutral"}>{post.is_published ? "Publié" : "Brouillon"}</Badge>
                    </div>
                    <p className="mt-1 truncate text-[11px] text-muted">/{post.slug}</p>
                    <p className="mt-1 text-[11px] text-muted">
                      {post.published_at ? formatDate(post.published_at, "fr") : "Non programmé"} · {post.title_ar}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <details>
                      <summary className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-white px-3 py-2 text-xs font-bold text-ink transition hover:border-primary/40 hover:text-primary">
                        <Pencil className="h-3.5 w-3.5" />
                        Modifier
                      </summary>
                      <div className="mt-3 rounded-2xl border border-line bg-white p-4">
                        <BlogForm post={post} />
                      </div>
                    </details>
                    <form action={deleteBlogPost}>
                      <input type="hidden" name="id" value={post.id} />
                      <DeleteButton label="Supprimer" message={`Supprimer l'article « ${post.title_fr} » ?`} />
                    </form>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <AdminEmpty title="Aucun article" description="Créez votre premier article pour alimenter la page Actualités." />
        )}
      </AdminPanel>
    </div>
  );
}
