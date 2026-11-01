"use client";
import Image from "@/components/site-image";
import { useEffect, useRef, useState } from "react";
import { Expand, X, ImageOff } from "lucide-react";
import type { Locale } from "@/lib/types";
import { pick } from "@/lib/utils";
import { keepDialogFocus } from "./dialog-focus";

export function MessagerieMapImage({ src, locale }: { src: string; locale: Locale }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const [failed, setFailed] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog.current?.showModal();
    return () => { document.body.style.overflow = previous; };
  }, [open]);
  const title = pick(locale, "Carte du réseau de messagerie SLKM", "خريطة شبكة إرساليات SLKM", "SLKM parcel network map");
  const close = () => { dialog.current?.close(); setOpen(false); button.current?.focus(); };
  if (failed) return <p role="status" className="flex items-center justify-center gap-3 p-12 text-sm text-slate"><ImageOff />{pick(locale, "La carte est momentanément indisponible.", "الخريطة غير متاحة حالياً.", "The map is currently unavailable.")}</p>;
  return <div className="relative overflow-hidden rounded-2xl border border-line bg-white shadow-soft">
    <div className="relative h-[320px] sm:h-[480px] lg:h-[600px]"><Image src={src} alt={title} fill unoptimized sizes="(max-width: 768px) 100vw, 1200px" className="object-contain p-3 sm:p-6" onError={() => { close(); setFailed(true); }} /></div>
    <button ref={button} type="button" onClick={() => setOpen(true)} aria-haspopup="dialog" className="absolute bottom-4 end-4 inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-white shadow-soft"><Expand size={17} />{pick(locale, "Agrandir la carte", "تكبير الخريطة", "Enlarge map")}</button>
    <dialog ref={dialog} aria-label={title} onKeyDown={keepDialogFocus} onClick={e => { if (e.target === e.currentTarget) close(); }} onClose={() => { setOpen(false); button.current?.focus(); }} className="fixed inset-0 m-auto h-[95dvh] max-h-none w-[96vw] max-w-none rounded-2xl border-0 bg-white p-3 backdrop:bg-ink/90">
      <div className="relative h-full w-full"><Image src={src} alt={title} fill unoptimized sizes="100vw" className="object-contain p-3 pt-16" /><button autoFocus type="button" onClick={close} aria-label={pick(locale, "Fermer la carte", "إغلاق الخريطة", "Close map")} className="absolute end-2 top-2 grid h-12 w-12 place-items-center rounded-full bg-ink text-white"><X /></button></div>
    </dialog>
  </div>;
}
