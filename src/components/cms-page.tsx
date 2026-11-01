import { Children, isValidElement, type ReactNode, type CSSProperties } from "react";
import Link from "next/link";
import Image from "./site-image";
import { CMS_CATALOG, isSafeUrl, type CmsPageData, type CmsSection } from "@/lib/cms";
import { getLocale } from "@/lib/locale";
import { pick } from "@/lib/utils";
import { buttonClass, SectionHeading } from "./ui";

export function CmsBuiltin({ children }: { sectionKey: string; children: ReactNode }) { return <>{children}</>; }
function flatten(children: ReactNode): ReactNode[] {
  return Children.toArray(children).flatMap(child => isValidElement<{ children?: ReactNode }>(child) && typeof child.type === "symbol" ? flatten(child.props.children) : [child]);
}
async function CustomSection({ section }: { section: CmsSection }) {
  const locale = await getLocale();
  const title = pick(locale, section.title_fr, section.title_ar, section.title_en);
  const body = pick(locale, section.body_fr, section.body_ar, section.body_en);
  const label = pick(locale, section.cta_fr, section.cta_ar, section.cta_en);
  const candidate = section.media_asset_id ? `/media/${section.media_asset_id}` : section.image_url;
  const image = candidate && isSafeUrl(candidate, true) ? candidate : null;
  return <section className="cms-custom-section" id={`cms-${section.id}`}><div className="container-page">
    <div className={section.kind === "image_text" && image ? "grid items-center gap-6 md:grid-cols-2" : ""}>
      {section.kind === "image_text" && image && <div className="relative aspect-[16/10] overflow-hidden rounded-2xl"><Image src={image} alt={title} fill sizes="(max-width:768px) 100vw,50vw" className="object-cover" /></div>}
      <div><SectionHeading title={title} />{body && <p className="whitespace-pre-line text-sm leading-7 text-muted">{body}</p>}
        {section.kind === "features" && <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{(section.content.items ?? []).map((item, index) => <article key={index} className="rounded-2xl border border-line bg-white p-5"><h3 className="font-bold text-ink">{pick(locale, item.title_fr, item.title_ar, item.title_en)}</h3><p className="mt-2 text-sm leading-7 text-muted">{pick(locale, item.body_fr, item.body_ar, item.body_en)}</p></article>)}</div>}
        {section.cta_href && isSafeUrl(section.cta_href) && label && <Link href={section.cta_href} className={`${buttonClass("primary")} mt-5`}>{label}</Link>}
      </div>
    </div>
  </div></section>;
}
export function CmsPage({ cms, children }: { cms: CmsPageData; children: ReactNode }) {
  const builtins = new Map<string, ReactNode>();
  for (const child of flatten(children)) if (isValidElement<{ sectionKey?: string }>(child) && child.props.sectionKey) builtins.set(child.props.sectionKey, child);
  const sections = cms.configured ? cms.sections : (CMS_CATALOG[cms.slug]?.sections ?? []).map(section => ({ section_key: section.key, sort_order: section.sort_order, kind: "builtin", background: "default", layout: "standard", id: section.key }));
  return <div className="cms-page" data-page={cms.slug} style={{ "--cms-hero-overlay": cms.hero_overlay } as CSSProperties}>{[...sections].sort((a, b) => a.sort_order - b.sort_order || a.id.localeCompare(b.id)).map(section => <div key={section.id} className="cms-section" data-background={section.background} data-layout={section.layout} data-section={section.section_key}>
    {section.kind === "builtin" ? builtins.get(section.section_key) : <CustomSection section={section as CmsSection} />}
  </div>)}</div>;
}
