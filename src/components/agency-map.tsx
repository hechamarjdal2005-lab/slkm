"use client";

import { useEffect, useRef } from "react";
import type { Map as LeafletMap } from "leaflet";
import { MapPin } from "lucide-react";
import type { Agency, Locale } from "@/lib/types";
import { pick } from "@/lib/utils";

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => {
    const map: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
    return map[character];
  });
}

export function AgencyMap({
  agencies,
  locale,
  height = "440px",
  className = "",
}: {
  agencies: Agency[];
  locale: Locale;
  height?: string;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const points = agencies
    .filter((agency) => agency.lat !== null && agency.lng !== null)
    .map((agency) => ({
      id: agency.id,
      lat: Number(agency.lat),
      lng: Number(agency.lng),
      city: pick(locale, agency.city_fr, agency.city_ar, agency.city_en),
      name: pick(locale, agency.agency_name_fr, agency.agency_name_ar, agency.agency_name_en),
      address: pick(locale, agency.address_fr, agency.address_ar, agency.address_en),
      phone: agency.phone_number,
    }));

  useEffect(() => {
    if (!containerRef.current || !points.length) return;
    let map: LeafletMap | null = null;
    let cancelled = false;

    import("leaflet").then((L) => {
      if (cancelled || !containerRef.current) return;
      map = L.map(containerRef.current, { scrollWheelZoom: false, zoomControl: true }).setView([points[0].lat, points[0].lng], 6);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 18,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

      const bounds: Array<[number, number]> = [];

      points.forEach((point) => {
        bounds.push([point.lat, point.lng]);
        const marker = L.marker([point.lat, point.lng], {
          icon: L.divIcon({
            className: "slkm-marker",
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
          phone.style.display = "inline-block";
          phone.style.marginTop = "8px";
          phone.style.fontSize = "11px";
          phone.style.fontWeight = "700";
          phone.style.color = "#0059a4";
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
      });

      if (bounds.length > 1) {
        map.fitBounds(bounds, { padding: [36, 36] });
      } else if (bounds.length === 1) {
        map.setView(bounds[0], 10);
      }
    });

    return () => {
      cancelled = true;
      map?.remove();
      map = null;
    };
  }, [locale, points]);

  if (!points.length) {
    return (
      <div className={`grid place-items-center rounded-3xl border border-dashed border-line bg-white/70 p-10 text-center ${className}`} style={{ minHeight: height }}>
        <div>
          <MapPin className="mx-auto h-7 w-7 text-primary" />
          <p className="mt-3 text-sm font-bold text-ink">
            {locale === "ar" ? "لا توجد إحداثيات للوكالات بعد" : locale === "en" ? "No agency coordinates yet" : "Aucune coordonnée d'agence pour le moment"}
          </p>
          <p className="mt-1 text-xs text-muted">
            {locale === "ar" ? "أضف خطوط الطول والعرض من لوحة الإدارة." : locale === "en" ? "Add latitude and longitude from the admin dashboard." : "Ajoutez la latitude et la longitude depuis l'espace admin."}
          </p>
        </div>
      </div>
    );
  }

  return <div ref={containerRef} className={`overflow-hidden rounded-3xl border border-line bg-white shadow-soft ${className}`} style={{ height }} />;
}
