"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Map as LeafletMap } from "leaflet";
import { MapPin } from "lucide-react";
import type { Agency, Locale, RouteWithAgencies } from "@/lib/types";
import { pick } from "@/lib/utils";

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => {
    const map: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
    return map[character];
  });
}
const NO_ROUTES: RouteWithAgencies[] = [];

export function AgencyMap({
  agencies,
  routes = NO_ROUTES, mode = "both", selectedRoute, selectedAgency, onSelectRoute, onSelectAgency, fitRoutes = false,
  locale,
  height = "440px",
  className = "",
}: {
  agencies: Agency[];
  routes?: RouteWithAgencies[];
  mode?: "both" | "agencies" | "routes";
  selectedRoute?: string; selectedAgency?: string;
  onSelectRoute?: (id: string) => void; onSelectAgency?: (id: string) => void;
  fitRoutes?: boolean;
  locale: Locale;
  height?: string;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const points = useMemo(() => agencies
    .filter((agency) => agency.lat !== null && agency.lng !== null && Number.isFinite(Number(agency.lat)) && Number.isFinite(Number(agency.lng)) && Math.abs(Number(agency.lat)) <= 90 && Math.abs(Number(agency.lng)) <= 180)
    .map((agency) => ({
      id: agency.id,
      lat: Number(agency.lat),
      lng: Number(agency.lng),
      city: pick(locale, agency.city_fr, agency.city_ar, agency.city_en),
      name: pick(locale, agency.agency_name_fr, agency.agency_name_ar, agency.agency_name_en),
      address: pick(locale, agency.address_fr, agency.address_ar, agency.address_en),
      phone: agency.phone_number,
    })), [agencies, locale]);

  useEffect(() => {
    if (!containerRef.current || !points.length) return;
    let map: LeafletMap | null = null;
    let cancelled = false;

    setStatus("loading");
    import("leaflet").then((L) => {
      if (cancelled || !containerRef.current) return;
      const brandColor = getComputedStyle(containerRef.current).getPropertyValue("--orange").trim() || "#f97316";
      const inkColor = getComputedStyle(containerRef.current).color;
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      map = L.map(containerRef.current, {
        scrollWheelZoom: false,
        zoomControl: true,
        zoomAnimation: !reducedMotion,
        fadeAnimation: !reducedMotion,
      }).setView([points[0].lat, points[0].lng], 6);
      const tiles = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 18,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

      let tileError = false;
      tiles.on("tileerror", () => { tileError = true; if (!cancelled) setStatus("error"); });
      tiles.on("load", () => { if (!cancelled) setStatus(tileError ? "error" : "ready"); });
      setStatus("ready");
      const bounds: Array<[number, number]> = [];
      const selectedBounds: Array<[number, number]> = [];
      if (mode !== "agencies") routes.forEach(route => {
        const a = route.from_agency, b = route.to_agency;
        if (!a || !b || a.lat == null || a.lng == null || b.lat == null || b.lng == null) return;
        const linePoints: Array<[number, number]> = [[Number(a.lat), Number(a.lng)], [Number(b.lat), Number(b.lng)]];
        if (!linePoints.every(p => Number.isFinite(p[0]) && Number.isFinite(p[1]) && Math.abs(p[0]) <= 90 && Math.abs(p[1]) <= 180)) return;
        const selected = selectedRoute === route.id;
        const line = L.polyline(linePoints, { color: selected ? inkColor : brandColor, weight: selected ? 5 : 2, opacity: selected ? 1 : .5, dashArray: "7 8" }).addTo(map!);
        line.bindTooltip(`${escapeHtml(pick(locale, a.city_fr, a.city_ar, a.city_en))} → ${escapeHtml(pick(locale, b.city_fr, b.city_ar, b.city_en))}`);
        line.on("mouseover", () => line.setStyle({ weight: 5, opacity: 1 }));
        line.on("mouseout", () => line.setStyle({ weight: selected ? 5 : 2, opacity: selected ? 1 : .5 }));
        line.on("click", () => { onSelectRoute?.(route.id); map?.fitBounds(linePoints, { padding: [40, 40], maxZoom: 10, animate: false }); });
        if (selected || (fitRoutes && !selectedRoute && !selectedAgency)) selectedBounds.push(...linePoints);
      });

      points.forEach((point) => {
        bounds.push([point.lat, point.lng]);
        if (point.id === selectedAgency) selectedBounds.push([point.lat, point.lng]);
        if (mode === "routes") return;
        const marker = L.marker([point.lat, point.lng], {
          title: `${point.city} · ${point.name}`,
          icon: L.divIcon({
            className: point.id === selectedAgency ? "slkm-marker slkm-marker-selected" : "slkm-marker",
            html: `<span><b>${escapeHtml(point.city.slice(0, 2).toUpperCase())}</b></span>`,
            iconSize: [34, 34],
            iconAnchor: [17, 34],
            popupAnchor: [0, -30],
          }),
        }).addTo(map!);

        const popup = document.createElement("div");
        const title = document.createElement("strong");
        title.textContent = point.city;
        title.style.display = "block";
        title.style.fontSize = "14px";
        const name = document.createElement("span");
        name.textContent = point.name;
        name.style.display = "block";
        name.style.fontSize = "11px";
        name.style.color = "#5b6673";
        name.style.marginTop = "2px";
        const address = document.createElement("span");
        address.textContent = point.address;
        address.style.display = "block";
        address.style.fontSize = "11px";
        address.style.color = "#5b6673";
        address.style.marginTop = "6px";
        popup.append(title, name, address);

        if (point.phone) {
          const phone = document.createElement("a");
          phone.href = `tel:${point.phone.replace(/[^\d+]/g, "")}`;
          phone.textContent = point.phone;
          phone.dir = "ltr";
          phone.style.display = "inline-block";
          phone.style.marginTop = "8px";
          phone.style.fontSize = "11px";
          phone.style.fontWeight = "700";
          phone.style.color = "var(--orange-text, #c2410c)";
          popup.append(phone);
        }

        const link = document.createElement("a");
        link.href = `/lignes?to=${point.id}`;
        link.textContent = locale === "ar" ? "عرض الخطوط" : locale === "en" ? "View routes" : "Voir les lignes";
        link.style.display = "inline-block";
        link.style.marginInlineStart = point.phone ? "10px" : "0";
        link.style.marginTop = "8px";
        link.style.fontSize = "11px";
        link.style.fontWeight = "700";
        link.style.color = "#a63b00";
        popup.append(link);

        marker.bindPopup(popup);
        marker.on("click", () => onSelectAgency?.(point.id));
        if (point.id === selectedAgency) marker.openPopup();
      });

      if (selectedBounds.length) {
        map.fitBounds(selectedBounds, { padding: [40, 40], maxZoom: 12, animate: false });
      } else if (bounds.length > 1) {
        // The initial fit can otherwise leave a delayed zoom callback running
        // after a route or locale change removes this map instance.
        map.fitBounds(bounds, { padding: [36, 36], animate: false });
      } else if (bounds.length === 1) {
        map.setView(bounds[0], 10, { animate: false });
      }
    }).catch(() => { if (!cancelled) setStatus("error"); });

    return () => {
      cancelled = true;
      map?.stop();
      map?.remove();
      map = null;
    };
  }, [locale, points, routes, mode, selectedRoute, selectedAgency, onSelectRoute, onSelectAgency, fitRoutes]);

  if (!points.length) {
    return (
      <div className={`grid place-items-center rounded-3xl border border-dashed border-line bg-white/70 p-10 text-center ${className}`} style={{ minHeight: height }}>
        <div>
          <MapPin className="mx-auto h-7 w-7 text-primary" />
          <p className="mt-3 text-sm font-bold text-ink">
            {locale === "ar" ? "لا توجد إحداثيات للوكالات بعد" : locale === "en" ? "No agency coordinates yet" : "Aucune coordonnée d'agence pour le moment"}
          </p>
          <p className="mt-1 text-xs text-muted">
            {locale === "ar" ? "تواصلوا مع الوكالة لمعرفة موقعها." : locale === "en" ? "Contact an agency for its location." : "Contactez une agence pour obtenir sa localisation."}
          </p>
        </div>
      </div>
    );
  }

  return <div className="relative"><div ref={containerRef} className={`overflow-hidden rounded-3xl border border-line bg-white shadow-soft ${className}`} style={{ height }} role="region" aria-label={locale === "ar" ? "خريطة شبكة SLKM" : locale === "en" ? "SLKM network map" : "Carte du réseau SLKM"} />{status !== "ready" && <p role="status" className="absolute bottom-4 start-4 end-4 z-[400] rounded-xl bg-white p-3 text-sm text-primary shadow-soft">{status === "loading" ? (locale === "ar" ? "تحميل الخريطة…" : locale === "en" ? "Loading map…" : "Chargement de la carte…") : (locale === "ar" ? "تعذر تحميل خلفية الخريطة. معلومات الوكالات متاحة أدناه." : locale === "en" ? "Map tiles unavailable. Agency details remain available below." : "Fond de carte indisponible. Les informations des agences restent accessibles ci-dessous.")}</p>}</div>;
}
