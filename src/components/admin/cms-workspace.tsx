import { NavigationManager } from "./navigation-manager";
import { getAdminCMS } from "@/lib/cms-admin-store";
import { getSiteSettings } from "@/lib/queries";
import { CMSManager } from "./cms-manager";
import { AdminHeader, AdminPanel } from "./admin-ui";
export async function CMSWorkspace({ mode }: { mode: "cms" | "design" | "media" }) {
  const [cms, settings] = await Promise.all([getAdminCMS(), getSiteSettings()]);
  return <div><AdminHeader eyebrow="Site public" title={mode==='cms'?'Pages & traductions':mode==='design'?'Identité & apparence':'Images & publication'} description="Un espace pour mettre à jour le site, sans modifier son code."/>
    {!cms.ready?<AdminPanel title="Initialisation du CMS requise"><p role="alert" className="text-sm leading-7 text-amber-900">{cms.error}</p><p className="mt-3 text-sm text-muted">Les migrations ne sont jamais appliquées automatiquement. Les pages existantes restent disponibles avec leurs contenus actuels.</p></AdminPanel>:<AdminPanel><><CMSManager mode={mode} pages={cms.pages} sections={cms.sections} assets={cms.assets} theme={settings?.presentation}/>{mode === "design" && <div className="mt-10 border-t border-line pt-6"><NavigationManager value={settings?.navigation} /></div>}</></AdminPanel>}
  </div>;
}
