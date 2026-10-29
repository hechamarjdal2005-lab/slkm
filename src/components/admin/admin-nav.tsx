"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Building2, Inbox, LayoutDashboard, MessageSquareQuote, Newspaper, Package, Route as RouteIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const ITEMS = [
  { key: "overview", href: "/admin?tab=overview", label: "Vue d'ensemble", icon: LayoutDashboard },
  { key: "agencies", href: "/admin?tab=agencies", label: "Agences", icon: Building2 },
  { key: "routes", href: "/admin?tab=routes", label: "Lignes", icon: RouteIcon },
  { key: "rates", href: "/admin?tab=rates", label: "Tarifs colis", icon: Package },
  { key: "quotes", href: "/admin?tab=quotes", label: "Devis B2B", icon: MessageSquareQuote },
  { key: "messages", href: "/admin?tab=messages", label: "Messages", icon: Inbox },
  { key: "blog", href: "/admin?tab=blog", label: "Blog", icon: Newspaper },
];

export function AdminNav() {
  const params = useSearchParams();
  const active = params.get("tab") ?? "overview";

  return (
    <nav className="flex gap-1 overflow-x-auto rounded-2xl border border-line bg-white p-1.5 shadow-soft lg:grid lg:gap-1 lg:overflow-visible">
      {ITEMS.map((item) => (
        <Link
          key={item.key}
          href={item.href}
          className={cn(
            "inline-flex shrink-0 items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-bold transition",
            active === item.key ? "bg-primary text-white shadow-soft" : "text-muted hover:bg-surface-muted hover:text-ink",
          )}
        >
          <item.icon className="h-4 w-4" />
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
