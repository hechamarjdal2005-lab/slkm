import Link from "next/link";
import { Compass } from "lucide-react";
import { buttonClass } from "@/components/ui";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-background px-4">
      <div className="max-w-md text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-primary-soft text-primary">
          <Compass className="h-7 w-7" />
        </div>
        <p className="mt-5 text-xs font-extrabold uppercase tracking-[0.18em] text-primary">Erreur 404</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-[-0.04em] text-ink">Cette page n'existe pas</h1>
        <p className="mt-3 text-sm leading-7 text-muted">Le lien est peut-être obsolète ou la page a été déplacée.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Link href="/" className={buttonClass("primary", "md")}>Retour à l'accueil</Link>
          <Link href="/lignes" className={buttonClass("ghost", "md")}>Voir les lignes</Link>
        </div>
      </div>
    </main>
  );
}
