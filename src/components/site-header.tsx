"use client";

import { navigation } from "@/lib/navigation";
import Image from "./site-image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, BusFront, ChevronRight, History, Home, MapPin, MessageCircle, Package, Phone, Users, X } from "lucide-react";
import type { Locale } from "@/lib/types";
import { cn, normalizePhone, pick, whatsappUrl } from "@/lib/utils";
import { LocaleSwitcher } from "./locale-switcher";
import { keepDialogFocus } from "./dialog-focus";
import { presentation, type SitePresentation } from "@/lib/cms";

const NAV = [
  { href: "/", icon: Home, fr: "Accueil", ar: "الرئيسية", en: "Home" },
  { href: "/lignes", icon: MapPin, fr: "Lignes & agences", ar: "الخطوط والوكالات", en: "Routes & agencies" },
  { href: "/irsaliyat", icon: Package, fr: "Messageries", ar: "إرساليات", en: "Parcels" },
  { href: "/about", icon: History, fr: "Notre histoire", ar: "قصتنا", en: "Our story" },
  { href: "/services", icon: Users, fr: "Transport de personnel", ar: "نقل الموظفين", en: "Staff transport" },
  { href: "/contact", icon: MessageCircle, fr: "Contact", ar: "اتصل بنا", en: "Contact" },
];

