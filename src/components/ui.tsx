import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Inbox } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function buttonClass(
  variant: "primary" | "secondary" | "white" | "ghost" | "danger" = "primary",
  size: "sm" | "md" | "lg" = "md",
) {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-xl font-bold transition focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60",
    size === "sm" && "px-3.5 py-2 text-xs",
    size === "md" && "px-5 py-3 text-sm",
    size === "lg" && "px-6 py-3.5 text-sm sm:text-base",
    variant === "primary" && "bg-primary text-white shadow-soft hover:bg-primary-dark",
    variant === "secondary" && "bg-secondary-bright text-white shadow-soft hover:bg-secondary",
    variant === "white" && "bg-white text-primary shadow-soft hover:bg-primary-soft",
    variant === "ghost" && "border border-line bg-white/70 text-ink hover:border-primary/40 hover:text-primary",
    variant === "danger" && "bg-danger text-white hover:bg-red-800",
  );
}

export const fieldClass =
  "w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm text-ink shadow-sm outline-none transition placeholder:text-muted/70 focus:border-primary-bright focus:ring-4 focus:ring-primary-bright/10";

export const labelClass = "mb-1.5 block text-xs font-bold uppercase tracking-[0.12em] text-muted";

export function Badge({
  children,
  tone = "primary",
  className,
}: {
  children: ReactNode;
  tone?: "primary" | "orange" | "green" | "neutral" | "red";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.08em]",
        tone === "primary" && "bg-primary-soft text-primary-dark",
        tone === "orange" && "bg-secondary-soft text-secondary",
        tone === "green" && "bg-emerald-50 text-success",
        tone === "neutral" && "bg-surface-muted text-muted",
        tone === "red" && "bg-red-50 text-danger",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  href,
  linkLabel,
  align = "start",
  light = false,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  href?: string;
  linkLabel?: string;
  align?: "start" | "center";
  light?: boolean;
}) {
  return (
    <div
      className={cn(
        "mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between",
        align === "center" && "items-center text-center md:flex-col md:items-center",
      )}
    >
      <div className={cn("max-w-3xl", align === "center" && "mx-auto")}>
        {eyebrow ? (
          <p className={cn("mb-2 text-xs font-extrabold uppercase tracking-[0.18em]", light ? "text-white/70" : "text-primary")}>
            {eyebrow}
          </p>
        ) : null}
        <h2 className={cn("text-balance text-2xl font-extrabold tracking-[-0.03em] sm:text-3xl lg:text-4xl", light ? "text-white" : "text-ink")}>
          {title}
        </h2>
        {description ? (
          <p className={cn("mt-3 max-w-2xl text-sm leading-7 sm:text-base", light ? "text-white/75" : "text-muted")}>{description}</p>
        ) : null}
      </div>
      {href && linkLabel ? (
        <Link href={href} className={cn("group inline-flex shrink-0 items-center gap-2 text-sm font-bold", light ? "text-white" : "text-primary")}>
          {linkLabel}
          <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" />
        </Link>
      ) : null}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
  icon,
}: {
  title: string;
  description: string;
  action?: { href: string; label: string };
  icon?: ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-dashed border-line bg-white/70 px-6 py-12 text-center">
      <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-primary-soft text-primary">
        {icon ?? <Inbox className="h-6 w-6" />}
      </div>
      <h3 className="text-lg font-extrabold text-ink">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">{description}</p>
      {action ? (
        <Link href={action.href} className={cn(buttonClass("primary", "sm"), "mt-5")}>
          {action.label}
        </Link>
      ) : null}
    </div>
  );
}

export function PageHero({
  image,
  eyebrow,
  title,
  description,
  children,
  compact = false,
}: {
  image: string;
  eyebrow?: string;
  title: string;
  description?: string;
  children?: ReactNode;
  compact?: boolean;
}) {
  return (
    <section className={cn("relative overflow-hidden bg-primary-dark text-white", compact ? "py-16" : "py-20 sm:py-28")}>
      <Image src={image} alt="" fill priority sizes="100vw" className="object-cover opacity-45" />
      <div className="absolute inset-0 bg-gradient-to-b from-primary-dark/70 via-primary-dark/50 to-primary-dark/90" />
      <div className="container-page relative">
        <div className="max-w-4xl">
          {eyebrow ? <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.22em] text-secondary-soft">{eyebrow}</p> : null}
          <h1 className="text-balance text-3xl font-extrabold tracking-[-0.04em] sm:text-5xl lg:text-6xl">{title}</h1>
          {description ? <p className="mt-5 max-w-2xl text-sm leading-7 text-white/80 sm:text-lg sm:leading-8">{description}</p> : null}
          {children ? <div className="mt-8">{children}</div> : null}
        </div>
      </div>
    </section>
  );
}

export function StatCard({ value, label, tone = "light" }: { value: string; label: string; tone?: "light" | "dark" }) {
  return (
    <div className={cn("rounded-2xl border p-4 sm:p-5", tone === "light" ? "border-line bg-white" : "border-white/15 bg-white/10")}>
      <p className={cn("text-2xl font-extrabold tracking-[-0.04em] sm:text-3xl", tone === "light" ? "text-primary" : "text-white")}>{value}</p>
      <p className={cn("mt-1 text-xs font-semibold leading-5", tone === "light" ? "text-muted" : "text-white/70")}>{label}</p>
    </div>
  );
}
