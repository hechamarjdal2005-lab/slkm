"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Building2, Inbox, LayoutDashboard, MessageSquareQuote, Newspaper, Package, Settings, Files, Palette, Images, Route as RouteIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const ITEMS = [
  { key: "overview", href: "/admin?tab=overview", label: "Vue d'ensemble", icon: LayoutDashboard },
  { key: "cms", href: "/admin?tab=cms", label: "Pages & traductions", icon: Files },
  { key: "design", href: "/admin?tab=design", label: "Identité & apparence", icon: Palette },
  { key: "media", href: "/admin?tab=media", label: "Médiathèque", icon: Images },
  { key: "messagerie", href: "/admin?tab=messagerie", label: "Messageries & agences", icon: Package },
  { key: "agencies", href: "/admin?tab=agencies", label: "Agences", icon: Building2 },
  { key: "routes", href: "/admin?tab=routes", label: "Lignes", icon: RouteIcon },
  { key: "rates", href: "/admin?tab=rates", label: "Tarifs colis", icon: Package },
  { key: "quotes", href: "/admin?tab=quotes", label: "Devis B2B", icon: MessageSquareQuote },
  { key: "messages", href: "/admin?tab=messages", label: "Messages", icon: Inbox },
  { key: "blog", href: "/admin?tab=blog", label: "Blog", icon: Newspaper },
  { key: "settings", href: "/admin?tab=settings", label: "Paramètres & images", icon: Settings },
];

export function AdminNav() {
  const params = useSearchParams();
  const active = params.get("tab") ?? "overview";

  return (
    <nav className="flex gap-1 overflow-x-auto rounded-2xl border border-primary-dark bg-primary-dark p-2 shadow-soft lg:grid lg:gap-1 lg:overflow-visible">
      {ITEMS.map((item) => (
        <Link
          key={item.key}
          href={item.href}
          className={cn(
            "inline-flex shrink-0 items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-bold transition",
            active === item.key ? "bg-white text-primary-dark shadow-soft" : "text-white/80 hover:bg-white/10 hover:text-white",
          )}
        >
          <item.icon className="h-4 w-4" />
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
