import { getLocale } from "@/lib/locale";
import { pick } from "@/lib/utils";

export default async function Loading() {
  const locale = await getLocale();
  return <div className="container-page py-10" role="status" aria-busy="true">
    <span className="sr-only">{pick(locale, "Chargement de votre page…", "جارٍ تحميل الصفحة…", "Loading your page…")}</span>
    <div aria-hidden="true"><div className="skeleton mb-4 h-4 w-28" /><div className="skeleton mb-8 h-10 w-3/4 max-w-lg" /><div className="skeleton h-52 w-full sm:h-80" /><div className="mt-6 grid gap-5 sm:grid-cols-3">{[0, 1, 2].map(i => <div key={i} className="skeleton h-40" />)}</div></div>
  </div>;
}
