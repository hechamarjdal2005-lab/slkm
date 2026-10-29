"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronRight, Menu, MessageCircle, Phone, X } from "lucide-react";
import type { Locale } from "@/lib/types";
import { cn, whatsappUrl } from "@/lib/utils";
import { LocaleSwitcher } from "./locale-switcher";

const NAV = [
  { href: "/", fr: "Accueil", ar: "الرئيسية", en: "Home" },
  { href: "/lignes", fr: "Lignes & agences", ar: "الخطوط والوكالات", en: "Routes & agencies" },
  { href: "/irsaliyat", fr: "Irsaliyat", ar: "إرساليات", en: "Parcels" },
  { href: "/services", fr: "Services B2B", ar: "خدمات الشركات", en: "B2B services" },
  { href: "/about", fr: "Notre histoire", ar: "قصتنا", en: "Our story" },
  { href: "/blog", fr: "Actualités", ar: "الأخبار", en: "News" },
  { href: "/contact", fr: "Contact", ar: "اتصل بنا", en: "Contact" },
];

export function SiteHeader({
  locale,
  siteName,
  phone,
  whatsapp,
}: {
  locale: Locale;
  siteName: string;
  phone: string | null;
  whatsapp: string | null;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const bookHref = whatsappUrl(whatsapp, locale === "ar" ? "مرحباً، أريد حجز تذكرة." : locale === "en" ? "Hello, I would like to book a ticket." : "Bonjour, je souhaite réserver un billet.") ?? "/lignes";
  const bookLabel = locale === "ar" ? "احجز" : locale === "en" ? "Book" : "Réserver";

  return (
    <header className="sticky top-0 z-50 border-b border-line/80 bg-white/90 backdrop-blur-xl">
      <div className="hidden border-b border-line/60 bg-primary-dark text-white lg:block">
        <div className="container-page flex h-9 items-center justify-between text-[11px] font-semibold">
          <div className="flex items-center gap-5">
            {phone ? (
              <a href={`tel:${phone.replace(/\s/g, "")}`} className="inline-flex items-center gap-1.5 text-white/80 transition hover:text-white">
                <Phone className="h-3 w-3" />
                {phone}
              </a>
            ) : null}
            <span className="text-white/55">{locale === "ar" ? "شبكة وطنية من طنجة إلى الداخلة" : locale === "en" ? "National network from Tangier to Dakhla" : "Réseau national de Tanger à Dakhla"}</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/admin" className="text-white/70 transition hover:text-white">
              {locale === "ar" ? "لوحة الإدارة" : locale === "en" ? "Admin" : "Espace admin"}
            </Link>
            <LocaleSwitcher locale={locale} dark />
          </div>
        </div>
      </div>

      <div className="container-page flex h-[72px] items-center justify-between gap-4">
        <Link href="/" className="flex shrink-0 items-center gap-3">
          <span className="relative h-11 w-11 overflow-hidden rounded-2xl bg-white ring-1 ring-line">
            <Image src="/images/logo-header.jpg" alt={siteName} fill sizes="44px" className="object-contain p-1" priority />
          </span>
          <span className="hidden sm:block">
            <span className="block max-w-[240px] truncate text-sm font-extrabold tracking-[-0.02em] text-ink">{siteName}</span>
            <span className="block text-[10px] font-bold uppercase tracking-[0.16em] text-primary">
              {locale === "ar" ? "نقل المسافرين والأمانات" : locale === "en" ? "Passengers & parcels" : "Voyageurs & Irsaliyat"}
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 xl:flex">
          {NAV.map((item) => {
            const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-lg px-3 py-2 text-xs font-bold transition",
                  active ? "bg-primary-soft text-primary-dark" : "text-muted hover:bg-surface-muted hover:text-ink",
                )}
              >
                {item[locale]}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden sm:block lg:hidden">
            <LocaleSwitcher locale={locale} />
          </div>
          {bookHref.startsWith("http") ? (
            <a href={bookHref} target="_blank" rel="noopener noreferrer" className="hidden items-center gap-2 rounded-xl bg-secondary-bright px-4 py-2.5 text-xs font-extrabold text-white shadow-soft transition hover:bg-secondary sm:inline-flex">
              <MessageCircle className="h-4 w-4" />
              {bookLabel}
            </a>
          ) : (
            <Link href={bookHref} className="hidden items-center gap-2 rounded-xl bg-secondary-bright px-4 py-2.5 text-xs font-extrabold text-white shadow-soft transition hover:bg-secondary sm:inline-flex">
              <MessageCircle className="h-4 w-4" />
              {bookLabel}
            </Link>
          )}
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="grid h-11 w-11 place-items-center rounded-xl border border-line bg-white text-ink xl:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open ? (
        <div className="border-t border-line bg-white xl:hidden">
          <div className="container-page py-4">
            <nav className="grid gap-1">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center justify-between rounded-xl px-3 py-3 text-sm font-bold text-ink transition hover:bg-surface-muted"
                >
                  {item[locale]}
                  <ChevronRight className="h-4 w-4 text-muted rtl:rotate-180" />
                </Link>
              ))}
            </nav>
            <div className="mt-4 flex items-center justify-between border-t border-line pt-4">
              <LocaleSwitcher locale={locale} />
              {phone ? (
                <a href={`tel:${phone.replace(/\s/g, "")}`} className="inline-flex items-center gap-2 text-sm font-bold text-primary">
                  <Phone className="h-4 w-4" />
                  {phone}
                </a>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
