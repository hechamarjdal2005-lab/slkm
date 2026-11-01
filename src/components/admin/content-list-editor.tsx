"use client";

import { useId, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { buttonClass, fieldClass, labelClass } from "../ui";
import { ImageAssetInput } from "./image-asset-input";

type Item = Record<string, string | string[] | boolean>;
const FIELDS = {
  fleet: ["name", "category", "capacity", "image_url", "features_fr", "features_ar", "features_en"],
  timeline: ["year", "image_url", "title_fr", "title_ar", "title_en", "description_fr", "description_ar", "description_en"],
  services: ["image_url", "title_fr", "title_ar", "title_en", "description_fr", "description_ar", "description_en"],
  stats: ["key", "value", "label_fr", "label_ar", "label_en"],
  agents: ["name", "role_fr", "role_ar", "role_en", "phone", "email"],
} as const;
const LABELS: Record<string, string> = { name: "Nom", category: "Classe", capacity: "Capacité", image_url: "Image (chemin local ou URL)", year: "Année", phone: "Téléphone public", email: "E-mail public", key: "Identifiant", value: "Valeur", role_fr: "Fonction FR", role_ar: "Fonction AR", role_en: "Fonction EN", label_fr: "Libellé FR", label_ar: "Libellé AR", label_en: "Libellé EN" };
export function ContentListEditor({ name, items }: { name: "fleet" | "timeline" | "services" | "stats" | "agents"; items: unknown[] }) {
  const [entries, setEntries] = useState(() => items as Item[]);
  const prefix = useId();
  const fields = FIELDS[name];
  function change(index: number, key: string, value: string) {
    setEntries(current => current.map((entry, i) => i === index ? { ...entry, [key]: key.startsWith("features_") ? value.split("\n") : value } : entry));
  }
  return <div className="grid gap-4">
    <input type="hidden" name={name} value={JSON.stringify(entries)} />
    {entries.map((entry, index) => <fieldset key={index} className="grid gap-4 rounded-xl border border-line bg-background p-4 sm:grid-cols-2">
      <legend className="px-2 text-sm font-bold text-primary">{name === "fleet" ? "Véhicule" : name === "services" ? "Service" : name === "agents" ? "Agent" : name === "stats" ? "Statistique" : "Événement"} {index + 1}</legend>
      <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
        <label className="inline-flex min-h-11 items-center gap-2 text-xs font-bold"><input type="checkbox" checked={entry.is_active !== false} onChange={event => setEntries(current => current.map((item, i) => i === index ? { ...item, is_active: event.target.checked } : item))} />Actif sur le site</label>
        <button type="button" disabled={index === 0} className="min-h-11 px-3 text-xs font-bold disabled:opacity-40" onClick={() => setEntries(current => { const next = [...current]; [next[index - 1], next[index]] = [next[index], next[index - 1]]; return next; })}>Monter ↑</button>
        <button type="button" disabled={index === entries.length - 1} className="min-h-11 px-3 text-xs font-bold disabled:opacity-40" onClick={() => setEntries(current => { const next = [...current]; [next[index + 1], next[index]] = [next[index], next[index + 1]]; return next; })}>Descendre ↓</button>
      </div>
      {fields.map(key => {
        const value = entry[key] ?? "";
        const multiline = key.startsWith("features_") || key.startsWith("description_");
        const lang = key.slice(-2);
        const label = LABELS[key] ?? `${key.startsWith("features_") ? "Équipements (un par ligne)" : key.startsWith("title_") ? "Titre" : "Description"} · ${lang.toUpperCase()}`;
        if (key === "image_url") return <div key={key} className="sm:col-span-2"><p className={labelClass}>{label}</p><ImageAssetInput name={`${name}-image-${index}`} value={String(value)} onValueChange={value => change(index, key, value)} /></div>;
        return <div key={key} className={multiline ? "sm:col-span-2" : ""}><label className={labelClass} htmlFor={`${prefix}-${index}-${key}`}>{label}</label>{multiline ? <textarea id={`${prefix}-${index}-${key}`} rows={3} lang={lang === "ar" ? "ar" : "fr"} dir={lang === "ar" ? "rtl" : "ltr"} value={Array.isArray(value) ? value.join("\n") : String(value)} onChange={e => change(index, key, e.target.value)} className={fieldClass} /> : <input id={`${prefix}-${index}-${key}`} required={key !== "capacity"} lang={lang === "ar" ? "ar" : "fr"} dir={lang === "ar" ? "rtl" : "ltr"} className={fieldClass} value={Array.isArray(value) ? value.join(", ") : String(value)} onChange={e => change(index, key, e.target.value)} />}</div>;
      })}
      <button type="button" onClick={() => { if (window.confirm("Retirer cet élément ? Enregistrez ensuite pour appliquer la modification.")) setEntries(entries.filter((_, i) => i !== index)); }} className="inline-flex min-h-10 items-center gap-2 text-sm font-bold text-danger"><Trash2 size={15} />Retirer</button>
    </fieldset>)}
    <button type="button" className={buttonClass("ghost")} onClick={() => setEntries([...entries, Object.fromEntries(fields.map(key => [key, key.startsWith("features_") ? [] : ""]))])}><Plus size={16} />{name === "fleet" ? "Ajouter un véhicule" : name === "services" ? "Ajouter un service" : name === "agents" ? "Ajouter un agent" : name === "stats" ? "Ajouter une statistique" : "Ajouter un événement"}</button>
  </div>;
}
