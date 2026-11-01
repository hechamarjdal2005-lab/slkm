import Link from "next/link";
import { Compass } from "lucide-react";
import { buttonClass } from "@/components/ui";
import { getLocale } from "@/lib/locale";
import { pick } from "@/lib/utils";

export default async function NotFound() {
  const locale = await getLocale();
  const t = (fr: string, ar: string, en: string) => pick(locale, fr, ar, en);
  return (
    <main className="public-site grid min-h-screen place-items-center bg-background px-4" style={{ paddingBottom: 0 }}>
      <div className="max-w-md text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-primary-soft text-primary">
          <Compass className="h-7 w-7" />
        </div>
        <p className="mt-5 text-xs font-extrabold uppercase tracking-[0.18em] text-primary">{t("Erreur 404", "خطأ 404", "Error 404")}</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-[-0.04em] text-ink">{t("Cette page n'existe pas", "هذه الصفحة غير موجودة", "This page could not be found")}</h1>
        <p className="mt-3 text-sm leading-7 text-muted">{t("Le lien est peut-être obsolète ou la page a été déplacée.", "قد يكون الرابط قديماً أو تم نقل الصفحة.", "The link may be outdated or the page may have moved.")}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Link href="/" className={buttonClass("primary", "md")}>{t("Retour à l'accueil", "العودة إلى الرئيسية", "Back to home")}</Link>
          <Link href="/lignes" className={buttonClass("ghost", "md")}>{t("Voir les lignes", "استكشفوا الخطوط", "Explore routes")}</Link>
        </div>
      </div>
    </main>
  );
}
