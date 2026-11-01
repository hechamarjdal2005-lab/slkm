"use server";

import { cookies, headers } from "next/headers";
import { isLocale, LOCALE_COOKIE } from "@/lib/locale";

export async function setSiteLocale(value: string) {
  if (!isLocale(value)) return;
  const requestHeaders = await headers();
  const store = await cookies();
  // Setting the cookie in an action refreshes the page and shared layouts
  // together, and invalidates prefetched pages rendered in the old language.
  store.set(LOCALE_COOKIE, value, {
    path: "/",
    maxAge: 31536000,
    sameSite: "lax",
    secure: requestHeaders.get("x-forwarded-proto") === "https" || requestHeaders.get("origin")?.startsWith("https://") === true,
  });
}