export function SiteHeader({ locale, siteName, phone, whatsapp, theme = presentation(null), navigation: navValue }: {
  locale: Locale; siteName: string; phone: string | null; whatsapp: string | null; theme?: SitePresentation; navigation?: unknown;
}) {
  const nav = navigation(navValue);
  const items = nav.items.filter(item => item.header).map(item => ({ ...item, icon: NAV.find(row => row.href === item.href)?.icon ?? Home }));
  const dockItems = nav.items.filter(item => item.dock).map(item => ({ ...item, label: item[`dock_${locale}`] ?? item[locale], icon: NAV.find(row => row.href === item.href)?.icon ?? Home }));
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const t = (fr: string, ar: string, en: string) => pick(locale, fr, ar, en);
  const active = (href: string) => href === "/" ? pathname === href : pathname.startsWith(href);
  const bookHref = nav.cta_href || (whatsappUrl(whatsapp, t("Bonjour, je souhaite réserver un billet.", "مرحباً، أريد حجز تذكرة.", "Hello, I would like to book a ticket.")) ?? "/lignes");
  const bookLabel = nav[`cta_${locale}`];

  useEffect(() => { setOpen(false); }, [pathname, locale]);
  useEffect(() => {
    const element = dialog.current;
    if (!open) { element?.close(); return; }
    element?.showModal();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const desktop = window.matchMedia("(min-width: 1024px)");
    const resize = () => { if (desktop.matches) setOpen(false); };
    desktop.addEventListener("change", resize);
    return () => {
      document.body.style.overflow = previous;
      desktop.removeEventListener("change", resize);
    };
  }, [open]);

  const booking = (className: string) => bookHref.startsWith("http") ? (
    <a href={bookHref} target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)} className={className}><BusFront size={18} aria-hidden="true" />{bookLabel}<ArrowUpRight size={16} className="booking-arrow rtl:-scale-x-100" aria-hidden="true" /></a>
  ) : (
    <Link href={bookHref} onClick={() => setOpen(false)} className={className}><BusFront size={18} aria-hidden="true" />{bookLabel}<ArrowUpRight size={16} className="booking-arrow rtl:-scale-x-100" aria-hidden="true" /></Link>
  );

  return <>
    <header className="site-header">
      <div className={cn("site-topbar", !theme.announcement_visible && "announcement-disabled")}>
        <div className="container-page flex min-h-8 items-center justify-between gap-4">
          <p className="inline-flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-brand-orange" />{theme[`announcement_${locale}`]}</p>
          <div className="flex items-center gap-5">
            {phone && <a href={`tel:${normalizePhone(phone)}`} className="inline-flex min-h-8 items-center gap-2"><Phone size={13} /><bdi>{phone}</bdi></a>}
            <Link href="/contact" className="inline-flex min-h-8 items-center">{t("Besoin d’aide ?", "تحتاجون مساعدة؟", "Need a hand?")}</Link>
            <Link href="/admin" className="inline-flex min-h-8 items-center">{t("Espace admin", "لوحة الإدارة", "Admin")}</Link>
          </div>
        </div>
      </div>
      <div className="container-page header-main">
        <button ref={trigger} type="button" onClick={() => setOpen(true)} className="menu-toggle" aria-label={t("Ouvrir le menu", "فتح القائمة", "Open menu")} aria-controls="mobile-navigation" aria-expanded={open} aria-haspopup="dialog">
          <span className={cn("hamburger", open && "is-open")} aria-hidden="true"><span /><span /><span /></span>
        </button>
        <Link href="/" aria-label={`${siteName} · ${t("Accueil", "الرئيسية", "Home")}`} className="brand-lockup">
          <span className="brand-logo brand-logo-desktop"><Image src={theme.logo_light_url} alt={siteName} fill sizes="(max-width: 767px) 56px, 72px" className="object-contain" priority /></span><span className="brand-logo brand-logo-mobile"><Image src={theme.logo_mobile_url} alt={siteName} fill sizes="56px" className="object-contain" priority /></span>
          <span className="brand-caption"><strong lang="fr" dir="ltr">TRANSPORT</strong><span>{theme[`tagline_${locale}`]}</span></span>
        </Link>
        <nav aria-label={t("Navigation principale", "التنقل الرئيسي", "Main navigation")} className="desktop-navigation">
          {items.map(item => <Link key={item.href} href={item.href} aria-current={active(item.href) ? "page" : undefined} className={cn("desktop-nav-link", active(item.href) && "is-active")}>{item[locale]}</Link>)}
        </nav>
        <div className="header-actions">
          <LocaleSwitcher locale={locale} compact />
          {booking("header-book brand-button")}
        </div>
      </div>
    </header>

    <dialog ref={dialog} id="mobile-navigation" className="navigation-dialog" aria-labelledby="navigation-title" onKeyDown={keepDialogFocus} onCancel={() => setOpen(false)} onClose={() => { setOpen(false); trigger.current?.focus(); }} onClick={event => { if (event.target === event.currentTarget) setOpen(false); }}>
      <div className="drawer-panel">
        <div className="flex items-center justify-between gap-3 border-b border-line pb-4">
          <div><p className="section-kicker">{siteName}</p><h2 id="navigation-title" className="mt-1 text-lg font-extrabold text-ink">{theme[`tagline_${locale}`]}</h2></div>
          <button type="button" autoFocus onClick={() => setOpen(false)} className="icon-button shrink-0" aria-label={t("Fermer le menu", "إغلاق القائمة", "Close menu")}><X size={21} /></button>
        </div>
        <nav className="drawer-navigation" aria-label={t("Navigation mobile", "التنقل", "Mobile navigation")}>
          {items.map((item, index) => <Link key={item.href} href={item.href} onClick={() => setOpen(false)} aria-current={active(item.href) ? "page" : undefined} className={cn("drawer-link", active(item.href) && "is-active")} style={{ "--item-index": index } as React.CSSProperties}><item.icon size={17} className="shrink-0" aria-hidden="true" /><span>{item[locale]}</span><ChevronRight size={15} className="ms-auto shrink-0 rtl:rotate-180" aria-hidden="true" /></Link>)}
        </nav>
        <div className="border-t border-line pt-4">
          {booking("brand-button w-full")}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3"><LocaleSwitcher locale={locale} />{phone && <a href={`tel:${normalizePhone(phone)}`} className="inline-flex min-h-11 items-center gap-2 text-xs font-bold text-ink"><Phone size={15} /><bdi>{phone}</bdi></a>}</div>
          <Link href="/admin" onClick={() => setOpen(false)} className="mt-3 inline-flex min-h-11 items-center text-xs text-muted">{t("Espace admin", "لوحة الإدارة", "Admin")}</Link>
        </div>
      </div>
    </dialog>

    <nav className="mobile-dock" style={{ gridTemplateColumns: dockItems.length === 4 ? "1fr 1fr 1.5fr 1fr 1fr" : `repeat(${dockItems.length + 1}, minmax(0, 1fr))` }} aria-label={t("Accès rapide", "روابط سريعة", "Quick navigation")}>
      {dockItems.slice(0, 2).map(item => <Link key={item.href} href={item.href} aria-current={active(item.href) ? "page" : undefined} className={cn("dock-link", active(item.href) && "is-active")}><item.icon size={20} aria-hidden="true" /><span>{item.label}</span></Link>)}
      {booking("dock-book brand-button")}
      {dockItems.slice(2).map(item => <Link key={item.href} href={item.href} aria-current={active(item.href) ? "page" : undefined} className={cn("dock-link", active(item.href) && "is-active")}><item.icon size={20} aria-hidden="true" /><span>{item.label}</span></Link>)}
    </nav>
  </>;
}
