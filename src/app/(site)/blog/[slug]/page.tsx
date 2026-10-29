import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, Clock3 } from "lucide-react";
import { BlogCard } from "@/components/blog-card";
import { Badge, buttonClass, SectionHeading } from "@/components/ui";
import { getLocale } from "@/lib/locale";
import { getBlogPostBySlug, getBlogPosts } from "@/lib/queries";
import { excerptText, formatDate, pick } from "@/lib/utils";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) return { title: "Article introuvable" };
  const description = excerptText(post.excerpt_fr || post.content_fr, 160);
  return {
    title: post.title_fr,
    description,
    openGraph: {
      title: post.title_fr,
      description,
      type: "article",
      publishedTime: post.published_at ?? undefined,
      images: post.cover_image_url ? [post.cover_image_url] : undefined,
    },
  };
}

export default async function BlogArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const locale = await getLocale();
  const [post, allPosts] = await Promise.all([getBlogPostBySlug(slug), getBlogPosts(4)]);

  if (!post) notFound();

  const title = pick(locale, post.title_fr, post.title_ar, post.title_en);
  const excerpt = pick(locale, post.excerpt_fr, post.excerpt_ar, post.excerpt_en);
  const content = pick(locale, post.content_fr, post.content_ar, post.content_en);
  const related = allPosts.filter((item) => item.id !== post.id).slice(0, 3);
  const readMinutes = Math.max(2, Math.ceil(content.split(/\s+/).length / 220));

  return (
    <>
      <section className="relative overflow-hidden bg-primary-dark py-20 text-white sm:py-28">
        {post.cover_image_url ? <Image src={post.cover_image_url} alt="" fill priority sizes="100vw" className="object-cover opacity-35" /> : null}
        <div className="absolute inset-0 bg-gradient-to-b from-primary-dark/70 via-primary-dark/60 to-primary-dark/95" />
        <div className="container-page relative max-w-4xl">
          <Link href="/blog" className="inline-flex items-center gap-2 text-xs font-bold text-white/65 transition hover:text-white">
            <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
            {locale === "ar" ? "كل المقالات" : locale === "en" ? "All articles" : "Tous les articles"}
          </Link>
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <Badge tone="orange" className="bg-secondary-bright text-white">
              {locale === "ar" ? "مقال" : locale === "en" ? "Article" : "Actualité"}
            </Badge>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/60">
              <CalendarDays className="h-3.5 w-3.5" />
              {formatDate(post.published_at, locale)}
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/60">
              <Clock3 className="h-3.5 w-3.5" />
              {readMinutes} min
            </span>
          </div>
          <h1 className="mt-5 text-balance text-3xl font-extrabold leading-[1.08] tracking-[-0.04em] sm:text-5xl lg:text-6xl">{title}</h1>
          {excerpt ? <p className="mt-5 max-w-2xl text-sm leading-7 text-white/70 sm:text-base sm:leading-8">{excerpt}</p> : null}
        </div>
      </section>

      <article className="container-page py-14 sm:py-20">
        <div className="mx-auto max-w-3xl">
          <div className="article-content">
            {content.split(/\n{2,}/).map((paragraph, index) => (
              <p key={`${index}-${paragraph.slice(0, 20)}`}>{paragraph}</p>
            ))}
          </div>

          <div className="mt-10 flex flex-col gap-4 rounded-3xl border border-line bg-white p-6 shadow-soft sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-primary">
                {locale === "ar" ? "هل تحتاجون معلومات؟" : locale === "en" ? "Need more information?" : "Besoin d'informations ?"}
              </p>
              <p className="mt-1 text-sm font-bold text-ink">
                {locale === "ar" ? "فريقنا يجيبكم على مدار الأسبوع." : locale === "en" ? "Our team replies throughout the week." : "Notre équipe vous répond toute la semaine."}
              </p>
            </div>
            <Link href="/contact" className={buttonClass("primary", "md")}>
              {locale === "ar" ? "اتصل بنا" : locale === "en" ? "Contact us" : "Nous contacter"}
            </Link>
          </div>
        </div>
      </article>

      {related.length ? (
        <section className="border-t border-line bg-white py-14 sm:py-20">
          <div className="container-page">
            <SectionHeading
              eyebrow={locale === "ar" ? "اقرأ أيضاً" : locale === "en" ? "Read next" : "À lire aussi"}
              title={locale === "ar" ? "مقالات قد تعجبكم" : locale === "en" ? "More from the journal" : "D'autres articles du journal"}
              href="/blog"
              linkLabel={locale === "ar" ? "كل المقالات" : locale === "en" ? "All articles" : "Tous les articles"}
            />
            <div className="grid gap-5 md:grid-cols-3">
              {related.map((item) => (
                <BlogCard key={item.id} post={item} locale={locale} />
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
