import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Locale } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function pick(locale: Locale, fr: string | null | undefined, ar: string | null | undefined, en: string | null | undefined) {
  const value = locale === "ar" ? ar : locale === "en" ? en : fr;
  return value ?? fr ?? ar ?? en ?? "";
}

export function formatMad(value: number | string | null | undefined) {
  const amount = Number(value ?? 0);
  return `${new Intl.NumberFormat("fr-MA", { maximumFractionDigits: 0 }).format(amount)} MAD`;
}

export function formatWeight(value: number | string | null | undefined) {
  return `${new Intl.NumberFormat("fr-MA", { maximumFractionDigits: 2 }).format(Number(value ?? 0))} kg`;
}

export function formatTime(value: string | null | undefined) {
  if (!value) return "--:--";
  return value.slice(0, 5);
}

export function formatDate(value: string | null | undefined, locale: Locale = "fr") {
  if (!value) return "";
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-MA" : locale === "en" ? "en-GB" : "fr-MA", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

export function formatDateTime(value: string | null | undefined) {
  if (!value) return "";
  return new Intl.DateTimeFormat("fr-MA", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function whatsappUrl(phone: string | null | undefined, text: string) {
  if (!phone) return null;
  return `https://wa.me/${phone.replace(/\D/g, "")}?text=${encodeURIComponent(text)}`;
}

export function normalizePhone(phone: string | null | undefined) {
  return phone?.replace(/[^\d+]/g, "") ?? "";
}

export function pageTitle(...parts: Array<string | null | undefined>) {
  return parts.filter(Boolean).join(" · ");
}

export const DAY_KEYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"] as const;

const DAY_LABELS: Record<string, { fr: string; ar: string; en: string }> = {
  MON: { fr: "Lun", ar: "الإثنين", en: "Mon" },
  TUE: { fr: "Mar", ar: "الثلاثاء", en: "Tue" },
  WED: { fr: "Mer", ar: "الأربعاء", en: "Wed" },
  THU: { fr: "Jeu", ar: "الخميس", en: "Thu" },
  FRI: { fr: "Ven", ar: "الجمعة", en: "Fri" },
  SAT: { fr: "Sam", ar: "السبت", en: "Sat" },
  SUN: { fr: "Dim", ar: "الأحد", en: "Sun" },
};

export function dayKeyFromDate(value: string) {
  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return null;
  return DAY_KEYS[date.getDay()];
}

export function routeRunsOnDate(days: string[], value: string) {
  const key = dayKeyFromDate(value);
  if (!key) return true;
  return days.includes(key);
}

export function daysLabel(days: string[], locale: Locale) {
  if (!days.length) return locale === "ar" ? "حسب الطلب" : locale === "en" ? "On request" : "Sur demande";
  if (days.length === 7) return locale === "ar" ? "يومياً" : locale === "en" ? "Daily" : "Quotidien";
  return days.map((day) => DAY_LABELS[day]?.[locale] ?? day).join(" · ");
}

export function durationLabel(departure: string, arrival: string) {
  const toMinutes = (value: string) => {
    const [hours, minutes] = value.split(":").map(Number);
    return (hours || 0) * 60 + (minutes || 0);
  };
  let duration = toMinutes(arrival) - toMinutes(departure);
  if (duration <= 0) duration += 24 * 60;
  const hours = Math.floor(duration / 60);
  const minutes = duration % 60;
  return minutes ? `${hours}h${String(minutes).padStart(2, "0")}` : `${hours}h`;
}

export function excerptText(value: string | null | undefined, max = 170) {
  if (!value) return "";
  const clean = value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  return clean.length > max ? `${clean.slice(0, max).trimEnd()}…` : clean;
}
