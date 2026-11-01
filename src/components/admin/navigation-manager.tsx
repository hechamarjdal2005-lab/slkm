"use client";
import { useActionState, useState } from "react";
import { saveNavigation } from "@/app/cms-actions";
import { navigation, NAV_DEFAULTS } from "@/lib/navigation";
import { CMS_INITIAL_STATE } from "@/lib/cms-validation";
import { fieldClass, buttonClass } from "../ui";
import { SubmitButton } from "../submit-button";
export function NavigationManager({ value }: { value: unknown }) {
  const [draft, setDraft] = useState(() => navigation(value));
  const [state, action] = useActionState(saveNavigation, CMS_INITIAL_STATE);
  function move(index: number, delta: number) { setDraft(current => { const items = [...current.items]; [items[index], items[index + delta]] = [items[index + delta], items[index]]; return { ...current, items }; }); }
  return <form action={action} className="grid gap-4"><h2 className="text-xl font-bold">Navigation</h2><p className="text-sm text-muted">Les destinations restent protégées. Masquer un lien ne supprime pas sa page.</p><input type="hidden" name="payload" value={JSON.stringify(draft)} />
    {state.message && <p role={state.status === "error" ? "alert" : "status"}>{state.message}</p>}
    {draft.items.map((item, index) => <fieldset key={item.href} className="grid gap-3 rounded-xl border border-line p-4"><legend>{item.href}</legend><div className="grid gap-3 md:grid-cols-3">{(["fr", "ar", "en"] as const).map(locale => <label key={locale}>{locale.toUpperCase()}<input className={fieldClass} dir={locale === "ar" ? "rtl" : "ltr"} value={item[locale]} required maxLength={100} onChange={event => setDraft(current => ({ ...current, items: current.items.map(row => row.href === item.href ? { ...row, [locale]: event.target.value } : row) }))} /></label>)}</div><div className="flex flex-wrap gap-4">{([['header','En-tête et menu mobile'],['footer','Pied de page'],['dock','Barre mobile']] as const).map(([key,label]) => <label key={key}><input type="checkbox" checked={item[key]} onChange={event => setDraft(current => ({ ...current, items: current.items.map(row => row.href === item.href ? { ...row, [key]: event.target.checked } : row) }))} /> {label}</label>)}<button className={buttonClass('ghost','sm')} type="button" disabled={index === 0} onClick={() => move(index,-1)}>Monter</button><button className={buttonClass('ghost','sm')} type="button" disabled={index === draft.items.length-1} onClick={() => move(index,1)}>Descendre</button></div></fieldset>)}
    <fieldset className="grid gap-3 rounded-xl border border-line p-4"><legend>Libellés de la barre mobile</legend>{draft.items.filter(item => item.dock).map(item => <div key={item.href} className="grid gap-3 md:grid-cols-3">{(["fr", "ar", "en"] as const).map(locale => <label key={locale}>{item.href} · {locale.toUpperCase()}<input className={fieldClass} required maxLength={100} value={item[`dock_${locale}`] ?? item[locale]} onChange={event => setDraft(current => ({ ...current, items: current.items.map(row => row.href === item.href ? { ...row, [`dock_${locale}`]: event.target.value } : row) }))} /></label>)}</div>)}</fieldset>
    {(["fr", "ar", "en"] as const).map(locale => <label key={locale}>Bouton · {locale.toUpperCase()}<input className={fieldClass} value={draft[`cta_${locale}`]} required maxLength={100} onChange={event => setDraft(current => ({ ...current, [`cta_${locale}`]: event.target.value }))} /></label>)}
    <label>Destination du bouton<select className={fieldClass} value={draft.cta_href} onChange={event => setDraft(current => ({ ...current, cta_href: event.target.value }))}><option value="">WhatsApp configuré / lignes par défaut</option>{NAV_DEFAULTS.map(item => <option key={item.href} value={item.href}>{item.fr}</option>)}</select></label><SubmitButton pendingLabel="Enregistrement…">Enregistrer la navigation</SubmitButton>
  </form>;
}
