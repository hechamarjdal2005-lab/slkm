import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { fieldClass, labelClass } from "@/components/ui";

export function AdminHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow ? <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-primary">{eyebrow}</p> : null}
        <h1 className="mt-1 text-2xl font-extrabold tracking-[-0.04em] text-ink sm:text-3xl">{title}</h1>
        {description ? <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function AdminPanel({
  title,
  description,
  action,
  children,
  className,
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("rounded-3xl border border-line bg-white shadow-soft", className)}>
      {title || action ? (
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line px-5 py-4">
          <div>
            {title ? <h2 className="text-base font-extrabold text-ink">{title}</h2> : null}
            {description ? <p className="mt-1 text-xs leading-5 text-muted">{description}</p> : null}
          </div>
          {action}
        </div>
      ) : null}
      <div className="p-5">{children}</div>
    </section>
  );
}

export function AdminStat({ label, value, hint, tone = "primary" }: { label: string; value: number | string; hint?: string; tone?: "primary" | "orange" | "green" | "red" }) {
  return (
    <div className="rounded-2xl border border-line bg-white p-4 shadow-soft">
      <p className={cn("text-[10px] font-extrabold uppercase tracking-[0.14em]", tone === "primary" && "text-primary", tone === "orange" && "text-secondary", tone === "green" && "text-success", tone === "red" && "text-danger")}>{label}</p>
      <p className="mt-2 text-3xl font-extrabold tracking-[-0.05em] text-ink">{value}</p>
      {hint ? <p className="mt-1 text-[11px] text-muted">{hint}</p> : null}
    </div>
  );
}

export function AdminEmpty({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-line bg-background p-8 text-center">
      <p className="text-sm font-extrabold text-ink">{title}</p>
      <p className="mx-auto mt-1 max-w-md text-xs leading-6 text-muted">{description}</p>
    </div>
  );
}

export function AdminField({ label, children, className, hint }: { label: string; children: ReactNode; className?: string; hint?: string }) {
  return (
    <label className={cn("block", className)}>
      <span className={labelClass}>{label}</span>
      {children}
      {hint ? <span className="mt-1 block text-[10px] leading-4 text-muted">{hint}</span> : null}
    </label>
  );
}

export function AdminInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn(fieldClass, props.className)} />;
}

export function AdminTextarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={cn(fieldClass, props.className)} />;
}

export function AdminSelect(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={cn(fieldClass, props.className)} />;
}

export function AdminCheckbox({ name, label, defaultChecked, value }: { name: string; label: string; defaultChecked?: boolean; value?: string }) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-line bg-background px-3 py-2 text-xs font-bold text-ink">
      <input type="checkbox" name={name} value={value} defaultChecked={defaultChecked} className="h-4 w-4 rounded border-line text-primary focus:ring-primary" />
      {label}
    </label>
  );
}
