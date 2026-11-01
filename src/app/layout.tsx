import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { getLocale, isRtl } from "@/lib/locale";
import { getSiteSettings } from "@/lib/queries";
import { presentation } from "@/lib/cms";
import "./globals.css";
export const dynamic = "force-dynamic";

const jakarta = localFont({
  src: [
    { path: "../fonts/PlusJakartaSans-Regular.ttf", weight: "400", style: "normal" },
    { path: "../fonts/PlusJakartaSans-SemiBold.ttf", weight: "600", style: "normal" },
    { path: "../fonts/PlusJakartaSans-Bold.ttf", weight: "700", style: "normal" },
    { path: "../fonts/PlusJakartaSans-ExtraBold.ttf", weight: "800", style: "normal" },
  ],
  variable: "--font-jakarta",
  display: "swap",
});
const cairo = localFont({ src: "../fonts/Cairo-Variable.woff2", variable: "--font-cairo", weight: "200 1000", style: "normal", display: "swap", preload: false });

export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover", themeColor: "#F97316" };

export async function generateMetadata(): Promise<Metadata> {
  const [settings, locale] = await Promise.all([getSiteSettings(), getLocale()]);
  const theme = presentation(settings?.presentation);
  const name = settings?.[`site_name_${locale}`] || settings?.site_name_fr || "SLKM";
  const title = theme[`seo_title_${locale}`] || `${name} · Transport voyageurs & Irsaliyat`;
  const description = theme[`seo_description_${locale}`] || (locale === "ar" ? "نقل المسافرين وإرساليات وحلول تنقل الشركات بالمغرب. استكشفوا الخطوط واحجزوا رحلتكم." : locale === "en" ? "Passenger transport, parcels and corporate mobility in Morocco. Explore routes and book your journey." : "Transport interurbain, Irsaliyat et mobilité B2B au Maroc. Réservez votre trajet, suivez vos colis et demandez un devis.");
  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
    title: {
      default: title,
      template: `%s · ${name}`,
    },
    description,
    icons: { icon: theme.favicon_url, apple: theme.apple_icon_url },
    manifest: "/manifest.webmanifest",
    openGraph: {
      title: name,
      description,
      type: "website",
      images: [theme.social_image_url],
    },
  };
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const locale = await getLocale();
  const dir = isRtl(locale) ? "rtl" : "ltr";

  return (
    <html lang={locale} dir={dir} className={`${jakarta.variable} ${cairo.variable}`}>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
