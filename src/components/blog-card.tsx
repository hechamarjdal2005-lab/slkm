import Image from "@/components/site-image";
import Link from "next/link";
import { ArrowUpRight, CalendarDays } from "lucide-react";
import type { BlogPost, Locale } from "@/lib/types";
import { excerptText, formatDate, pick } from "@/lib/utils";
import { Badge } from "./ui";

export function BlogCard({ post, locale, featured = false }: { post: BlogPost; locale: Locale; featured?: boolean }) {
  const title = pick(locale, post.title_fr, post.title_ar, post.title_en);
  const excerpt = pick(locale, post.excerpt_fr, post.excerpt_ar, post.excerpt_en);

  return (
    <article className={`journal-card group overflow-hidden rounded-3xl border border-line bg-white shadow-soft transition motion-safe:hover:-translate-y-0.5 hover:shadow-lift ${featured ? "lg:grid lg:grid-cols-2" : ""}`}>
      <Link href={`/blog/${post.slug}`} className={`relative block overflow-hidden bg-surface-muted ${featured ? "aspect-[16/9] lg:aspect-auto lg:min-h-72" : "aspect-[16/9]"}`}>
        {post.cover_image_url ? (
          <Image
            src={post.cover_image_url}
            alt={title}
            fill
            sizes={featured ? "(max-width: 1024px) 100vw, 50vw" : "(max-width: 768px) 100vw, 33vw"}
            className="object-cover transition duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-primary to-primary-dark" />
        )}
        <span className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/40 to-transparent" />
        <Badge tone="orange" className="absolute start-4 top-4 bg-white/95">
          {locale === "ar" ? "مقال" : locale === "en" ? "Article" : "Actualité"}
        </Badge>
      </Link>
      <div className={`journal-card-body flex flex-col p-5 sm:p-6 ${featured ? "lg:justify-center lg:p-7" : ""}`}>
        <p className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.1em] text-muted">
          <CalendarDays className="h-3.5 w-3.5 text-primary" />
          {formatDate(post.published_at, locale)}
        </p>
        <h3 className={`mt-3 text-balance font-extrabold tracking-[-0.03em] text-ink ${featured ? "text-[22px] lg:text-[27px]" : "text-[17px]"}`}>
          <Link href={`/blog/${post.slug}`} className="transition hover:text-primary">
            {title}
          </Link>
        </h3>
        {excerpt ? <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted">{excerptText(excerpt, featured ? 220 : 140)}</p> : null}
        <Link href={`/blog/${post.slug}`} className="mt-4 inline-flex min-h-11 items-center gap-1.5 text-xs font-extrabold text-primary">
          {locale === "ar" ? "اقرأ المزيد" : locale === "en" ? "Read article" : "Lire l'article"}
          <ArrowUpRight className="h-4 w-4 rtl:-scale-x-100" />
        </Link>
      </div>
    </article>
  );
}
