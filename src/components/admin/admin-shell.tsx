"use client";

import Image from "next/image";
import Link from "next/link";
import { Suspense, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { ExternalLink, LogIn, ShieldCheck, UserRound } from "lucide-react";
import { AdminLogoutButton } from "@/components/admin/admin-logout-button";
import { AdminNav } from "@/components/admin/admin-nav";
import { LocaleSwitcher } from "@/components/locale-switcher";
import type { Locale } from "@/lib/types";

export function AdminShell({
  children,
  userEmail,
  locale,
  siteName,
}: {
  children: ReactNode;
  userEmail: string | null;
  locale: Locale;
  siteName: string;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin/login" || pathname.startsWith("/admin/login/");

  if (isLoginPage) return <div className="admin-interface" lang="fr" dir="ltr">{children}</div>;

  return (
    <div className="admin-interface min-h-screen bg-surface-muted/50" lang="fr" dir="ltr">
      <header className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur">
        <div className="container-page flex h-16 items-center justify-between gap-4">
          <Link href="/admin" className="flex items-center gap-3">
            <span className="relative h-9 w-9 overflow-hidden rounded-xl ring-1 ring-line">
              <Image src="/images/logo-header.jpg" alt={siteName} fill sizes="36px" className="object-contain p-1" />
            </span>
            <span>
              <span className="block text-sm font-extrabold text-ink">{siteName}</span>
              <span className="block text-[10px] font-extrabold uppercase tracking-[0.16em] text-primary">Administration</span>
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <div className="hidden sm:block">
              <LocaleSwitcher locale={locale} />
            </div>
            {userEmail ? (
              <>
                <div className="hidden items-center gap-2 rounded-xl border border-line bg-white px-3 py-2 text-xs font-bold text-ink sm:flex">
                  <UserRound className="h-3.5 w-3.5 text-primary" />
                  <span className="max-w-[220px] truncate" title={userEmail}>
                    {userEmail}
                  </span>
                </div>
                <AdminLogoutButton />
              </>
            ) : (
              <Link href="/admin/login" className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-white px-3 py-2 text-xs font-bold text-ink transition hover:border-primary/40 hover:text-primary">
                <LogIn className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Connexion</span>
              </Link>
            )}
            <Link href="/" className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-white px-3 py-2 text-xs font-bold text-ink transition hover:border-primary/40 hover:text-primary">
              <ExternalLink className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Voir le site</span>
            </Link>
          </div>
        </div>
      </header>

      <div className="container-page py-6">
        <div className="grid gap-5 lg:grid-cols-[230px_minmax(0,1fr)] lg:items-start">
          <aside className="grid gap-3 lg:sticky lg:top-24">
            <Suspense fallback={<div className="h-12 rounded-2xl border border-line bg-white shadow-soft" />}>
              <AdminNav />
            </Suspense>
            <div className="rounded-2xl border border-line bg-white p-4 text-[11px] leading-5 text-muted shadow-soft">
              <p className="inline-flex items-center gap-1.5 font-extrabold text-ink">
                <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                Accès protégé
              </p>
              <p className="mt-1.5">
                Les écritures nécessitent une session Supabase dont le JWT contient <code className="rounded bg-surface-muted px-1">app_metadata.role = &quot;admin&quot;</code>.
              </p>
            </div>
          </aside>
          <main className="min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
}
