import type { Agency, RouteWithAgencies } from "./types";
import { routeRunsOnDate } from "./utils";

// A canonical spelling in the data is shared by agencies in the same city.
// Keep accents and punctuation: similar city names must not be conflated.
export const cityKey = (agency: Agency) => agency.city_fr.normalize("NFC").trim().replace(/\s+/g, " ").toLocaleLowerCase("fr");
export const activeRoutes = (routes: RouteWithAgencies[]) => routes.filter(r => r.is_active && r.from_agency?.is_active && r.to_agency?.is_active && cityKey(r.from_agency) !== cityKey(r.to_agency));
export function routeCities(routes: RouteWithAgencies[], end: "from" | "to", from = "") {
  const cities = new Map<string, Agency>();
  activeRoutes(routes).forEach(r => {
    if (from && cityKey(r.from_agency!) !== from) return;
    const agency = end === "from" ? r.from_agency! : r.to_agency!;
    cities.set(cityKey(agency), agency);
  });
  return [...cities.entries()].sort(([a], [b]) => a.localeCompare(b, "fr"));
}
export function filterRoutes(routes: RouteWithAgencies[], filters: { from?: string; to?: string; date?: string; busType?: string }) {
  return activeRoutes(routes).filter(r => (!filters.from || cityKey(r.from_agency!) === filters.from) && (!filters.to || cityKey(r.to_agency!) === filters.to) && (!filters.busType || r.bus_type === filters.busType) && (!filters.date || routeRunsOnDate(r.days_of_week, filters.date)));
}
export function resolveCity(routes: RouteWithAgencies[], value = "") {
  const agency = routes.flatMap(r => [r.from_agency, r.to_agency]).find(a => a?.id === value);
  return agency ? cityKey(agency) : value;
}
