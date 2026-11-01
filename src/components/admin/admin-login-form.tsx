"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Eye, EyeOff, KeyRound, Loader2, Lock, LogIn, Mail } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { buttonClass, fieldClass, labelClass } from "@/components/ui";
import { cn } from "@/lib/utils";

function friendlyAuthError(message: string) {
  const normalized = message.toLowerCase();
  if (normalized.includes("invalid login credentials")) {
    return "E-mail ou mot de passe incorrect. Vérifiez vos identifiants puis réessayez.";
  }
  if (normalized.includes("email not confirmed")) {
    return "Votre adresse e-mail n'est pas encore confirmée. Contactez un administrateur.";
  }
  if (normalized.includes("too many requests") || normalized.includes("rate limit")) {
    return "Trop de tentatives de connexion. Patientez quelques instants avant de réessayer.";
  }
  return message;
}

export function AdminLoginForm() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) {
        setError(friendlyAuthError(signInError.message));
        setPending(false);
        return;
      }
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.app_metadata?.role !== "admin") {
        await supabase.auth.signOut();
        setError("Ce compte ne dispose pas du rôle administrateur SLKM.");
        setPending(false);
        return;
      }
      router.replace("/admin");
      router.refresh();
    } catch {
      setError("Supabase n'est pas configuré. Renseignez les variables d'environnement.");
      setPending(false);
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-5">
      {error ? (
        <div
          className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-3.5 text-sm text-danger"
          role="alert"
          aria-live="polite"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <p className="leading-6">{error}</p>
        </div>
      ) : null}

      <div>
        <label htmlFor="admin-email" className={labelClass}>
          E-mail admin
        </label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            id="admin-email"
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            autoFocus
            required
            placeholder="vous@slkm.ma"
            disabled={pending}
            className={cn(fieldClass, "pl-10")}
          />
        </div>
      </div>

      <div>
        <label htmlFor="admin-password" className={labelClass}>
          Mot de passe
        </label>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            id="admin-password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            placeholder="••••••••"
            disabled={pending}
            className={cn(fieldClass, "pl-10 pr-11")}
          />
          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            disabled={pending}
            aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
            className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-muted transition hover:bg-surface-muted hover:text-ink disabled:cursor-not-allowed"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={pending}
        className={cn(buttonClass("primary", "md"), "w-full bg-[#0072CE] hover:bg-[#0059a4]")}
      >
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
        {pending ? "Connexion en cours..." : "Se connecter"}
      </button>

      <p className="flex items-start gap-2 rounded-xl bg-background p-3 text-[11px] leading-5 text-muted">
        <KeyRound className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#F26522]" />
        Le compte doit disposer du rôle <code className="rounded bg-white px-1">app_metadata.role = &quot;admin&quot;</code> pour les écritures protégées par RLS.
      </p>
    </form>
  );
}
