import { cookies } from "next/headers";
import type { Locale } from "./types";

export const LOCALE_COOKIE = "slkm_locale";
export const locales: Locale[] = ["fr", "ar", "en"];

export function isLocale(value: string | undefined): value is Locale {
  return value === "fr" || value === "ar" || value === "en";
}

export async function getLocale(): Promise<Locale> {
  const store = await cookies();
  const value = store.get(LOCALE_COOKIE)?.value;
  return isLocale(value) ? value : "fr";
}

export function isRtl(locale: Locale) {
  return locale === "ar";
}
