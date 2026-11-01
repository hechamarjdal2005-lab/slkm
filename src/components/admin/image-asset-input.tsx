"use client";
import { useState } from "react";
import Link from "next/link";
import { MediaPicker } from "./cms-manager";
import { fieldClass } from "../ui";
import type { MediaAsset } from "@/lib/cms";
export function ImageAssetInput({ name, defaultValue = "", value: controlled, onValueChange, placeholder }: { name: string; defaultValue?: string | null; value?: string; onValueChange?: (value: string) => void; placeholder?: string }) {
  const [value, setValue] = useState(defaultValue ?? "");
  const [assets, setAssets] = useState<MediaAsset[] | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const currentValue = controlled ?? value;
  function change(next: string) { setValue(next); onValueChange?.(next); }
  async function load() {
    setPending(true); setError("");
    try { const response = await fetch("/api/admin/media", { cache: "no-store" }); const result = await response.json(); if (!response.ok) throw new Error(result.error); setAssets(result.assets); }
    catch (error) { setError(error instanceof Error ? error.message : "Médiathèque indisponible."); }
    finally { setPending(false); }
  }
  return <div><input type="hidden" name={name} value={currentValue} />{assets ? <MediaPicker label="Image" value={currentValue} change={change} assets={assets} /> : <input aria-label="Chemin ou URL de l’image" dir="ltr" className={fieldClass} value={currentValue} onChange={event => change(event.target.value)} placeholder={placeholder || "/images/... ou image publiée"} />}
    <div className="mt-2 flex flex-wrap gap-3 text-xs font-semibold"><button type="button" disabled={pending} onClick={load} className="min-h-11 text-primary">{pending ? "Chargement…" : "Choisir dans la médiathèque"}</button><Link href="/admin?tab=media" target="_blank" className="inline-flex min-h-11 items-center text-muted">Téléverser une image ↗</Link></div>{error && <p role="alert" className="text-xs leading-6 text-danger">{error}</p>}
  </div>;
}
