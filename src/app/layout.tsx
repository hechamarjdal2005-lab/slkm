import type { Metadata } from "next";
import localFont from "next/font/local";
import { getLocale, isRtl } from "@/lib/locale";
import { getSiteSettings } from "@/lib/queries";
import "./globals.css";

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

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const name = settings?.site_name_fr ?? "SLKM";
  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
    title: {
      default: `${name} · Transport voyageurs & Irsaliyat`,
      template: `%s · ${name}`,
    },
    description:
      "Transport interurbain, Irsaliyat et mobilité B2B au Maroc. Réservez votre trajet, suivez vos colis et demandez un devis.",
    icons: { icon: "/icon.svg" },
    openGraph: {
      title: name,
      description: "Un réseau national de transport, d'Irsaliyat et de mobilité B2B.",
      type: "website",
      images: ["/images/og-image.jpg"],
    },
  };
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const locale = await getLocale();
  const dir = isRtl(locale) ? "rtl" : "ltr";

  return (
    <html lang={locale} dir={dir} className={jakarta.variable}>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
