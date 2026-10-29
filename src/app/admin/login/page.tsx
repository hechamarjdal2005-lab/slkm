import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, ShieldCheck } from "lucide-react";
import { AdminLoginForm } from "@/components/admin/admin-login-form";

export const metadata: Metadata = {
  title: "Connexion admin",
  description: "Accès sécurisé à l'espace d'administration SLKM.",
};

const FEATURES = [
  "Authentification sécurisée avec Supabase Auth",
  "Sessions protégées par le middleware Next.js",
  "Accès réservé à l'équipe d'administration SLKM",
];

export default function AdminLoginPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#eef4fb] px-4 py-10 sm:px-6">
      <div aria-hidden className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-[#0072CE]/15 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -bottom-40 -right-24 h-96 w-96 rounded-full bg-[#F26522]/15 blur-3xl" />

      <div className="relative w-full max-w-5xl overflow-hidden rounded-[2rem] border border-white/70 bg-white shadow-[0_30px_90px_rgba(0,50,100,0.18)]">
        <div className="grid lg:grid-cols-[1.05fr_1fr]">
          <aside className="relative hidden flex-col justify-between overflow-hidden bg-[#0072CE] p-10 text-white lg:flex">
            <div aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(242,101,34,0.38),transparent_45%),radial-gradient(circle_at_95%_95%,rgba(0,35,70,0.45),transparent_55%)]" />
            <div aria-hidden className="absolute -right-16 top-1/3 h-64 w-64 rounded-full border border-white/10" />

            <div className="relative">
              <div className="inline-flex items-center gap-3 rounded-2xl bg-white/10 p-2 pr-4 ring-1 ring-white/15 backdrop-blur">
                <span className="relative h-11 w-11 overflow-hidden rounded-xl bg-white">
                  <Image src="/images/logo-header.jpg" alt="SLKM" fill sizes="44px" className="object-contain p-1" priority />
                </span>
                <span>
                  <span className="block text-base font-extrabold tracking-[-0.02em]">SLKM</span>
                  <span className="block text-[10px] font-bold uppercase tracking-[0.2em] text-white/70">Administration</span>
                </span>
              </div>

              <h1 className="mt-12 max-w-sm text-balance text-4xl font-extrabold leading-[1.05] tracking-[-0.05em]">
                Pilotez votre réseau en toute sécurité.
              </h1>
              <p className="mt-4 max-w-sm text-sm leading-7 text-white/75">
                Agences, lignes, tarifs, devis et messages : un espace unique pour gérer l&apos;activité SLKM.
              </p>

              <ul className="mt-8 space-y-3">
                {FEATURES.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm font-semibold leading-6 text-white/85">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#FFB48F]" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative mt-12 flex items-center gap-2 text-xs font-semibold text-white/70">
              <ShieldCheck className="h-4 w-4 text-[#FFB48F]" />
              Connexion chiffrée · Supabase Auth
            </div>
          </aside>

          <section className="p-6 sm:p-10 lg:p-12">
            <div className="mb-8 flex items-center gap-3 lg:hidden">
              <span className="relative h-11 w-11 overflow-hidden rounded-xl ring-1 ring-line">
                <Image src="/images/logo-header.jpg" alt="SLKM" fill sizes="44px" className="object-contain p-1" priority />
              </span>
              <span>
                <span className="block text-sm font-extrabold text-ink">SLKM</span>
                <span className="block text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#F26522]">Administration</span>
              </span>
            </div>

            <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#F26522]">Espace admin</p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-[-0.04em] text-ink">Connexion</h2>
            <p className="mt-2 text-sm leading-6 text-muted">
              Entrez vos identifiants administrateur pour accéder au tableau de bord.
            </p>

            <div className="mt-7">
              <AdminLoginForm />
            </div>

            <div className="mt-8 border-t border-line pt-5">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-xs font-bold text-muted transition hover:text-[#0072CE]"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Retour au site
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
