import { createTranslator, cmsImage, cmsLink } from "@/lib/cms";
import { getPageCMS, getCMSMetadata } from "@/lib/cms-store";
import { CmsPage, CmsBuiltin } from "@/components/cms-page";
import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen } from "lucide-react";
import { BlogCard } from "@/components/blog-card";
import { EmptyState, PageHero, SectionHeading } from "@/components/ui";
import { getLocale } from "@/lib/locale";
import { getBlogPosts } from "@/lib/queries";
export async function generateMetadata(): Promise<Metadata> { return getCMSMetadata("blog", { "title": "Actualités", "description": "Des nouvelles utiles sur nos lignes, Irsaliyat et des conseils pour préparer votre prochain voyage." }); }
export default async function BlogPage({ searchParams }: {
    searchParams: Promise<{
        page?: string;
    }>;
}) {
    const locale = await getLocale();
    const cms = await getPageCMS("blog");
    const ct = createTranslator(cms, locale);
    const posts = await getBlogPosts();
    const [featured, ...rest] = posts;
    const params = await searchParams;
    const pages = Math.max(1, Math.ceil(rest.length / 9));
    const page = Math.min(pages, Math.max(1, Math.trunc(Number(params.page)) || 1));
    return <CmsPage cms={cms}><>
      <CmsBuiltin sectionKey="hero"><PageHero compact image={featured?.cover_image_url ?? "/images/hero-about.jpg"} eyebrow={ct("text_1831f60fe790", "Le journal", "المدونة", "Journal")} title={ct("text_175c55873466", "Actualités, conseils et destinations", "أخبار، نصائح ووجهات", "News, advice and destinations")} description={ct("text_bd64b55010c7", "Des nouvelles utiles sur nos lignes, Irsaliyat et des conseils pour préparer votre prochain voyage.", "معلومات عملية عن خطوطنا، خدمة إرساليات، ونصائح لتحضير رحلتكم القادمة.", "Practical updates on our routes, Irsaliyat and advice to plan your next journey.")}/></CmsBuiltin>

      <CmsBuiltin sectionKey="section-1"><section className="container-page py-16 sm:py-[4.5rem]">
        {featured ? (<>
            <section className="mb-12">
              <SectionHeading eyebrow={ct("text_bee9f69397b0", "À la une", "مقال مميز", "Featured")} title={ct("text_e36036739f5c", "Le choix de la rédaction", "اختيار المحرر", "Editor's pick")}/>
              <BlogCard post={featured} locale={locale} featured/>
            </section>
            <SectionHeading eyebrow={ct("text_4ef07352550e", "Tous les articles", "كل المقالات", "All articles")} title={ct("text_6f0b048748bb", "Suivez la vie du réseau", "تابعوا أخبار الشبكة", "Follow network updates")}/>
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {rest.slice((page - 1) * 9, page * 9).map((post) => (<BlogCard key={post.id} post={post} locale={locale}/>))}
            </div>
            {pages > 1 && <nav aria-label={ct("text_6acd985680f8", "Pages des articles", "صفحات المقالات", "Article pages")} className="mt-8 flex flex-wrap gap-2">{Array.from({ length: pages }, (_, i) => <Link key={i} href={`/blog?page=${i + 1}`} aria-current={page === i + 1 ? "page" : undefined} className={`grid h-11 w-11 place-items-center rounded-xl border border-line text-sm font-bold ${page === i + 1 ? "bg-primary text-white" : "bg-white text-primary"}`}>{i + 1}</Link>)}</nav>}
          </>) : (<EmptyState icon={<BookOpen className="h-6 w-6"/>} title={ct("text_6c857416ce4b", "Aucun article publié", "لا توجد مقالات منشورة", "No published articles")} description={ct("text_440bf68b4bef", "Découvrez nos lignes et nos services en attendant nos prochaines nouvelles.", "اكتشفوا خطوطنا وخدماتنا أثناء انتظار أخبارنا القادمة.", "Explore our routes and services while you wait for our next update.")} action={{ href: cmsLink(cms, "link_4f6fddd0268f", "/lignes"), label: ct("text_c37f1459c181", "Explorer les lignes", "استكشفوا الخطوط", "Explore routes") }}/>)}
      </section></CmsBuiltin>
    </></CmsPage>;
}
