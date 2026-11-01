import { createTranslator, cmsImage, cmsLink } from "@/lib/cms";
import { getPageCMS, getCMSMetadata } from "@/lib/cms-store";
import { CmsPage, CmsBuiltin } from "@/components/cms-page";
import type { Metadata } from "next";
import Image from "@/components/site-image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, Clock3 } from "lucide-react";
import { BlogCard } from "@/components/blog-card";
import { Badge, buttonClass, SectionHeading } from "@/components/ui";
import { getLocale } from "@/lib/locale";
import { getBlogPostBySlug, getBlogPosts } from "@/lib/queries";
import { excerptText, formatDate, pick } from "@/lib/utils";
export async function generateMetadata({ params }: {
    params: Promise<{
        slug: string;
    }>;
}): Promise<Metadata> {
    const { slug } = await params;
    const post = await getBlogPostBySlug(slug);
    if (!post)
        return { title: "Article introuvable" };
    const locale = await getLocale();
    const title = pick(locale, post.title_fr, post.title_ar, post.title_en);
    const description = excerptText(pick(locale, post.excerpt_fr || post.content_fr, post.excerpt_ar || post.content_ar, post.excerpt_en || post.content_en), 160);
    return {
        title,
        description,
        openGraph: {
            title,
            description,
            type: "article",
            publishedTime: post.published_at ?? undefined,
            images: post.cover_image_url ? [post.cover_image_url] : undefined,
        },
    };
}
export default async function BlogArticlePage({ params }: {
    params: Promise<{
        slug: string;
    }>;
}) {
    const { slug } = await params;
    const locale = await getLocale();
    const cms = await getPageCMS("article");
    const ct = createTranslator(cms, locale);
    const [post, allPosts] = await Promise.all([getBlogPostBySlug(slug), getBlogPosts(4)]);
    if (!post)
        notFound();
    const title = pick(locale, post.title_fr, post.title_ar, post.title_en);
    const excerpt = pick(locale, post.excerpt_fr, post.excerpt_ar, post.excerpt_en);
    const content = pick(locale, post.content_fr, post.content_ar, post.content_en);
    const related = allPosts.filter((item) => item.id !== post.id).slice(0, 3);
    const readMinutes = Math.max(2, Math.ceil(content.split(/\s+/).length / 220));
    return <CmsPage cms={cms}><>
      <CmsBuiltin sectionKey="section-1"><section className="page-hero relative overflow-hidden bg-ink py-20 text-white sm:py-28">
        {post.cover_image_url ? <Image src={post.cover_image_url} alt={title} fill priority sizes="100vw" className="object-cover"/> : null}
        <div className="hero-overlay absolute inset-0"/>
        <div className="container-page relative max-w-4xl">
          <Link href={cmsLink(cms, "link_1e2531571ad9", "/blog")} className="inline-flex items-center gap-2 text-xs font-bold text-white/65 transition hover:text-white">
            <ArrowLeft className="h-4 w-4 rtl:rotate-180"/>
            {ct("text_4ef07352550e", "Tous les articles", "كل المقالات", "All articles")}
          </Link>
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <Badge tone="orange" className="bg-secondary-bright text-white">
              {ct("text_8a2263276b85", "Actualité", "مقال", "Article")}
            </Badge>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/60">
              <CalendarDays className="h-3.5 w-3.5"/>
              {formatDate(post.published_at, locale)}
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/60">
              <Clock3 className="h-3.5 w-3.5"/>
              {readMinutes} min
            </span>
          </div>
          <h1 className="mt-5 max-w-2xl text-balance text-[clamp(1.8rem,3.8vw,3rem)] font-extrabold leading-[1.15] tracking-[-0.04em]">{title}</h1>
          {excerpt ? <p className="mt-5 max-w-2xl text-sm leading-7 text-white/70 sm:text-base sm:leading-8">{excerpt}</p> : null}
        </div>
      </section></CmsBuiltin>

      <article className="container-page py-14 sm:py-[4.5rem]">
        <CmsBuiltin sectionKey="network"><div className="mx-auto max-w-3xl">
          <div className="article-content">
            {content.split(/\n{2,}/).map((paragraph, index) => (<p key={`${index}-${paragraph.slice(0, 20)}`}>{paragraph}</p>))}
          </div>

          <div className="mt-10 flex flex-col gap-4 rounded-3xl border border-line bg-white p-[21px] shadow-soft sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-primary">
                {ct("text_da99809df088", "Besoin d'informations ?", "هل تحتاجون معلومات؟", "Need more information?")}
              </p>
              <p className="mt-1 text-sm font-bold text-ink">
                {ct("text_b74199bd8920", "Notre équipe vous répond toute la semaine.", "فريقنا يجيبكم على مدار الأسبوع.", "Our team replies throughout the week.")}
              </p>
            </div>
            <Link href={cmsLink(cms, "link_55ffb6cb53be", "/contact")} className={buttonClass("primary", "md")}>
              {ct("text_9f38ae8098e2", "Nous contacter", "اتصل بنا", "Contact us")}
            </Link>
          </div>
        </div></CmsBuiltin>
      </article>

      {related.length ? (<CmsBuiltin sectionKey="section-2"><section className="border-t border-line bg-white py-14 sm:py-[4.5rem]">
          <div className="container-page">
            <SectionHeading eyebrow={ct("text_0dc8260a5466", "À lire aussi", "اقرأ أيضاً", "Read next")} title={ct("text_12a79763dee1", "D'autres articles du journal", "مقالات قد تعجبكم", "More from the journal")} href={cmsLink(cms, "link_73d6b97701d3", "/blog")} linkLabel={ct("text_4ef07352550e", "Tous les articles", "كل المقالات", "All articles")}/>
            <div className="grid gap-5 md:grid-cols-3">
              {related.map((item) => (<BlogCard key={item.id} post={item} locale={locale}/>))}
            </div>
          </div>
        </section></CmsBuiltin>) : null}
    </></CmsPage>;
}
