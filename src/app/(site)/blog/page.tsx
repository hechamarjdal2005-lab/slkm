import type { Metadata } from "next";
import { BookOpen } from "lucide-react";
import { BlogCard } from "@/components/blog-card";
import { EmptyState, PageHero, SectionHeading } from "@/components/ui";
import { getLocale } from "@/lib/locale";
import { getBlogPosts } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Actualités & conseils",
  description: "Nouveautés du réseau, guides de voyage et conseils pratiques signés SLKM.",
};

export default async function BlogPage() {
  const locale = await getLocale();
  const posts = await getBlogPosts();
  const [featured, ...rest] = posts;

  return (
    <>
      <PageHero
        image={featured?.cover_image_url ?? "/images/hero-about.jpg"}
        eyebrow={locale === "ar" ? "المدونة" : locale === "en" ? "Journal" : "Le journal"}
        title={locale === "ar" ? "أخبار، نصائح ووجهات" : locale === "en" ? "News, advice and destinations" : "Actualités, conseils et destinations"}
        description={
          locale === "ar"
            ? "معلومات عملية عن خطوطنا، خدمة إرساليات، ونصائح لتحضير رحلتكم القادمة."
            : locale === "en"
              ? "Practical updates on our routes, Irsaliyat and advice to plan your next journey."
              : "Des nouvelles utiles sur nos lignes, Irsaliyat et des conseils pour préparer votre prochain voyage."
        }
      />

      <section className="container-page py-16 sm:py-20">
        {featured ? (
          <>
            <section className="mb-12">
              <SectionHeading
                eyebrow={locale === "ar" ? "مقال مميز" : locale === "en" ? "Featured" : "À la une"}
                title={locale === "ar" ? "اختيار المحرر" : locale === "en" ? "Editor's pick" : "Le choix de la rédaction"}
              />
              <BlogCard post={featured} locale={locale} featured />
            </section>
            <SectionHeading
              eyebrow={locale === "ar" ? "كل المقالات" : locale === "en" ? "All articles" : "Tous les articles"}
              title={locale === "ar" ? "تابعوا أخبار الشبكة" : locale === "en" ? "Follow network updates" : "Suivez la vie du réseau"}
            />
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {rest.map((post) => (
                <BlogCard key={post.id} post={post} locale={locale} />
              ))}
            </div>
          </>
        ) : (
          <EmptyState
            icon={<BookOpen className="h-6 w-6" />}
            title={locale === "ar" ? "لا توجد مقالات منشورة" : locale === "en" ? "No published articles" : "Aucun article publié"}
            description={locale === "ar" ? "انشر أول مقال من لوحة الإدارة." : locale === "en" ? "Publish the first article from the admin dashboard." : "Publiez le premier article depuis l'espace admin."}
            action={{ href: "/admin?tab=blog", label: locale === "ar" ? "إدارة المدونة" : locale === "en" ? "Manage blog" : "Gérer le blog" }}
          />
        )}
      </section>
    </>
  );
}
